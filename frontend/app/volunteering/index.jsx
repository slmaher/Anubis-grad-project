import React, { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

const DARK = "#2C2010";
const MUTED = "#8B7B6C";
const LIGHT = "#EDE6DF";
const CARD_BG = "rgba(249,247,244,0.98)";
const BORDER = "#E5DED5";
const ACCENT = "#B8965A";

const volunteerItems = [
  {
    id: "v1",
    title: "Museum Tour Guide",
    desc: "Help visitors discover artifacts and share Egyptian stories through guided tours.",
    location: "National Museum",
    schedule: "Weekends",
    duration: "4 hrs/week",
    icon: "account-tie-outline",
  },
  {
    id: "v2",
    title: "Heritage Garden Care",
    desc: "Maintain heritage gardens and learn about native Egyptian botanical traditions.",
    location: "Botanical Gardens",
    schedule: "Flexible",
    duration: "3 hrs/week",
    icon: "sprout-outline",
  },
  {
    id: "v3",
    title: "Art Workshop Assistant",
    desc: "Support children in hands-on art and craft workshops inspired by Egyptian culture.",
    location: "Cultural Center",
    schedule: "Saturdays",
    duration: "2 hrs/week",
    icon: "palette-outline",
  },
];

const donateItems = [
  {
    id: "d1",
    title: "Artifact Restoration Fund",
    desc: "Help restore fragile artifacts and preserve cultural heritage for future generations.",
    amount: "150 EGP",
    icon: "hammer-wrench",
  },
  {
    id: "d2",
    title: "Student Access Program",
    desc: "Sponsor museum access and educational materials for students and young explorers.",
    amount: "100 EGP",
    icon: "school-outline",
  },
  {
    id: "d3",
    title: "Community Exhibits",
    desc: "Support rotating exhibits and local events that bring history closer to communities.",
    amount: "200 EGP",
    icon: "image-filter-hdr",
  },
];

function MetaPill({ icon, text }) {
  return (
    <View style={styles.metaPill}>
      <MaterialCommunityIcons name={icon} size={13} color={MUTED} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function VolunteerCard({ item, onPress, isJoined }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBadge}>
          <MaterialCommunityIcons name={item.icon} size={20} color={ACCENT} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.desc}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <MetaPill icon="map-marker-outline" text={item.location} />
        <MetaPill icon="calendar-month-outline" text={item.schedule} />
        <MetaPill icon="clock-outline" text={item.duration} />
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, isJoined && styles.primaryBtnJoined]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.btnRow}>
          {isJoined ? (
            <MaterialCommunityIcons name="check-circle" size={14} color="#fff" />
          ) : null}
          <Text style={styles.primaryBtnText}>{isJoined ? "Joined" : "Sign up"}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function DonateCard({ item, onPress }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBadge}>
          <MaterialCommunityIcons name={item.icon} size={20} color={ACCENT} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.desc}</Text>
        </View>
      </View>

      <View style={styles.donateFooter}>
        <Text style={styles.amountLabel}>Suggested amount</Text>
        <Text style={styles.amountValue}>{item.amount}</Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={onPress} activeOpacity={0.9}>
        <Text style={styles.primaryBtnText}>Donate now</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function VolunteeringScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("volunteer");
  const [joinedIds, setJoinedIds] = useState([]);

  const activeData = useMemo(
    () => (activeTab === "volunteer" ? volunteerItems : donateItems),
    [activeTab]
  );

  const handleAction = (item) => {
    const action = activeTab === "volunteer" ? "signed up" : "donated";
    Alert.alert("Success", `You ${action} for \"${item.title}\".`);
  };

  const handleVolunteerSignUp = (item) => {
    if (joinedIds.includes(item.id)) {
      Alert.alert("Already joined", `You already joined \"${item.title}\".`);
      return;
    }

    Alert.alert(
      "Confirm sign up",
      `Do you want to join \"${item.title}\"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Join",
          onPress: () => {
            setJoinedIds((prev) => [...prev, item.id]);
            Alert.alert("Success", `You are now signed up for \"${item.title}\".`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={LIGHT} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t("common.back")}
            >
              <MaterialCommunityIcons name="chevron-left" size={24} color={DARK} />
            </TouchableOpacity>

            <Text style={styles.title}>{t("community.volunteering")}</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.toggleWrap}>
            <TouchableOpacity
              style={[styles.toggleBtn, activeTab === "donate" && styles.toggleBtnActive]}
              onPress={() => setActiveTab("donate")}
              activeOpacity={0.9}
            >
              <Text style={[styles.toggleText, activeTab === "donate" && styles.toggleTextActive]}>
                Donate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, activeTab === "volunteer" && styles.toggleBtnActive]}
              onPress={() => setActiveTab("volunteer")}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.toggleText,
                  activeTab === "volunteer" && styles.toggleTextActive,
                ]}
              >
                Volunteer
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>
            {activeTab === "volunteer"
              ? "Volunteering opportunities"
              : "Donation campaigns"}
          </Text>

          {activeTab === "volunteer" ? (
            <Text style={styles.helperText}>{joinedIds.length} joined opportunities</Text>
          ) : null}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {activeData.map((item) =>
              activeTab === "volunteer" ? (
                <VolunteerCard
                  key={item.id}
                  item={item}
                  isJoined={joinedIds.includes(item.id)}
                  onPress={() => handleVolunteerSignUp(item)}
                />
              ) : (
                <DonateCard key={item.id} item={item} onPress={() => handleAction(item)} />
              )
            )}
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
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 6,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  title: {
    color: DARK,
    fontSize: 20,
    fontWeight: "800",
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  toggleWrap: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  toggleBtnActive: {
    backgroundColor: "rgba(184, 150, 90, 0.2)",
  },
  toggleText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "700",
  },
  toggleTextActive: {
    color: DARK,
  },
  sectionTitle: {
    color: "#7D654F",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  helperText: {
    color: MUTED,
    fontSize: 12,
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 22,
    gap: 12,
  },
  card: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(184, 150, 90, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(184, 150, 90, 0.24)",
    marginRight: 10,
  },
  titleBlock: {
    flex: 1,
  },
  cardTitle: {
    color: DARK,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  cardDesc: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  metaText: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "600",
  },
  donateFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(184, 150, 90, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(184, 150, 90, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  amountLabel: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "600",
  },
  amountValue: {
    color: DARK,
    fontSize: 13,
    fontWeight: "800",
  },
  primaryBtn: {
    alignSelf: "flex-start",
    backgroundColor: DARK,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  primaryBtnJoined: {
    backgroundColor: "#4F5A39",
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
