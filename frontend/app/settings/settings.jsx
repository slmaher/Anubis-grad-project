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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";

const DARK = "#2C2010";
const GOLD = "#B8965A";
const MUTED = "#8B7B6C";
const CARD_BG = "rgba(255, 255, 255, 0.82)";
const CARD_BORDER = "rgba(255, 255, 255, 0.95)";
const DIVIDER = "rgba(180,160,130,0.22)";

const sections = [
  {
    title: "Account",
    items: [
      {
        iconFamily: "Feather",
        icon: "user",
        label: "Edit Profile",
        route: "/ProfileScreen",
      },
      {
        iconFamily: "Feather",
        icon: "lock",
        label: "Security",
        route: null,
      },
      {
        iconFamily: "Ionicons",
        icon: "notifications-outline",
        label: "Notifications",
        route: null,
      },
      {
        iconFamily: "MaterialCommunityIcons",
        icon: "shield-check-outline",
        label: "Privacy",
        route: null,
      },
    ],
  },
  {
    title: "Support & About",
    items: [
      {
        iconFamily: "MaterialCommunityIcons",
        icon: "credit-card-outline",
        label: "My Subscription",
        route: null,
      },
      {
        iconFamily: "Feather",
        icon: "help-circle",
        label: "Help & Support",
        route: null,
      },
      {
        iconFamily: "MaterialCommunityIcons",
        icon: "frequently-asked-questions",
        label: "FAQ",
        route: "/faq/FAQ-screens",
      },
      {
        iconFamily: "MaterialCommunityIcons",
        icon: "file-document-outline",
        label: "Terms and Policies",
        route: null,
      },
    ],
  },
  {
    title: "Cache & Cellular",
    items: [
      {
        iconFamily: "Feather",
        icon: "trash-2",
        label: "Free Up Space",
        route: null,
      },
      {
        iconFamily: "MaterialCommunityIcons",
        icon: "wifi-strength-2",
        label: "Data Saver",
        route: null,
      },
    ],
  },
  {
    title: "Actions",
    items: [
      {
        iconFamily: "MaterialCommunityIcons",
        icon: "flag-outline",
        label: "Report a Problem",
        route: null,
      },
      {
        iconFamily: "Feather",
        icon: "user-plus",
        label: "Add Account",
        route: null,
      },
      {
        iconFamily: "Feather",
        icon: "log-out",
        label: "Log Out",
        route: null,
        danger: true,
      },
    ],
  },
];

function SettingIcon({ family, name, danger }) {
  const color = danger ? "#A33C2E" : GOLD;

  if (family === "Feather") {
    return <Feather name={name} size={20} color={color} />;
  }

  if (family === "Ionicons") {
    return <Ionicons name={name} size={21} color={color} />;
  }

  return <MaterialCommunityIcons name={name} size={22} color={color} />;
}

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/beige-background.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={26} color={DARK} />
          </TouchableOpacity>

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your account and app</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <View style={styles.card}>
                {section.items.map((item, idx) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.row,
                      idx === section.items.length - 1 && styles.rowLast,
                    ]}
                    onPress={() => item.route && router.push(item.route)}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        item.danger && styles.iconBoxDanger,
                      ]}
                    >
                      <SettingIcon
                        family={item.iconFamily}
                        name={item.icon}
                        danger={item.danger}
                      />
                    </View>

                    <Text
                      style={[
                        styles.rowLabel,
                        item.danger && styles.rowLabelDanger,
                      ]}
                    >
                      {item.label}
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="rgba(44, 32, 16, 0.42)"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  safeArea: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  headerTextWrap: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: DARK,
    letterSpacing: 0.2,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "600",
    color: MUTED,
  },

  headerSpacer: {
    width: 38,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 34,
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: "hidden",
    elevation: 5,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },

  rowLast: {
    borderBottomWidth: 0,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 15,
    backgroundColor: "rgba(184, 150, 90, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  iconBoxDanger: {
    backgroundColor: "rgba(163, 60, 46, 0.12)",
  },

  rowLabel: {
    flex: 1,
    fontSize: 15.5,
    color: DARK,
    fontWeight: "700",
  },

  rowLabelDanger: {
    color: "#A33C2E",
  },
});