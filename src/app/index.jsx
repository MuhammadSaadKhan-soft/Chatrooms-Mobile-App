import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { navigationRef } from './_layout';

const HomePage = () => {
  const [loading, setLoading] = useState(true); // State to control the loading spinner
  const navigation = useNavigation(); // Get the navigation prop

  useEffect(() => {
    // Ensure navigation is ready before using it
    if (navigation) {
      const timer = setTimeout(() => {
        setLoading(false); // Stop the loading spinner
        if (navigationRef.isReady()) {
          navigationRef.navigate('(Bottoms)', { screen: 'login' });
        }
      }, 4000); // Wait for splash to finish before navigating

      return () => clearTimeout(timer); // Cleanup timeout if component unmounts
    }
  }, [navigation]); // Add navigation as a dependency

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Splash Screen with logo */}
      <View style={styles.splashContainer}>
        <Image source={require('../images/chattingfriends.png')} style={styles.logo} />
        <Text style={styles.logoName}>Roomey Chat</Text>

        {/* Display spinner while loading */}
        {loading && (
          <ActivityIndicator size={loading ? "large" : "small"} color="#fff" style={styles.spinner} />
        )}
      </View>

      {/* Your existing UI elements go here (e.g., rooms, features, etc.) */}
      <View style={styles.roomSections}>
        {/* Add the rest of your rooms and features here */}
      </View>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#242736',
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100, // Adjust based on your logo size
  },
  logo: {
    width: 300,
    height: 300,
    borderRadius: 5,
  },
  logoName: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 20,
  },
  spinner: {
    marginTop: 20,
  },
  header: {
    backgroundColor: '#282c34',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Other styles for the main content
  roomSections: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  circleButton: {
    backgroundColor: '#FF5733',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    right: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomePage;
