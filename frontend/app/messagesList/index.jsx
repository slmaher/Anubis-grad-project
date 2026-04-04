import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Animated, PanResponder, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "../api/client";
import { getAuthToken } from "../api/authStorage";
import { useChatSocket } from "../hooks/useChatSocket";

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
    })
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
        <TouchableOpacity 
          style={styles.swipeActionButton}
          onPress={closeSwipe}
        >
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
        style={[
          styles.messageItemWrapper,
          { transform: [{ translateX }] }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.messageItem}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Image source={item.avatar} style={styles.messageAvatar} />
          
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageName}>{item.name}</Text>
              <Text style={styles.messageTime}>{item.time}</Text>
            </View>
            <Text style={styles.messageText} numberOfLines={1}>
              {item.message}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function MessagesList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Messages");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultFriends = [
    { id: 1, name: "Benjamin", image: require("../../assets/images/profile-benjamin.png") },
    { id: 2, name: "Farita", image: require("../../assets/images/profile-farita.png") },
    { id: 3, name: "Marie", image: require("../../assets/images/profile-marie.png") },
    { id: 4, name: "Claire", image: require("../../assets/images/profile-claire.png") },
    { id: 5, name: "Alex", image: require("../../assets/images/profile-alex.png") },
  ];
  const [friends, setFriends] = useState(defaultFriends);

  const loadAcceptedFriends = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setFriends(defaultFriends);
        return;
      }

      const response = await api.getFriends(token);
      if (response?.success && Array.isArray(response.data)) {
        const mapped = response.data.map((item) => ({
          id: item.id || item._id,
          name: item.name,
          image: item.avatar
            ? { uri: item.avatar }
            : require("../../assets/images/profile-farita.png"),
        }));

        const merged = [...mapped, ...defaultFriends].filter(
          (friend, index, arr) =>
            index === arr.findIndex((entry) => String(entry.id) === String(friend.id)),
        );

        setFriends(merged);
        return;
      }

      setFriends(defaultFriends);
    } catch (error) {
      console.error("Failed to load friends:", error);
      setFriends(defaultFriends);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await api.getConversations(token);
      if (response.success) {
        const formatted = response.data.map((conv) => ({
          id: conv.user._id,
          name: conv.user.name,
          message: conv.lastMessage?.content || "No messages yet",
          time: conv.lastMessage
            ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : "",
          avatar: require("../../assets/images/profile-farita.png"), // Default for now
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

  useFocusEffect(
    useCallback(() => {
      loadAcceptedFriends();
    }, [loadAcceptedFriends]),
  );

  const handleNewMessage = useCallback((message) => {
    // Refresh conversations list when a new message arrives
    fetchConversations();
  }, [fetchConversations]);

  useChatSocket(handleNewMessage);

  const handleDelete = (id) => {
    setConversations(conversations.filter(msg => msg.id !== id));
  };

  const handleChatPress = (contact) => {
    router.push({
      pathname: "/messagesList/chatScreen",
      params: {
        contactId: contact.id,
        contactName: contact.name,
        contactAvatar: contact.avatar,
      }
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

        <Text style={styles.headerTitle}>Chat with{"\n"}friends</Text>
        
        {/* Friends Avatars */}
        <View style={styles.friendsSection}>
          <TouchableOpacity style={styles.searchButton}>
            <Image
              source={require("../../assets/images/search-icon-white.png")}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.friendsScroll}
          >
            {friends.map((friend) => (
              <TouchableOpacity key={friend.id} style={styles.friendAvatar}>
                <Image source={friend.image} style={styles.friendImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={styles.tab}
            onPress={() => setActiveTab("Messages")}
          >
            <View style={styles.tabContent}>
              <Text style={[
                styles.tabText, 
                activeTab === "Messages" && styles.activeTabText
              ]}>
                Messages
              </Text>
              {activeTab === "Messages" && <View style={styles.unreadIndicator} />}
            </View>
            {activeTab === "Messages" && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tab}
            onPress={() => setActiveTab("Calls")}
          >
            <Text style={styles.tabText}>Calls</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tab}
            onPress={() => setActiveTab("Groups")}
          >
            <Text style={styles.tabText}>Groups</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab}>
            <View style={styles.createBadge}>
                <Text style={styles.createButtonText}>CREATE</Text>
            </View>
          </TouchableOpacity>
        </View>
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
              <Text style={styles.emptyText}>No conversations found</Text>
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
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#6B5B4F",
    paddingTop: 60,
    paddingBottom: 0,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    paddingHorizontal: 20,
    paddingLeft: 70,
    marginBottom: 25,
    lineHeight: 30,
  },
  friendsSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  searchIcon: {
    width: 22,
    height: 22,
    tintColor: "#fff",
  },
  friendsScroll: {
    flex: 1,
  },
  friendAvatar: {
    marginRight: 12,
  },
  friendImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 15,
  },
  tab: {
    paddingBottom: 12,
    alignItems: "center",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF8C42",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#fff",
  },
  createBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  createButtonText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  messagesList: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  messagesContent: {
    paddingBottom: 30,
  },
  messageItemContainer: {
    position: "relative",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    overflow: "hidden",
  },
  messageItemWrapper: {
    backgroundColor: "#fff",
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  messageAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  messageName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  messageTime: {
    fontSize: 12,
    color: "#999",
  },
  messageText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
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
    color: "#999",
    fontSize: 16,
  },
});