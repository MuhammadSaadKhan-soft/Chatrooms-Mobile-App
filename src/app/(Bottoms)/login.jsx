import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, StyleSheet, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AxiosRequest } from '../Axios/AxiosRequest';
import Alert from "../../alertactions/alert";
import { navigationRef } from '../_layout';
import { AuthContext } from "../../Contexts/AuthContext";
import { ToastAndroid } from 'react-native'; // Import ToastAndroid
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,}$/;

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .matches(emailRegex, 'Please enter a valid email address (e.g., example@mail.com).')
    .required('Email is required'),

  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[@$!%*?&]/, 'Password must contain at least one special character')
    .required('Password is required'),
});

const Login = () => {
  const { login } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigation = useNavigation();

  // Animations
  const fadeAnim = new Animated.Value(0);  // Initial opacity 0
  const slideAnim = new Animated.Value(-30); // Slide from above
  const bounceAnim = new Animated.Value(1); // Scale bounce

  useEffect(() => {
    // Fade in effect
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Slide in effect for inputs
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Button press animation
  const handleButtonPressIn = () => {
    Animated.spring(bounceAnim, {
      toValue: 1.2,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 0,
      useNativeDriver: true,
    }).start();
  };

 const handleSubmit = async (values) => {
     setLoading(true)

     try {
       // Check if there's a temporary new password
       const tempNewPassword = await AsyncStorage.getItem("tempNewPassword")
       if (tempNewPassword) {
         // Use the temporary password instead of the one entered by the user
         values.password = tempNewPassword
         // Remove the temporary password from storage
         await AsyncStorage.removeItem("tempNewPassword")
       }

       console.log("Sending login request with data:", values)
       const response = await AxiosRequest.post("/api/auth/login", {
         email: values.email,
         password: values.password,
       })

       const data = response.data
       console.log("Received data:", data)

       await AsyncStorage.setItem("jwt", data.token)
       await AsyncStorage.setItem("userData", JSON.stringify(data.user))
       login(data.user, data.token)
       navigation.navigate("(tabs)", { screen: "create" })
       ToastAndroid.show("Login successful!", ToastAndroid.SHORT)
       setAlert({ message: "Successfully logged in!", type: "success" })
     } catch (error) {

       setAlert({ message: "Login failed. Please check your credentials.", type: "error" })
     } finally {
       setLoading(false)
     }
   }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>
        Welcome To Chat Roomey!
      </Text>
    <View style={styles.backgroundImageContainer}>
           <Image
             source={require('../../images/chattingfriends.png')}
             style={styles.backgroundImage}
           />
         </View>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <Animated.View style={[styles.formContainer, { transform: [{ translateY: slideAnim }] }]}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Your Email"
                placeholderTextColor="#B0B0B0"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                keyboardType="email-address"
              />
            </View>
            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Your Password"
                placeholderTextColor="#B0B0B0"
                secureTextEntry
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
              />
            </View>
            {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            {/* Submit Button */}
            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <TouchableOpacity
                style={styles.button}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                onPress={handleSubmit}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}
      </Formik>

      {/* Display Alert */}
      {alert && <Alert alert={alert} />}

      {/* Forgot Password and Registration Links */}
      <View style={styles.linkContainer}>
        <TouchableOpacity onPress={() => navigationRef.navigate('(Bottoms)', { screen: 'forget' })}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigationRef.navigate('(Bottoms)', { screen: 'registration' })}>
          <Text style={styles.registrationStyle}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#242736',
  },
  header: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '700',
    color: '#FFF',
  },
 backgroundImageContainer: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     justifyContent: 'center',
     alignItems: 'center',
     zIndex: -1,
   },
   backgroundImage: {
     width: '100%',
     height: '100%',
     resizeMode: 'cover',
     borderRadius: 20,
     opacity: 0.2,
   },
  formContainer: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#333',
    paddingLeft: 15,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#ccc',
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 5,
  },
  forgotPassword: {
    textAlign: 'center',
    color: '#4CAF50',
    fontSize: 16,
    paddingVertical: 10,
  },
  registrationStyle: {
    textAlign: 'center',
    color: '#03A9F4',
    fontSize: 16,
    paddingVertical: 10,
  },
  linkContainer: {
    marginTop: 20,
  },
});

export default Login;
