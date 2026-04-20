import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { getAuthUser, getAuthToken } from "../api/authStorage";
import { addItemToCart } from "../api/cartStorage";

const DARK = "#2C2010";
const MUTED = "#8B7B6C";
const LIGHT = "#EDE6DF";
const CARD_BG = "rgba(249,247,244,0.98)";
const BORDER = "#E5DED5";
const ACCENT = "#B8965A";
const JOINED_STORAGE_KEY = "volunteering_joined_ids";

const fallbackVolunteerItems = [
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

const fallbackDonateItems = [
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

function VolunteerCard({ item, onPress, isJoined, labels }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardAccent} />

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
            <MaterialCommunityIcons
              name="check-circle"
              size={14}
              color="#fff"
            />
          ) : null}
          <Text style={styles.primaryBtnText}>
            {isJoined ? labels.joined : labels.signUp}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function DonateCard({ item, onPress, labels }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardAccent} />

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
        <Text style={styles.amountLabel}>{labels.suggestedAmount}</Text>
        <Text style={styles.amountValue}>{item.amount}</Text>
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Text style={styles.primaryBtnText}>{labels.donateNow}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function VolunteeringScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("volunteer");
  const [joinedIds, setJoinedIds] = useState([]);
  const [joinedHydrated, setJoinedHydrated] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [volunteerItems, setVolunteerItems] = useState(fallbackVolunteerItems);
  const [donateItems, setDonateItems] = useState(fallbackDonateItems);

  const activeData = useMemo(
    () => (activeTab === "volunteer" ? volunteerItems : donateItems),
    [activeTab, volunteerItems, donateItems],
  );

  const localizeVolunteerItem = (item) => {
    const base = `volunteering_screen.items.volunteer.${item.id}`;
    if (!i18n.exists(`${base}.title`)) return item;

    return {
      ...item,
      title: t(`${base}.title`),
      desc: t(`${base}.desc`),
      location: t(`${base}.location`),
      schedule: t(`${base}.schedule`),
      duration: t(`${base}.duration`),
    };
  };

  const localizeDonateItem = (item) => {
    const base = `volunteering_screen.items.donate.${item.id}`;
    if (!i18n.exists(`${base}.title`)) return item;

    return {
      ...item,
      title: t(`${base}.title`),
      desc: t(`${base}.desc`),
    };
  };

  useEffect(() => {
    let isMounted = true;

    const loadJoinedIds = async () => {
      try {
        const raw = await AsyncStorage.getItem(JOINED_STORAGE_KEY);
        if (!isMounted || !raw) return;

        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setJoinedIds(parsed.filter((id) => typeof id === "string"));
        }
      } catch {
        // keep default empty state if storage read fails
      } finally {
        if (isMounted) {
          setJoinedHydrated(true);
        }
      }
    };

    loadJoinedIds();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!joinedHydrated) return;

    AsyncStorage.setItem(JOINED_STORAGE_KEY, JSON.stringify(joinedIds)).catch(
      () => {
        // ignore storage write failure, UI state is still usable
      },
    );
  }, [joinedIds, joinedHydrated]);

  useEffect(() => {
    let isMounted = true;

    const loadScreenData = async () => {
      setIsLoading(true);
      try {
        const [volunteerRes, donationRes] = await Promise.allSettled([
          api.getVolunteerOpportunities(),
          api.getDonationCampaigns(),
        ]);

        if (!isMounted) return;

        if (
          volunteerRes.status === "fulfilled" &&
          Array.isArray(volunteerRes.value?.data) &&
          volunteerRes.value.data.length > 0
        ) {
          setVolunteerItems(
            volunteerRes.value.data.map((item) => ({
              ...item,
              id: item._id || item.id,
            }))
          );
        }

        if (
          donationRes.status === "fulfilled" &&
          Array.isArray(donationRes.value?.data) &&
          donationRes.value.data.length > 0
        ) {
          setDonateItems(
            donationRes.value.data.map((item) => ({
              ...item,
              id: item._id || item.id,
              amount: `${item.amount} ${item.currency || "EGP"}`,
            }))
          );
        }
      } catch {
        if (isMounted) {
          setFeedbackMessage(
            t("volunteering_screen.feedback.live_data_failed"),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadScreenData();

    return () => {
      isMounted = false;
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const refreshScreenData = async () => {
        setIsLoading(true);
        try {
          const [volunteerRes, donationRes] = await Promise.allSettled([
            api.getVolunteerOpportunities(),
            api.getDonationCampaigns(),
          ]);

          if (!isMounted) return;

          if (
            volunteerRes.status === "fulfilled" &&
            Array.isArray(volunteerRes.value?.data)
          ) {
            setVolunteerItems(
              volunteerRes.value.data.length > 0
                ? volunteerRes.value.data.map((item) => ({
                    ...item,
                    id: item._id || item.id,
                  }))
                : fallbackVolunteerItems,
            );
          }

          if (
            donationRes.status === "fulfilled" &&
            Array.isArray(donationRes.value?.data)
          ) {
            setDonateItems(
              donationRes.value.data.length > 0
                ? donationRes.value.data.map((item) => ({
                    ...item,
                    id: item._id || item.id,
                    amount: `${item.amount || item.goalAmount || 0} ${item.currency || "EGP"}`,
                  }))
                : fallbackDonateItems,
            );
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      refreshScreenData();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const handleAction = async (item) => {
    try {
      const amountValue = Number.parseFloat(String(item.amount).split(" ")[0]) || 100;
      
      // Add donation as a cart item
      await addItemToCart({
        id: item.id,
        nameKey: item.title,
        price: amountValue,
        image: null,
        quantity: 1,
      });
      
      // Navigate to checkout
      router.push("/marketplace/checkout");
    } catch (error) {
      setFeedbackMessage(
        error?.message || t("volunteering_screen.feedback.donation_failed"),
      );
    }
  };

  const handleVolunteerSignUp = async (item) => {
    if (joinedIds.includes(item.id)) {
      setFeedbackMessage(
        t("volunteering_screen.feedback.already_joined", { title: item.title }),
      );
      return;
    }

    try {
      const authUser = await getAuthUser();
      const authToken = await getAuthToken();
      await api.signUpVolunteerOpportunity(item.id, {
        applicantName: authUser?.name,
        applicantEmail: authUser?.email,
      }, authToken);

      setJoinedIds((prev) => [...prev, item.id]);
      setFeedbackMessage(
        t("volunteering_screen.feedback.signup_success", { title: item.title }),
      );
    } catch (error) {
      const isConflict = error?.status === 409;
      if (isConflict) {
        setJoinedIds((prev) =>
          prev.includes(item.id) ? prev : [...prev, item.id],
        );
        setFeedbackMessage(
          t("volunteering_screen.feedback.already_joined", {
            title: item.title,
          }),
        );
        return;
      }

      setFeedbackMessage(
        error?.message || t("volunteering_screen.feedback.signup_failed"),
      );
    }
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
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color={DARK}
              />
            </TouchableOpacity>

            <Text style={styles.title}>{t("community.volunteering")}</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.toggleWrap}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                activeTab === "donate" && styles.toggleBtnActive,
              ]}
              onPress={() => setActiveTab("donate")}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.toggleText,
                  activeTab === "donate" && styles.toggleTextActive,
                ]}
              >
                {t("volunteering_screen.tabs.donate")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                activeTab === "volunteer" && styles.toggleBtnActive,
              ]}
              onPress={() => setActiveTab("volunteer")}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.toggleText,
                  activeTab === "volunteer" && styles.toggleTextActive,
                ]}
              >
                {t("volunteering_screen.tabs.volunteer")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeTab === "volunteer"
                ? t("volunteering_screen.section.volunteering_opportunities")
                : t("volunteering_screen.section.donation_campaigns")}
            </Text>

            {activeTab === "volunteer" ? (
              <View style={styles.countChip}>
                <Text style={styles.countChipText}>
                  {joinedHydrated
                    ? t("volunteering_screen.section.joined_count", {
                        count: joinedIds.length,
                      })
                    : t("volunteering_screen.section.joined_loading")}
                </Text>
              </View>
            ) : null}
          </View>

          {feedbackMessage ? (
            <View style={styles.feedbackBox}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={14}
                color={DARK}
              />
              <Text style={styles.feedbackText}>{feedbackMessage}</Text>
            </View>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={DARK} />
                <Text style={styles.loadingText}>
                  {t("volunteering_screen.loading_opportunities")}
                </Text>
              </View>
            ) : null}

            {activeData.map((item) =>
              activeTab === "volunteer" ? (
                <VolunteerCard
                  key={item.id}
                  item={localizeVolunteerItem(item)}
                  isJoined={joinedIds.includes(item.id)}
                  onPress={() => handleVolunteerSignUp(item)}
                  labels={{
                    joined: t("volunteering_screen.buttons.joined"),
                    signUp: t("volunteering_screen.buttons.sign_up"),
                  }}
                />
              ) : (
                <DonateCard
                  key={item.id}
                  item={localizeDonateItem(item)}
                  onPress={() => handleAction(item)}
                  labels={{
                    suggestedAmount: t("volunteering_screen.suggested_amount"),
                    donateNow: t("volunteering_screen.buttons.donate_now"),
                  }}
                />
              ),
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
    paddingHorizontal: 15,
  },
  header: {
    marginTop: 8,
    marginBottom: 16,
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
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  toggleWrap: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
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
    backgroundColor: "rgba(184, 150, 90, 0.28)",
  },
  toggleText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "700",
  },
  toggleTextActive: {
    color: DARK,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#7D654F",
    fontSize: 14,
    fontWeight: "700",
  },
  countChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(184, 150, 90, 0.3)",
    backgroundColor: "rgba(184, 150, 90, 0.12)",
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  countChipText: {
    color: DARK,
    fontSize: 11,
    fontWeight: "700",
  },
  feedbackBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    backgroundColor: "rgba(184, 150, 90, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(184, 150, 90, 0.24)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  feedbackText: {
    color: DARK,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  loadingText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 17,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardAccent: {
    height: 3,
    width: 44,
    borderRadius: 999,
    backgroundColor: "rgba(184, 150, 90, 0.8)",
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 9,
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
  },
  titleBlock: {
    flex: 1,
  },
  cardTitle: {
    color: DARK,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 3,
  },
  cardDesc: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 17,
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
    paddingHorizontal: 9,
    paddingVertical: 4,
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
    alignSelf: "flex-end",
    backgroundColor: DARK,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 92,
    alignItems: "center",
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
