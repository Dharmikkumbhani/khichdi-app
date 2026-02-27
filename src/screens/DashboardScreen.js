import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { BASE_URL } from '../config';
import { LinearGradient } from 'expo-linear-gradient';

const DashboardScreen = ({ navigation }) => {
    const { logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [latestMenu, setLatestMenu] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch profile
                const res = await axios.get(`${BASE_URL}/hotel/dashboard`);
                if (res.data.success) {
                    setProfile(res.data.hotel);
                }

                // Fetch latest menu
                const menuRes = await axios.get(`${BASE_URL}/menu/history`);
                if (menuRes.data.success && menuRes.data.menus.length > 0) {
                    setLatestMenu(menuRes.data.menus[0]);
                }
            } catch (error) {
                console.log("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const refreshDashboard = async () => {
        setLoading(true);
        try {
            const menuRes = await axios.get(`${BASE_URL}/menu/history`);
            if (menuRes.data.success && menuRes.data.menus.length > 0) {
                setLatestMenu(menuRes.data.menus[0]);
            }
        } catch (error) {
            console.log("Error refreshing menu", error);
        } finally {
            setLoading(false);
        }
    }

    // refresh when focused
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            refreshDashboard();
        });
        return unsubscribe;
    }, [navigation]);

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
                    {loading && !profile ? (
                        <ActivityIndicator size="large" color="#2F7631" />
                    ) : profile ? (
                        <>
                            <View style={styles.profileIcon}>
                                <Text style={styles.profileIconText}>🏨</Text>
                            </View>
                            <Text style={styles.welcomeText}>Welcome {profile.name || 'Back'}!</Text>
                            <Text style={styles.detailText}>{profile.hotelName || 'My Hotel'}</Text>
                            <Text style={styles.detailText}>Mobile: {profile.mobileNumber}</Text>

                            {latestMenu && (
                                <View style={styles.latestMenuContainer}>
                                    <Text style={styles.menuTitle}>Today's Menu</Text>
                                    <View style={styles.menuImageContainer}>
                                        <Image
                                            source={{ uri: latestMenu.imageUrl }}
                                            style={styles.menuImage}
                                            resizeMode="cover"
                                        />
                                    </View>
                                </View>
                            )}
                        </>
                    ) : (
                        <Text>Failed to load profile</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddMenu')}
                >
                    <LinearGradient
                        colors={['#2F7631', '#215c23']}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.addText}>+ Add Daily Menu Photo</Text>
                    </LinearGradient>
                </TouchableOpacity>

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
    latestMenuContainer: {
        marginTop: 20,
        alignItems: 'center',
        width: '100%'
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2F7631',
        marginBottom: 10
    },
    menuImageContainer: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e0ece0'
    },
    menuImage: {
        width: '100%',
        height: '100%'
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
    },
    addButton: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 15
    },
    buttonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default DashboardScreen;
