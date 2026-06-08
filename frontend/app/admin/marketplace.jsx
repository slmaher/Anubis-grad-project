import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getAuthToken } from "../api/authStorage";
import { api } from "../api/client";
import { uploadImageToCloudinary } from "../utils/cloudinary";

export default function MarketplaceManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "jewelry",
    imageUrl: "",
  });

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
    } finally {
      setLoading(false);
    }
  };

  const pickProductImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow gallery access to choose a product image.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setUploadingImage(true);
      const selected = result.assets[0];
      const uploadResult = await uploadImageToCloudinary(
        selected.uri,
        "products",
      );

      setFormData((prev) => ({
        ...prev,
        imageUrl: uploadResult.secure_url,
      }));
      Alert.alert("Success", "Product image uploaded successfully!");
    } catch (error) {
      console.error("Pick product image error:", error);
      Alert.alert(
        "Error",
        error.message || "Unable to upload image right now.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    const token = await getAuthToken();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
      };

      const res = editingId
        ? await api.admin.updateProduct(editingId, payload, token)
        : await api.admin.createProduct(payload, token);

      if (res.success) {
        setModalVisible(false);
        setEditingId(null);
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "jewelry",
          imageUrl: "",
        });
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
          },
        },
      ],
    );
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imageUrl: product.imageUrl || "",
    });
    setModalVisible(true);
  };

  const renderProduct = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardImageWrap}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <MaterialCommunityIcons
              name="image-outline"
              size={24}
              color="#B39E8C"
            />
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>
          {item.category} • {item.price} LE
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => openEdit(item)}
          style={styles.actionBtn}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={22}
            color="#D9A441"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item._id)}
          style={styles.actionBtn}
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={22}
            color="#E53935"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading)
    return (
      <ActivityIndicator size="large" color="#D9A441" style={{ flex: 1 }} />
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditingId(null);
            setFormData({
              name: "",
              description: "",
              price: "",
              category: "jewelry",
              imageUrl: "",
            });
            setModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600" }}>Add Product</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Edit Product" : "Add Product"}
              </Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#A79B91"
                value={formData.name}
                onChangeText={(t) => setFormData({ ...formData, name: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="Price"
                placeholderTextColor="#A79B91"
                value={formData.price}
                keyboardType="numeric"
                onChangeText={(t) => setFormData({ ...formData, price: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="Category (jewelry, artifact, books, other)"
                placeholderTextColor="#A79B91"
                value={formData.category}
                onChangeText={(t) => setFormData({ ...formData, category: t })}
              />
              <View style={styles.imageActionsRow}>
                <TouchableOpacity
                  style={[
                    styles.pickImageBtn,
                    uploadingImage && { opacity: 0.7 },
                  ]}
                  onPress={pickProductImage}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator
                      size="small"
                      color="#D9A441"
                      style={{ marginRight: 4 }}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="image-plus"
                      size={18}
                      color="#D9A441"
                    />
                  )}
                  <Text style={styles.pickImageText}>
                    {uploadingImage ? "Uploading image..." : "Choose Photo"}
                  </Text>
                </TouchableOpacity>
                {!!formData.imageUrl && (
                  <TouchableOpacity
                    style={styles.clearImageBtn}
                    onPress={() => setFormData({ ...formData, imageUrl: "" })}
                    disabled={uploadingImage}
                  >
                    <Text style={styles.clearImageText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
              {!!formData.imageUrl && (
                <Image
                  source={{ uri: formData.imageUrl }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              )}
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Description"
                placeholderTextColor="#A79B91"
                value={formData.description}
                multiline
                onChangeText={(t) =>
                  setFormData({ ...formData, description: t })
                }
              />
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#2C2010" },
  addBtn: {
    backgroundColor: "#D9A441",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  list: { gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    elevation: 2,
  },
  cardImageWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F9F7F4",
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: { width: "100%", height: "100%" },
  cardImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { flex: 1 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { padding: 4 },
  name: { fontSize: 16, fontWeight: "600", color: "#2C2010" },
  sub: { fontSize: 13, color: "#8B7B6C" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    maxWidth: 500,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ECE5DE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: "#2C2010",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5EFE7",
  },
  closeBtnText: { color: "#2C2010", fontSize: 16, fontWeight: "700" },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  saveBtn: {
    backgroundColor: "#D9A441",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  imageActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  pickImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9A44120",
    backgroundColor: "#D9A44110",
  },
  pickImageText: { color: "#8B6A1E", fontWeight: "600" },
  clearImageBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  clearImageText: { color: "#B54747", fontWeight: "600" },
  imagePreview: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: "#F5F0EA",
  },
});
