import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { BASE_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);

    const checkToken = async () => {
        try {
            setIsLoading(true);
            const token = await SecureStore.getItemAsync('hotelToken');
            if (token) {
                // Optionally verify token with backend here
                setUserToken(token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        } catch (error) {
            console.log("Token extraction error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkToken();
    }, []);

    const login = async (token) => {
        setIsLoading(true);
        setUserToken(token);
        await SecureStore.setItemAsync('hotelToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsLoading(false);
    };

    const logout = async () => {
        setIsLoading(true);
        setUserToken(null);
        await SecureStore.deleteItemAsync('hotelToken');
        delete axios.defaults.headers.common['Authorization'];
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ login, logout, isLoading, userToken }}>
            {children}
        </AuthContext.Provider>
    );
};
