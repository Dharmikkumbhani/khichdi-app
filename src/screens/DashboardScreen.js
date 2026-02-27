import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { BASE_URL } from '../config';
import { LinearGradient } from 'expo-linear-gradient';

const DashboardScreen = () => {
    const { logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/hotel/dashboard`);
                if (res.data.success) {
                    setProfile(res.data.hotel);
                }
            } catch (error) {
                console.log("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#eef6ee', '#e0ece0']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>MenuDaily Dashboard</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#2F7631" />
                    ) : profile ? (
                        <>
                            <View style={styles.profileIcon}>
                                <Text style={styles.profileIconText}>🏨</Text>
                            </View>
                            <Text style={styles.welcomeText}>Welcome Back!</Text>
                            <Text style={styles.detailText}>Mobile: {profile.mobileNumber}</Text>
                            <Text style={styles.detailText}>Role: {profile.role}</Text>
                        </>
                    ) : (
                        <Text>Failed to load profile</Text>
                    )}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0ece0',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2F7631'
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
        marginBottom: 30
    },
    profileIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#eef6ee',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileIconText: {
        fontSize: 34
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1f1a',
        marginBottom: 10,
    },
    detailText: {
        fontSize: 16,
        color: '#6e7a6f',
        marginBottom: 5,
    },
    logoutButton: {
        backgroundColor: '#ffebeb',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ffcaca'
    },
    logoutText: {
        color: '#d32f2f',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default DashboardScreen;
