import { useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const profileItems = [
  { icon: "🎫", label: "My tickets", sub: "3 upcoming visits" },
  { icon: "👑", label: "Membership", sub: "Premium" },
  { icon: "⭐", label: "Saved Artifacts", sub: "23 saved items" },
  { icon: "🛍️", label: "Purchases", sub: "Order history & downloading" },
  { icon: "🏆", label: "All achievements", sub: "16 badges earned" },
];

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/beige-background.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            onPress={() => router.push("/settings/settings")}
            style={styles.settingsBtn}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar & Info */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarEmoji}>👩</Text>
              </View>
            </View>
            <Text style={styles.userName}>Melissa peters</Text>
            <Text style={styles.userRole}>Interior designer</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>Lagos, Nigeria</Text>
            </View>
          </View>

          {/* Profile Menu Items */}
          <View style={styles.itemsList}>
            {profileItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.itemRow}
                activeOpacity={0.7}
              >
                <View style={styles.itemIconBox}>
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                </View>
                <View style={styles.itemTextBlock}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemSub}>{item.sub}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const DARK = "#2C2010";
const MUTED = "#9A8C7A";
const GOLD = "#B8965A";
const CARD = "rgba(235, 220, 190, 0.45)";

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 30,
    color: DARK,
    lineHeight: 34,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: GOLD,
    letterSpacing: 0.3,
  },
  settingsBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIcon: { fontSize: 20 },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 8,
  },
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(200,180,150,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { fontSize: 44 },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: GOLD,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationIcon: { fontSize: 12 },
  locationText: { fontSize: 12, color: MUTED },
  itemsList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(200,175,135,0.35)",
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(200,175,135,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemIcon: { fontSize: 18 },
  itemTextBlock: { flex: 1 },
  itemLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK,
    marginBottom: 2,
  },
  itemSub: { fontSize: 11, color: MUTED },
  chevron: {
    fontSize: 24,
    color: MUTED,
    lineHeight: 28,
  },
});
