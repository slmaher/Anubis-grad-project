import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function Marketplace() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("Jewelry");
  const [cart, setCart] = useState([]);

  const categories = ["Jewelry", "Artifact", "Books"];

  const products = [
    {
      id: 1,
      name: "Egyptian keychain",
      price: 100,
      image: require("../../assets/images/souvenir-1.jpeg"),
      category: "Jewelry",
    },
    {
      id: 2,
      name: "Cleopatra Pharaoh Keychain Souvenir",
      price: 150,
      image: require("../../assets/images/souvenir-2.jpeg"),
      category: "Jewelry",
    },
    {
      id: 3,
      name: "Egyptian pottery sherds",
      price: 300,
      image: require("../../assets/images/souvenir-3.jpeg"),
      category: "Artifact",
    },
    {
      id: 4,
      name: "Egyptian hand mirror",
      price: 400,
      image: require("../../assets/images/souvenir-4.jpeg"),
      category: "Artifact",
    },
    {
      id: 5,
      name: "Pharaonic 3D Pyramid Keychain",
      price: 120,
      image: require("../../assets/images/souvenir-5.jpg"),
      category: "Jewelry",
    },
    {
      id: 6,
      name: "Pharaonic keychain",
      price: 110,
      image: require("../../assets/images/souvenir-6.jpg"),
      category: "Jewelry",
    },
  ];

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const getProductQuantity = (productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        source={require("../../assets/images/community-background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Souvenir Marketplace</Text>
            
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={() => router.push("/marketplace/cart")}
            >
              <Image
                source={require("../../assets/images/shopping-cart.png")}
                style={styles.cartIcon}
              />
              {getCartCount() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getCartCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  activeCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setActiveCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  activeCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Products Grid */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.productsGrid}>
              {products.map((product) => {
                const quantity = getProductQuantity(product.id);
                return (
                  <View key={product.id} style={styles.productCard}>
                    <ImageBackground
                      source={product.image}
                      style={styles.productImageBackground}
                      imageStyle={styles.productImageStyle}
                      resizeMode="cover"
                    >
                      {/* Product Info at Bottom */}
                      <View style={styles.productBottomSection}>
                        {/* Product Name */}
                        <View style={styles.productNameContainer}>
                          <Text style={styles.productName} numberOfLines={2}>
                            {product.name}
                          </Text>
                        </View>

                        {/* Price and Cart Controls */}
                        <View style={styles.productFooter}>
                          <View style={styles.priceContainer}>
                            <Text style={styles.productPrice}>{product.price} LE</Text>
                          </View>
                          
                          {quantity === 0 ? (
                            <TouchableOpacity 
                              style={styles.addToCartButton}
                              onPress={() => addToCart(product)}
                            >
                              <Text style={styles.addToCartIcon}>⊕</Text>
                            </TouchableOpacity>
                          ) : (
                            <View style={styles.quantityControls}>
                              <TouchableOpacity 
                                style={styles.quantityButton}
                                onPress={() => updateQuantity(product.id, -1)}
                              >
                                <Text style={styles.quantityButtonText}>−</Text>
                              </TouchableOpacity>
                              
                              <Text style={styles.quantityText}>{quantity}</Text>
                              
                              <TouchableOpacity 
                                style={styles.quantityButton}
                                onPress={() => updateQuantity(product.id, 1)}
                              >
                                <Text style={styles.quantityButtonText}>+</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    </ImageBackground>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#E8DDD0",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 26,
    color: "#000",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#8B7B6C",
  },
  cartButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartIcon: {
    width: 30,
    height: 30,
    tintColor: "#8B7B6C",
  },
  cartBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#D4AF37",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  categoriesContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: "rgba(212, 175, 55, 0.35)",
    borderColor: "rgba(212, 175, 55, 0.6)",
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    height: 280,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  productImageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  productImageStyle: {
    borderRadius: 18,
  },
  productBottomSection: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 6,
  },
  productNameContainer: {
    backgroundColor: "rgba(57, 57, 57, 0.4)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  productName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 14,
    textAlign: "left",
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  productPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },
  addToCartButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  addToCartIcon: {
    fontSize: 18,
    color: "#666",
    fontWeight: "400",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
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
});