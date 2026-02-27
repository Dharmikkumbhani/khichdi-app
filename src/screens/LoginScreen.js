import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { BASE_URL } from '../config';

const LoginScreen = ({ navigation }) => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOTP = async () => {
        // Basic validation
        if (!mobileNumber || mobileNumber.length < 10) {
            Alert.alert('Invalid Input', 'Please enter a valid mobile number');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/auth/send-otp`, {
                mobileNumber
            });

            if (response.data.success) {
                // Navigate to OTPScreen
                navigation.navigate('OTP', { mobileNumber });
            } else {
                Alert.alert('Error', response.data.message || 'Failed to send OTP');
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Server error, please try again later');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#eef6ee', '#e0ece0']}
                style={StyleSheet.absoluteFillObject}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>

                    <View style={styles.card}>
                        {/* Logo placeholder - match screenshot's logo circle */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <Text style={styles.logoText}>🏨</Text>
                            </View>
                        </View>

                        <Text style={styles.title}>Hotel Login</Text>
                        <Text style={styles.subtitle}>Access your booking and management dashboard</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Mobile Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+1 234 567 8900"
                                keyboardType="phone-pad"
                                value={mobileNumber}
                                onChangeText={setMobileNumber}
                                placeholderTextColor="#A0A0A0"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSendOTP}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={['#2F7631', '#215c23']}
                                style={styles.buttonGradient}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Send OTP</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
        alignItems: 'center',
        paddingBottom: 40,
    },
    logoContainer: {
        marginBottom: 20,
        marginTop: 10,
    },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#eef6ee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 28,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1f1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6e7a6f',
        marginBottom: 30,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1f1a',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0ece0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1a1f1a',
        backgroundColor: '#f9fcf9',
    },
    button: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
    },
    buttonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    }
});

export default LoginScreen;
