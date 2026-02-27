import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView, Dimensions, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { BASE_URL } from '../config';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
    const { logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [latestMenu, setLatestMenu] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshDashboard = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/hotel/dashboard`);
            if (res.data.success) {
                setProfile(res.data.hotel);
            }

            const menuRes = await axios.get(`${BASE_URL}/menu/history`);
            if (menuRes.data.success && menuRes.data.menus.length > 0) {
                setLatestMenu(menuRes.data.menus[0]);
                setHistory(menuRes.data.menus.slice(1, 6)); // get next 5
            } else {
                setLatestMenu(null);
                setHistory([]);
            }
        } catch (error) {
            console.log("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshDashboard();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            refreshDashboard();
        });
        return unsubscribe;
    }, [navigation]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fdf8" />
            <LinearGradient
                colors={['#f8fdf8', '#eaf2ea']}
                style={StyleSheet.absoluteFillObject}
            />

            {loading && !profile ? (
                <View style={[styles.centerContent, { flex: 1 }]}>
                    <ActivityIndicator size="large" color="#2F7631" />
                    <Text style={styles.loadingText}>Loading Dashboard...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header Section */}
                    {profile && (
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.greeting}>{getGreeting()},</Text>
                                <Text style={styles.hotelName}>{profile.hotelName || 'My Hotel'}</Text>
                            </View>
                            <TouchableOpacity style={styles.profileIcon} onPress={logout}>
                                <Text style={styles.profileIconText}>{profile.hotelName ? profile.hotelName.charAt(0).toUpperCase() : 'H'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Today's Menu Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today's Menu</Text>
                        <TouchableOpacity onPress={refreshDashboard}>
                            <Text style={styles.refreshText}>↻ Refresh</Text>
                        </TouchableOpacity>
                    </View>

                    {latestMenu ? (
                        <View style={styles.menuCardWrapper}>
                            <View style={styles.menuCard}>
                                <Image
                                    source={{ uri: latestMenu.imageUrl }}
                                    style={styles.mainMenuImage}
                                    resizeMode="cover"
                                />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                                    style={styles.imageOverlay}
                                >
                                    <View style={styles.badgeContainer}>
                                        <Text style={styles.badgeText}>Active</Text>
                                    </View>
                                    <Text style={styles.menuDateText}>{formatDate(latestMenu.date || latestMenu.createdAt) || 'Today'}</Text>
                                </LinearGradient>
                            </View>

                            {latestMenu.note && latestMenu.note.trim() !== '' && (
                                <View style={styles.noteCard}>
                                    <Text style={styles.noteIcon}>📌</Text>
                                    <View style={styles.noteContentWrapper}>
                                        <Text style={styles.noteLabel}>Note from Hotel</Text>
                                        <Text style={styles.noteText}>{latestMenu.note}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.emptyStateCard}>
                            <View style={styles.emptyIconContainer}>
                                <Text style={styles.emptyIcon}>🍽️</Text>
                            </View>
                            <Text style={styles.emptyTitle}>No Menu Displayed</Text>
                            <Text style={styles.emptySubtitle}>Upload your today's menu to show it to your customers</Text>
                        </View>
                    )}

                    {/* Action Button */}
                    <TouchableOpacity
                        style={styles.addButtonWrapper}
                        onPress={() => navigation.navigate('AddMenu')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#2F7631', '#1f5922']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.addButton}
                        >
                            <Text style={styles.addButtonIcon}>+</Text>
                            <Text style={styles.addButtonText}>Upload New Menu</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Past Menus */}
                    {history && history.length > 0 && (
                        <View style={styles.historySection}>
                            <Text style={styles.sectionTitle}>Previous Menus</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyScroll}>
                                {history.map((menu, index) => (
                                    <View key={index} style={styles.historyCard}>
                                        <Image
                                            source={{ uri: menu.imageUrl }}
                                            style={styles.historyImage}
                                            resizeMode="cover"
                                        />
                                        <Text style={styles.historyDate}>{formatDate(menu.date || menu.createdAt)}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Logout */}
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Text style={styles.logoutText}>Sign Out</Text>
                    </TouchableOpacity>

                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingTop: 60,
        paddingBottom: 40,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#2F7631',
        fontSize: 16,
        fontWeight: '500'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 30,
    },
    greeting: {
        fontSize: 14,
        color: '#6e7a6f',
        marginBottom: 4,
        fontWeight: '500',
    },
    hotelName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1a1f1a',
        letterSpacing: -0.5,
    },
    profileIcon: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#d6edd7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#2F7631',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    profileIconText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2F7631',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1f1a',
    },
    refreshText: {
        fontSize: 14,
        color: '#2F7631',
        fontWeight: '600',
    },
    menuCardWrapper: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    menuCard: {
        width: '100%',
        height: width * 1.1,
        borderRadius: 24,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
        overflow: 'hidden',
    },
    mainMenuImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        justifyContent: 'flex-end',
        padding: 20,
    },
    badgeContainer: {
        backgroundColor: '#4caf50',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuDateText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '700',
    },
    noteCard: {
        flexDirection: 'row',
        backgroundColor: '#f8fdf8',
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#e0ece0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    noteIcon: {
        fontSize: 22,
        marginRight: 12,
        marginTop: 2,
    },
    noteContentWrapper: {
        flex: 1,
    },
    noteLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2F7631',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    noteText: {
        fontSize: 15,
        color: '#4a554b',
        lineHeight: 22,
    },
    emptyStateCard: {
        marginHorizontal: 24,
        height: 240,
        backgroundColor: '#fff',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        borderWidth: 1,
        borderColor: '#e0ece0',
        borderStyle: 'dashed',
        marginBottom: 24,
    },
    emptyIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#f1f8f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyIcon: {
        fontSize: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1f1a',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6e7a6f',
        textAlign: 'center',
        lineHeight: 20,
    },
    addButtonWrapper: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    addButton: {
        flexDirection: 'row',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2F7631',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    addButtonIcon: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '300',
        marginRight: 8,
        marginTop: -2,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    historySection: {
        marginBottom: 24,
    },
    historyScroll: {
        paddingLeft: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    historyCard: {
        width: 120,
        marginRight: 16,
    },
    historyImage: {
        width: '100%',
        height: 160,
        borderRadius: 16,
        marginBottom: 8,
        backgroundColor: '#f1f8f1',
    },
    historyDate: {
        fontSize: 13,
        color: '#6e7a6f',
        fontWeight: '600',
        textAlign: 'center',
    },
    logoutButton: {
        marginHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ffebeb',
        marginBottom: 20,
    },
    logoutText: {
        color: '#d32f2f',
        fontSize: 15,
        fontWeight: '700',
    }
});

export default DashboardScreen;
