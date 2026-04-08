import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ImageBackground, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function AIChatbot() {
  const router = useRouter();
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollViewRef = useRef(null);

  const suggestions = [
    t("ai_chat.suggestion_1"),
    t("ai_chat.suggestion_2"),
  ];

  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // What can I ask you to do?
    if (lowerMessage.includes("what can i ask") || lowerMessage.includes("what can you do")) {
      return t("ai_chat.responses.capabilities");
    }

    // Nearest museum
    if (lowerMessage.includes("nearest museum") || lowerMessage.includes("closest museum")) {
      return t("ai_chat.responses.nearest_museum");
    }

    // Grand Egyptian Museum
    if (lowerMessage.includes("grand egyptian museum") || lowerMessage.includes("gem")) {
      return t("ai_chat.responses.grand_egyptian");
    }

    // Egyptian Museum
    if (lowerMessage.includes("egyptian museum") && !lowerMessage.includes("grand")) {
      return t("ai_chat.responses.egyptian");
    }

    // Museum of Islamic Art
    if (lowerMessage.includes("islamic art") || lowerMessage.includes("islamic museum")) {
      return t("ai_chat.responses.islamic_art");
    }

    // Tickets
    if (lowerMessage.includes("ticket") || lowerMessage.includes("price")) {
      return t("ai_chat.responses.tickets");
    }

    // Opening hours
    if (lowerMessage.includes("hours") || lowerMessage.includes("open") || lowerMessage.includes("close")) {
      return t("ai_chat.responses.hours");
    }

    // Recommendations
    if (lowerMessage.includes("recommend") || lowerMessage.includes("should i visit") || lowerMessage.includes("best museum")) {
      return t("ai_chat.responses.recommendations");
    }

    // Souvenirs
    if (lowerMessage.includes("souvenir") || lowerMessage.includes("shop") || lowerMessage.includes("buy")) {
      return t("ai_chat.responses.souvenirs");
    }

    // Map/Directions
    if (lowerMessage.includes("map") || lowerMessage.includes("direction") || lowerMessage.includes("how to get")) {
      return t("ai_chat.responses.map");
    }

    // Greeting
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return t("ai_chat.responses.greeting");
    }

    // Thanks
    if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
      return t("ai_chat.responses.thanks");
    }

    // Default response
    return t("ai_chat.responses.default");
  };

  const handleSendMessage = (text = inputText) => {
    if (!text.trim()) return;

    // Hide suggestions after first message
    setShowSuggestions(false);

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");

    // Simulate AI thinking and response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: getAIResponse(text.trim()),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 800);
  };

  const handleSuggestionPress = (suggestion) => {
    handleSendMessage(suggestion);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <ImageBackground
      source={require("../../assets/images/ai_background.jpeg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        {/* AI Icon and Title */}
        {messages.length === 0 && (
          <View style={styles.titleSection}>
            <Image
              source={require("../../assets/images/sparkling_stars.png")}
              style={styles.sparklingIcon}
            />
            <Text style={styles.title}>{t("ai_chat.title")}</Text>
          </View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.sender === "user" ? styles.userMessageWrapper : styles.aiMessageWrapper
              ]}
            >
              <View style={styles.messageLabelContainer}>
                <Text style={styles.messageLabel}>
                  {message.sender === "user" ? t("ai_chat.label_me") : t("ai_chat.label_ai")}
                </Text>
              </View>
              <View
                style={[
                  styles.messageBubble,
                  message.sender === "user" ? styles.userBubble : styles.aiBubble
                ]}
              >
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Suggestions */}
        {showSuggestions && messages.length === 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>{t("ai_chat.suggestions_title")}</Text>
            <View style={styles.suggestionsContainer}>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t("ai_chat.input_placeholder")}
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={() => handleSendMessage()}
            >
              <Image
                source={require("../../assets/images/send-icon2.png")}
                style={styles.sendIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backIcon: {
    fontSize: 28,
    color: "#000",
    fontWeight: "600",
  },
  titleSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  sparklingIcon: {
    width: 50,
    height: 50,
    marginBottom: 15,
    tintColor: "#000",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  messageWrapper: {
    marginBottom: 20,
  },
  userMessageWrapper: {
    alignItems: "flex-end",
  },
  aiMessageWrapper: {
    alignItems: "flex-start",
  },
  messageLabelContainer: {
    marginBottom: 5,
  },
  messageLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.5)",
    letterSpacing: 0.5,
  },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  suggestionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 13,
    color: "rgba(0, 0, 0, 0.5)",
    marginBottom: 12,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    maxHeight: 100,
  },
  sendButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  sendIcon: {
    width: 24,
    height: 24,
    tintColor: "#8B7B6C",
  },
});