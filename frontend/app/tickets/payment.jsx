import React, { useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const DARK = "#2C2010";
const MUTED = "#8B7B6C";
const CARD_BG = "rgba(249,247,244,0.98)";
const ACCENT = "#46392c";
const BORDER = "#E5DED5";

const paymentMethods = [
  { id: "Visa", icon: "cc-visa", color: "#1A1F71" },
  { id: "Mastercard", icon: "cc-mastercard", color: "#EB001B" },
  { id: "PayPal", icon: "cc-paypal", color: "#003087" },
  { id: "Apple Pay", icon: "cc-apple-pay", color: "#111111" },
];

export default function TicketPayment() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const museumName = params.museumName || "Museum Ticket";
  const museumTime = params.museumTime || "Open today";
  const selectedDate = params.selectedDate || "Today";
  const subtotal = Number(params.subtotal) || 120;

  const tickets = (() => {
    try {
      return JSON.parse(params.tickets || "[]");
    } catch {
      return [];
    }
  })();

  const [voucherApplied, setVoucherApplied] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("Visa");
  const [addressTitle, setAddressTitle] = useState("Visitor information");
  const [addressLine, setAddressLine] = useState("Ticket will be sent digitally");
  const [isAddressModalVisible, setAddressModalVisible] = useState(false);
  const [draftAddressTitle, setDraftAddressTitle] = useState(addressTitle);
  const [draftAddressLine, setDraftAddressLine] = useState(addressLine);

  const serviceFee = Math.round(subtotal * 0.05);
  const discount = voucherApplied ? Math.round(subtotal * 0.1) : 0;
  const totalPayment = subtotal + serviceFee - discount;
  const totalItems = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);

  const openAddressEditor = () => {
    setDraftAddressTitle(addressTitle);
    setDraftAddressLine(addressLine);
    setAddressModalVisible(true);
  };

  const saveAddress = () => {
    if (!draftAddressLine.trim()) return;

    setAddressTitle(draftAddressTitle.trim() || "Visitor information");
    setAddressLine(draftAddressLine.trim());
    setAddressModalVisible(false);
  };

  const handlePayNow = () => {
    router.replace({
      pathname: "/tickets/qrcode",
      params: {
        museumName,
        selectedDate,
        totalPayment,
      },
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/images/beige-background.jpeg")}
      style={styles.root}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color={DARK} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Ticket Payment</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroLabel}>Secure ticket checkout</Text>
                <Text style={styles.heroTitle}>{museumName}</Text>
                <Text style={styles.heroSubtitle}>
                  {selectedDate} • {museumTime}
                </Text>
              </View>

              <View style={styles.heroIconCircle}>
                <MaterialCommunityIcons
                  name="ticket-confirmation-outline"
                  size={24}
                  color={DARK}
                />
              </View>
            </View>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatChip}>
                <MaterialCommunityIcons
                  name="ticket-outline"
                  size={14}
                  color={DARK}
                />
                <Text style={styles.heroStatText}>{totalItems} tickets</Text>
              </View>

              <View style={styles.heroStatChip}>
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={14}
                  color={DARK}
                />
                <Text style={styles.heroStatText}>QR entry</Text>
              </View>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Visitor Details</Text>
                <TouchableOpacity onPress={openAddressEditor}>
                  <Text style={styles.linkText}>Change</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.addressRow}>
                <View style={styles.addressIcon}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={20}
                    color={DARK}
                  />
                </View>

                <View style={styles.addressInfo}>
                  <Text style={styles.addressTitle}>{addressTitle}</Text>
                  <Text style={styles.addressText}>{addressLine}</Text>
                  <Text style={styles.addressHint}>
                    Your ticket QR code will appear after payment.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Payment Method</Text>
              </View>

              <View style={styles.paymentGrid}>
                {paymentMethods.map((method) => {
                  const active = selectedMethod === method.id;

                  return (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.paymentTile,
                        active && styles.paymentTileActive,
                      ]}
                      onPress={() => setSelectedMethod(method.id)}
                    >
                      <FontAwesome5
                        name={method.icon}
                        size={22}
                        color={method.color}
                        brand
                      />
                      <Text style={styles.paymentText}>{method.id}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.voucherRow}
                onPress={() => setVoucherApplied((value) => !value)}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name={
                    voucherApplied
                      ? "ticket-confirmation-outline"
                      : "ticket-outline"
                  }
                  size={18}
                  color={DARK}
                />
                <Text style={styles.voucherText}>
                  {voucherApplied ? "Voucher applied" : "Add voucher"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Order Summary</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Subtotal</Text>
                <Text style={styles.summaryVal}>{subtotal} LE</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Service Fee</Text>
                <Text style={styles.summaryVal}>{serviceFee} LE</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Discount</Text>
                <Text style={styles.summaryVal}>-{discount} LE</Text>
              </View>

              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.totalKey}>Total Payment</Text>
                <Text style={styles.totalVal}>{totalPayment} LE</Text>
              </View>
            </View>

            <View style={styles.itemsPreviewCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Tickets in your order</Text>
                <Text style={styles.previewCount}>{totalItems}</Text>
              </View>

              {tickets.map((ticket) => (
                <View key={ticket.id} style={styles.itemRow}>
                  <View style={styles.itemThumbWrap}>
                    <Text style={styles.itemQty}>{ticket.quantity}</Text>
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>
                      {ticket.typeKey === "gold_ticket"
                        ? "Gold Ticket"
                        : "Silver Ticket"}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {ticket.price} LE x {ticket.quantity}
                    </Text>
                  </View>

                  <Text style={styles.itemLineTotal}>
                    {ticket.price * ticket.quantity} LE
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.noteCard}>
              <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color={DARK}
              />
              <Text style={styles.noteText}>
                After payment, show your QR code at the museum gate to enter.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.payBtn}
              onPress={handlePayNow}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="credit-card-check-outline"
                size={18}
                color="#fff"
              />
              <Text style={styles.payBtnText}>Pay now</Text>
            </TouchableOpacity>

            <View style={{ height: 24 }} />
          </ScrollView>

          <Modal
            visible={isAddressModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setAddressModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Edit visitor details</Text>

                <Text style={styles.modalLabel}>Title</Text>
                <TextInput
                  value={draftAddressTitle}
                  onChangeText={setDraftAddressTitle}
                  style={styles.modalInput}
                  placeholder="Visitor information"
                  placeholderTextColor="#9A8C7A"
                />

                <Text style={styles.modalLabel}>Details</Text>
                <TextInput
                  value={draftAddressLine}
                  onChangeText={setDraftAddressLine}
                  style={styles.modalInput}
                  placeholder="Ticket delivery details"
                  placeholderTextColor="#9A8C7A"
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalSecondaryBtn}
                    onPress={() => setAddressModalVisible(false)}
                  >
                    <Text style={styles.modalSecondaryText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalPrimaryBtn}
                    onPress={saveAddress}
                  >
                    <Text style={styles.modalPrimaryText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "rgba(224,215,205,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: DARK,
    letterSpacing: 0.3,
  },
  heroCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  heroLabel: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 4,
    fontWeight: "500",
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK,
    lineHeight: 20,
  },
  heroSubtitle: {
    marginTop: 5,
    fontSize: 12,
    color: MUTED,
    fontWeight: "600",
  },
  heroIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFE7DC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  heroStatChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFE7DC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2D8CC",
  },
  heroStatText: {
    fontSize: 12,
    color: DARK,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 12,
  },
  sectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: MUTED,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  linkText: {
    fontSize: 12,
    color: ACCENT,
    fontWeight: "600",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  addressIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFE7DC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: DARK,
    lineHeight: 18,
    marginBottom: 4,
  },
  addressHint: {
    fontSize: 12,
    color: MUTED,
  },
  paymentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  paymentTile: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F4ECE1",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  paymentTileActive: {
    borderColor: ACCENT,
    backgroundColor: "#EFE7DC",
  },
  paymentText: {
    fontSize: 12,
    color: DARK,
    fontWeight: "600",
  },
  voucherRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFE7DC",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  voucherText: {
    fontSize: 13,
    color: DARK,
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryKey: {
    fontSize: 13,
    color: DARK,
    fontWeight: "500",
  },
  summaryVal: {
    fontSize: 13,
    color: DARK,
    fontWeight: "600",
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 6,
    paddingTop: 14,
  },
  totalKey: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK,
  },
  itemsPreviewCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  previewCount: {
    fontSize: 12,
    fontWeight: "700",
    color: DARK,
    backgroundColor: "#EFE7DC",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#EFE5DA",
  },
  itemThumbWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EFE7DC",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  itemQty: {
    fontSize: 12,
    fontWeight: "700",
    color: DARK,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
    color: DARK,
    lineHeight: 18,
  },
  itemPrice: {
    marginTop: 2,
    fontSize: 12,
    color: MUTED,
  },
  itemLineTotal: {
    fontSize: 13,
    fontWeight: "700",
    color: DARK,
  },
  noteCard: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: BORDER,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: DARK,
  },
  payBtn: {
    marginTop: 4,
    backgroundColor: ACCENT,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  payBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK,
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 12,
    color: MUTED,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 2,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: DARK,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
  },
  modalSecondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#EDE5DA",
  },
  modalSecondaryText: {
    color: DARK,
    fontWeight: "600",
    fontSize: 12,
  },
  modalPrimaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: ACCENT,
  },
  modalPrimaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
});