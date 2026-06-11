import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AR_MODELS from "../data/arModels";

export default function ArSouvenirSection({
  selectedArModelId,
  onSelectModelId,
  onStartArExperience,
  onTakeSelfie,
  style,
}) {
  const selectedArModel = useMemo(
    () =>
      AR_MODELS.find((model) => model.id === selectedArModelId) || AR_MODELS[0],
    [selectedArModelId],
  );

  return (
    <View style={[styles.arSection, style]}>
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
        Place a 3D Egyptian artifact in your real space and take a souvenir
        selfie.
      </Text>

      <View style={styles.arPreviewCard}>
        <Text style={styles.arPreviewEyebrow}>Selected model</Text>
        <Text style={styles.arPreviewTitle}>{selectedArModel.title}</Text>
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
              onPress={() => onSelectModelId(model.id)}
            >
              <View
                style={[styles.arModelDot, { backgroundColor: model.accent }]}
              />
              <Text
                style={[
                  styles.arModelName,
                  isActive && { color: model.accent },
                ]}
              >
                {model.name}
              </Text>
              <Text style={styles.arModelSubtitle} numberOfLines={2}>
                {model.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.arStartButton}
        onPress={onStartArExperience}
      >
        <MaterialCommunityIcons name="cube-scan" size={20} color="#2B1D12" />
        <Text style={styles.arStartButtonText}>Start AR Experience</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.arSelfieButton} onPress={onTakeSelfie}>
        <MaterialCommunityIcons name="camera-iris" size={20} color="#D4AF37" />
        <Text style={styles.arSelfieButtonText}>Take AR Selfie</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  arSection: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: "rgba(26, 19, 12, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.18)",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  arSectionTitle: {
    flex: 1,
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
  arSelfieButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },
  arSelfieButtonText: {
    color: "#F5E8CB",
    fontSize: 15,
    fontWeight: "800",
  },
});
