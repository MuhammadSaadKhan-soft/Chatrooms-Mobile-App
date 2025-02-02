import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { AuthContext } from '../../Contexts/AuthContext'; // Adjust path
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'; // Import FontAwesomeIcon
import { faCheckCircle, faTimesCircle, faUserCircle } from '@fortawesome/free-solid-svg-icons'; // Import SVG icons
import { navigationRef } from '../_layout';

const AccountScreen = () => {
  const { logout } = useContext(AuthContext);
  const [logoutStatus, setLogoutStatus] = useState(null); // State for logout status

  const handleProfilePress = () => {
    navigationRef.navigate('(tabs)', { screen: 'Profile' });
  };

  const handleLogoutPress = async () => {
    try {
      await logout(); // Call logout function
      setLogoutStatus('success'); // Set logout status to success
      setTimeout(() => {
        navigationRef.navigate('(Bottoms)', { screen: 'login' });
        setLogoutStatus(null);
      }, 1000);
    } catch (error) {
      setLogoutStatus('failure'); // Set logout status to failure
      setTimeout(() => setLogoutStatus(null), 3000); // Reset status after 3 seconds
    }
  };

  const renderLogoutStatusIcon = () => {
    if (logoutStatus === 'success') {
      return <FontAwesomeIcon icon={faCheckCircle} size={24} color="green" />;
    }
    if (logoutStatus === 'failure') {
      return <FontAwesomeIcon icon={faTimesCircle} size={24} color="red" />;
    }
    return null; // No icon if there's no status
  };

  return (
    <View style={styles.container}>
      {/* App Image and Name at the center */}
      <View style={styles.logoContainer}>
        <Image source={require('../../images/chattingfriends.png')} style={styles.appImage} />
        <Text style={styles.appName}>Roomey Chat</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleProfilePress}>
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogoutPress}>
          <Text style={styles.buttonText}>Logout</Text>

        </TouchableOpacity>
      </View>

      {/* App Version at the bottom */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 3.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242736',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '80%',
    padding: 15,
    marginVertical: 10,
    backgroundColor: 'black',
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 82,
  },
  iconContainer: {
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionContainer: {
    marginTop: 40,
  },
  versionText: {
    fontSize: 16,
    color: '#888',
  },
});

export default AccountScreen;
