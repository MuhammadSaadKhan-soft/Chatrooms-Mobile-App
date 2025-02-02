import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosRequest } from "../Axios/AxiosRequest";

const ProfileManagement = () => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        cpassword: '',

        interest: '',
        profilePicture: ''
    });
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [token, setToken] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const savedToken = await AsyncStorage.getItem('jwt');
                if (savedToken) {
                    setToken(savedToken);
                    fetchUserData(savedToken);
                } else {
                    Alert.alert('Error', 'No token found');
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to retrieve token');
            }
        };

        fetchToken();
    }, []);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const fetchUserData = async (token) => {
        if (!token) throw new Error('No token found');
        setLoading(true);
        try {
            const response = await AxiosRequest.get('/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("profile response data:",response.data);

            const data = response.data;

            setUserData({
                name: data.name,
                email: data.email,

                interest: data.interest ? data.interest.join(', ') : '',
                profilePicture: data.profilePicture || ''
            });

            setImagePreview(data.profilePicture || '');
        } catch (error) {
            console.error('Error fetching user data:', error);
            Alert.alert('Error', 'Failed to fetch user data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onChange = (name, value) => {
        setUserData({ ...userData, [name]: value });
    };

    const onImageChange = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
            includeBase64: false,
        });

        if (result.assets && result.assets.length > 0) {
            const selectedImage = result.assets[0];
            setNewProfilePicture(selectedImage.uri);
            setImagePreview(selectedImage.uri);
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        if (!userData.name) {
            newErrors.name = "Name is required";
            isValid = false;
        }
        if (!userData.email) {
            newErrors.email = "Email is required";
            isValid = false;
        }
        if (userData.password && userData.password !== userData.cpassword) {
            newErrors.cpassword = "Passwords do not match";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        const formData = new FormData();
        formData.append('name', userData.name);
        formData.append('email', userData.email);
        formData.append('password', userData.password);

        formData.append('interest', userData.interest);
        if (newProfilePicture) {
            formData.append('profilePicture', {
                uri: newProfilePicture,
                type: 'image/jpeg',
                name: 'profilePicture.jpg',
            });
        }

        setLoading(true);
        try {
            const response = await AxiosRequest.patch('/api/auth/updateuser', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });
            const data = response.data;
            if (data.user) {
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));
                Alert.alert('Success', 'Profile updated successfully!');
                setUserData({
                    ...userData,
                    profilePicture: data.user.profilePicture
                });
                setImagePreview(data.user.profilePicture);
                setRetryCount(0); // Reset retry count on success
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating user data:', error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
                Alert.alert('Error', `Server error: ${error.response.status}. Please try again.`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Request:', error.request);
                if (retryCount < 3) {
                    Alert.alert(
                        'Network Error',
                        'Failed to connect to the server. Would you like to retry?',
                        [
                            {
                                text: 'Cancel',
                                style: 'cancel',
                            },
                            {
                                text: 'Retry',
                                onPress: () => {
                                    setRetryCount(retryCount + 1);
                                    handleSubmit(); // Retry the submission
                                },
                            },
                        ]
                    );
                } else {
                    Alert.alert('Error', 'Network error. Please check your connection and try again later.');
                }
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', error.message);
                Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.profileHeader}>
                {imagePreview ? (
                    <Image source={{ uri: imagePreview }} style={styles.profileImg} />
                ) : null}
            </View>
            <Text style={styles.sectionTitle}>Profile Management</Text>
            {loading && (
                <ActivityIndicator size="large" color="#fff" style={styles.spinner} />
            )}
            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    placeholderTextColor="white"
                    value={userData.name}
                    onChangeText={(text) => onChange('name', text)}
                />
                {errors.name && <Text style={styles.error}>{errors.name}</Text>}
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="white"
                    value={userData.email}
                    editable={false}
                    onChangeText={(text) => onChange('email', text)}
                    keyboardType="email-address"
                />
                {errors.email && <Text style={styles.error}>{errors.email}</Text>}

                <TextInput
                    style={styles.input}
                    placeholder="Interest"
                    placeholderTextColor="white"
                    value={userData.interest}
                    onChangeText={(text) => onChange('interest', text)}
                />
                <TouchableOpacity style={styles.button} onPress={onImageChange}>
                    <Text style={styles.buttonText}>Change Profile Picture</Text>
                </TouchableOpacity>
                <Button title="Update Profile" onPress={handleSubmit} color="black" />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#1C1F2A',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 10,
        marginBottom: 15,
    },
    profileImg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: 'white',
        marginRight: 15,
    },
    name: {
        fontSize: 24,
        fontWeight: '600',
        color: '#007bff',
    },
    email: {
        fontSize: 18,
        color: '#555',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 10,
        borderBottomWidth: 2,
        color: 'white',
    },
    form: {
        marginTop: 20,
    },
    input: {
        backgroundColor: '#2B2D3A',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ced4da',
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
        width: 300,
        color: 'white'
    },
    error: {
        color: '#dc3545',
        fontSize: 14,
        marginBottom: 15,
    },
    button: {
        backgroundColor: 'black',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    spinner: {
        marginTop: 20,
    },
});

export default ProfileManagement;

