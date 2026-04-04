import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ImageBackground } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MenuScreen from "../menu/menuScreen";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
    <ImageBackground
      source={require("../../assets/images/home-background.jpeg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header with hamburger menu */}
        <View style={styles.topBar}>
          <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Image
                source={require("../../assets/images/search-icon.png")}
                style={styles.searchIconImage}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => router.push("/ai/chatbot")}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#8B7B6C" />
              <Text style={styles.chatText}>Chat with{"\n"}AI?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>Explore Egypt</Text>

          {/* Navigation Cards Grid */}
          <View style={styles.cardsGrid}>
            {/* Museums Card */}
            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => router.push("/(tabs)/explore")}
            >
              <View style={styles.navIconContainer}>
                <MaterialCommunityIcons name="bank-outline" size={34} color="#6B5B4F" />
              </View>
              <Text style={styles.navLabel}>Museums</Text>
            </TouchableOpacity>

            {/* Souvenirs Card */}
            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => router.push("/marketplace")}
            >
              <View style={styles.navIconContainer}>
                <Ionicons name="bag-handle-outline" size={32} color="#6B5B4F" />
              </View>
              <Text style={styles.navLabel}>Souvenirs</Text>
            </TouchableOpacity>

            {/* Tickets Card */}
            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => router.push("/tickets")}
            >
              <View style={styles.navIconContainer}>
                <MaterialCommunityIcons name="ticket-confirmation-outline" size={34} color="#6B5B4F" />
              </View>
              <Text style={styles.navLabel}>Tickets</Text>
            </TouchableOpacity>

            {/* Map Card */}
            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => router.push("/map")}
            >
              <View style={styles.navIconContainer}>
                <Ionicons name="location-outline" size={34} color="#6B5B4F" />
              </View>
              <Text style={styles.navLabel}>Map</Text>
            </TouchableOpacity>
          </View>

          {/* Featured Section */}
          <View style={styles.featuredSection}>
            <View style={styles.featuredHeader}>
              <Text style={styles.featuredTitle}>Featured</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/explore")}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Featured Museum Cards */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.museumCardsContainer}
            >
              {/* Grand Egyptian Museum Card */}
              <TouchableOpacity 
                style={styles.museumCard}
                onPress={() => router.push({
                  pathname: "/museum-profile",
                  params: { id: 1, name: "Grand Egyptian Museum" }
                })}
              >
                <Image
                  source={require("../../assets/images/grand-museum.png")}
                  style={styles.museumImage}
                  resizeMode="cover"
                />
                <View style={styles.museumCardOverlay}>
                  <View style={styles.museumTitleBubble}>
                    <Text style={styles.museumCardTitle}>Grand Egyptian{"\n"}Museum</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Egyptian Museum Card */}
              <TouchableOpacity 
                style={styles.museumCard}
                onPress={() => router.push({
                  pathname: "/museum-profile",
                  params: { id: 2, name: "Egyptian Museum" }
                })}
              >
                <Image
                  source={require("../../assets/images/egyptian-museum.png")}
                  style={styles.museumImage}
                  resizeMode="cover"
                />
                <View style={styles.museumCardOverlay}>
                  <View style={styles.museumTitleBubble}>
                    <Text style={styles.museumCardTitle}>Egyptian{"\n"}Museum</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
       </ImageBackground>

    {menuVisible && (
      <MenuScreen onClose={() => setMenuVisible(false)} />
    )}
  </View>
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
  topBar: {
    backgroundColor: "transparent",
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 10,
  },
  menuIcon: {
    fontSize: 24,
    color: "#8B7B6C",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  searchIconImage: {
    width: 18,
    height: 18,
    tintColor: "#666",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  chatButton: {
    backgroundColor: "transparent",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  chatText: {
    color: "#8B7B6C",
    fontSize: 8,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 10,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#8B7B6C",
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 15,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 30,
    gap: 12,
    marginBottom: 20,
  },
  navCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  navIconContainer: {
    marginBottom: 8,
  },
  navIconImage: {
    width: 40,
    height: 40,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B5B4F",
  },
  featuredSection: {
    paddingHorizontal: 15,
    paddingBottom: 120,
  },
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B7B6C",
  },
  seeAll: {
    fontSize: 13,
    color: "#8B7B6C",
    fontWeight: "600",
  },
  museumCardsContainer: {
    gap: 14,
    paddingBottom: 20,
  },
  museumCard: {
    width: 220,
    height: 280,
    borderRadius: 49,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  museumImage: {
    width: "100%",
    height: "100%",
  },
  museumCardOverlay: {
    position: "absolute",
    bottom: 15,
    left: 15,
    right: 35,
  },
  museumTitleBubble: {
    backgroundColor: "rgba(158, 157, 157, 0.5)",
    borderRadius: 30,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  museumCardTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
});