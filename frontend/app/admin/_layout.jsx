import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Modal,
  useWindowDimensions,
} from "react-native";
import { Slot, useRouter, usePathname } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { getAuthToken } from "../api/authStorage";

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { width } = useWindowDimensions();

  const IS_DESKTOP = width > 768;

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    async function checkAdmin() {
      try {
        const token = await getAuthToken();
        if (!token) {
          setIsAdmin(false);
          router.replace("/auth/login");
          return;
        }

        const me = await api.getMe(token);
        const normalizedRole = String(me?.data?.role || "")
          .trim()
          .toLowerCase();

        if (normalizedRole !== "admin") {
          setIsAdmin(false);
          router.replace("/auth/login");
          return;
        }

        setIsAdmin(true);
      } catch {
        setIsAdmin(false);
        router.replace("/auth/login");
      }
    }
    checkAdmin();
  }, []);

  if (isAdmin === null) return null;
  if (isAdmin === false) return null;

  const menuItems = [
    { name: t("admin.menu.dashboard"), icon: "view-dashboard", path: "/admin" },
    {
      name: t("admin.menu.users"),
      icon: "account-group",
      path: "/admin/users",
    },
    { name: t("admin.menu.museums"), icon: "bank", path: "/admin/museums" },
    {
      name: t("admin.menu.artifacts"),
      icon: "treasure-chest",
      path: "/admin/artifacts",
    },
    {
      name: t("admin.menu.events"),
      icon: "calendar-clock",
      path: "/admin/events",
    },
    { name: t("admin.menu.posts"), icon: "post-outline", path: "/admin/posts" },
    {
      name: t("admin.menu.donations"),
      icon: "hand-heart",
      path: "/admin/donations",
    },
    {
      name: t("admin.menu.volunteering"),
      icon: "account-heart",
      path: "/admin/volunteering",
    },
    {
      name: t("admin.menu.marketplace"),
      icon: "storefront",
      path: "/admin/marketplace",
    },
    {
      name: t("admin.menu.tour_guides"),
      icon: "account-tie",
      path: "/admin/tour-guides",
    },
    {
      name: t("admin.menu.reviews"),
      icon: "star-outline",
      path: "/admin/reviews",
    },
  ];

  const Sidebar = () => (
    <View
      style={[styles.sidebar, isRTL ? styles.sidebarRTL : styles.sidebarLTR]}
    >
      <View
        style={[
          styles.sidebarHeader,
          isRTL && { flexDirection: "row-reverse" },
        ]}
      >
        <MaterialCommunityIcons name="shield-crown" size={32} color="#D9A441" />
        <Text style={[styles.sidebarTitle, isRTL && { textAlign: "right" }]}>
          {t("admin.title")}
        </Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.path}
            style={[
              styles.menuItem,
              pathname === item.path && styles.menuItemActive,
              isRTL && { flexDirection: "row-reverse" },
              pathname === item.path &&
                isRTL && {
                  borderRightWidth: 0,
                  borderLeftWidth: 3,
                  borderLeftColor: "#D9A441",
                },
            ]}
            onPress={() => {
              setMenuOpen(false);
              router.push(item.path);
            }}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={22}
              color={pathname === item.path ? "#D9A441" : "#8B7B6C"}
            />
            <Text
              style={[
                styles.menuText,
                pathname === item.path && styles.menuTextActive,
                isRTL && { textAlign: "right", marginRight: 0, marginLeft: 12 },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={[styles.backHome, isRTL && { flexDirection: "row-reverse" }]}
        onPress={() => router.replace("/home")}
      >
        <MaterialCommunityIcons name="home-outline" size={20} color="#6B5B4F" />
        <Text style={styles.backHomeText}>{t("admin.exit")}</Text>
      </TouchableOpacity>
    </View>
  );

  const MobileMenuButton = () => (
    <TouchableOpacity
      style={styles.menuButton}
      onPress={() => setMenuOpen(true)}
      accessibilityRole="button"
      accessibilityLabel={t("admin.menu.dashboard")}
    >
      <MaterialCommunityIcons name="menu" size={26} color="#2C2010" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.layout, isRTL && { flexDirection: "row-reverse" }]}>
        {IS_DESKTOP && <Sidebar />}
        <View style={styles.content}>
          {!IS_DESKTOP && (
            <View
              style={[
                styles.mobileHeader,
                isRTL && { flexDirection: "row-reverse" },
              ]}
            >
              <View style={styles.mobileHeaderSide}>
                <MobileMenuButton />
                <TouchableOpacity onPress={() => router.replace("/home")}>
                  <MaterialCommunityIcons
                    name="home-outline"
                    size={24}
                    color="#2C2010"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.mobileTitle}>{t("admin.mobile_title")}</Text>
              <View style={{ width: 24 }} />
            </View>
          )}
          <Slot />
        </View>
      </View>

      {!IS_DESKTOP && (
        <Modal
          visible={menuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuOpen(false)}
        >
          <View style={styles.menuOverlay}>
            <TouchableOpacity
              style={styles.menuBackdrop}
              activeOpacity={1}
              onPress={() => setMenuOpen(false)}
            />
            <View style={styles.menuDrawer}>
              <Sidebar />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE6DF",
  },
  layout: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 250,
    backgroundColor: "#F9F7F4",
    paddingVertical: 20,
  },
  sidebarLTR: {
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.05)",
  },
  sidebarRTL: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(0,0,0,0.05)",
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 10,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C2010",
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: "rgba(217, 164, 65, 0.1)",
    borderRightWidth: 3,
    borderRightColor: "#D9A441",
  },
  menuText: {
    fontSize: 15,
    color: "#8B7B6C",
    fontWeight: "500",
  },
  menuTextActive: {
    color: "#2C2010",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    backgroundColor: "#EDE6DF",
  },
  mobileHeader: {
    height: 70,
    backgroundColor: "#F9F7F4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  mobileHeaderSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(217, 164, 65, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  mobileTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2010",
  },
  menuOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  menuBackdrop: {
    flex: 1,
  },
  menuDrawer: {
    width: 280,
    backgroundColor: "#F9F7F4",
    height: "100%",
  },
  backHome: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    marginTop: "auto",
  },
  backHomeText: {
    fontSize: 14,
    color: "#6B5B4F",
    fontWeight: "500",
  },
});
