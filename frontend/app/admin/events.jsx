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
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getAuthToken } from "../api/authStorage";

const API_URL = "http://localhost:4000/api";

export default function EventManagement() {
  const params = useLocalSearchParams();
  const actionParam = Array.isArray(params?.action)
    ? params.action[0]
    : params?.action;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    museum: "",
    startDate: "",
    endDate: "",
    location: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (actionParam !== "create") return;

    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      museum: "",
      startDate: "",
      endDate: "",
      location: "",
      imageUrl: "",
    });
    setModalVisible(true);
  }, [actionParam]);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow gallery access to choose an event photo."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    } catch (error) {
      Alert.alert("Error", "Unable to pick image right now.");
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events`);
      const res = await response.json();
      if (res.success) setEvents(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const token = await getAuthToken();
    const method = editingEvent ? "PATCH" : "POST";
    const url = editingEvent
      ? `${API_URL}/events/${editingEvent._id}`
      : `${API_URL}/events`;
    const payload = {
      ...formData,
      imageUrl: formData.imageUrl?.trim() || undefined,
    };

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
        fetchEvents();
      } else {
        Alert.alert("Error", res.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteEvent = (id) => {
    Alert.alert("Delete Event", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const token = await getAuthToken();
          await fetch(`${API_URL}/events/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchEvents();
        },
      },
    ]);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      museum: event.museum?._id || event.museum,
      startDate: event.startDate.split("T")[0],
      endDate: event.endDate.split("T")[0],
      location: event.location,
    });
    setModalVisible(true);
  };

  const renderEvent = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.title}</Text>
        <Text style={styles.sub}>
          {new Date(item.startDate).toLocaleDateString()} at {item.museum?.name}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEdit(item)}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={22}
            color="#D9A441"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteEvent(item._id)}>
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
        <Text style={styles.title}>Events</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditingEvent(null);
            setFormData({
              title: "",
              description: "",
              museum: "",
              startDate: "",
              endDate: "",
              location: "",
              imageUrl: "",
              imageUrl: "",
            });
            setModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingEvent ? "Edit Event" : "Add New Event"}
            </Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={formData.title}
                onChangeText={(t) => setFormData({ ...formData, title: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="Museum ID"
                value={formData.museum}
                onChangeText={(t) => setFormData({ ...formData, museum: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="Start Date (YYYY-MM-DD)"
                value={formData.startDate}
                onChangeText={(t) => setFormData({ ...formData, startDate: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="End Date (YYYY-MM-DD)"
                value={formData.endDate}
                onChangeText={(t) => setFormData({ ...formData, endDate: t })}
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
                onChangeText={(t) => setFormData({ ...formData, imageUrl: t })}
              />
              <View style={styles.imageActionsRow}>
                <TouchableOpacity style={styles.pickImageBtn} onPress={pickImage}>
                  <MaterialCommunityIcons
                    name="image-plus"
                    size={18}
                    color="#D9A441"
                  />
                  <Text style={styles.pickImageText}>Choose Photo</Text>
                </TouchableOpacity>
                {!!formData.imageUrl && (
                  <TouchableOpacity
                    style={styles.clearImageBtn}
                    onPress={() => setFormData({ ...formData, imageUrl: "" })}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
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
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: "600", color: "#2C2010" },
  sub: { fontSize: 13, color: "#8B7B6C" },
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
    gap: 12,
    marginBottom: 16,
  },
  pickImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9A441",
    backgroundColor: "#FFF8E9",
  },
  pickImageText: {
    color: "#B8860B",
    fontWeight: "600",
  },
  clearImageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F5EFE7",
  },
  clearImageText: {
    color: "#6E6257",
    fontWeight: "600",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#F3F0EB",
  },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  saveBtn: {
    backgroundColor: "#D9A441",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
