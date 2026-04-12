import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const router = useRouter();

  const stats = [
    { label: 'Total Users', value: '1,240', icon: 'account-group', color: '#4A90E2' },
    { label: 'Museums', value: '12', icon: 'bank', color: '#50C878' },
    { label: 'Artifacts', value: '450', icon: 'amphora', color: '#D9A441' },
    { label: 'Pending Volunteers', value: '28', icon: 'account-heart', color: '#FF6B6B' },
  ];

  const quickActions = [
    { name: 'Add Museum', icon: 'bank-plus', path: '/admin/museums' },
    { name: 'Add Artifact', icon: 'plus-circle-outline', path: '/admin/artifacts' },
    { name: 'New Event', icon: 'calendar-plus', path: '/admin/events' },
    { name: 'Create Campaign', icon: 'hand-heart', path: '/admin/donations' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard Overview</Text>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
              <MaterialCommunityIcons name={stat.icon} size={24} color={stat.color} />
            </View>
            <View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.subtitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionCard}
            onPress={() => router.push(action.path)}
          >
            <MaterialCommunityIcons name={action.icon} size={30} color="#D9A441" />
            <Text style={styles.actionName}>{action.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtitle}>Recent Activity</Text>
      <View style={styles.recentActivity}>
        <Text style={styles.placeholderText}>Activity log will be displayed here.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2010',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2010',
    marginTop: 32,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2010',
  },
  statLabel: {
    fontSize: 13,
    color: '#8B7B6C',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  actionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2010',
  },
  recentActivity: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  placeholderText: {
    color: '#8B7B6C',
    fontSize: 14,
  }
});
