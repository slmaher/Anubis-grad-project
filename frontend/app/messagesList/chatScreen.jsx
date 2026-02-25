import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState("");

  const contactName = params.contactName || "Contact";
  const contactId = params.contactId || "1";

  // Different messages for each contact
  const getChatMessages = (id) => {
    const messagesData = {
      "1": [ // Shane Haq
        {
          id: 1,
          text: "Hi There! Are you available for talk?",
          time: "10:30 AM",
          isSent: false,
        },
        {
          id: 2,
          text: "Yes, I'm free now. What's up?",
          time: "10:31 AM",
          isSent: true,
          hasCheckmark: true,
        },
        {
          id: 3,
          text: "I wanted to discuss the museum visit plans!",
          time: "10:32 AM",
          isSent: false,
        },
        {
          id: 4,
          text: "Sounds great! When are you planning to go?",
          time: "10:33 AM",
          isSent: true,
          hasCheckmark: true,
        },
      ],
      "2": [ // Maria Bali
        {
          id: 1,
          text: "Hey! How was your day?",
          time: "11:15 AM",
          isSent: false,
        },
        {
          id: 2,
          text: "It was good! Just finished visiting the pyramids",
          time: "11:20 AM",
          isSent: true,
          hasCheckmark: true,
        },
        {
          id: 3,
          images: [
            require("../../assets/images/chat-image-1.jpg"),
            require("../../assets/images/chat-image-2.jpg"),
            require("../../assets/images/chat-image-3.jpg"),
          ],
          time: "11:21 AM",
          isSent: true,
          hasCheckmark: true,
        },
        {
          id: 4,
          text: "Wow! These photos are amazing!",
          time: "11:25 AM",
          isSent: false,
        },
      ],
      "3": [ // Gualtiero Cea
        {
          id: 1,
          text: "Yeah, but John, if The Pirates of the Caribbean breaks down,",
          time: "6:55 AM",
          isSent: false,
        },
        {
          id: 2,
          text: "Eventually, you do plan to have dinosaurs on your dinosaur tour, right? Checkmate...",
          time: "6:55 AM",
          isSent: true,
          hasCheckmark: true,
        },
        {
          id: 3,
          images: [
            require("../../assets/images/chat-image-1.jpg"),
            require("../../assets/images/chat-image-2.jpg"),
            require("../../assets/images/chat-image-3.jpg"),
          ],
          time: "6:55 AM",
          isSent: false,
        },
        {
          id: 4,
          text: "Eventually, you do plan to have dinosaurs on your dinosaur tour, right? Checkmate...",
          time: "6:55 AM",
          isSent: true,
          hasCheckmark: true,
        },
        {
          id: 5,
          text: "Yes, I'm done!",
          time: "6:55 AM",
          isSent: false,
        },
      ],
      "4": [ // Marta Zarco
        {
          id: 1,
          text: "Is this my espresso machine?",
          time: "7:00 AM",
          isSent: false,
        },
        {
          id: 2,
          text: "Haha, no! That's mine 😄",
          time: "7:05 AM",
          isSent: true,
          hasCheckmark: true,
        },
        {
          id: 3,
          text: "Oh my bad! It looks exactly like mine",
          time: "7:06 AM",
          isSent: false,
        },
        {
          id: 4,
          text: "No worries! Want to grab coffee later?",
          time: "7:10 AM",
          isSent: true,
          hasCheckmark: true,
        },
        {
          id: 5,
          text: "Sure! Let's meet at 3 PM",
          time: "7:12 AM",
          isSent: false,
        },
      ],
      "5": [ // Rosita Marcos
        {
          id: 1,
          text: "I gave it a cold? I gave it a virus...",
          time: "1:00 PM",
          isSent: false,
        },
        {
          id: 2,
          text: "What are you talking about?",
          time: "1:05 PM",
          isSent: true,
          hasCheckmark: true,
        },
        {
          id: 3,
          text: "Just kidding! It's a movie quote 😂",
          time: "1:06 PM",
          isSent: false,
        },
        {
          id: 4,
          text: "Haha you got me there!",
          time: "1:08 PM",
          isSent: true,
          hasCheckmark: true,
        },
      ],
      "6": [ // Agueda Pedro
        {
          id: 1,
          text: "If The Pirates of the Caribbean breaks down, the pirates don't eat the tourists",
          time: "2:30 PM",
          isSent: false,
        },
        {
          id: 2,
          text: "Classic Jurassic Park reference! Love it!",
          time: "2:35 PM",
          isSent: true,
          hasCheckmark: true,
        },
        {
          id: 3,
          images: [
            require("../../assets/images/chat-image-1.jpg"),
            require("../../assets/images/chat-image-2.jpg"),
            require("../../assets/images/chat-image-3.jpg"),
          ],
          time: "2:36 PM",
          isSent: false,
        },
        {
          id: 4,
          text: "These remind me of that movie!",
          time: "2:38 PM",
          isSent: false,
        },
        {
          id: 5,
          text: "Indeed! Great memories",
          time: "2:40 PM",
          isSent: true,
          hasCheckmark: true,
        },
      ],
    };

    return messagesData[id] || messagesData["3"]; // Default to Gualtiero's messages
  };

  const chatMessages = getChatMessages(contactId);

  const handleSend = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
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
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {chatMessages.map((msg) => (
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