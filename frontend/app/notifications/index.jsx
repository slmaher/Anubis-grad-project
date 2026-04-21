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
import { api } from "../api/client";
import { getAuthToken, getAuthUser } from "../api/authStorage";
import {
  clearLocalNotifications,
  getLocalNotifications,
  markAllLocalNotificationsAsRead,
  updateLocalNotification,
} from "../api/notificationsStorage";

const iconByType = {
  friend_request: "🤝",
  like: "♡",
  comment: "💬",
  message: "✉",
  default: "🔔",
};

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

      const nextItems = [...safeLocal];

      if (token) {
        try {
          const friendRequestsRes = await api.getIncomingFriendRequests(token);
          if (
            friendRequestsRes?.success &&
            Array.isArray(friendRequestsRes.data)
          ) {
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
        } catch {
          // Ignore request list failures and keep local notifications visible.
        }
      }

      if (token) {
        try {
          const convRes = await api.getConversations(token);
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
        } catch {
          // Keep local notifications visible even if API fails.
        }
      }

      if (token && meId) {
        try {
          const postsRes = await api.getPosts(meId);
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
                    post.updatedAt ||
                    post.createdAt ||
                    new Date().toISOString(),
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
                    post.updatedAt ||
                    post.createdAt ||
                    new Date().toISOString(),
                  source: "posts",
                });
              }
            });
          }
        } catch {
          // Ignore post notifications when unavailable.
        }
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

  const handleAcceptFriendRequest = async (item) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await api.acceptFriendRequest(item.id, token);
      if (!response.success) {
        Alert.alert(
          "Error",
          response.message || "Could not accept this request.",
        );
        return;
      }

      await updateLocalNotification(item.id, {
        requestStatus: "accepted",
        body: `${item.requesterName || "This user"} is now in your friends list.`,
        read: true,
      });
      loadNotifications();
    } catch (error) {
      Alert.alert("Error", error.message || "Could not accept this request.");
    }
  };

  const handleRejectFriendRequest = async (item) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await api.rejectFriendRequest(item.id, token);
      if (!response.success) {
        Alert.alert(
          "Error",
          response.message || "Could not reject this request.",
        );
        return;
      }

      await updateLocalNotification(item.id, {
        requestStatus: "rejected",
        body: `You rejected ${item.requesterName || "this"} friend request.`,
        read: true,
      });
      loadNotifications();
    } catch (error) {
      Alert.alert("Error", error.message || "Could not reject this request.");
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
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={handleClearLocal} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#6B5B4F" />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item, index) => item.id || `${item.type}_${index}`}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={refreshNotifications}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No notifications yet.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const icon = iconByType[item.type] || iconByType.default;
              const isPendingFriendRequest =
                item.type === "friend_request" &&
                item.requestStatus === "pending";
              return (
                <View
                  style={[
                    styles.card,
                    item.read && styles.cardRead,
                  ]}
                >
                  <Text style={styles.cardIcon}>{icon}</Text>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>
                      {item.title || "Notification"}
                    </Text>
                    <Text style={styles.cardText}>
                      {item.body || "You have a new update."}
                    </Text>
                    <Text style={styles.cardTime}>
                      {formatTime(item.createdAt)}
                    </Text>
                    {isPendingFriendRequest && (
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.acceptBtn]}
                          onPress={() => handleAcceptFriendRequest(item)}
                        >
                          <Text style={styles.actionText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.rejectBtn]}
                          onPress={() => handleRejectFriendRequest(item)}
                        >
                          <Text style={styles.actionText}>Reject</Text>
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

const DARK = "#2C2010";
const MUTED = "#9A8C7A";

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 34,
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 30,
    color: DARK,
    lineHeight: 34,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: DARK,
  },
  clearBtn: {
    minWidth: 42,
    alignItems: "flex-end",
  },
  clearText: {
    fontSize: 13,
    color: "#6B5B4F",
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 30,
  },
  emptyText: {
    color: MUTED,
    fontSize: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(180,160,130,0.35)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  cardRead: {
    opacity: 0.65,
  },
  cardIcon: {
    width: 28,
    textAlign: "center",
    fontSize: 18,
    marginTop: 2,
    marginRight: 8,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    color: DARK,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardText: {
    color: DARK,
    fontSize: 13,
    lineHeight: 18,
  },
  cardTime: {
    marginTop: 5,
    color: MUTED,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  actionBtn: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  acceptBtn: {
    backgroundColor: "#7A9A6C",
  },
  rejectBtn: {
    backgroundColor: "#B06B5C",
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
