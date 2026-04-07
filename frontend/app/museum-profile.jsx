import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, Dimensions, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

const { width, height } = Dimensions.get('window');

const MUSEUM_LOCAL_IMAGES = [
  require("../assets/images/Grand-Egyptian-Museum.png"),
  require("../assets/images/The-Grand-Egyptian-Museum.png"),
  require("../assets/images/Egyptian-Museum-Explore-Screen.png"),
  require("../assets/images/The-National-Museum-Of-Egypt.png"),
  require("../assets/images/egyptian-museum-interior.jpg"),
  require("../assets/images/Museum-of-Islamic-Art.jpg"),
  require("../assets/images/Coptic-Museum.jpg"),
  require("../assets/images/Egyptian-Civilization.jpg"),
  require("../assets/images/grand-museum.png"),
  require("../assets/images/Grand-Museum-Profile.png"),
  require("../assets/images/grand-museum-night.webp"),
  require("../assets/images/egyptian-museum.png"),
];

const MUSEUM_NAME_TO_IMAGE = {
  "Grand Egyptian Museum": MUSEUM_LOCAL_IMAGES[0],
  "The Grand Egyptian Museum": MUSEUM_LOCAL_IMAGES[1],
  "Egyptian Museum": MUSEUM_LOCAL_IMAGES[2],
  "The Egyptian Museum": MUSEUM_LOCAL_IMAGES[2],
  "National Museum of Egyptian Civilization": MUSEUM_LOCAL_IMAGES[3],
  "The National Museum of Egypt": MUSEUM_LOCAL_IMAGES[3],
  "Museum of Islamic Art, Cairo": MUSEUM_LOCAL_IMAGES[5],
  "Museum of Islamic Art": MUSEUM_LOCAL_IMAGES[5],
  "Coptic Museum": MUSEUM_LOCAL_IMAGES[6],
  "Agricultural Museum": MUSEUM_LOCAL_IMAGES[4],
  "Mukhtar Museum": MUSEUM_LOCAL_IMAGES[7],
  "Sadat Museum": MUSEUM_LOCAL_IMAGES[8],
  "Sharm El Sheikh Museum": MUSEUM_LOCAL_IMAGES[9],
  "Hurghada Museum": MUSEUM_LOCAL_IMAGES[10],
  "Museum of Tal Basta Antiquities": MUSEUM_LOCAL_IMAGES[11],
  "Al-Muizz Street (Historic Open‑Air Museum)": MUSEUM_LOCAL_IMAGES[1],
  "Beit Al‑Suhaymi": MUSEUM_LOCAL_IMAGES[2],
  "Qasr Samihah Kamel (Samihah Kamel Palace)": MUSEUM_LOCAL_IMAGES[0],
};

function getLocalImageForMuseum(name) {
  const trimmed = name?.trim?.();
  if (trimmed && MUSEUM_NAME_TO_IMAGE[trimmed]) return MUSEUM_NAME_TO_IMAGE[trimmed];
  const index = (trimmed || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return MUSEUM_LOCAL_IMAGES[Math.abs(index) % MUSEUM_LOCAL_IMAGES.length];
}

export default function MuseumProfile() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Museum data
  const museum = {
    id: params.id,
    name: params.name || "Grand Egyptian Museum",
    price: "120 LE/ Person",
    rating: 4.6,
    imageUrl: params.imageUrl,
    type: "Archaeological museum",
    description:
      params.description ||
      "The Museum of Egyptian Antiquities, commonly known as the Egyptian Museum, located in Cairo, Egypt, houses the largest collection of Egyptian antiquities in the world. It houses over 120,000 items, with a representative amount on display.",
    hours: params.hours || "07/09",
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

      const shareText = `Check out ${museum.name}!\n\nPrice: ${museum.price}\nRating: ⭐ ${museum.rating}\n\n${museum.description}\n\nDiscover more amazing museums in Egypt with Anubis app!`;
      
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
      const existingFavorites = await AsyncStorage.getItem('favorites');
      let favoritesArray = existingFavorites ? JSON.parse(existingFavorites) : [];

      const alreadyFavorite = favoritesArray.some(fav => fav.id === museum.id);

      if (alreadyFavorite) {
        favoritesArray = favoritesArray.filter(fav => fav.id !== museum.id);
        setIsFavorite(false);
        Alert.alert('Removed', 'Removed from your favorites');
      } else {
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
    <ImageBackground
      source={require("../assets/images/beige-background.jpeg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              museum.imageUrl && !imageError
                ? { uri: museum.imageUrl }
                : getLocalImageForMuseum(museum.name)
            }
            style={styles.museumImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
          
          {/* Shadow Layer under image */}
          <View style={styles.imageShadow} />
          
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>{t("common.back_arrow")}</Text>
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

          {/* Bookmark Button with Glassy Bubble */}
          <View style={styles.bookmarkContainer}>
            <View style={styles.bookmarkBubble} />
            <TouchableOpacity 
              style={styles.bookmarkButton}
              onPress={handleFavorite}
            >
              <FontAwesome6 
                name={isFavorite ? "bookmark" : "bookmark"} 
                size={24} 
                color="#333" 
              />
            </TouchableOpacity>
          </View>
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
                style={styles.tab}
                onPress={() => {
                  if (tab === "Reviews") {
                    router.push({
                      pathname: "/reviews",
                      params: {
                        museumId: museum.id,
                        museumName: museum.name,
                      },
                    });
                  } else if (tab === "Artifacts") {
                    // Navigate to Artifacts Screen
                    router.push({
                      pathname: "/artifacts",
                      params: {
                        museumId: museum.id,
                        museumName: museum.name,
                      },
                    });
                  } else if (tab === "Nearby") {
                    router.push("/NearbyPlaces");
                  } else {
                    setActiveTab(tab);
                  }
                }}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {t(`museum.tabs.${tab.toLowerCase()}`)}
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
              <MaterialIcons name="date-range" size={20} color="#666" />
              <Text style={styles.infoText}>{museum.hours}</Text>
            </View>
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="account-group" size={20} color="#666" />
              <Text style={styles.infoText}>{museum.capacity}</Text>
            </View>
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="clock" size={20} color="#666" />
              <Text style={styles.infoText}>{museum.duration}</Text>
            </View>
          </View>

          {/* Museum Type */}
          <Text style={styles.museumType}>{museum.type}</Text>

          {/* Description */}
          <Text style={styles.description}>{museum.description}</Text>

          <View style={{ height: 180 }} />
        </ScrollView>

        {/* Book Ticket Button */}
        <View style={styles.bookButtonContainer}>
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>{t("museum.book_ticket")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  imageContainer: {
    width: width,
    height: height * 0.55,
    position: "relative",
    marginBottom: 15,
  },
  museumImage: {
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  imageShadow: {
    position: "absolute",
    bottom: -15,
    left: 20,
    right: 20,
    height: 30,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
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
    right: 100,
  },
  museumName: {
    fontSize: 24,
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
    backgroundColor: "transparent",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
  bookmarkContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  bookmarkBubble: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
  },
  bookmarkButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  tabsContainer: {
    backgroundColor: "transparent",
    paddingTop: 10,
    paddingBottom: 15,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: -9,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 3,
  },
  tabText: {
    fontSize: 19,
    color: "#999",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  infoCards: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  museumType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
    paddingHorizontal: 20,
  },
  bookButtonContainer: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  bookButton: {
    backgroundColor: "#000",
    paddingVertical: 20,
    paddingHorizontal: 120,
    borderRadius: 40,
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