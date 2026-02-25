import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Animated, PanResponder } from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";

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

  const friends = [
    { id: 1, name: "Benjamin", image: require("../../assets/images/profile-benjamin.png") },
    { id: 2, name: "Farita", image: require("../../assets/images/profile-farita.png") },
    { id: 3, name: "Marie", image: require("../../assets/images/profile-marie.png") },
    { id: 4, name: "Claire", image: require("../../assets/images/profile-claire.png") },
    { id: 5, name: "Alex", image: require("../../assets/images/profile-alex.png") },
  ];

  const [messages, setMessages] = useState([
    {
      id: 1,
      name: "Shane Haq",
      message: "Hi There! Are you available for talk?",
      time: "12:00",
      avatar: require("../../assets/images/profile-farita.png"),
      unread: false,
    },
    {
      id: 2,
      name: "Maria Bali",
      message: "I don't talk now, I'm on the way to...",
      time: "12:00",
      avatar: require("../../assets/images/profile-you.png"),
      unread: true,
    },
    {
      id: 3,
      name: "Gualtiero Cea",
      message: "Hey! What, Up? Talk me from front...",
      time: "13:00",
      avatar: require("../../assets/images/profile-alex.png"),
      unread: false,
    },
    {
      id: 4,
      name: "Marta Zarco",
      message: "Is this my espresso machine? Why what is...",
      time: "7:00",
      avatar: require("../../assets/images/profile-marie.png"),
      unread: false,
    },
    {
      id: 5,
      name: "Rosita Marcos",
      message: "I gave it a cold? I gave it a virus...",
      time: "13:00",
      avatar: require("../../assets/images/profile-claire.png"),
      unread: false,
    },
    {
      id: 6,
      name: "Agueda Pedro",
      message: "If The Pirates of the Caribbean...",
      time: "14:00",
      avatar: require("../../assets/images/profile-benjamin.png"),
      unread: false,
    },
  ]);

  const handleDelete = (id) => {
    setMessages(messages.filter(msg => msg.id !== id));
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
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
      />
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
});