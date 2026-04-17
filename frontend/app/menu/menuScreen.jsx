import { useRouter } from "expo-router";
import React, { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import {
  clearAuthSession,
  getAuthUser,
  getAuthToken,
} from "../api/authStorage";
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
  PanResponder,
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
  const [authUser, setAuthUser] = useState(null);
  const isRTL = i18n.dir(i18n.language) === "rtl";

  const menuItems = [
    {
      id: "language",
      label: t("menu.language"),
      iconLib: "ion",
      iconName: "language-outline",
      isLanguage: true,
    },
    {
      id: "setting",
      label: t("menu.setting"),
      iconLib: "material",
      iconName: "cog-outline",
      route: "/settings/settings",
    },
    {
      id: "profile",
      label: t("menu.profile"),
      iconLib: "ion",
      iconName: "person-outline",
    },
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
      id: "logout",
      label: t("menu.logout"),
      iconLib: "ion",
      iconName: "log-out-outline",
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
  ];

  const [counts, setCounts] = React.useState({
    notifications: 0,
    friendRequests: 0,
    messages: 0,
  });

  const isAdmin =
    String(authUser?.role || "")
      .trim()
      .toLowerCase() === "admin";

  const renderedMenuItems = isAdmin
    ? [
        {
          id: "admin_dashboard",
          label: t("admin.menu.dashboard"),
          iconLib: "material",
          iconName: "shield-crown-outline",
          route: "/admin",
        },
        ...menuItems,
      ]
    : menuItems;

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

        if (
          conversationsResponse?.success &&
          Array.isArray(conversationsResponse.data)
        ) {
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

  const hiddenOffset = isRTL ? 300 : -300;
  const slideAnim = React.useRef(new Animated.Value(hiddenOffset)).current;
  const dragAnim = React.useRef(new Animated.Value(0)).current;

  const closeMenu = React.useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: hiddenOffset,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose && onClose();
      dragAnim.setValue(0);
    });
  }, [dragAnim, hiddenOffset, onClose, slideAnim]);

  React.useEffect(() => {
    slideAnim.setValue(hiddenOffset);
    dragAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [hiddenOffset, slideAnim, dragAnim]);

  React.useEffect(() => {
    loadCounts();
  }, []);

  React.useEffect(() => {
    getAuthUser()
      .then((user) => setAuthUser(user))
      .catch(() => setAuthUser(null));
  }, []);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 20 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy),

        onPanResponderMove: (_, gestureState) => {
          if (!isRTL && gestureState.dx < 0) {
            dragAnim.setValue(gestureState.dx);
          } else if (isRTL && gestureState.dx > 0) {
            dragAnim.setValue(gestureState.dx);
          } else {
            dragAnim.setValue(0);
          }
        },

        onPanResponderRelease: (_, gestureState) => {
          const shouldClose =
            (!isRTL && gestureState.dx < -80) ||
            (isRTL && gestureState.dx > 80);

          if (shouldClose) {
            closeMenu();
          } else {
            Animated.spring(dragAnim, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },

        onPanResponderTerminate: () => {
          Animated.spring(dragAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [isRTL, dragAnim, closeMenu]
  );

  return (
    <View style={styles.container}>
      {/* DARK OVERLAY */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={closeMenu}
      />

      {/* SLIDING MENU */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.background,
          isRTL ? styles.backgroundRtl : styles.backgroundLtr,
          { transform: [{ translateX: Animated.add(slideAnim, dragAnim) }] },
        ]}
      >
        <ImageBackground
          source={require("../../assets/images/beige-background.jpeg")}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={closeMenu}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={MUTED} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t("menu.title")}</Text>
              <View style={styles.headerButton} />
            </View>

            <ScrollView
              style={styles.menuList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.menuListContent}
            >
              {renderedMenuItems.map((item, index) => (
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
                    <Text
                      style={[
                        styles.chevron,
                        item.isLanguage &&
                          languageMenuVisible && {
                            transform: [{ rotate: "90deg" }],
                          },
                      ]}
                    >
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
                              i18n.language === lang.code &&
                                styles.activeLanguage,
                            ]}
                          >
                            {lang.label}
                          </Text>
                          {i18n.language === lang.code && (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color="#B8965A"
                            />
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
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  background: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 350,
    backgroundColor: "transparent",
    zIndex: 2,
    elevation: 20,
  },
  backgroundLtr: {
    left: 0,
  },
  backgroundRtl: {
    right: 0,
  },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerButton: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
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
    zIndex: 1,
  },
});