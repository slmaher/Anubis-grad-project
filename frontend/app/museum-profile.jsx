import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { api } from "./api/client";

const { width, height } = Dimensions.get("window");

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
  "Grand Egyptian Museum (GEM)": MUSEUM_LOCAL_IMAGES[0],
  "The Grand Egyptian Museum": MUSEUM_LOCAL_IMAGES[1],
  "Egyptian Museum": MUSEUM_LOCAL_IMAGES[2],
  "Egyptian Museum (Tahrir)": MUSEUM_LOCAL_IMAGES[2],
  "The Egyptian Museum": MUSEUM_LOCAL_IMAGES[2],
  "National Museum of Egyptian Civilization": MUSEUM_LOCAL_IMAGES[3],
  "National Museum of Egyptian Civilization (NMEC)": MUSEUM_LOCAL_IMAGES[3],
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
};

function getLocalImageForMuseum(name) {
  const trimmed = name?.trim?.();
  if (trimmed && MUSEUM_NAME_TO_IMAGE[trimmed]) {
    return MUSEUM_NAME_TO_IMAGE[trimmed];
  }

  const index = (trimmed || "")
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  return MUSEUM_LOCAL_IMAGES[Math.abs(index) % MUSEUM_LOCAL_IMAGES.length];
}

function isValidMongoId(id) {
  return typeof id === "string" && /^[a-f\d]{24}$/i.test(id);
}

function getTicketPrice(museum) {
  return (
    museum?.ticketPrice ||
    museum?.price ||
    museum?.entryPrice ||
    museum?.adultTicketPrice ||
    museum?.foreignAdultPrice ||
    museum?.egyptianAdultPrice ||
    "120 LE/ Person"
  );
}

function getMuseumType(museum) {
  return (
    museum?.type ||
    museum?.category ||
    museum?.museumType ||
    museum?.classification ||
    "About The Museum"
  );
}

function formatRating(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "N/A";
  return num.toFixed(1);
}

export default function MuseumProfile() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState("Overview");
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [dbMuseum, setDbMuseum] = useState(null);
  const [appRating, setAppRating] = useState(null);

  const rawMuseumId = params.id || params.museumId;
  const museumId = isValidMongoId(rawMuseumId) ? rawMuseumId : undefined;
  const lookupName = params.museumLookupName || params.museumName || params.name;

  useEffect(() => {
    let isMounted = true;

    const loadMuseumData = async () => {
      try {
        const result = await api.getMuseums();
        const list = result?.data || [];

        const found = list.find((item) => {
          const itemId = item._id || item.id;
          return (
            (museumId && itemId === museumId) ||
            (lookupName && item.name === lookupName)
          );
        });

        if (isMounted && found) {
          setDbMuseum(found);
        }
      } catch (err) {
        console.error("Failed to load museum profile data", err);
      }
    };

    loadMuseumData();

    return () => {
      isMounted = false;
    };
  }, [museumId, lookupName]);

  const museum = useMemo(() => {
    const source = dbMuseum || {};

    return {
      id: museumId || source._id || source.id || lookupName,
      name: source.name || params.name || "Museum",
      lookupName: source.name || lookupName || params.name || "Museum",
      price: getTicketPrice(source) || params.price || "120 LE/ Person",
      rating: source.rating || params.rating || 0,
      imageUrl: source.imageUrl || params.imageUrl,
      type: getMuseumType(source),
      description:
        source.description ||
        params.description ||
        "No description available for this museum.",
      hours: source.openingHours || params.hours || "Open today",
      location: source.city || params.city || "Cairo",
      duration: source.duration || source.visitDuration || "2-3 hours",
    };
  }, [dbMuseum, museumId, lookupName, params]);

  useEffect(() => {
    let isMounted = true;

    const loadFavoriteState = async () => {
      try {
        const existingFavorites = await AsyncStorage.getItem("favorites");
        const favoritesArray = existingFavorites
          ? JSON.parse(existingFavorites)
          : [];

        const alreadyFavorite = favoritesArray.some(
          (fav) => fav.id === museum.id || fav.name === museum.name,
        );

        if (isMounted) {
          setIsFavorite(alreadyFavorite);
        }
      } catch (error) {
        console.error("Error loading favorite state:", error);
      }
    };

    loadFavoriteState();

    return () => {
      isMounted = false;
    };
  }, [museum.id, museum.name]);

  useEffect(() => {
    let isMounted = true;

    const loadAppRating = async () => {
      try {
        const query = {
          ...(museumId ? { museumId } : {}),
          ...(museum.name ? { museumName: museum.name } : {}),
          ...(museum.lookupName ? { museumLookupName: museum.lookupName } : {}),
        };

        const result = await api.getReviews(query);
        const reviews = result?.data || [];

        if (reviews.length > 0) {
          const total = reviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0,
          );
          const average = total / reviews.length;

          if (isMounted) {
            setAppRating(average);
          }
        } else if (isMounted) {
          setAppRating(null);
        }
      } catch (err) {
        console.error("Failed to load app rating", err);
      }
    };

    loadAppRating();

    return () => {
      isMounted = false;
    };
  }, [museumId, museum.name, museum.lookupName]);

  const displayRating = appRating || museum.rating;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/home");
  };

  const handleShare = async () => {
    try {
      const Share = require("react-native").Share;

      await Share.share({
        message: `Check out ${museum.name}!\n\nPrice: ${museum.price}\nRating: ${formatRating(displayRating)}\n\n${museum.description}\n\nDiscover more amazing museums in Egypt with Anubis app!`,
        title: museum.name,
      });
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share museum profile");
    }
  };

  const handleFavorite = async () => {
    try {
      const existingFavorites = await AsyncStorage.getItem("favorites");
      let favoritesArray = existingFavorites ? JSON.parse(existingFavorites) : [];

      const alreadyFavorite = favoritesArray.some(
        (fav) => fav.id === museum.id || fav.name === museum.name,
      );

      if (alreadyFavorite) {
        favoritesArray = favoritesArray.filter(
          (fav) => fav.id !== museum.id && fav.name !== museum.name,
        );
        setIsFavorite(false);
        await AsyncStorage.setItem("favorites", JSON.stringify(favoritesArray));
        return;
      }

      const favoriteItem = {
        id: museum.id,
        name: museum.name,
        price: museum.price,
        rating: formatRating(displayRating),
        type: museum.type,
        imageUrl: museum.imageUrl,
        description: museum.description,
        timestamp: new Date().toISOString(),
      };

      favoritesArray.push(favoriteItem);
      setIsFavorite(true);
      await AsyncStorage.setItem("favorites", JSON.stringify(favoritesArray));

      Alert.alert("Success", "Added to your favorites!", [
  { text: "View Favorites", onPress: () => router.push("/favorites") },
  { text: "OK" },
]);

    } catch (error) {
      console.error("Error updating favorites:", error);
      Alert.alert("Error", "Failed to update favorites");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/beige-background.jpeg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
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

          <View style={styles.imageShadow} />

          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backIcon}>{t("common.back_arrow")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareIcon}>↗</Text>
          </TouchableOpacity>

          <View style={styles.imageOverlay}>
            <Text style={styles.museumName}>{museum.name}</Text>

            <View style={styles.priceRatingContainer}>
              <Text style={styles.price}>{museum.price}</Text>

              <View style={styles.ratingBadge}>
                <MaterialCommunityIcons name="star" size={16} color="#D4AF37" />
                <Text style={styles.ratingText}>{formatRating(displayRating)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.bookmarkContainer}>
            <TouchableOpacity
              style={[
                styles.bookmarkButton,
                isFavorite && styles.bookmarkButtonSaved,
              ]}
              onPress={handleFavorite}
              activeOpacity={0.8}
            >
              <FontAwesome6
                name="bookmark"
                solid={isFavorite}
                size={24}
                color={isFavorite ? "#000" : "#ffffff"}
              />
            </TouchableOpacity>
          </View>
        </View>

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
                        ...(museum.id && isValidMongoId(museum.id)
                          ? { museumId: museum.id }
                          : {}),
                        museumName: museum.name,
                        museumLookupName: museum.lookupName,
                      },
                    });
                  } else if (tab === "Artifacts") {
                    router.push({
                      pathname: "/artifacts",
                      params: {
                        museumId: museum.id,
                        museumName: museum.name,
                        museumLookupName: museum.lookupName,
                      },
                    });
                  } else if (tab === "Nearby") {
                    router.push("/NearbyPlaces");
                  } else {
                    setActiveTab(tab);
                  }
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {t(`museum.tabs.${tab.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <MaterialIcons name="date-range" size={20} color="#666" />
              <Text style={styles.infoText}>{museum.hours}</Text>
            </View>

            <View style={styles.infoCard}>
              <MaterialCommunityIcons
                name="map"
                size={20}
                color="#666"
              />
              <Text style={styles.infoText} numberOfLines={1}>
                {museum.location}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="clock" size={20} color="#666" />
              <Text style={styles.infoText}>{museum.duration}</Text>
            </View>
          </View>

          <Text style={styles.museumType}>{museum.type}</Text>

          <Text style={styles.description}>{museum.description}</Text>

          <View style={{ height: 180 }} />
        </ScrollView>

        <View style={styles.bookButtonContainer}>
          <TouchableOpacity
  style={styles.bookButton}
  onPress={() =>
    router.push({
      pathname: "/tickets/checkout",
      params: {
        museumId: museum.id,
        museumName: museum.name,
        museumTime: museum.hours,
        museumPrice: museum.price,
        museumImageUrl: museum.imageUrl,
        museumLocation: museum.location,
        museumDescription: museum.description,
      },
    })
  }
>
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
    flexWrap: "wrap",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.28)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "700",
  },
  bookmarkContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  bookmarkButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.95)",
  },
  bookmarkButtonSaved: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderColor: "rgba(255,255,255,0.95)",
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
    color: "#512f00",
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
    backgroundColor: "#4c3100",
    paddingVertical: 20,
    paddingHorizontal: 90,
    borderRadius: 40,
    shadowColor: "#000000",
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