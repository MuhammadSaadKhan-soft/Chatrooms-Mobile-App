import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, useColorScheme, StyleSheet,PermissionsAndroid, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'; // Import NavigationContainer
import HomePage from './src/app';
import RootLayout from './src/app/_layout';
// import SplashScreen from 'react-native-splash-screen';


function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000' : '#fff',
    flex: 1,
  };

  const getPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);

        if (
          granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
        } else {
          console.log('Permissions denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  useEffect(() => {
    getPermission(); // Request permissions on app load
  }, []);


  return (
    <SafeAreaView style={backgroundStyle}>

      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
        <RootLayout/>
    </SafeAreaView>
  );
}

export default App;
