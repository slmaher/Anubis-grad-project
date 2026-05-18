import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function MapScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const museums = [
    {
      id: 1,
      name: "The Grand Egyptian Museum",
      address: "Cairo - Alexandria Desert Rd",
      rating: 4.7,
      reviews: 312,
      distance: "2 km",
      image: require("../../assets/images/grand-museum-night.webp"),
      latitude: 30.0444,
      longitude: 31.2357,
    },
    {
      id: 2,
      name: "The Egyptian Museum",
      address: "Cairo - El-Tahrir",
      rating: 4.7,
      reviews: 312,
      distance: "1.5 km",
      image: require("../../assets/images/egyptian-museum-interior.jpg"),
      latitude: 30.0478,
      longitude: 31.2336,
    },
    {
      id: 3,
      name: "Museum of Islamic Art",
      address: "Cairo - Port Said St",
      rating: 4.6,
      reviews: 245,
      distance: "3 km",
      image: require("../../assets/images/Museum-of-Islamic-Art.jpg"),
      latitude: 30.0410,
      longitude: 31.2450,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Interactive Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 30.0444,
          longitude: 31.2357,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {museums.map((museum) => (
          <Marker
            key={museum.id}
            coordinate={{
              latitude: museum.latitude,
              longitude: museum.longitude,
            }}
            title={museum.name}
            description={museum.address}
          >
            <View style={styles.customMarker}>
              <View style={styles.markerPin} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Map View</Text>

        <View style={styles.placeholder} />
      </View>

      {/* Floating Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Image
            source={require("../../assets/images/location.png")}
            style={styles.locationIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="El-Tahrir, Cairo"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={styles.settingsButton}>
          <Image
            source={require("../../assets/images/settings.png")}
            style={styles.settingsIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Floating Bottom Museum Cards */}
      <View style={styles.floatingBottomSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsScroll}
        >
          {museums.map((museum) => (
            <TouchableOpacity
              key={museum.id}
              style={styles.museumCard}
              activeOpacity={0.9}
            >
              <Image
                source={museum.image}
                style={styles.museumImage}
                resizeMode="cover"
              />

              <View style={styles.museumInfo}>
                <View style={styles.museumHeader}>
                  <Text style={styles.museumName} numberOfLines={1}>
                    {museum.name}
                  </Text>
                  <Text style={styles.museumDistance}>{museum.distance}</Text>
                </View>

                <View style={styles.museumAddressRow}>
                  <Image
                    source={require("../../assets/images/location.png")}
                    style={styles.smallLocationIcon}
                  />
                  <Text style={styles.museumAddress} numberOfLines={1}>
                    {museum.address}
                  </Text>
                </View>

                <View style={styles.museumRatingRow}>
                  <Text style={styles.starIcon}>⭐</Text>
                  <Text style={styles.ratingText}>
                    {museum.rating} ({museum.reviews})
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
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
  searchContainer: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    zIndex: 9,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  locationIcon: {
    width: 20,
    height: 20,
    tintColor: "#4A90E2",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  settingsButton: {
    width: 48,
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  settingsIcon: {
    width: 22,
    height: 22,
    tintColor: "#666",
  },
  customMarker: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  markerPin: {
    width: 30,
    height: 30,
    backgroundColor: "#4A90E2",
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingBottomSection: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 20,
    marginHorizontal: 15,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  cardsScroll: {
    paddingHorizontal: 15,
    gap: 15,
  },
  museumCard: {
    width: 260,
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  museumImage: {
    width: "100%",
    height: 130,
    backgroundColor: "#F0F0F0",
    borderRadius: 15,
  },
  museumInfo: {
    padding: 12,
    gap: 6,
  },
  museumHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  museumName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  museumDistance: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4A90E2",
  },
  museumAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  smallLocationIcon: {
    width: 14,
    height: 14,
    tintColor: "#999",
  },
  museumAddress: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  museumRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  starIcon: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
});
