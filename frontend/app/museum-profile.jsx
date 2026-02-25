import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function MuseumProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [isFavorite, setIsFavorite] = useState(false);

  // Museum data (in real app, fetch based on params.id)
  const museum = {
    id: params.id || 1,
    name: params.name || "Grand Egyptian Museum",
    price: "120 LE/ Person",
    rating: 4.6,
    image: require("../assets/images/grand-museum.png"),
    type: "Archaeological museum",
    description: "The Museum of Egyptian Antiquities, commonly known as the Egyptian Museum, located in Cairo, Egypt, houses the largest collection of Egyptian antiquities in the world. It houses over 120,000 items, with a representative amount on display.",
    hours: "07/09",
    capacity: "4/10",
    duration: "1 day",
  };

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      // Create shareable text
      const shareText = `Check out ${museum.name}!\n\nPrice: ${museum.price}\nRating: ⭐ ${museum.rating}\n\n${museum.description}\n\nDiscover more amazing museums in Egypt with Anubis app!`;
      
      // For text sharing, we need to use React Native's Share API instead
      const Share = require('react-native').Share;
      await Share.share({
        message: shareText,
        title: museum.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share museum profile');
    }
  };

  const handleFavorite = async () => {
    try {
      // Get existing favorites
      const existingFavorites = await AsyncStorage.getItem('favorites');
      let favoritesArray = existingFavorites ? JSON.parse(existingFavorites) : [];

      // Check if already in favorites
      const alreadyFavorite = favoritesArray.some(fav => fav.id === museum.id);

      if (alreadyFavorite) {
        // Remove from favorites
        favoritesArray = favoritesArray.filter(fav => fav.id !== museum.id);
        setIsFavorite(false);
        Alert.alert('Removed', 'Removed from your favorites');
      } else {
        // Add to favorites
        const favoriteItem = {
          id: museum.id,
          name: museum.name,
          price: museum.price,
          rating: museum.rating,
          type: museum.type,
          timestamp: new Date().toISOString(),
        };
        favoritesArray.push(favoriteItem);
        setIsFavorite(true);
        
        // Save to storage
        await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
        
        Alert.alert('Success', 'Added to your favorites!', [
          { text: 'View Favorites', onPress: () => router.push('/favorites') },
          { text: 'OK' }
        ]);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      Alert.alert('Error', 'Failed to add to favorites');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image
          source={museum.image}
          style={styles.museumImage}
          resizeMode="cover"
        />
        
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Text style={styles.shareIcon}>↗</Text>
        </TouchableOpacity>

        {/* Info Overlay */}
        <View style={styles.imageOverlay}>
          <Text style={styles.museumName}>{museum.name}</Text>
          <View style={styles.priceRatingContainer}>
            <Text style={styles.price}>{museum.price}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {museum.rating}</Text>
            </View>
          </View>
        </View>

        {/* Bookmark Button */}
        <TouchableOpacity 
          style={styles.bookmarkButton}
          onPress={handleFavorite}
        >
          <Text style={styles.bookmarkIcon}>{isFavorite ? '🔖' : '🔖'}</Text>
        </TouchableOpacity>
      </View>

{/* Tabs */}
<View style={styles.tabsContainer}>
  <ScrollView 
    horizontal 
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.tabsContent}
  >
    {["Overview", "Reviews", "Artifacts", "Nearby"].map((tab) => (
      <TouchableOpacity
        key={tab}
        style={[styles.tab, activeTab === tab && styles.activeTab]}
        onPress={() => {
          if (tab === "Reviews") {
            router.push("/reviews");
          } else if (tab === "Nearby") {
            router.push("/NearbyPlaces");
          } else {
            setActiveTab(tab);
          }
        }}
      >
        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
          {tab}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoText}>{museum.hours}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>👥</Text>
            <Text style={styles.infoText}>{museum.capacity}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>⏱</Text>
            <Text style={styles.infoText}>{museum.duration}</Text>
          </View>
        </View>

        {/* Museum Type */}
        <Text style={styles.museumType}>{museum.type}</Text>

        {/* Description */}
        <Text style={styles.description}>{museum.description}</Text>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Book Ticket Button */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Ticket</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8DDD0",
  },
  imageContainer: {
    width: width,
    height: 400,
    position: "relative",
  },
  museumImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  shareButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareIcon: {
    fontSize: 20,
    color: "#fff",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 80,
  },
  museumName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  priceRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  price: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ratingBadge: {
    backgroundColor: "rgba(212, 175, 55, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  bookmarkButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  bookmarkIcon: {
    fontSize: 24,
  },
  tabsContainer: {
    backgroundColor: "#E8DDD0",
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8DDD0",
  },
  tabsContent: {
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 15,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#D4AF37",
  },
  tabText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  infoCards: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 25,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
  },
  museumType: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#666",
    paddingHorizontal: 20,
  },
  bookButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#E8DDD0",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#E8DDD0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bookButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});


