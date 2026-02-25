import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={styles.container}>
      {/* Header with hamburger menu */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIconText}>🔍</Text>
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
            <View style={styles.chatIconContainer}>
              <Text style={styles.chatBubble}>💬</Text>
            </View>
            <Text style={styles.chatText}>Chat with{"\n"}AI</Text>
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
          {/* Museums Card - UPDATED WITH NAVIGATION */}
          <TouchableOpacity 
            style={styles.navCard}
            onPress={() => router.push("/(tabs)/explore")}
          >
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>🏛️</Text>
            </View>
            <Text style={styles.navLabel}>Museums</Text>
          </TouchableOpacity>

          {/* Souvenirs Card */}
          <TouchableOpacity 
            style={styles.navCard}
            onPress={() => router.push("/marketplace")}
          >
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>🎁</Text>
            </View>
            <Text style={styles.navLabel}>Souvenirs</Text>
          </TouchableOpacity>

          {/* Map Card */}
          <TouchableOpacity 
            style={styles.navCard}
            onPress={() => router.push("/map")}
          >
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>🗺️</Text>
            </View>
            <Text style={styles.navLabel}>Map</Text>
          </TouchableOpacity>

          {/* Tickets Card */}
          <TouchableOpacity 
            style={styles.navCard}
            onPress={() => router.push("/tickets")}
          >
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>🎫</Text>
            </View>
            <Text style={styles.navLabel}>Tickets</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Section */}
        <View style={styles.featuredSection}>
          <View style={styles.featuredHeader}>
            <Text style={styles.featuredTitle}>Featured</Text>
            {/* See all Button - UPDATED WITH NAVIGATION */}
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
            {/* Grand Egyptian Museum Card - UPDATED WITH NAVIGATION */}
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
                <Text style={styles.museumCardTitle}>Grand Egyptian{"\n"}Museum</Text>
              </View>
            </TouchableOpacity>

            {/* Egyptian Museum Card - UPDATED WITH NAVIGATION */}
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
                <Text style={styles.museumCardTitle}>Egyptian{"\n"}Museum</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navItemIcon}>🏛</Text>
          <Text style={[styles.navItemLabel, styles.navItemActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navItemIcon}>🧭</Text>
          <Text style={styles.navItemLabel}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navItemIcon}>📷</Text>
          <Text style={styles.navItemLabel}>Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navItemIcon}>📅</Text>
          <Text style={styles.navItemLabel}>Events</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navItemIcon}>👥</Text>
          <Text style={styles.navItemLabel}>Community</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8DDD0",
  },
  topBar: {
    backgroundColor: "#E8DDD0",
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
    color: "#000",
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
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
  },
  searchIconText: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  chatButton: {
    backgroundColor: "#E8DDD0",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 75,
  },
  chatIconContainer: {
    marginBottom: 2,
  },
  chatBubble: {
    fontSize: 16,
  },
  chatText: {
    color: "#000",
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 11,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#E8DDD0",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#E8DDD0",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    gap: 12,
    marginBottom: 20,
    backgroundColor: "#E8DDD0",
  },
  navCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#E0D9CE",
  },
  navIconContainer: {
    marginBottom: 8,
  },
  navIcon: {
    fontSize: 36,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  featuredSection: {
    paddingHorizontal: 15,
    paddingBottom: 100,
    backgroundColor: "#E8DDD0",
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
    color: "#000",
  },
  seeAll: {
    fontSize: 13,
    color: "#D4AF37",
    fontWeight: "600",
  },
  museumCardsContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  museumCard: {
    width: 180,
    height: 220,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  museumImage: {
    width: "100%",
    height: "100%",
  },
  museumCardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    padding: 12,
  },
  museumCardTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 18,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#E8DDD0",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
  },
  navItemIcon: {
    fontSize: 22,
  },
  navItemLabel: {
    fontSize: 10,
    color: "#999",
    fontWeight: "500",
  },
  navItemActive: {
    color: "#D4AF37",
    fontWeight: "600",
  },
});