import { useRouter } from "expo-router";
import React, { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { clearAuthSession, getAuthUser, getAuthToken } from "../api/authStorage";
import { getLocalNotifications } from "../api/notificationsStorage";
import {
  ImageBackground,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";

const languages = [
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "zh", label: "Chinese" },
];

export default function MenuScreen({ onClose }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);

  const menuItems = [
    {
      id: "setting",
      label: t("menu.setting"),
      iconLib: "material",
      iconName: "cog-outline",
      route: "/settings/settings",
    },
    { id: "profile", label: t("menu.profile"), iconLib: "ion", iconName: "person-outline" },
    {
      id: "notifications",
      label: t("menu.notifications"),
      iconLib: "ion",
      iconName: "notifications-outline",
      route: "/notifications",
      countKey: "notifications",
    },
    {
      id: "friend_requests",
      label: t("menu.friend_requests"),
      iconLib: "material",
      iconName: "account-plus-outline",
      route: "/notifications",
      countKey: "friendRequests",
    },
    {
      id: "messages",
      label: t("menu.messages"),
      iconLib: "ion",
      iconName: "chatbubble-ellipses-outline",
      route: "/messagesList",
      countKey: "messages",
    },
    {
      id: "friends",
      label: t("menu.friends"),
      iconLib: "material",
      iconName: "account-group-outline",
      route: "/messagesList",
    },
    {
      id: "museums",
      label: t("menu.museums"),
      iconLib: "material",
      iconName: "bank-outline",
      route: "/Museums",
    },

    {
      id: "map",
      label: t("menu.map"),
      iconLib: "ion",
      iconName: "location-outline",
      route: "/Map",
    },
    {
      id: "language",
      label: t("menu.language"),
      iconLib: "ion",
      iconName: "language-outline",
      isLanguage: true,
    },
    { id: "logout", label: t("menu.logout"), iconLib: "ion", iconName: "log-out-outline" },
  ];

  const [counts, setCounts] = React.useState({
    notifications: 0,
    friendRequests: 0,
    messages: 0,
  });

  const loadCounts = React.useCallback(async () => {
    try {
      const localNotifications = await getLocalNotifications();
      const token = await getAuthToken();

      let friendRequests = 0;
      let messages = 0;

      if (token) {
        const [requestsResponse, conversationsResponse] = await Promise.all([
          api.getIncomingFriendRequests(token).catch(() => null),
          api.getConversations(token).catch(() => null),
        ]);

        if (requestsResponse?.success && Array.isArray(requestsResponse.data)) {
          friendRequests = requestsResponse.data.length;
        }

        if (conversationsResponse?.success && Array.isArray(conversationsResponse.data)) {
          messages = conversationsResponse.data.reduce(
            (sum, conversation) => sum + (conversation.unreadCount || 0),
            0,
          );
        }
      }

      setCounts({
        notifications: localNotifications.length + friendRequests + messages,
        friendRequests,
        messages,
      });
    } catch {
      setCounts({ notifications: 0, friendRequests: 0, messages: 0 });
    }
  }, []);

  const handleMenuPress = async (item) => {
    if (item.isLanguage) {
      setLanguageMenuVisible(!languageMenuVisible);
      return;
    }

    if (item.id === "profile" || item.label === t("menu.profile")) {
      onClose && onClose();
      const user = await getAuthUser();
      const userId = user?._id || user?.id;
      if (userId) {
        router.push({ pathname: "/user/[id]", params: { id: userId } });
      }
      return;
    }

    if (item.id === "logout" || item.label === t("menu.logout")) {
      await clearAuthSession();
      router.replace("/auth/login");
      onClose && onClose();
      return;
    }

    if (item.route) {
      onClose && onClose();
      router.push(item.route);
    }
  };

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setLanguageMenuVisible(false);
  };

  const slideAnim = React.useRef(new Animated.Value(-300)).current; // hidden left initially

  React.useEffect(() => {
    // slide in from left when screen opens
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    loadCounts();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* DARK OVERLAY */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* SLIDING MENU */}
      <Animated.View
        style={[styles.background, { transform: [{ translateX: slideAnim }] }]}
      >
        <ImageBackground
          source={require("../../assets/images/beige-background.jpeg")}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <View style={styles.headerSpacer} />
              <Text style={styles.headerTitle}>{t("menu.title")}</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView
              style={styles.menuList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.menuListContent}
            >
              {menuItems.map((item, index) => (
                <React.Fragment key={item.id || item.label}>
                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => handleMenuPress(item)}
                  >
                    <View style={styles.iconBox}>
                      {item.iconLib === "material" ? (
                        <MaterialCommunityIcons
                          name={item.iconName}
                          size={24}
                          color={DARK}
                        />
                      ) : (
                        <Ionicons name={item.iconName} size={22} color={DARK} />
                      )}
                    </View>
                    <View style={styles.labelRow}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      {item.countKey && counts[item.countKey] > 0 && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {counts[item.countKey] > 99
                              ? "99+"
                              : counts[item.countKey]}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.chevron, item.isLanguage && languageMenuVisible && { transform: [{ rotate: "90deg" }] }]}>
                      ›
                    </Text>
                  </TouchableOpacity>
                  {item.isLanguage && languageMenuVisible && (
                    <View style={styles.languageDropdown}>
                      {languages.map((lang) => (
                        <TouchableOpacity
                          key={lang.code}
                          style={styles.languageOption}
                          onPress={() => changeLanguage(lang.code)}
                        >
                          <Text
                            style={[
                              styles.languageText,
                              i18n.language === lang.code && styles.activeLanguage,
                            ]}
                          >
                            {lang.label}
                          </Text>
                          {i18n.language === lang.code && (
                            <Ionicons name="checkmark" size={18} color="#B8965A" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </React.Fragment>
              ))}
            </ScrollView>
          </SafeAreaView>
        </ImageBackground>
      </Animated.View>
    </View>
  );
}

const DARK = "#2C2010";
const MUTED = "#9A8C7A";
const DIVIDER = "rgba(180,160,130,0.3)";

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 350, // drawer width
    backgroundColor: "transparent",
    zIndex: 999,
    elevation: 20,
  },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerSpacer: { width: 32 },
  headerTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#B8965A",
    letterSpacing: 0.4,
  },
  menuList: {
    marginTop: 8,
    flex: 1,
  },
  menuListContent: {
    paddingBottom: 24,
  },
  languageDropdown: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingLeft: 56,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingRight: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(180,160,130,0.1)",
  },
  languageText: {
    fontSize: 15,
    color: DARK,
  },
  activeLanguage: {
    color: "#B8965A",
    fontWeight: "600",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: { fontSize: 24 },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: DARK,
    letterSpacing: 0.2,
  },
  labelRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: "#ed1717",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 13,
  },
  chevron: {
    fontSize: 26,
    color: MUTED,
    lineHeight: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});
