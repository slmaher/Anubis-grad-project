import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ImageBackground, ActivityIndicator } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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

function normalizeText(text) {
  return (text || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

  const museumCards = useMemo(() => {
    return museums.map((museum, index) => {
      const seedKey = (museum?._id || museum?.name || String(index)).toString();
      const seed = seedKey
        .split("")
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);

      const rating = Number((4.1 + (seed % 9) * 0.1).toFixed(1));
      const reviewsCount = 120 + (seed % 880);

      return {
        ...museum,
        rating,
        reviewsCount,
        isPopular: rating >= 4.6,
        isRecommended: seed % 3 !== 0,
      };
    });
  }, [museums]);

  const filteredMuseums = useMemo(() => {
    const query = normalizeText(searchQuery);

    return museumCards.filter((museum) => {
      const searchableText = normalizeText(
        [museum.name, museum.city, museum.location, museum.description]
          .filter(Boolean)
          .join(" "),
      );

      const matchesSearch = !query || searchableText.includes(query);

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Popular" && museum.isPopular) ||
        (activeFilter === "Recommended" && museum.isRecommended);

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, museumCards, searchQuery]);

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
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#736A61"
                style={styles.searchLeadingIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={t("explore.search")}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
                returnKeyType="search"
              />

              {searchQuery.trim().length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.clearSearchButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons name="close-circle" size={18} color="#90867B" />
                </TouchableOpacity>
              )}
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
              {/* Hero Card */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("explore.museums_section")}</Text>

                <TouchableOpacity
                  style={styles.heroCard}
                  onPress={() => handleMuseumPress(filteredMuseums[0])}
                  activeOpacity={0.88}
                >
                  <Image
                    source={getImageSource(filteredMuseums[0])}
                    style={styles.heroImage}
                    resizeMode="cover"
                    onError={() => handleImageError(filteredMuseums[0]._id)}
                  />
                  <View style={styles.heroOverlay}>
                    <View style={styles.heroBadge}>
                      <MaterialCommunityIcons name="star-four-points" size={14} color="#F8E6B0" />
                      <Text style={styles.heroBadgeText}>{t("explore.filters.recommended")}</Text>
                    </View>
                    <Text style={styles.heroName} numberOfLines={2}>{filteredMuseums[0].name}</Text>
                    <View style={styles.heroMetaRow}>
                      <MaterialCommunityIcons name="map-marker-outline" size={15} color="#FFF8E8" />
                      <Text style={styles.heroMetaText} numberOfLines={1}>
                        {filteredMuseums[0].city || filteredMuseums[0].location || "Cairo"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.recentSearchGrid}>
                  {filteredMuseums.slice(1, 3).map((museum, index) => (
                    <TouchableOpacity
                      key={museum._id || `${museum.name}-${index}`}
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
                            <MaterialCommunityIcons name="star" size={12} color="#FFD36B" />
                            <Text style={styles.rating}>{museum.rating}</Text>
                            <Text style={styles.reviews}>({museum.reviewsCount})</Text>
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
                        <View style={styles.featuredMetaLeft}>
                          <MaterialCommunityIcons name="clock-outline" size={14} color="#FFF5DE" />
                          <Text style={styles.featuredPrice}>
                            {museum.openingHours || "Open today"}
                          </Text>
                        </View>
                        <View style={styles.arrowButton}>
                          <MaterialCommunityIcons name="arrow-top-right" size={18} color="#ffffff" />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {!loading && !error && filteredMuseums.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="magnify-close" size={40} color="#9A8E80" />
              <Text style={styles.emptyStateTitle}>No museums found</Text>
              <Text style={styles.emptyStateBody}>Try another name, city, or clear your filters.</Text>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearchQuery("");
                  setActiveFilter("All");
                }}
              >
                <Text style={styles.clearFiltersButtonText}>Clear filters</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2C2010",
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
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.84)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.92)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  searchLeadingIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15.5,
    color: "#31241B",
  },
  clearSearchButton: {
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  filterButton: {
    paddingVertical: 5,
    paddingHorizontal: 22,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.74)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  filterButtonActive: {
    backgroundColor: "#D4B86A",
    borderColor: "#C7A955",
  },
  filterText: {
    fontSize: 14,
    color: "#6D645C",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#4A3927",
    fontWeight: "700",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2C2010",
    marginBottom: 6,
  },
  heroCard: {
    height: 190,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  heroBadge: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    backgroundColor: "rgba(35, 28, 19, 0.72)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: "#FCECC5",
    fontSize: 12,
    fontWeight: "700",
  },
  heroName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
    lineHeight: 28,
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroMetaText: {
    color: "#FFF8E8",
    fontSize: 13,
    fontWeight: "600",
  },
  recentSearchGrid: {
    flexDirection: "row",
    gap: 12,
  },
  recentCard: {
    flex: 1,
    height: 170,
    backgroundColor: "#E0E0E0",
    borderRadius: 18,
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
    padding: 9,
    justifyContent: "flex-end",
  },
  glassyBubble: {
    backgroundColor: "rgba(18, 17, 15, 0.56)",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.24)",
  },
  recentName: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFE4A7",
  },
  reviews: {
    fontSize: 11,
    color: "#F4EEE4",
  },
  featuredCard: {
    backgroundColor: "#1E1B17",
    borderRadius: 21,
    overflow: "hidden",
    marginBottom: 13,
    height: 184,
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
    backgroundColor: "rgba(0, 0, 0, 0.34)",
    justifyContent: "flex-end",
    padding: 16,
  },
  featuredName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  featuredFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredMetaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  featuredPrice: {
    fontSize: 14,
    color: "#FFF5DE",
    fontWeight: "600",
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.74)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  emptyStateTitle: {
    marginTop: 10,
    color: "#5F4E3A",
    fontSize: 18,
    fontWeight: "800",
  },
  emptyStateBody: {
    marginTop: 8,
    color: "#77695B",
    textAlign: "center",
    lineHeight: 20,
    fontSize: 13,
  },
  clearFiltersButton: {
    marginTop: 14,
    backgroundColor: "#C7A955",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  clearFiltersButtonText: {
    color: "#3D2F1B",
    fontSize: 13,
    fontWeight: "700",
  },
});