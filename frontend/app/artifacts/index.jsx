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

const { width } = Dimensions.get("window");
const CARD_W = (width - 48 - 12) / 2;
const COLLECTION_W = (width - 48 - 20) / 3;

const featuredArtifacts = [
  {
    id: 1,
    title: "Anubis statue",
    description: "Ancient Egyptian god of mummification and the afterlife, depicted with a jackal head and human body. This exquisite replica captures the mysterious essence of one of Egypt's most iconic deities.",
    image: require("../../assets/images/Anubis-Statue.png"),
    imageKey: "anubis", // Key to identify the image
  },
  {
    id: 2,
    title: "Tutankhamun mask",
    description: "The legendary golden death mask of the young pharaoh Tutankhamun. This stunning piece represents one of the most famous treasures of ancient Egypt, crafted with incredible detail and historical accuracy.",
    image: require("../../assets/images/Grand-Egyptian-Museum.png"),
    imageKey: "tutankhamun", // Key to identify the image
  },
];

const collections = [
  { id: 1, image: require("../../assets/images/exploreCollection1.png") },
  { id: 2, image: require("../../assets/images/exploreCollection2.png") },
  { id: 3, image: require("../../assets/images/exploreCollection3.png") },
];

// Icons
const HomeIcon = () => (
  <View style={icon.wrap}>
    <View style={icon.homeRoof} />
    <View style={icon.homeDoor} />
  </View>
);

const ExploreIcon = () => (
  <View style={icon.wrap}>
    <View style={icon.circle}>
      <View style={icon.compassNeedle} />
    </View>
  </View>
);

const ScanIcon = () => (
  <View style={icon.wrap}>
    <View style={icon.scanOuter}>
      <View style={icon.scanInner} />
    </View>
  </View>
);

const EventsIcon = () => (
  <View style={icon.wrap}>
    <View style={icon.calBox}>
      <View style={icon.calTop} />
      <View style={icon.calCheck} />
    </View>
  </View>
);

const CommunityIcon = () => (
  <View style={icon.wrap}>
    <View style={icon.commRow}>
      <View style={icon.commDot} />
      <View style={icon.commDot} />
      <View style={icon.commDot} />
    </View>
    <View style={icon.commRow2}>
      <View style={icon.commDot} />
      <View style={icon.commDot} />
    </View>
  </View>
);

const tabs = [
  { label: "Home", Icon: HomeIcon, route: "/(tabs)/home" },
  { label: "Explore", Icon: ExploreIcon, route: "/(tabs)/explore" },
  { label: "Scan", Icon: ScanIcon, route: "/(tabs)/scan" },
  { label: "Events", Icon: EventsIcon, route: "/EventsScreen" },
  { label: "Community", Icon: CommunityIcon, route: "/(tabs)/community" },
];

export default function ArtifactsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Handle artifact card press - navigate to detail screen with data
  const handleArtifactPress = (artifact) => {
    router.push({
      pathname: "/artifacts/artifactDetailsScreen",
      params: {
        id: artifact.id,
        title: artifact.title,
        description: artifact.description,
        imageKey: artifact.imageKey, // Pass the image identifier
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
        {/* Header */}
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Artifact page</Text>
            <Text style={styles.headerSub}>View Art, Culture and History</Text>
          </View>

          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconTxt}>🔍</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconTxt}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Featured artifacts */}
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
                activeOpacity={0.85}
              >
                <Image
                  source={item.image}
                  style={styles.featuredImg}
                  resizeMode="cover"
                />

                <View style={styles.featuredLabel}>
                  <Text style={styles.featuredLabelTxt}>{item.title}</Text>

                  <View style={styles.featuredArrow}>
                    <Text style={styles.featuredArrowTxt}>›</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Explore Collections */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Collections</Text>

            <TouchableOpacity>
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
                activeOpacity={0.8}
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

        {/* Bottom Tab Bar */}
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.label}
              style={styles.tabItem}
              onPress={() => router.push(tab.route)}
              activeOpacity={0.7}
            >
              <tab.Icon />
              <Text style={styles.tabLabel}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const DARK = "#1a1a1a";
const MUTED = "#666";

/* ======================
   STYLES
   ====================== */

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  safeArea: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  backIcon: {
    fontSize: 24,
    color: DARK,
    fontWeight: "bold",
  },

  headerLeft: { flex: 1 },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: DARK,
  },

  headerSub: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },

  headerIcons: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },

  iconBtn: { padding: 6 },

  iconTxt: { fontSize: 18 },

  featuredRow: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 8,
  },

  featuredCard: {
    width: CARD_W,
    height: CARD_W * 1.4,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#2a1e0e",
  },

  featuredImg: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  featuredLabel: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  featuredLabelTxt: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "500",
    flex: 1,
  },

  featuredArrow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  featuredArrowTxt: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK,
  },

  seeAll: {
    fontSize: 13,
    color: MUTED,
  },

  collectionsRow: {
    paddingHorizontal: 20,
    gap: 10,
  },

  collectionCard: {
    width: COLLECTION_W,
    height: COLLECTION_W * 1.3,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#2a1e0e",
  },

  collectionImg: {
    width: "100%",
    height: "100%",
  },

  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "rgba(255,252,248,0.97)",
    borderTopWidth: 1,
    borderTopColor: "rgba(200,180,150,0.25)",
    paddingBottom: 28,
    paddingTop: 12,
    paddingHorizontal: 8,
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  tabLabel: {
    fontSize: 10,
    color: MUTED,
    fontWeight: "500",
  },
});

/* ======================
   ICON STYLES
   ====================== */

const icon = StyleSheet.create({
  wrap: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Home icon
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: MUTED,
    position: "absolute",
    top: 2,
  },
  homeDoor: {
    width: 12,
    height: 10,
    backgroundColor: MUTED,
    position: "absolute",
    bottom: 2,
  },
  
  // Explore icon
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: MUTED,
    alignItems: "center",
    justifyContent: "center",
  },
  compassNeedle: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: MUTED,
  },
  
  // Scan icon
  scanOuter: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: MUTED,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  scanInner: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: MUTED,
    borderRadius: 2,
  },
  
  // Events/Calendar icon
  calBox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: MUTED,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  calTop: {
    width: 12,
    height: 2,
    backgroundColor: MUTED,
    position: "absolute",
    top: 1,
  },
  calCheck: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: MUTED,
    marginTop: 4,
  },
  
  // Community icon
  commRow: {
    flexDirection: "row",
    gap: 3,
    marginBottom: 3,
  },
  commRow2: {
    flexDirection: "row",
    gap: 3,
  },
  commDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: MUTED,
  },
});