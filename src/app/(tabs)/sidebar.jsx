import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { AxiosRequest } from '../Axios/AxiosRequest';
import { useNavigation } from '@react-navigation/native';

const Sidebar = () => {
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchRooms();
  }, [rooms]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await AxiosRequest.get('/api/rooms');
      const currentTime = new Date().getTime();
      const updatedRooms = response.data.filter(room => !room.expiresAt || new Date(room.expiresAt).getTime() > currentTime);
      setRooms(updatedRooms);
    } catch (error) {
      console.error("Error fetching room details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = (room, index) => {
    if (room.isPrivate) {
      setSelectedRoom(room);
      setShowModal(true);
    } else {
      setSelectedRoomIndex(index);
      navigation.navigate('groupchat', { roomId: room._id, roomName: room.name });
    }
  };

  const handleEnterRoom = async () => {
    if (!password && !adminEmail) {
      setPasswordError('Please enter a password or admin email');
      return;
    }

    try {
      setLoading(true);
      const response = await AxiosRequest.post('/api/rooms/join/private', { roomId: selectedRoom._id, password });
      if (response.status === 200) {
        setPasswordError('');
        setShowModal(false);
        navigation.navigate('groupchat', { roomId: selectedRoom._id, roomName: selectedRoom.name });
      } else {
        setPasswordError('Invalid password');
      }
    } catch (error) {
      setPasswordError('Invalid password');
    } finally {
      setPassword('');
      setLoading(false);
    }
  };

  const sendEmailToAdmin = async () => {
    try {
      if (!adminEmail) {
        alert('Please enter a valid email');
        return;
      }

      const response = await AxiosRequest.post('/api/rooms/join/private', {
        roomId: selectedRoom._id,
        userEmail: adminEmail,
      });

      if (response.status === 200) {
        alert('Email sent to admin');
        setShowModal(false);
      } else {
        alert('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email to admin:', error);
      alert('Error sending email');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Groups"
        placeholderTextColor="white"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={rooms.filter(room => room.name.toLowerCase().includes(searchQuery.toLowerCase()))}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => handleRoomClick(item, index)}
            style={[styles.card, {
              borderRadius: 15,
              backgroundColor: selectedRoomIndex === index ? '#333' : '#242736',
              borderWidth: 2,
              borderColor: '#007BFF',
              height: 100,
              width: '90%',
            }]}
          >
            <View style={styles.roomDetails}>
              <Text style={styles.roomName}>{item.name}</Text>
              {item.isPrivate && <Text style={styles.privateBadge}>Private</Text>}
              {item.isPublic && <Text style={styles.publicBadge}>Public</Text>}
              {item.isTemporary && <Text style={styles.temporaryBadge}>Temporary</Text>}
              {item.isScheduled && <Text style={styles.scheduledBadge}>Scheduled</Text>}
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Enter Room Password or Admin Email</Text>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="white"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          <TextInput
            style={styles.emailInput}
            placeholder="Enter your Email to Get password"
            placeholderTextColor="white"
            value={adminEmail}
            onChangeText={setAdminEmail}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.buttonText1}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.enterButton]}
              onPress={handleEnterRoom}
            >
              <Text style={styles.buttonText2}>Enter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.sendEmailButton]}
              onPress={sendEmailToAdmin}
            >
              <Text style={styles.buttonText3}> Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
   backgroundColor: '#1C1F2A',
  },
  searchInput: {
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    color: 'white',
    fontSize: 16,
  },
   publicBadge: {
      backgroundColor: 'blue',
      padding: 5,
      borderRadius: 3,
      color: 'white',
      marginTop: 5,
    },
    temporaryBadge: {
      backgroundColor: 'orange',
      padding: 5,
      borderRadius: 3,
      color: 'white',
      marginTop: 5,
    },
    scheduledBadge: {
      backgroundColor: 'purple',
      padding: 5,
      borderRadius: 3,
      color: 'white',
      marginTop: 5,
    },
  card: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#242736',
    marginBottom: 10,
    padding: 10,
    width: '90%',
    marginHorizontal: '5%',
    justifyContent: 'center',  // Align the text vertically in the card
    height: 100,  // Consistent height for all rooms
  },
  roomDetails: {
    flex: 1,
    justifyContent: 'center',  // Vertically center room name and badge
    alignItems: 'center',
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  privateBadge: {
    backgroundColor: 'gray',
    padding: 5,
    borderRadius: 3,
    color: 'white',
    marginTop: 5,
  },
  modalView: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: '80%',
    maxHeight: 600,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: '-50%' },
      { translateY: '-50%' },
    ],
    justifyContent: 'center',
    alignItems: 'center',
  },
modalTitle: {
  fontSize: 20,
  marginBottom: 20,
  color: 'white',
  textAlign: 'center',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
  background: 'linear-gradient(90deg, #ff7eb3, #ff758c)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
},

  passwordInput: {
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    color: 'white',
    fontSize: 12,
    width: '100%',
  },
  emailInput: {
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    color: 'white',
    fontSize: 12,
    width: '100%',
  },
modalActions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 20,
  paddingHorizontal: 20,
},

button: {
  paddingVertical: 12,
  paddingHorizontal: 25,
  borderRadius: 8,
  textAlign: 'center',
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  cursor: 'pointer',
},

cancelButton: {
  background: 'linear-gradient(90deg, #ff7eb3, #ff758c)', // Soft red gradient for cancel
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',

},
cancelButtonHover: {
  transform: 'scale(1.05)',
  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',

},

enterButton: {
  background: 'linear-gradient(90deg, #4caf50, #81c784)', // Green gradient for enter
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
},
enterButtonHover: {
  transform: 'scale(1.05)',
  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
},

sendEmailButton: {
  background: 'linear-gradient(90deg, #2196f3, #64b5f6)', // Blue gradient for email
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
},
sendEmailButtonHover: {
  transform: 'scale(1.05)',
  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
},

buttonText1: {
  color: 'red',
  fontSize: 16,
  fontWeight: 'bold',
},
buttonText2: {
  color: 'green',
  fontSize: 16,
  fontWeight: 'bold',
},
buttonText3: {
  color: 'blue',
  fontSize: 16,
  fontWeight: 'bold',
},


  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
 loadingIndicator: {
   marginTop: 50,
   borderRadius: 10, // Adjust the value as needed for desired roundness
   backgroundColor: 'red', // Sets the background color to red
   borderWidth: 2, // Sets the border width

   width: 50, // Adjust the width as needed
   height: 50,
    marginLeft:130// Adjust the height as needed
 },

});

export default Sidebar;
