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
import { getAuthToken } from "../api/authStorage";

const API_URL = "http://localhost:4000/api";

export default function VolunteeringManagement() {
  const [opportunities, setOpportunities] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("opportunities"); // 'opportunities' or 'applicants'
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    duration: "",
  });

  useEffect(() => {
    fetchOpportunities();
    fetchApplicants();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await fetch(`${API_URL}/volunteers/opportunities`);
      const res = await response.json();
      if (res.success) setOpportunities(res.data);
    } catch (error) {
      console.error("Fetch opportunities error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/volunteers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await response.json();
      if (res.success) setApplicants(res.data);
    } catch (error) {
      console.error("Fetch applicants error:", error);
    }
  };

  const handleSaveOpp = async () => {
    const token = await getAuthToken();
    try {
      const url = editingId
        ? `${API_URL}/volunteers/opportunities/${editingId}`
        : `${API_URL}/volunteers/opportunities`;
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const res = await response.json();
      if (res.success) {
        setModalVisible(false);
        setEditingId(null);
        setFormData({
          title: "",
          description: "",
          requirements: "",
          location: "",
          duration: "",
        });
        fetchOpportunities();
      } else {
        Alert.alert("Error", res.message || "Failed to save opportunity");
      }
    } catch (error) {
      console.error("Save opportunity error:", error);
    }
  };

  const handleDeleteOpp = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this opportunity?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const token = await getAuthToken();
            try {
              const response = await fetch(
                `${API_URL}/volunteers/opportunities/${id}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              if ((await response.json()).success) {
                fetchOpportunities();
              }
            } catch (error) {
              console.error("Delete opportunity error:", error);
            }
          },
        },
      ],
    );
  };

  const openEdit = (opp) => {
    setEditingId(opp._id);
    setFormData({
      title: opp.title,
      description: opp.description,
      requirements: opp.requirements,
      location: opp.location,
      duration: opp.duration,
    });
    setModalVisible(true);
  };

  const updateStatus = async (id, status) => {
    const token = await getAuthToken();
    try {
      const response = await fetch(`${API_URL}/volunteers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if ((await response.json()).success) fetchApplicants();
    } catch (error) {
      console.error("Update status error:", error);
    }
  };

  const renderOpp = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.title}</Text>
        <Text style={styles.sub}>
          {item.location} • {item.duration}
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
          onPress={() => handleDeleteOpp(item._id)}
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

  const renderApplicant = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.user?.name}</Text>
        <Text style={styles.sub}>
          {item.museum?.name} • {item.role}
        </Text>
        <Text
          style={[
            styles.status,
            {
              color:
                item.status === "active"
                  ? "#50C878"
                  : item.status === "pending"
                    ? "#D9A441"
                    : "#FF6B6B",
            },
          ]}
        >
          {item.status.toUpperCase()}
        </Text>
      </View>
      {item.status === "pending" && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => updateStatus(item._id, "active")}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={26}
              color="#50C878"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => updateStatus(item._id, "cancelled")}>
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={26}
              color="#FF6B6B"
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading)
    return (
      <ActivityIndicator size="large" color="#D9A441" style={{ flex: 1 }} />
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Volunteering</Text>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, tab === "opportunities" && styles.activeTab]}
            onPress={() => setTab("opportunities")}
          >
            <Text style={tab === "opportunities" && styles.activeTabText}>
              Opportunities
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === "applicants" && styles.activeTab]}
            onPress={() => setTab("applicants")}
          >
            <Text style={tab === "applicants" && styles.activeTabText}>
              Applicants
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {tab === "opportunities" ? (
        <>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setEditingId(null);
              setFormData({
                title: "",
                description: "",
                requirements: "",
                location: "",
                duration: "",
              });
              setModalVisible(true);
            }}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              New Opportunity
            </Text>
          </TouchableOpacity>
          <FlatList
            data={opportunities}
            renderItem={renderOpp}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
          />
        </>
      ) : (
        <FlatList
          data={applicants}
          renderItem={renderApplicant}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Opportunity" : "New Opportunity"}
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
                placeholder="Location"
                value={formData.location}
                onChangeText={(t) => setFormData({ ...formData, location: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="Duration"
                value={formData.duration}
                onChangeText={(t) => setFormData({ ...formData, duration: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="Requirements"
                value={formData.requirements}
                onChangeText={(t) =>
                  setFormData({ ...formData, requirements: t })
                }
              />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Description"
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
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveOpp}>
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
  header: { marginBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C2010",
    marginBottom: 16,
  },
  tabBar: { flexDirection: "row", gap: 12 },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F9F7F4",
  },
  activeTab: { backgroundColor: "#D9A441" },
  activeTabText: { color: "#fff", fontWeight: "600" },
  addBtn: {
    backgroundColor: "#8B7B6C",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
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
  cardInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600", color: "#2C2010" },
  sub: { fontSize: 13, color: "#8B7B6C" },
  status: { fontSize: 11, fontWeight: "700", marginTop: 4 },
  actions: { flexDirection: "row", gap: 12 },
  actionBtn: { padding: 4 },
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
