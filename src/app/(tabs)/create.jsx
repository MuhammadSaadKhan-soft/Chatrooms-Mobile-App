import React, { useState } from 'react';
import {
    TextInput,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
    Alert,
    ToastAndroid
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faChevronDown, faClock, faCalendarAlt, faKey } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AxiosRequest } from '../Axios/AxiosRequest';
import CalendarPicker from 'react-native-calendar-picker';
import { useNavigation } from '@react-navigation/native';

const CreateRoom = ({ toggleSidebar, mode, showAlert }) => {
    const [roomName, setRoomName] = useState('');
    const [roomType, setRoomType] = useState('public');
    const [showModal, setShowModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [password, setPassword] = useState('');
    const [durationHours, setDurationHours] = useState(0);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [durationSeconds, setDurationSeconds] = useState(0);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const navigation = useNavigation();

    const roomTypes = [
        { label: 'Public', value: 'public' },
        { label: 'Private', value: 'private' },
        { label: 'Temporary', value: 'temporary' },
        { label: 'Scheduled', value: 'scheduled' },
    ];

    const handleCreateRoom = async () => {
            if (roomName.trim() === '') return  ToastAndroid.show(
                                                        'Enter your room name',
                                                        ToastAndroid.LONG
                                                      );;
            const userData = await AsyncStorage.getItem('userData');
            const parsedUserData = userData ? JSON.parse(userData) : null;

            if (!parsedUserData || !parsedUserData._id) {
                console.error('Admin ID is missing.');
                return;
            }

            const adminId = parsedUserData._id;

            switch (roomType) {
                case 'temporary':
                    createTemporaryRoom(adminId);
                    break;
                case 'private':
                    setShowModal(true);
                    break;
                case 'scheduled':
                    createScheduledRoom(adminId);
                    break;
                default:
                    createPublicRoom(adminId);
            }
        };

 const createTemporaryRoom = (adminId) => {
     if (
         durationHours < 0 || durationHours > 24 ||
         durationMinutes < 0 || durationMinutes > 60 ||
         durationSeconds < 0 || durationSeconds > 60
     ) {
         ToastAndroid.show(
             'Please enter valid values:\n- Hours: 0 to 24\n- Minutes: 0 to 60\n- Seconds: 0 to 60',
             ToastAndroid.LONG
         );
         return;
     }

     if (durationHours === 0 && durationMinutes === 0 && durationSeconds === 0) {
         ToastAndroid.show(
             'Please provide at least one non-zero value for duration.',
             ToastAndroid.LONG
         );
         return;
     }

     if (durationHours > 0) {
         ToastAndroid.show(
             `Temporary room will last for ${durationHours} hour(s).`,
             ToastAndroid.SHORT
         );
     }
     if (durationMinutes > 0) {
         ToastAndroid.show(
             `Temporary room will last for ${durationMinutes} minute(s).`,
             ToastAndroid.SHORT
         );
     }
     if (durationSeconds > 0) {
         ToastAndroid.show(
             `Temporary room will last for ${durationSeconds} second(s).`,
             ToastAndroid.SHORT
         );
     }

     AxiosRequest.post('/api/create-temporary', {
         name: roomName,
         adminId,
         durationInHours: durationHours,
         durationInMinutes: durationMinutes,
         durationInSeconds: durationSeconds,
     })
         .then((response) => {
             handleRoomCreationSuccess(response);
         })
         .catch(() => {
             ToastAndroid.show(
                 'Failed to create temporary room. Please try again.',
                 ToastAndroid.LONG
             );
         });
 };

const createScheduledRoom = (adminId) => {
    const today = new Date(); // Get today's date
    today.setHours(0, 0, 0, 0); // Reset time to midnight for comparison

    if (!startDate || !endDate) {
        ToastAndroid.show(
            'Please select both a start date and an end date.',
            ToastAndroid.LONG
        );
        return; // Exit if dates are not provided
    }

    if (startDate < today) {
        // Check if startDate is earlier than today
        ToastAndroid.show(
            'Start date cannot be in the past.',
            ToastAndroid.LONG
        );
        return; // Exit if startDate is invalid
    }

    if (startDate >= endDate) {
        ToastAndroid.show(
            'The end date must be later than the start date.',
            ToastAndroid.LONG
        );
        return; // Exit if the date range is invalid
    }

    // Proceed with API request if validation passes
    AxiosRequest.post('/api/rooms/create-scheduled', {
        name: roomName,
        adminId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
    })
        .then((response) => {
            handleRoomCreationSuccess(response);
        })
        .catch(() => {
            ToastAndroid.show(
                'Failed to create the scheduled room. Please try again.',
                ToastAndroid.LONG
            );
        });
};
    const createPublicRoom = (adminId) => {
        AxiosRequest.post('/api/rooms/create', { name: roomName, adminId })
            .then((response) => {
                handleRoomCreationSuccess(response);
            })
            .catch((error) => {
                console.error('Error creating room:', error.response ? error.response.data : error.message);
            });
    };

  const handleCreatePrivateRoom = async () => {
      if (roomName.trim() === '' || password.trim() === '') {
          return   ToastAndroid.show(
                             ' Password are Required',
                             ToastAndroid.LONG
                         );;
      }

      const userData = await AsyncStorage.getItem('userData');
      const parsedUserData = userData ? JSON.parse(userData) : null;

      if (!parsedUserData || !parsedUserData._id) {
          return alert('User data is missing or corrupted.');
      }

      AxiosRequest.post('/api/rooms/create-private', {
          name: roomName,
          adminId: parsedUserData._id,
          password,
      })
          .then((response) => {
              handleRoomCreationSuccess(response);
              setPassword('');
              setShowModal(false);
          })
          .catch((error) => {
              console.error('Error creating private room:', error.response?.data || error.message);
               ToastAndroid.show(
                         'fail to create private room',
                         ToastAndroid.LONG
                     );
          });
  };


    const handleRoomCreationSuccess = (response) => {
        const roomId = response.data._id || response.data.roomId;
        const adminName = response.data.adminName;
        setRoomName('');
        navigation.navigate('groupchat', { roomId, roomName, adminName });
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.header}>Create Room</Text>
                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        placeholder="Room Name"
                        placeholderTextColor="#999"
                        value={roomName}
                        onChangeText={setRoomName}
                    />
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setShowDropdown(!showDropdown)}
                    >
                        <Text style={styles.dropdownButtonText}>
                            {roomTypes.find((type) => type.value === roomType)?.label || 'Select Room Type'}
                        </Text>
                        <FontAwesomeIcon icon={faChevronDown} style={styles.dropdownIcon} />
                    </TouchableOpacity>
                    <Modal
                        visible={showDropdown}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setShowDropdown(false)}
                    >
                        <TouchableOpacity
                            style={styles.dropdownOverlay}
                            activeOpacity={1}
                            onPress={() => setShowDropdown(false)}
                        >
                            <View style={styles.dropdownMenu}>
                                {roomTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setRoomType(type.value);
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownItemText}>{type.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableOpacity>
                    </Modal>
                   {roomType === 'temporary' && (
                     <View style={styles.durationInputs}>
                      <Text style={styles.label}><FontAwesomeIcon icon={faClock} style={styles.icon}/> Duration</Text>
                       <Text style={styles.label}>Duration</Text>
                       <View style={styles.durationColumn}>
                         <View style={styles.durationField}>
                           <Text style={styles.label}>Hours</Text>
                           <TextInput
                             style={styles.durationInput}
                             placeholder="0"
                             placeholderTextColor="#999"
                             keyboardType="numeric"
                             value={String(durationHours)}
                             onChangeText={(text) => setDurationHours(Number(text))}
                           />
                         </View>
                         <View style={styles.durationField}>
                           <Text style={styles.label}>Minutes</Text>
                           <TextInput
                             style={styles.durationInput}
                             placeholder="0"
                             placeholderTextColor="#999"
                             keyboardType="numeric"
                             value={String(durationMinutes)}
                             onChangeText={(text) => setDurationMinutes(Number(text))}
                           />
                         </View>
                         <View style={styles.durationField}>
                           <Text style={styles.label}>Seconds</Text>
                           <TextInput
                             style={styles.durationInput}
                             placeholder="0"
                             placeholderTextColor="#999"
                             keyboardType="numeric"
                             value={String(durationSeconds)}
                             onChangeText={(text) => setDurationSeconds(Number(text))}
                           />
                         </View>
                       </View>
                     </View>
                   )}
                    {roomType === 'scheduled' && (
                        <View style={styles.scheduleInputs}>
                          <Text style={styles.label}><FontAwesomeIcon icon={faCalendarAlt} style={styles.icon}/> Start Date</Text>
                            <Text style={styles.label}>Start Date</Text>
                            <CalendarPicker
                                onDateChange={setStartDate}
                                textStyle={styles.calendarText}
                                selectedDayColor="green"
                                selectedDayTextColor="white"
                                todayBackgroundColor="red"
                                todayTextStyle={styles.calendarTodayText}
                            />
                            <Text style={styles.label}>End Date</Text>
                            <CalendarPicker
                                onDateChange={setEndDate}
                                textStyle={styles.calendarText}
                                selectedDayColor="green"
                                selectedDayTextColor="white"
                                todayBackgroundColor="red"
                                todayTextStyle={styles.calendarTodayText}
                            />
                        </View>
                    )}
                </View>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateRoom}>
                    <FontAwesomeIcon icon={faPlus} style={styles.icon} />
                    <Text style={styles.buttonText}>Create</Text>
                </TouchableOpacity>

                <Modal
                    visible={showModal}
                    onRequestClose={() => setShowModal(false)}
                    animationType="slide"
                    transparent
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#999"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => setShowModal(false)}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.enterButton]}
                                    onPress={handleCreatePrivateRoom}
                                >
                                    <Text style={styles.buttonText}>Enter</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#1C1F2A',
    },
    container: {
        padding: 20,
        backgroundColor: '#1C1F2A',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    input: {
        height: 45,
        borderColor: '#444A59',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        color: '#FFFFFF',
        backgroundColor: '#2B2D3A',
        borderRadius: 8,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 45,
        backgroundColor: '#2B2D3A',
        borderColor: '#444A59',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
     icon: {
            color: '#FFFFFF',
            marginRight: 10,
        },
    dropdownButtonText: {
        color: '#FFFFFF',
    },
    dropdownIcon: {
        color: '#FFFFFF',
    },
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownMenu: {
        backgroundColor: '#2B2D3A',
        borderRadius: 8,
        padding: 5,
        width: '80%',
    },
    dropdownItem: {
        padding: 10,
    },
    dropdownItemText: {
        color: '#FFFFFF',
    },



  durationInputs: {
    marginTop: 10,
  },
  durationColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  durationField: {
    marginBottom: 10, // Add space between fields
    width: '100%', // Ensure the input field takes full width
  },
  durationInput: {
    height: 45,
    borderColor: '#444A59',
    borderWidth: 1,
    paddingHorizontal: 10,
    color: '#FFFFFF',
    backgroundColor: '#2B2D3A',
    borderRadius: 8,
    marginTop: 5, // Add margin between label and input
  },
  label: {
         fontSize: 16,
         color: '#FFFFFF',
         flexDirection: 'row',
         alignItems: 'center',
     },
    scheduleInputs: {
        marginTop: 10,
    },
    calendarText: {
        color: '#FFFFFF',
    },
    calendarTodayText: {
        color: '#FFD700',
    },
   createButton: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: 'black',
     padding: 12,
     borderRadius: 8,
     justifyContent: 'center',
     marginTop: 20,
     borderColor: 'blue',  // Set the border color here
     borderWidth: 1,       // Set the thickness of the border
   },

    icon: {
        color: '#FFFFFF',
        marginRight: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        width: 320,
        backgroundColor: '#2B2D3A',
        padding: 20,
        borderRadius: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
  button: {
      flex: 1,
      padding: 15,
      marginHorizontal: 5,
      alignItems: 'center',
      borderWidth: 2, // Add a visible border
      borderColor: '#000', // Border color for visibility
  },
  cancelButton: {
      backgroundColor: '#E63946',
      borderRadius: 20, // Unique border radius for the cancel button
  },
  enterButton: {
      backgroundColor: '#1DB954',
      borderRadius: 20, // Unique border radius for the enter button
  },


});

export default CreateRoom;
