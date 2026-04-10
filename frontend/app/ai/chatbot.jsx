import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n/i18n";
import { api } from "../api/client";

async function callGeminiViaBackend(chatHistory, langCode) {
  const history = chatHistory.map((msg) => ({
    sender: msg.sender,
    text: msg.text,
  }));

  const result = await api.getAiChatReply(history, langCode);
  return result?.data?.reply ?? "";
}

function buildLocalFallbackReply(t) {
  const quotaLine = t(
    "ai_chat.quota_message",
    "Gemini quota is currently exceeded. Using local assistant answers for now.",
  );
  const defaultLine = t(
    "ai_chat.responses.default",
    "I can help with museums, tickets, directions, and recommendations.",
  );

  return `${quotaLine}\n\n${defaultLine}`;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function AIChatbot() {
  const router = useRouter();
  const { t } = useTranslation();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef(null);

  const suggestions = [t("ai_chat.suggestion_1"), t("ai_chat.suggestion_2")];

  // Auto-scroll when messages or loading state changes
  useEffect(() => { 
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim() || isLoading) return;

    setShowSuggestions(false);

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInputText("");
    setIsLoading(true);

    try {
      // Detect active language (strip region suffix, e.g. "ar-EG" → "ar")
      const currentLang = (i18n.language || "en").split("-")[0];
      const aiText = await callGeminiViaBackend(updatedHistory, currentLang);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: aiText,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Gemini chat error:", error);

      const isQuotaError =
        error?.status === 429 ||
        String(error?.message || "").toLowerCase().includes("quota");

      const messageText = isQuotaError
        ? buildLocalFallbackReply(t)
        : t("ai_chat.error_message") || "Something went wrong. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: messageText,
          sender: "ai",
          isError: !isQuotaError,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    handleSendMessage(suggestion);
  };

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

        {/* AI Icon and Title (only before first message) */}
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
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.sender === "user"
                  ? styles.userMessageWrapper
                  : styles.aiMessageWrapper,
              ]}
            >
              <View style={styles.messageLabelContainer}>
                <Text style={styles.messageLabel}>
                  {message.sender === "user"
                    ? t("ai_chat.label_me")
                    : t("ai_chat.label_ai")}
                </Text>
              </View>
              <View
                style={[
                  styles.messageBubble,
                  message.sender === "user"
                    ? styles.userBubble
                    : styles.aiBubble,
                  message.isError && styles.errorBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isError && styles.errorText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
              <View style={styles.messageLabelContainer}>
                <Text style={styles.messageLabel}>
                  {t("ai_chat.label_ai")}
                </Text>
              </View>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <Text style={styles.typingDots}>● ● ●</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Suggestions */}
        {showSuggestions && messages.length === 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>
              {t("ai_chat.suggestions_title")}
            </Text>
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
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                isLoading && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSendMessage()}
              disabled={isLoading}
            >
              <Image
                source={require("../../assets/images/send-icon2.png")}
                style={[
                  styles.sendIcon,
                  isLoading && styles.sendIconDisabled,
                ]}
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
    paddingTop: 20,
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
    fontSize: 30,
    color: "#000",
    fontWeight: "600",
  },
  titleSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  sparklingIcon: {
    width: 55,
    height: 55,
    marginBottom: 15,
    tintColor: "#000",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  messageWrapper: {
    marginBottom: 10,
  },
  userMessageWrapper: {
    alignItems: "flex-end",
  },
  aiMessageWrapper: {
    alignItems: "flex-start",
  },
  messageLabelContainer: {
    marginBottom: 0,
  },
  messageLabel: {
    fontSize: 16,
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
    shadowOffset: { width: 0, height: 2 },
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
  errorBubble: {
    backgroundColor: "rgba(255, 220, 220, 0.85)",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 20,
  },
  errorText: {
    color: "#c0392b",
  },
  typingDots: {
    fontSize: 12,
    color: "#5c5146",
    letterSpacing: 4,
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
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
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    width: 24,
    height: 24,
    tintColor: "#8B7B6C",
  },
  sendIconDisabled: {
    tintColor: "#aaa",
  },
});
