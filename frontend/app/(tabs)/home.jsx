import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import MenuScreen from "../menu/menuScreen";
import { api } from "../api/client";

const DARK = "#2C2010";
const MUTED = "#8B7B6C";
const CARD_BG = "rgba(255,255,255,0.6)";
const LIGHT = "#EDE6DF";
const BORDER = "rgba(255,255,255,0.55)";
const ACCENT = "#644b2f";

const FEATURED_MUSEUM_NAMES = [
  "Grand Egyptian Museum (GEM)",
  "Egyptian Museum (Tahrir)",
  "National Museum of Egyptian Civilization (NMEC)",
  "Museum of Islamic Art",
];

function getFeaturedMuseumImage(name) {
  switch (name) {
    case "Grand Egyptian Museum (GEM)":
      return require("../../assets/images/grand-museum.png");
    case "Egyptian Museum (Tahrir)":
      return require("../../assets/images/egyptian-museum.png");
    case "National Museum of Egyptian Civilization (NMEC)":
      return require("../../assets/images/The-National-Museum-Of-Egypt.png");
    case "Museum of Islamic Art":
      return require("../../assets/images/Museum-of-Islamic-Art.jpg");
    default:
      return require("../../assets/images/grand-museum.png");
  }
}

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [museums, setMuseums] = useState([]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const result = await api.getMuseums();
        if (isMounted) {
          setMuseums(result?.data || []);
        }
      } catch (err) {
        console.error("Failed to load featured museums", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredMuseums = useMemo(() => {
    return FEATURED_MUSEUM_NAMES.map((name) =>
      museums.find((museum) => museum.name === name),
    ).filter(Boolean);
  }, [museums]);

  const openMuseumProfile = (museum) => {
    const realId = museum._id || museum.id;

    router.push({
      pathname: "/museum-profile",
      params: {
        id: realId,
        museumId: realId,
        name: museum.name,
        museumName: museum.name,
        museumLookupName: museum.name,
        city: museum.city,
        location: museum.location,
        description: museum.description,
        imageUrl: museum.imageUrl,
        hours: museum.openingHours,
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.backgroundLayer}>
        <View style={styles.bgGlowTop} />
        <View style={styles.bgGlowBottom} />

        <View style={styles.container}>
          <View style={styles.topBar}>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setMenuVisible(true)}
              >
                <MaterialCommunityIcons name="menu" size={24} color="#7A6650" />
              </TouchableOpacity>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.tourGuideButton}
                  onPress={() => router.push("/tour-guide")}
                >
                  <Text style={styles.tourGuideButtonText}>
                    Need a Tour Guide?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.smallHeaderButton}
                  onPress={() => router.push("/faq/FAQ-screens")}
                >
                  <MaterialCommunityIcons
                    name="frequently-asked-questions"
                    size={20}
                    color="#755B42"
                  />
                  <Text style={styles.smallHeaderButtonText}>FAQ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.smallHeaderButton}
                  onPress={() => router.push("/ai/chatbot")}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={20}
                    color="#755B42"
                  />
                  <Text style={styles.smallHeaderButtonText}>
                    {t("home.chat_ai")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.title}>{t("home.title")}</Text>

            <View style={styles.cardsGrid}>
              <TouchableOpacity
                style={styles.navCard}
                onPress={() => router.push("/explore")}
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

            <View style={styles.featuredSection}>
              <View style={styles.featuredHeader}>
                <Text style={styles.featuredTitle}>{t("home.featured")}</Text>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => router.push("/explore")}
                >
                  <Text style={styles.seeAll}>{t("home.see_all")}</Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={16}
                    color={ACCENT}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.museumCardsContainer}
              >
                {featuredMuseums.map((museum) => (
                  <TouchableOpacity
                    key={museum._id || museum.id || museum.name}
                    style={styles.museumCard}
                    onPress={() => openMuseumProfile(museum)}
                  >
                    <Image
                      source={getFeaturedMuseumImage(museum.name)}
                      style={styles.museumImage}
                      resizeMode="cover"
                    />
                    <View style={styles.museumCardOverlay}>
                      <View style={styles.museumTitleBubble}>
                        <Text style={styles.museumCardTitle}>
                          {museum.name}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.artifactSection}>
              <View style={styles.featuredHeader}>
                <Text style={styles.featuredTitle}>
                  {t("home.egyptian_artifacts_abroad")}
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.artifactCardsContainer}
              >
                <TouchableOpacity
                  style={[styles.artifactCard, styles.artifactCardGold]}
                  onPress={() =>
                    router.push({
                      pathname: "/artifacts/artifactDetailsScreen",
                      params: { collection: "british" },
                    })
                  }
                  activeOpacity={0.9}
                >
                  <View style={{ padding: 16 }}>
                    <View style={styles.artifactCardIconWrap}>
                      <MaterialCommunityIcons
                        name="cube-outline"
                        size={24}
                        color="#1C1208"
                      />
                    </View>
                    <Text style={styles.artifactCardTitle}>British Museum</Text>
                    <Text style={styles.artifactCardText}>
                      {t("home_artifacts.british_desc")}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.artifactCard, styles.artifactCardDark]}
                  onPress={() =>
                    router.push({
                      pathname: "/artifacts/artifactDetailsScreen",
                      params: { collection: "rosicrucian" },
                    })
                  }
                  activeOpacity={0.9}
                >
                  <View style={{ padding: 16 }}>
                    <View style={styles.artifactCardIconWrapAlt}>
                      <MaterialCommunityIcons
                        name="cube-outline"
                        size={24}
                        color="#F6E6BC"
                      />
                    </View>
                    <Text
                      style={[
                        styles.artifactCardTitle,
                        styles.artifactCardTitleLight,
                      ]}
                    >
                      Rosicrucian Museum
                    </Text>
                    <Text
                      style={[
                        styles.artifactCardText,
                        styles.artifactCardTextLight,
                      ]}
                    >
                      {t("home_artifacts.rosicrucian_desc")}
                    </Text>
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginLeft: "auto",
  },
  smallHeaderButton: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
    borderWidth: 1,
    borderColor: "rgba(220, 220, 220, 0.95)",
  },
  smallHeaderButtonText: {
    color: MUTED,
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 10,
    marginTop: 2,
    maxWidth: 62,
  },
  tourGuideButton: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 0,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
    borderWidth: 1,
    borderColor: "rgba(208, 208, 208, 0.95)",
  },

  tourGuideButtonText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 15,
    includeFontPadding: false,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
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
  artifactSection: {
    paddingLeft: 16,
    paddingRight: 0,
    marginTop: 8,
    marginBottom: 10,
  },
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 16,
    marginBottom: 14,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "700",
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
  artifactCardsContainer: {
    gap: 14,
    paddingRight: 16,
    paddingBottom: 12,
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
  artifactCard: {
    width: 200,
    minHeight: 190,
    borderRadius: 28,
    padding: 0,
    justifyContent: "flex-end",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 7,
  },
  artifactCardGold: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: ACCENT,
  },
  artifactCardDark: {
    backgroundColor: ACCENT,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  artifactCardIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  artifactCardIconWrapAlt: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  artifactCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1C1208",
    marginTop: 12,
  },
  artifactCardTitleLight: {
    color: "#F6E6BC",
  },
  artifactCardText: {
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(28, 18, 8, 0.8)",
    marginTop: 8,
  },
  artifactCardTextLight: {
    color: "rgba(246,230,188,0.78)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: "rgba(18, 17, 15, 0.28)",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  cardOverlayText: {
    color: "#FFF8E8",
    fontSize: 12.5,
    fontWeight: "700",
  },
});
