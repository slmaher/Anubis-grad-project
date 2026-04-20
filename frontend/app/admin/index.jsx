import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const [visibleActivityCount, setVisibleActivityCount] = useState(10);

  const isRTL = i18n.dir(i18n.language) === "rtl";

  const toArray = (response) => {
    const data = response?.data;
    return Array.isArray(data) ? data : [];
  };

  const toId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return String(value?._id || value?.id || "").trim();
    }
    return String(value).trim();
  };

  const toDateMillis = (value) => {
    const millis = new Date(value || 0).getTime();
    return Number.isFinite(millis) ? millis : 0;
  };

  const formatDateTime = (value) => {
    const millis = toDateMillis(value);
    if (!millis) return "Unknown time";

    return new Intl.DateTimeFormat(i18n.language || "en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(millis));
  };

  const hasMeaningfulUpdate = (createdAt, updatedAt) =>
    toDateMillis(updatedAt) - toDateMillis(createdAt) > 1000;

  const resolveActorName = ({ createdBy, updatedBy, fallback }, usersById) => {
    const updatedById = toId(updatedBy);
    const createdById = toId(createdBy);

    if (updatedById && usersById[updatedById]?.name) {
      return usersById[updatedById].name;
    }

    if (createdById && usersById[createdById]?.name) {
      return usersById[createdById].name;
    }

    const updatedByName =
      typeof updatedBy === "object" ? String(updatedBy?.name || "").trim() : "";
    if (updatedByName) {
      return updatedByName;
    }

    const createdByName =
      typeof createdBy === "object" ? String(createdBy?.name || "").trim() : "";
    if (createdByName) {
      return createdByName;
    }

    if (updatedById) {
      return `Admin (${updatedById.slice(-6)})`;
    }

    if (createdById) {
      return `Admin (${createdById.slice(-6)})`;
    }

    return fallback || "System";
  };

  useEffect(() => {
    setVisibleActivityCount(10);
  }, [recentActivity.length]);

  const getSettledValue = (result) =>
    result?.status === "fulfilled" ? result.value : { data: [] };

  const getSettledReason = (result) =>
    result?.status === "rejected" ? result.reason : null;

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getAuthToken();
      if (!token) {
        setError(t("admin.dashboard.auth_required"));
        return;
      }

      const [
        usersResult,
        museumsResult,
        artifactsResult,
        eventsResult,
        applicationsResult,
      ] =
        await Promise.allSettled([
          api.admin.getUsers(token),
          api.getMuseums(),
          api.admin.getArtifacts(token),
          api.getEvents(),
          api.admin.getApplications(token),
        ]);

      const usersRes = getSettledValue(usersResult);
      const museumsRes = getSettledValue(museumsResult);
      const artifactsRes = getSettledValue(artifactsResult);
      const eventsRes = getSettledValue(eventsResult);
      const applicationsRes = getSettledValue(applicationsResult);

      const users = toArray(usersRes);
      const museums = toArray(museumsRes);
      const artifacts = toArray(artifactsRes);
      const events = toArray(eventsRes);
      const applications = toArray(applicationsRes);

      const usersById = users.reduce((acc, user) => {
        const id = toId(user?._id || user?.id);
        if (id) {
          acc[id] = user;
        }
        return acc;
      }, {});

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

      const userActivities = users.map((user) => {
        const wasUpdated = hasMeaningfulUpdate(user?.createdAt, user?.updatedAt);
        const isDeactivated = user?.isActive === false;

        let action = "Joined platform";
        let occurredAt = user?.createdAt;

        if (isDeactivated) {
          action = "Deactivated user";
          occurredAt = user?.updatedAt || user?.createdAt;
        } else if (wasUpdated) {
          action = "Updated user";
          occurredAt = user?.updatedAt;
        }

        const actorFromAdmin = resolveActorName(
          {
            createdBy: user?.createdBy,
            updatedBy: user?.updatedBy,
            fallback: "Self registration",
          },
          usersById,
        );

        return {
          id: `u-${toId(user?._id || user?.id) || Math.random()}`,
          category: "User",
          action,
          subject:
            user?.name ||
            user?.email ||
            t("admin.dashboard.activity.unknown_user"),
          details: user?.email ? `Email: ${user.email}` : "",
          actor: actorFromAdmin || user?.name || "Self registration",
          occurredAt,
        };
      });

      const museumActivities = museums.map((museum) => {
        const wasUpdated = hasMeaningfulUpdate(museum?.createdAt, museum?.updatedAt);
        const isRemoved = museum?.isActive === false;

        let action = "Added museum";
        let occurredAt = museum?.createdAt;

        if (isRemoved) {
          action = "Removed museum";
          occurredAt = museum?.updatedAt || museum?.createdAt;
        } else if (wasUpdated) {
          action = "Updated museum";
          occurredAt = museum?.updatedAt;
        }

        return {
          id: `m-${toId(museum?._id || museum?.id) || Math.random()}`,
          category: "Museum",
          action,
          subject: museum?.name || "Museum",
          details: [museum?.city, museum?.location].filter(Boolean).join(" - "),
          actor: resolveActorName(
            {
              createdBy: museum?.createdBy,
              updatedBy: museum?.updatedBy,
              fallback: "Admin action",
            },
            usersById,
          ),
          occurredAt,
        };
      });

      const artifactActivities = artifacts.map((artifact) => {
        const wasUpdated = hasMeaningfulUpdate(
          artifact?.createdAt,
          artifact?.updatedAt,
        );
        const isRemoved = artifact?.isActive === false;

        let action = "Added artifact";
        let occurredAt = artifact?.createdAt;

        if (isRemoved) {
          action = "Removed artifact";
          occurredAt = artifact?.updatedAt || artifact?.createdAt;
        } else if (wasUpdated) {
          action = "Updated artifact";
          occurredAt = artifact?.updatedAt;
        }

        return {
          id: `a-${toId(artifact?._id || artifact?.id) || Math.random()}`,
          category: "Artifact",
          action,
          subject:
            artifact?.name ||
            artifact?.title ||
            t("admin.dashboard.activity.unknown_artifact"),
          details: artifact?.museum?.name ? `Museum: ${artifact.museum.name}` : "",
          actor: resolveActorName(
            {
              createdBy: artifact?.createdBy,
              updatedBy: artifact?.updatedBy,
              fallback: "Admin action",
            },
            usersById,
          ),
          occurredAt,
        };
      });

      const eventActivities = events.map((event) => {
        const wasUpdated = hasMeaningfulUpdate(event?.createdAt, event?.updatedAt);
        const isRemoved = event?.isActive === false;

        let action = "Created event";
        let occurredAt = event?.createdAt;

        if (isRemoved) {
          action = "Removed event";
          occurredAt = event?.updatedAt || event?.createdAt;
        } else if (wasUpdated) {
          action = "Updated event";
          occurredAt = event?.updatedAt;
        }

        return {
          id: `e-${toId(event?._id || event?.id) || Math.random()}`,
          category: "Event",
          action,
          subject: event?.title || "Event",
          details:
            event?.museum?.name || event?.location
              ? [event?.museum?.name, event?.location].filter(Boolean).join(" - ")
              : "",
          actor: resolveActorName(
            {
              createdBy: event?.createdBy,
              updatedBy: event?.updatedBy,
              fallback: "Admin action",
            },
            usersById,
          ),
          occurredAt,
        };
      });

      const activity = [
        ...museumActivities,
        ...eventActivities,
        ...artifactActivities,
        ...userActivities,
      ].sort((a, b) => toDateMillis(b.occurredAt) - toDateMillis(a.occurredAt));

      setRecentActivity(activity);

      const failedSources = [
        getSettledReason(usersResult) ? "users" : null,
        getSettledReason(museumsResult) ? "museums" : null,
        getSettledReason(artifactsResult) ? "artifacts" : null,
        getSettledReason(eventsResult) ? "events" : null,
        getSettledReason(applicationsResult) ? "volunteers" : null,
      ].filter(Boolean);

      if (failedSources.length > 0) {
        setError(
          `Some dashboard data failed to load: ${failedSources.join(", ")}`,
        );
      }
    } catch (e) {
      const message =
        e?.message ||
        t("admin.dashboard.load_failed") ||
        "Failed to load dashboard";
      setError(message);
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
        icon: "treasure-chest",
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
          recentActivity.slice(0, visibleActivityCount).map((item) => (
            <View key={item.id} style={styles.activityRow}>
              <View style={styles.activityDotWrap}>
                <MaterialCommunityIcons
                  name="circle-medium"
                  size={20}
                  color="#D9A441"
                />
              </View>
              <View style={styles.activityBody}>
                <Text style={[styles.activityTitle, isRTL && styles.textRight]}>
                  {`${item.category} • ${item.action}`}
                </Text>
                <Text style={[styles.activityText, isRTL && styles.textRight]}>
                  {item.subject}
                </Text>
                {!!item.details && (
                  <Text
                    style={[styles.activityDetails, isRTL && styles.textRight]}
                  >
                    {item.details}
                  </Text>
                )}
                <Text style={[styles.activityMeta, isRTL && styles.textRight]}>
                  {`By ${item.actor} • ${formatDateTime(item.occurredAt)}`}
                </Text>
              </View>
            </View>
          ))
        )}
        {recentActivity.length > visibleActivityCount && (
          <TouchableOpacity
            style={styles.loadMoreBtn}
            onPress={() =>
              setVisibleActivityCount((prev) =>
                Math.min(prev + 10, recentActivity.length),
              )
            }
          >
            <Text style={styles.loadMoreText}>Load more activity</Text>
          </TouchableOpacity>
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
    alignItems: "flex-start",
    marginBottom: 14,
  },
  activityDotWrap: {
    marginTop: 2,
    marginRight: 4,
  },
  activityBody: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    color: "#2C2010",
    fontSize: 13,
    fontWeight: "700",
  },
  activityText: {
    color: "#6B5B4F",
    fontSize: 14,
    flexShrink: 1,
  },
  activityDetails: {
    color: "#8B7B6C",
    fontSize: 13,
  },
  activityMeta: {
    color: "#9B8B7C",
    fontSize: 12,
    marginTop: 2,
  },
  placeholderText: {
    color: "#8B7B6C",
    fontSize: 14,
    textAlign: "center",
  },
  loadMoreBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F6EFE3",
  },
  loadMoreText: {
    color: "#8A631A",
    fontWeight: "700",
    fontSize: 12,
  },
});
