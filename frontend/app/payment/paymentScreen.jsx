import { useRouter } from 'expo-router';
import React from 'react';
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const menuItems = [
  { label: 'Home',      icon: '🏠', route: '/' },
  { label: 'Setting',   icon: '⚙️', route: '/SettingsScreen' },
  { label: 'Profile',   icon: '👤', route: '/ProfileScreen' },
  { label: 'Museums',   icon: '🏛️', route: '/Museums' },
  { label: 'Events',    icon: '📅', route: '/Events' },
  { label: 'Community', icon: '👥', route: '/Community' },
  { label: 'Scan',      icon: '🔍', route: '/Scan' },
  { label: 'Map',       icon: '📍', route: '/Map' },
];

export default function MenuScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../assets/images/bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Menu</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuRow}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}

const DARK    = '#2C2010';
const MUTED   = '#9A8C7A';
const DIVIDER = 'rgba(180,160,130,0.3)';

const styles = StyleSheet.create({
  background:   { flex: 1, width: '100%', height: '100%' },
  safeArea:     { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerSpacer: { width: 32 },
  headerTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#B8965A',
    letterSpacing: 0.4,
  },
  menuList: {
    marginTop: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText:  { fontSize: 24 },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: DARK,
    letterSpacing: 0.2,
  },
  chevron: {
    fontSize: 26,
    color: MUTED,
    lineHeight: 30,
  },
});