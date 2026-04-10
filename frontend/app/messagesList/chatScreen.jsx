import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api/client";
import { getAuthToken, getAuthUser } from "../api/authStorage";
import { useChatSocket } from "../hooks/useChatSocket";

const DARK = "#2C2010";
const MUTED = "#8B7B6C";
const LIGHT = "#EDE6DF";
const CARD_BG = "rgba(249,247,244,0.98)";
const BORDER = "#E5DED5";

const getInitial = (name) => {
  if (!name || typeof name !== "string") return "U";
  return name.trim().charAt(0).toUpperCase() || "U";
};

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const scrollViewRef = useRef(null);

  const contactName = params.contactName || "Contact";
  const contactId = params.contactId;
  const contactAvatar =
    typeof params.contactAvatar === "string" && params.contactAvatar !== "null"
      ? params.contactAvatar
      : null;

  const fetchMessages = useCallback(async () => {
    try {
      const token = await getAuthToken();
      const user = await getAuthUser();
      setCurrentUser(user);

      if (!token || !contactId) return;

      const response = await api.getMessages(contactId, token);
      if (response.success) {
        const formatted = response.data.map((msg) => ({
          id: msg._id,
          text: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSent: msg.sender._id === user?.id || msg.sender === user?.id,
          hasCheckmark: msg.isRead,
        }));
        setChatMessages(formatted.reverse()); // Backend returns descending, we want ascending for display

        // Mark as read
        await api.markConversationAsRead(contactId, token);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleNewMessage = useCallback((msg) => {
    // Only add if it's from the current contact
    if (msg.sender._id === contactId || msg.sender === contactId) {
      const formatted = {
        id: msg._id,
        text: msg.content,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSent: false,
        hasCheckmark: false,
      };
      setChatMessages((prev) => [...prev, formatted]);

      // Mark as read in backend
      getAuthToken().then(token => {
        if (token) api.markConversationAsRead(contactId, token);
      });
    }
  }, [contactId]);

  useChatSocket(handleNewMessage);

  const handleSend = async () => {
    if (message.trim()) {
      try {
        const token = await getAuthToken();
        if (!token || !contactId) return;

        const response = await api.sendMessage(contactId, message, token);
        if (response.success) {
          const msg = response.data;
          const formatted = {
            id: msg._id,
            text: msg.content,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSent: true,
            hasCheckmark: false,
          };
          setChatMessages((prev) => [...prev, formatted]);
          setMessage("");
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Brown Header (Empty with back button) */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerIdentityRow}>
          {contactAvatar ? (
            <Image source={{ uri: contactAvatar }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <Text style={styles.headerAvatarFallbackText}>{getInitial(contactName)}</Text>
            </View>
          )}
          <Text style={styles.headerContactName} numberOfLines={1}>
            {contactName}
          </Text>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {loading ? (
          <ActivityIndicator size="small" color={DARK} />
        ) : chatMessages.map((msg) => (
          <View key={msg.id} style={styles.messageWrapper}>
            {msg.images ? (
              <View style={[styles.messageBubble, styles.receivedBubble]}>
                <View style={styles.imagesContainer}>
                  {msg.images.map((img, index) => (
                    <Image
                      key={index}
                      source={img}
                      style={styles.chatImage}
                    />
                  ))}
                </View>
                <Text style={styles.messageTime}>{msg.time}</Text>
              </View>
            ) : (
              <View 
                style={[
                  styles.messageBubble,
                  msg.isSent ? styles.sentBubble : styles.receivedBubble
                ]}
              >
                <Text style={[
                  styles.messageText,
                  msg.isSent ? styles.sentText : styles.receivedText
                ]}>
                  {msg.text}
                </Text>
                <View style={styles.messageFooter}>
                  <Text style={[
                    styles.messageTime,
                    msg.isSent && styles.sentTime
                  ]}>
                    {msg.time}
                  </Text>
                  {msg.hasCheckmark && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor={MUTED}
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSend}
          >
            <Image
              source={require("../../assets/images/send-icon.png")}
              style={styles.sendIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT,
  },
  header: {
    backgroundColor: "#756557",
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIdentityRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 12,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.75)",
  },
  headerAvatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarFallbackText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  backIcon: {
    fontSize: 28,
    color: "#fff",
  },
  headerContactName: {
    textAlign: "left",
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 34,
    maxWidth: "78%",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: LIGHT,
  },
  messagesContent: {
    paddingHorizontal: 15,
    paddingVertical: 16,
    paddingBottom: 10,
  },
  messageWrapper: {
    marginBottom: 15,
  },
  messageBubble: {
    maxWidth: "65%",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical:10,
    borderWidth: 1,
  },
  receivedBubble: {
    alignSelf: "flex-start",
    backgroundColor: CARD_BG,
    borderColor: BORDER,
    borderTopLeftRadius: 4,
  },
  sentBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#756557",
    borderColor: "#9A846E",
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "500",
  },
  receivedText: {
    color: DARK,
  },
  sentText: {
    color: "#fff",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
  },
  sentTime: {
    color: "rgba(255,255,255,0.75)",
  },
  checkmark: {
    fontSize: 12,
    color: "#E7D3B4",
  },
  imagesContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  chatImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  inputContainer: {
    backgroundColor: LIGHT,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    paddingVertical: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: DARK,
    maxHeight: 100,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#756557",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 3,
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: "#fff",
  },
});