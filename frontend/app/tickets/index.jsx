import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const DARK = "#2C2010";
const MUTED = "#8B7B6C";
const LIGHT = "#EDE6DF";
const CARD_BG = "rgba(249,247,244,0.98)";
const BORDER = "#E5DED5";
const ACCENT = "#46392c";

export default function Tickets() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const getCurrentDate = () => {
    const date = new Date();
    const language = (i18n.language || "en").split("-")[0];

    if (language === "en") {
      const dayWithSuffix = date.getDate() + getDaySuffix(date.getDate());
      return t("tickets.today_label", {
        date: `${date.toLocaleDateString("en-US", { month: "long" })} ${dayWithSuffix}`,
      });
    }

    const localizedDate = date.toLocaleDateString(i18n.language || "en", {
      month: "long",
      day: "numeric",
    });
    return t("tickets.today_label", { date: localizedDate });
  };

  const getDaySuffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const museums = [
    {
      id: 1,
      nameKey: "grand_egyptian_museum",
      time: "17:00 PM",
      image: require("../../assets/images/grand-museum-night.webp"),
    },
    {
      id: 2,
      nameKey: "egyptian_museum",
      time: "10:00 AM",
      image: require("../../assets/images/egyptian-museum-interior.jpg"),
    },
    {
      id: 3,
      nameKey: "museum_of_islamic_art",
      time: "09:00 AM",
      image: require("../../assets/images/Museum-of-Islamic-Art.jpg"),
    },
    {
      id: 4,
      nameKey: "coptic_museum",
      time: "11:00 AM",
      image: require("../../assets/images/Coptic-Museum.jpg"),
    },
    {
      id: 5,
      nameKey: "national_museum_of_egyptian_civilization",
      time: "14:00 PM",
      image: require("../../assets/images/Egyptian-Civilization.jpg"),
    },
  ];

  const handleBuyTicket = (museum) => {
    router.push({
      pathname: "/tickets/checkout",
      params: {
        museumId: museum.id,
        museumName: t(`tickets.museums.${museum.nameKey}`),
        museumTime: museum.time,
      },
    });
  };

  const filteredMuseums = museums.filter((museum) => {
    const translatedName = t(`tickets.museums.${museum.nameKey}`);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      translatedName.toLowerCase().includes(q) ||
      museum.time.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.backgroundLayer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color={ACCENT}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{t("tickets.title")}</Text>

          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeSection}>
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
          </View>

          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={18} color="#7F7061" />
            <TextInput
              style={styles.searchInput}
              placeholder={t("tickets.search_placeholder")}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9C8F84"
            />
          </View>

          <View style={styles.museumsContainer}>
            {filteredMuseums.map((museum) => (
              <TouchableOpacity
                key={museum.id}
                style={styles.museumCardWrap}
                activeOpacity={0.92}
                onPress={() => handleBuyTicket(museum)}
              >
                <ImageBackground
                  source={museum.image}
                  style={styles.museumCardBackground}
                  imageStyle={styles.museumCardImage}
                >
                  <View style={styles.museumCardOverlay}>
                    <View style={styles.cardTop}>
                      <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={() => handleBuyTicket(museum)}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={t("tickets.buy_ticket")}
                      >
                        <MaterialCommunityIcons
                          name="arrow-right"
                          size={18}
                          color="#fff"
                        />
                      </TouchableOpacity>
                      <Text style={styles.buyTicketText}>
                        {t("tickets.buy_ticket")}
                      </Text>
                    </View>

                    <View style={styles.museumInfoContainer}>
                      <View style={styles.museumNameBackground}>
                        <Text style={styles.museumName}>
                          {t(`tickets.museums.${museum.nameKey}`)}
                        </Text>
                      </View>
                      <View style={styles.museumTimeBackground}>
                        <Text style={styles.museumTime}>{museum.time}</Text>
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}

            {filteredMuseums.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t("tickets.no_results")}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundLayer: {
    flex: 1,
    backgroundColor: LIGHT,
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
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 16,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,

    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: ACCENT,
    letterSpacing: 0.2,
  },
  placeholder: {
    width: 42,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  welcomeSection: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  dateText: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 0,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: DARK,
  },
  museumsContainer: {
    gap: 14,
  },
  museumCardWrap: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  museumCardBackground: {
    width: "100%",
    height: 190,
    justifyContent: "space-between",
  },
  museumCardImage: {
    borderRadius: 20,
  },
  museumCardOverlay: {
    flex: 1,
    backgroundColor: "rgba(32, 23, 14, 0.3)",
    justifyContent: "space-between",
    padding: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
  },
  buyTicketText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    backgroundColor: "rgba(44, 32, 16, 0.5)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.26)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  museumInfoContainer: {
    alignSelf: "flex-start",
    gap: 6,
  },
  museumNameBackground: {
    backgroundColor: "rgba(27, 20, 12, 0.62)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  museumName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  museumTimeBackground: {
    backgroundColor: "rgba(27, 20, 12, 0.62)",
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
  emptyState: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  emptyText: {
    color: MUTED,
    fontSize: 14,
    fontWeight: "600",
  },
});
