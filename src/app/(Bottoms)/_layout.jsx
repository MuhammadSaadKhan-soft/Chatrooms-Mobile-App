// import { Stack, Tabs } from 'expo-router';
// import React from 'react';
// import { Colors } from '@/constants/Colors';
// import { useColorScheme } from '@/hooks/useColorScheme';

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (

//     <Stack
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
//         headerShown: false,
//       }}>
//       <Stack.Screen
//         name="login"
//         options={{
//           title: 'login',

//         }}
//       />
//         <Stack.Screen
//         name="registration"
//         options={{
//           title: 'registration',

//         }}
//       />

//        <Stack.Screen
//         name="forget"
//         options={{
//           title: 'forget',
//           headerShown: false,
//         }}

//       />



//     </Stack>
//   );
// }


import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';
import Login from './login'; // Import your screen components
import Registration from './registration'; // Import your screen components
import ForgetPassword from './forget'; // Import your screen components
import ResetPassword from "./reset";
const Stack = createStackNavigator();

export default function BottomTabLayout() {
  const colorScheme = useColorScheme();

  return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="login"
          component={Login}
          options={{
            title: 'login',
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          }}
        />
        <Stack.Screen
          name="registration"
          component={Registration}
          options={{
            title: 'registration',
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          }}
        />
        <Stack.Screen
          name="forget"
          component={ForgetPassword}
          options={{
            title: 'forget',
            headerShown: false,
          }}
        />
         <Stack.Screen
                  name="reset"
                  component={ResetPassword}
                  options={{
                    title: 'reset',
                    headerShown: false,
                  }}
                />
      </Stack.Navigator>
  );
}
