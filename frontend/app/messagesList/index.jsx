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

const SWIPE_WIDTH = 110;

const SwipeableMessageItem = ({ item, onPress, onDelete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const currentX = useRef(0);
  const [isSwiped, setIsSwiped] = useState(false);

  const closeSwipe = () => {
    currentX.current = 0;
    translateX.setValue(0);
    setIsSwiped(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,

      onMoveShouldSetPanResponder: (_, gestureState) => {
        const horizontalMove = Math.abs(gestureState.dx) > 5;
        const moreHorizontalThanVertical =
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy);

        return horizontalMove && moreHorizontalThanVertical;
      },

      onPanResponderGrant: () => {
        translateX.stopAnimation((value) => {
          currentX.current = value;
        });
      },

      onPanResponderMove: (_, gestureState) => {
        let nextX = currentX.current + gestureState.dx;

        if (nextX > 0) {
          nextX = 0;
        }

        if (nextX < -SWIPE_WIDTH) {
          nextX = -SWIPE_WIDTH;
        }

        translateX.setValue(nextX);
      },

      onPanResponderRelease: (_, gestureState) => {
        let finalX = currentX.current + gestureState.dx;

        if (finalX > 0) {
          finalX = 0;
        }

        if (finalX < -SWIPE_WIDTH) {
          finalX = -SWIPE_WIDTH;
        }

        currentX.current = finalX;
        translateX.setValue(finalX);
        setIsSwiped(finalX < -5);
      },

      onPanResponderTerminate: () => {
        translateX.setValue(currentX.current);
        setIsSwiped(currentX.current < -5);
      },
    }),
  ).current;

  const handlePress = () => {
    if (isSwiped) {
      return;
    }

    onPress();
  };

  return (
    <View style={styles.messageItemContainer}>
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

      <Animated.View
        style={[styles.messageItemWrapper, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.messageItem}
          onPress={handlePress}
          activeOpacity={0.75}
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
              <Text style={styles.messageName} numberOfLines={1}>
                {item.name}
              </Text>

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

  const handleNewMessage = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  useChatSocket(handleNewMessage);

  const handleDelete = (id) => {
    setConversations((prev) => prev.filter((msg) => msg.id !== id));
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/community")}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {t("chat_pages.list_title")}
        </Text>
      </View>

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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t("chat_pages.no_conversations")}
              </Text>
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
    paddingTop: 80,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  backButton: {
    position: "absolute",
    top: 75,
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
    gap: 12,
  },

  messageName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2010",
  },

  messageTime: {
    fontSize: 15,
    color: "#9A8C7A",
  },

  swipeActions: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: SWIPE_WIDTH,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF4444",
    gap: 10,
  },

  swipeActionButton: {
    width: 42,
    height: 42,
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