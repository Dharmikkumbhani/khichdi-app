import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const AddMenuScreen = ({ navigation }) => {
    const { userToken } = useContext(AuthContext);
    const [image, setImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleUpload = async () => {
        if (!image) {
            Alert.alert('No Image', 'Please select a menu image first.');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();

        formData.append('menuImage', {
            uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
            name: 'menu.jpg',
            type: 'image/jpeg',
        });

        try {
            const response = await axios.post(`${BASE_URL}/menu/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${userToken}`,
                },
            });

            if (response.data.success) {
                Alert.alert('Success', 'Daily menu uploaded successfully!');
                navigation.goBack();
            } else {
                Alert.alert('Upload Failed', response.data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Server error while uploading');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#eef6ee', '#e0ece0']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>{'< Back'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Daily Menu</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.instruction}>Upload today's menu photo for your hotel.</Text>

                    <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
                        {image ? (
                            <Image source={{ uri: image.uri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.placeholderContainer}>
                                <Text style={styles.placeholderIcon}>📸</Text>
                                <Text style={styles.placeholderText}>Tap to select an image</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.uploadButton, !image && styles.disabledButton]}
                        onPress={handleUpload}
                        disabled={!image || isUploading}
                    >
                        <LinearGradient
                            colors={!image ? ['#A0A0A0', '#A0A0A0'] : ['#2F7631', '#215c23']}
                            style={styles.buttonGradient}
                        >
                            {isUploading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.uploadText}>Upload Menu</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0ece0',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    backButton: { width: 60, padding: 5 },
    backText: { color: '#2F7631', fontWeight: 'bold', fontSize: 16 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1f1a' },
    content: { flex: 1, padding: 20, justifyContent: 'center' },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    instruction: { fontSize: 15, color: '#6e7a6f', marginBottom: 20, textAlign: 'center' },
    imageSelector: {
        width: '100%',
        height: 300,
        borderRadius: 16,
        backgroundColor: '#f9fcf9',
        borderWidth: 2,
        borderColor: '#e0ece0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        overflow: 'hidden'
    },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    placeholderContainer: { alignItems: 'center' },
    placeholderIcon: { fontSize: 40, marginBottom: 10 },
    placeholderText: { color: '#A0A0A0', fontWeight: 'bold' },
    uploadButton: { width: '100%', borderRadius: 12, overflow: 'hidden' },
    disabledButton: { opacity: 0.7 },
    buttonGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    uploadText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default AddMenuScreen;
