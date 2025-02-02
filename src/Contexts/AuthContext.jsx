import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        const userData = await AsyncStorage.getItem('userData');

        if (token && userData) {
          setAuth({
            isAuthenticated: true,
            user: JSON.parse(userData),
            token,
            loading: false,
            error: null,
          });
        } else {
          setAuth({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        setAuth({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: 'Failed to load authentication data',
        });
      }
    };

    loadAuthData();
  }, []);

  const login = async (user, token) => {
    setAuth({
      isAuthenticated: true,
      user,
      token,
      loading: false,
      error: null,
    });
    await AsyncStorage.setItem('jwt', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));
  };

  const logout = async () => {
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
    });
    await AsyncStorage.removeItem('jwt');
    await AsyncStorage.removeItem('userData');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {!auth.loading && children}
    </AuthContext.Provider>
  );
};
