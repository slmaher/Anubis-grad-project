import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect, useMemo } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { api } from "../api/client";

const { width } = Dimensions.get("window");
const CARD_WIDTH = 280;
const CARD_MARGIN = 12;
const CARD_SPACING = CARD_WIDTH + CARD_MARGIN;

export default function MapScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const flatListRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(1);
  const [dbMuseums, setDbMuseums] = useState([]);

  // Static fallback list with photos, descriptions, and real coordinates
  const baseMuseums = [
    {
      id: 1,
      name: "The Grand Egyptian Museum",
      address: "Giza, Cairo - Alexandria Desert Rd",
      rating: 4.8,
      reviews: 420,
      distance: "2.5 km",
      image: require("../../assets/images/grand-museum-night.webp"),
      latitude: 29.9992,
      longitude: 31.1342,
      shortDescription: "A state-of-the-art museum housing the complete Tutankhamun collection near the Pyramids of Giza.",
      hours: "9:00 AM - 6:00 PM",
      price: "120 LE",
    },
    {
      id: 2,
      name: "The Egyptian Museum",
      address: "Tahrir Square, Downtown Cairo",
      rating: 4.7,
      reviews: 312,
      distance: "1.2 km",
      image: require("../../assets/images/egyptian-museum-interior.jpg"),
      latitude: 30.0478,
      longitude: 31.2336,
      shortDescription: "The historic treasure trove in Tahrir Square, showcasing an unparalleled classical collection of antiquities.",
      hours: "9:00 AM - 7:00 PM",
      price: "100 LE",
    },
    {
      id: 3,
      name: "Museum of Islamic Art",
      address: "Port Said St, Bab Al-Khalq",
      rating: 4.6,
      reviews: 245,
      distance: "3.1 km",
      image: require("../../assets/images/Museum-of-Islamic-Art.jpg"),
      latitude: 30.0410,
      longitude: 31.2450,
      shortDescription: "One of the world's greatest collections of Islamic art, showcasing woodcarving, ceramics, and rare manuscripts.",
      hours: "9:00 AM - 5:00 PM",
      price: "80 LE",
    },
    {
      id: 4,
      name: "National Museum of Egyptian Civilization",
      address: "Fustat, Old Cairo",
      rating: 4.9,
      reviews: 512,
      distance: "4.5 km",
      image: require("../../assets/images/The-National-Museum-Of-Egypt.png"),
      latitude: 30.0076,
      longitude: 31.2471,
      shortDescription: "A modern cultural hub in Old Cairo, housing the majestic Royal Mummies Hall and chronological Egyptian displays.",
      hours: "9:00 AM - 5:00 PM",
      price: "150 LE",
    },
    {
      id: 5,
      name: "Coptic Museum",
      address: "Coptic Cairo, Babylon Fortress",
      rating: 4.5,
      reviews: 180,
      distance: "5.0 km",
      image: require("../../assets/images/Coptic-Museum.jpg"),
      latitude: 30.0059,
      longitude: 31.2301,
      shortDescription: "Located within the Babylon Fortress ruins, housing the largest collection of Coptic Christian art in the world.",
      hours: "9:00 AM - 4:00 PM",
      price: "60 LE",
    },
  ];

  // Fetch backend museums to cross-reference Real IDs
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const result = await api.getMuseums();
        if (isMounted && result?.data) {
          setDbMuseums(result.data);
        }
      } catch (err) {
        console.log("Failed to load backend museums for map view", err);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Enriched museums data
  const enrichedMuseums = useMemo(() => {
    return baseMuseums.map(m => {
      const dbMatch = dbMuseums.find(db => {
        const dbNameNorm = db.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const mNameNorm = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return dbNameNorm.includes(mNameNorm) || mNameNorm.includes(dbNameNorm);
      });
      return {
        ...m,
        dbId: dbMatch?._id || dbMatch?.id || m.id,
        imageUrl: dbMatch?.imageUrl || null,
        description: dbMatch?.description || m.shortDescription,
        hours: dbMatch?.openingHours || m.hours,
      };
    });
  }, [dbMuseums]);

  // Filtered museums based on search input
  const filteredMuseums = useMemo(() => {
    if (!searchQuery.trim()) return enrichedMuseums;
    const q = searchQuery.toLowerCase();
    return enrichedMuseums.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.address.toLowerCase().includes(q) ||
      m.shortDescription.toLowerCase().includes(q)
    );
  }, [searchQuery, enrichedMuseums]);

  // Zoom to single matching museum on search
  useEffect(() => {
    if (filteredMuseums.length > 0) {
      const first = filteredMuseums[0];
      setSelectedId(first.id);
      mapRef.current?.animateToRegion({
        latitude: first.latitude,
        longitude: first.longitude,
        latitudeDelta: 0.035,
        longitudeDelta: 0.035,
      }, 600);
    }
  }, [searchQuery]);

  // Handler to select museum and scroll both list & map
  const selectMuseum = (museum, scrollList = true) => {
    setSelectedId(museum.id);

    mapRef.current?.animateToRegion({
      latitude: museum.latitude,
      longitude: museum.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    }, 600);

    if (scrollList) {
      const index = filteredMuseums.findIndex(m => m.id === museum.id);
      if (index !== -1) {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }
  };

  // Re-center map to show all currently visible markers
  const fitAllMarkers = () => {
    if (filteredMuseums.length === 0) return;
    const coords = filteredMuseums.map(m => ({
      latitude: m.latitude,
      longitude: m.longitude,
    }));
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 150, right: 50, bottom: 360, left: 50 },
      animated: true,
    });
  };

  // Navigate to museum profile
  const handleViewProfile = (museum) => {
    router.push({
      pathname: "/museum-profile",
      params: {
        id: museum.dbId,
        museumId: museum.dbId,
        name: museum.name,
        museumName: museum.name,
        museumLookupName: museum.name,
        city: museum.address.split(",")[0],
        location: museum.address,
        description: museum.description,
        imageUrl: museum.imageUrl || "",
        hours: museum.hours,
      },
    });
  };

  // Navigate to checkout
  const handleBookTicket = (museum) => {
    router.push({
      pathname: "/tickets/checkout",
      params: {
        museumId: museum.dbId,
        museumName: museum.name,
        museumTime: museum.hours,
        museumPrice: museum.price,
        museumImageUrl: museum.imageUrl || "",
        museumLocation: museum.address,
        museumDescription: museum.description,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Interactive Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 30.0250,
          longitude: 31.2100,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
      >
        {filteredMuseums.map((museum) => {
          const isSelected = museum.id === selectedId;
          return (
            <Marker
              key={museum.id}
              coordinate={{
                latitude: museum.latitude,
                longitude: museum.longitude,
              }}
              onPress={() => selectMuseum(museum, true)}
              tracksViewChanges={false}
            >
              <View style={styles.markerContainer}>
                {isSelected && (
                  <View style={styles.markerBadge}>
                    <Text style={styles.markerBadgeText} numberOfLines={1}>
                      {museum.name}
                    </Text>
                  </View>
                )}
                <View style={[
                  styles.markerPinFrame,
                  isSelected && styles.markerPinFrameSelected
                ]}>
                  <Image
                    source={museum.image}
                    style={styles.markerPhoto}
                    resizeMode="cover"
                  />
                </View>
                <View style={[
                  styles.markerArrow,
                  isSelected && styles.markerArrowSelected
                ]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#31241B" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t("home.map", "Interactive Map")}</Text>

        <View style={styles.placeholder} />
      </View>

      {/* Floating Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#C5A880" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t("explore.search", "Search museums...")}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Floating Actions on Right Side */}
      <View style={styles.floatingActions}>
        <TouchableOpacity style={styles.actionButton} onPress={fitAllMarkers}>
          <MaterialCommunityIcons name="fit-to-page-outline" size={22} color="#31241B" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { marginTop: 10 }]}
          onPress={() => {
            const current = baseMuseums.find(m => m.id === selectedId);
            if (current) selectMuseum(current, true);
          }}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#31241B" />
        </TouchableOpacity>
      </View>

      {/* Floating Bottom Museum Cards Carousel */}
      <View style={styles.floatingBottomSection}>
        <FlatList
          ref={flatListRef}
          horizontal
          data={filteredMuseums}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_SPACING}
          decelerationRate="fast"
          contentContainerStyle={styles.cardsScroll}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="map-marker-off" size={40} color="#C5A880" />
              <Text style={styles.emptyTitle}>No Museums Found</Text>
              <Text style={styles.emptySub}>Try searching for another keyword.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = item.id === selectedId;
            return (
              <TouchableOpacity
                style={[
                  styles.museumCard,
                  isSelected && styles.museumCardSelected
                ]}
                activeOpacity={0.95}
                onPress={() => selectMuseum(item, false)}
              >
                {/* Museum Image Header */}
                <View style={styles.cardImageContainer}>
                  <Image source={item.image} style={styles.museumImage} />
                  <View style={styles.ratingBadge}>
                    <MaterialCommunityIcons name="star" size={13} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>

                {/* Museum Details Body */}
                <View style={styles.museumInfo}>
                  <View style={styles.museumHeader}>
                    <Text style={styles.museumName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.museumDistance}>{item.distance}</Text>
                  </View>

                  <Text style={styles.museumAddress} numberOfLines={1}>
                    <MaterialCommunityIcons name="map-marker" size={12} color="#C5A880" />
                    {" "}{item.address}
                  </Text>

                  <Text style={styles.shortDescription} numberOfLines={2}>
                    {item.shortDescription}
                  </Text>

                  {/* Divider */}
                  <View style={styles.divider} />

                  {/* Card Action Buttons */}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.outlineButton}
                      onPress={() => handleViewProfile(item)}
                    >
                      <Text style={styles.outlineButtonText}>{t("tickets.detail", "Details")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.filledButton}
                      onPress={() => handleBookTicket(item)}
                    >
                      <MaterialCommunityIcons name="ticket-confirmation-outline" size={14} color="#FFF8E8" />
                      <Text style={styles.filledButtonText}>{t("museum.book_ticket", "Book Ticket")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFBF7",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 55,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "rgba(253, 251, 247, 0.94)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(197, 168, 128, 0.2)",
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#31241B",
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    position: "absolute",
    top: 125,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 9,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(197, 168, 128, 0.35)",
    shadowColor: "#31241B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#31241B",
    fontWeight: "500",
  },
  floatingActions: {
    position: "absolute",
    right: 16,
    bottom: 330,
    zIndex: 9,
  },
  actionButton: {
    width: 44,
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(197, 168, 128, 0.3)",
    shadowColor: "#31241B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerBadge: {
    backgroundColor: "#31241B",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2c36d",
    marginBottom: 4,
    maxWidth: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  markerBadgeText: {
    color: "#FFF8E8",
    fontSize: 11,
    fontWeight: "700",
  },
  markerPinFrame: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: "#C5A880",
    backgroundColor: "#FFF8E8",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  markerPinFrameSelected: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderColor: "#E2C36D",
    borderWidth: 4,
    shadowColor: "#E2C36D",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  markerPhoto: {
    width: "100%",
    height: "100%",
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#C5A880",
    marginTop: -2,
  },
  markerArrowSelected: {
    borderTopColor: "#E2C36D",
    borderTopWidth: 11,
  },
  floatingBottomSection: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    zIndex: 8,
  },
  cardsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  museumCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginRight: CARD_MARGIN,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(197, 168, 128, 0.2)",
    shadowColor: "#31241B",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  museumCardSelected: {
    borderColor: "#E2C36D",
    borderWidth: 1.5,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  cardImageContainer: {
    width: "100%",
    height: 115,
    position: "relative",
  },
  museumImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFF8E8",
  },
  ratingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(49, 36, 27, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: "#FFF8E8",
    fontSize: 12,
    fontWeight: "700",
  },
  museumInfo: {
    padding: 14,
  },
  museumHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  museumName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#31241B",
    flex: 1,
    marginRight: 6,
  },
  museumDistance: {
    fontSize: 12,
    fontWeight: "600",
    color: "#C5A880",
  },
  museumAddress: {
    fontSize: 12,
    color: "#8C7A6B",
    marginBottom: 8,
  },
  shortDescription: {
    fontSize: 12,
    color: "#5C4A3C",
    lineHeight: 17,
    height: 34,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(197, 168, 128, 0.15)",
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  outlineButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C5A880",
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    color: "#C5A880",
    fontSize: 12,
    fontWeight: "600",
  },
  filledButton: {
    flex: 1.3,
    flexDirection: "row",
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#31241B",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  filledButtonText: {
    color: "#FFF8E8",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyCard: {
    width: width - 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(197, 168, 128, 0.2)",
    shadowColor: "#31241B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#31241B",
    marginTop: 10,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: "#8C7A6B",
    textAlign: "center",
  },
});

