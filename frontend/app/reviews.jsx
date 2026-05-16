import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "./api/client";
import SelfieArModal from "../src/components/SelfieArModal";
import AR_MODELS, { getSuggestedArModel } from "../src/data/arModels";

export default function Reviews() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawMuseumId = params.museumId;
  const museumId =
    typeof rawMuseumId === "string" && /^[a-f\d]{24}$/i.test(rawMuseumId)
      ? rawMuseumId
      : undefined;

  const museumName = params.museumName;
  const museumLookupName = params.museumLookupName;
  const artifactTitle =
    (typeof params.artifactTitle === "string" && params.artifactTitle) ||
    (typeof params.artifactName === "string" && params.artifactName) ||
    (typeof params.selectedArtifactTitle === "string" &&
      params.selectedArtifactTitle) ||
    "";
  const incomingModelId =
    (typeof params.modelId === "string" && params.modelId) ||
    (typeof params.selectedArModelId === "string" &&
      params.selectedArModelId) ||
    "";
  const suggestedModel = getSuggestedArModel(artifactTitle || museumName || "");
  const initialSelfieModelId = incomingModelId || suggestedModel.id;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selfieModalVisible, setSelfieModalVisible] = useState(false);
  const [selfieModelId, setSelfieModelId] = useState(initialSelfieModelId);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/home");
  };

  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const query = {
          ...(museumId ? { museumId } : {}),
          ...(museumName ? { museumName } : {}),
          ...(museumLookupName ? { museumLookupName } : {}),
        };

        const result = await api.getReviews(
          Object.keys(query).length > 0 ? query : {},
        );
        const list = result?.data || [];
        if (isMounted) {
          setReviews(list);
        }
      } catch (err) {
        console.error("Failed to load reviews", err);
        if (isMounted) {
          setError(err?.message || "Failed to load reviews");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [museumId, museumName, museumLookupName]);

  useEffect(() => {
    setSelfieModelId(initialSelfieModelId);
  }, [initialSelfieModelId]);

  const selectedSelfieModel =
    AR_MODELS.find((model) => model.id === selfieModelId) || AR_MODELS[0];

  const showSelector = !incomingModelId && !artifactTitle;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {museumName ? `${museumName} Reviews` : "Reviews"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.souvenirCard}>
          <Text style={styles.sectionEyebrow}>AR Souvenir Photo</Text>
          <Text style={styles.souvenirTitle}>
            Take a Selfie with This Artifact
          </Text>
          <Text style={styles.souvenirText}>
            Move and resize the artifact, then capture your souvenir.
          </Text>

          <TouchableOpacity
            style={styles.souvenirButton}
            onPress={() => setSelfieModalVisible(true)}
          >
            <Text style={styles.souvenirButtonText}>
              Take a Selfie with This Artifact
            </Text>
          </TouchableOpacity>

          <View style={styles.currentModelPill}>
            <Text style={styles.currentModelLabel}>Using</Text>
            <Text style={styles.currentModelValue}>
              {selectedSelfieModel.title}
            </Text>
          </View>

          {showSelector && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectorRow}
            >
              {AR_MODELS.map((model) => {
                const isActive = model.id === selfieModelId;
                return (
                  <TouchableOpacity
                    key={model.id}
                    style={[
                      styles.selectorCard,
                      isActive && styles.selectorCardActive,
                      isActive && { borderColor: model.accent },
                    ]}
                    onPress={() => setSelfieModelId(model.id)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.selectorDot,
                        { backgroundColor: model.accent },
                      ]}
                    />
                    <Text
                      style={[
                        styles.selectorName,
                        isActive && { color: model.accent },
                      ]}
                    >
                      {model.name}
                    </Text>
                    <Text style={styles.selectorSubtitle} numberOfLines={2}>
                      {model.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}

        {!loading && error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && reviews.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No reviews yet. Be the first to write one!
            </Text>
          </View>
        )}

        {/* Reviews List */}
        {!loading &&
          !error &&
          reviews.map((review, index) => (
            <View key={review._id || index}>
              <View style={styles.reviewCard}>
                {/* Avatar and Name */}
                <View style={styles.reviewHeader}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>👤</Text>
                    </View>
                    <Text style={styles.reviewerName}>
                      {review.user?.name || "Visitor"}
                    </Text>
                  </View>
                  {/* Stars */}
                  <Text style={styles.stars}>
                    {renderStars(review.rating || 0)}
                  </Text>
                </View>

                {/* Comment */}
                <Text style={styles.comment}>{review.comment}</Text>
              </View>

              {/* Divider - Don't show after last item */}
              {index < reviews.length - 1 && <View style={styles.divider} />}
            </View>
          ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <SelfieArModal
        visible={selfieModalVisible}
        onClose={() => setSelfieModalVisible(false)}
        artifactTitle={artifactTitle || museumName || ""}
        initialModelId={selfieModelId}
        onSaved={(savedUri) => {
          console.log("Selfie souvenir saved:", savedUri);
        }}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          router.push({
            pathname: "/write-review",
            params: { museumId, museumName, museumLookupName },
          })
        }
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8DDD0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 75,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#E8DDD0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: "#000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  souvenirCard: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.22)",
  },
  sectionEyebrow: {
    color: "#D4AF37",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 8,
  },
  souvenirTitle: {
    color: "#201813",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  souvenirText: {
    color: "#5A4A3F",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  souvenirButton: {
    borderRadius: 16,
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  souvenirButtonText: {
    color: "#FFF4DC",
    fontSize: 15,
    fontWeight: "800",
  },
  currentModelPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    paddingBottom: 8,
  },
  currentModelLabel: {
    color: "#7C6757",
    fontSize: 12,
    fontWeight: "700",
  },
  currentModelValue: {
    color: "#201813",
    fontSize: 13,
    fontWeight: "800",
  },
  selectorRow: {
    gap: 10,
    paddingTop: 8,
    paddingBottom: 4,
  },
  selectorCard: {
    width: 130,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "rgba(255,255,255,0.64)",
  },
  selectorCardActive: {
    backgroundColor: "rgba(212,175,55,0.16)",
  },
  selectorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  selectorName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#201813",
    marginBottom: 4,
  },
  selectorSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: "#5A4A3F",
  },
  reviewCard: {
    paddingVertical: 15,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  stars: {
    fontSize: 16,
  },
  comment: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginLeft: 50,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 5,
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "300",
  },
});
