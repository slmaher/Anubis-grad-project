import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");
const FEATURED_W = width * 0.42;
const FEATURED_H = FEATURED_W * 1.62;
const COLLECTION_W = width * 0.36;
const COLLECTION_H = COLLECTION_W * 1.55;

const DARK = "#78582d";
const MUTED = "#6E6E6E";

const featuredArtifacts = [
  {
    id: 1,
    title: "Anubis statue",
    description:
      "Ancient Egyptian god of mummification and the afterlife, depicted with a jackal head and human body. This exquisite replica captures the mysterious essence of one of Egypt's most iconic deities.",
    image: require("../../assets/images/Anubis-Statue.png"),
    imageKey: "anubis",
    modelKey: "anubis",
  },
  {
    id: 2,
    title: "Tutankhamun mask",
    description:
      "The legendary golden death mask of the young pharaoh Tutankhamun. This stunning piece represents one of the most famous treasures of ancient Egypt, crafted with incredible detail and historical accuracy.",
    image: require("../../assets/images/tutankhamun.jpg"),
    imageKey: "tutankhamun",
  },
];

const collections = [
  { id: 1, image: require("../../assets/images/exploreCollection1.png") },
  { id: 2, image: require("../../assets/images/exploreCollection2.png") },
  { id: 3, image: require("../../assets/images/exploreCollection3.png") },
];

const tabs = [
  {
    key: "home",
    label: "Home",
    route: "/(tabs)/home",
    Icon: () => <Feather name="home" size={24} color="#2C2010" />,
  },
  {
    key: "explore",
    label: "Explore",
    route: "/(tabs)/explore",
    Icon: () => <MaterialIcons name="explore" size={24} color="#2C2010" />,
  },
  {
    key: "scan",
    label: "Scan",
    route: "/(tabs)/scan",
    Icon: () => <Ionicons name="scan" size={24} color="#2C2010" />,
  },
  {
    key: "events",
    label: "Events",
    route: "/eventScreen/eventScreen",
    Icon: () => (
      <MaterialIcons name="event-available" size={24} color="#2C2010" />
    ),
  },
  {
    key: "community",
    label: "Community",
    route: "/(tabs)/community",
    Icon: () => <FontAwesome name="group" size={22} color="#2C2010" />,
  },
];

export default function ArtifactsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCollections, setShowAllCollections] = useState(false);

  const filteredArtifacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return featuredArtifacts;

    return featuredArtifacts.filter((artifact) =>
      `${artifact.title} ${artifact.description}`.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const handleArtifactPress = (artifact) => {
    router.push({
      pathname: "/artifacts/artifactDetailsScreen",
      params: {
        id: artifact.id,
        title: artifact.title,
        description: artifact.description,
        imageKey: artifact.imageKey,
        modelKey: artifact.modelKey,
      },
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/images/beige-background.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <View style={{ width: 34 }} />
          </View>

          <Text style={styles.headerTitle}>Artifact page</Text>
          <Text style={styles.headerSub}>View Art, Culture and History</Text>

          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#8B7B6C" />

            <TextInput
              style={styles.searchInput}
              placeholder="Search artifacts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />

            {searchQuery.trim().length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color="#8B7B6C"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredRow}
          >
            {filteredArtifacts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.featuredCard}
                onPress={() => handleArtifactPress(item)}
                activeOpacity={0.9}
              >
                <Image
                  source={item.image}
                  style={styles.featuredImg}
                  resizeMode="cover"
                />

                <View style={styles.featuredLabel}>
                  <Text style={styles.featuredLabelTxt} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <View style={styles.featuredArrow}>
                    <Text style={styles.featuredArrowTxt}>›</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredArtifacts.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="magnify-close"
                size={34}
                color="#8B7B6C"
              />
              <Text style={styles.emptyTitle}>No artifacts found</Text>
              <Text style={styles.emptyText}>
                Try searching for another artifact name.
              </Text>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Collections</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowAllCollections((prev) => !prev)}
            >
              <Text style={styles.seeAll}>
                {showAllCollections ? "View less" : "View all"}
              </Text>
            </TouchableOpacity>
          </View>

          {showAllCollections ? (
            <View style={styles.collectionsGrid}>
              {collections.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.collectionCard}
                  activeOpacity={0.85}
                >
                  <Image
                    source={item.image}
                    style={styles.collectionImg}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.collectionsRow}
            >
              {collections.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.collectionCard}
                  activeOpacity={0.85}
                >
                  <Image
                    source={item.image}
                    style={styles.collectionImg}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ScrollView>

        <View style={styles.tabBarContainer}>
          <View style={styles.tabBar}>
            <View style={styles.activeBubble} />

            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabButton}
                activeOpacity={0.8}
                onPress={() => router.push(tab.route)}
              >
                <View style={styles.iconContainer}>
                  <tab.Icon />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    index === 0 && styles.tabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  safeArea: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
  },

  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  backButton: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: {
    fontSize: 28,
    color: "#6B6B6B",
    fontWeight: "400",
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: DARK,
    marginBottom: 6,
  },

  headerSub: {
    fontSize: 15,
    color: "#787878",
    fontWeight: "600",
    marginBottom: 14,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    gap: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: DARK,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  featuredRow: {
    paddingHorizontal: 14,
    gap: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  featuredCard: {
    width: FEATURED_W,
    height: FEATURED_H,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#2a1e0e",
  },

  featuredImg: {
    width: "100%",
    height: "100%",
  },

  featuredLabel: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(34, 27, 18, 0.58)",
    borderRadius: 18,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 7,
  },

  featuredLabelTxt: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },

  featuredArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  featuredArrowTxt: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "500",
  },

  emptyState: {
    marginHorizontal: 14,
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
  },

  emptyTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "800",
    color: DARK,
  },

  emptyText: {
    marginTop: 4,
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    marginTop: 14,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: DARK,
  },

  seeAll: {
    fontSize: 14,
    color: "#7A7A7A",
    fontWeight: "600",
  },

  collectionsRow: {
    paddingHorizontal: 14,
    gap: 12,
  },

  collectionsGrid: {
    paddingHorizontal: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  collectionCard: {
    width: COLLECTION_W,
    height: COLLECTION_H,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#2a1e0e",
  },

  collectionImg: {
    width: "100%",
    height: "100%",
  },

  tabBarContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 28,
    alignItems: "center",
  },

  tabBar: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 32,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.92)",
    elevation: 12,
    alignItems: "center",
    overflow: "hidden",
    justifyContent: "space-between",
    position: "relative",
  },

  activeBubble: {
    position: "absolute",
    left: 4,
    top: 2,
    width: "19%",
    height: 56,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.96)",
    elevation: 4,
  },

  tabButton: {
    flex: 1,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    paddingHorizontal: 2,
  },

  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  tabLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#2C2010",
    marginTop: 4,
  },

  tabLabelActive: {
    fontWeight: "700",
    color: "#2C2010",
  },
});