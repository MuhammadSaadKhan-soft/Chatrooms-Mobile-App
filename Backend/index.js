const express = require('express');
const http = require('http');
const SocketIO = require('socket.io');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToMongo = require('./db'); // Your MongoDB connection function
const Room = require('./models/Rooms'); // Room model
const User = require('./models/User'); // User model
const groupMessage = require("./models/groupmodel"); // Group message model
const routeUpload = require('./route/routeUpload');
const authRouter = require('./route/auth');
const githubauthRouter = require('./route/githubAuth');
const roomsRoute = require("./route/roomsRoute");
const messagesRouter = require("./route/groupmessages");
const audioHandle = require("./route/audioHandlingRoute");

const app = express();
const server = http.createServer(app);
const io = SocketIO(server, {
    cors: {
        origin: "http://localhost:3000", // Your client URL
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');

// Routes
app.use('/api/auth', authRouter);
app.use('/api/githubauth', githubauthRouter);
app.use('/api/image', routeUpload);
app.use('/api', roomsRoute);
app.use('/api/messages', messagesRouter);
app.use("/api/audio", audioHandle);

// Connect to MongoDB
connectToMongo();

const users = {}; 
const roomUsers = {};

// Helper function to get user profile picture
const getUserProfilePicture = async (username) => {
    const user = await User.findOne({ name: username });
    return user ? user.profilePicture : null;
};

// Update user count and emit events
const updateUserCount = async (roomId) => {
    const usersInRoom = Array.from(roomUsers[roomId] || []);
    const userCount = usersInRoom.length;

    const usersWithProfilePictures = await Promise.all(
        usersInRoom.map(async (user) => {
            const profilePicture = await getUserProfilePicture(user);
            return { name: user, profilePicture };
        })
    );

    io.to(roomId).emit('userCount', { userCount, users: usersWithProfilePictures });
    io.to(roomId).emit('userList', usersWithProfilePictures);
};

// Socket.io connection
io.on("connection", (socket) => {
    socket.on('joinRoom', async ({ roomId, username }) => {
        // Ensure the user joins the room only once
        socket.join(roomId);
    
        // If roomUsers is not initialized for this room, initialize it
        if (!roomUsers[roomId]) {
            roomUsers[roomId] = new Set();
        }
    
        // Add the user to the roomUsers set
        if (!roomUsers[roomId].has(username)) {
            roomUsers[roomId].add(username);
            // Emit the welcome message to the joining user
            socket.emit('welcome', { user: username, message: "Welcome to the chat", roomId });
            // Notify others that a new user has joined
            socket.broadcast.to(roomId).emit('userJoined', { roomId, message: `${username} has joined the room` });
        }

        // Update user count
        await updateUserCount(roomId);
    });

   socket.on('joined', async({ user, roomId }) => {
         if (!roomUsers[roomId]) {
             roomUsers[roomId] = new Set();
         }

         if (Object.values(users).includes(user)) {
             console.log(`${user} is already connected`);
             return;
         }

         users[socket.id] = user;
         roomUsers[roomId].add(user);
         console.log(`${user} has joined room ${roomId}`);
         socket.join(roomId);


         socket.emit('welcome', {
             user: user, // The user who just joined
             message: "Welcome to the chat",
             roomId
         });

         socket.broadcast.to(roomId).emit('userJoined', { roomId, message: `${user} has joined the room` });

         socket.videoRoomJoined = false;
         // Set a timeout to reload or re-fetch user info after a delay (e.g., 3 seconds)
         setTimeout(async () => {
             const usersInRoom = Array.from(roomUsers[roomId] || []);
             const userCount = usersInRoom.length;

             const usersWithProfilePictures = await Promise.all(
                 usersInRoom.map(async (user) => {
                     const profilePicture = await getUserProfilePicture(user);
                     return { name: user, profilePicture };
                 })
             );
             io.to(roomId).emit('userInfo', { userCount, users: usersWithProfilePictures });


             // Emit both user count and user list at the same time
         }, 3000); // 3000 milliseconds (3 seconds) delay


     });

    socket.on('disconnect', () => {
        const disconnectedUser = users[socket.id];
        const roomId = Object.keys(roomUsers).find(roomId => roomUsers[roomId].has(disconnectedUser));
        
        if (disconnectedUser && roomId) {
            roomUsers[roomId].delete(disconnectedUser);
            socket.broadcast.to(roomId).emit('userLeft', { message: `${disconnectedUser} has left` });
            updateUserCount(roomId);
        }

        delete users[socket.id];
    });

    socket.on('sendMessage', async ({ roomId, text, sender, timestamp, profilePicture, audioUrl }) => {
        console.log('Received sendMessage event:', { roomId, text, sender, timestamp, audioUrl });

        const isAudioMessage = Boolean(audioUrl);
        const isTextMessage = Boolean(text); 

        if (!isTextMessage && !isAudioMessage) {
            console.log('Message is empty, skipping save and emit.');
            return;
        }

        try {
        

            // Proceed to save and emit the message since the user is verified
            const savedGroupMessage = await groupMessage.create({
                roomId,
                text: isTextMessage ? text : null,
                sender,
                timestamp: new Date(timestamp),
                profilePicture,
                audioUrl: isAudioMessage ? audioUrl : null
            });

            console.log('Message saved to database:', savedGroupMessage);

            io.to(roomId).emit('newMessage', {
                id: savedGroupMessage._id.toString(),
                sender: sender,
                text: savedGroupMessage.text,
                timestamp: savedGroupMessage.timestamp.toISOString(),
                profilePicture: savedGroupMessage.profilePicture,
                audioUrl: savedGroupMessage.audioUrl,
                roomId
            });

            console.log('Sent newMessage event to room:', roomId);
        } catch (error) {
            console.error('Error saving or sending message:', error);
        }
    });
    

    socket.on('sendAudio', (audioData) => {
        io.to(audioData.roomId).emit('newAudio', audioData);
    });
});

// Function to check for expired rooms
const getExpiredRooms = async () => {
    const currentTime = new Date().getTime();
    return await Room.find({ expiresAt: { $lt: currentTime } });
};

const checkForExpiredRooms = async () => {
    const expiredRooms = await getExpiredRooms();
    expiredRooms.forEach(async (room) => {
        io.emit('roomExpired', room._id);
        await room.remove();
        console.log(`Room ${room._id} has expired and been deleted.`);
    });
};

// Set interval to check for expired rooms
setInterval(checkForExpiredRooms, 8000);

const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
