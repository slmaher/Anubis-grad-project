import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

const DIVIDER = '#E8E8E8';
const GRAY_BG = '#F2F2F2';
const DARK_FOOTER = '#5A6473';
const ICON_GRAY = '#9B9B9B';
const PRICE_GRAY = '#AAAAAA';
const HEART_COLOR = '#CCCCCC';

const initialItems = [
  {
    id: '1',
    name: 'Lorem',
    price: '$225.00',
    quantity: 1,
    image: 'https://i.imgur.com/QkIa5tT.jpeg',
  },
  {
    id: '2',
    name: 'Lorem',
    price: '$225.00',
    quantity: 1,
    image: require('../../assets/images/keychain.jpeg'),
  },
  {
    id: '3',
    name: 'Lorem',
    price: '$225.00',
    quantity: 1,
    image: 'https://i.imgur.com/Qphac99.jpeg',
  },
  {
    id: '4',
    name: 'Lorem',
    price: '$225.00',
    quantity: 1,
    image: 'https://i.imgur.com/QkIa5tT.jpeg',
  },
];

const HomeIcon = () => (
  <Text style={{ fontSize: 20, color: ICON_GRAY }}>⌂</Text>
);

const GridIcon = () => (
  <Text style={{ fontSize: 18, color: ICON_GRAY }}>⊞</Text>
);

const HeartIconNav = () => (
  <Text style={{ fontSize: 18, color: ICON_GRAY }}>♡</Text>
);

const CartIconNav = () => (
  <View style={styles.cartIconWrapper}>
    <Text style={{ fontSize: 18, color: '#FFFFFF' }}>🛒</Text>
    <View style={styles.cartBadge}>
      <Text style={styles.cartBadgeText}>-</Text>
    </View>
  </View>
);

export default function ShoppingBagScreen() {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);

  const updateQty = (id, delta) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const totalPrice = 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Outer gray background */}
      <View style={styles.outerContainer}>
        {/* White phone card */}
        <View style={styles.phoneCard}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your cart</Text>
            <TouchableOpacity style={styles.profileBtn}>
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable cart items */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {items.map(item => (
              <View key={item.id} style={styles.cartCard}>
                <Image
                  source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.cardContent}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>{item.price}</Text>
                  <TouchableOpacity>
                    <Text style={styles.heartIcon}>♡</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQty(item.id, -1)}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyNumber}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQty(item.id, 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerTop}>
              <View>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>$ {totalPrice}</Text>
              </View>
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => router.push('/marketplace/checkout')}
              >
                <Text style={styles.checkoutText}>CHECK OUT</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => router.push("/(tabs)/home")}
              >
                <HomeIcon />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => router.push("/(tabs)/explore")}
              >
                <GridIcon />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem}>
                <HeartIconNav />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.navItem, styles.navItemActive]}
                onPress={() => router.push("/marketplace")}
              >
                <CartIconNav />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#D6D6D6',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#D6D6D6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  phoneCard: {
    width: '92%',
    maxWidth: 390,
    backgroundColor: '#F5F5F5',
    borderRadius: 40,
    overflow: 'hidden',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#F5F5F5',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: '#333333',
    fontWeight: '300',
    lineHeight: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#222222',
    letterSpacing: 0.3,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 16,
  },

  // Scroll
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 14,
  },

  // Cart Card
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#EFEFEF',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222222',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: PRICE_GRAY,
    marginBottom: 8,
  },
  heartIcon: {
    fontSize: 16,
    color: HEART_COLOR,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: GRAY_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    color: '#444444',
    fontWeight: '400',
    lineHeight: 20,
  },
  qtyNumber: {
    fontSize: 14,
    color: '#222222',
    fontWeight: '500',
    minWidth: 14,
    textAlign: 'center',
  },

  // Footer
  footer: {
    backgroundColor: DARK_FOOTER,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  footerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 18,
  },
  totalLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  checkoutBtn: {
    backgroundColor: '#2E3640',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navItemActive: {
    backgroundColor: '#2E3640',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cartIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#5A6473',
    borderRadius: 8,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
});