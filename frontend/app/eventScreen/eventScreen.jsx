import { useRouter } from "expo-router";
import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const DARK = "#2C2010";
const MUTED = "#9A8C7A";
const ACCENT = "#B8965A";
const DIVIDER = "rgba(215, 196, 168, 0.35)";

export default function EventsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();

  const isSmallScreen = width < 370;
  const horizontalPadding = width > 600 ? 32 : 22;
  const titleSize = Math.max(31, Math.min(42, width * 0.105));
  const titleLineHeight = Math.round(titleSize * 1.16);
  const bodyBottomPadding = Math.max(28, Math.min(56, height * 0.055));

  return (
    <ImageBackground
      source={require("../../assets/images/events-bg.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.overlayBase} />
      <View style={styles.overlayVignette} />

      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.backBtnWrap, { paddingLeft: horizontalPadding }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.content,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: bodyBottomPadding,
            },
          ]}
        >
          <View style={styles.heroBlock}>
            <Text
              style={[
                styles.title,
                { fontSize: titleSize, lineHeight: titleLineHeight },
              ]}
            >
              {t("events_hero.title_line_1")}
              {"\n"}
              {t("events_hero.title_line_2")}
            </Text>

            <Text
              style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}
            >
              {t("events_hero.subtitle")}
            </Text>
          </View>

          <View style={styles.footerBlock}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>23</Text>
                <Text style={styles.statLabel}>
                  {t("events_hero.stat_all")}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>
                  {t("events_hero.stat_active")}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>17</Text>
                <Text style={styles.statLabel}>
                  {t("events_hero.stat_upcoming")}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.findBtn, isSmallScreen && styles.findBtnSmall]}
              activeOpacity={0.9}
              onPress={() => router.push("/events/eventsList")}
            >
              <Text style={styles.findBtnTxt}>
                {t("events_hero.find_nearest")}
              </Text>
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={18}
                color={ACCENT}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  overlayBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 6, 2, 0.4)",
  },

  overlayVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20, 12, 6, 0.28)",
  },

  safeArea: {
    flex: 1,
  },

  backBtnWrap: {
    paddingTop: 20,
  },

  backBtn: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "rgba(25, 18, 10, 0.35)",
    borderWidth: 1,
    borderColor: DIVIDER,
  },

  backArrow: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 28,
  },

  content: {
    flex: 1,
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },

  heroBlock: {
    marginTop: 20,
    width: "92%",
  },

  footerBlock: {
    marginTop: 16,
  },

  title: {
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.42)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },

  subtitle: {
    fontSize: 16,
    color: "rgba(255, 243, 227, 0.9)",
    lineHeight: 20,
  },

  subtitleSmall: {
    fontSize: 15,
    lineHeight: 19,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: DIVIDER,
    borderBottomColor: DIVIDER,
    backgroundColor: "rgba(38, 27, 15, 0.22)",
    borderRadius: 16,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 40,
  },

  statLabel: {
    fontSize: 12,
    color: "rgba(231, 214, 189, 0.86)",
    marginTop: 2,
    letterSpacing: 0.25,
  },

  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(227, 203, 169, 0.35)",
  },

  findBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 250, 244, 0.2)",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: "rgba(229, 209, 180, 0.75)",
    gap: 10,
    alignSelf: "center",
    minWidth: 210,
  },

  findBtnSmall: {
    width: "100%",
    minWidth: 0,
  },

  findBtnTxt: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
