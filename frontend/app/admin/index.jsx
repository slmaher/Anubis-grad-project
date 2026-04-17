import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { getAuthToken } from "../api/authStorage";

export default function AdminDashboard() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statsValues, setStatsValues] = useState({
    users: 0,
    museums: 0,
    artifacts: 0,
    pendingVolunteers: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const isRTL = i18n.dir(i18n.language) === "rtl";

  const toArray = (response) => {
    const data = response?.data;
    return Array.isArray(data) ? data : [];
  };

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getAuthToken();
      if (!token) {
        setError(t("admin.dashboard.auth_required"));
        return;
      }

      const [usersRes, museumsRes, artifactsRes, applicationsRes] =
        await Promise.all([
          api.admin.getUsers(token),
          api.getMuseums(),
          api.admin.getArtifacts(token),
          api.admin.getApplications(token),
        ]);

      const users = toArray(usersRes);
      const museums = toArray(museumsRes);
      const artifacts = toArray(artifactsRes);
      const applications = toArray(applicationsRes);

      const pendingVolunteers = applications.filter(
        (application) =>
          String(application?.status || "").toLowerCase() === "pending",
      ).length;

      setStatsValues({
        users: users.length,
        museums: museums.length,
        artifacts: artifacts.length,
        pendingVolunteers,
      });

      const activity = [
        ...users.slice(0, 3).map((user) => ({
          id: `u-${user._id || user.id || Math.random()}`,
          text: t("admin.dashboard.activity.new_user", {
            name: user?.name || t("admin.dashboard.activity.unknown_user"),
          }),
          createdAt: user?.createdAt,
        })),
        ...museums.slice(0, 3).map((museum) => ({
          id: `m-${museum._id || museum.id || Math.random()}`,
          text: `${museum?.name || "Museum"} ${t("admin.dashboard.actions.add_museum")}`,
          createdAt: museum?.createdAt,
        })),
        ...artifacts.slice(0, 3).map((artifact) => ({
          id: `a-${artifact._id || artifact.id || Math.random()}`,
          text: t("admin.dashboard.activity.new_artifact", {
            name:
              artifact?.name ||
              artifact?.title ||
              t("admin.dashboard.activity.unknown_artifact"),
          }),
          createdAt: artifact?.createdAt,
        })),
      ]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 6);

      setRecentActivity(activity);
    } catch (e) {
      setError(t("admin.dashboard.load_failed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData]),
  );

  const stats = useMemo(
    () => [
      {
        label: t("admin.dashboard.stats.users"),
        value: Number(statsValues.users || 0).toLocaleString(),
        icon: "account-group",
        color: "#4A90E2",
      },
      {
        label: t("admin.dashboard.stats.museums"),
        value: Number(statsValues.museums || 0).toLocaleString(),
        icon: "bank",
        color: "#50C878",
      },
      {
        label: t("admin.dashboard.stats.artifacts"),
        value: Number(statsValues.artifacts || 0).toLocaleString(),
        icon: "amphora",
        color: "#D9A441",
      },
      {
        label: t("admin.dashboard.stats.pending_volunteers"),
        value: Number(statsValues.pendingVolunteers || 0).toLocaleString(),
        icon: "account-heart",
        color: "#FF6B6B",
      },
    ],
    [statsValues, t],
  );

  const quickActions = [
    {
      name: t("admin.dashboard.actions.add_museum"),
      icon: "bank-plus",
      path: "/admin/museums",
      params: { action: "create" },
    },
    {
      name: t("admin.dashboard.actions.add_artifact"),
      icon: "plus-circle-outline",
      path: "/admin/artifacts",
      params: { action: "create" },
    },
    {
      name: t("admin.dashboard.actions.new_event"),
      icon: "calendar-plus",
      path: "/admin/events",
      params: { action: "create" },
    },
    {
      name: t("admin.dashboard.actions.create_campaign"),
      icon: "hand-heart",
      path: "/admin/donations",
      params: { action: "create" },
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={[styles.title, isRTL && styles.textRight]}>
        {t("admin.dashboard.overview_title")}
      </Text>

      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#D9A441" />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      )}

      {!loading && !!error && (
        <Text style={[styles.errorText, isRTL && styles.textRight]}>
          {error}
        </Text>
      )}

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: stat.color + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name={stat.icon}
                size={24}
                color={stat.color}
              />
            </View>
            <View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={[styles.statLabel, isRTL && styles.textRight]}>
                {stat.label}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={[styles.subtitle, isRTL && styles.textRight]}>
        {t("admin.dashboard.quick_actions")}
      </Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionCard}
            onPress={() =>
              router.push({
                pathname: action.path,
                params: action.params,
              })
            }
          >
            <MaterialCommunityIcons
              name={action.icon}
              size={30}
              color="#D9A441"
            />
            <Text style={[styles.actionName, isRTL && styles.textRight]}>
              {action.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.subtitle, isRTL && styles.textRight]}>
        {t("admin.dashboard.recent_activity")}
      </Text>
      <View style={styles.recentActivity}>
        {recentActivity.length === 0 ? (
          <Text style={[styles.placeholderText, isRTL && styles.textRight]}>
            {t("admin.dashboard.activity.empty")}
          </Text>
        ) : (
          recentActivity.map((item) => (
            <View key={item.id} style={styles.activityRow}>
              <MaterialCommunityIcons
                name="circle-medium"
                size={20}
                color="#D9A441"
              />
              <Text style={[styles.activityText, isRTL && styles.textRight]}>
                {item.text}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C2010",
    marginBottom: 24,
  },
  textRight: {
    textAlign: "right",
  },
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  loadingText: {
    fontSize: 14,
    color: "#8B7B6C",
  },
  errorText: {
    color: "#B54747",
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2010",
    marginTop: 32,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C2010",
  },
  statLabel: {
    fontSize: 13,
    color: "#8B7B6C",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  actionCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  actionName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2010",
  },
  recentActivity: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    minHeight: 150,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  activityText: {
    color: "#6B5B4F",
    fontSize: 14,
    flexShrink: 1,
  },
  placeholderText: {
    color: "#8B7B6C",
    fontSize: 14,
    textAlign: "center",
  },
});
