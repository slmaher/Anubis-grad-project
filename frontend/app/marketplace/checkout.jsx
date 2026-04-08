import React, { useState } from "react";
import {
  ImageBackground,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useFocusEffect } from "@react-navigation/native";
import { clearCart, getCartItems, getCartTotals } from "../api/cartStorage";

const paymentMethods = [
  { id: "visa", icon: "cc-visa", color: "#1A1F71", lib: "fa5" },
  { id: "mastercard", icon: "cc-mastercard", color: "#EB001B", lib: "fa5" },
  { id: "paypal", icon: "cc-paypal", color: "#003087", lib: "fa5" },
  { id: "apple", icon: "cc-apple-pay", color: "#111111", lib: "fa5" },
];

function CheckoutHeader({ title, onBack }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={onBack}>
        <MaterialCommunityIcons name="chevron-left" size={28} color={DARK} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function CheckoutScreen({ onSuccess }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [addressTitle, setAddressTitle] = useState(
    t("checkout.address_title", "Default address"),
  );
  const [addressLine, setAddressLine] = useState("25/3 Housing Estate, Sylhet");
  const [isAddressModalVisible, setAddressModalVisible] = useState(false);
  const [draftAddressTitle, setDraftAddressTitle] = useState(addressTitle);
  const [draftAddressLine, setDraftAddressLine] = useState(addressLine);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const loadCartItems = async () => {
        const storedItems = await getCartItems();
        if (isActive) {
          setCartItems(storedItems);
        }
      };

      loadCartItems();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const { totalItems, totalPrice } = getCartTotals(cartItems);
  const deliveryFee = totalItems > 0 ? 60 : 0;
  const discount = voucherApplied ? Math.round(totalPrice * 0.1) : 0;
  const totalPayment = totalPrice + deliveryFee - discount;

  const handlePayNow = async () => {
    await clearCart();
    onSuccess();
  };

  const openAddressEditor = () => {
    setDraftAddressTitle(addressTitle);
    setDraftAddressLine(addressLine);
    setAddressModalVisible(true);
  };

  const saveAddress = () => {
    const nextTitle = draftAddressTitle.trim();
    const nextAddress = draftAddressLine.trim();

    if (!nextAddress) {
      return;
    }

    setAddressTitle(
      nextTitle || t("checkout.address_title", "Default address"),
    );
    setAddressLine(nextAddress);
    setAddressModalVisible(false);
  };

  return (
    <ImageBackground
      source={require("../../assets/images/beige-background.jpeg")}
      style={styles.root}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <CheckoutHeader
            title={t("checkout.title", "Checkout")}
            onBack={() => router.back()}
          />

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroLabel}>
                  {t("checkout.secure_checkout", "Secure checkout")}
                </Text>
                <Text style={styles.heroTitle}>
                  {t(
                    "checkout.ready_to_complete",
                    "Ready to complete your order",
                  )}
                </Text>
              </View>
              <View style={styles.heroIconCircle}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={22}
                  color={DARK}
                />
              </View>
            </View>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatChip}>
                <MaterialCommunityIcons
                  name="cart-outline"
                  size={14}
                  color={DARK}
                />
                <Text style={styles.heroStatText}>
                  {t("checkout.items_count", {
                    count: totalItems,
                    defaultValue: `${totalItems} items`,
                  })}
                </Text>
              </View>
              <View style={styles.heroStatChip}>
                <MaterialCommunityIcons
                  name="truck-outline"
                  size={14}
                  color={DARK}
                />
                <Text style={styles.heroStatText}>
                  {t("checkout.fast_delivery", "Fast delivery")}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  {t("checkout.delivery_address", "Delivery Address")}
                </Text>
                <TouchableOpacity onPress={openAddressEditor}>
                  <Text style={styles.linkText}>
                    {t("checkout.change", "Change")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.addressRow}>
                <View style={styles.addressIcon}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={20}
                    color={DARK}
                  />
                </View>

                <View style={styles.addressInfo}>
                  <Text style={[styles.addressTitle, isRTL && styles.textRtl]}>
                    {addressTitle}
                  </Text>
                  <Text style={[styles.addressText, isRTL && styles.textRtl]}>
                    {addressLine}
                  </Text>
                  <Text style={[styles.addressHint, isRTL && styles.textRtl]}>
                    {t(
                      "checkout.delivered_in_next_days",
                      "Delivered in next 7 days",
                    )}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  {t("checkout.payment_method", "Payment Method")}
                </Text>
              </View>

              <View style={styles.paymentGrid}>
                {paymentMethods.map((method) => (
                  <View key={method.id} style={styles.paymentTile}>
                    {method.lib === "mc" ? (
                      <MaterialCommunityIcons
                        name={method.icon}
                        size={22}
                        color={method.color}
                      />
                    ) : method.lib === "fa5" ? (
                      <FontAwesome5
                        name={method.icon}
                        size={22}
                        color={method.color}
                        brand
                      />
                    ) : (
                      <FontAwesome
                        name={method.icon}
                        size={22}
                        color={method.color}
                      />
                    )}
                    <Text style={styles.paymentText}>
                      {t(`checkout.payment_methods.${method.id}`, method.id)}
                    </Text>
                  </View>
                ))}
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
                  {voucherApplied
                    ? t("checkout.voucher_applied", "Voucher applied")
                    : t("checkout.add_voucher", "Add voucher")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  {t("checkout.order_summary", "Order Summary")}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>
                  {t("checkout.subtotal", "Subtotal")}
                </Text>
                <Text style={styles.summaryVal}>{totalPrice} LE</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>
                  {t("checkout.standard_delivery", "Standard Delivery")}
                </Text>
                <Text style={styles.summaryVal}>{deliveryFee} LE</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>
                  {t("checkout.discount", "Discount")}
                </Text>
                <Text style={styles.summaryVal}>-{discount} LE</Text>
              </View>

              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.totalKey}>
                  {t("checkout.total_payment", "Total Payment")}
                </Text>
                <Text style={styles.totalVal}>{totalPayment} LE</Text>
              </View>
            </View>

            <View style={styles.noteCard}>
              <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color={DARK}
              />
              <Text style={[styles.noteText, isRTL && styles.textRtl]}>
                {t(
                  "checkout.note",
                  "Use your order ID during payment so we can confirm your transaction.",
                )}
              </Text>
            </View>

            <View style={styles.itemsPreviewCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  {t("checkout.items_preview", "Items in your order")}
                </Text>
                <Text style={styles.previewCount}>{totalItems}</Text>
              </View>

              {cartItems.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="cart-off"
                    size={28}
                    color={MUTED}
                  />
                  <Text style={styles.emptyTitle}>
                    {t("checkout.empty_title", "No items to pay for")}
                  </Text>
                  <Text style={styles.emptyText}>
                    {t(
                      "checkout.empty_body",
                      "Go back to the marketplace and add some souvenirs first.",
                    )}
                  </Text>
                  <TouchableOpacity
                    style={styles.backToCartBtn}
                    onPress={() => router.push("/marketplace")}
                  >
                    <Text style={styles.backToCartText}>
                      {t("checkout.back_to_cart", "Browse marketplace")}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                cartItems.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemThumbWrap}>
                      <Text style={styles.itemQty}>{item.quantity}</Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text
                        style={[styles.itemName, isRTL && styles.textRtl]}
                        numberOfLines={2}
                      >
                        {t(item.nameKey, item.nameKey)}
                      </Text>
                      <Text style={[styles.itemPrice, isRTL && styles.textRtl]}>
                        {item.price} LE x {item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.itemLineTotal}>
                      {item.price * item.quantity} LE
                    </Text>
                  </View>
                ))
              )}
            </View>

            <TouchableOpacity
              style={[styles.payBtn, totalItems === 0 && styles.payBtnDisabled]}
              onPress={handlePayNow}
              activeOpacity={0.85}
              disabled={totalItems === 0}
            >
              <MaterialCommunityIcons
                name="credit-card-check-outline"
                size={18}
                color="#fff"
              />
              <Text style={styles.payBtnText}>
                {t("checkout.pay_now", "Pay now")}
              </Text>
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
                <Text style={[styles.modalTitle, isRTL && styles.textRtl]}>
                  {t("checkout.edit_address", "Edit address")}
                </Text>

                <Text style={[styles.modalLabel, isRTL && styles.textRtl]}>
                  {t("checkout.address_name", "Address name")}
                </Text>
                <TextInput
                  value={draftAddressTitle}
                  onChangeText={setDraftAddressTitle}
                  style={[styles.modalInput, isRTL && styles.modalInputRtl]}
                  placeholder={t("checkout.address_title", "Default address")}
                  placeholderTextColor="#9A8C7A"
                />

                <Text style={[styles.modalLabel, isRTL && styles.textRtl]}>
                  {t("checkout.address_line", "Address line")}
                </Text>
                <TextInput
                  value={draftAddressLine}
                  onChangeText={setDraftAddressLine}
                  style={[styles.modalInput, isRTL && styles.modalInputRtl]}
                  placeholder={t("checkout.address_line", "Address line")}
                  placeholderTextColor="#9A8C7A"
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalSecondaryBtn}
                    onPress={() => setAddressModalVisible(false)}
                  >
                    <Text style={styles.modalSecondaryText}>
                      {t("common.cancel", "Cancel")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalPrimaryBtn}
                    onPress={saveAddress}
                  >
                    <Text style={styles.modalPrimaryText}>
                      {t("common.save", "Save")}
                    </Text>
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

function AfterPaymentScreen({ onBack }) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <ImageBackground
      source={require("../../assets/images/beige-background.jpeg")}
      style={styles.root}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <CheckoutHeader
            title={t("checkout.title", "Checkout")}
            onBack={onBack}
          />

          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <MaterialCommunityIcons name="check" size={34} color={DARK} />
            </View>
            <Text style={styles.successTitle}>
              {t("checkout.success_title", "Purchase successful")}
            </Text>
            <Text style={styles.successText}>
              {t(
                "checkout.success_message",
                "Your order has been placed and will be confirmed shortly.",
              )}
            </Text>

            <TouchableOpacity
              style={styles.backToCartBtn}
              onPress={() => router.push("/marketplace")}
            >
              <Text style={styles.backToCartText}>
                {t("checkout.continue_shopping", "Continue shopping")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

export default function CheckoutFlow() {
  const [screen, setScreen] = useState("checkout");

  return screen === "checkout" ? (
    <CheckoutScreen onSuccess={() => setScreen("success")} />
  ) : (
    <AfterPaymentScreen onBack={() => setScreen("checkout")} />
  );
}

const DARK = "#2C2010";
const MUTED = "#8B7B6C";
const CARD_BG = "rgba(249,247,244,0.98)";
const ACCENT = "#46392c";
const LIGHT = "#EDE6DF";
const BORDER = "#E5DED5";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT,
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
  noteCard: {
    marginTop: 12,
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
  itemsPreviewCard: {
    marginTop: 12,
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
  payBtn: {
    marginTop: 14,
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
  payBtnDisabled: {
    opacity: 0.45,
  },
  payBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK,
  },
  emptyText: {
    fontSize: 12,
    color: MUTED,
    textAlign: "center",
    lineHeight: 18,
  },
  backToCartBtn: {
    marginTop: 6,
    backgroundColor: "#EFE7DC",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  backToCartText: {
    fontSize: 12,
    color: DARK,
    fontWeight: "700",
  },
  successCard: {
    flex: 1,
    marginTop: 8,
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  successIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EFE7DC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: DARK,
    marginBottom: 8,
    textAlign: "center",
  },
  successText: {
    fontSize: 13,
    lineHeight: 20,
    color: MUTED,
    textAlign: "center",
    marginBottom: 20,
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
  modalInputRtl: {
    textAlign: "right",
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
  textRtl: {
    textAlign: "right",
  },
});
