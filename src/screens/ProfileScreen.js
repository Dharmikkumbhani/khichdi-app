import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, Alert, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from '../config';

const ProfileScreen = ({ navigation }) => {
    const [hotelName, setHotelName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [photos, setPhotos] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/hotel/dashboard`);
            if (res.data.success && res.data.hotel) {
                const h = res.data.hotel;
                setHotelName(h.hotelName || '');
                setPrice(h.price ? h.price.toString() : '');
                setDescription(h.description || '');
                setAddress(h.address || '');
                setLatitude(h.latitude ? h.latitude.toString() : '');
                setLongitude(h.longitude ? h.longitude.toString() : '');
                if (h.photos && h.photos.length > 0) {
                    setPhotos(h.photos);
                } else if (h.imageUrl) {
                    setPhotos([h.imageUrl]);
                }
            }
        } catch (error) {
            console.log("Error fetching profile", error);
            Alert.alert("Error", "Could not load profile data.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePickAndUploadImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5,
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            uploadImages(result.assets);
        }
    };

    const uploadImages = async (assets) => {
        setIsUploadingPhoto(true);
        try {
            const formData = new FormData();
            assets.forEach((asset, index) => {
                formData.append('hotelImages', {
                    uri: asset.uri,
                    name: `hotel_${Date.now()}_${index}.jpg`,
                    type: 'image/jpeg',
                });
            });

            const res = await axios.post(`${BASE_URL}/hotel/upload-photos`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.data.success) {
                setPhotos(res.data.photos);
                Alert.alert("Success", "Hotel photos updated successfully!");
            } else {
                Alert.alert("Error", res.data.message || "Failed to upload photos");
            }
        } catch (error) {
            console.log("Upload error:", error);
            Alert.alert("Error", "Could not upload the photos. Please try again.");
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleDeletePhoto = async (photoUrl) => {
        Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        const res = await axios.delete(`${BASE_URL}/hotel/photo`, {
                            data: { photoUrl }
                        });
                        if (res.data.success) {
                            setPhotos(res.data.photos);
                            Alert.alert("Success", "Photo deleted!");
                        } else {
                            Alert.alert("Error", res.data.message || "Failed to delete photo");
                        }
                    } catch (error) {
                        Alert.alert("Error", "Could not delete photo.");
                    }
                }
            }
        ]);
    };

    const handleGetLocation = async () => {
        setIsFetchingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                setIsFetchingLocation(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const lat = location.coords.latitude;
            const lon = location.coords.longitude;
            setLatitude(lat.toString());
            setLongitude(lon.toString());

            // Reverse geocode to get human-readable address
            let geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
            if (geocode && geocode.length > 0) {
                const addressDetails = geocode[0];
                const parts = [
                    addressDetails.name,
                    addressDetails.street,
                    addressDetails.city,
                    addressDetails.region,
                    addressDetails.postalCode,
                    addressDetails.country
                ].filter(Boolean);

                setAddress(parts.join(', '));
            }

            Alert.alert("Success", "Location and address captured successfully!");
        } catch (error) {
            console.log("Error getting location: ", error);
            Alert.alert('Error', 'Could not fetch your current location. Please ensure location services are enabled.');
        } finally {
            setIsFetchingLocation(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                hotelName,
                description,
                address,
            };
            if (price) payload.price = parseFloat(price);
            if (latitude) payload.latitude = parseFloat(latitude);
            if (longitude) payload.longitude = parseFloat(longitude);

            const res = await axios.put(`${BASE_URL}/hotel/profile`, payload);

            if (res.data.success) {
                Alert.alert("Success", "Profile updated successfully!", [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Error", "Failed to update profile.");
            }
        } catch (error) {
            console.log("Error updating profile", error);
            Alert.alert("Error", "An error occurred while saving profile.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fdf8" />
            <LinearGradient
                colors={['#f8fdf8', '#eaf2ea']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hotel Profile</Text>
                <View style={{ width: 60 }} />
            </View>

            {isLoading ? (
                <View style={[styles.centerContent, { flex: 1 }]}>
                    <ActivityIndicator size="large" color="#2F7631" />
                    <Text style={styles.loadingText}>Loading Profile...</Text>
                </View>
            ) : (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.card}>

                            <View style={styles.inputContainer}>
                                <Text style={styles.sectionTitle}>🖼️ Hotel Image Gallery</Text>
                                <Text style={styles.sectionSubtitle}>Upload multiple photos to showcase your hotel</Text>
                                <View style={styles.photoUploadContainer}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 10, paddingRight: 20 }}>
                                        {photos.map((photo, index) => (
                                            <View key={index} style={styles.photoWrapper}>
                                                <Image source={{ uri: photo }} style={styles.profileImage} />
                                                <TouchableOpacity
                                                    style={styles.photoDeleteBadge}
                                                    onPress={() => handleDeletePhoto(photo)}>
                                                    <Text style={styles.photoDeleteText}>✕</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}

                                        <TouchableOpacity onPress={handlePickAndUploadImage} style={[styles.photoWrapper, styles.addPhotoWrapper]} disabled={isUploadingPhoto}>
                                            {isUploadingPhoto ? (
                                                <ActivityIndicator size="large" color="#2F7631" />
                                            ) : (
                                                <View style={styles.photoPlaceholder}>
                                                    <Text style={styles.photoPlaceholderIcon}>➕</Text>
                                                    <Text style={styles.photoPlaceholderText}>Add Photos</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    </ScrollView>
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Hotel Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Grand Plaza"
                                    value={hotelName}
                                    onChangeText={setHotelName}
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Starting Price (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 70"
                                    keyboardType="numeric"
                                    value={price}
                                    onChangeText={setPrice}
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Describe your Hotel/Mess..."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Address</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Full address of the Hotel"
                                    value={address}
                                    onChangeText={setAddress}
                                    multiline
                                    numberOfLines={2}
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.label}>Latitude</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 22.5645"
                                        keyboardType="numeric"
                                        value={latitude}
                                        onChangeText={setLatitude}
                                        placeholderTextColor="#A0A0A0"
                                    />
                                </View>
                                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.label}>Longitude</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 72.9284"
                                        keyboardType="numeric"
                                        value={longitude}
                                        onChangeText={setLongitude}
                                        placeholderTextColor="#A0A0A0"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.locationButton}
                                onPress={handleGetLocation}
                                disabled={isFetchingLocation}
                            >
                                <Text style={styles.locationButtonText}>
                                    {isFetchingLocation ? 'Fetching...' : '📍 Use Current Location'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleSave}
                                disabled={isSaving}
                            >
                                <LinearGradient
                                    colors={['#2F7631', '#215c23']}
                                    style={styles.buttonGradient}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Save Profile</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        zIndex: 10,
    },
    backButton: {
        padding: 5,
        width: 60,
    },
    backText: {
        fontSize: 16,
        color: '#2F7631',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1f1a',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
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
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
        marginBottom: 40,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1f1a',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#166534',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 12,
    },
    photoUploadContainer: {
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    photoWrapper: {
        width: 140,
        height: 100,
        borderRadius: 16,
        backgroundColor: '#f1f8f1',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0ece0',
        overflow: 'visible', // allows the edit badge to bleed outside a bit if needed
    },
    addPhotoWrapper: {
        borderStyle: 'dashed',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
    },
    photoDeleteBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#dc2626',
        borderRadius: 14,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    photoDeleteText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    photoPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoPlaceholderIcon: {
        fontSize: 28,
        marginBottom: 4,
    },
    photoPlaceholderText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2F7631',
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
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        fontSize: 16,
        fontWeight: '700',
    },
    locationButton: {
        backgroundColor: '#eef6ee',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#cce6cc',
    },
    locationButtonText: {
        color: '#2F7631',
        fontSize: 14,
        fontWeight: '600',
    }
});

export default ProfileScreen;
