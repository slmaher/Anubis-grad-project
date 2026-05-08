import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { api } from "../api/client";
import { getAuthToken, getAuthUser } from "../api/authStorage";
import {
  clearLocalNotifications,
  getLocalNotifications,
  markAllLocalNotificationsAsRead,
  updateLocalNotification,
} from "../api/notificationsStorage";

const DARK = "#2C2010";
const GOLD = "#B8965A";
const MUTED = "#8B7B6C";
const CARD_BG = "rgba(255, 255, 255, 0.82)";
const CARD_BORDER = "rgba(255, 255, 255, 0.95)";
const DIVIDER = "rgba(180,160,130,0.22)";
const DANGER = "#A33C2E";

const iconByType = {
  friend_request: {
    family: "MaterialCommunityIcons",
    name: "account-plus-outline",
  },
  like: {
    family: "MaterialCommunityIcons",
    name: "heart-outline",
  },
  comment: {
    family: "MaterialCommunityIcons",
    name: "comment-text-outline",
  },
  message: {
    family: "Feather",
    name: "mail",
  },
  default: {
    family: "Ionicons",
    name: "notifications-outline",
  },
};

function NotificationIcon({ type }) {
  const icon = iconByType[type] || iconByType.default;

  return (
    <View style={styles.iconBox}>
      {icon.family === "Feather" ? (
        <Feather name={icon.name} size={20} color={GOLD} />
      ) : icon.family === "Ionicons" ? (
        <Ionicons name={icon.name} size={21} color={GOLD} />
      ) : (
        <MaterialCommunityIcons name={icon.name} size={22} color={GOLD} />
      )}
    </View>
  );
}

function formatTime(isoDate) {
  if (!isoDate) return "Now";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Now";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function toCount(value) {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      const me = await getAuthUser();
      const meId = me?._id || me?.id;

      const localNotifications = await getLocalNotifications();
      const safeLocal = localNotifications.map((item) => ({
        ...item,
        type: item.type || "default",
      }));

      setItems([...safeLocal]);

      const nextItems = [...safeLocal];

      if (!token) {
        nextItems.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );
        setItems(nextItems);
        return;
      }

      const [friendRequestsRes, convRes, postsRes] = await Promise.all([
        api.getIncomingFriendRequests(token).catch(() => null),
        api.getConversations(token).catch(() => null),
        meId ? api.getPosts(meId).catch(() => null) : Promise.resolve(null),
      ]);

      if (friendRequestsRes?.success && Array.isArray(friendRequestsRes.data)) {
        friendRequestsRes.data.forEach((request) => {
          nextItems.push({
            id: request.id,
            type: "friend_request",
            title: "Friend request",
            body: `${request.senderName || "Someone"} sent you a friend request.`,
            createdAt: request.createdAt || new Date().toISOString(),
            requestStatus: request.status,
            requesterId: request.senderId,
            requesterName: request.senderName,
            requesterAvatar: request.senderAvatar || "",
            source: "friends",
          });
        });
      }

      if (convRes?.success && Array.isArray(convRes.data)) {
        convRes.data
          .filter((conv) => (conv.unreadCount || 0) > 0)
          .forEach((conv) => {
            nextItems.push({
              id: `msg_${conv.user?._id || conv.user?.id}`,
              type: "message",
              title: "New message",
              body: `${conv.user?.name || "Someone"} sent ${conv.unreadCount} unread message(s).`,
              createdAt:
                conv.lastMessage?.createdAt || new Date().toISOString(),
              source: "chat",
            });
          });
      }

      if (postsRes?.data && Array.isArray(postsRes.data)) {
        postsRes.data.forEach((post) => {
          const likes = toCount(post.likes);
          const comments = Array.isArray(post.comments)
            ? post.comments.length
            : toCount(post.commentsCount);

          if (likes > 0) {
            nextItems.push({
              id: `like_${post._id || post.id}`,
              type: "like",
              title: "Post liked",
              body: `Your post has ${likes} like(s).`,
              createdAt:
                post.updatedAt || post.createdAt || new Date().toISOString(),
              source: "posts",
            });
          }

          if (comments > 0) {
            nextItems.push({
              id: `comment_${post._id || post.id}`,
              type: "comment",
              title: "New comment",
              body: `Your post has ${comments} comment(s).`,
              createdAt:
                post.updatedAt || post.createdAt || new Date().toISOString(),
              source: "posts",
            });
          }
        });
      }

      nextItems.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );
      setItems(nextItems);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
  }, [loadNotifications]);

  useFocusEffect(
    useCallback(() => {
      markAllLocalNotificationsAsRead().finally(() => {
        loadNotifications();
      });
    }, [loadNotifications]),
  );

  const handleClearLocal = async () => {
    await clearLocalNotifications();
    Alert.alert("Done", "Local notifications were cleared.");
    loadNotifications();
  };

  const handleFriendRequestAction = async (item, action) => {
    const actionId = `${action}:${item.id}`;

    try {
      setActionLoadingId(actionId);

      const token = await getAuthToken();
      if (!token) return;

      const response =
        action === "accept"
          ? await api.acceptFriendRequest(item.id, token)
          : await api.rejectFriendRequest(item.id, token);

      if (!response.success) {
        Alert.alert(
          "Error",
          response.message ||
            (action === "accept"
              ? "Could not accept this request."
              : "Could not reject this request."),
        );
        return;
      }

      await updateLocalNotification(item.id, {
        requestStatus: action === "accept" ? "accepted" : "rejected",
        body:
          action === "accept"
            ? `${item.requesterName || "This user"} is now in your friends list.`
            : `You rejected ${item.requesterName || "this"} friend request.`,
        read: true,
      });

      loadNotifications();
    } catch (error) {
      Alert.alert(
        "Error",
        error.message ||
          (action === "accept"
            ? "Could not accept this request."
            : "Could not reject this request."),
      );
    } finally {
      setActionLoadingId(null);
    }
  };

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
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>Your latest updates</Text>
          </View>

          <TouchableOpacity
            onPress={handleClearLocal}
            style={styles.clearBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={GOLD} />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item, index) => item.id || `${item.type}_${index}`}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={refreshNotifications}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBox}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={28}
                    color={GOLD}
                  />
                </View>
                <Text style={styles.emptyTitle}>No notifications yet</Text>
                <Text style={styles.emptyText}>
                  New activity will appear here when you receive updates.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isPendingFriendRequest =
                item.type === "friend_request" &&
                item.requestStatus === "pending";
              const acceptLoading = actionLoadingId === `accept:${item.id}`;
              const rejectLoading = actionLoadingId === `reject:${item.id}`;

              return (
                <View style={[styles.card, item.read && styles.cardRead]}>
                  <NotificationIcon type={item.type} />

                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardTitle}>
                        {item.title || "Notification"}
                      </Text>
                      <Text style={styles.cardTime}>
                        {formatTime(item.createdAt)}
                      </Text>
                    </View>

                    <Text style={styles.cardText}>
                      {item.body || "You have a new update."}
                    </Text>

                    {isPendingFriendRequest && (
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.acceptBtn]}
                          onPress={() =>
                            handleFriendRequestAction(item, "accept")
                          }
                          disabled={Boolean(actionLoadingId)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.actionText}>
                            {acceptLoading ? "Accepting..." : "Accept"}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, styles.rejectBtn]}
                          onPress={() =>
                            handleFriendRequestAction(item, "reject")
                          }
                          disabled={Boolean(actionLoadingId)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.actionText}>
                            {rejectLoading ? "Rejecting..." : "Reject"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}
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

  clearBtn: {
    minWidth: 48,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(184, 150, 90, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(184, 150, 90, 0.28)",
  },

  clearText: {
    fontSize: 13,
    color: DARK,
    fontWeight: "800",
  },

  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 34,
    paddingTop: 4,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 30,
  },

  emptyCard: {
    marginTop: 40,
    backgroundColor: CARD_BG,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 5,
  },

  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: "rgba(184, 150, 90, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyTitle: {
    color: DARK,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },

  emptyText: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "600",
  },

  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    elevation: 5,
  },

  cardRead: {
    opacity: 0.72,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "rgba(184, 150, 90, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardBody: {
    flex: 1,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 4,
  },

  cardTitle: {
    flex: 1,
    color: DARK,
    fontSize: 15.5,
    fontWeight: "800",
  },

  cardText: {
    color: DARK,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },

  cardTime: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },

  actionBtn: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },

  acceptBtn: {
    backgroundColor: "#7A9A6C",
  },

  rejectBtn: {
    backgroundColor: DANGER,
  },

  actionText: {
    color: "#fff",
    fontSize: 12.5,
    fontWeight: "800",
  },
});