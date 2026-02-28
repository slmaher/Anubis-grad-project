import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api/client";
import { getAuthToken, getAuthUser } from "../api/authStorage";
import { useChatSocket } from "../hooks/useChatSocket";

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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      {/* White Contact Info Section */}
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contactName}</Text>
        
        <TouchableOpacity style={styles.callButton}>
          <Image
            source={require("../../assets/images/phone-icon.png")}
            style={styles.callIcon}
          />
        </TouchableOpacity>
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
          <ActivityIndicator size="small" color="#6B5B4F" />
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
            placeholderTextColor="#999"
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
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#6B5B4F",
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: "#fff",
  },
  contactInfo: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contactName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2C3E50",
    lineHeight: 28,
  },
  callButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
  },
  callIcon: {
    width: 22,
    height: 22,
    tintColor: "#6B5B4F",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  messagesContent: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    paddingBottom: 10,
  },
  messageWrapper: {
    marginBottom: 15,
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 18,
    padding: 12,
  },
  receivedBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#E8E8E8",
    borderTopLeftRadius: 4,
  },
  sentBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#D9D9D9",
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  receivedText: {
    color: "#000",
  },
  sentText: {
    color: "#000",
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
    color: "#666",
    marginTop: 4,
  },
  sentTime: {
    color: "#666",
  },
  checkmark: {
    fontSize: 12,
    color: "#4A90E2",
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
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
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
    fontSize: 15,
    color: "#000",
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6B5B4F",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: "#fff",
  },
});