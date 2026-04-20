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

const compressImageForWeb = async (dataUrl) => {
  if (Platform.OS !== "web") {
    return dataUrl;
  }

  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      try {
        const maxWidth = 1280;
        const maxHeight = 1280;
        let { width, height } = image;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          resolve(dataUrl);
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = reject;
    image.src = dataUrl;
  });
};

const normalizeDateToIso = (value) => {
  if (!value?.trim()) {
    return null;
  }

  const trimmed = value.trim();
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

  if (isoPattern.test(trimmed)) {
    const parsed = new Date(`${trimmed}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

export default function EventManagement() {
  const params = useLocalSearchParams();
  const actionParam = Array.isArray(params?.action)
    ? params.action[0]
    : params?.action;
  const [events, setEvents] = useState([]);
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    museum: "",
    startDate: "",
    endDate: "",
    location: "",
    imageUrl: "",
    imageFile: null,
  });

  useEffect(() => {
    fetchEvents();
    fetchMuseums();
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
      imageFile: null,
    });
    setFormErrors({});
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
          "Please allow gallery access to choose an event photo.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.2, // Extremely low quality for minimal size
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
      const base64Data = `data:${mimeType};base64,${selected.base64}`;
      const compressedImageUrl = await compressImageForWeb(base64Data);

      // Warn user if base64 is very large (rough estimate: base64 is ~33% larger than binary)
      const estimatedSizeKB = (compressedImageUrl.length * 0.75) / 1024;
      if (estimatedSizeKB > 500) {
        Alert.alert(
          "Image Too Large",
          `This image is ~${Math.round(estimatedSizeKB)}KB. It may fail to upload. Consider choosing a smaller image.`,
        );
      }

      setFormData((prev) => ({
        ...prev,
        imageUrl: compressedImageUrl,
        imageFile: null,
      }));
      setImageRemoved(false);
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

  const fetchMuseums = async () => {
    try {
      const response = await fetch(`${API_URL}/museums`);
      const res = await response.json();
      if (res.success) setMuseums(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const formatValidationErrors = (errors) => {
    if (!Array.isArray(errors) || errors.length === 0) {
      return null;
    }

    const first = errors[0];
    if (!first?.constraints) {
      return first?.property || "Validation failed";
    }

    return Object.values(first.constraints)[0] || "Validation failed";
  };

  const setFieldError = (field, message) => {
    setFormErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearFieldError = (field) => {
    setFormErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const applyValidationErrors = (errors) => {
    const nextErrors = {};
    if (Array.isArray(errors)) {
      for (const error of errors) {
        const message = error?.constraints
          ? Object.values(error.constraints)[0]
          : null;
        if (error?.property && message) {
          nextErrors[error.property] = message;
        }
      }
    }

    setFormErrors(nextErrors);
  };

  const handleSave = async () => {
    setFormErrors({});

    // Validate required fields
    if (!formData.title?.trim()) {
      setFieldError("title", "Please enter an event title");
      return;
    }
    if (!formData.description?.trim()) {
      setFieldError(
        "description",
        "Please enter a description (at least 10 characters)",
      );
      return;
    }
    if (!formData.museum?.trim()) {
      setFieldError("museum", "Please choose a museum");
      return;
    }
    if (!formData.startDate?.trim()) {
      setFieldError("startDate", "Please enter a start date (YYYY-MM-DD)");
      return;
    }
    if (!formData.endDate?.trim()) {
      setFieldError("endDate", "Please enter an end date (YYYY-MM-DD)");
      return;
    }

    const normalizedStartDate = normalizeDateToIso(formData.startDate);
    const normalizedEndDate = normalizeDateToIso(formData.endDate);

    if (!normalizedStartDate) {
      setFieldError("startDate", "Start date must be a valid date");
      return;
    }
    if (!normalizedEndDate) {
      setFieldError("endDate", "End date must be a valid date");
      return;
    }

    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Not authenticated. Please log in again.");
        return;
      }

      const method = editingEvent ? "PATCH" : "POST";
      const url = editingEvent
        ? `${API_URL}/events/${editingEvent._id}`
        : `${API_URL}/events`;

      // Build payload with optional image
      const payload = {
        title: formData.title?.trim(),
        description: formData.description?.trim(),
        museum: formData.museum?.trim(),
        startDate: normalizedStartDate,
        endDate: normalizedEndDate,
        location: formData.location?.trim() || undefined,
      };

      // Explicitly tell the backend to remove the existing image when requested.
      if (imageRemoved) {
        payload.imageUrl = null;
      } else if (formData.imageUrl?.trim()) {
        payload.imageUrl = formData.imageUrl.trim();
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const res = await response.json();

      if (!response.ok) {
        applyValidationErrors(res.errors);
        throw new Error(
          formatValidationErrors(res.errors) ||
            res.message ||
            `HTTP ${response.status}: Failed to save event`,
        );
      }

      if (res.success) {
        Alert.alert(
          "Success",
          editingEvent
            ? "Event updated successfully"
            : "Event created successfully",
        );
        setModalVisible(false);
        fetchEvents();
      } else {
        Alert.alert("Error", res.message || "Failed to save event");
      }
    } catch (error) {
      if (error?.message) {
        setFieldError("form", error.message);
      }
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
      imageUrl: event.imageUrl || "",
      imageFile: null,
    });
    setImageRemoved(false);
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
              imageFile: null,
            });
            setImageRemoved(false);
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
                onChangeText={(t) => {
                  setFormData({ ...formData, title: t });
                  clearFieldError("title");
                }}
              />
              {!!formErrors.title && (
                <Text style={styles.errorText}>{formErrors.title}</Text>
              )}
              <TextInput
                style={styles.input}
                placeholder="Museum ID"
                value={formData.museum}
                onChangeText={(t) => {
                  setFormData({ ...formData, museum: t });
                  clearFieldError("museum");
                }}
              />
              {!!formErrors.museum && (
                <Text style={styles.errorText}>{formErrors.museum}</Text>
              )}
              <Text style={styles.helperText}>
                Tap a museum below to fill the ID automatically.
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.museumPickerRow}
              >
                {museums.map((museum) => (
                  <TouchableOpacity
                    key={museum._id}
                    style={[
                      styles.museumChip,
                      formData.museum === museum._id && styles.museumChipActive,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, museum: museum._id });
                      clearFieldError("museum");
                    }}
                  >
                    <Text style={styles.museumChipTitle}>{museum.name}</Text>
                    <Text style={styles.museumChipSub}>{museum.city}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Start Date (YYYY-MM-DD)"
                value={formData.startDate}
                onChangeText={(t) => {
                  setFormData({ ...formData, startDate: t });
                  clearFieldError("startDate");
                }}
              />
              {!!formErrors.startDate && (
                <Text style={styles.errorText}>{formErrors.startDate}</Text>
              )}
              <TextInput
                style={styles.input}
                placeholder="End Date (YYYY-MM-DD)"
                value={formData.endDate}
                onChangeText={(t) => {
                  setFormData({ ...formData, endDate: t });
                  clearFieldError("endDate");
                }}
              />
              {!!formErrors.endDate && (
                <Text style={styles.errorText}>{formErrors.endDate}</Text>
              )}
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
                <TouchableOpacity
                  style={styles.pickImageBtn}
                  onPress={pickImage}
                >
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
                    onPress={() => {
                      setFormData({
                        ...formData,
                        imageUrl: "",
                        imageFile: null,
                      });
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
                style={[styles.input, { height: 80 }]}
                placeholder="Description"
                multiline
                value={formData.description}
                onChangeText={(t) => {
                  setFormData({ ...formData, description: t });
                  clearFieldError("description");
                }}
              />
              {!!formErrors.description && (
                <Text style={styles.errorText}>{formErrors.description}</Text>
              )}
              {!!formErrors.form && (
                <Text style={styles.errorBanner}>{formErrors.form}</Text>
              )}
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
  helperText: {
    fontSize: 12,
    color: "#8B7B6C",
    marginTop: -8,
    marginBottom: 12,
  },
  errorText: {
    color: "#C62828",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  errorBanner: {
    color: "#C62828",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  museumPickerRow: {
    marginBottom: 16,
  },
  museumChip: {
    borderWidth: 1,
    borderColor: "#ECE5DE",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: "#FFFDF9",
    minWidth: 130,
  },
  museumChipActive: {
    borderColor: "#D9A441",
    backgroundColor: "#FFF8E9",
  },
  museumChipTitle: {
    fontWeight: "600",
    color: "#2C2010",
  },
  museumChipSub: {
    fontSize: 12,
    color: "#8B7B6C",
    marginTop: 2,
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
