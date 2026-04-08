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
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { clearCart, getCartItems, getCartTotals } from "../api/cartStorage";

const PaymentIcons = () => (
  <View style={styles.paymentIcons}>
    <View style={[styles.paymentBadge, { backgroundColor: "#1A1F71" }]}>
      <Text style={styles.visaText}>VISA</Text>
    </View>

    <View style={[styles.paymentBadge, { backgroundColor: "#2E77BC" }]}>
      <Text style={styles.amexText}>AMERICAN{"\n"}EXPRESS</Text>
    </View>

    <View
      style={[
        styles.paymentBadge,
        { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd" },
      ]}
    >
      <View style={styles.mcLeft} />
      <View style={styles.mcRight} />
    </View>

    <View
      style={[
        styles.paymentBadge,
        { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd" },
      ]}
    >
      <Text style={[styles.paypalText, { color: "#003087" }]}>Pay</Text>
      <Text style={[styles.paypalText, { color: "#009CDE" }]}>Pal</Text>
    </View>

    <View style={[styles.paymentBadge, { backgroundColor: "#000" }]}>
      <Text style={styles.appleText}> Pay</Text>
    </View>
  </View>
);

const CheckoutScreen = ({ onSuccess }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [cartItems, setCartItems] = useState([]);

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
  const totalPayment = totalPrice + deliveryFee;

  return (
    <ImageBackground
      source={require("../../assets/images/bg.png")}
      style={styles.root}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {t("checkout.title", "Checkout")}
          </Text>

          <View style={{ width: 32 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {t("checkout.delivery_address", "Delivery Address")}
            </Text>

            <View style={styles.addressCard}>
              <View style={styles.mapThumb}>
                <Text style={styles.mapEmoji}>🗺️</Text>
              </View>

              <View style={styles.addressInfo}>
                <View style={styles.addressTopRow}>
                  <Text style={styles.addressText}>
                    25/3 Housing Estate, Sylhet
                  </Text>

                  <TouchableOpacity>
                    <Text style={styles.changeText}>
                      {t("checkout.change", "Change")}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.etaRow}>
                  <Text style={styles.etaIcon}>🕐</Text>
                  <Text style={styles.deliveryEta}>
                    {" "}
                    {t(
                      "checkout.delivered_in_next_days",
                      "Delivered in next 7 days",
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {t("checkout.payment_method", "Payment Method")}
            </Text>

            <PaymentIcons />

            <TouchableOpacity
              style={styles.voucherRow}
              onPress={() => setVoucherApplied(!voucherApplied)}
            >
              <Text style={styles.voucherText}>
                {voucherApplied
                  ? t("checkout.voucher_applied", "✓ Voucher Applied")
                  : t("checkout.add_voucher", "Add Voucher")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Note */}
          <View style={styles.noteSection}>
            <Text style={styles.noteText}>
              <Text style={styles.noteLabel}>Note : </Text>
              Use your order id on the payment. Your Id
              <Text style={styles.noteId}> #154619 </Text>
              if you forgot to put your order id we can't confirm the payment.
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Summary */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>
                {t("checkout.total_items", "Total Items")} ({totalItems})
              </Text>
              <Text style={styles.summaryVal}>{totalPrice} LE</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>
                {t("checkout.standard_delivery", "Standard Delivery")}
              </Text>
              <Text style={styles.summaryVal}>{deliveryFee} LE</Text>
            </View>

            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={styles.totalKey}>
                {t("checkout.total_payment", "Total Payment")}
              </Text>
              <Text style={styles.totalVal}>{totalPayment} LE</Text>
            </View>
          </View>

          {/* Pay Button */}
          <View style={styles.payBtnContainer}>
            <TouchableOpacity
              style={styles.payBtn}
              onPress={async () => {
                await clearCart();
                onSuccess();
              }}
              activeOpacity={0.85}
              disabled={totalItems === 0}
            >
              <Text style={styles.payBtnText}>
                {t("checkout.pay_now", "Pay Now")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const AfterPaymentScreen = ({ onBack }) => (
  <ImageBackground
    source={require("../../assets/images/bg.png")}
    style={styles.root}
    resizeMode="cover"
  >
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Checkout</Text>

        <View style={{ width: 32 }} />
      </View>

      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <View style={styles.successCircle}>
            <Text style={styles.successCheck}>✓</Text>
          </View>

          <Text style={styles.successTitle}>Purchase Successful</Text>
        </View>
      </View>
    </SafeAreaView>
  </ImageBackground>
);

export default function CheckoutFlow() {
  const [screen, setScreen] = useState("checkout");

  return screen === "checkout" ? (
    <CheckoutScreen onSuccess={() => setScreen("success")} />
  ) : (
    <AfterPaymentScreen onBack={() => setScreen("checkout")} />
  );
}

/* ===========================
   COLORS
=========================== */

const DARK = "#2C2010";
const MUTED = "#8C8070";
const BTN = "#7D6E5B";
const CHANGE = "#A09080";
const DIVIDER = "#D8CBAF";
const NOTE_RED = "#C0392B";
const CARD = "rgba(255,255,255,0.72)";

/* ===========================
   STYLES
=========================== */

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  backArrow: {
    fontSize: 30,
    color: DARK,
    lineHeight: 34,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: DARK,
  },

  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  sectionLabel: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 12,
  },

  divider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginHorizontal: 20,
  },

  /* rest of styles remain the same... */
});
