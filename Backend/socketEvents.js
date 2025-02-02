module.exports = (io) => {
    const users = {};

    io.on("connection", (socket) => {
        console.log("New Connection");

        // Handle when a user joins
        socket.on('joined', ({ user }) => {
            users[socket.id] = user;
            console.log(`${user} has joined!`);
            socket.emit('welcome', { user: "Admin", message: "Welcome to the chat" });
            socket.broadcast.emit('userJoined', { user: "Admin", message: `${user} has joined` });
        });

        // Handle when a user disconnects
        socket.on('disconnect', () => {
            const disconnectedUser = users[socket.id];
            delete users[socket.id];
            if (disconnectedUser) {
                io.emit('leave', { user: "Admin", message: `${disconnectedUser} has left` });
                console.log(`${disconnectedUser} has left`);
            }
        });

        // Handle when a user sends a message
        socket.on('message', (message) => {
            // Broadcast the message to all connected clients
            io.emit('message', { user: message.sender, message: message.message, id: message.id });
        });

        // Handle when a user sends an audio message
        socket.on('audioMessage', ({ audioBlob, id }) => {
            // Broadcast the audio blob and sender's ID to all clients
            io.emit('receiveAudioMessage', { user: users[id], audioBlob, id });
        });

        // Handle when a user sends an emoji message
        socket.on('emojiMessage', (emojiMessage) => {
            // Broadcast the emoji message to all clients
            io.emit('receiveEmojiMessage', { user: users[emojiMessage.id], message: emojiMessage.message, id: emojiMessage.id });
        });

        // Other socket events...
    });
};
