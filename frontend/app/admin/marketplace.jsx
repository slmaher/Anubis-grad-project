import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuthToken } from '../api/authStorage';
import { api } from '../api/client';

export default function MarketplaceManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'jewelry', stock: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = await getAuthToken();
      const res = await api.admin.getMarketplace(token);
      if (res.success) setProducts(res.data);
    } catch (error) {
      console.error("Fetch products error:", error);
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    const token = await getAuthToken();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      const res = editingId
        ? await api.admin.updateProduct(editingId, payload, token)
        : await api.admin.createProduct(payload, token);

      if (res.success) {
        setModalVisible(false);
        setEditingId(null);
        setFormData({ name: '', description: '', price: '', category: 'jewelry', stock: '' });
        fetchProducts();
      } else {
        Alert.alert("Error", res.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Save product error:", error);
      Alert.alert("Error", error.message || "Failed to save product");
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const token = await getAuthToken();
            try {
              const res = await api.admin.deleteProduct(id, token);
              if (res.success) {
                fetchProducts();
              }
            } catch (error) {
              console.error("Delete product error:", error);
            }
          }
        }
      ]
    );
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString()
    });
    setModalVisible(true);
  };

  const renderProduct = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>{item.category} • {item.price} LE • Stock: {item.stock}</Text>
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
        <Text style={styles.title}>Marketplace</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditingId(null);
            setFormData({ name: '', description: '', price: '', category: 'jewelry', stock: '' });
            setModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '600' }}>Add Product</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Product' : 'Add Product'}</Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={formData.name}
                onChangeText={t => setFormData({...formData, name: t})}
              />
              <TextInput
                style={styles.input}
                placeholder="Price"
                value={formData.price}
                keyboardType="numeric"
                onChangeText={t => setFormData({...formData, price: t})}
              />
              <TextInput
                style={styles.input}
                placeholder="Stock"
                value={formData.stock}
                keyboardType="numeric"
                onChangeText={t => setFormData({...formData, stock: t})}
              />
              <TextInput
                style={styles.input}
                placeholder="Category (jewelry, artifact, books, other)"
                value={formData.category}
                onChangeText={t => setFormData({...formData, category: t})}
              />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Description"
                value={formData.description}
                multiline
                onChangeText={t => setFormData({...formData, description: t})}
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', maxWidth: 500, borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ECE5DE', borderRadius: 8, padding: 12, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  saveBtn: { backgroundColor: '#D9A441', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
});
