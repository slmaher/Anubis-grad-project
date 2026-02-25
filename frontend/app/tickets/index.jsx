import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function Tickets() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Get current date
  const getCurrentDate = () => {
    const date = new Date();
    const options = { month: 'long', day: 'numeric' };
    const dayWithSuffix = date.getDate() + getDaySuffix(date.getDate());
    return `Today's ${date.toLocaleDateString('en-US', { month: 'long' })} ${dayWithSuffix}`;
  };

  const getDaySuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const museums = [
    {
      id: 1,
      name: "Grand Egyptian Museum",
      time: "17:00 PM",
      image: require("../../assets/images/grand-museum-night.webp"),
    },
    {
      id: 2,
      name: "Egyptian Museum",
      time: "10:00 AM",
      image: require("../../assets/images/egyptian-museum-interior.jpg"),
    },
    {
      id: 3,
      name: "Museum of Islamic Art",
      time: "09:00 AM",
      image: require("../../assets/images/Museum-of-Islamic-Art.jpg"),
    },
    {
      id: 4,
      name: "Coptic Museum",
      time: "11:00 AM",
      image: require("../../assets/images/Coptic-Museum.jpg"),
    },
    {
      id: 5,
      name: "National Museum of Egyptian Civilization",
      time: "14:00 PM",
      image: require("../../assets/images/Egyptian-Civilization.jpg"),
    },
  ];

  const handleBuyTicket = (museum) => {
    router.push({
      pathname: "/tickets/checkout",
      params: {
        museumId: museum.id,
        museumName: museum.name,
        museumTime: museum.time,
      }
    });
  };

  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        source={require("../../assets/images/tickets-background.webp")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Tickets</Text>
            
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Date and Welcome */}
            <View style={styles.welcomeSection}>
              <Text style={styles.dateText}>{getCurrentDate()}</Text>
              <Text style={styles.welcomeText}>Welcome!</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Image
                source={require("../../assets/images/search-icon.png")}
                style={styles.searchIconImage}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by location or date"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
            </View>

            {/* Museum Cards */}
            <View style={styles.museumsContainer}>
              {museums.map((museum) => (
                <View key={museum.id} style={styles.museumCard}>
                  <ImageBackground
                    source={museum.image}
                    style={styles.museumCardBackground}
                    imageStyle={styles.museumCardImage}
                  >
                    <View style={styles.museumCardOverlay}>
                      {/* Buy Ticket Button */}
                      <View style={styles.buyTicketContainer}>
                        <Text style={styles.buyTicketText}>Buy ticket</Text>
                        <TouchableOpacity 
                          style={styles.arrowButton}
                          onPress={() => handleBuyTicket(museum)}
                        >
                          <Text style={styles.arrowIcon}>→</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Museum Info at Bottom with Separate Backgrounds */}
                      <View style={styles.museumInfoContainer}>
                        <View style={styles.museumNameBackground}>
                          <Text style={styles.museumName}>{museum.name}</Text>
                        </View>
                        <View style={styles.museumTimeBackground}>
                          <Text style={styles.museumTime}>{museum.time}</Text>
                        </View>
                      </View>
                    </View>
                  </ImageBackground>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#E8DDD0",
  },
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: "#000",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#8B7B6C",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 15,
    color: "#888787",
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B7B6C",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#efefef",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 25,
    gap: 10,
  },
  searchIconImage: {
    width: 18,
    height: 18,
    tintColor: "#666",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },
  museumsContainer: {
    gap: 15,
  },
  museumCard: {
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  museumCardBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },
  museumCardImage: {
    borderRadius: 20,
  },
  museumCardOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    justifyContent: "space-between",
    padding: 15,
  },
  buyTicketContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 8,
  },
  buyTicketText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  arrowIcon: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
  },
  museumInfoContainer: {
    alignSelf: "flex-start",
    gap: 6,
  },
  museumNameBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  museumName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
  },
  museumTimeBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  museumTime: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.95,
  },
});