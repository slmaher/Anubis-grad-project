import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuthToken } from '../api/authStorage';

const API_URL = 'http://localhost:4000/api';

export default function MuseumManagement() {
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMuseum, setEditingMuseum] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', location: '', city: '' });

  useEffect(() => {
    fetchMuseums();
  }, []);

  const fetchMuseums = async () => {
    try {
      const response = await fetch(`${API_URL}/museums`);
      const res = await response.json();
      if (res.success) setMuseums(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const token = await getAuthToken();
    const method = editingMuseum ? 'PATCH' : 'POST';
    const url = editingMuseum ? `${API_URL}/museums/${editingMuseum._id}` : `${API_URL}/museums`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const res = await response.json();
      if (res.success) {
        setModalVisible(false);
        setEditingMuseum(null);
        setFormData({ name: '', description: '', location: '', city: '' });
        fetchMuseums();
      } else {
        Alert.alert('Error', res.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteMuseum = (id) => {
    Alert.alert('Delete Museum', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const token = await getAuthToken();
        await fetch(`${API_URL}/museums/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        fetchMuseums();
      }}
    ]);
  };

  const openEdit = (museum) => {
    setEditingMuseum(museum);
    setFormData({ name: museum.name, description: museum.description, location: museum.location, city: museum.city });
    setModalVisible(true);
  };

  const renderMuseum = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.museumName}>{item.name}</Text>
        <Text style={styles.museumCity}>{item.city}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEdit(item)}><MaterialCommunityIcons name="pencil-outline" size={22} color="#D9A441" /></TouchableOpacity>
        <TouchableOpacity onPress={() => deleteMuseum(item._id)}><MaterialCommunityIcons name="trash-can-outline" size={22} color="#FF6B6B" /></TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#D9A441" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Museums</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setEditingMuseum(null); setFormData({ name: '', description: '', location: '', city: '' }); setModalVisible(true); }}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Add Museum</Text>
        </TouchableOpacity>
      </View>

      <FlatList data={museums} renderItem={renderMuseum} keyExtractor={item => item._id} contentContainerStyle={styles.list} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingMuseum ? 'Edit Museum' : 'Add New Museum'}</Text>
            <ScrollView>
              <TextInput style={styles.input} placeholder="Name" value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />
              <TextInput style={styles.input} placeholder="City" value={formData.city} onChangeText={t => setFormData({...formData, city: t})} />
              <TextInput style={styles.input} placeholder="Location" value={formData.location} onChangeText={t => setFormData({...formData, location: t})} />
              <TextInput style={[styles.input, { height: 100 }]} placeholder="Description" multiline value={formData.description} onChangeText={t => setFormData({...formData, description: t})} />
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
  addBtn: { backgroundColor: '#D9A441', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 8 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  list: { gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowOpacity: 0.05, elevation: 2 },
  museumName: { fontSize: 16, fontWeight: '600', color: '#2C2010' },
  museumCity: { fontSize: 14, color: '#8B7B6C' },
  actions: { flexDirection: 'row', gap: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', maxWidth: 500, borderRadius: 16, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ECE5DE', borderRadius: 8, padding: 12, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  saveBtn: { backgroundColor: '#D9A441', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
});
