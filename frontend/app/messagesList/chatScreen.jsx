import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { getAuthToken, getAuthUser } from "../api/authStorage";
import { useChatSocket } from "../hooks/useChatSocket";

const DARK = "#2C2010";
const MUTED = "#8B7B6C";
const LIGHT = "#EDE6DF";
const CARD_BG = "rgba(249,247,244,0.98)";
const BORDER = "#E5DED5";
const GOLD = "#B8965A";
const HEADER = "#756557";

const getInitial = (name) => {
  if (!name || typeof name !== "string") return "U";
  return name.trim().charAt(0).toUpperCase() || "U";
};

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [messageTranslations, setMessageTranslations] = useState({});
  const [translationLoading, setTranslationLoading] = useState({});
  const [translationErrors, setTranslationErrors] = useState({});
  const scrollViewRef = useRef(null);

  const contactName = params.contactName || t("chat_pages.contact_fallback");
  const contactId = params.contactId;
  const contactAvatar =
    typeof params.contactAvatar === "string" && params.contactAvatar !== "null"
      ? params.contactAvatar
      : null;

  const targetLang = useMemo(() => {
    const lang = (i18n.language || "en").toLowerCase();
    if (lang.startsWith("ar")) return "ar";
    if (lang.startsWith("de")) return "de";
    if (lang.startsWith("fr")) return "fr";
    if (lang.startsWith("zh")) return "zh-CN";
    return "en";
  }, [i18n.language]);

  const handleTranslateMessage = async (msg) => {
    const existing = messageTranslations[msg.id];
    if (existing && existing.targetLang === targetLang) {
      setMessageTranslations((prev) => ({
        ...prev,
        [msg.id]: {
          ...existing,
          showTranslated: !existing.showTranslated,
        },
      }));
      return;
    }

    if (!msg.text?.trim()) return;

    setTranslationErrors((prev) => ({ ...prev, [msg.id]: "" }));
    setTranslationLoading((prev) => ({ ...prev, [msg.id]: true }));

    try {
      const response = await api.translateTextMyMemory(msg.text, targetLang);
      if (response?.success && response.data?.translatedText) {
        setMessageTranslations((prev) => ({
          ...prev,
          [msg.id]: {
            translatedText: response.data.translatedText,
            targetLang,
            showTranslated: true,
          },
        }));
      }
    } catch (error) {
      console.error("Message translation failed:", error);
      setTranslationErrors((prev) => ({
        ...prev,
        [msg.id]: t("chat_pages.translate_failed"),
      }));
    } finally {
      setTranslationLoading((prev) => ({ ...prev, [msg.id]: false }));
    }
  };

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
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isSent: msg.sender._id === user?.id || msg.sender === user?.id,
          hasCheckmark: msg.isRead,
        }));
        setChatMessages(formatted.reverse());

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

  const handleNewMessage = useCallback(
    (msg) => {
      if (msg.sender._id === contactId || msg.sender === contactId) {
        const formatted = {
          id: msg._id,
          text: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isSent: false,
          hasCheckmark: false,
        };
        setChatMessages((prev) => [...prev, formatted]);

        getAuthToken().then((token) => {
          if (token) api.markConversationAsRead(contactId, token);
        });
      }
    },
    [contactId],
  );

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
            time: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerIdentityRow}>
            {contactAvatar ? (
              <Image source={{ uri: contactAvatar }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatarFallback}>
                <Text style={styles.headerAvatarFallbackText}>
                  {getInitial(contactName)}
                </Text>
              </View>
            )}

            <View style={styles.contactTextWrap}>
              <Text style={styles.headerContactName} numberOfLines={1}>
                {contactName}
              </Text>
              <Text style={styles.headerSubtitle}>Conversation</Text>
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={GOLD} />
            </View>
          ) : (
            chatMessages.map((msg) => {
              const translationState = messageTranslations[msg.id];
              const isTranslated =
                !!translationState &&
                translationState.targetLang === targetLang &&
                translationState.showTranslated;
              const displayText = isTranslated
                ? translationState.translatedText
                : msg.text;
              const isTranslating = !!translationLoading[msg.id];
              const translationError = translationErrors[msg.id];

              return (
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
                        msg.isSent ? styles.sentBubble : styles.receivedBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          msg.isSent ? styles.sentText : styles.receivedText,
                        ]}
                      >
                        {displayText}
                      </Text>

                      <View style={styles.messageFooter}>
                        <Text
                          style={[
                            styles.messageTime,
                            msg.isSent && styles.sentTime,
                          ]}
                        >
                          {msg.time}
                        </Text>
                        {msg.hasCheckmark && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>

                      <View style={styles.translationRow}>
                        <TouchableOpacity
                          onPress={() => handleTranslateMessage(msg)}
                          disabled={isTranslating}
                        >
                          <Text
                            style={[
                              styles.translationAction,
                              msg.isSent && styles.translationActionSent,
                            ]}
                          >
                            {isTranslating
                              ? t("chat_pages.translating")
                              : isTranslated
                                ? t("chat_pages.show_original")
                                : t("chat_pages.translate")}
                          </Text>
                        </TouchableOpacity>

                        {!!translationError && (
                          <Text style={styles.translationError}>
                            {translationError}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={t("chat_pages.type_message")}
              value={message}
              onChangeText={setMessage}
              placeholderTextColor={MUTED}
              multiline
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              activeOpacity={0.85}
            >
              <Image
                source={require("../../assets/images/send-icon.png")}
                style={styles.sendIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT,
  },

  safeArea: {
    flex: 1,
    backgroundColor: LIGHT,
  },

  header: {
    backgroundColor: HEADER,
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 8,
  },

  headerTopRow: {
  position: "absolute",
  top: 25,
  left: 18,
  zIndex: 10,
},

backButton: {
  width: 38,
  height: 38,
  borderRadius: 19,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(255,255,255,0.16)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.22)",
},

  backIcon: {
    fontSize: 25,
    color: "#fff",
    lineHeight: 28,
    fontWeight: "600",
  },

  headerIdentityRow: {
  marginTop: 10,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 12,
  paddingLeft: 60,
  paddingRight: 18,
},

  headerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.78)",
  },

  headerAvatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.62)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerAvatarFallbackText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  contactTextWrap: {
    maxWidth: "74%",
  },

  headerContactName: {
    textAlign: "left",
    fontSize: 23,
    fontWeight: "600",
    color: "#fff",
    lineHeight: 30,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.78)",
  },

  messagesContainer: {
    flex: 1,
    backgroundColor: LIGHT,
  },

  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
  },

  loadingWrap: {
    paddingTop: 30,
    alignItems: "center",
  },

  messageWrapper: {
    marginBottom: 14,
  },

  messageBubble: {
    maxWidth: "74%",
    borderRadius: 22,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: 1,
  },

  receivedBubble: {
    alignSelf: "flex-start",
    backgroundColor: CARD_BG,
    borderColor: BORDER,
    borderTopLeftRadius: 7,
  },

  sentBubble: {
    alignSelf: "flex-end",
    backgroundColor: HEADER,
    borderColor: "#9A846E",
    borderTopRightRadius: 7,
  },

  messageText: {
    fontSize: 16.5,
    lineHeight: 23,
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
    marginTop: 5,
    gap: 4,
  },

  messageTime: {
    fontSize: 11.5,
    color: MUTED,
    marginTop: 3,
    fontWeight: "600",
  },

  sentTime: {
    color: "rgba(255,255,255,0.75)",
  },

  checkmark: {
    fontSize: 12,
    color: "#E7D3B4",
    fontWeight: "800",
  },

  translationRow: {
    marginTop: 7,
    alignItems: "flex-end",
    gap: 2,
  },

  translationAction: {
    fontSize: 12,
    color: MUTED,
    fontWeight: "700",
  },

  translationActionSent: {
    color: "#F4E6D6",
  },

  translationError: {
    fontSize: 11,
    color: "#D1495B",
    fontWeight: "600",
  },

  imagesContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },

  chatImage: {
    width: 82,
    height: 82,
    borderRadius: 14,
  },

  inputContainer: {
    backgroundColor: LIGHT,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 14 : 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: CARD_BG,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  input: {
    flex: 1,
    fontSize: 16.5,
    color: DARK,
    maxHeight: 105,
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontWeight: "500",
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: HEADER,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    marginBottom: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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