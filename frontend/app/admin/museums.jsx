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
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getAuthToken } from "../api/authStorage";

const API_URL = "http://localhost:4000/api";

export default function MuseumManagement() {
  const params = useLocalSearchParams();
  const actionParam = Array.isArray(params?.action)
    ? params.action[0]
    : params?.action;
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMuseum, setEditingMuseum] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    city: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchMuseums();
  }, []);

  useEffect(() => {
    if (actionParam !== "create") return;

    setEditingMuseum(null);
    setFormData({
      name: "",
      description: "",
      location: "",
      city: "",
      imageUrl: "",
    });
    setImageRemoved(false);
    setModalVisible(true);
  }, [actionParam]);

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow gallery access to choose a museum image.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const selected = result.assets[0];
      if (!selected.base64) {
        Alert.alert("Error", "Failed to read image data. Please try again.");
        return;
      }

      const mimeType = selected.mimeType || "image/jpeg";
      setFormData((prev) => ({
        ...prev,
        imageUrl: `data:${mimeType};base64,${selected.base64}`,
      }));
      setImageRemoved(false);
    } catch (error) {
      Alert.alert("Error", "Unable to pick image right now.");
    }
  };

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
    const method = editingMuseum ? "PATCH" : "POST";
    const url = editingMuseum
      ? `${API_URL}/museums/${editingMuseum._id}`
      : `${API_URL}/museums`;

    const payload = {
      name: formData.name?.trim(),
      description: formData.description?.trim(),
      location: formData.location?.trim(),
      city: formData.city?.trim(),
    };

    if (imageRemoved) {
      payload.imageUrl = null;
    } else if (formData.imageUrl?.trim()) {
      payload.imageUrl = formData.imageUrl.trim();
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const res = await response.json();
      if (res.success) {
        setModalVisible(false);
        setEditingMuseum(null);
        setImageRemoved(false);
        setFormData({
          name: "",
          description: "",
          location: "",
          city: "",
          imageUrl: "",
        });
        fetchMuseums();
      } else {
        Alert.alert("Error", res.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const performDeleteMuseum = async (id) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Not authenticated. Please log in again.");
        return;
      }

      const response = await fetch(`${API_URL}/museums/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await response.json().catch(() => null);
      if (!response.ok || !res?.success) {
        throw new Error(
          res?.message || `HTTP ${response.status}: Failed to delete museum`,
        );
      }

      setMuseums((prev) => prev.filter((museum) => museum._id !== id));
      Alert.alert("Success", "Museum deleted successfully");
    } catch (error) {
      Alert.alert(
        "Delete Failed",
        error?.message || "Could not delete museum. Please try again.",
      );
    }
  };

  const deleteMuseum = (id) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Delete Museum? This action cannot be undone.",
      );
      if (confirmed) {
        performDeleteMuseum(id);
      }
      return;
    }

    Alert.alert("Delete Museum", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => performDeleteMuseum(id),
      },
    ]);
  };

  const openEdit = (museum) => {
    setEditingMuseum(museum);
    setFormData({
      name: museum.name || "",
      description: museum.description || "",
      location: museum.location || "",
      city: museum.city || "",
      imageUrl: museum.imageUrl || "",
    });
    setImageRemoved(false);
    setModalVisible(true);
  };

  const renderMuseum = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.museumName}>{item.name}</Text>
        <Text style={styles.museumCity}>{item.city}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEdit(item)}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={22}
            color="#D9A441"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteMuseum(item._id)}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={22}
            color="#FF6B6B"
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
        <Text style={styles.title}>Museums</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditingMuseum(null);
            setFormData({
              name: "",
              description: "",
              location: "",
              city: "",
              imageUrl: "",
            });
            setImageRemoved(false);
            setModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Add Museum</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={museums}
        renderItem={renderMuseum}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingMuseum ? "Edit Museum" : "Add New Museum"}
            </Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={formData.name}
                onChangeText={(t) => setFormData({ ...formData, name: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="City"
                value={formData.city}
                onChangeText={(t) => setFormData({ ...formData, city: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="Location"
                value={formData.location}
                onChangeText={(t) => setFormData({ ...formData, location: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="Image URL (optional)"
                value={formData.imageUrl}
                onChangeText={(t) => {
                  setFormData({ ...formData, imageUrl: t });
                  if (t?.trim()) {
                    setImageRemoved(false);
                  }
                }}
              />
              <View style={styles.imageActionsRow}>
                <TouchableOpacity
                  style={styles.pickImageBtn}
                  onPress={pickImage}
                >
                  <MaterialCommunityIcons
                    name="image-plus"
                    size={18}
                    color="#D9A441"
                  />
                  <Text style={styles.pickImageText}>Choose Image</Text>
                </TouchableOpacity>
                {!!formData.imageUrl && (
                  <TouchableOpacity
                    style={styles.clearImageBtn}
                    onPress={() => {
                      setFormData({ ...formData, imageUrl: "" });
                      setImageRemoved(true);
                    }}
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
                style={[styles.input, { height: 100 }]}
                placeholder="Description"
                multiline
                value={formData.description}
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "600" },
  list: { gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowOpacity: 0.05,
    elevation: 2,
  },
  museumName: { fontSize: 16, fontWeight: "600", color: "#2C2010" },
  museumCity: { fontSize: 14, color: "#8B7B6C" },
  actions: { flexDirection: "row", gap: 16 },
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
    maxHeight: "80%",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ECE5DE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  imageActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  saveBtn: {
    backgroundColor: "#D9A441",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
