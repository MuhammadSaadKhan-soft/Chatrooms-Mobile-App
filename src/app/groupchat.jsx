import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, Image ,Animated,ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faVideo, faBell, faPaperPlane, faSmile, faMicrophone,faTimes ,faBars,faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import io from 'socket.io-client';
import Message from './(tabs)/message'; // Assume this component is already adapted for React Native
import { AxiosRequest } from './Axios/AxiosRequest'; // Assume this is adapted for React Native
import { navigationRef } from './_layout';
// import VideoRoom from './VideoRoom'; // Assume this component is already adapted for React Native
import VideoChat from "./(Video&Audio)/video";
 const ENDPOINT = 'http://192.168.100.21:8000';

const GroupsChat = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { roomId, roomName, mode } = route.params || {};

    const [user, setUser] = useState('');
    const [id, setId] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const socketRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [admin, setAdmin] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [userCount, setUserCount] = useState(0);
    const [userList, setUserList] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [loadingSidebar, setLoadingSidebar] = useState(false);

    useEffect(() => {
        if (!roomId) {
            Alert.alert('Error', 'Room ID is missing');
            navigation.goBack();
            return;
        }

        const socket = io(ENDPOINT);

        socket.on('userJoined', (data) => {
            console.log('User joined:', data);
            setNotifications((prevNotifications) => [...prevNotifications, { message: `${data.user} has joined the room` }]);
            setNotificationCount((prevCount) => prevCount + 1);
            setUserList((prevUserList) => [...prevUserList, data.user]);
        });

        socket.on('usernameUpdated', (data) => {
            console.log('usernameUpdated event received:', data);
            setUserList(prevUserList => {
                return prevUserList.map(user =>
                    user.userId === data.userId ? { ...user, name: data.name } : user
                );
            });
        });

        socket.on('userRemoved', (data) => {
            console.log('User to be removed:', data.userId);
            if (!data.userId) {
                console.error('Invalid userId:', data.userId);
                return;
            }
            setUserList(prevUserList => {
                return prevUserList.filter(user => user._id !== data.userId);
            });

            console.log(`User ${data.userId} has been removed from room ${roomId}`);
        });

        socket.on('userList', (users) => {
            setUserList(users);
        });

        socket.on('blockedFromRoom', (data) => {
            Alert.alert('Blocked', data.message);
        });

        return () => {
            socket.off('userJoined');
            socket.off('usernameUpdated');
            socket.off('userRemoved');
            socket.off('userList');
            socket.off("removedFromRoom");
            socket.off('roomCreated');
            socket.off("blockedFromRoom");
        };
    }, [roomId, navigation]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('userData');
                const token = await AsyncStorage.getItem('jwt');

                if (!userData || !token) {
                    throw new Error('User data not found in AsyncStorage');
                }

                const parsedUserData = JSON.parse(userData);

                const userName = parsedUserData.name || parsedUserData.login || 'Guest User';
                const userId = parsedUserData._id || 'Unknown ID';
                const profilePicture = parsedUserData.profilePicture || parsedUserData.avatar_url || '';

                setUser(userName);
                setId(userId);
                setProfilePicture(profilePicture);

                fetchRoomDetails();

                if (!socketRef.current) {
                    socketRef.current = io(ENDPOINT, { transports: ['websocket'] });

                    socketRef.current.on('connect', () => {
                        socketRef.current.emit('joined', { user: userName, roomId });
                    });

                    socketRef.current.on('welcome', handleIncomingMessage);
                    socketRef.current.on('userJoined', handleIncomingMessage);
                    socketRef.current.on('userLeft', handleIncomingMessage);
                    socketRef.current.on('newMessage', handleIncomingMessage);
                    socketRef.current.on('userCount', (data) => {
                        setUserCount(data.userCount);
                        setUserList(data.users);
                    });
                    socketRef.current.on('userNotFoundInRoom', ({ userId, roomId }) => {
                        setNotifications((prevNotifications) => [
                          ...prevNotifications,
                          { message: `User ${userId} not found in room ${roomId}` },
                        ]);
                        setNotificationCount((prevCount) => prevCount + 1);
                    });
                    socketRef.current.on('userRemoved', (data) => {
                        const userId = data.userId;
                        const userName = data.username;
                        console.log('userName', userName);
                        setNotifications((prevNotifications) => [
                          ...prevNotifications,
                          { message: `${userName} has been removed by Admin` }
                        ]);
                    });
                }
                fetchPreviousMessages();
                socketRef.current.on('joinVideoRoom', (data) => {
                    console.log('Received joinVideoRoom event:', data);
                    if (data && data.message) {
                      setNotifications((prevNotifications) => [
                        ...prevNotifications,
                        { message: data.message },
                      ]);
                    }
                });
                   socketRef.current.on('userInfo', (data) => {
                                setUserCount(data.userCount);  // Update user count
                                setUserList(data.users);  // Update user list with profile pictures
                                console.log("user info",data.users);
                            });
            } catch (error) {
                console.error('Error fetching user data:', error);
                Alert.alert('Error', 'Failed to load user data');
            }
        };

        fetchUserData();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [roomId]);

    const fetchRoomDetails = async () => {
        try {
            const response = await AxiosRequest.get(`/api/${roomId}`);
            console.log('Fetched room:', response.data);
            setAdmin(response.data.admin?.name || '');

            const usersWithProfilePictures = await Promise.all(
                response.data.users.map(async (user) => {
                    const profilePicture = user.profilePicture || 'path/to/default/image.png'; // Use a default image
                    return { ...user, profilePicture };
                })
            );

            setUserList(usersWithProfilePictures);
            setUserCount(usersWithProfilePictures.length);
        } catch (error) {
            if (error.response && (error.response.status === 404 || error.response.status === 410)) {
                console.log('Room not found or has expired');
                Alert.alert('Room Error', 'Room not found or has expired');
                navigationRef.navigate('RoomList');
            } else {
                console.error('Error fetching room details:', error);
                Alert.alert('Error', 'Failed to fetch room details');
            }
        }
    };


    const fetchPreviousMessages = async () => {
        setLoading(true);
        try {
            const response = await AxiosRequest.get(`/api/messages/${roomId}`);
            if (response.data) {
                setMessages(response.data.messages);
            } else {
                console.error('Empty response data received.');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        if (!isSidebarOpen) {
            setLoadingSidebar(true);  // Show loader when opening the sidebar
            // Simulate content loading or call your content-fetching function here
            // For example, you can use a setTimeout to simulate the loading time
            setTimeout(() => {
                setLoadingSidebar(false); // Hide loader after loading
            }, 3000);  // Set to appropriate loading duration
        } else {
            setLoadingSidebar(false); // Hide loader when closing the sidebar immediately
        }
    };
    const HandleVideoCall =()=>{
    navigation.navigate('videocall')
    }
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
        if (!showDropdown) {
            setLoadingNotifications(true);
            // Simulate loading or fetch notifications here
            setTimeout(() => {
                setLoadingNotifications(false);
            }, 1000);  // Reduced loading time for better UX
        } else {
            // Clear notifications when closing the dropdown
            setNotifications([]);
            setNotificationCount(0);
        }
    };




    const handleIncomingMessage = (data) => {
        console.log('Incoming message:', data);
        if (data.message) {
            if (data.message.includes('Welcome to the chat') || data.message.includes('has joined the room') || data.message.includes('has left')) {
                setNotifications(prev => [...prev, { message: `${data.user}: ${data.message}` }]);
                setNotificationCount(prevCount => prevCount + 1);
            }
             if (data.message.includes('has joined the room')) {
                            setNotifications(prev => [...prev, { message: data.message }]);
                            setNotificationCount(prevCount => prevCount + 1);
                            setJoinedUsers(prev => new Set(prev).add(data.message));
                        }
                         else if (data.message.includes('has left')) {
                                        setNotifications(prevNotifications => [...prevNotifications, { message: data.message }]);
                                        setNotificationCount(prevCount => prevCount + 1);
                                        setJoinedUsers(prev => {
                                            const updated = new Set(prev);
                                            updated.delete(data.message);
                                            return updated;
                                        });
                                    }
             else if (data.id && data.user && data.message && data.timestamp) {
                setMessages(prev => {
                    const isDuplicate = prev.some(msg => msg.id === data.id);
                    if (!isDuplicate) {
                        return [...prev, {
                            sender: data.user,
                            text: data.message,
                            timestamp: data.timestamp,
                            profilePicture: data.profilePicture,
                        }];
                    }
                    return prev;
                });
            }
        }
         else {
            setMessages(prev => [...prev, {
                sender: data.sender,
                text: data.text,
                timestamp: data.timestamp,
                profilePicture: data.profilePicture,
            }]);
        }
    };

    const sendMessage = async (text) => {
        if (text.trim() !== '') {
            const messageData = {
                roomId,
                text,
                sender: user,
                timestamp: new Date(),
                profilePicture,
            };

            if (socketRef.current) {
                socketRef.current.emit('sendMessage', messageData);
            }
            setCurrentMessage('');
        }
    };

    const handleRemoveUser = async (user) => {
        if (!user || !user.name || !roomId) {
            console.error("Invalid user object or roomId:", user, roomId);
            return;
        }

        if (socketRef.current) {
            socketRef.current.emit("removeUser", { username: user.name, roomId }, (response) => {
                if (response.success) {
                    console.log(`Removing user ${user.name} from room ${roomId}`);
                    setNotifications((prevNotifications) => [
                        ...prevNotifications,
                        { message: `User ${user.name} removed from room ${roomId} by admin` }
                    ]);
                    setNotificationCount((prevCount) => prevCount + 1);

                    setUserList((prevUserList) =>
                        prevUserList.filter((u) => u.name !== user.name)
                    );
                } else {
                    console.error("Error removing user from room:", response.message);
                }
            });
        } else {
            console.error("Socket object is null, cannot emit removeUser event.");
        }
    };



    const handleVideoIconClick = () => {
        if (socketRef.current) {
            socketRef.current.emit('joinVideoRoom', { roomId, user });
        }
        setShowModal(true);
    };
 const handleNotificationClick = (index) => {
        // Remove the notification from the state
        setNotifications((prev) => {
            const newNotifications = [...prev];
            newNotifications.splice(index, 1);
            return newNotifications;
        });
        setNotificationCount((prev) => prev - 1);
    };
    return (
        <View style={[styles.container, mode === "dark" ? styles.darkMode : styles.lightMode]}>
     <Animated.View
    style={[
        styles.sidebar,
        isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed,
    ]}
>
    {loadingSidebar ? (
        <ActivityIndicator size="large" color="black" style={styles.loader} />
    ) : (
        <>


                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <FontAwesomeIcon icon={faArrowLeft} size={35} color={mode === "dark" ? "white" : "black"} />
                  </TouchableOpacity>

                   <TouchableOpacity onPress={toggleSidebar} style={styles.closeSidebarButton}>
                           <FontAwesomeIcon icon={faTimes} size={24} color="black" />
                         </TouchableOpacity>
                     <View style={styles.profileCard}>
             {profilePicture && <Image source={{ uri: profilePicture }} style={styles.userImage} />}
                       <Text style={styles.userName}>{user}</Text>
                       <Text style={styles.adminName}>Admin: {admin}</Text>
                       <Text style={styles.userCount}>Users in room: {userCount}</Text>
                            </View>
                      <FlatList
                          data={userList}
                          keyExtractor={(item, index) => item._id || `${item.name}-${index}`}
                          renderItem={({ item }) => (
                              <View style={styles.userListItem}>
                                  <Image
                                      source={{ uri: item.profilePicture || 'path/to/default/image.png' }}
                                      style={styles.userListImage}
                                  />
                                  <Text style={styles.userListName}>{item.name}</Text>
                              </View>
                          )}
                      />

        </>
    )}
</Animated.View>




            <View style={styles.chatContainer}>
                <View style={styles.header}>



                     <TouchableOpacity onPress={toggleSidebar} style={styles.toggleSidebarButton}>
                            <FontAwesomeIcon icon={faBars} size={24} color='white' />
                        </TouchableOpacity>
                         <Text style={styles.roomName}>{roomName}</Text>
                                              <TouchableOpacity onPress={HandleVideoCall} style={styles.toggleSidebarButton}>
                                                     <FontAwesomeIcon icon={faVideo} size={24} color='white' />
                                                 </TouchableOpacity>
                    <TouchableOpacity onPress={toggleDropdown} style={styles.notificationButton}>
                        <FontAwesomeIcon icon={faBell} size={24} color={notificationCount > 0 ? "red" : "white"} />
                        {notificationCount > 0 && (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                 {notifications.length > 0 && (
                               <View style={styles.notificationContainer}>
                                   <FlatList
                                       data={notifications}
                                       keyExtractor={(item, index) => `${item.message}-${index}`}
                                       renderItem={({ item, index }) => (
                                           <TouchableOpacity onPress={() => handleNotificationClick(index)}>
                                                   <Text style={styles.notificationText}>{item.message}</Text>
                                               </TouchableOpacity>
                                       )}
                                   />
                               </View>
                           )}

<FlatList
    data={messages}
    keyExtractor={(item) => `${item.sender}-${item.timestamp} ${item.id}`}
    renderItem={({ item }) => (
        <Message
            sender={item.sender}
            message={item.text}
            classs={item.sender === user ? 'right' : 'left'}
            timestamp={item.timestamp}
            profilePicture={item.profilePicture}
        />
    )}
    ListEmptyComponent={loading ? (
        <ActivityIndicator size="large" color="black" style={styles.loader} />
    ) : (
        <Text style={styles.noMessagesText}>No messages yet.</Text>
    )}
     contentContainerStyle={styles.listContainer} // Apply background color
/>

                <View style={styles.inputBox}>

                    <TextInput
                        style={[styles.input, mode === "dark" ? styles.darkInput : styles.lightInput]}
                        value={currentMessage}
                        onChangeText={setCurrentMessage}
                        placeholder="Type a message..."
                        placeholderTextColor={mode === "dark" ? "#999" : "#666"}
                    />
                    <TouchableOpacity onPress={() => sendMessage(currentMessage)} style={styles.sendButton}>
                        <FontAwesomeIcon icon={faPaperPlane} size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    );
};


    const styles = StyleSheet.create({
      listContainer: {
            flexGrow: 1,
              backgroundColor: '#242736',// Light blue background
            padding: 10, // Optional padding for spacing
        },
        container: {
            flex: 1,
            flexDirection: 'row',
        },
         profileCard: {
            backgroundColor: '#f9f9f9',
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
            alignItems: 'center',
          },
        darkMode: {
            backgroundColor: '#242736',
        },
        lightMode: {
            backgroundColor: '#FFFFFF',
        },
        sidebar: {
            width: '70%',
            maxWidth: 300,
            height: '100%',
            backgroundColor: 'white',
            position: 'absolute',
            zIndex: 10,
            padding: 15,
            top: 0,
            left: -300, // Start hidden
            transition: 'all 0.3s',
            borderRightWidth: 1,
            borderColor: '#ccc',
            shadowColor: '#000',
            shadowOffset: { width: -3, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
        },
        sidebarOpen: {
            left: 0,
        },
        sidebarClosed: {
            left: -300,
        },
        userImage: {
            width: 60,
            height: 60,
            borderRadius: 30,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: '#ddd',
        },
        userName: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            color: 'black',
        },
        adminName: {
            fontSize: 16,
            marginBottom: 5,
            color: '#333',
        },
        userCount: {
            fontSize: 16,
            marginBottom: 10,
            color: '#666',
        },
        userListItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 5,
        },
        userListImage: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 15,
            borderWidth: 1,
            borderColor: '#ddd',
        },
        userListName: {
            fontSize: 16,
        },
        removeUserButton: {
            color: 'red',
            marginLeft: 15,
        },
        chatContainer: {
            flex: 1,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
             backgroundColor: 'black',
             color:'white'
        },
        roomName: {
            fontSize: 20,
            fontWeight: 'bold',
            color:'white'
        },
        loader: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            height: 400,
        },
        noMessagesText: {
            fontSize: 16,
            color: '#888',
            textAlign: 'center',
            marginTop: 20,
        },
        toggleSidebarButton: {
            padding: 10,

            borderRadius: 5,
            alignSelf: 'center',
        },
        closeSidebarButton: {
            alignSelf: 'flex-end',
            marginTop:-40,
            padding: 10,
        },
       notificationButton: {
           position: 'relative',
           padding: 10,
           color: 'white',
       },

       notificationBadge: {
           position: 'absolute',
           right: -6,
           top: -70,
           backgroundColor: 'red',
           borderRadius: 12,
           width: 24,
           height: 7,
           justifyContent: 'center',
           alignItems: 'center',
           zIndex: 10, // Ensures it appears above other elements
       },

       notificationContainer: {
           position: 'absolute',
           top: 55,
           left: 0,
           right: 0,
           backgroundColor: 'rgba(51, 51, 51, 0.9)',
           padding: 15,
           zIndex: 1000,
       },

       notificationText: {
           fontSize: 14,
           color: 'white',
           marginBottom: 5,
       },


        inputBox: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderTopWidth: 1,
            borderTopColor: '#ccc',
            backgroundColor: 'black'
        },
        emojiButton: {
            marginRight: 10,
        },
        input: {
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderRadius: 20,
            paddingHorizontal: 10,

        },
        darkInput: {
            backgroundColor: '#333',
            color: 'white',
            borderColor: '#666',
        },
        lightInput: {
            backgroundColor: '#f9f9f9',
            color: 'black',
            borderColor: '#ccc',
        },
        audioButton: {
            marginLeft: 10,
        },
        sendButton: {
            marginLeft: 10,
        },
        backButton:{

        marginLeft:10
        }

    });



export default GroupsChat;

