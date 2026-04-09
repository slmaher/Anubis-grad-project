import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const DARK = "#2C2010";
const MUTED = "#8B7B6C";
const LIGHT = "#EDE6DF";
const CARD_BG = "rgba(249,247,244,0.98)";
const BORDER = "#E5DED5";
const ACCENT = "#46392c";

export default function Checkout() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  
  const museumName = params.museumName || t("tickets_checkout.default_museum_name");
  const museumTime = params.museumTime || t("tickets_checkout.default_museum_time");
  
  // Generate dates for the next 7 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const locale = i18n.language || "en";
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        day: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date),
        date: date.getDate(),
        month: new Intl.DateTimeFormat(locale, { month: "short" }).format(date),
        fullDate: date,
      });
    }
    return dates;
  };

  const dates = generateDates();
  const [selectedDate, setSelectedDate] = useState(0);
  
  const [tickets, setTickets] = useState([
    {
      id: 1,
      typeKey: "silver_ticket",
      descriptionKey: "silver_description",
      price: 50,
      quantity: 1,
      isHotChoice: true,
    },
    {
      id: 2,
      typeKey: "gold_ticket",
      descriptionKey: "gold_description",
      price: 150,
      quantity: 1,
      isHotChoice: false,
    },
  ]);

  const updateQuantity = (id, delta) => {
    setTickets(tickets.map(ticket => 
      ticket.id === id 
        ? { ...ticket, quantity: Math.max(0, ticket.quantity + delta) }
        : ticket
    ));
  };

  const calculateTotal = () => {
    return tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
  };

  const handleContinue = () => {
    router.push("/tickets/qrcode");
  };

  return (
    <View style={styles.backgroundLayer}>
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{t("tickets_checkout.title")}</Text>

          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateScrollContainer}
            contentContainerStyle={styles.dateScroll}
          >
            {dates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCard,
                  selectedDate === index && styles.dateCardSelected,
                ]}
                onPress={() => setSelectedDate(index)}
              >
                <Text
                  style={[
                    styles.dateDay,
                    selectedDate === index && styles.dateDaySelected,
                  ]}
                >
                  {date.day}
                </Text>
                <Text
                  style={[
                    styles.dateNumber,
                    selectedDate === index && styles.dateNumberSelected,
                  ]}
                >
                  {date.date} {date.month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Ticket Options */}
          <View style={styles.ticketsContainer}>
            {tickets.map((ticket) => (
              <View key={ticket.id} style={styles.ticketCard}>
                {ticket.isHotChoice && (
                  <View style={styles.hotChoiceBadge}>
                    <Text style={styles.hotChoiceIcon}>🔥</Text>
                    <Text style={styles.hotChoiceText}>{t("tickets_checkout.hot_choice")}</Text>
                  </View>
                )}

                <View style={styles.ticketHeader}>
                  <View style={styles.ticketInfo}>
                    <Text style={styles.ticketType}>
                      {t(`tickets_checkout.${ticket.typeKey}`)} - {museumName}
                    </Text>
                    <Text style={styles.ticketDescription}>
                      {t(`tickets_checkout.${ticket.descriptionKey}`)}
                    </Text>
                    <Text style={styles.ticketDate}>
                      {dates[selectedDate].day}, {dates[selectedDate].month} {dates[selectedDate].date} • {museumTime}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.detailButton}>
                    <Text style={styles.detailButtonText}>{t("tickets_checkout.detail")}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.ticketFooter}>
                  <Text style={styles.ticketPrice}>LE {ticket.price.toFixed(3)}</Text>

                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(ticket.id, -1)}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{ticket.quantity}</Text>

                    <TouchableOpacity
                      style={[styles.quantityButton, styles.quantityButtonPlus]}
                      onPress={() => updateQuantity(ticket.id, 1)}
                    >
                      <Text style={[styles.quantityButtonText, styles.quantityButtonTextPlus]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Spacer for fixed bottom */}
          <View style={{ height: 132 }} />
        </ScrollView>

        {/* Fixed Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t("tickets_checkout.total")}</Text>
              <TouchableOpacity>
                <Text style={styles.detailsLink}>{t("tickets_checkout.details")}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.totalAmount}>LE {calculateTotal().toFixed(3)}</Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>{t("tickets_checkout.continue")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundLayer: {
    flex: 1,
    backgroundColor: LIGHT,
    position: "relative",
  },
  bgGlowTop: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -120,
    left: -90,
   
  },

  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  backIcon: {
    fontSize: 24,
    color: ACCENT,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: DARK,
  },
  placeholder: {
    width: 42,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 22,
  },
  dateScrollContainer: {
    maxHeight: 90,
    marginVertical: 18,
  },
  dateScroll: {
    paddingHorizontal: 18,
    gap: 12,
  },
  dateCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 70,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dateCardSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  dateDay: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 4,
  },
  dateDaySelected: {
    color: "#fff",
  },
  dateNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  dateNumberSelected: {
    color: "#fff",
  },
  ticketsContainer: {
    paddingHorizontal: 18,
    gap: 15,
  },
  ticketCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  hotChoiceBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(180, 145, 91, 0.14)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
    gap: 4,
  },
  hotChoiceIcon: {
    fontSize: 12,
  },
  hotChoiceText: {
    fontSize: 11,
    fontWeight: "600",
    color: ACCENT,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 10,
  },
  ticketType: {
    fontSize: 15,
    fontWeight: "700",
    color: DARK,
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 6,
    lineHeight: 18,
  },
  ticketDate: {
    fontSize: 12,
    color: MUTED,
  },
  detailButton: {
    alignSelf: "flex-start",
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5B7DA5",
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  quantityButtonPlus: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  quantityButtonText: {
    fontSize: 18,
    color: MUTED,
    fontWeight: "600",
  },
  quantityButtonTextPlus: {
    color: "#fff",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: DARK,
    minWidth: 20,
    textAlign: "center",
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CARD_BG,
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  totalContainer: {
    marginBottom: 15,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 14,
    color: MUTED,
  },
  detailsLink: {
    fontSize: 13,
    color: MUTED,
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: DARK,
  },
  continueButton: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  continueArrow: {
    fontSize: 18,
    color: "#fff",
  },
});