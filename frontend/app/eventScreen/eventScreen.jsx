import { useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EventsScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/events-bg.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Dark overlay */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        {/* Bottom content */}
        <View style={styles.bottomContent}>
          {/* Title */}
          <Text style={styles.title}>Ready for{"\n"}today's event?</Text>

          <Text style={styles.subtitle}>
            Let us find you an event for your interest
          </Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>17</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>23</Text>
              <Text style={styles.statLabel}>All</Text>
            </View>
          </View>

          {/* Find nearest event button */}
          <TouchableOpacity
            style={styles.findBtn}
            activeOpacity={0.85}
            onPress={() => router.push("/events/eventsList")}
          >
            <Text style={styles.findBtnIcon}>📍</Text>
            <Text style={styles.findBtnTxt}>Find nearest event</Text>
          </TouchableOpacity>
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

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 8, 0, 0.4)",
  },

  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },

  // Back button
  backBtn: {
    marginTop: 8,
    marginLeft: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
  },

  backArrow: {
    color: "#fff",
    lineHeight: 36,
  },

  // Bottom content
  bottomContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },

  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 42,
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.92)",
    marginBottom: 450,
    lineHeight: 20,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 38,
  },

  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Find event button
  findBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    gap: 8,
    alignSelf: "center",
    paddingLeft: 20,
    paddingRight: 28,
  },

  findBtnIcon: {
    fontSize: 16,
  },

  findBtnTxt: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
});