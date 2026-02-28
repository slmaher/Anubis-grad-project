import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
const { width } = Dimensions.get('window');

export default function ScanResult() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const photoUri = params.photoUri;
  const [isSaved, setIsSaved] = useState(false);

  const handleBack = () => {
    // Go back to scan screen
    router.push("/(tabs)/scan");
  };

const handleSave = async () => {
  try {
    if (!photoUri) {
      Alert.alert('Error', 'No image to save');
      return;
    }

    // Request permissions properly
    const permission = await MediaLibrary.requestPermissionsAsync(true);

    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow media access in your device settings'
      );
      return;
    }

    // Save directly to gallery
    await MediaLibrary.saveToLibraryAsync(photoUri);

    setIsSaved(true);
    Alert.alert('Success', 'Image saved to gallery!');

  } catch (error) {
    console.log('Save error:', error);
    Alert.alert('Error', 'Failed to save image');
  }
};

  const handleShare = async () => {
    try {
      if (!photoUri) {
        Alert.alert('Error', 'No image to share');
        return;
      }

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      // Share the image
      await Sharing.shareAsync(photoUri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share your artifact discovery',
      });
    } catch (error) {
      console.error('Error sharing image:', error);
      Alert.alert('Error', 'Failed to share image');
    }
  };

  const handleAddToJourney = async () => {
    try {
      if (!photoUri) {
        Alert.alert('Error', 'No image to add');
        return;
      }

      // Get existing journey items
      const existingJourney = await AsyncStorage.getItem('journey');
      let journeyItems = existingJourney ? JSON.parse(existingJourney) : [];

      // Create new journey item
      const newItem = {
        id: Date.now().toString(),
        uri: photoUri,
        timestamp: new Date().toISOString(),
        name: `Artifact ${journeyItems.length + 1}`,
      };

      // Add to journey
      journeyItems.push(newItem);
      await AsyncStorage.setItem('journey', JSON.stringify(journeyItems));

      Alert.alert('Success', 'Added to your journey!', [
        { text: 'View Journey', onPress: () => router.push('/journey') },
        { text: 'OK' }
      ]);
    } catch (error) {
      console.error('Error adding to journey:', error);
      Alert.alert('Error', 'Failed to add to journey');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Artifact picture</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Artifact Image Container */}
        <View style={styles.imageContainer}>
          {/* Display captured photo or placeholder */}
          <View style={styles.artifactImage}>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={styles.capturedImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.artifactPlaceholder}>
                <Text style={styles.artifactIcon}>👑</Text>
                <Text style={styles.artifactName}>Nefertiti Bust</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleSave}
          >
            <View style={[styles.actionIcon, isSaved && styles.savedIcon]}>
              <Text style={styles.actionEmoji}>{isSaved ? '✅' : '💾'}</Text>
            </View>
            <Text style={styles.actionLabel}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>↗️</Text>
            </View>
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAddToJourney}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>➕</Text>
            </View>
            <Text style={styles.actionLabel}>Add to Journey</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8DDD0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#E8DDD0",
    borderBottomWidth: 1,
    borderBottomColor: "#E8DDD0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: "#000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: "center",
  },
  artifactImage: {
    width: width - 40,
    height: (width - 40) * 1.3,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1a2332",
  },
  capturedImage: {
    width: "100%",
    height: "100%",
  },
  artifactPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a1929",
  },
  artifactIcon: {
    fontSize: 120,
    marginBottom: 20,
  },
  artifactName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 40,
    paddingVertical: 30,
    paddingBottom: 60,
  },
  actionButton: {
    alignItems: "center",
    gap: 10,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  savedIcon: {
    backgroundColor: "#D4AF37",
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
});




