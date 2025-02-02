import React from 'react';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from '../Contexts/AuthContext'; // Import the AuthProvider
import HomePage from '.';
import TabLayout from './(tabs)/_layout';
import BottomTabLayout from './(Bottoms)/_layout';
import GroupsChat from './groupchat';
import VideoChat from './(Video&Audio)/video';

export const navigationRef = createNavigationContainerRef();

const Stack = createStackNavigator();

export default function RootLayout() {
  return (
    // Wrap the NavigationContainer and Stack.Navigator with the AuthProvider
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          <Stack.Screen name="index" component={HomePage} options={{ headerShown: false }} />
          <Stack.Screen name="(Bottoms)" component={BottomTabLayout} options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" component={TabLayout} options={{ headerShown: false }} />
          <Stack.Screen name="groupchat" component={GroupsChat} options={{ headerShown: false }} />
          <Stack.Screen name="videocall" component={VideoChat} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
