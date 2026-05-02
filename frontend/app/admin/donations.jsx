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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { getAuthToken } from "../api/authStorage";
import { API_URL } from "../api/baseUrl";

const AVAILABLE_ICONS = [
  "heart-outline",
  "account-heart-outline",
  "hand-heart-outline",
  "gift-outline",
  "cash-heart",
  "sprout-outline",
  "school-outline",
  "hospital-box-outline",
  "bookshelf",
  "image-filter-hdr",
  "food-apple-outline",
  "water-outline",
];

export default function DonationManagement() {
  const params = useLocalSearchParams();
  const actionParam = Array.isArray(params?.action)
    ? params.action[0]
    : params?.action;

  const emptyForm = {
    title: "",
    description: "",
    goalAmount: "",
    suggestedAmount: "",
    icon: "heart-outline",
  };

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (actionParam !== "create") return;

    setEditingCampaign(null);
    setFormData(emptyForm);
    setModalVisible(true);
  }, [actionParam]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/donations/campaigns`);
      const res = await response.json();

      if (res.success) {
        setCampaigns(res.data || []);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load donation campaigns.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Validation Error", "Please enter campaign title.");
      return;
    }

    if (!formData.goalAmount || Number(formData.goalAmount) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid goal amount.");
      return;
    }

    if (!formData.suggestedAmount || Number(formData.suggestedAmount) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid suggested amount.");
      return;
    }

    const token = await getAuthToken();
    const method = editingCampaign ? "PATCH" : "POST";
    const url = editingCampaign
      ? `${API_URL}/donations/campaigns/${editingCampaign._id}`
      : `${API_URL}/donations/campaigns`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          goalAmount: Number(formData.goalAmount),
          suggestedAmount: Number(formData.suggestedAmount),
          icon: formData.icon,
        }),
      });

      const res = await response.json();

      if (res.success) {
        setModalVisible(false);
        setEditingCampaign(null);
        setFormData(emptyForm);
        fetchCampaigns();
      } else {
        Alert.alert("Error", res.message || "Failed to save campaign.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save campaign.");
    }
  };

const deleteCampaign = (id) => {
  Alert.alert("Delete Campaign", "Are you sure you want to delete this campaign?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          const token = await getAuthToken();

          const response = await fetch(`${API_URL}/donations/campaigns/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const res = await response.json();

          if (res.success) {
            setCampaigns((prev) => prev.filter((item) => item._id !== id));
            Alert.alert("Deleted", "Campaign deleted successfully.");
          } else {
            Alert.alert("Error", res.message || "Failed to delete campaign.");
          }
        } catch (error) {
          console.error(error);
          Alert.alert("Error", "Failed to delete campaign.");
        }
      },
    },
  ]);
};

  const openEdit = (campaign) => {
    setEditingCampaign(campaign);

    setFormData({
      title: campaign.title || "",
      description: campaign.description || "",
      goalAmount:
        campaign.goalAmount !== null && campaign.goalAmount !== undefined
          ? String(campaign.goalAmount)
          : "",
      suggestedAmount:
        campaign.suggestedAmount !== null &&
        campaign.suggestedAmount !== undefined
          ? String(campaign.suggestedAmount)
          : "",
      icon: campaign.icon || "heart-outline",
    });

    setModalVisible(true);
  };

  const openCreate = () => {
    setEditingCampaign(null);
    setFormData(emptyForm);
    setModalVisible(true);
  };

  const renderCampaign = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconBadge}>
        <MaterialCommunityIcons
          name={item.icon || "heart-outline"}
          size={24}
          color="#D9A441"
        />
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.title || "Untitled Campaign"}</Text>
        <Text style={styles.sub}>
          {item.currentAmount ?? 0} / {item.goalAmount ?? 0} EGP raised
        </Text>
        <Text style={styles.sub}>
          Suggested: {item.suggestedAmount ?? 0} EGP
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

        <TouchableOpacity onPress={() => deleteCampaign(item._id)}>
          <MaterialCommunityIcons
            name="delete-outline"
            size={22}
            color="#FF6B6B"
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
        <Text style={styles.title}>Donation Campaigns</Text>

        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.addBtnText}>New Campaign</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={campaigns}
        renderItem={renderCampaign}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCampaign ? "Edit Campaign" : "New Campaign"}
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
                placeholder="Goal Amount (EGP)"
                keyboardType="numeric"
                value={formData.goalAmount}
                onChangeText={(t) =>
                  setFormData({ ...formData, goalAmount: t })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Suggested Amount (EGP)"
                keyboardType="numeric"
                value={formData.suggestedAmount}
                onChangeText={(t) =>
                  setFormData({ ...formData, suggestedAmount: t })
                }
              />

              <TextInput
                style={[styles.input, { height: 100 }]}
                placeholder="Description"
                multiline
                value={formData.description}
                onChangeText={(t) =>
                  setFormData({ ...formData, description: t })
                }
              />

              <Text style={styles.sectionLabel}>Select Icon</Text>

              <View style={styles.iconGrid}>
                {AVAILABLE_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      formData.icon === icon && styles.iconButtonSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, icon })}
                  >
                    <MaterialCommunityIcons
                      name={icon}
                      size={24}
                      color={formData.icon === icon ? "#D9A441" : "#8B7B6C"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setEditingCampaign(null);
                  setFormData(emptyForm);
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#F9F7F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600", color: "#2C2010" },
  sub: { fontSize: 13, color: "#8B7B6C", marginTop: 2 },
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
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  saveBtn: {
    backgroundColor: "#D9A441",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2010",
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  iconButton: {
    width: "22%",
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: "#ECE5DE",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonSelected: {
    borderColor: "#D9A441",
    backgroundColor: "#F9F7F4",
  },
});