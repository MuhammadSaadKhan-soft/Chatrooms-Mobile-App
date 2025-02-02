import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { showMessage } from 'react-native-flash-message';

const Search_Room = ({ toggleSidebar }) => {
  const [rooms, setRooms] = useState([]);  // Assuming rooms are set from elsewhere
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = useNavigation();

  const handleRoomClick = (room) => {
    navigation.navigate('ChatRoom', { roomId: room._id });
    showMessage({ message: `Welcome to ${room.name}`, type: 'success' });
  };

  const searchRooms = () => {
    return rooms.filter((room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <View style={styles.container}>
      {/* Sidebar Toggle */}
      <TouchableOpacity onPress={toggleSidebar} style={styles.circleButton}>
        <FontAwesomeIcon icon={faBars} size={24} color="#ffffff" />
      </TouchableOpacity>



      {/* Room List */}
      <FlatList
        data={searchRooms()}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.roomItem}
            onPress={() => handleRoomClick(item)}
          >
            <Text style={styles.roomName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  circleButton: {
    backgroundColor: '#007bff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  searchInput: {
    borderBottomWidth: 1,
    marginVertical: 10,
    paddingVertical: 5,
    color:'white',
  },
  roomItem: {
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  roomName: {
    fontSize: 16,
  },
});

export default Search_Room;
