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

const sections = [
  {
    title: 'Account',
    items: [
      { icon: '👤', label: 'Edit profile',       route: '/ProfileScreen' },
      { icon: '🔒', label: 'Security',            route: null },
      { icon: '🔔', label: 'Notifications',       route: null },
      { icon: '🛡️', label: 'Privacy',             route: null },
    ],
  },
  {
    title: 'Support & About',
    items: [
      { icon: '💳', label: 'My Subscribtion',     route: null },
      { icon: '❓', label: 'Help & Support',      route: null },
      { icon: 'ℹ️', label: 'Terms and Policies',  route: null },
    ],
  },
  {
    title: 'Cache & cellular',
    items: [
      { icon: '🗑️', label: 'Free up space',       route: null },
      { icon: '📶', label: 'Data Saver',           route: null },
    ],
  },
  {
    title: 'Actions',
    items: [
      { icon: '🚩', label: 'Report a problem',    route: null },
      { icon: '➕', label: 'Add account',         route: null },
      { icon: '🚪', label: 'Log out',             route: null },
    ],
  },
];

export default function SettingsScreen() {
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Sections */}
        <View style={styles.content}>
          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.row,
                    idx === section.items.length - 1 && styles.rowLast,
                  ]}
                  onPress={() => item.route && router.push(item.route)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.rowIcon}>{item.icon}</Text>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}

const DARK    = '#2C2010';
const MUTED   = '#9A8C7A';
const DIVIDER = 'rgba(180,160,130,0.25)';

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  safeArea:   { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 30,
    color: DARK,
    lineHeight: 34,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: DARK,
    letterSpacing: 0.3,
  },
  headerSpacer: { width: 32 },
  content: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
  section:      { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
    gap: 14,
  },
  rowLast:  { borderBottomWidth: 0 },
  rowIcon:  { fontSize: 18, width: 28, textAlign: 'center' },
  rowLabel: { fontSize: 14, color: DARK, fontWeight: '400' },
});