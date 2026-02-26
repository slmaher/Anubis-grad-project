import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Museums and Sites</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
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
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            <TouchableOpacity>
              <Text style={styles.searchIconRight}>🔍</Text>
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
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!loading && !error && filteredMuseums.length > 0 && (
          <>
            {/* Recent Search */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Museums</Text>
              
              <View style={styles.recentSearchGrid}>
                {filteredMuseums.slice(0, 2).map((museum) => (
                  <TouchableOpacity
                    key={museum._id}
                    style={styles.recentCard}
                    onPress={() => handleMuseumPress(museum)}
                  >
                    <Image
                      source={getImageSource(museum)}
                      style={styles.recentImage}
                      resizeMode="cover"
                      onError={() => handleImageError(museum._id)}
                    />
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentName} numberOfLines={2}>
                        {museum.name}
                      </Text>
                      <View style={styles.ratingContainer}>
                        <Text style={styles.rating}>4.6</Text>
                        <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
                        <Text style={styles.reviews}>(reviews)</Text>
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

        <View style={{ height: 100 }} />
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
    backgroundColor: "#E8DDD0",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
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
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  searchIconRight: {
    fontSize: 18,
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
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  filterButtonActive: {
    backgroundColor: "#E8DDD0",
    borderColor: "#fff",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#000",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 15,
  },
  recentSearchGrid: {
    flexDirection: "row",
    gap: 15,
  },
  recentCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recentImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#E0E0E0",
  },
  recentInfo: {
    padding: 12,
  },
  recentName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
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
    color: "#000",
  },
  stars: {
    fontSize: 10,
    color: "#FFD700",
  },
  reviews: {
    fontSize: 11,
    color: "#666",
  },
  featuredCard: {
    backgroundColor: "#1a2332",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 15,
    height: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
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
