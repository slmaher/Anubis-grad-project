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
    question: "What services does TanahAir Offer?",
    answer:
      "Our asked sex point her she seems. New plenty she horses parish design you. Stuff sight equal of my woody. Him children bringing goodness suitable she entirely put far daughter.",
  },
  {
    id: 2,
    question:
      "Why should I choose a Design studio like TanahAir over full-service agency?",
    answer:
      "Our asked sex point her she seems. New plenty she horses parish design you. Stuff sight equal of my woody. Him children bringing goodness suitable she entirely put far daughter.",
  },
  {
    id: 3,
    question:
      "How does TanahAir create website content without knowing our Business plan?",
    answer:
      "Our asked sex point her she seems. New plenty she horses parish design you. Stuff sight equal of my woody. Him children bringing goodness suitable she entirely put far daughter.",
  },
  {
    id: 4,
    question: "What will be delivered? And When?",
    answer:
      "Our asked sex point her she seems. New plenty she horses parish design you. Stuff sight equal of my woody. Him children bringing goodness suitable she entirely put far daughter.",
  },
  {
    id: 5,
    question: "What often will results be reported?",
    answer:
      "Our asked sex point her she seems. New plenty she horses parish design you. Stuff sight equal of my woody. Him children bringing goodness suitable she entirely put far daughter.",
  },
  {
    id: 6,
    question: "At by pleasure of children be?",
    answer:
      "Our asked sex point her she seems. New plenty she horses parish design you. Stuff sight equal of my woody. Him children bringing goodness suitable she entirely put far daughter.",
  },
  {
    id: 7,
    question: "Amounted repeated as believed in confined?",
    answer:
      "Our asked sex point her she seems. New plenty she horses parish design you. Stuff sight equal of my woody. Him children bringing goodness suitable she entirely put far daughter.",
  },
  {
    id: 8,
    question: "In am do giving to afford parish settle easily garret?",
    answer:
      "Our asked sex point her she seems. New plenty she horses parish design you. Stuff sight equal of my woody. Him children bringing goodness suitable she entirely put far daughter.",
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
      source={require("../../assets/images/bg.png")}
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
    fontSize: 14,
    fontWeight: "500",
    color: DARK,
    lineHeight: 20,
  },

  questionOpen: {
    color: RED,
  },

  answer: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 20,
    marginTop: 10,
    marginLeft: 34,
  },
});
