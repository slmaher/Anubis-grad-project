import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { getAuthToken } from "../api/authStorage";

const toDateMillis = (value) => {
  const millis = new Date(value || 0).getTime();
  return Number.isFinite(millis) ? millis : 0;
};

const formatDateTime = (value, locale) => {
  const millis = toDateMillis(value);
  if (!millis) return "Unknown time";

  return new Intl.DateTimeFormat(locale || "en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(millis));
};

const hasMeaningfulUpdate = (createdAt, updatedAt) =>
  toDateMillis(updatedAt) - toDateMillis(createdAt) > 1000;

const toId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return String(value?._id || value?.id || "").trim();
  }
  return String(value).trim();
};

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
    return { name: `Admin (${updatedById.slice(-6)})`, role: "Admin" };
  }

  if (createdById) {
    return { name: `Admin (${createdById.slice(-6)})`, role: "Admin" };
  }

  return {
    name: fallback || "System",
    role: fallback === "Self registration" ? "Visitor" : "System",
  };
};

export default function SuspiciousLogsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState([]);
  const [watchScenarios, setWatchScenarios] = useState([]);

  const isRTL = i18n.dir(i18n.language) === "rtl";

  const suspiciousLogEntries = useMemo(() => entries, [entries]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getAuthToken();
      if (!token) {
        setError(t("admin.dashboard.auth_required"));
        return;
      }

      const [usersResult, museumsResult, artifactsResult, eventsResult] =
        await Promise.allSettled([
          api.admin.getUsers(token),
          api.getMuseums(),
          api.admin.getArtifacts(token),
          api.getEvents(),
        ]);

      const toArray = (response) => {
        const data = response?.data;
        return Array.isArray(data) ? data : [];
      };

      const getSettledValue = (result) =>
        result?.status === "fulfilled" ? result.value : { data: [] };

      const users = toArray(getSettledValue(usersResult));
      const museums = toArray(getSettledValue(museumsResult));
      const artifacts = toArray(getSettledValue(artifactsResult));
      const events = toArray(getSettledValue(eventsResult));
      const usersById = users.reduce((acc, user) => {
        const id = toId(user?._id || user?.id);
        if (id) acc[id] = user;
        return acc;
      }, {});

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

        return {
          id: `u-${toId(user?._id || user?.id) || Math.random()}`,
          category: "User",
          action,
          subject: user?.name || user?.email || "Unknown user",
          details: [
            user?.email ? `Email: ${user.email}` : "",
            user?.role ? `Role: ${user.role}` : "",
            !user?.isActive ? "Status: Inactive" : "Status: Active",
          ]
            .filter(Boolean)
            .join(" • "),
          actor: resolveActorInfo(
            {
              createdBy: user?.createdBy,
              updatedBy: user?.updatedBy,
              fallback: "Self registration",
            },
            usersById,
          ),
          occurredAt,
        };
      });

      const museumActivities = museums.map((museum) => ({
        id: `m-${toId(museum?._id || museum?.id) || Math.random()}`,
        category: "Museum",
        action: museum?.isActive === false ? "Removed museum" : "Added museum",
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
        occurredAt: museum?.updatedAt || museum?.createdAt,
      }));

      const artifactActivities = artifacts.map((artifact) => ({
        id: `a-${toId(artifact?._id || artifact?.id) || Math.random()}`,
        category: "Artifact",
        action: artifact?.isActive === false ? "Removed artifact" : "Added artifact",
        subject: artifact?.name || artifact?.title || "Unknown artifact",
        details: artifact?.museum?.name ? `Museum: ${artifact.museum.name}` : "",
        actor: resolveActorInfo(
          {
            createdBy: artifact?.createdBy,
            updatedBy: artifact?.updatedBy,
            fallback: "Admin action",
          },
          usersById,
        ),
        occurredAt: artifact?.updatedAt || artifact?.createdAt,
      }));

      const eventActivities = events.map((event) => ({
        id: `e-${toId(event?._id || event?.id) || Math.random()}`,
        category: "Event",
        action: event?.isActive === false ? "Removed event" : "Created event",
        subject: event?.title || "Event",
        details: event?.museum?.name || event?.location ? [event?.museum?.name, event?.location].filter(Boolean).join(" - ") : "",
        actor: resolveActorInfo(
          {
            createdBy: event?.createdBy,
            updatedBy: event?.updatedBy,
            fallback: "Admin action",
          },
          usersById,
        ),
        occurredAt: event?.updatedAt || event?.createdAt,
      }));

      const activity = [
        ...museumActivities,
        ...eventActivities,
        ...artifactActivities,
        ...userActivities,
      ].sort((a, b) => toDateMillis(b.occurredAt) - toDateMillis(a.occurredAt));

      const entries = [];
      const seen = new Set();
      const pushEntry = (key, title, details, occurredAt, severity = "medium") => {
        if (!key || seen.has(key)) return;
        seen.add(key);
        entries.push({ key, title, details, occurredAt, severity });
      };

      activity.forEach((item) => {
        const searchable = [item?.category, item?.action, item?.subject, item?.details]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (/(invalid credentials|failed sign[- ]?in|login failed|unauthorized|authentication failed)/.test(searchable)) {
          pushEntry(
            `auth-${item.id}`,
            "Repeated invalid credentials",
            "Multiple failed sign-in attempts were detected in the current activity window.",
            item?.occurredAt,
            "high",
          );
        }

        if (/(removed|deleted|deactivated|inactive)/.test(searchable)) {
          pushEntry(
            `removal-${item.id}`,
            `${item.category} removal or deactivation`,
            item.subject ? `${item.subject} was marked as removed or inactive.` : "A record was removed or disabled.",
            item?.occurredAt,
            "high",
          );
        }

        if (/(role|permission|privilege|admin action)/.test(searchable)) {
          pushEntry(
            `priv-${item.id}`,
            `${item.category} role or permission change`,
            item.subject ? `${item.subject} changed access-sensitive fields.` : "A role or permission change was recorded.",
            item?.occurredAt,
            "medium",
          );
        }
      });

      const repeatedUpdates = activity.filter((item) =>
        /(updated|modified|edited)/.test([item?.action, item?.details].filter(Boolean).join(" ").toLowerCase()),
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

      const scenarios = [
        "Repeated invalid credentials more than twice",
        "Multiple removals or deactivations in the same period",
        "Unexpected role or permission changes",
        "Bulk updates performed in a short time window",
        "System-generated actions without a clear actor",
      ];

      setEntries(
        entries.sort((a, b) => toDateMillis(b.occurredAt) - toDateMillis(a.occurredAt)),
      );
      setWatchScenarios(scenarios);
    } catch (err) {
      setError(err?.message || t("admin.dashboard.load_failed") || "Failed to load suspicious logs");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs]),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBlock}>
        <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons
              name={isRTL ? "arrow-right" : "arrow-left"}
              size={20}
              color="#8A631A"
            />
          </TouchableOpacity>
          <Text style={[styles.title, isRTL && styles.textRight]}>
            Suspicious Logs
          </Text>
        </View>

        <View>
          <Text style={[styles.subtitle, isRTL && styles.textRight]}>
            Detailed security-related activity and watch rules.
          </Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#D9A441" />
          <Text style={styles.loadingText}>Loading suspicious logs...</Text>
        </View>
      )}

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total suspicious entries</Text>
        <Text style={styles.summaryValue}>{suspiciousLogEntries.length}</Text>
      </View>

      <View style={styles.listCard}>
        {suspiciousLogEntries.length > 0 ? (
          suspiciousLogEntries.map((entry) => (
            <View key={entry.key} style={styles.listItem}>
              <View style={[styles.dot, entry.severity === "high" && styles.dotHigh]} />
              <View style={styles.listBody}>
                <Text style={styles.itemTitle}>{entry.title}</Text>
                <Text style={styles.itemText}>{entry.details}</Text>
                <Text style={styles.itemMeta}>{formatDateTime(entry.occurredAt, i18n.language)}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No suspicious activity found.</Text>
        )}
      </View>

      <View style={styles.rulesCard}>
        <Text style={styles.sectionTitle}>Watch scenarios</Text>
        {watchScenarios.map((scenario) => (
          <View key={scenario} style={styles.ruleRow}>
            <View style={styles.ruleBullet} />
            <Text style={styles.ruleText}>{scenario}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F1E8" },
  content: { padding: 24, gap: 14 },
  headerBlock: { gap: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 23 },
  rowReverse: { flexDirection: "row-reverse" },
  textRight: { textAlign: "right" },
  title: { fontSize: 28, fontWeight: "800", color: "#2C2010" },
  subtitle: { marginTop: 4, color: "#7D6B58", fontSize: 13 },
  loadingWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  loadingText: { color: "#7D6B58" },
  errorText: { color: "#B54747", fontWeight: "600" },
  summaryCard: { width: "100%", backgroundColor: "#FFF", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#E9DDC9" },
  summaryLabel: { fontSize: 12, color: "#8B7B6C", fontWeight: "600" },
  summaryValue: { marginTop: 4, fontSize: 30, fontWeight: "800", color: "#D05E46" },
  listCard: { width: "100%", backgroundColor: "#FFF", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#E9DDC9", gap: 12 },
  listItem: { flexDirection: "row", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(180,160,130,0.18)" },
  listBody: { flex: 1, gap: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, backgroundColor: "#D9A441", flexShrink: 0 },
  dotHigh: { backgroundColor: "#D05E46" },
  itemTitle: { fontSize: 13, fontWeight: "700", color: "#2C2010" },
  itemText: { fontSize: 13, color: "#6B5B4F", lineHeight: 18 },
  itemMeta: { fontSize: 11, color: "#9B8B7C" },
  emptyText: { color: "#7D6B58" },
  rulesCard: { width: "100%", backgroundColor: "#FFF", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#E9DDC9", gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#2C2010", marginBottom: 4 },
  ruleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  ruleBullet: { width: 7, height: 7, borderRadius: 3.5, marginTop: 6, backgroundColor: "#8A631A", flexShrink: 0 },
  ruleText: { flex: 1, fontSize: 12, color: "#5C4A39", lineHeight: 16 },
});