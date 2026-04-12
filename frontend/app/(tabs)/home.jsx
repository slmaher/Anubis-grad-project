import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import MenuScreen from "../menu/menuScreen";

const DARK = "#2C2010";
const MUTED = "#8B7B6C";
const CARD_BG = "rgba(249,247,244,0.98)";
const LIGHT = "#EDE6DF";
const BORDER = "#E5DED5";
const ACCENT = "#46392c";

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.backgroundLayer}>
        <View style={styles.bgGlowTop} />
        <View style={styles.bgGlowBottom} />

        <View style={styles.container}>
          {/* Header with hamburger menu */}
          <View style={styles.topBar}>
            <View style={styles.searchContainer}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setMenuVisible(true)}
              >
                <MaterialCommunityIcons name="menu" size={24} color="#7A6650" />
              </TouchableOpacity>

              <View style={styles.searchBar}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={18}
                  color="#857565"
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder={t("home.search")}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#9C8F84"
                />
              </View>

              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => router.push("/ai/chatbot")}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color="#755B42"
                />
                <Text style={styles.chatText}>{t("home.chat_ai")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <Text style={styles.title}>{t("home.title")}</Text>

            {/* Navigation Cards Grid */}
            <View style={styles.cardsGrid}>
              {/* Museums Card */}
              <TouchableOpacity
                style={styles.navCard}
                onPress={() => router.push("/(tabs)/explore")}
              >
                <View style={styles.navIconContainer}>
                  <MaterialCommunityIcons
                    name="bank-outline"
                    size={34}
                    color="#66513B"
                  />
                </View>
                <Text style={styles.navLabel}>{t("home.museums")}</Text>
              </TouchableOpacity>

              {/* Souvenirs Card */}
              <TouchableOpacity
                style={styles.navCard}
                onPress={() => router.push("/marketplace")}
              >
                <View style={styles.navIconContainer}>
                  <Ionicons
                    name="bag-handle-outline"
                    size={32}
                    color="#66513B"
                  />
                </View>
                <Text style={styles.navLabel}>{t("home.souvenirs")}</Text>
              </TouchableOpacity>

              {/* Tickets Card */}
              <TouchableOpacity
                style={styles.navCard}
                onPress={() => router.push("/tickets")}
              >
                <View style={styles.navIconContainer}>
                  <MaterialCommunityIcons
                    name="ticket-confirmation-outline"
                    size={34}
                    color="#66513B"
                  />
                </View>
                <Text style={styles.navLabel}>{t("home.tickets")}</Text>
              </TouchableOpacity>

              {/* Map Card */}
              <TouchableOpacity
                style={styles.navCard}
                onPress={() => router.push("/map")}
              >
                <View style={styles.navIconContainer}>
                  <Ionicons name="location-outline" size={34} color="#66513B" />
                </View>
                <Text style={styles.navLabel}>{t("home.map")}</Text>
              </TouchableOpacity>
            </View>

            {/* Featured Section */}
            <View style={styles.featuredSection}>
              <View style={styles.featuredHeader}>
                <Text style={styles.featuredTitle}>{t("home.featured")}</Text>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => router.push("/(tabs)/explore")}
                >
                  <Text style={styles.seeAll}>{t("home.see_all")}</Text>
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={14}
                    color="#685440"
                  />
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
                  onPress={() =>
                    router.push({
                      pathname: "/museum-profile",
                      params: {
                        id: 1,
                        name: t("home.grand_museum"),
                        museumLookupName: "Grand Egyptian Museum",
                      },
                    })
                  }
                >
                  <Image
                    source={require("../../assets/images/grand-museum.png")}
                    style={styles.museumImage}
                    resizeMode="cover"
                  />
                  <View style={styles.museumCardOverlay}>
                    <View style={styles.museumTitleBubble}>
                      <Text style={styles.museumCardTitle}>
                        {t("home.grand_museum")}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Egyptian Museum Card */}
                <TouchableOpacity
                  style={styles.museumCard}
                  onPress={() =>
                    router.push({
                      pathname: "/museum-profile",
                      params: {
                        id: 2,
                        name: t("home.egyptian_museum"),
                        museumLookupName: "Egyptian Museum",
                      },
                    })
                  }
                >
                  <Image
                    source={require("../../assets/images/egyptian-museum.png")}
                    style={styles.museumImage}
                    resizeMode="cover"
                  />
                  <View style={styles.museumCardOverlay}>
                    <View style={styles.museumTitleBubble}>
                      <Text style={styles.museumCardTitle}>
                        {t("home.egyptian_museum")}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>

      {menuVisible && <MenuScreen onClose={() => setMenuVisible(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundLayer: {
    flex: 1,
    backgroundColor: LIGHT,
    position: "relative",
  },
  bgGlowTop: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -120,
    left: -80,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
  },
  bgGlowBottom: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    bottom: -170,
    right: -120,
    backgroundColor: "rgba(224, 215, 205, 0.6)",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  topBar: {
    backgroundColor: "transparent",
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  menuButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(224,215,205,0.9)",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 8,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: DARK,
  },
  chatButton: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 62,
    borderWidth: 1,
    borderColor: BORDER,
  },
  chatText: {
    color: MUTED,
    fontSize: 8,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 10,
    marginTop: 1,
    maxWidth: 60,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: DARK,
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 18,
    letterSpacing: 0.2,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 22,
  },
  navCard: {
    width: "48.5%",
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 112,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  navIconContainer: {
    marginBottom: 10,
  },
  navLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: DARK,
  },
  featuredSection: {
    paddingHorizontal: 16,
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
    fontWeight: "700",
    color: DARK,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: BORDER,
  },
  seeAll: {
    fontSize: 12,
    color: DARK,
    fontWeight: "700",
  },
  museumCardsContainer: {
    gap: 14,
    paddingBottom: 22,
    paddingRight: 6,
  },
  museumCard: {
    width: 236,
    height: 174,
    borderRadius: 22,
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
    bottom: 13,
    left: 13,
    right: 36,
  },
  museumTitleBubble: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 18,
    padding: 11,
    borderWidth: 1,
    borderColor: BORDER,
  },
  museumCardTitle: {
    color: DARK,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
    textAlign: "center",
  },
});
