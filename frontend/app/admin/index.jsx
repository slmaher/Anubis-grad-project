import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import Svg, {
  Circle,
  Defs,
  G,
  Line as SvgLine,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { getAuthToken } from "../api/authStorage";

const CHART_PALETTE = [
  "#4A90E2",
  "#50C878",
  "#D9A441",
  "#FF6B6B",
  "#7D89F7",
  "#8A631A",
];

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
  const paginationLockRef = useRef(false);

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

  const activityTypeChartData = useMemo(
    () =>
      activityTypeStats.map((item, index) => ({
        ...item,
        color: CHART_PALETTE[index % CHART_PALETTE.length],
      })),
    [activityTypeStats],
  );

  const roleStats = useMemo(() => {
    const counts = filteredActivity.reduce((acc, item) => {
      const key = String(item?.actor?.role || "System");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredActivity]);

  const roleChartData = useMemo(
    () =>
      roleStats.map((item, index) => ({
        ...item,
        color: CHART_PALETTE[(index + 2) % CHART_PALETTE.length],
      })),
    [roleStats],
  );

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
    return values.map((item) => ({
      ...item,
      heightPercent: Math.max(
        6,
        Math.round(
          (item.count /
            Math.max(
              1,
              values.reduce(
                (highest, current) =>
                  current.count > highest ? current.count : highest,
                1,
              ),
            )) *
            100,
        ),
      ),
    }));
  }, [filteredActivity, i18n.language]);

  const trendChartData = useMemo(() => {
    const max = Math.max(1, ...dailyTrend.map((item) => item.count));

    return dailyTrend.map((item, index) => ({
      ...item,
      color: CHART_PALETTE[index % CHART_PALETTE.length],
      percent: (item.count / max) * 100,
    }));
  }, [dailyTrend]);

  const visibleActivity = useMemo(
    () => filteredActivity.slice(0, visibleActivityCount),
    [filteredActivity, visibleActivityCount],
  );

  const suspiciousLogEntries = useMemo(() => {
    if (!Array.isArray(filteredActivity) || filteredActivity.length === 0) {
      return [];
    }

    const entries = [];
    const seen = new Set();

    const pushEntry = (
      key,
      title,
      details,
      occurredAt,
      severity = "medium",
    ) => {
      if (!key || seen.has(key)) return;
      seen.add(key);
      entries.push({ key, title, details, occurredAt, severity });
    };

    filteredActivity.forEach((item) => {
      const searchable = [
        item?.category,
        item?.action,
        item?.subject,
        item?.details,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const isAuthFailure =
        /(invalid credentials|failed sign[- ]?in|login failed|unauthorized|authentication failed)/.test(
          searchable,
        );
      const isRemoval = /(removed|deleted|deactivated|inactive)/.test(
        searchable,
      );
      const isPrivilegeChange = /(role|permission|privilege|admin action)/.test(
        searchable,
      );
      const isOperationalFailure =
        /(error|failed|exception|denied|suspicious)/.test(searchable);
      const isSystemActor =
        !item?.actor?.name ||
        String(item?.actor?.role || "").toLowerCase() === "system";

      if (isAuthFailure) {
        pushEntry(
          `auth-${item.id}`,
          "Repeated invalid credentials",
          "Multiple failed sign-in attempts were detected in the current activity window.",
          item?.occurredAt,
          "high",
        );
      }

      if (isRemoval) {
        pushEntry(
          `removal-${item.id}`,
          `${item.category} removal or deactivation`,
          item.subject
            ? `${item.subject} was marked as removed or inactive.`
            : "A record was removed or disabled.",
          item?.occurredAt,
          "high",
        );
      }

      if (isPrivilegeChange) {
        pushEntry(
          `priv-${item.id}`,
          `${item.category} role or permission change`,
          item.subject
            ? `${item.subject} changed access-sensitive fields.`
            : "A role or permission change was recorded.",
          item?.occurredAt,
          "medium",
        );
      }

      if (isOperationalFailure) {
        pushEntry(
          `ops-${item.id}`,
          `${item.category} operational warning`,
          item.details ||
            item.action ||
            "An operational warning appeared in the activity feed.",
          item?.occurredAt,
          "medium",
        );
      }

      if (isSystemActor) {
        pushEntry(
          `sys-${item.id}`,
          "System-generated activity",
          item.subject
            ? `${item.subject} was created or changed without an identified actor.`
            : "An activity event came from a system or unknown actor.",
          item?.occurredAt,
          "low",
        );
      }
    });

    const repeatedUpdates = filteredActivity.filter((item) =>
      /(updated|modified|edited)/.test(
        [item?.action, item?.details].filter(Boolean).join(" ").toLowerCase(),
      ),
    );

    if (repeatedUpdates.length >= 4) {
      pushEntry(
        "bulk-updates",
        "Bulk updates in a short period",
        `${repeatedUpdates.length} update-style actions were observed in the selected period.`,
        repeatedUpdates[0]?.occurredAt,
        "medium",
      );
    }

    return entries.sort(
      (a, b) => toDateMillis(b.occurredAt) - toDateMillis(a.occurredAt),
    );
  }, [filteredActivity]);

  const analyticsSummary = useMemo(() => {
    const totalLogs = filteredActivity.length;
    const uniqueActors = new Set(
      filteredActivity
        .map((item) => String(item?.actor?.name || "System").trim())
        .filter(Boolean),
    ).size;

    const activeDays = new Set(
      filteredActivity
        .map((item) =>
          new Date(toDateMillis(item?.occurredAt)).toISOString().slice(0, 10),
        )
        .filter(Boolean),
    ).size;

    const suspiciousLogs = suspiciousLogEntries.length;

    const busiest = trendChartData.reduce(
      (best, point) => (point.count > best.count ? point : best),
      { label: "-", count: 0 },
    );

    return {
      totalLogs,
      uniqueActors,
      activeDays,
      suspiciousLogs,
      avgPerDay:
        selectedPeriodDays > 0
          ? (totalLogs / selectedPeriodDays).toFixed(2)
          : "0.00",
      busiestLabel: busiest.label || "-",
      busiestCount: busiest.count || 0,
    };
  }, [
    filteredActivity,
    suspiciousLogEntries,
    trendChartData,
    selectedPeriodDays,
  ]);

  const linePath = (points) => {
    if (!points.length) return "";

    const segments = points.map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${point.x},${point.y}`;
    });

    return segments.join(" ");
  };

  const areaPath = (points, baseY) => {
    if (!points.length) return "";

    const head = `M${points[0].x},${baseY} L${points[0].x},${points[0].y}`;
    const body = points
      .slice(1)
      .map((point) => `L${point.x},${point.y}`)
      .join(" ");
    const tail = `L${points[points.length - 1].x},${baseY} Z`;
    return `${head} ${body} ${tail}`;
  };

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
    paginationLockRef.current = false;
  }, [filteredActivity.length]);

  const handleDashboardScroll = useCallback(
    (event) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - (layoutMeasurement.height + contentOffset.y);

      if (
        distanceFromBottom < 220 &&
        visibleActivityCount < filteredActivity.length &&
        !paginationLockRef.current
      ) {
        paginationLockRef.current = true;
        setVisibleActivityCount((prev) =>
          Math.min(prev + 20, filteredActivity.length),
        );

        requestAnimationFrame(() => {
          paginationLockRef.current = false;
        });
      }
    },
    [visibleActivityCount, filteredActivity.length],
  );

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

  const renderBarChart = (data, title) => {
    const max = Math.max(1, ...data.map((item) => item.count));

    return (
      <View style={styles.visualCard}>
        <Text style={[styles.visualTitle, isRTL && styles.textRight]}>
          {title}
        </Text>
        {data.length === 0 ? (
          <Text style={[styles.placeholderText, isRTL && styles.textRight]}>
            {t("admin.dashboard.activity.empty")}
          </Text>
        ) : (
          <View style={styles.chartStack}>
            {data.map((item, index) => {
              const height = Math.max(18, Math.round((item.count / max) * 100));
              return (
                <View key={item.name} style={styles.barItemRow}>
                  <View style={styles.barItemLabelWrap}>
                    <View
                      style={[
                        styles.barLegendDot,
                        {
                          backgroundColor:
                            item.color ||
                            CHART_PALETTE[index % CHART_PALETTE.length],
                        },
                      ]}
                    />
                    <Text
                      style={[styles.barItemLabel, isRTL && styles.textRight]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  </View>
                  <View style={styles.barTrackPro}>
                    <View
                      style={[
                        styles.barFillPro,
                        {
                          width: `${Math.max(12, height)}%`,
                          backgroundColor:
                            item.color ||
                            CHART_PALETTE[index % CHART_PALETTE.length],
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValue}>{item.count}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderLineChart = (data, title) => {
    const width = 320;
    const height = 180;
    const paddingX = 20;
    const paddingY = 22;
    const innerWidth = width - paddingX * 2;
    const innerHeight = height - paddingY * 2;
    const max = Math.max(1, ...data.map((item) => item.count));
    const gap = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth;
    const points = data.map((item, index) => {
      const x = paddingX + index * gap;
      const y = paddingY + innerHeight - (item.count / max) * innerHeight;
      return { ...item, x, y };
    });

    return (
      <View style={styles.visualCard}>
        <Text style={[styles.visualTitle, isRTL && styles.textRight]}>
          {title}
        </Text>
        {data.length === 0 ? (
          <Text style={[styles.placeholderText, isRTL && styles.textRight]}>
            {t("admin.dashboard.activity.empty")}
          </Text>
        ) : (
          <View style={styles.svgCardWrap}>
            <Svg width="100%" height={220} viewBox={`0 0 ${width} ${height}`}>
              <Defs>
                <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#50C878" stopOpacity="0.28" />
                  <Stop offset="100%" stopColor="#50C878" stopOpacity="0.02" />
                </LinearGradient>
              </Defs>
              <G>
                <SvgLine
                  x1={paddingX}
                  y1={paddingY}
                  x2={paddingX}
                  y2={height - paddingY}
                  stroke="#D9C9B2"
                  strokeWidth="1"
                />
                <SvgLine
                  x1={paddingX}
                  y1={height - paddingY}
                  x2={width - paddingX}
                  y2={height - paddingY}
                  stroke="#D9C9B2"
                  strokeWidth="1"
                />
                {[0, 25, 50, 75, 100].map((tick) => {
                  const y = paddingY + innerHeight - (tick / 100) * innerHeight;
                  return (
                    <React.Fragment key={tick}>
                      <SvgLine
                        x1={paddingX}
                        y1={y}
                        x2={width - paddingX}
                        y2={y}
                        stroke="#EFE4D5"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <SvgText x={6} y={y + 4} fill="#8B7B6C" fontSize="10">
                        {Math.round((tick / 100) * max)}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
                <Path
                  d={areaPath(points, height - paddingY)}
                  fill="url(#trendFill)"
                />
                <Path
                  d={linePath(points)}
                  fill="none"
                  stroke="#50C878"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((point, index) => (
                  <React.Fragment key={point.key}>
                    <Circle
                      cx={point.x}
                      cy={point.y}
                      r={5}
                      fill="#fff"
                      stroke={CHART_PALETTE[index % CHART_PALETTE.length]}
                      strokeWidth="3"
                    />
                    <SvgText
                      x={point.x}
                      y={height - 5}
                      fill="#8B7B6C"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      {point.label}
                    </SvgText>
                    <SvgText
                      x={point.x}
                      y={point.y - 10}
                      fill="#2C2010"
                      fontSize="10"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {point.count}
                    </SvgText>
                  </React.Fragment>
                ))}
              </G>
            </Svg>
          </View>
        )}
      </View>
    );
  };

  const renderDonutChart = (data, title) => {
    const size = 220;
    const center = size / 2;
    const radius = 72;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius;
    const total = Math.max(
      1,
      data.reduce((sum, item) => sum + item.count, 0),
    );
    let currentOffset = 0;

    return (
      <View style={styles.visualCard}>
        <Text style={[styles.visualTitle, isRTL && styles.textRight]}>
          {title}
        </Text>
        {data.length === 0 ? (
          <Text style={[styles.placeholderText, isRTL && styles.textRight]}>
            {t("admin.dashboard.activity.empty")}
          </Text>
        ) : (
          <View style={styles.donutWrap}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <G rotation="-90" origin={`${center}, ${center}`}>
                {data.map((item, index) => {
                  const strokeDasharray = `${(item.count / total) * circumference} ${circumference}`;
                  const circle = (
                    <Circle
                      key={item.name}
                      cx={center}
                      cy={center}
                      r={radius}
                      stroke={
                        item.color ||
                        CHART_PALETTE[index % CHART_PALETTE.length]
                      }
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={-currentOffset}
                      fill="none"
                      strokeLinecap="round"
                    />
                  );
                  currentOffset += (item.count / total) * circumference;
                  return circle;
                })}
              </G>
              <Circle
                cx={center}
                cy={center}
                r={radius - strokeWidth / 2}
                fill="#FFF9F0"
              />
              <SvgText
                x={center}
                y={center - 4}
                fontSize="22"
                fontWeight="700"
                textAnchor="middle"
                fill="#2C2010"
              >
                {total}
              </SvgText>
              <SvgText
                x={center}
                y={center + 18}
                fontSize="10"
                textAnchor="middle"
                fill="#8B7B6C"
              >
                {t("admin.dashboard.visualizations.total_items")}
              </SvgText>
            </Svg>

            <View style={styles.legendList}>
              {data.map((item, index) => (
                <View key={item.name} style={styles.legendRow}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor:
                          item.color ||
                          CHART_PALETTE[index % CHART_PALETTE.length],
                      },
                    ]}
                  />
                  <Text style={styles.legendLabel}>{item.name}</Text>
                  <Text style={styles.legendValue}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      onScroll={handleDashboardScroll}
      scrollEventThrottle={120}
    >
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
                {t("admin.dashboard.visualizations.last_days", {
                  days: period,
                })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsLabel}>
            {t("admin.dashboard.visualizations.total_logs")}
          </Text>
          <Text style={styles.analyticsValue}>
            {analyticsSummary.totalLogs}
          </Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsLabel}>
            {t("admin.dashboard.visualizations.unique_actors")}
          </Text>
          <Text style={styles.analyticsValue}>
            {analyticsSummary.uniqueActors}
          </Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsLabel}>
            {t("admin.dashboard.visualizations.active_days")}
          </Text>
          <Text style={styles.analyticsValue}>
            {analyticsSummary.activeDays}
          </Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsLabel}>
            {t("admin.dashboard.visualizations.avg_per_day")}
          </Text>
          <Text style={styles.analyticsValue}>
            {analyticsSummary.avgPerDay}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.analyticsCard, styles.suspiciousCard]}
          onPress={() => router.push("/admin/suspicious-logs")}
        >
          <View style={styles.suspiciousCardHeader}>
            <Text style={styles.analyticsLabel}>
              {t("admin.dashboard.visualizations.suspicious_logs")}
            </Text>
            <MaterialCommunityIcons
              name="open-in-new"
              size={18}
              color="#8A631A"
            />
          </View>
          <Text style={styles.analyticsValueDanger}>
            {analyticsSummary.suspiciousLogs}
          </Text>
          <Text style={styles.analyticsHint}></Text>
        </TouchableOpacity>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsLabel}>
            {t("admin.dashboard.visualizations.busiest_day")}
          </Text>
          <Text
            style={styles.analyticsValue}
          >{`${analyticsSummary.busiestLabel} (${analyticsSummary.busiestCount})`}</Text>
        </View>
      </View>

      <View style={styles.visualGrid}>
        {renderBarChart(
          activityTypeChartData,
          t("admin.dashboard.visualizations.top_categories"),
        )}
        {renderLineChart(
          trendChartData,
          t("admin.dashboard.visualizations.weekly_trend"),
        )}
        {renderDonutChart(
          roleChartData,
          t("admin.dashboard.visualizations.actor_roles"),
        )}
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
            shown: visibleActivity.length,
          })}
        </Text>
        {filteredActivity.length === 0 ? (
          <Text style={[styles.placeholderText, isRTL && styles.textRight]}>
            {t("admin.dashboard.activity.empty")}
          </Text>
        ) : (
          visibleActivity.map((item) => (
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
        {filteredActivity.length > visibleActivity.length && (
          <Text style={styles.lazyLoadingHint}>
            {t("admin.dashboard.visualizations.lazy_loading")}
          </Text>
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
  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  analyticsCard: {
    flex: 1,
    minWidth: 150,
    height: 90,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EFE4D5",
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: "flex-start",
  },
  suspiciousCard: {
    height: 90,
    justifyContent: "space-between",
  },
  suspiciousCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  analyticsLabel: {
    fontSize: 11,
    color: "#8B7B6C",
    marginBottom: 4,
    fontWeight: "600",
  },
  analyticsValue: {
    fontSize: 20,
    color: "#2C2010",
    fontWeight: "700",
  },
  analyticsValueDanger: {
    fontSize: 20,
    color: "#D05E46",
    fontWeight: "700",
  },
  analyticsHint: {
    marginTop: 6,
    fontSize: 11,
    color: "#9B8B7C",
    fontWeight: "500",
  },
  chartStack: {
    gap: 10,
  },
  barItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  barItemLabelWrap: {
    width: 120,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  barItemLabel: {
    fontSize: 13,
    color: "#5C4A39",
    fontWeight: "600",
    flexShrink: 1,
  },
  barTrackPro: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#EFE4D5",
    overflow: "hidden",
  },
  barFillPro: {
    height: 12,
    borderRadius: 999,
  },
  svgCardWrap: {
    marginTop: 4,
  },
  donutWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  legendList: {
    flex: 1,
    minWidth: 160,
    gap: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: "#5C4A39",
  },
  legendValue: {
    width: 30,
    textAlign: "right",
    fontSize: 13,
    color: "#2C2010",
    fontWeight: "700",
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
  barFillRole: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#FF6B6B",
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
  webChartWrap: {
    height: 240,
  },
  visualLoadingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  visualLoadingText: {
    fontSize: 13,
    color: "#8B7B6C",
    fontWeight: "600",
  },
  visualFallbackWrap: {
    gap: 12,
  },
  visualFallbackText: {
    color: "#8B7B6C",
    fontSize: 13,
    fontWeight: "600",
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
  lazyLoadingHint: {
    marginTop: 8,
    color: "#8B7B6C",
    fontSize: 12,
    textAlign: "center",
  },
});
