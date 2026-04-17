import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { getAuthToken } from '../api/authStorage';

const API_URL = 'http://localhost:4000/api';

export default function ArtifactManagement() {
  const params = useLocalSearchParams();
  const actionParam = Array.isArray(params?.action) ? params.action[0] : params?.action;
  const [artifacts, setArtifacts] = useState([]);
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', museum: '', era: '' });

  useEffect(() => {
    fetchArtifacts();
    fetchMuseums();
  }, []);

  useEffect(() => {
    if (actionParam !== 'create') return;

    setEditingArtifact(null);
    setFormData({ name: '', description: '', museum: '', era: '' });
    setModalVisible(true);
  }, [actionParam]);

  const fetchArtifacts = async () => {
    try {
      const response = await fetch(`${API_URL}/artifacts`);
      const res = await response.json();
      if (res.success) setArtifacts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMuseums = async () => {
    try {
      const response = await fetch(`${API_URL}/museums`);
      const res = await response.json();
      if (res.success) setMuseums(res.data);
    } catch (error) {}
  };

  const handleSave = async () => {
    const token = await getAuthToken();
    const method = editingArtifact ? 'PATCH' : 'POST';
    const url = editingArtifact ? `${API_URL}/artifacts/${editingArtifact._id}` : `${API_URL}/artifacts`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const res = await response.json();
      if (res.success) {
        setModalVisible(false);
        fetchArtifacts();
      } else {
        Alert.alert('Error', res.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteArtifact = (id) => {
    Alert.alert('Delete Artifact', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const token = await getAuthToken();
        await fetch(`${API_URL}/artifacts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        fetchArtifacts();
      }}
    ]);
  };

  const openEdit = (artifact) => {
    setEditingArtifact(artifact);
    setFormData({ name: artifact.name, description: artifact.description, museum: artifact.museum?._id || artifact.museum, era: artifact.era });
    setModalVisible(true);
  };

  const renderArtifact = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>{item.era} • {item.museum?.name || 'No Museum'}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEdit(item)}><MaterialCommunityIcons name="pencil-outline" size={22} color="#D9A441" /></TouchableOpacity>
        <TouchableOpacity onPress={() => deleteArtifact(item._id)}><MaterialCommunityIcons name="trash-can-outline" size={22} color="#FF6B6B" /></TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#D9A441" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Artifacts</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setEditingArtifact(null); setFormData({ name: '', description: '', museum: '', era: '' }); setModalVisible(true); }}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Add Artifact</Text>
        </TouchableOpacity>
      </View>

      <FlatList data={artifacts} renderItem={renderArtifact} keyExtractor={item => item._id} contentContainerStyle={styles.list} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingArtifact ? 'Edit Artifact' : 'Add New Artifact'}</Text>
            <ScrollView>
              <TextInput style={styles.input} placeholder="Name" value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />
              <TextInput style={styles.input} placeholder="Era" value={formData.era} onChangeText={t => setFormData({...formData, era: t})} />
              <TextInput style={styles.input} placeholder="Museum ID" value={formData.museum} onChangeText={t => setFormData({...formData, museum: t})} />
              <Text style={styles.hint}>Tip: Use IDs from Museum management for now.</Text>
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
  addBtn: { backgroundColor: '#D9A441', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  list: { gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  name: { fontSize: 16, fontWeight: '600', color: '#2C2010' },
  sub: { fontSize: 13, color: '#8B7B6C' },
  actions: { flexDirection: 'row', gap: 16 },
  hint: { fontSize: 12, color: '#8B7B6C', marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', maxWidth: 500, borderRadius: 16, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ECE5DE', borderRadius: 8, padding: 12, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  saveBtn: { backgroundColor: '#D9A441', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
});
