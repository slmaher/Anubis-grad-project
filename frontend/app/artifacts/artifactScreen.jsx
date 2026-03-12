import { useRouter } from "expo-router";
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
    image: require("../../assets/images/Anubis-Statue.png"),
    route: "/ArtifactDetailScreen",
  },
  {
    id: 2,
    title: "Tutankhamum mask",
    image: require("../../assets/images/tutankhamun.png"),
    route: "/ArtifactDetailScreen",
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
  { label: "Home", Icon: HomeIcon, route: "/" },
  { label: "Explore", Icon: ExploreIcon, route: "/ArtifactsScreen" },
  { label: "Scan", Icon: ScanIcon, route: "/Scan" },
  { label: "Events", Icon: EventsIcon, route: "/EventsScreen" },
  { label: "Community", Icon: CommunityIcon, route: "/Community" },
];

export default function ArtifactsScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../assets/images/bg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
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
                onPress={() => router.push(item.route)}
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
