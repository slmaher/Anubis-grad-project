import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function Explore() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Museum data
  const recentSearches = [
    {
      id: 1,
      name: "The Grand Egyptian Museum",
      rating: 4.6,
      reviews: "13k",
      image: require("../../assets/images/The-Grand-Egyptian-Museum.png"),
    },
    {
      id: 2,
      name: "The National Museum of Egypt",
      rating: 4.7,
      reviews: "27k",
      image: require("../../assets/images/The-National-Museum-Of-Egypt.png"),
    },
  ];

  const featuredMuseums = [
    {
      id: 1,
      name: "Grand Egyptian Museum",
      price: "120 LE/ Person",
      image: require("../../assets/images/Grand-Egyptian-Museum.png"),
    },
    {
      id: 2,
      name: "Egyptian Museum",
      price: "80 LE/ Person",
      image: require("../../assets/images/Egyptian-Museum-Explore-Screen.png"),
    },
  ];

  const handleMuseumPress = (museum) => {
    router.push({
      pathname: "/museum-profile",
      params: { 
        id: museum.id,
        name: museum.name,
      }
    });
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

        {/* Recent Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Search</Text>
          
          <View style={styles.recentSearchGrid}>
            {recentSearches.map((museum) => (
              <TouchableOpacity
                key={museum.id}
                style={styles.recentCard}
                onPress={() => handleMuseumPress(museum)}
              >
                <Image
                  source={museum.image}
                  style={styles.recentImage}
                  resizeMode="cover"
                />
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName} numberOfLines={2}>
                    {museum.name}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>{museum.rating}</Text>
                    <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
                    <Text style={styles.reviews}>({museum.reviews})</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Museums */}
        <View style={styles.section}>
          {featuredMuseums.map((museum) => (
            <TouchableOpacity
              key={museum.id}
              style={styles.featuredCard}
              onPress={() => handleMuseumPress(museum)}
            >
              <Image
                source={museum.image}
                style={styles.featuredImage}
                resizeMode="cover"
              />
              <View style={styles.featuredOverlay}>
                <Text style={styles.featuredName}>{museum.name}</Text>
                <View style={styles.featuredFooter}>
                  <Text style={styles.featuredPrice}>{museum.price}</Text>
                  <View style={styles.arrowButton}>
                    <Text style={styles.arrowIcon}>→</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

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
