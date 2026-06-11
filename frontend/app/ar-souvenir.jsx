import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import AR_MODELS from "../src/data/arModels";
import ArSouvenirSection from "../src/components/ArSouvenirSection";
import SelfieArModal from "../src/components/SelfieArModal";

export default function ArSouvenirScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedArModelId, setSelectedArModelId] = useState(AR_MODELS[0].id);
  const [selfieModalVisible, setSelfieModalVisible] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/home");
  };

  const handleStartArExperience = () => {
    router.push(`/ar-viewer?modelId=${encodeURIComponent(selectedArModelId)}`);
  };

  return (
    <ImageBackground
      source={require("../assets/images/beige-background.jpeg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <AntDesign name="left" size={24} color="#5A4A3F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("menu.ar_souvenir")}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons
                name="cube-scan"
                size={16}
                color="#D4AF37"
              />
              <Text style={styles.heroBadgeText}>AR Souvenir Mode</Text>
            </View>
            <Text style={styles.heroTitle}>
              Place Egyptian artifacts in your space
            </Text>
            <Text style={styles.heroSubtitle}>
              Choose a 3D model, launch Web AR, or take a souvenir selfie with
              the artifact in front of your camera.
            </Text>
          </View>

          <ArSouvenirSection
            selectedArModelId={selectedArModelId}
            onSelectModelId={setSelectedArModelId}
            onStartArExperience={handleStartArExperience}
            onTakeSelfie={() => setSelfieModalVisible(true)}
          />
        </ScrollView>
      </View>

      <SelfieArModal
        visible={selfieModalVisible}
        onClose={() => setSelfieModalVisible(false)}
        initialModelId={selectedArModelId}
      />
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5A4A3F",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 18,
  },
  heroCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(26, 19, 12, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.28)",
    marginBottom: 12,
  },
  heroBadgeText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: "#F5E8CB",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "#D9C5A5",
    fontSize: 14,
    lineHeight: 21,
  },
});
