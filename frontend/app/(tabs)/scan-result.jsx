import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import { analyzeArtifactImage } from "../api/ai";

const { width } = Dimensions.get("window");

export default function ScanResult() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const photoUri = params.photoUri;
  const [isSaved, setIsSaved] = useState(false);

  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const runAnalysis = async () => {
      if (!photoUri || typeof photoUri !== "string") return;

      try {
        setLoadingAI(true);
        setAiError("");

        const result = await analyzeArtifactImage(photoUri);

        if (isMounted) {
          setAiResult(result);
        }
      } catch (error) {
        console.error("AI analysis error:", error);
        if (isMounted) {
          setAiError(error?.message || "Failed to analyze artifact");
        }
      } finally {
        if (isMounted) {
          setLoadingAI(false);
        }
      }
    };

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [photoUri]);

  const handleBack = () => {
    router.push("/scan");
  };

  const handleSave = async () => {
    try {
      if (!photoUri || typeof photoUri !== "string") {
        Alert.alert("Error", "No image to save");
        return;
      }

      const permission = await MediaLibrary.requestPermissionsAsync(true);

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow media access in your device settings",
        );
        return;
      }

      await MediaLibrary.saveToLibraryAsync(photoUri);

      setIsSaved(true);
      Alert.alert("Success", "Image saved to gallery!");
    } catch (error) {
      console.log("Save error:", error);
      Alert.alert("Error", "Failed to save image");
    }
  };

  const handleShare = async () => {
    try {
      if (!photoUri || typeof photoUri !== "string") {
        Alert.alert("Error", "No image to share");
        return;
      }

      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert("Error", "Sharing is not available on this device");
        return;
      }

      await Sharing.shareAsync(photoUri, {
        mimeType: "image/jpeg",
        dialogTitle: "Share your artifact discovery",
      });
    } catch (error) {
      console.error("Error sharing image:", error);
      Alert.alert("Error", "Failed to share image");
    }
  };

  const handleAddToJourney = async () => {
    try {
      if (!photoUri || typeof photoUri !== "string") {
        Alert.alert("Error", "No image to add");
        return;
      }

      const existingJourney = await AsyncStorage.getItem("journey");
      const journeyItems = existingJourney ? JSON.parse(existingJourney) : [];

      const artifactName =
        aiResult?.metadata?.name ||
        aiResult?.recognition?.name ||
        `Artifact ${journeyItems.length + 1}`;

      const newItem = {
        id: Date.now().toString(),
        uri: photoUri,
        timestamp: new Date().toISOString(),
        name: artifactName,
      };

      journeyItems.push(newItem);
      await AsyncStorage.setItem("journey", JSON.stringify(journeyItems));

      Alert.alert("Success", "Added to your journey!", [
        { text: "View Journey", onPress: () => router.push("/journey") },
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Error adding to journey:", error);
      Alert.alert("Error", "Failed to add to journey");
    }
  };

  const artifactTitle = useMemo(() => {
    return (
      aiResult?.metadata?.name ||
      aiResult?.recognition?.name ||
      "Artifact picture"
    );
  }, [aiResult]);

  const confidenceText = useMemo(() => {
    const value = aiResult?.recognition?.confidence;
    if (typeof value !== "number") return null;
    return `${(value * 100).toFixed(1)}%`;
  }, [aiResult]);

  const restoredImageUrl = aiResult?.restoration?.final_image_url || null;

  return (
    <ImageBackground
      source={require("../../assets/images/beige-background.jpeg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Result</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.imageContainer}>
            <View style={styles.artifactImage}>
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={styles.capturedImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.artifactPlaceholder}>
                  <Text style={styles.artifactIcon}>👑</Text>
                  <Text style={styles.artifactName}>No image</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <View style={[styles.actionIcon, isSaved && styles.savedIcon]}>
                <Image
                  source={require("../../assets/images/save.png")}
                  style={styles.iconImage}
                />
              </View>
              <Text style={styles.actionLabel}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <View style={styles.actionIcon}>
                <Entypo name="share" size={28} color="#333" />
              </View>
              <Text style={styles.actionLabel}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAddToJourney}
            >
              <View style={styles.actionIcon}>
                <AntDesign name="plus" size={28} color="#333" />
              </View>
              <Text style={styles.actionLabel}>Add to Journey</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.aiCard}>
            <Text style={styles.sectionTitle}>AI Analysis</Text>

            {loadingAI ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B7B6C" />
                <Text style={styles.loadingText}>Analyzing artifact...</Text>
              </View>
            ) : aiError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Analysis failed</Text>
                <Text style={styles.errorText}>{aiError}</Text>
              </View>
            ) : aiResult ? (
              <View>
                <Text style={styles.artifactMainTitle}>{artifactTitle}</Text>

                {confidenceText ? (
                  <Text style={styles.confidenceText}>
                    Confidence: {confidenceText}
                  </Text>
                ) : null}

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Type</Text>
                  <Text style={styles.infoValue}>
                    {aiResult?.metadata?.artifact_type ||
                      aiResult?.recognition?.artifact_type ||
                      "Unknown"}
                  </Text>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Museum</Text>
                  <Text style={styles.infoValue}>
                    {aiResult?.metadata?.museum || "Unknown"}
                  </Text>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Era</Text>
                  <Text style={styles.infoValue}>
                    {aiResult?.metadata?.era || "Unknown"}
                  </Text>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Dynasty</Text>
                  <Text style={styles.infoValue}>
                    {aiResult?.metadata?.dynasty || "Unknown"}
                  </Text>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Material</Text>
                  <Text style={styles.infoValue}>
                    {aiResult?.metadata?.material || "Unknown"}
                  </Text>
                </View>

                {aiResult?.metadata?.description_en ? (
                  <View style={styles.descriptionBlock}>
                    <Text style={styles.infoLabel}>Description</Text>
                    <Text style={styles.descriptionText}>
                      {aiResult.metadata.description_en}
                    </Text>
                  </View>
                ) : null}

                {restoredImageUrl ? (
                  <View style={styles.restorationSection}>
                    <Text style={styles.sectionSubtitle}>Restored Result</Text>
                    <Image
                      source={{ uri: restoredImageUrl }}
                      style={styles.restoredImage}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <View style={styles.descriptionBlock}>
                    <Text style={styles.infoLabel}>Restoration</Text>
                    <Text style={styles.descriptionText}>
                      No saved restored image is available for this artifact
                      yet.
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.loadingText}>No analysis result yet.</Text>
            )}
          </View>
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
    alignItems: "center",
    paddingBottom: 60,
  },
  imageContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
    width: "100%",
  },
  artifactImage: {
    width: width - 40,
    height: (width - 40) * 1.1,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#1a2332",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  capturedImage: {
    width: "100%",
    height: "100%",
  },
  artifactPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a1929",
  },
  artifactIcon: {
    fontSize: 120,
    marginBottom: 20,
  },
  artifactName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    width: "100%",
    gap: 40,
    marginBottom: 25,
  },
  actionButton: {
    alignItems: "center",
    gap: 12,
  },
  actionIcon: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  savedIcon: {
    backgroundColor: "rgba(255, 232, 197, 0.84)",
    borderColor: "rgba(255, 232, 197, 0.84)",
  },
  iconImage: {
    width: 28,
    height: 28,
    tintColor: "#333",
  },
  actionLabel: {
    fontSize: 14,
    color: "#6B5B4F",
    fontWeight: "600",
  },
  aiCard: {
    width: width - 30,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#6B5B4F",
    marginBottom: 14,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6B5B4F",
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B5B4F",
    textAlign: "center",
  },
  errorContainer: {
    paddingVertical: 10,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#B00020",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: "#7A1C1C",
    lineHeight: 22,
  },
  artifactMainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#5A4A3F",
    marginBottom: 10,
  },
  confidenceText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#7A6A5A",
    marginBottom: 16,
  },
  infoBlock: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8B7B6C",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#3F342D",
    lineHeight: 22,
  },
  descriptionBlock: {
    marginTop: 8,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: "#3F342D",
    lineHeight: 24,
  },
  restorationSection: {
    marginTop: 18,
  },
  restoredImage: {
    width: "100%",
    height: 340,
    borderRadius: 18,
    backgroundColor: "#EFE7DC",
  },
});
