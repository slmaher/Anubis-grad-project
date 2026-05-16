import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { api } from "./api/client";
import { getAuthToken } from "./api/authStorage";
import SelfieArModal from "../src/components/SelfieArModal";
import AR_MODELS, { getSuggestedArModel } from "../src/data/arModels";

export default function WriteReview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const museumId = params.museumId;
  const museumName = params.museumName || "Grand Egyptian Museum";
  const museumLookupName = params.museumLookupName;
  const [overallRating, setOverallRating] = useState(0);
  const [recommend, setRecommend] = useState(false);
  const [easeRating, setEaseRating] = useState(0);
  const [facilitiesRating, setFacilitiesRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [title, setTitle] = useState("");
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const suggestedModel = getSuggestedArModel(museumName || "");
  const [selfieModalVisible, setSelfieModalVisible] = useState(false);
  const [selfieModelId, setSelfieModelId] = useState(suggestedModel.id);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/home");
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      setPhotos([...photos, ...result.assets.map((a) => a.uri)]);
    }
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      Alert.alert("Rating Required", "Please select an overall rating");
      return;
    }

    if (!museumId && !museumName && !museumLookupName) {
      Alert.alert(
        "Missing museum",
        "We couldn't identify which museum you're reviewing. Please go back and try again.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const token = await getAuthToken();
      if (!token) {
        Alert.alert(
          "Login required",
          "Please log in before submitting a review.",
          [
            {
              text: "Go to Login",
              onPress: () => router.replace("/auth/login"),
            },
            { text: "Cancel", style: "cancel" },
          ],
        );
        return;
      }

      const payload = {
        museum: museumId,
        museumName,
        museumLookupName,
        rating: overallRating,
        comment: reviewText || title || undefined,
      };

      await api.createReview(payload, token);
      router.replace("/review-success");
    } catch (error) {
      console.error("Failed to submit review", error);
      Alert.alert(
        "Submission failed",
        error?.message || "Unable to submit your review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRate, size = 40 }) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRate(star)}>
          <Text style={[styles.starIcon, { fontSize: size }]}>
            {star <= rating ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const AspectRating = ({ label, rating, onRate }) => (
    <View style={styles.aspectContainer}>
      <Text style={styles.aspectLabel}>{label}</Text>
      <View style={styles.aspectNumbers}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.numberButton,
              rating === num && styles.numberButtonActive,
            ]}
            onPress={() => onRate(num)}
          >
            <Text
              style={[
                styles.numberText,
                rating === num && styles.numberTextActive,
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.aspectLabels}>
        <Text style={styles.aspectLabelText}>Bad</Text>
        <Text style={styles.aspectLabelText}>Poor</Text>
        <Text style={styles.aspectLabelText}>Average</Text>
        <Text style={styles.aspectLabelText}>Good</Text>
        <Text style={styles.aspectLabelText}>Amazing</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews and Ratings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Museum Card */}
        <View style={styles.museumCard}>
          <Image
            source={require("../assets/images/grand-museum.png")}
            style={styles.museumThumb}
            resizeMode="cover"
          />
          <View style={styles.museumInfo}>
            <Text style={styles.museumName}>{museumName}</Text>
            <Text style={styles.museumLocation}>Cairo, Egypt</Text>
          </View>
        </View>

        {/* Overall Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How was the trip?</Text>
          <StarRating
            rating={overallRating}
            onRate={setOverallRating}
            size={44}
          />
          <Text style={styles.ratingLabel}>
            {overallRating === 5
              ? "Amazing! Can't get any better than that!"
              : overallRating === 4
                ? "Good! Really enjoyed it!"
                : overallRating === 3
                  ? "Average. It was okay!"
                  : overallRating === 2
                    ? "Poor. Could have been better."
                    : overallRating === 1
                      ? "Bad. Not recommended."
                      : "Tap a star to rate"}
          </Text>

          {/* Recommend */}
          <TouchableOpacity
            style={styles.recommendRow}
            onPress={() => setRecommend(!recommend)}
          >
            <View style={[styles.checkbox, recommend && styles.checkboxActive]}>
              {recommend && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.recommendText}>
              I recommend this attraction
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Aspect Ratings */}
        <View style={styles.section}>
          <Text style={styles.sectionSubTitle}>
            How would you rate the following aspects?
          </Text>
          <AspectRating
            label="Ease of access"
            rating={easeRating}
            onRate={setEaseRating}
          />
          <AspectRating
            label="Facilities"
            rating={facilitiesRating}
            onRate={setFacilitiesRating}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Write Review */}
        <View style={styles.section}>
          <Text style={styles.sectionSubTitle}>Write your review</Text>
          <TextInput
            style={styles.reviewInput}
            multiline
            numberOfLines={5}
            placeholder="Review"
            placeholderTextColor="#999"
            value={reviewText}
            onChangeText={setReviewText}
            textAlignVertical="top"
          />
        </View>

        {/* Summarize */}
        <View style={styles.section}>
          <Text style={styles.sectionSubTitle}>
            Summarize your visit in a few words
          </Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionSubTitle}>
            Share some photos of your visit
          </Text>
          <View style={styles.photosRow}>
            {photos.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={styles.photoThumb}
                resizeMode="cover"
              />
            ))}
            {photos.length < 4 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={handlePickPhoto}
              >
                <Text style={styles.addPhotoIcon}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* AR Souvenir (moved here) */}
        <View style={styles.souvenirCard}>
          <Text style={styles.sectionEyebrow}>AR Souvenir Photo</Text>
          <Text style={styles.souvenirTitle}>Create a souvenir selfie</Text>
          <Text style={styles.souvenirText}>
            Place the artifact in front of your camera, adjust size and
            position, then capture a keepsake photo saved to your gallery.
          </Text>

          <TouchableOpacity
            style={styles.souvenirButton}
            onPress={() => setSelfieModalVisible(true)}
          >
            <Text style={styles.souvenirButtonText}>Open Selfie AR</Text>
          </TouchableOpacity>

          <View style={styles.currentModelPill}>
            <Text style={styles.currentModelLabel}>Model</Text>
            <Text style={styles.currentModelValue}>
              {AR_MODELS.find((m) => m.id === selfieModelId)?.title || "Model"}
            </Text>
          </View>

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
                    style={[styles.selectorDot, { backgroundColor: model.accent }]}
                  />
                  <Text style={[styles.selectorName, isActive && { color: model.accent }]}>
                    {model.name}
                  </Text>
                  <Text style={styles.selectorSubtitle} numberOfLines={2}>
                    {model.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {submitting ? "Submitting..." : "Submit your Review"}
          </Text>
        </TouchableOpacity>

        <SelfieArModal
          visible={selfieModalVisible}
          onClose={() => setSelfieModalVisible(false)}
          artifactTitle={museumName || ""}
          initialModelId={selfieModelId}
          onSaved={(savedUri) => {
            console.log("Selfie souvenir saved:", savedUri);
            // optionally add saved image to photos array
          }}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#E8DDD0",
    borderBottomWidth: 1,
    borderBottomColor: "#E8DDD0",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8DDD0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  museumCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    gap: 12,
  },
  museumThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  museumInfo: {
    flex: 1,
  },
  museumName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  museumLocation: {
    fontSize: 13,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 16,
  },
  sectionSubTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 14,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  starIcon: {
    color: "#fff",
  },
  ratingLabel: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  recommendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CCC",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxActive: {
    backgroundColor: "#E8DDD0",
    borderColor: "#E8DDD0",
  },
  checkmark: {
    fontSize: 14,
    color: "#000",
    fontWeight: "bold",
  },
  recommendText: {
    fontSize: 14,
    color: "#000",
  },
  divider: {
    height: 1,
    backgroundColor: "#E8DDD0",
    marginBottom: 24,
  },
  aspectContainer: {
    marginBottom: 20,
  },
  aspectLabel: {
    fontSize: 15,
    color: "#000",
    marginBottom: 12,
  },
  aspectNumbers: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  numberButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  numberButtonActive: {
    backgroundColor: "#E8DDD0",
    borderColor: "#fff",
  },
  numberText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  numberTextActive: {
    color: "#000",
    fontWeight: "700",
  },
  aspectLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  aspectLabelText: {
    fontSize: 11,
    color: "#999",
    width: 48,
    textAlign: "center",
  },
  reviewInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: "#000",
    minHeight: 130,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    lineHeight: 22,
  },
  titleInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  photosRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photoThumb: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  addPhotoButton: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoIcon: {
    fontSize: 30,
    color: "#999",
  },
  souvenirCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.14)",
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
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  souvenirText: {
    color: "#5A4A3F",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  souvenirButton: {
    borderRadius: 14,
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
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
    paddingTop: 8,
    paddingBottom: 6,
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
    backgroundColor: "rgba(255,255,255,0.88)",
  },
  selectorCardActive: {
    backgroundColor: "rgba(212,175,55,0.12)",
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
  submitButton: {
    backgroundColor: "#000",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
