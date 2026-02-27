import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';

const OTPScreen = ({ route, navigation }) => {
    const { mobileNumber, name, hotelName, incomingOtp } = route.params;
    const { login } = useContext(AuthContext);

    // Initialize the OTP state with the incoming OTP if provided (splits string into array of 5)
    // Otherwise fallback to 5 empty strings
    const initialOtpState = incomingOtp
        ? incomingOtp.split('').slice(0, 5)
        : ['', '', '', '', ''];

    const [otp, setOtp] = useState(initialOtpState);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(300); // 5 minutes (300 seconds)
    const inputRefs = useRef([]);

    useEffect(() => {
        let interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = () => {
        const getSeconds = `0${(timer % 60)}`.slice(-2);
        const minutes = `${Math.floor(timer / 60)}`;
        const getMinutes = `0${minutes % 60}`.slice(-2);
        return `${getMinutes}:${getSeconds}`;
    };

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 4) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = ({ nativeEvent }, index) => {
        if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerifyOTP = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 5) {
            Alert.alert('Invalid OTP', 'Please enter the 5-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/auth/verify-otp`, {
                mobileNumber,
                otp: otpCode,
                name,
                hotelName
            });

            if (response.data.success) {
                login(response.data.token);
                // Once login is called, App.js navigation will automatically switch the stack if the AuthContext updates.
            } else {
                Alert.alert('Error', response.data.message || 'Invalid OTP');
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Server error, please try again later');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (timer > 0) return;

        try {
            setTimer(300);
            const response = await axios.post(`${BASE_URL}/auth/send-otp`, { mobileNumber });
            if (response.data.success) {
                Alert.alert('OTP Sent', 'A new OTP has been sent to your mobile number.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to resend OTP');
        }
    }

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
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <Text style={styles.logoText}>🔐</Text>
                            </View>
                        </View>

                        <Text style={styles.title}>Verify OTP</Text>
                        <Text style={styles.subtitle}>Enter the code sent to {mobileNumber}</Text>

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    style={styles.otpInput}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    value={digit}
                                    onChangeText={(val) => handleOtpChange(val, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    ref={(ref) => inputRefs.current[index] = ref}
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleVerifyOTP}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={['#2F7631', '#215c23']}
                                style={styles.buttonGradient}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Verify OTP</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.resendContainer}>
                            <Text style={styles.resendText}>Didn't receive the code? </Text>
                            <TouchableOpacity onPress={handleResendOTP} disabled={timer > 0}>
                                <Text style={[styles.resendLink, timer > 0 && styles.disabledLink]}>
                                    {timer > 0 ? `Resend in ${formatTime()}` : 'Resend OTP'}
                                </Text>
                            </TouchableOpacity>
                        </View>

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
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
    },
    otpInput: {
        width: 50,
        height: 60,
        borderWidth: 1,
        borderColor: '#e0ece0',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
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
    },
    resendContainer: {
        flexDirection: 'row',
        marginTop: 20,
        alignItems: 'center'
    },
    resendText: {
        color: '#6e7a6f',
        fontSize: 14,
    },
    resendLink: {
        color: '#2F7631',
        fontWeight: 'bold',
        fontSize: 14,
    },
    disabledLink: {
        color: '#A0A0A0'
    }
});

export default OTPScreen;
