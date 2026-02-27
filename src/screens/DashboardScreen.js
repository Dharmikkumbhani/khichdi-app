import React, { useContext, useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
    Image, Alert, ScrollView, Platform, TextInput
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { BASE_URL } from '../config';
import { LinearGradient } from 'expo-linear-gradient';

const DashboardScreen = () => {
    const { logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [menuHistory, setMenuHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [note, setNote] = useState('');

    useEffect(() => {
        fetchProfile();
        fetchMenuHistory();
    }, []);

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

    const fetchMenuHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/menu/history`);
            if (res.data.success) {
                setMenuHistory(res.data.menus);
            }
        } catch (error) {
            console.log("Error fetching menu history", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions to upload menu photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setSelectedImage(result.assets[0]);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera permissions to take menu photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setSelectedImage(result.assets[0]);
        }
    };

    const uploadMenu = async () => {
        if (!selectedImage) {
            Alert.alert('No image', 'Please select or take a photo of today\'s menu first.');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            const uri = selectedImage.uri;
            const filename = uri.split('/').pop();
            const ext = filename.split('.').pop();
            const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

            formData.append('menuImage', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                name: filename,
                type: type,
            });

            if (note.trim()) {
                formData.append('note', note.trim());
            }

            const res = await axios.post(`${BASE_URL}/menu/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                Alert.alert('Success! 🎉', 'Today\'s menu has been uploaded successfully! It will now appear on the website.');
                setSelectedImage(null);
                setNote('');
                fetchMenuHistory(); // Refresh history
            }
        } catch (error) {
            console.log("Upload error:", error);
            Alert.alert('Upload Failed', error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#eef6ee', '#e0ece0']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>🍽️ Khichdi Dashboard</Text>
                {profile && (
                    <Text style={styles.headerSub}>{profile.hotelName || profile.name || 'My Hotel'}</Text>
                )}
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Profile Card */}
                <View style={styles.card}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#2F7631" />
                    ) : profile ? (
                        <>
                            <View style={styles.profileIcon}>
                                <Text style={styles.profileIconText}>🏨</Text>
                            </View>
                            <Text style={styles.welcomeText}>Welcome Back!</Text>
                            <Text style={styles.detailText}>📱 {profile.mobileNumber}</Text>
                            {profile.hotelName && (
                                <Text style={styles.detailText}>🏷️ {profile.hotelName}</Text>
                            )}
                        </>
                    ) : (
                        <Text>Failed to load profile</Text>
                    )}
                </View>

                {/* Upload Menu Section */}
                <View style={styles.uploadSection}>
                    <Text style={styles.sectionTitle}>📸 Upload Today's Menu</Text>
                    <Text style={styles.sectionSub}>Take or pick a photo of your daily menu</Text>

                    <View style={styles.imagePickerRow}>
                        <TouchableOpacity style={styles.pickButton} onPress={takePhoto}>
                            <Text style={styles.pickButtonText}>📷 Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
                            <Text style={styles.pickButtonText}>🖼️ Gallery</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedImage && (
                        <View style={styles.previewContainer}>
                            <Image
                                source={{ uri: selectedImage.uri }}
                                style={styles.previewImage}
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                style={styles.removeImageBtn}
                                onPress={() => setSelectedImage(null)}
                            >
                                <Text style={styles.removeImageText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TextInput
                        style={styles.noteInput}
                        placeholder="Add a note (e.g. Today's special: Paneer Thali) 📝"
                        placeholderTextColor="#9ca3af"
                        value={note}
                        onChangeText={setNote}
                        multiline
                        maxLength={200}
                    />

                    <TouchableOpacity
                        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                        onPress={uploadMenu}
                        disabled={uploading || !selectedImage}
                    >
                        {uploading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.uploadButtonText}>
                                {selectedImage ? '🚀 Upload Menu' : 'Select an image first'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Menu History */}
                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>📋 Recent Uploads</Text>
                    {historyLoading ? (
                        <ActivityIndicator color="#2F7631" style={{ marginTop: 16 }} />
                    ) : menuHistory.length === 0 ? (
                        <Text style={styles.emptyText}>No menus uploaded yet. Upload your first menu above! 👆</Text>
                    ) : (
                        menuHistory.slice(0, 5).map((menu, idx) => (
                            <View key={menu._id || idx} style={styles.historyItem}>
                                <Image
                                    source={{ uri: menu.imageUrl }}
                                    style={styles.historyThumb}
                                    resizeMode="cover"
                                />
                                <View style={styles.historyInfo}>
                                    <Text style={styles.historyDate}>
                                        {new Date(menu.date).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </Text>
                                    {menu.note ? (
                                        <Text style={styles.historyNote} numberOfLines={1}>{menu.note}</Text>
                                    ) : (
                                        <Text style={styles.historyTime}>
                                            {new Date(menu.date).toLocaleTimeString('en-IN', {
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
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
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0ece0',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2F7631'
    },
    headerSub: {
        fontSize: 14,
        color: '#6e7a6f',
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
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
        marginBottom: 20,
    },
    profileIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#eef6ee',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileIconText: {
        fontSize: 30
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1f1a',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 15,
        color: '#6e7a6f',
        marginBottom: 4,
    },
    uploadSection: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1f1a',
        marginBottom: 4,
    },
    sectionSub: {
        fontSize: 13,
        color: '#9ca3af',
        marginBottom: 16,
    },
    imagePickerRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    pickButton: {
        flex: 1,
        backgroundColor: '#eef6ee',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#d5ecd5',
    },
    pickButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2F7631',
    },
    previewContainer: {
        position: 'relative',
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: 220,
        borderRadius: 16,
    },
    removeImageBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    uploadButton: {
        backgroundColor: '#2F7631',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    uploadButtonDisabled: {
        opacity: 0.5,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    historySection: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 22,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    historyThumb: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    historyInfo: {
        marginLeft: 14,
        flex: 1,
    },
    historyDate: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1f1a',
    },
    historyTime: {
        fontSize: 13,
        color: '#9ca3af',
        marginTop: 2,
    },
    historyNote: {
        fontSize: 13,
        color: '#2F7631',
        marginTop: 2,
        fontWeight: '500',
    },
    noteInput: {
        backgroundColor: '#f8faf8',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#d5ecd5',
        padding: 14,
        fontSize: 14,
        color: '#1a1f1a',
        marginBottom: 16,
        minHeight: 50,
        textAlignVertical: 'top',
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
