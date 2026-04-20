import React, { useEffect, useMemo, useState } from "react";
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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuthToken } from "../api/authStorage";

const API_URL = "http://localhost:4000/api";

const EMPTY_FORM = {
  user: "",
  bio: "",
  specialties: "",
  languages: "",
  experienceYears: "",
  hourlyRate: "",
};

export default function TourGuideManagement() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const actionParam = Array.isArray(params?.action)
    ? params.action[0]
    : params?.action;
  const userIdParam = Array.isArray(params?.userId)
    ? params.userId[0]
    : params?.userId;

  const [guides, setGuides] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (actionParam !== "create") {
      return;
    }

    setEditingId(null);
    setFormError("");
    setFormData({ ...EMPTY_FORM, user: userIdParam || "" });
    setModalVisible(true);
  }, [actionParam, userIdParam]);

  const initialize = async () => {
    await Promise.all([fetchGuides(), fetchUsers()]);
    setLoading(false);
  };

  const fetchGuides = async () => {
    try {
      const response = await fetch(`${API_URL}/tour-guides`);
      const res = await response.json();
      if (res.success) {
        setGuides(res.data || []);
      }
    } catch (error) {
      console.error("Fetch guides error:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await response.json();
      if (res.success) {
        setUsers((res.data || []).filter((u) => u.isActive !== false));
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  };

  const guideUserIds = useMemo(
    () => new Set(guides.map((g) => g.user?._id).filter(Boolean)),
    [guides],
  );
  const selectedUser = useMemo(
    () => users.find((u) => u._id === formData.user) || null,
    [users, formData.user],
  );

  const openCreate = () => {
    setEditingId(null);
    setFormError("");
    setFormData(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (guide) => {
    setEditingId(guide._id);
    setFormError("");
    setFormData({
      user: guide.user?._id || "",
      bio: guide.bio || "",
      specialties: guide.specialties?.join(", ") || "",
      languages: guide.languages?.join(", ") || "",
      experienceYears:
        guide.experienceYears != null ? String(guide.experienceYears) : "",
      hourlyRate: guide.hourlyRate != null ? String(guide.hourlyRate) : "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    setFormError("");

    if (!editingId && !formData.user) {
      setFormError("Please choose a user first.");
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      setFormError("Not authenticated. Please login again.");
      return;
    }

    try {
      const url = editingId
        ? `${API_URL}/tour-guides/${editingId}`
        : `${API_URL}/tour-guides`;
      const method = editingId ? "PATCH" : "POST";

      const body = {
        bio: formData.bio?.trim() || undefined,
        specialties: formData.specialties
          ? formData.specialties
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        languages: formData.languages
          ? formData.languages
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        experienceYears:
          formData.experienceYears !== ""
            ? Number(formData.experienceYears)
            : undefined,
        hourlyRate:
          formData.hourlyRate !== "" ? Number(formData.hourlyRate) : undefined,
        ...(editingId ? {} : { user: formData.user }),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const res = await response.json();
      if (!response.ok || !res.success) {
        setFormError(res.message || "Failed to save guide profile");
        return;
      }

      setModalVisible(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
      await Promise.all([fetchGuides(), fetchUsers()]);
    } catch (error) {
      console.error("Save guide error:", error);
      setFormError("Failed to save guide profile");
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("Confirm Delete", "Delete this guide profile?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const token = await getAuthToken();
          try {
            const response = await fetch(`${API_URL}/tour-guides/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            const res = await response.json().catch(() => null);
            if (!response.ok || !res?.success) {
              Alert.alert(
                "Delete failed",
                res?.message || "Could not delete guide profile.",
              );
              return;
            }
            await Promise.all([fetchGuides(), fetchUsers()]);
          } catch (error) {
            console.error("Delete guide error:", error);
            Alert.alert("Delete failed", "Could not delete guide profile.");
          }
        },
      },
    ]);
  };

  const renderGuide = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.user?.name || "Unknown User"}</Text>
        <Text style={styles.sub}>{item.user?.email || ""}</Text>
        <Text style={styles.sub}>
          {item.specialties?.join(", ") || "No specialties"}
        </Text>
        <Text style={styles.rate}>
          {item.hourlyRate || 0} EGP/hr • {item.rating || 0} ★
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

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#D9A441" style={{ flex: 1 }} />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tour Guides</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <MaterialCommunityIcons name="account-plus" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Add Guide Profile</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={guides}
        renderItem={renderGuide}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tour guide profiles yet.</Text>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Guide Profile" : "New Guide Profile"}
            </Text>
            <ScrollView>
              {!editingId && (
                <View style={styles.userPickerWrap}>
                  <Text style={styles.sectionTitle}>Select User</Text>
                  {selectedUser ? (
                    <View style={styles.selectedUserBox}>
                      <Text style={styles.selectedUserName}>
                        {selectedUser.name}
                      </Text>
                      <Text style={styles.selectedUserEmail}>
                        {selectedUser.email}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.helper}>
                      Choose a user to create a guide profile.
                    </Text>
                  )}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {users.map((user) => {
                      const hasProfile = guideUserIds.has(user._id);
                      const disabled = hasProfile;
                      return (
                        <TouchableOpacity
                          key={user._id}
                          style={[
                            styles.userChip,
                            formData.user === user._id && styles.userChipActive,
                            disabled && styles.userChipDisabled,
                          ]}
                          disabled={disabled}
                          onPress={() =>
                            setFormData((prev) => ({ ...prev, user: user._id }))
                          }
                        >
                          <Text style={styles.userChipName}>{user.name}</Text>
                          <Text style={styles.userChipEmail}>{user.email}</Text>
                          {hasProfile && (
                            <Text style={styles.userChipTag}>
                              Already guide
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <TextInput
                style={[styles.input, { height: 90 }]}
                placeholder="Bio"
                value={formData.bio}
                multiline
                onChangeText={(t) =>
                  setFormData((prev) => ({ ...prev, bio: t }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Specialties (comma separated)"
                value={formData.specialties}
                onChangeText={(t) =>
                  setFormData((prev) => ({ ...prev, specialties: t }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Languages (comma separated)"
                value={formData.languages}
                onChangeText={(t) =>
                  setFormData((prev) => ({ ...prev, languages: t }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Experience Years"
                value={formData.experienceYears}
                keyboardType="numeric"
                onChangeText={(t) =>
                  setFormData((prev) => ({ ...prev, experienceYears: t }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Hourly Rate (EGP)"
                value={formData.hourlyRate}
                keyboardType="numeric"
                onChangeText={(t) =>
                  setFormData((prev) => ({ ...prev, hourlyRate: t }))
                }
              />

              {!!formError && <Text style={styles.errorText}>{formError}</Text>}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setFormError("");
                  setEditingId(null);
                  setFormData(EMPTY_FORM);
                  if (actionParam === "create") {
                    router.replace("/admin/tour-guides");
                  }
                }}
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
  emptyText: { color: "#8B7B6C", textAlign: "center", marginTop: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  cardInfo: { flex: 1 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { padding: 4 },
  name: { fontSize: 16, fontWeight: "600", color: "#2C2010" },
  sub: { fontSize: 13, color: "#8B7B6C" },
  rate: { fontSize: 12, color: "#D9A441", fontWeight: "700", marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    maxWidth: 520,
    borderRadius: 16,
    padding: 24,
    maxHeight: "85%",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  sectionTitle: { fontWeight: "700", color: "#2C2010", marginBottom: 8 },
  helper: { fontSize: 12, color: "#8B7B6C", marginBottom: 8 },
  userPickerWrap: { marginBottom: 16 },
  selectedUserBox: {
    borderWidth: 1,
    borderColor: "#D9A441",
    borderRadius: 10,
    backgroundColor: "#FFF8E9",
    padding: 10,
    marginBottom: 10,
  },
  selectedUserName: { fontWeight: "700", color: "#2C2010" },
  selectedUserEmail: { color: "#6F6358", fontSize: 12, marginTop: 2 },
  userChip: {
    borderWidth: 1,
    borderColor: "#ECE5DE",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    width: 220,
    backgroundColor: "#fff",
  },
  userChipActive: {
    borderColor: "#D9A441",
    backgroundColor: "#FFF8E9",
  },
  userChipDisabled: {
    opacity: 0.5,
  },
  userChipName: { fontWeight: "700", color: "#2C2010" },
  userChipEmail: { fontSize: 12, color: "#8B7B6C", marginTop: 2 },
  userChipTag: {
    fontSize: 11,
    color: "#A5761A",
    marginTop: 6,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ECE5DE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#C62828",
    marginBottom: 8,
    fontSize: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  saveBtn: {
    backgroundColor: "#D9A441",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
