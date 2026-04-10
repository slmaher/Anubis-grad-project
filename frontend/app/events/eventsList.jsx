import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

const DARK = "#2C2010";
const MUTED = "#8B7B6C";
const LIGHT = "#EDE6DF";
const CARD_BG = "rgba(249,247,244,0.98)";
const BORDER = "#E5DED5";
const ACCENT = "#B8965A";

const EVENT_IMAGE = {
  uri: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&q=80",
};

const EVENTS = [
  {
    id: "e1",
    museumKey: "grand_egyptian_museum",
    startsAt: "2026-08-17T17:00:00",
  },
  {
    id: "e2",
    museumKey: "grand_egyptian_museum",
    startsAt: "2026-08-23T17:00:00",
  },
  {
    id: "e3",
    museumKey: "grand_egyptian_museum",
    startsAt: "2026-09-02T17:00:00",
  },
];

function EventCard({ title, time, cardHeight, buyTicketLabel }) {
  return (
    <View style={styles.card}>
      <ImageBackground
        source={EVENT_IMAGE}
        style={[styles.cardImage, { height: cardHeight }]}
        resizeMode="cover"
      >
        <View style={styles.cardOverlay}>
          <TouchableOpacity style={styles.ticketBtn} activeOpacity={0.9}>
            <Text style={styles.ticketText}>{buyTicketLabel}</Text>
            <MaterialCommunityIcons name="arrow-right" size={14} color="#fff" />
          </TouchableOpacity>

          <View>
            <Text style={styles.eventTitle}>{title}</Text>
            <View style={styles.timeRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color="rgba(255,255,255,0.9)"
              />
              <Text style={styles.eventTime}>{time}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

export default function EventsListScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();

  const horizontalPadding = width > 600 ? 28 : 16;
  const cardHeight = width < 380 ? 142 : 160;
  const locale = i18n.language || "en";

  const formatEventDate = (isoDate) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const formatEventTime = (isoDate) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const tabs = [
    t("events_list.tabs.all"),
    t("events_list.tabs.now"),
    t("events_list.tabs.upcoming"),
    t("events_list.tabs.past"),
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={LIGHT} />

      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.content, { paddingHorizontal: horizontalPadding }]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t("common.back")}
            >
              <MaterialCommunityIcons name="chevron-left" size={26} color={DARK} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            {tabs.map((label, index) => (
              <TouchableOpacity
                key={label}
                style={[styles.tabItem, index === 0 && styles.tabItemActive]}
              >
                <Text style={[styles.tabText, index === 0 && styles.tabTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.title}>{t("events_list.title")}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>{t("events_list.see_all")}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {EVENTS.map((item) => (
              <View key={item.id} style={styles.timelineItem}>
                <View style={styles.dateRail}>
                  <Text style={styles.date}>{formatEventDate(item.startsAt)}</Text>
                  <View style={styles.line} />
                </View>

                <View style={styles.cardContainer}>
                  <EventCard
                    title={t(`tickets.museums.${item.museumKey}`)}
                    time={formatEventTime(item.startsAt)}
                    cardHeight={cardHeight}
                    buyTicketLabel={t("events_list.buy_ticket")}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    marginTop: 6,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 4,
    gap: 6,
  },
  tabItem: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItemActive: {
    backgroundColor: "rgba(184, 150, 90, 0.2)",
  },
  tabText: {
    fontSize: 13,
    color: MUTED,
    fontWeight: "600",
  },
  tabTextActive: {
    color: DARK,
    fontWeight: "700",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  title: {
    color: DARK,
    fontSize: 24,
    fontWeight: "800",
  },
  seeAll: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: "700",
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 14,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  dateRail: {
    width: 62,
    alignItems: "center",
  },
  date: {
    marginTop: 8,
    color: "#A33C2E",
    fontSize: 12,
    fontWeight: "700",
  },
  line: {
    marginTop: 8,
    width: 2,
    flex: 1,
    backgroundColor: "rgba(139,123,108,0.35)",
    borderRadius: 4,
    minHeight: 96,
  },
  cardContainer: {
    flex: 1,
    paddingBottom: 8,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(44, 32, 16, 0.12)",
  },
  cardImage: {
    justifyContent: "space-between",
  },
  cardOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "rgba(22, 16, 9, 0.34)",
  },
  ticketBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  ticketText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  eventTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timeRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventTime: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 12,
    fontWeight: "600",
  },
});
