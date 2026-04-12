import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuthToken } from '../api/authStorage';

const API_URL = 'http://localhost:4000/api';

export default function TourGuideManagement() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ user: '', bio: '', specialties: '', languages: '', hourlyRate: '' });

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const response = await fetch(`${API_URL}/tour-guides`);
      const res = await response.json();
      if (res.success) setGuides(res.data);
    } catch (error) {
      console.error("Fetch guides error:", error);
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    const token = await getAuthToken();
    try {
      const url = editingId ? `${API_URL}/tour-guides/${editingId}` : `${API_URL}/tour-guides`;
      const method = editingId ? 'PATCH' : 'POST';

      const body = {
        ...formData,
        specialties: typeof formData.specialties === 'string' ? formData.specialties.split(',').map(s => s.trim()) : formData.specialties,
        languages: typeof formData.languages === 'string' ? formData.languages.split(',').map(s => s.trim()) : formData.languages,
        hourlyRate: Number(formData.hourlyRate)
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });

      const res = await response.json();
      if (res.success) {
        setModalVisible(false);
        setEditingId(null);
        setFormData({ user: '', bio: '', specialties: '', languages: '', hourlyRate: '' });
        fetchGuides();
      } else {
        Alert.alert("Error", res.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Save guide error:", error);
      Alert.alert("Error", "Failed to save guide profile");
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this guide profile?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const token = await getAuthToken();
            try {
              const response = await fetch(`${API_URL}/tour-guides/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              if ((await response.json()).success) {
                fetchGuides();
              }
            } catch (error) {
              console.error("Delete guide error:", error);
            }
          }
        }
      ]
    );
  };

  const openEdit = (guide) => {
    setEditingId(guide._id);
    setFormData({
      user: guide.user?._id || '',
      bio: guide.bio,
      specialties: guide.specialties?.join(', ') || '',
      languages: guide.languages?.join(', ') || '',
      hourlyRate: guide.hourlyRate.toString()
    });
    setModalVisible(true);
  };

  const renderGuide = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.user?.name || 'Unknown User'}</Text>
        <Text style={styles.sub}>{item.specialties?.join(', ')}</Text>
        <Text style={styles.rate}>{item.hourlyRate} EGP/hr • {item.rating} ★</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={22} color="#D9A441" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionBtn}>
          <MaterialCommunityIcons name="delete-outline" size={22} color="#E53935" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#D9A441" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tour Guides</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditingId(null);
            setFormData({ user: '', bio: '', specialties: '', languages: '', hourlyRate: '' });
            setModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="account-plus" size={24} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '600' }}>Add Guide Profile</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={guides}
        renderItem={renderGuide}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Guide Profile' : 'New Guide Profile'}</Text>
            <ScrollView>
              {!editingId && (
                <TextInput
                  style={styles.input}
                  placeholder="User ID"
                  value={formData.user}
                  onChangeText={t => setFormData({...formData, user: t})}
                />
              )}
              <TextInput
                style={styles.input}
                placeholder="Specialties (comma separated)"
                value={formData.specialties}
                onChangeText={t => setFormData({...formData, specialties: t})}
              />
              <TextInput
                style={styles.input}
                placeholder="Languages (comma separated)"
                value={formData.languages}
                onChangeText={t => setFormData({...formData, languages: t})}
              />
              <TextInput
                style={styles.input}
                placeholder="Hourly Rate (EGP)"
                value={formData.hourlyRate}
                keyboardType="numeric"
                onChangeText={t => setFormData({...formData, hourlyRate: t})}
              />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Bio"
                value={formData.bio}
                multiline
                onChangeText={t => setFormData({...formData, bio: t})}
              />
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={{ color: '#fff' }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#2C2010' },
  addBtn: { backgroundColor: '#D9A441', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  list: { gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  cardInfo: { flex: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 4 },
  name: { fontSize: 16, fontWeight: '600', color: '#2C2010' },
  sub: { fontSize: 13, color: '#8B7B6C' },
  rate: { fontSize: 12, color: '#D9A441', fontWeight: '700', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', maxWidth: 500, borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ECE5DE', borderRadius: 8, padding: 12, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  saveBtn: { backgroundColor: '#D9A441', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
});
