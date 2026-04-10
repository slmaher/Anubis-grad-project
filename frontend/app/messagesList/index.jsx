import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
  PanResponder,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { getAuthToken } from "../api/authStorage";
import { useChatSocket } from "../hooks/useChatSocket";

const getInitial = (name) => {
  if (!name || typeof name !== "string") return "U";
  return name.trim().charAt(0).toUpperCase() || "U";
};

// Swipeable Message Item Component
const SwipeableMessageItem = ({ item, onPress, onDelete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isSwiped, setIsSwiped] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -120));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -60) {
          Animated.spring(translateX, {
            toValue: -120,
            useNativeDriver: true,
            friction: 8,
          }).start();
          setIsSwiped(true);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
          setIsSwiped(false);
        }
      },
    }),
  ).current;

  const closeSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
    setIsSwiped(false);
  };

  const handlePress = () => {
    if (isSwiped) {
      closeSwipe();
    } else {
      onPress();
    }
  };

  return (
    <View style={styles.messageItemContainer}>
      {/* Action Buttons (Behind) */}
      <View style={styles.swipeActions}>
        <TouchableOpacity style={styles.swipeActionButton} onPress={closeSwipe}>
          <Text style={styles.swipeActionIcon}>⋮</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.swipeActionButton}
          onPress={() => {
            closeSwipe();
            onDelete(item.id);
          }}
        >
          <Image
            source={require("../../assets/images/white-trash.png")}
            style={styles.trashIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Message Item (Swipeable) */}
      <Animated.View
        style={[styles.messageItemWrapper, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.messageItem}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.messageAvatar} />
          ) : (
            <View style={styles.messageAvatarFallback}>
              <Text style={styles.messageAvatarFallbackText}>
                {getInitial(item.name)}
              </Text>
            </View>
          )}

          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageName}>{item.name}</Text>
              <Text style={styles.messageTime}>{item.time}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function MessagesList() {
  const router = useRouter();
  const { t } = useTranslation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await api.getConversations(token);
      if (response.success) {
        const formatted = response.data.map((conv) => ({
          id: conv.user._id,
          name: conv.user.name,
          message: conv.lastMessage?.content || "",
          time: conv.lastMessage
            ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          avatar: conv.user?.avatar || null,
          unread: conv.unreadCount > 0,
        }));
        setConversations(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleNewMessage = useCallback(
    (message) => {
      // Refresh conversations list when a new message arrives
      fetchConversations();
    },
    [fetchConversations],
  );

  useChatSocket(handleNewMessage);

  const handleDelete = (id) => {
    setConversations(conversations.filter((msg) => msg.id !== id));
  };

  const handleChatPress = (contact) => {
    router.push({
      pathname: "/messagesList/chatScreen",
      params: {
        contactId: contact.id,
        contactName: contact.name,
        contactAvatar: contact.avatar,
      },
    });
  };

  const renderMessageItem = ({ item }) => (
    <SwipeableMessageItem
      item={item}
      onPress={() => handleChatPress(item)}
      onDelete={handleDelete}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)/community")}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {t("chat_pages.list_title")}
        </Text>
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B5B4F" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t("chat_pages.no_conversations")}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE6DF",
  },
  header: {
    backgroundColor: "#6B5B4F",
    paddingTop: 60,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    position: "absolute",
    top: 55,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  backIcon: {
    fontSize: 28,
    color: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    paddingHorizontal: 20,
    paddingLeft: 70,
    marginBottom: 4,
    lineHeight: 26,
    paddingRight: 24,
  },
  messagesList: {
    flex: 1,
    backgroundColor: "#EDE6DF",
  },
  messagesContent: {
    paddingBottom: 30,
    paddingTop: 14,
  },
  messageItemContainer: {
    position: "relative",
    backgroundColor: "rgba(249,247,244,0.98)",
    borderBottomWidth: 1,
    borderBottomColor: "#E5DED5",
    overflow: "hidden",
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5DED5",
  },
  messageItemWrapper: {
    backgroundColor: "rgba(249,247,244,0.98)",
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(249,247,244,0.98)",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  messageAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  messageAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: "#C4B5A0",
    alignItems: "center",
    justifyContent: "center",
  },
  messageAvatarFallbackText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  messageName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C2010",
  },
  messageTime: {
    fontSize: 12,
    color: "#9A8C7A",
  },
  swipeActions: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4444",
    paddingHorizontal: 15,
    gap: 15,
  },
  swipeActionButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  swipeActionIcon: {
    fontSize: 24,
    color: "#fff",
  },
  trashIcon: {
    width: 22,
    height: 22,
    tintColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#8B7B6C",
    fontSize: 16,
  },
});
