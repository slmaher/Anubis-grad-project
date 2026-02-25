import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";

export default function Checkout() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const museumName = params.museumName || "Museum";
  const museumTime = params.museumTime || "10:00 AM";
  
  // Generate dates for the next 7 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        day: daysOfWeek[date.getDay()],
        date: date.getDate(),
        month: months[date.getMonth()],
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
      type: "Silver Ticket",
      description: "Top Position of the Auditorium, Full View",
      price: 50,
      quantity: 1,
      isHotChoice: true,
    },
    {
      id: 2,
      type: "Gold Ticket",
      description: "Auditorium Center Position, On Stage",
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Checkout</Text>
        
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
                selectedDate === index && styles.dateCardSelected
              ]}
              onPress={() => setSelectedDate(index)}
            >
              <Text style={[
                styles.dateDay,
                selectedDate === index && styles.dateDaySelected
              ]}>
                {date.day}
              </Text>
              <Text style={[
                styles.dateNumber,
                selectedDate === index && styles.dateNumberSelected
              ]}>
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
                  <Text style={styles.hotChoiceText}>Hot Choice</Text>
                </View>
              )}

              <View style={styles.ticketHeader}>
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketType}>{ticket.type} - {museumName}</Text>
                  <Text style={styles.ticketDescription}>{ticket.description}</Text>
                  <Text style={styles.ticketDate}>
                    {dates[selectedDate].day}, {dates[selectedDate].month} {dates[selectedDate].date} • {museumTime}
                  </Text>
                </View>
                <TouchableOpacity style={styles.detailButton}>
                  <Text style={styles.detailButtonText}>Detail</Text>
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
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <TouchableOpacity>
              <Text style={styles.detailsLink}>Details ˄</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.totalAmount}>LE {calculateTotal().toFixed(3)}</Text>
        </View>

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Text style={styles.continueArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: "#000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  dateScrollContainer: {
    maxHeight: 90,
    marginVertical: 20,
  },
  dateScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dateCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 70,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateCardSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  dateDay: {
    fontSize: 12,
    color: "#999",
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
    paddingHorizontal: 20,
    gap: 15,
  },
  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  hotChoiceBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F0E6FF",
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
    color: "#8B5CF6",
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
    color: "#000",
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
    lineHeight: 18,
  },
  ticketDate: {
    fontSize: 12,
    color: "#999",
  },
  detailButton: {
    alignSelf: "flex-start",
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90E2",
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
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
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  quantityButtonPlus: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  quantityButtonText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },
  quantityButtonTextPlus: {
    color: "#fff",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    minWidth: 20,
    textAlign: "center",
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
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
    color: "#666",
  },
  detailsLink: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  continueButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  continueArrow: {
    fontSize: 18,
    color: "#fff",
  },
});