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
import { useEffect, useMemo, useRef, useState } from "react";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { API_BASE_URL } from "../api/baseUrl";
import { analyzeArtifactImage } from "../api/ai";
import artifactModels from "../../src/data/artifactModels";
import AR_MODELS, { getSuggestedArModel } from "../../src/data/arModels";

const { width } = Dimensions.get("window");

const CACHE_KEY_PREFIX = "tour_guide_cache_";

// In-memory cache to avoid AsyncStorage reads and duplicate network calls
const inMemoryAudioCache = new Map(); // key -> audioUri
const generationPromises = new Map(); // key -> Promise resolving to audioUri

// Sanitization: remove JSON/debug, collapse whitespace, limit length
const sanitizeTextForTTS = (text) => {
  if (!text || typeof text !== "string") return "";

  let s = text;

  // Remove JSON-like objects and arrays
  s = s.replace(/\{[^}]*\}|\[[^\]]*\]/g, " ");

  // Remove common debug lines/markers (e.g., DEBUG:, metadata:, __meta__)
  s = s.replace(/(^|\n)\s*(DEBUG|debug|metadata|__meta__)[^\n]*\n?/gi, " ");

  // Remove HTML tags if any
  s = s.replace(/<[^>]+>/g, " ");

  // Collapse whitespace and trim
  s = s.replace(/\s+/g, " ").trim();

  // Limit length to 400 characters (configurable)
  const maxLen = 400;
  if (s.length > maxLen) {
    s = s.slice(0, maxLen);
    // Try to cut at last sentence end if possible
    const lastPunct = Math.max(
      s.lastIndexOf("."),
      s.lastIndexOf("!"),
      s.lastIndexOf("?"),
    );
    if (lastPunct > Math.floor(maxLen * 0.6)) {
      s = s.slice(0, lastPunct + 1);
    }
  }

  return s;
};

// ========================
// TEXT GENERATION FUNCTIONS
// ========================

const generateArabicGuide = (description) => {
  const cleanedDescription = String(description || "")
    .replace(/\s+/g, " ")
    .trim();

  const baseStory = cleanedDescription
    ? cleanedDescription
        .split(/(?<=[.!?])\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .join(" ")
    : "التمثال ده جميل جدا";

  const egyptianGuide =
    `أهلاً بيك يا صديقي، أنا نَوَّار، مرشدك السياحي . ` +
    `${baseStory} ` +
    `تخيل معايا، الإيد القديمة اللي عملت الحاجة الجميلة دي. ` +
    `كانت معاهم حكايات وأسرار من زمان. ` +
    `شوف التفاصيل الدقيقة، كل حاجة فيها حكاية. ` +
    `ده كنز من كنوز مصر الحلوة.`;

  return egyptianGuide;
};

const generateEnglishGuide = (description) => {
  const cleanedDescription = String(description || "")
    .replace(/\s+/g, " ")
    .trim();

  const descriptionWithoutIntro = cleanedDescription
    .replace(
      /^(hello!?\s*i'?m\s+nawwar,?\s*(your|ur)\s+egyptian\s+guide\s+today\.?\s*)/i,
      "",
    )
    .trim();

  const baseStory = descriptionWithoutIntro
    ? descriptionWithoutIntro
        .split(/(?<=[.!?])\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .join(" ")
    : "This artifact holds secrets of ancient Egypt.";

  const englishGuide =
    `I'm Nawwar, your Egyptian guide today. ` +
    `${baseStory} ` +
    `Can you imagine the skilled hands that shaped this treasure? ` +
    `Take a moment. Look closely. Every detail here brings the ancient past back to life. ` +
    `This is the pride of Egypt.`;

  return englishGuide;
};

// ========================
// ELEVENLABS INTEGRATION
// ========================

const generateSpeechWithElevenLabs = async (text, language) => {
  if (!text) {
    throw new Error("No text provided for speech generation");
  }

  try {
    console.log("🎤 Calling backend ElevenLabs proxy...", {
      textLength: text.length,
      language,
    });

    const response = await fetch(`${API_BASE_URL}/api/ai/tour-guide/speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, language }),
    });

    console.log("📊 ElevenLabs proxy response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const logFn =
        response.status === 401 || response.status === 402
          ? console.warn
          : console.error;
      logFn("❌ ElevenLabs proxy error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorData,
      });

      // Handle auth errors explicitly (HTTP 401)
      if (response.status === 401) {
        try {
          Alert.alert(
            "Speech Unavailable",
            "ElevenLabs API key is invalid or missing required permissions. Using device TTS fallback.",
          );
        } catch (alertErr) {
          console.warn("Could not show alert for ElevenLabs 401:", alertErr);
        }

        // Return null so callers fall back to local TTS instead of throwing
        return null;
      }

      // Handle billing / quota errors explicitly (HTTP 402)
      if (response.status === 402) {
        try {
          Alert.alert(
            "Speech Unavailable",
            "Speech generation failed: ElevenLabs account needs billing or has exhausted credits. Using device TTS fallback.",
          );
        } catch (alertErr) {
          console.warn("Could not show alert for ElevenLabs 402:", alertErr);
        }

        // Return null so callers fall back to local TTS instead of throwing
        return null;
      }

      throw new Error(
        errorData?.message ||
          `ElevenLabs API error: ${response.status} - ${response.statusText}`,
      );
    }

    const payload = await response.json();
    const audioBase64 = payload?.data?.audioBase64;

    if (!audioBase64) {
      throw new Error("ElevenLabs proxy returned no audio data");
    }

    console.log("✅ Audio received from ElevenLabs proxy");
    return `data:audio/mpeg;base64,${audioBase64}`;
  } catch (error) {
    // If backend/proxy surfaced an axios-style error with status info, handle 401/402
    try {
      const status =
        error?.response?.status ||
        (error?.message && /402/.test(error.message) ? 402 : null);
      if (status === 401) {
        try {
          Alert.alert(
            "Speech Unavailable",
            "ElevenLabs API key is invalid or missing required permissions. Using device TTS fallback.",
          );
        } catch (alertErr) {
          console.warn("Could not show alert for ElevenLabs 401:", alertErr);
        }

        console.warn("⚠️ Speech generation unauthorized (401):", error);
        return null;
      }

      if (status === 402) {
        try {
          Alert.alert(
            "Speech Unavailable",
            "Speech generation failed: ElevenLabs account needs billing or has exhausted credits. Using device TTS fallback.",
          );
        } catch (alertErr) {
          console.warn("Could not show alert for ElevenLabs 402:", alertErr);
        }

        console.warn("⚠️ Speech generation payment required (402):", error);
        return null;
      }
    } catch (e) {
      // ignore
    }

    console.error("❌ Speech generation error:", error);
    throw error;
  }
};

// ========================
// CACHING SYSTEM
// ========================

const getCacheKey = (language, sanitizedText) => {
  const desc = sanitizedText || "";
  let hash = 0;
  for (let i = 0; i < desc.length; i++) {
    const char = desc.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // to 32bit int
  }
  const hashStr = Math.abs(hash).toString(36);
  return `${CACHE_KEY_PREFIX}${language}_${hashStr}`;
};

const getCachedAudioPath = async (language, sanitizedText) => {
  try {
    const cacheKey = getCacheKey(language, sanitizedText);

    // Check in-memory cache first
    if (inMemoryAudioCache.has(cacheKey)) {
      console.log("♻️ In-memory cache hit for", cacheKey);
      return inMemoryAudioCache.get(cacheKey);
    }

    // Fallback to AsyncStorage
    const cachedPath = await AsyncStorage.getItem(cacheKey);
    if (cachedPath) {
      console.log("♻️ AsyncStorage cache hit for", cacheKey);
      inMemoryAudioCache.set(cacheKey, cachedPath);
    }
    return cachedPath;
  } catch (error) {
    console.error("Cache retrieval error:", error);
    return null;
  }
};

const setCachedAudioPath = async (language, sanitizedText, audioUri) => {
  try {
    const cacheKey = getCacheKey(language, sanitizedText);

    // Update both in-memory and persistent cache
    inMemoryAudioCache.set(cacheKey, audioUri);
    await AsyncStorage.setItem(cacheKey, audioUri);
    return true;
  } catch (error) {
    console.error("Cache storage error:", error);
    return false;
  }
};

// ========================
// MAIN COMPONENT
// ========================

export default function ScanResult() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const photoUri = params.photoUri;

  // UI State
  const [isSaved, setIsSaved] = useState(false);
  const [language, setLanguage] = useState("en");

  // Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [currentAudioUri, setCurrentAudioUri] = useState(null);

  const [selectedArModelId, setSelectedArModelId] = useState(AR_MODELS[0].id);

  // AI Analysis State
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState(null);

  // Audio Player Reference
  const audioPlayerRef = useRef(null);

  // Run AI Analysis
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

  // Cleanup Audio on Unmount
  useEffect(() => {
    return () => {
      Speech.stop();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.unloadAsync();
      }
    };
  }, []);

  // Extract Descriptions
  const descriptionEn = useMemo(() => {
    return (
      aiResult?.metadata?.description_en ||
      aiResult?.description ||
      aiResult?.recognition?.description ||
      ""
    );
  }, [aiResult]);

  const descriptionAr = useMemo(() => {
    return aiResult?.metadata?.description_ar || "";
  }, [aiResult]);

  // Generate Guide Text
  const guideText = useMemo(() => {
    if (language === "ar") {
      const base = descriptionAr || descriptionEn;
      return base ? generateArabicGuide(base) : "";
    }
    return descriptionEn ? generateEnglishGuide(descriptionEn) : "";
  }, [descriptionEn, descriptionAr, language]);

  // Generate and Play Audio
  const generateAndPlayAudio = async () => {
    if (!guideText) {
      Alert.alert("Error", "No guide text available");
      return;
    }
    // Sanitize and create cache key
    const sanitized = sanitizeTextForTTS(guideText);
    console.log("TTS start: sanitized preview:", sanitized.slice(0, 120));

    const cacheKey = getCacheKey(language, sanitized);

    // Prevent concurrent duplicate calls: reuse in-flight promise
    if (generationPromises.has(cacheKey)) {
      console.log("🔁 Awaiting in-flight generation for", cacheKey);
      try {
        setIsGeneratingAudio(true);
        const audioUri = await generationPromises.get(cacheKey);
        if (audioUri) {
          setCurrentAudioUri(audioUri);
          try {
            router.push(
              `/virtual-guide?audioUrl=${encodeURIComponent(audioUri)}&text=${encodeURIComponent(sanitized)}&language=${encodeURIComponent(language)}`,
            );
          } catch (navErr) {
            console.warn("Could not open virtual guide:", navErr);
          }
        } else {
          // If promise resolved to null/undefined, fallback
          await playWithExpoSpeech(guideText);
        }
      } catch (err) {
        console.error("In-flight generation failed:", err);
        await playWithExpoSpeech(guideText);
      } finally {
        setIsGeneratingAudio(false);
      }

      return;
    }

    // New generation flow
    const generationPromise = (async () => {
      try {
        setIsGeneratingAudio(true);

        // Check cache (in-memory / AsyncStorage)
        const cachedAudioUri = await getCachedAudioPath(language, sanitized);
        if (cachedAudioUri) {
          console.log("♻️ Cache hit before network for", cacheKey);
          return cachedAudioUri;
        }

        // Not cached: call backend ElevenLabs proxy
        console.log("📡 No cache found — calling ElevenLabs for", cacheKey);
        try {
          const audioUriFromServer = await generateSpeechWithElevenLabs(
            sanitized,
            language,
          );

          if (audioUriFromServer) {
            await setCachedAudioPath(language, sanitized, audioUriFromServer);
            console.log("✅ Audio cached successfully for", cacheKey);
            return audioUriFromServer;
          }
          return null;
        } catch (elevenLabsError) {
          console.warn("⚠️ ElevenLabs generation failed:", elevenLabsError);
          // Do not retry on 401 — backend should surface that
          return null;
        }
      } finally {
        setIsGeneratingAudio(false);
      }
    })();

    generationPromises.set(cacheKey, generationPromise);

    try {
      const audioUri = await generationPromise;
      if (audioUri) {
        setCurrentAudioUri(audioUri);
        try {
          router.push(
            `/virtual-guide?audioUrl=${encodeURIComponent(audioUri)}&text=${encodeURIComponent(sanitized)}&language=${encodeURIComponent(language)}`,
          );
        } catch (navErr) {
          console.warn("Could not open virtual guide:", navErr);
        }
      } else {
        // Fallback to local TTS
        Alert.alert(
          "Voice Fallback",
          "Using local voice as ElevenLabs generation failed or is unavailable.",
        );
        await playWithExpoSpeech(guideText);
      }
    } catch (error) {
      console.error("❌ Audio generation error:", error);
      Alert.alert(
        "Audio Error",
        error?.message || "Could not generate guide audio",
      );
      await playWithExpoSpeech(guideText);
    } finally {
      generationPromises.delete(cacheKey);
      setIsGeneratingAudio(false);
    }
  };

  // Play Audio Function
  const playAudio = async (audioUri) => {
    try {
      if (audioPlayerRef.current) {
        await audioPlayerRef.current.stopAsync();
        await audioPlayerRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
      );

      audioPlayerRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlayingAudio(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlayingAudio(false);
          }
        }
      });
    } catch (error) {
      console.error("Playback error:", error);
      Alert.alert("Playback Error", "Could not play audio");
    }
  };

  // Stop Audio
  const stopAudio = async () => {
    try {
      // Stop ElevenLabs audio
      if (audioPlayerRef.current) {
        await audioPlayerRef.current.stopAsync();
      }
      // Stop expo-speech audio
      await Speech.stop();
      setIsPlayingAudio(false);
    } catch (error) {
      console.error("Stop audio error:", error);
    }
  };

  // Fallback: Play with expo-speech
  const playWithExpoSpeech = async (text) => {
    try {
      console.log("🎤 Using expo-speech fallback...");
      setIsPlayingAudio(true);

      await Speech.stop();

      const languageCode = language === "ar" ? "ar-EG" : "en-US";

      await Speech.speak(text, {
        language: languageCode,
        rate: 0.75,
        pitch: 1.0,
        volume: 1.0,
        onDone: () => setIsPlayingAudio(false),
        onStopped: () => setIsPlayingAudio(false),
        onError: (error) => {
          console.error("expo-speech error:", error);
          setIsPlayingAudio(false);
        },
      });
    } catch (error) {
      console.error("❌ Fallback speech error:", error);
      setIsPlayingAudio(false);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Handle Language Toggle
  const handleLanguageToggle = async () => {
    const newLanguage = language === "en" ? "ar" : "en";
    setLanguage(newLanguage);

    // Stop current audio and generate new one
    await stopAudio();

    // The useEffect above will trigger audio generation with new language
  };

  // Handle Back
  const handleBack = () => {
    router.push("/scan");
  };

  // Handle Save
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

  // Handle Share
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

  // Handle Add to Journey
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

  // Memoized Values
  const artifactTitle = useMemo(() => {
    return (
      aiResult?.metadata?.name ||
      aiResult?.recognition?.artifact_name ||
      "Artifact"
    );
  }, [aiResult]);

  const confidenceText = useMemo(() => {
    const value = aiResult?.recognition?.confidence;
    if (typeof value !== "number") return null;
    return `${(value * 100).toFixed(1)}%`;
  }, [aiResult]);

  const sketchfabUrl = useMemo(() => {
    if (!artifactTitle) return null;
    const exactMatch = artifactModels[artifactTitle];
    if (exactMatch) return exactMatch;

    // Fallback: try finding a key that is a substring
    const titleLower = artifactTitle.toLowerCase();
    for (const key of Object.keys(artifactModels)) {
      if (
        titleLower.includes(key.toLowerCase()) ||
        key.toLowerCase().includes(titleLower)
      ) {
        return artifactModels[key];
      }
    }
    return null;
  }, [artifactTitle]);

  const modelType = useMemo(() => {
    if (!aiResult) return null;
    const name = artifactTitle.toLowerCase();
    if (
      name.includes("tutankhamun") ||
      name.includes("mask") ||
      name.includes("king")
    )
      return "king_tut";
    if (name.includes("anubis")) return "anubis";
    return "king_tut"; // Default for demonstration
  }, [aiResult, artifactTitle]);

  const selectedArModel = useMemo(() => {
    return (
      AR_MODELS.find((model) => model.id === selectedArModelId) || AR_MODELS[0]
    );
  }, [selectedArModelId]);

  const suggestedArModel = useMemo(
    () => getSuggestedArModel(artifactTitle),
    [artifactTitle],
  );

  useEffect(() => {
    if (suggestedArModel?.id) {
      setSelectedArModelId(suggestedArModel.id);
    }
  }, [suggestedArModel?.id]);

  const handleStartArExperience = () => {
    router.push({
      pathname: "/ar-viewer",
      params: {
        modelId: selectedArModel.id,
      },
    });
  };

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
            <AntDesign name="left" size={24} color="#5A4A3F" />
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

          <View style={styles.aiCard}>
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

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleSave}
                  >
                    <View
                      style={[styles.actionIcon, isSaved && styles.savedIcon]}
                    >
                      <Image
                        source={require("../../assets/images/save.png")}
                        style={[
                          styles.iconImage,
                          isSaved && styles.savedIconImage,
                        ]}
                      />
                    </View>
                    <Text style={styles.actionLabel}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleShare}
                  >
                    <View style={styles.actionIcon}>
                      <Entypo name="share" size={26} color="#000" />
                    </View>
                    <Text style={styles.actionLabel}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleAddToJourney}
                  >
                    <View style={styles.actionIcon}>
                      <AntDesign name="plus" size={26} color="#000" />
                    </View>
                    <Text style={styles.actionLabel}>Add to Journey</Text>
                  </TouchableOpacity>
                </View>

                {descriptionEn ? (
                  <View style={styles.descriptionBlock}>
                    <Text style={styles.virtualTourLabel}>Description</Text>
                    <Text style={styles.descriptionText}>{descriptionEn}</Text>
                  </View>
                ) : null}

                <View style={styles.metricsList}>
                  <View style={styles.metricRow}>
                    <View style={styles.metricIconCircleSmall}>
                      <MaterialCommunityIcons
                        name="shape-outline"
                        size={16}
                        color="#D4AF37"
                      />
                    </View>
                    <Text style={styles.metricLabelSmall}>Type:</Text>
                    <Text style={styles.metricValueSmall}>
                      {aiResult?.metadata?.artifact_type ||
                        aiResult?.recognition?.artifact_type ||
                        "Unknown"}
                    </Text>
                  </View>

                  <View style={styles.metricRow}>
                    <View style={styles.metricIconCircleSmall}>
                      <MaterialCommunityIcons
                        name="bank-outline"
                        size={16}
                        color="#D4AF37"
                      />
                    </View>
                    <Text style={styles.metricLabelSmall}>Museum:</Text>
                    <Text style={styles.metricValueSmall}>
                      {aiResult?.metadata?.museum || "Unknown"}
                    </Text>
                  </View>

                  <View style={styles.metricRow}>
                    <View style={styles.metricIconCircleSmall}>
                      <MaterialCommunityIcons
                        name="texture"
                        size={16}
                        color="#D4AF37"
                      />
                    </View>
                    <Text style={styles.metricLabelSmall}>Material:</Text>
                    <Text style={styles.metricValueSmall}>
                      {aiResult?.metadata?.material || "Unknown"}
                    </Text>
                  </View>
                </View>

                <View style={styles.virtualTourSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.virtualTourLabel}>
                      Experience in 3D
                    </Text>
                    <View style={styles.languageToggleContainerSmall}>
                      <TouchableOpacity
                        style={[
                          styles.langBtn,
                          language === "en" && styles.langBtnActive,
                        ]}
                        onPress={handleLanguageToggle}
                      >
                        <Text
                          style={[
                            styles.langBtnText,
                            language === "en" && styles.langBtnTextActive,
                          ]}
                        >
                          EN
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.langBtn,
                          language === "ar" && styles.langBtnActive,
                        ]}
                        onPress={handleLanguageToggle}
                      >
                        <Text
                          style={[
                            styles.langBtnText,
                            language === "ar" && styles.langBtnTextActive,
                          ]}
                        >
                          AR
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.virtualTourCard}
                    onPress={generateAndPlayAudio}
                    disabled={isGeneratingAudio}
                  >
                    <View style={styles.virtualTourContent}>
                      <View style={styles.virtualTourIconContainer}>
                        <Image
                          source={require("../../assets/images/tour-guide-icon.png")}
                          style={styles.virtualTourIcon}
                        />
                      </View>
                      <View style={styles.virtualTourTextContainer}>
                        <Text style={styles.virtualTourTitle}>
                          Talk to Nawwar (نَوَّار)
                        </Text>
                        <Text style={styles.virtualTourSubtitle}>
                          Nawwar will guide you through the history
                        </Text>
                      </View>
                      {isGeneratingAudio ? (
                        <ActivityIndicator size="small" color="#8B7B6C" />
                      ) : (
                        <AntDesign name="right" size={20} color="#8B7B6C" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {sketchfabUrl ? (
                    <TouchableOpacity
                      style={[styles.virtualTourCard, { marginTop: 12 }]}
                      onPress={() =>
                        router.push(
                          `/model-viewer?url=${encodeURIComponent(sketchfabUrl)}`,
                        )
                      }
                    >
                      <View style={styles.virtualTourContent}>
                        <View style={styles.virtualTourIconContainer}>
                          <MaterialCommunityIcons
                            name="cube-scan"
                            size={28}
                            color="#D4AF37"
                          />
                        </View>
                        <View style={styles.virtualTourTextContainer}>
                          <Text style={styles.virtualTourTitle}>
                            View 3D Model
                          </Text>
                          <Text style={styles.virtualTourSubtitle}>
                            Interact with the artifact in 3D
                          </Text>
                        </View>
                        <AntDesign name="right" size={20} color="#8B7B6C" />
                      </View>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={styles.arSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.arSectionTitle}>AR Souvenir Mode</Text>
                    <View style={styles.arBadge}>
                      <MaterialCommunityIcons
                        name="camera-iris"
                        size={14}
                        color="#2B1D12"
                      />
                      <Text style={styles.arBadgeText}>Web AR</Text>
                    </View>
                  </View>

                  <Text style={styles.arSectionSubtitle}>
                    Place a 3D Egyptian artifact in your real space and take a
                    souvenir selfie.
                  </Text>

                  <View style={styles.arPreviewCard}>
                    <Text style={styles.arPreviewEyebrow}>Selected model</Text>
                    <Text style={styles.arPreviewTitle}>
                      {selectedArModel.title}
                    </Text>
                    <Text style={styles.arPreviewDescription}>
                      {selectedArModel.subtitle}
                    </Text>
                    <Text style={styles.arPreviewHint}>
                      Move your phone to find a surface
                    </Text>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.arModelRow}
                  >
                    {AR_MODELS.map((model) => {
                      const isActive = model.id === selectedArModelId;
                      return (
                        <TouchableOpacity
                          key={model.id}
                          style={[
                            styles.arModelCard,
                            isActive && styles.arModelCardActive,
                            isActive && { borderColor: model.accent },
                          ]}
                          activeOpacity={0.85}
                          onPress={() => setSelectedArModelId(model.id)}
                        >
                          <View
                            style={[
                              styles.arModelDot,
                              { backgroundColor: model.accent },
                            ]}
                          />
                          <Text
                            style={[
                              styles.arModelName,
                              isActive && { color: model.accent },
                            ]}
                          >
                            {model.name}
                          </Text>
                          <Text
                            style={styles.arModelSubtitle}
                            numberOfLines={2}
                          >
                            {model.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <TouchableOpacity
                    style={styles.arStartButton}
                    onPress={handleStartArExperience}
                  >
                    <MaterialCommunityIcons
                      name="cube-scan"
                      size={20}
                      color="#2B1D12"
                    />
                    <Text style={styles.arStartButtonText}>
                      Start AR Experience
                    </Text>
                  </TouchableOpacity>
                </View>

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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
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
    color: "#644b2f",
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
    width: "100%",
    height: 420,
    justifyContent: "center",
    alignItems: "center",
  },
  artifactImage: {
    width: width - 40,
    height: 380,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#1a2332",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.3)", // Subtle gold border
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
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 25,
  },
  actionButton: {
    alignItems: "center",
    gap: 12,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFDF8",
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  savedIcon: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  iconImage: {
    width: 26,
    height: 26,
    tintColor: "#000",
  },
  savedIconImage: {
    tintColor: "#FFFDF8",
  },
  actionLabel: {
    fontSize: 13,
    color: "#6B5B4F",
    fontWeight: "700",
    marginTop: 4,
  },
  aiCard: {
    width: width,
    backgroundColor: "#FFFDF8",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -40,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 10,
    minHeight: "60%",
  },
  virtualTourSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  virtualTourLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B5B4F",
  },
  languageToggleContainerSmall: {
    flexDirection: "row",
    backgroundColor: "rgba(139, 123, 108, 0.1)",
    borderRadius: 8,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  langBtnActive: {
    backgroundColor: "#5A4A3F",
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8B7B6C",
  },
  langBtnTextActive: {
    color: "#FFF6E6",
  },
  virtualTourCard: {
    backgroundColor: "#FFFDF8",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 123, 108, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  virtualTourContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  virtualTourIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  virtualTourIcon: {
    width: 30,
    height: 30,
    tintColor: "#D4AF37",
  },
  virtualTourTextContainer: {
    flex: 1,
  },
  virtualTourTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#3F342D",
    marginBottom: 2,
  },
  virtualTourSubtitle: {
    fontSize: 13,
    color: "#8B7B6C",
    fontWeight: "500",
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
    fontSize: 26,
    fontWeight: "800",
    color: "#5A4A3F",
    marginBottom: 15,
    textAlign: "center",
  },
  metricsList: {
    marginTop: 5,
    marginBottom: 20,
    gap: 8,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDF8",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(139, 123, 108, 0.1)",
  },
  metricIconCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  metricLabelSmall: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8B7B6C",
    width: 70,
  },
  metricValueSmall: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#3F342D",
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
    marginTop: 12,
  },
  modelSection: {
    marginTop: 18,
  },
  arSection: {
    marginTop: 18,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "rgba(26, 19, 12, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.18)",
  },
  arSectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F5E8CB",
  },
  arSectionSubtitle: {
    marginTop: 8,
    color: "#D9C5A5",
    fontSize: 14,
    lineHeight: 20,
  },
  arBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#D4AF37",
  },
  arBadgeText: {
    color: "#2B1D12",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  arPreviewCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255, 248, 233, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.14)",
  },
  arPreviewEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D4AF37",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  arPreviewTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFF4DC",
    marginBottom: 5,
  },
  arPreviewDescription: {
    fontSize: 13,
    color: "#EAD9B8",
    lineHeight: 19,
  },
  arPreviewHint: {
    marginTop: 10,
    fontSize: 12,
    color: "#CBAA73",
    fontWeight: "700",
  },
  arModelRow: {
    gap: 10,
    paddingTop: 14,
    paddingBottom: 10,
  },
  arModelCard: {
    width: 160,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255, 248, 233, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 248, 233, 0.08)",
  },
  arModelCardActive: {
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1.5,
  },
  arModelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  arModelName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#F5E8CB",
    marginBottom: 4,
  },
  arModelSubtitle: {
    fontSize: 12,
    color: "#CDB9A4",
    lineHeight: 17,
  },
  arStartButton: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 18,
  },
  arStartButtonText: {
    color: "#2B1D12",
    fontSize: 16,
    fontWeight: "900",
  },
  webviewContainer: {
    width: "100%",
    height: 300,
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 12,
  },
  webview: {
    flex: 1,
  },
});
