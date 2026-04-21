import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  Share,
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
  const [exportingCsv, setExportingCsv] = useState(false);
  const [selectedPeriodDays, setSelectedPeriodDays] = useState(30);

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

  const resolveActorInfo = ({ createdBy, updatedBy, fallback }, usersById) => {
    const updatedById = toId(updatedBy);
    const createdById = toId(createdBy);

    if (updatedById && usersById[updatedById]?.name) {
      return {
        name: usersById[updatedById].name,
        role: usersById[updatedById].role || "Admin",
      };
    }

    if (createdById && usersById[createdById]?.name) {
      return {
        name: usersById[createdById].name,
        role: usersById[createdById].role || "Admin",
      };
    }

    const updatedByName =
      typeof updatedBy === "object" ? String(updatedBy?.name || "").trim() : "";
    if (updatedByName) {
      return {
        name: updatedByName,
        role: String(updatedBy?.role || "Admin").trim(),
      };
    }

    const createdByName =
      typeof createdBy === "object" ? String(createdBy?.name || "").trim() : "";
    if (createdByName) {
      return {
        name: createdByName,
        role: String(createdBy?.role || "Admin").trim(),
      };
    }

    if (updatedById) {
      return {
        name: `Admin (${updatedById.slice(-6)})`,
        role: "Admin",
      };
    }

    if (createdById) {
      return {
        name: `Admin (${createdById.slice(-6)})`,
        role: "Admin",
      };
    }

    return {
      name: fallback || "System",
      role: fallback === "Self registration" ? "Visitor" : "System",
    };
  };

  const getActionLabel = (type, action) => `${type} • ${action}`;

  const periodOptions = [7, 30, 90];

  const filteredActivity = useMemo(() => {
    if (!Array.isArray(recentActivity) || recentActivity.length === 0) {
      return [];
    }

    const now = Date.now();
    const periodStart = now - selectedPeriodDays * 24 * 60 * 60 * 1000;

    return recentActivity.filter(
      (item) => toDateMillis(item?.occurredAt) >= periodStart,
    );
  }, [recentActivity, selectedPeriodDays]);

  const activityTypeStats = useMemo(() => {
    const counts = filteredActivity.reduce((acc, item) => {
      const key = String(item?.category || "Other");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const entries = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const max = entries.reduce((highest, entry) => {
      return entry.count > highest ? entry.count : highest;
    }, 1);

    return entries.map((entry) => ({
      ...entry,
      widthPercent: Math.max(8, Math.round((entry.count / max) * 100)),
    }));
  }, [filteredActivity]);

  const dailyTrend = useMemo(() => {
    const days = 7;
    const now = new Date();
    const bucketMap = {};

    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      bucketMap[key] = {
        key,
        label: date.toLocaleDateString(i18n.language || "en", {
          month: "short",
          day: "numeric",
        }),
        count: 0,
      };
    }

    filteredActivity.forEach((item) => {
      const millis = toDateMillis(item?.occurredAt);
      if (!millis) return;
      const key = new Date(millis).toISOString().slice(0, 10);
      if (bucketMap[key]) {
        bucketMap[key].count += 1;
      }
    });

    const values = Object.values(bucketMap);
    const max = values.reduce((highest, item) => {
      return item.count > highest ? item.count : highest;
    }, 1);

    return values.map((item) => ({
      ...item,
      heightPercent: Math.max(6, Math.round((item.count / max) * 100)),
    }));
  }, [filteredActivity, i18n.language]);

  const escapeCsvValue = (value) => {
    const safe = String(value ?? "")
      .replace(/\r?\n|\r/g, " ")
      .trim();
    if (safe.includes(",") || safe.includes('"')) {
      return `"${safe.replace(/"/g, '""')}"`;
    }
    return safe;
  };

  const buildDashboardCsv = () => {
    const generatedAt = new Date().toISOString();

    const statsRows = [
      ["Metric", "Value"],
      ["Users", statsValues.users],
      ["Museums", statsValues.museums],
      ["Artifacts", statsValues.artifacts],
      ["Pending Volunteers", statsValues.pendingVolunteers],
    ];

    const logsRows = [
      [
        "Category",
        "Action",
        "Subject",
        "Details",
        "Actor",
        "Role",
        "Occurred At",
      ],
      ...filteredActivity.map((item) => [
        item?.category || "",
        item?.action || "",
        item?.subject || "",
        item?.details || "",
        item?.actor?.name || "System",
        item?.actor?.role || "System",
        formatDateTime(item?.occurredAt),
      ]),
    ];

    const lines = [
      ["Admin Dashboard Report", generatedAt],
      ["Period (Days)", selectedPeriodDays],
      [],
      ["Statistics"],
      ...statsRows,
      [],
      ["Activity Logs"],
      ...logsRows,
    ];

    return lines
      .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
      .join("\n");
  };

  const formatActorLabel = (actor) => {
    if (!actor?.name) {
      return "By System";
    }

    if (!actor?.role) {
      return `By ${actor.name}`;
    }

    return `By ${actor.name} (${actor.role})`;
  };

  const downloadCsvOnWeb = (csvContent, fileName) => {
    if (typeof document === "undefined") {
      throw new Error("CSV download is not available in this environment.");
    }

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareCsvOnNative = async (csvContent, fileName) => {
    try {
      const FileSystem = await import("expo-file-system/legacy");
      const Sharing = await import("expo-sharing");

      const targetPath = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(targetPath, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(targetPath, {
          mimeType: "text/csv",
          dialogTitle: t("admin.dashboard.export.csv_title"),
        });
        return;
      }
    } catch {
      // Fall back to system share sheet with raw CSV when file APIs are unavailable.
    }

    await Share.share({
      title: t("admin.dashboard.export.csv_title"),
      message: csvContent,
    });
  };

  const handleExportCsv = async () => {
    if (exportingCsv) {
      return;
    }

    setExportingCsv(true);
    try {
      const csvContent = buildDashboardCsv();
      const dateStamp = new Date().toISOString().slice(0, 10);
      const fileName = `admin-dashboard-${dateStamp}.csv`;

      if (Platform.OS === "web") {
        downloadCsvOnWeb(csvContent, fileName);
      } else {
        await shareCsvOnNative(csvContent, fileName);
      }
    } catch (err) {
      const message = err?.message || t("admin.dashboard.export.csv_failed");
      Alert.alert(t("admin.dashboard.export.csv_error_title"), message);
    } finally {
      setExportingCsv(false);
    }
  };

  useEffect(() => {
    setVisibleActivityCount(10);
  }, [filteredActivity.length]);

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
      ] = await Promise.allSettled([
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
        const wasUpdated = hasMeaningfulUpdate(
          user?.createdAt,
          user?.updatedAt,
        );
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

        const actor = resolveActorInfo(
          {
            createdBy: user?.createdBy,
            updatedBy: user?.updatedBy,
            fallback: "Self registration",
          },
          usersById,
        );

        const isRoleChange =
          typeof user?.role === "string" && user.role.trim().length > 0;

        return {
          id: `u-${toId(user?._id || user?.id) || Math.random()}`,
          category: "User",
          action: isRoleChange ? `${action} - ${user.role} role` : action,
          subject:
            user?.name ||
            user?.email ||
            t("admin.dashboard.activity.unknown_user"),
          details: [
            user?.email ? `Email: ${user.email}` : "",
            user?.role ? `Role: ${user.role}` : "",
            !user?.isActive ? "Status: Inactive" : "Status: Active",
          ]
            .filter(Boolean)
            .join(" • "),
          actor,
          occurredAt,
        };
      });

      const museumActivities = museums.map((museum) => {
        const wasUpdated = hasMeaningfulUpdate(
          museum?.createdAt,
          museum?.updatedAt,
        );
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
          actor: resolveActorInfo(
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
          details: artifact?.museum?.name
            ? `Museum: ${artifact.museum.name}`
            : "",
          actor: resolveActorInfo(
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
        const wasUpdated = hasMeaningfulUpdate(
          event?.createdAt,
          event?.updatedAt,
        );
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
              ? [event?.museum?.name, event?.location]
                  .filter(Boolean)
                  .join(" - ")
              : "",
          actor: resolveActorInfo(
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
        {t("admin.dashboard.visualizations.title")}
      </Text>

      <View style={styles.periodRow}>
        {periodOptions.map((period) => {
          const isSelected = selectedPeriodDays === period;
          return (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                isSelected && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriodDays(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  isSelected && styles.periodButtonTextActive,
                ]}
              >
                {t("admin.dashboard.visualizations.last_days", { days: period })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.visualGrid}>
        <View style={styles.visualCard}>
          <Text style={[styles.visualTitle, isRTL && styles.textRight]}>
            {t("admin.dashboard.visualizations.top_categories")}
          </Text>
          {activityTypeStats.length === 0 ? (
            <Text style={[styles.placeholderText, isRTL && styles.textRight]}>
              {t("admin.dashboard.activity.empty")}
            </Text>
          ) : (
            activityTypeStats.map((item) => (
              <View key={item.name} style={styles.barRow}>
                <Text style={[styles.barLabel, isRTL && styles.textRight]}>
                  {item.name}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[styles.barFill, { width: `${item.widthPercent}%` }]}
                  />
                </View>
                <Text style={styles.barValue}>{item.count}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.visualCard}>
          <Text style={[styles.visualTitle, isRTL && styles.textRight]}>
            {t("admin.dashboard.visualizations.weekly_trend")}
          </Text>
          <View style={styles.trendWrap}>
            {dailyTrend.map((item) => (
              <View key={item.key} style={styles.trendItem}>
                <View style={styles.trendBarShell}>
                  <View
                    style={[
                      styles.trendBarFill,
                      { height: `${item.heightPercent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.trendCount}>{item.count}</Text>
                <Text style={styles.trendLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.logsHeaderRow}>
        <Text
          style={[styles.subtitle, styles.logsTitle, isRTL && styles.textRight]}
        >
          {t("admin.dashboard.recent_activity")}
        </Text>
        <TouchableOpacity
          style={[styles.exportBtn, exportingCsv && styles.exportBtnDisabled]}
          onPress={handleExportCsv}
          disabled={exportingCsv}
        >
          <MaterialCommunityIcons
            name="file-delimited-outline"
            size={18}
            color="#8A631A"
          />
          <Text style={styles.exportBtnText}>
            {exportingCsv
              ? t("admin.dashboard.export.csv_exporting")
              : t("admin.dashboard.export.csv_button")}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.recentActivity}>
        <Text style={[styles.logsSummary, isRTL && styles.textRight]}>
          {t("admin.dashboard.export.logs_count", {
            total: filteredActivity.length,
            shown: Math.min(visibleActivityCount, filteredActivity.length),
          })}
        </Text>
        {filteredActivity.length === 0 ? (
          <Text style={[styles.placeholderText, isRTL && styles.textRight]}>
            {t("admin.dashboard.activity.empty")}
          </Text>
        ) : (
          filteredActivity.slice(0, visibleActivityCount).map((item) => (
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
                  {getActionLabel(item.category, item.action)}
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
                  {`${formatActorLabel(item.actor)} • ${formatDateTime(
                    item.occurredAt,
                  )}`}
                </Text>
              </View>
            </View>
          ))
        )}
        {filteredActivity.length > visibleActivityCount && (
          <TouchableOpacity
            style={styles.loadMoreBtn}
            onPress={() =>
              setVisibleActivityCount((prev) =>
                Math.min(prev + 10, filteredActivity.length),
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
  periodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8C3A6",
    backgroundColor: "#FFF",
  },
  periodButtonActive: {
    borderColor: "#8A631A",
    backgroundColor: "#F6EFE3",
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B5B4F",
  },
  periodButtonTextActive: {
    color: "#8A631A",
  },
  visualGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  visualCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  visualTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C2010",
    marginBottom: 12,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  barLabel: {
    width: 70,
    fontSize: 12,
    color: "#6B5B4F",
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#F1E6D7",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#4A90E2",
  },
  barValue: {
    width: 26,
    textAlign: "right",
    fontSize: 12,
    color: "#2C2010",
    fontWeight: "700",
  },
  trendWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
    minHeight: 160,
    paddingTop: 12,
  },
  trendItem: {
    flex: 1,
    alignItems: "center",
  },
  trendBarShell: {
    width: "100%",
    maxWidth: 32,
    height: 96,
    borderRadius: 8,
    justifyContent: "flex-end",
    backgroundColor: "#F1E6D7",
    overflow: "hidden",
  },
  trendBarFill: {
    width: "100%",
    backgroundColor: "#50C878",
  },
  trendCount: {
    marginTop: 6,
    fontSize: 12,
    color: "#2C2010",
    fontWeight: "700",
  },
  trendLabel: {
    marginTop: 2,
    fontSize: 10,
    color: "#8B7B6C",
  },
  logsHeaderRow: {
    marginTop: 32,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  logsTitle: {
    marginTop: 0,
    marginBottom: 0,
    flex: 1,
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
  logsSummary: {
    color: "#8B7B6C",
    fontSize: 12,
    marginBottom: 14,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8C3A6",
    backgroundColor: "#FFF5E9",
  },
  exportBtnDisabled: {
    opacity: 0.65,
  },
  exportBtnText: {
    color: "#8A631A",
    fontWeight: "700",
    fontSize: 12,
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
