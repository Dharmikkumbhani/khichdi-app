import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Platform, Dimensions, StatusBar, TextInput, ScrollView, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AddMenuScreen = ({ navigation }) => {
    const { userToken } = useContext(AuthContext);
    const [image, setImage] = useState(null);
    const [note, setNote] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
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
        formData.append('note', note);

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

    const getTodayDate = () => {
        const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#f8fdf8" />
            <LinearGradient
                colors={['#f8fdf8', '#eaf2ea']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upload Menu</Text>
                <View style={styles.headerSpace} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.infoContainer}>
                        <Text style={styles.titleText}>Today's Special</Text>
                        <Text style={styles.dateText}>{getTodayDate()}</Text>
                        <Text style={styles.subtitleText}>Upload a clear photo of your daily menu to update your customers.</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.imageCard}
                        onPress={pickImage}
                        activeOpacity={0.9}
                    >
                        {image ? (
                            <>
                                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                                    style={styles.imageOverlay}
                                >
                                    <View style={styles.badgeContainer}>
                                        <Text style={styles.badgeText}>Ready to upload</Text>
                                    </View>
                                    <Text style={styles.overlayDate}>{getTodayDate()}</Text>
                                </LinearGradient>
                                <View style={styles.changeImageBtn}>
                                    <Text style={styles.changeImageText}>✎ Change Photo</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.placeholderContainer}>
                                <View style={styles.iconCircle}>
                                    <Text style={styles.placeholderIcon}>📸</Text>
                                </View>
                                <Text style={styles.placeholderTitle}>Tap to select photo</Text>
                                <Text style={styles.placeholderSubtitle}>Supports JPG, PNG</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Add a Note (Optional)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. Special discounts today, or unavailable items..."
                            placeholderTextColor="#a9c2aa"
                            value={note}
                            onChangeText={setNote}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.uploadButtonWrapper, (!image || isUploading) && styles.disabledButton]}
                        onPress={handleUpload}
                        disabled={!image || isUploading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={!image ? ['#c8d6c8', '#b5c5b5'] : ['#2F7631', '#1f5922']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            {isUploading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.uploadIcon}>↑</Text>
                                    <Text style={styles.uploadText}>Publish Menu</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    backIcon: {
        color: '#1a1f1a',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: -3,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a1f1a',
        letterSpacing: -0.5,
    },
    headerSpace: {
        width: 44,
    },
    content: {
        paddingHorizontal: 24,
    },
    infoContainer: {
        marginTop: 10,
        marginBottom: 20,
    },
    titleText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1a1f1a',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    dateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2F7631',
        marginBottom: 12,
    },
    subtitleText: {
        fontSize: 15,
        color: '#6e7a6f',
        lineHeight: 22,
    },
    imageCard: {
        width: '100%',
        height: width * 1.1,
        borderRadius: 24,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e0ece0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
    overlayDate: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '700',
    },
    changeImageBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    changeImageText: {
        color: '#1a1f1a',
        fontSize: 13,
        fontWeight: '700',
    },
    placeholderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f8f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    placeholderIcon: {
        fontSize: 36,
    },
    placeholderTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1f1a',
        marginBottom: 8,
    },
    placeholderSubtitle: {
        fontSize: 14,
        color: '#6e7a6f',
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1f1a',
        marginBottom: 8,
        marginLeft: 4,
    },
    textInput: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e0ece0',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1a1f1a',
        minHeight: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    uploadButtonWrapper: {
        width: '100%',
        marginBottom: 40,
    },
    disabledButton: {
        opacity: 0.9,
    },
    buttonGradient: {
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
    uploadIcon: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 8,
        marginTop: -3,
    },
    uploadText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    }
});

export default AddMenuScreen;
