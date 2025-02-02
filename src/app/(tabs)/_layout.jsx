import React, { useState,useContext, useCallback, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import CreateRoom from './create';
import ProfileManagement from './profile';
import Sidebar from './sidebar';
import AccountScreen from './account';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AuthProvider } from '../../Contexts/AuthContext';
import { faPlusCircle, faUser, faSearch, faUserCircle, faComments } from '@fortawesome/free-solid-svg-icons';
import { ToastAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from "../../Contexts/AuthContext";
const Tab = createBottomTabNavigator();

const TabLayout = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
 const { logout } = useContext(AuthContext); // Access logout from AuthContext

  const handleTabPress = useCallback((e) => {
    if (e.target && e.target.name === 'Search Rooms' && !isLoading) {
      setIsLoading(true);
      // Simulate fetching rooms (replace with actual API call)
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate('Search Rooms');
      }, 1500); // Simulating a 1.5 second load time
    }
  }, [navigation]);

 const [logoutStatus, setLogoutStatus] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault(); // Prevent default navigation behavior (going back to login)

      // Show a Toast message instead of Alert
      ToastAndroid.show(
        'You will be logged out. Navigating to the login screen.',
        ToastAndroid.LONG
      );

      // Allow navigation to go back to login after the toast message is shown
      navigation.dispatch(e.data.action);
    });

    // Cleanup the listener when the component unmounts
    return unsubscribe;
  }, [navigation]);



  return (
    <AuthProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: {
            backgroundColor: '#0a0f1f',
            borderTopWidth: 0,
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 10,
          },
          tabBarActiveTintColor: 'red',
          tabBarInactiveTintColor: 'yellow',
          tabBarLabel: ({ focused, color }) => {
            let label;

            if (route.name === 'Create') {
              label = 'Create';
            } else if (route.name === 'Profile') {
              label = 'Profile';
            } else if (route.name === 'Search Rooms') {
              label = 'Rooms';
            } else if (route.name === 'Account') {
              label = 'Account';
            }

            return (
              <View style={styles.labelContainer}>
                <Text style={[styles.label, { color: focused ? 'red' : color }]}>
                  {label}
                </Text>
              </View>
            );
          },
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;

            if (route.name === 'Create') iconName = faPlusCircle;
            else if (route.name === 'Profile') iconName = faUser;
            else if (route.name === 'Search Rooms') iconName = faComments;
            else if (route.name === 'Account') iconName = faUserCircle;

            if (route.name === 'Search Rooms' && isLoading) {
              return <ActivityIndicator color={focused ? 'red' : color} />;
            }

            return <FontAwesomeIcon icon={iconName} color={color} size={size} />;
          },
          tabBarItemStyle: { flexDirection: 'column' },
        })}
        screenListeners={{
          tabPress: handleTabPress,
        }}
      >
        <Tab.Screen name="Create" component={CreateRoom} options={{ headerShown: false }} />
        <Tab.Screen name="Profile" component={ProfileManagement} options={{ headerShown: false }} />
        <Tab.Screen name="Search Rooms" component={Sidebar} options={{ headerShown: false }} />
        <Tab.Screen name="Account" component={AccountScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 8,
    marginTop: 0,
  },
});

export default TabLayout;
