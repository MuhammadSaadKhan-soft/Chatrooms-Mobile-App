import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Animated, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AxiosRequest } from '../Axios/AxiosRequest';
import { navigationRef } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgetPassword = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

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

  const handleForgetPasswordSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await AxiosRequest.post(
        'api/auth/forget-password',
        { email: values.email }
      );
      const data = response.data;

      if (data.status === 'success') {
        await AsyncStorage.setItem('Email', values.email);
        Alert.alert('Success', data.message);
        console.log('Navigating to reset screen');
        navigation.navigate('(Bottoms)', { screen: 'reset' });
      } else if (data.status === 'user not found') {
        Alert.alert('Error', 'User not found. Please enter a valid email address.');
      } else {
        Alert.alert('Error', data.message || 'An error occurred while processing your request.');
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../images/chats.png')} // Your background image path
      style={styles.backgroundImageContainer}
    >
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigationRef.navigate('(Bottoms)', { screen: 'login' })}
        >
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <Text style={styles.heading}>Forget Password</Text>
          <Formik
            initialValues={{ email: '' }}
            validationSchema={validationSchema}
            onSubmit={handleForgetPasswordSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#B0B0B0"
                  keyboardType="email-address"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  autoCapitalize="none"
                />
                {touched.email && errors.email && (
                  <Text style={styles.error}>{errors.email}</Text>
                )}

                {/* Animated Submit Button */}
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
                      <Text style={styles.buttonText}>Submit</Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}
          </Formik>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10, // Ensure the button is on top of other elements
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#2c2f3e',
    opacity: 0.75, // Slight transparency for the form container
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  heading: {
    fontSize: 26,
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#d3d6df',
    fontWeight: '600',
  },
  input: {
    height: 50,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444857',
    borderRadius: 8,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: '#3a3f51',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgetPassword;
