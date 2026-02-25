import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ImageBackground, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";

export default function AIChatbot() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollViewRef = useRef(null);

  const suggestions = [
    "What can I ask you to do?",
    "Where is the nearest museum to me?",
  ];

  const museumData = {
    "Grand Egyptian Museum": {
      location: "Cairo - Alexandria Desert Rd",
      hours: "9 AM - 5 PM",
      price: "200 LE",
      description: "The largest archaeological museum in the world dedicated to Egyptian civilization"
    },
    "Egyptian Museum": {
      location: "Cairo - El-Tahrir Square",
      hours: "9 AM - 7 PM",
      price: "150 LE",
      description: "Home to an extensive collection of ancient Egyptian antiquities"
    },
    "Museum of Islamic Art": {
      location: "Cairo - Port Said Street",
      hours: "9 AM - 5 PM",
      price: "100 LE",
      description: "One of the greatest museums in the world with rare Islamic artifacts"
    }
  };

  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // What can I ask you to do?
    if (lowerMessage.includes("what can i ask") || lowerMessage.includes("what can you do")) {
      return "Great question! You can ask for my help with the following:\n\n1. Anything to do with museums in Egypt e.g. Where is the Grand Egyptian Museum?\n\n2. Information about tickets, prices, and opening hours\n\n3. Directions and locations of museums\n\n4. Recommendations for museums to visit\n\n5. Information about Egyptian artifacts and history";
    }

    // Nearest museum
    if (lowerMessage.includes("nearest museum") || lowerMessage.includes("closest museum")) {
      return "The nearest museum to you is the Egyptian Museum in Tahrir Square, Cairo. It's approximately 1.5 km away.\n\n📍 Location: El-Tahrir Square\n⏰ Hours: 9 AM - 7 PM\n💰 Ticket: 150 LE\n\nWould you like directions or more information about this museum?";
    }

    // Grand Egyptian Museum
    if (lowerMessage.includes("grand egyptian museum") || lowerMessage.includes("gem")) {
      return `The Grand Egyptian Museum (GEM) is located on the Cairo-Alexandria Desert Road, near the Giza Pyramids.\n\n⏰ Opening Hours: 9 AM - 5 PM\n💰 Ticket Price: 200 LE\n\nIt's the largest archaeological museum in the world dedicated to Egyptian civilization, featuring over 100,000 artifacts including the complete Tutankhamun collection!`;
    }

    // Egyptian Museum
    if (lowerMessage.includes("egyptian museum") && !lowerMessage.includes("grand")) {
      return `The Egyptian Museum is located in Tahrir Square, Cairo.\n\n⏰ Opening Hours: 9 AM - 7 PM\n💰 Ticket Price: 150 LE\n\nIt houses an extensive collection of ancient Egyptian antiquities with over 120,000 items. Don't miss the Royal Mummy Room!`;
    }

    // Museum of Islamic Art
    if (lowerMessage.includes("islamic art") || lowerMessage.includes("islamic museum")) {
      return `The Museum of Islamic Art is located on Port Said Street, Cairo.\n\n⏰ Opening Hours: 9 AM - 5 PM\n💰 Ticket Price: 100 LE\n\nIt's one of the world's greatest museums with rare Islamic artifacts spanning 1,400 years from various Islamic civilizations.`;
    }

    // Tickets
    if (lowerMessage.includes("ticket") || lowerMessage.includes("price")) {
      return "Here are the ticket prices for major museums:\n\n🎫 Grand Egyptian Museum: 200 LE\n🎫 Egyptian Museum: 150 LE\n🎫 Museum of Islamic Art: 100 LE\n🎫 Coptic Museum: 120 LE\n\nYou can book tickets directly through our app! Would you like me to help you with that?";
    }

    // Opening hours
    if (lowerMessage.includes("hours") || lowerMessage.includes("open") || lowerMessage.includes("close")) {
      return "Museum Opening Hours:\n\n🕐 Grand Egyptian Museum: 9 AM - 5 PM\n🕐 Egyptian Museum: 9 AM - 7 PM\n🕐 Museum of Islamic Art: 9 AM - 5 PM\n🕐 Coptic Museum: 9 AM - 4 PM\n\nMost museums are closed on public holidays. Would you like to book a visit?";
    }

    // Recommendations
    if (lowerMessage.includes("recommend") || lowerMessage.includes("should i visit") || lowerMessage.includes("best museum")) {
      return "Based on visitor reviews, I recommend:\n\n⭐ #1: Grand Egyptian Museum - Perfect for first-time visitors!\n⭐ #2: Egyptian Museum - Rich history & iconic artifacts\n⭐ #3: Museum of Islamic Art - Beautiful architecture\n\nWhat interests you most: Ancient Egypt, Islamic culture, or both?";
    }

    // Souvenirs
    if (lowerMessage.includes("souvenir") || lowerMessage.includes("shop") || lowerMessage.includes("buy")) {
      return "Our app has a Souvenir Marketplace where you can browse and purchase authentic Egyptian souvenirs:\n\n🎁 Keychains & jewelry\n🏺 Pottery & artifacts replicas\n📿 Traditional crafts\n\nYou can access it from the home screen. Would you like me to show you popular items?";
    }

    // Map/Directions
    if (lowerMessage.includes("map") || lowerMessage.includes("direction") || lowerMessage.includes("how to get")) {
      return "You can view all museum locations on our interactive map! \n\n🗺️ Tap the 'Map' button on the home screen to:\n- See all museums near you\n- Get directions\n- View museum details\n\nWould you like specific directions to any museum?";
    }

    // Greeting
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return "Hello! 👋 Welcome to Anubis - your guide to Egyptian museums and culture!\n\nI'm here to help you discover amazing museums, book tickets, find souvenirs, and answer any questions about Egyptian history.\n\nWhat would you like to explore today?";
    }

    // Thanks
    if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
      return "You're very welcome! 😊 Feel free to ask me anything else about museums, tickets, or Egyptian culture. Happy exploring!";
    }

    // Default response
    return "I'm here to help you with information about Egyptian museums, tickets, locations, and more!\n\nYou can ask me about:\n- Museum locations and hours\n- Ticket prices\n- Recommendations\n- Directions\n- Souvenirs\n\nWhat would you like to know?";
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
            <Text style={styles.title}>Ask our AI anything</Text>
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
                  {message.sender === "user" ? "ME" : "OUR AI"}
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
            <Text style={styles.suggestionsTitle}>Suggestions on what to ask Our AI</Text>
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
              placeholder="Ask me anything"
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