import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
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
const COLLECTION_W = width * 0.28;
const COLLECTION_H = COLLECTION_W * 1.5;

const featuredArtifacts = [
  {
    id: 1,
    title: "Anubis statue",
    description:
      "Ancient Egyptian god of mummification and the afterlife, depicted with a jackal head and human body. This exquisite replica captures the mysterious essence of one of Egypt's most iconic deities.",
    image: require("../../assets/images/Anubis-Statue.png"),
    imageKey: "anubis",
  },
  {
    id: 2,
    title: "Tutankhamun mask",
    description:
      "The legendary golden death mask of the young pharaoh Tutankhamun. This stunning piece represents one of the most famous treasures of ancient Egypt, crafted with incredible detail and historical accuracy.",
    image: require("../../assets/images/Grand-Egyptian-Museum.png"),
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
  const params = useLocalSearchParams();

  const handleArtifactPress = (artifact) => {
    router.push({
      pathname: "/artifacts/artifactDetailsScreen",
      params: {
        id: artifact.id,
        title: artifact.title,
        description: artifact.description,
        imageKey: artifact.imageKey,
      },
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/images/bg.png")}
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

            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
                <Image
                  source={require("../../assets/images/search-icon.png")}
                  style={styles.searchIconImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
                <MaterialCommunityIcons
                  name="menu"
                  size={30}
                  color="#4D4D4D"
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.headerTitle}>Artifact page</Text>
          <Text style={styles.headerSub}>View Art, Culture and History</Text>
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
            {featuredArtifacts.map((item) => (
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

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Collections</Text>

            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

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

const DARK = "#2C2010";
const MUTED = "#6E6E6E";

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
    fontSize: 16,
    fontWeight: "500",
    color: "#4F4F4F",
    marginBottom: 4,
  },

  headerSub: {
    fontSize: 12,
    color: "#7B7B7B",
  },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  iconBtn: {
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  searchIconImage: {
    width: 18,
    height: 18,
    tintColor: "#4D4D4D",
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
    fontWeight: "500",
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

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    marginTop: 10,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK,
  },

  seeAll: {
    fontSize: 13,
    color: "#7A7A7A",
    fontWeight: "400",
  },

  collectionsRow: {
    paddingHorizontal: 14,
    gap: 10,
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