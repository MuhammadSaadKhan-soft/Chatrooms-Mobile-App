import React, { useState } from 'react';
import { View, TextInput, ScrollView, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { AxiosRequest } from "../Axios/AxiosRequest";
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../_layout';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ToastAndroid } from 'react-native';

const Registration = () => {
  const [imageFileName, setImageFileName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const navigation = useNavigation();

  // Form Validation Schema with Yup
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password should be at least 6 characters').required('Password is required'),
    cpassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required'),
    interest: Yup.string().required('Interest is required'),
  });

  const handleImagePick = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        ToastAndroid.show('Image selection was cancelled.', ToastAndroid.SHORT);
      } else if (response.errorCode) {
        ToastAndroid.show(`Image selection failed: ${response.errorMessage}`, ToastAndroid.SHORT);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        setImage(selectedImage);
        setImageFileName(selectedImage.fileName);
      }
    });
  };

 const handleSubmit = async (values) => {
   const { name, email, password, cpassword, interest } = values;

   if (!image) {
     ToastAndroid.show('Please choose a profile picture.', ToastAndroid.SHORT);
     return;
   }

   setLoading(true);

   setTimeout(async () => {
     try {
       const formData = new FormData();
       formData.append('name', name);
       formData.append('email', email);
       formData.append('password', password);
       formData.append('interest', interest);

       const imageFile = {
         uri: image.uri,
         type: image.type || 'image/jpeg',
         name: image.fileName || 'profile_picture.jpg',
       };

       formData.append('profilePicture', imageFile);

       const response = await AxiosRequest.post('/api/auth/createUser', formData, {
         headers: {
           'Content-Type': 'multipart/form-data',
         },
       });

       const data = response.data;
       if (data.success && data.token && data.user) {
         await AsyncStorage.setItem('jwt', data.token);
         await AsyncStorage.setItem('userData', JSON.stringify(data.user));
         ToastAndroid.show('Registration successful!', ToastAndroid.SHORT);
         // 2-second delay before navigating
         setTimeout(() => {
           navigationRef.navigate('(Bottoms)', { screen: 'login' });
         }, 2000);
       } else {
         ToastAndroid.show(data.message || 'Something went wrong.', ToastAndroid.SHORT);
       }
     } catch (error) {
       console.error('Error:', error.response?.data || error.message);
       ToastAndroid.show('An error occurred while registering. Please try again.', ToastAndroid.SHORT);
     } finally {
       setLoading(false);
     }
   }, 2000); // Wait 2 seconds before performing the registration logic
 };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Background Image Container */}
      <View style={styles.backgroundImageContainer}>
        <Image
          source={require('../../images/chattingfriends.png')}  // Replace with your image path
          style={styles.backgroundImage}
        />
      </View>

      <View style={styles.formContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigationRef.navigate('(Bottoms)', { screen: 'login' })}
        >
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="white" />
        </TouchableOpacity>

        {/* Display selected profile image */}
        <View style={styles.imageWrapper}>
          <Image
            source={image ? { uri: image.uri } : require('../../images/chattingfriends.png')}
            style={styles.profileImage}
          />
        </View>

        {/* Welcome Text */}
        <Text style={styles.header}>Welcome To Chat Roomey!</Text>
        <Text style={styles.subtitle}>Enter your details to register</Text>

        {/* Formik Form */}
        <Formik
          initialValues={{ name: '', email: '', password: '', cpassword: '', interest: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
            <>
              {['name', 'email', 'password', 'cpassword', 'interest'].map((field) => (
                <View key={field} style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    placeholderTextColor="white"
                    value={values[field]}
                    onChangeText={handleChange(field)}
                    onBlur={handleBlur(field)}
                    secureTextEntry={field.includes('password')}
                  />
                  {touched[field] && errors[field] && (
                    <Text style={styles.errorText}>{errors[field]}</Text>
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.customFileInput} onPress={handleImagePick}>
                <Text style={styles.customFileInputText}>Choose a File</Text>
              </TouchableOpacity>

              {imageFileName && <Text style={styles.selectedFileText}>Selected File: {imageFileName}</Text>}

              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.registerButtonText}>{loading ? 'Loading...' : 'Register'}</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
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
    paddingBottom: 50, // added padding bottom for consistency
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: -6,
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
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
  errorText: {
    color: 'red',
    fontSize: 12,
  },
  imageWrapper: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    resizeMode: 'cover',
    borderWidth: 4,
    borderColor: '#6200EE',
  },
  customFileInput: {
    backgroundColor: '#2c2f38',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 20,
    width: 200,
    marginLeft: 60,
  },
  customFileInputText: {
    color: 'white',
    textAlign: 'center',
  },
  selectedFileText: {
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: -2,
    left: -5,
    zIndex: 10,
  },
});

export default Registration;
