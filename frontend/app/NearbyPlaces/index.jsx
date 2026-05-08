import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function NearbyPlaces() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const places = [
    {
      id: 1,
      name: 'Zooba GEM',
      address: 'inside the Grand Egyptian Museum, Giza',
      icon: '🏪',
      latitude: 30.0444,
      longitude: 31.2357,
    },
    {
      id: 2,
      name: 'Cafe Riche',
      address: '17 Talaat Harb Street, Downtown Cairo',
      icon: '☕',
      latitude: 30.0478,
      longitude: 31.2336,
    },
    {
      id: 3,
      name: 'Khan el-Khalili Bazaar',
      address: 'El-Gamaleya, Islamic Cairo',
      icon: '🛍️',
      latitude: 30.0474,
      longitude: 31.2620,
    },
    {
      id: 4,
      name: 'Oum El Dounia',
      address: 'Near Tahrir Square / downtown Cairo',
      icon: '🍽️',
      latitude: 30.0444,
      longitude: 31.2350,
    },
    {
      id: 5,
      name: 'El-Fishawy Café',
      address: 'Inside Khan el-Khalili market',
      icon: '☕',
      latitude: 30.0476,
      longitude: 31.2625,
    },
  ];

  // Filter places based on search query
  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 30.0444,
          longitude: 31.2400,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
            description={place.address}
          >
            <View style={styles.customMarker}>
              <View style={styles.markerPin} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Places</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.menuIcon}>☰</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === "All" && styles.filterButtonActive]}
          onPress={() => setActiveFilter("All")}
        >
          <Text style={[styles.filterText, activeFilter === "All" && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === "Cafes/Restaurants" && styles.filterButtonActive]}
          onPress={() => setActiveFilter("Cafes/Restaurants")}
        >
          <Text style={[styles.filterText, activeFilter === "Cafes/Restaurants" && styles.filterTextActive]}>
            Cafes/Restaurants
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === "Souvenir market" && styles.filterButtonActive]}
          onPress={() => setActiveFilter("Souvenir market")}
        >
          <Text style={[styles.filterText, activeFilter === "Souvenir market" && styles.filterTextActive]}>
            Souvenir market
          </Text>
        </TouchableOpacity>
      </View>

      {/* Places List */}
      <ScrollView 
        style={styles.listContainer} 
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredPlaces.map((place) => (
          <TouchableOpacity key={place.id} style={styles.placeCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>{place.icon}</Text>
            </View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeAddress}>{place.address}</Text>
            </View>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerPin: {
    width: 24,
    height: 24,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 9,
  },
  menuIcon: {
    marginRight: 12,
    fontSize: 18,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  searchIcon: {
    marginLeft: 12,
    fontSize: 16,
  },
  filterContainer: {
    position: 'absolute',
    top: 180,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 8,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#D4AF37',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  filterText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  listContainer: {
    position: 'absolute',
    top: 230,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 7,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 16,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(245, 245, 245, 0.9)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 13,
    color: '#666',
  },
  chevronIcon: {
    fontSize: 24,
    color: '#666',
  },
  bottomPadding: {
    height: 20,
  },
});