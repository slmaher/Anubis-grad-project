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
const CARD_BG = "rgba(255,255,255,0.6)";
const LIGHT = "#EDE6DF";
const BORDER = "rgba(255,255,255,0.55)";
const ACCENT = "#7A6650";

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
                  size={20}
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
            contentContainerStyle={styles.scrollContent}
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
                    size={40}
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
                    size={38}
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
                    size={40}
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
                  <Ionicons name="location-outline" size={40} color="#66513B" />
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
                    size={16}
                    color={ACCENT}
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
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -120,
    left: -90,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  bgGlowBottom: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    bottom: -180,
    right: -120,
    backgroundColor: "rgba(224, 215, 205, 0.55)",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  topBar: {
    backgroundColor: "transparent",
    paddingTop: 62,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(224,215,205,0.9)",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: DARK,
  },
  chatButton: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
  },
  chatText: {
    color: MUTED,
    fontSize: 8.5,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 10,
    marginTop: 2,
    maxWidth: 62,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: ACCENT,
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 20,
    letterSpacing: 0.2,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 26,
    justifyContent: "center",
  },
  navCard: {
    width: "47%",
    minHeight: 120,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD_BG,
    borderWidth: 1.4,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  navIconContainer: {
    marginBottom: 16,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK,
    textAlign: "center",
  },
  featuredSection: {
    paddingLeft: 16,
    paddingRight: 0,
  },
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 16,
    marginBottom: 14,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: ACCENT,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: BORDER,
  },
  seeAll: {
    fontSize: 12.5,
    color: ACCENT,
    fontWeight: "700",
  },
  museumCardsContainer: {
    gap: 16,
    paddingRight: 16,
    paddingBottom: 10,
  },
  museumCard: {
    width: 220,
    height: 300,
    borderRadius: 34,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  museumImage: {
    width: "100%",
    height: "100%",
  },
  museumCardOverlay: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
  },
  museumTitleBubble: {
    backgroundColor: "rgba(255,255,255,0.34)",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  museumCardTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
    textAlign: "left",
  },
});