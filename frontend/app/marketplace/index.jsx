import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import React from "react";
import { useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import {
  addItemToCart,
  getCartItems,
  updateCartItemQuantity,
} from "../api/cartStorage";

export default function Marketplace() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("jewelry");
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: "jewelry",
      labelKey: "marketplace.categories.jewelry",
      icon: "ring",
    },
    {
      id: "artifact",
      labelKey: "marketplace.categories.artifact",
      icon: "amphora",
    },
    {
      id: "books",
      labelKey: "marketplace.categories.books",
      icon: "book-open-page-variant-outline",
    },
  ];

  const products = [
    {
      id: 1,
      nameKey: "marketplace.products.egyptian_keychain",
      price: 100,
      image: require("../../assets/images/souvenir-1.jpeg"),
      category: "jewelry",
    },
    {
      id: 2,
      nameKey: "marketplace.products.cleopatra_keychain",
      price: 150,
      image: require("../../assets/images/souvenir-2.jpeg"),
      category: "jewelry",
    },
    {
      id: 3,
      nameKey: "marketplace.products.egyptian_pottery",
      price: 300,
      image: require("../../assets/images/souvenir-3.jpeg"),
      category: "artifact",
    },
    {
      id: 4,
      nameKey: "marketplace.products.egyptian_hand_mirror",
      price: 400,
      image: require("../../assets/images/souvenir-4.jpeg"),
      category: "artifact",
    },
    {
      id: 5,
      nameKey: "marketplace.products.pharaonic_pyramid_keychain",
      price: 120,
      image: require("../../assets/images/souvenir-5.jpg"),
      category: "jewelry",
    },
    {
      id: 6,
      nameKey: "marketplace.products.pharaonic_keychain",
      price: 110,
      image: require("../../assets/images/souvenir-6.jpg"),
      category: "jewelry",
    },
  ];

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const loadCart = async () => {
        const storedItems = await getCartItems();
        if (isActive) {
          setCart(storedItems);
        }
      };

      loadCart();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const addToCart = async (product) => {
    const updated = await addItemToCart(product);
    setCart(updated);
  };

  const updateQuantity = async (productId, delta) => {
    const updated = await updateCartItemQuantity(productId, delta);
    setCart(updated);
  };

  const getProductQuantity = (productId) => {
    const item = cart.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = product.category === activeCategory;
    const translatedName = t(product.nameKey);
    const matchesSearch =
      !searchQuery.trim() ||
      translatedName.toLowerCase().includes(searchQuery.trim().toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <ImageBackground
      source={require("../../assets/images/beige-background.jpeg")}
      style={styles.mainContainer}
      resizeMode="cover"
    >
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={28}
                color="#2C2010"
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {t("marketplace.title", "Souvenir Marketplace")}
            </Text>

            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => router.push("/marketplace/cart")}
            >
              <MaterialCommunityIcons
                name="cart-outline"
                size={23}
                color="#2C2010"
              />
              {getCartCount() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getCartCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <MaterialCommunityIcons
              name="menu"
              size={18}
              color="#666"
              style={styles.searchIconLeft}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t(
                "marketplace.search_placeholder",
                "Search souvenirs",
              )}
              placeholderTextColor="#888"
              style={styles.searchInput}
            />
            <MaterialCommunityIcons
              name="magnify"
              size={18}
              color="#666"
              style={styles.searchIconRight}
            />
          </View>

          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  activeCategory === category.id && styles.categoryButtonActive,
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                <MaterialCommunityIcons
                  name={category.icon}
                  size={14}
                  color={activeCategory === category.id ? "#6B5B4F" : "#8B7B6C"}
                />
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {t(category.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>
            {t("marketplace.available_items", "Available items")}
          </Text>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.productsGrid}>
              {filteredProducts.map((product) => {
                const quantity = getProductQuantity(product.id);
                return (
                  <View key={product.id} style={styles.productCard}>
                    <Image
                      source={product.image}
                      style={styles.productImage}
                      resizeMode="cover"
                    />

                    <View style={styles.productBottomSection}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {t(product.nameKey)}
                      </Text>

                      <View style={styles.productFooter}>
                        <View style={styles.priceTag}>
                          <MaterialCommunityIcons
                            name="cash-multiple"
                            size={12}
                            color="#6B5B4F"
                          />
                          <Text style={styles.productPrice}>
                            {product.price} LE
                          </Text>
                        </View>

                        {quantity === 0 ? (
                          <TouchableOpacity
                            style={styles.addToCartButton}
                            onPress={() => addToCart(product)}
                          >
                            <MaterialCommunityIcons
                              name="cart-plus"
                              size={16}
                              color="#fff"
                            />
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.quantityControls}>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => updateQuantity(product.id, -1)}
                            >
                              <MaterialCommunityIcons
                                name="minus"
                                size={14}
                                color="#fff"
                              />
                            </TouchableOpacity>

                            <Text style={styles.quantityText}>{quantity}</Text>

                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => updateQuantity(product.id, 1)}
                            >
                              <MaterialCommunityIcons
                                name="plus"
                                size={14}
                                color="#fff"
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {filteredProducts.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="package-variant-closed-remove"
                  size={28}
                  color="#8B7B6C"
                />
                <Text style={styles.emptyText}>
                  {t("marketplace.no_items", "No items found")}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#EDE6DF",
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2010",
    letterSpacing: 0.4,
  },
  cartButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: 4,
    right: 3,
    backgroundColor: "#D9A441",
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIconLeft: {
    marginRight: 10,
  },
  searchIconRight: {
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  categoriesContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  categoryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: "rgba(212, 175, 55, 0.22)",
    borderColor: "rgba(180, 140, 70, 0.5)",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8B7B6C",
  },
  categoryTextActive: {
    fontWeight: "600",
    color: "#6B5B4F",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B7B6C",
    marginBottom: 12,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "#F9F7F4",
    borderRadius: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 155,
    borderRadius: 12,
    marginBottom: 10,
  },
  productBottomSection: {
    gap: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2C2010",
    lineHeight: 16,
    minHeight: 32,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceTag: {
    backgroundColor: "#ECE5DE",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5A4A3C",
  },
  addToCartButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#8B7B6C",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECE5DE",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  quantityButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#8B7B6C",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  quantityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    minWidth: 14,
    textAlign: "center",
  },
  emptyState: {
    marginTop: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: "#8B7B6C",
    fontWeight: "500",
  },
});
