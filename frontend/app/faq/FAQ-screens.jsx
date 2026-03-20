import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const faqs = [
  {
    id: 1,
    question: "What can I do in this app?",
    answer:
      "You can explore museums across Egypt, book tickets, discover artifacts, use the interactive map, and shop for souvenirs—all in one place.",
  },
  {
    id: 2,
    question: "How do I book tickets for museums?",
    answer:
      "Go to the Tickets section, choose your museum, select the date and time, then complete your booking. Your tickets will be saved in your profile.",
  },
  {
    id: 3,
    question: "Can I save my favorite artifacts?",
    answer:
      "Yes! You can save artifacts while exploring museums. They will appear in your profile under 'Saved Artifacts' for easy access later.",
  },
  {
    id: 4,
    question: "What is the AI chat feature used for?",
    answer:
      "The AI assistant helps you learn about Egyptian history, artifacts, and museums. You can ask questions and get instant, informative answers.",
  },
  {
    id: 5,
    question: "How does the map feature work?",
    answer:
      "The map shows museum locations across Egypt. You can use it to find nearby places, get directions, and explore cultural landmarks easily.",
  },
  {
    id: 6,
    question: "Can I purchase souvenirs through the app?",
    answer:
      "Yes, the Souvenirs section allows you to browse and buy items inspired by Egyptian heritage. Orders and downloads are managed in your profile.",
  },
  {
    id: 7,
    question: "Do I need an account to use the app?",
    answer:
      "You can explore some features without an account, but booking tickets, saving items, and accessing your profile require signing in.",
  },
  {
    id: 8,
    question: "How can I contact support?",
    answer:
      "You can go to the 'Help & Support' section in Settings to report issues or get assistance from our support team.",
  },
  {
    id: 9,
    question: "Is my personal data (secure)?",
    answer:
      "Yes, your data is securely stored and protected. We follow best practices to ensure your privacy and safety while using the app.",
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <ImageBackground
      source={require("../../assets/images/beige-background.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>FAQ's</Text>
            </View>

            <TouchableOpacity style={styles.filterBtn}>
              <View style={styles.filterIcon}>
                <View style={[styles.filterLine, { width: 18 }]} />
                <View style={[styles.filterLine, { width: 12 }]} />
                <View style={[styles.filterLine, { width: 16 }]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* FAQ Items */}
          <View style={styles.list}>
            {faqs.map((faq, index) => {
              const isOpen = openId === faq.id;

              return (
                <TouchableOpacity
                  key={faq.id}
                  style={[
                    styles.item,
                    index === faqs.length - 1 && styles.itemLast,
                  ]}
                  onPress={() => toggle(faq.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.itemHeader}>
                    {/* Plus / Minus icon */}
                    <View style={styles.iconWrap}>
                      {isOpen ? (
                        <View style={styles.minusLine} />
                      ) : (
                        <>
                          <View style={styles.plusV} />
                          <View style={styles.plusH} />
                        </>
                      )}
                    </View>

                    {/* Question */}
                    <Text
                      style={[styles.question, isOpen && styles.questionOpen]}
                    >
                      {faq.question}
                    </Text>
                  </View>

                  {/* Answer */}
                  {isOpen && <Text style={styles.answer}>{faq.answer}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const DARK = "#1a1a1a";
const MUTED = "#888";
const DIVIDER = "#e8e8e8";
const RED = "#E05A3A";

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  safeArea: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },

  headerLeft: { flex: 1 },

  headerTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: DARK,
    letterSpacing: -0.5,
  },

  filterBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },

  filterIcon: {
    gap: 4,
    alignItems: "flex-end",
  },

  filterLine: {
    height: 2,
    backgroundColor: DARK,
    borderRadius: 2,
  },

  list: {
    paddingHorizontal: 24,
  },

  item: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },

  itemLast: {
    borderBottomWidth: 0,
  },

  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },

  iconWrap: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    position: "relative",
  },

  plusH: {
    position: "absolute",
    width: 14,
    height: 2,
    backgroundColor: DARK,
    borderRadius: 1,
  },

  plusV: {
    position: "absolute",
    width: 2,
    height: 14,
    backgroundColor: DARK,
    borderRadius: 1,
  },

  minusLine: {
    width: 14,
    height: 2,
    backgroundColor: RED,
    borderRadius: 1,
  },

  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: DARK,
    lineHeight: 20,
  },

  questionOpen: {
    color: RED,
  },

  answer: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 20,
    marginTop: 10,
    marginLeft: 34,
  },
});
