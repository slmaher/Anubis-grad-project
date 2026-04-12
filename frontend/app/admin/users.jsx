import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuthToken } from '../api/authStorage';

const API_URL = 'http://localhost:4000/api'; // In a real app, use an env var or common client

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await response.json();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    Alert.alert('Delete User', 'Are you sure you want to deactivate this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getAuthToken();
            const response = await fetch(`${API_URL}/users/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
              setUsers(users.map(u => u._id === id ? { ...u, isActive: false } : u));
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    ]);
  };

  const changeRole = async (id, currentRole) => {
    const roles = ['Visitor', 'Guide', 'Admin'];
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: nextRole })
      });
      const res = await response.json();
      if (res.success) {
        setUsers(users.map(u => u._id === id ? { ...u, role: nextRole } : u));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.badgeContainer}>
          <Text style={[styles.roleBadge, { backgroundColor: item.role === 'Admin' ? '#D9A441' : '#8B7B6C' }]}>
            {item.role}
          </Text>
          {!item.isActive && <Text style={styles.inactiveBadge}>Inactive</Text>}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => changeRole(item._id, item.role)}>
          <MaterialCommunityIcons name="account-convert" size={20} color="#6B5B4F" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => deleteUser(item._id)}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#D9A441" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.count}>{users.length} Total Users</Text>
      </View>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#2C2010' },
  count: { fontSize: 14, color: '#8B7B6C' },
  list: { gap: 12 },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userName: { fontSize: 16, fontWeight: '600', color: '#2C2010' },
  userEmail: { fontSize: 14, color: '#8B7B6C', marginBottom: 8 },
  badgeContainer: { flexDirection: 'row', gap: 8 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, color: '#fff', fontSize: 12, fontWeight: '600' },
  inactiveBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: '#FF6B6B', color: '#fff', fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F9F7F4', justifyContent: 'center', alignItems: 'center' },
});
