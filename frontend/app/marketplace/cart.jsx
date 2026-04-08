import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getCartItems,
  updateCartItemQuantity,
  getCartTotals,
} from "../api/cartStorage";

const DARK = "#2C2010";
const MUTED = "#8B7B6C";
const CARD_BG = "rgba(249,247,244,0.97)";
const DIVIDER = "#E5DED5";

export default function ShoppingBagScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [items, setItems] = React.useState([]);
  const isRTL = i18n.dir(i18n.language) === "rtl";

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const loadItems = async () => {
        const storedItems = await getCartItems();
        if (isActive) {
          setItems(storedItems);
        }
      };

      loadItems();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const updateQty = async (id, delta) => {
    const updatedItems = await updateCartItemQuantity(id, delta);
    setItems(updatedItems);
  };

  const { totalItems, totalPrice } = getCartTotals(items);

  return (
    <ImageBackground
      source={require("../../assets/images/beige-background.jpeg")}
      style={styles.root}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <MaterialCommunityIcons
                name="chevron-left"
                size={28}
                color={DARK}
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>{t("cart.title", "Your cart")}</Text>

            <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/profile")}> 
              <MaterialCommunityIcons name="account-outline" size={22} color={DARK} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subTitle}>
            {t("cart.items_in_bag", {
              count: totalItems,
              defaultValue: `${totalItems} items in your bag`,
            })}
          </Text>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <View key={item.id} style={styles.cartCard}>
                <Image source={item.image} style={styles.productImage} resizeMode="cover" />

                <View
                  style={[
                    styles.cardContent,
                    isRTL ? styles.cardContentRtl : styles.cardContentLtr,
                  ]}
                >
                  <Text
                    style={[styles.productName, isRTL && styles.textRtl]}
                    numberOfLines={2}
                  >
                    {t(item.nameKey, item.nameKey)}
                  </Text>
                  <Text style={[styles.productPrice, isRTL && styles.textRtl]}>
                    {item.price} LE
                  </Text>

                  <View style={styles.qtyControl}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQty(item.id, -1)}
                    >
                      <MaterialCommunityIcons name="minus" size={14} color={DARK} />
                    </TouchableOpacity>
                    <Text style={styles.qtyNumber}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQty(item.id, 1)}
                    >
                      <MaterialCommunityIcons name="plus" size={14} color={DARK} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.favoriteBtn}>
                  <MaterialCommunityIcons name="heart-outline" size={18} color={MUTED} />
                </TouchableOpacity>
              </View>
            ))}

            {items.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="cart-outline"
                  size={36}
                  color={MUTED}
                />
                <Text style={styles.emptyStateTitle}>
                  {t("cart.empty", "Your cart is empty")}
                </Text>
                <TouchableOpacity
                  style={styles.browseBtn}
                  onPress={() => router.push("/marketplace")}
                >
                  <Text style={styles.browseBtnText}>
                    {t("cart.browse", "Browse souvenirs")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View style={styles.summaryBar}>
            <View>
              <Text style={styles.totalLabel}>{t("cart.total", "Total")}</Text>
              <Text style={styles.totalAmount}>{totalPrice} LE</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.checkoutBtn,
                totalItems === 0 && styles.checkoutBtnDisabled,
              ]}
              onPress={() => router.push("/marketplace/checkout")}
              disabled={totalItems === 0}
            >
              <MaterialCommunityIcons name="credit-card-outline" size={16} color="#fff" />
              <Text style={styles.checkoutText}>{t("cart.checkout", "CHECK OUT")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EDE6DF",
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(220,210,198,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: DARK,
    letterSpacing: 0.4,
  },
  subTitle: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 130,
    gap: 12,
  },
  cartCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: DIVIDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 86,
    height: 86,
    borderRadius: 12,
    backgroundColor: "#EEE6DD",
  },
  cardContent: {
    flex: 1,
  },
  cardContentLtr: {
    marginLeft: 14,
    marginRight: 10,
  },
  cardContentRtl: {
    marginRight: 14,
    marginLeft: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK,
    marginBottom: 6,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 12,
    fontWeight: "500",
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ECE5DE",
    borderWidth: 1,
    borderColor: "#E2D8CC",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyNumber: {
    fontSize: 13,
    color: DARK,
    fontWeight: "700",
    minWidth: 16,
    textAlign: "center",
  },
  favoriteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "#E4DBD0",
  },
  summaryBar: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#5E6A7C",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  totalLabel: {
    fontSize: 11,
    color: "#DEE4EE",
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  checkoutBtn: {
    backgroundColor: "#2F3846",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkoutBtnDisabled: {
    opacity: 0.45,
  },
  checkoutText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.9,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyStateTitle: {
    fontSize: 14,
    color: MUTED,
    fontWeight: "500",
  },
  browseBtn: {
    marginTop: 6,
    backgroundColor: "#D8CFC4",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  browseBtnText: {
    color: DARK,
    fontSize: 12,
    fontWeight: "600",
  },
  textRtl: {
    textAlign: "right",
  },
});
