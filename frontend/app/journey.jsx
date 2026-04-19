import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function Journey() {
  const router = useRouter();
  const [journeyItems, setJourneyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadJourney();
  }, []);

  const loadJourney = async () => {
    try {
      const existingJourney = await AsyncStorage.getItem("journey");
      if (existingJourney) {
        setJourneyItems(JSON.parse(existingJourney));
      }
    } catch (error) {
      console.error("Error loading journey:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      const updatedJourney = journeyItems.filter((item) => item.id !== id);
      setJourneyItems(updatedJourney);
      await AsyncStorage.setItem("journey", JSON.stringify(updatedJourney));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleEditName = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveName = async (id) => {
    try {
      if (!editName.trim()) {
        Alert.alert("Error", "Name cannot be empty");
        return;
      }

      const updatedJourney = journeyItems.map((item) =>
        item.id === id ? { ...item, name: editName.trim() } : item,
      );

      setJourneyItems(updatedJourney);
      await AsyncStorage.setItem("journey", JSON.stringify(updatedJourney));
      setEditingId(null);
      setEditName("");
      Alert.alert("Success", "Artifact name updated!");
    } catch (error) {
      console.error("Error updating name:", error);
      Alert.alert("Error", "Failed to update name");
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} • ${timeStr}`;
  };

  return (
    <ImageBackground
      source={require("../assets/images/beige-background.jpeg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Journey</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Loading...</Text>
            </View>
          ) : journeyItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📸</Text>
              <Text style={styles.emptyTitle}>No Artifacts Yet</Text>
              <Text style={styles.emptyText}>
                Start scanning artifacts to build your personal journey
                collection!
              </Text>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => router.push("/scan")}
              >
                <Text style={styles.scanButtonText}>Scan Artifact</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.count}>
                {journeyItems.length}{" "}
                {journeyItems.length === 1 ? "Artifact" : "Artifacts"}
              </Text>

              {/* Grid of artifacts */}
              <View style={styles.grid}>
                {journeyItems.map((item) => (
                  <View key={item.id} style={styles.artifactCard}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.artifactImage}
                      resizeMode="cover"
                    />

                    {/* Overlay with info */}
                    <View style={styles.overlay}>
                      {editingId === item.id ? (
                        <View style={styles.editContainer}>
                          <TextInput
                            style={styles.editInput}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Artifact name"
                            placeholderTextColor="#999"
                            autoFocus
                          />
                          <View style={styles.editButtons}>
                            <TouchableOpacity
                              style={styles.saveButton}
                              onPress={() => handleSaveName(item.id)}
                            >
                              <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.cancelButton}
                              onPress={() => {
                                setEditingId(null);
                                setEditName("");
                              }}
                            >
                              <Text style={styles.cancelButtonText}>
                                Cancel
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <>
                          <View style={styles.nameRow}>
                            <Text style={styles.artifactName} numberOfLines={1}>
                              {item.name}
                            </Text>
                            <TouchableOpacity
                              style={styles.editButton}
                              onPress={() => handleEditName(item.id, item.name)}
                            >
                              <AntDesign name="edit" size={18} color="#fff" />
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.artifactDate}>
                            {formatDateTime(item.timestamp)}
                          </Text>
                        </>
                      )}
                    </View>

                    {/* Remove Button */}
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item.id)}
                    >
                      <Text style={styles.removeIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <View style={{ height: 30 }} />
            </>
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: "#8B7B6C",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8B7B6C",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  count: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B7B6C",
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#8B7B6C",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#6B5B4F",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  scanButton: {
    backgroundColor: "#000000",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  artifactCard: {
    width: "47%",
    aspectRatio: 0.75,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    position: "relative",
  },
  artifactImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    padding: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  artifactName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  editButton: {
    padding: 4,
    marginLeft: 4,
  },
  editIcon: {
    fontSize: 14,
  },
  artifactDate: {
    fontSize: 11,
    color: "#E8DDD0",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeIcon: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  editContainer: {
    gap: 8,
  },
  editInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#000",
  },
  editButtons: {
    flexDirection: "row",
    gap: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#fffadb",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#666",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
