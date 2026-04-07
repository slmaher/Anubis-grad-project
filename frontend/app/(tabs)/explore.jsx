import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ImageBackground, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";

// Different local image for each museum (when remote fails or is missing)
const MUSEUM_LOCAL_IMAGES = [
  require("../../assets/images/Grand-Egyptian-Museum.png"),
  require("../../assets/images/The-Grand-Egyptian-Museum.png"),
  require("../../assets/images/Egyptian-Museum-Explore-Screen.png"),
  require("../../assets/images/The-National-Museum-Of-Egypt.png"),
  require("../../assets/images/egyptian-museum-interior.jpg"),
  require("../../assets/images/Museum-of-Islamic-Art.jpg"),
  require("../../assets/images/Coptic-Museum.jpg"),
  require("../../assets/images/Egyptian-Civilization.jpg"),
  require("../../assets/images/grand-museum.png"),
  require("../../assets/images/Grand-Museum-Profile.png"),
  require("../../assets/images/grand-museum-night.webp"),
  require("../../assets/images/egyptian-museum.png"),
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

function getLocalImageForMuseum(museum) {
  const name = museum?.name?.trim?.();
  if (name && MUSEUM_NAME_TO_IMAGE[name]) return MUSEUM_NAME_TO_IMAGE[name];
  const id = (museum?._id || name || "").toString();
  const index = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return MUSEUM_LOCAL_IMAGES[Math.abs(index) % MUSEUM_LOCAL_IMAGES.length];
}

export default function Explore() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Track remote images that failed to load so we show local fallback
  const [failedImageIds, setFailedImageIds] = useState({});

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const result = await api.getMuseums();
        const list = result?.data || [];
        if (isMounted) {
          setMuseums(list);
        }
      } catch (err) {
        console.error("Failed to load museums", err);
        if (isMounted) {
          setError(err?.message || "Failed to load museums");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMuseumPress = (museum) => {
    router.push({
      pathname: "/museum-profile",
      params: { 
        id: museum._id || museum.id,
        name: museum.name,
        city: museum.city,
        description: museum.description,
        imageUrl: museum.imageUrl,
      }
    });
  };

  const filteredMuseums = museums.filter((museum) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      museum.name?.toLowerCase().includes(query) ||
      museum.city?.toLowerCase().includes(query) ||
      museum.location?.toLowerCase().includes(query)
    );
  });

  const getImageSource = (museum) => {
    const useRemote = museum.imageUrl && !failedImageIds[museum._id];
    return useRemote ? { uri: museum.imageUrl } : getLocalImageForMuseum(museum);
  };

  const handleImageError = (museumId) => {
    setFailedImageIds((prev) => ({ ...prev, [museumId]: true }));
  };

  return (
    <ImageBackground
      source={require("../../assets/images/community-background.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("explore.title")}</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B7B6C" />
            </View>
          )}

          {!loading && error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>≡</Text>
              <TextInput
                style={styles.searchInput}
                placeholder={t("explore.search")}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              <TouchableOpacity>
                <Image
                  source={require("../../assets/images/search-icon.png")}
                  style={styles.searchIconImage}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            {["All", "Popular", "Recommended"].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  activeFilter === filter && styles.filterButtonActive,
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter && styles.filterTextActive,
                  ]}
                >
                  {t(`explore.filters.${filter.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {!loading && !error && filteredMuseums.length > 0 && (
            <>
              {/* Recent Search */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("explore.museums_section")}</Text>
                
                <View style={styles.recentSearchGrid}>
                  {filteredMuseums.slice(0, 2).map((museum) => (
                    <TouchableOpacity
                      key={museum._id}
                      style={styles.recentCard}
                      onPress={() => handleMuseumPress(museum)}
                    >
                      <Image
                        source={getImageSource(museum)}
                        style={styles.recentImageFull}
                        resizeMode="cover"
                        onError={() => handleImageError(museum._id)}
                      />
                      <View style={styles.recentOverlay}>
                        <View style={styles.glassyBubble}>
                          <Text style={styles.recentName} numberOfLines={2}>
                            {museum.name}
                          </Text>
                          <View style={styles.ratingContainer}>
                            <Text style={styles.rating}>4.6</Text>
                            <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
                            <Text style={styles.reviews}>(reviews)</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Featured Museums */}
              <View style={styles.section}>
                {filteredMuseums.map((museum) => (
                  <TouchableOpacity
                    key={museum._id}
                    style={styles.featuredCard}
                    onPress={() => handleMuseumPress(museum)}
                  >
                    <Image
                      source={getImageSource(museum)}
                      style={styles.featuredImage}
                      resizeMode="cover"
                      onError={() => handleImageError(museum._id)}
                    />
                    <View style={styles.featuredOverlay}>
                      <Text style={styles.featuredName}>{museum.name}</Text>
                      <View style={styles.featuredFooter}>
                        <Text style={styles.featuredPrice}>
                          {museum.openingHours || "Open today"}
                        </Text>
                        <View style={styles.arrowButton}>
                          <Text style={styles.arrowIcon}>→</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
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
  header: {
    backgroundColor: "transparent",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B7B6C",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  errorText: {
    color: "#b00020",
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
    color: "#666",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  searchIconImage: {
    width: 18,
    height: 18,
    tintColor: "#666",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 25,
    gap: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
  },
  filterButtonActive: {
    backgroundColor: "rgba(212, 175, 55, 0.4)",
    borderColor: "rgba(212, 175, 55, 0.6)",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#333",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B7B6C",
    marginBottom: 15,
  },
  recentSearchGrid: {
    flexDirection: "row",
    gap: 15,
  },
  recentCard: {
    flex: 1,
    height: 200,
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    position: "relative",
  },
  recentImageFull: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  recentOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    justifyContent: "flex-end",
  },
  glassyBubble: {
    backgroundColor: "rgba(159, 159, 159, 0.6)",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(168, 168, 168, 0.6)",
  },
  recentName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
  },
  stars: {
    fontSize: 10,
    color: "#FFD700",
  },
  reviews: {
    fontSize: 13,
    color: "#ffffff",
  },
  featuredCard: {
    backgroundColor: "#1a2332",
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 15,
    height: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    backgroundColor: "#1a2332",
  },
  featuredOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
    padding: 20,
  },
  featuredName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  featuredFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredPrice: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
});