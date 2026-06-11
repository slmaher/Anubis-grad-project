import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "./api/client";
import SelfieArModal from "../src/components/SelfieArModal";
import { getSuggestedArModel } from "../src/data/arModels";

const DEFAULT_AVATAR = require("../assets/images/profile-you.png");

export default function Reviews() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const rawMuseumId = params.museumId;
  const museumId =
    typeof rawMuseumId === "string" && /^[a-f\d]{24}$/i.test(rawMuseumId)
      ? rawMuseumId
      : undefined;

  const museumName = params.museumName;
  const museumLookupName = params.museumLookupName;
  const isCompact = width < 380;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selfieModalVisible, setSelfieModalVisible] = useState(false);
  const suggestedArModel = getSuggestedArModel(
    typeof museumName === "string" ? museumName : "",
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/home");
  };

  const renderStars = (rating, size = 18) => {
    const value = Number(rating) || 0;
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialCommunityIcons
            key={star}
            name={star <= value ? "star" : "star-outline"}
            size={size}
            color="#C48A24"
          />
        ))}
      </View>
    );
  };

  const getUserId = (review) => {
    const user = review?.user;
    return typeof user === "string" ? user : user?._id || user?.id;
  };

  const openUserProfile = (review) => {
    const userId = getUserId(review);
    if (!userId) return;
    router.push({ pathname: "/user/[id]", params: { id: userId } });
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getReviewImages = (review) => {
    const rawImages = [
      ...(Array.isArray(review?.images) ? review.images : []),
      review?.image,
      review?.imageUrl,
      review?.photo,
      review?.photoUrl,
    ];

    return rawImages
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.secure_url || item?.url || item?.uri;
      })
      .filter((uri) => typeof uri === "string" && uri.trim())
      .map((uri) => uri.trim());
  };

  const hasExtraDetails = (review) =>
    review?.recommend || review?.easeRating || review?.facilitiesRating;

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {museumName ? `${museumName} Reviews` : "Reviews"}
          </Text>
          <TouchableOpacity
            style={styles.selfieQuickButton}
            onPress={() => setSelfieModalVisible(true)}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons
              name="camera-iris"
              size={14}
              color="#FFF4DC"
            />
            <Text style={styles.selfieQuickButtonText}>Take Selfie</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}

        {!loading && error && (
          <View style={styles.stateContainer}>
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

        {!loading &&
          !error &&
          reviews.map((review, index) => {
            const reviewImages = getReviewImages(review);

            return (
              <View key={review._id || index}>
                <View style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <TouchableOpacity
                      style={styles.avatarContainer}
                      onPress={() => openUserProfile(review)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={
                          review.user?.avatar
                            ? { uri: review.user.avatar }
                            : DEFAULT_AVATAR
                        }
                        style={styles.avatar}
                      />
                      <View style={styles.reviewerMeta}>
                        <Text style={styles.reviewerName}>
                          {review.user?.name || "Visitor"}
                        </Text>
                        <Text style={styles.reviewDate}>
                          {formatDate(review.createdAt) || "Submitted review"}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.ratingBlock}>
                      {renderStars(review.rating || 0, 17)}
                      <Text style={styles.ratingText}>{review.rating || 0}/5</Text>
                    </View>
                  </View>

                  <View style={styles.museumRow}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={16}
                      color="#7B6253"
                    />
                    <Text style={styles.museumText}>
                      {review.museum?.name || museumName || "Museum"}
                      {review.museum?.city ? `, ${review.museum.city}` : ""}
                    </Text>
                  </View>

                  {review.title ? (
                    <Text style={styles.reviewTitle}>{review.title}</Text>
                  ) : null}

                  {review.comment ? (
                    <Text style={styles.comment}>{review.comment}</Text>
                  ) : (
                    <Text style={styles.commentMuted}>No written comment added.</Text>
                  )}

                  {hasExtraDetails(review) && (
                    <View style={styles.detailGrid}>
                      {review.recommend ? (
                        <View style={styles.detailPill}>
                          <MaterialCommunityIcons
                            name="thumb-up-outline"
                            size={15}
                            color="#2F5D50"
                          />
                          <Text style={styles.detailText}>Recommended</Text>
                        </View>
                      ) : null}
                      {review.easeRating ? (
                        <View style={styles.detailPill}>
                          <Text style={styles.detailLabel}>Access</Text>
                          <Text style={styles.detailText}>
                            {review.easeRating}/5
                          </Text>
                        </View>
                      ) : null}
                      {review.facilitiesRating ? (
                        <View style={styles.detailPill}>
                          <Text style={styles.detailLabel}>Facilities</Text>
                          <Text style={styles.detailText}>
                            {review.facilitiesRating}/5
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  )}

                  {reviewImages.length > 0 && (
                    <View style={styles.reviewImagesRow}>
                      {reviewImages.map((imgUrl, imgIdx) => (
                        <Image
                          key={imgIdx}
                          source={{ uri: imgUrl }}
                          style={[
                            styles.reviewImageThumb,
                            isCompact && styles.reviewImageThumbCompact,
                          ]}
                          resizeMode="cover"
                        />
                      ))}
                    </View>
                  )}
                </View>

                {index < reviews.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}

        <View style={{ height: 100 }} />
      </ScrollView>

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

      <SelfieArModal
        visible={selfieModalVisible}
        onClose={() => setSelfieModalVisible(false)}
        artifactTitle={typeof museumName === "string" ? museumName : ""}
        museumName={typeof museumName === "string" ? museumName : ""}
        initialModelId={suggestedArModel.id}
      />
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 10,
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
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F160E",
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  selfieQuickButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#000",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  selfieQuickButtonText: {
    color: "#FFF4DC",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  stateContainer: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#8A2F22",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyContainer: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 18,
    padding: 22,
    marginTop: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#5F4C3E",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  reviewCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(81,47,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E0D3C5",
    borderWidth: 2,
    borderColor: "#fff",
  },
  reviewerMeta: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#24180E",
  },
  reviewDate: {
    fontSize: 12,
    color: "#8B7766",
    marginTop: 2,
  },
  ratingBlock: {
    alignItems: "flex-end",
    gap: 3,
  },
  starsRow: {
    flexDirection: "row",
    gap: 1,
  },
  ratingText: {
    fontSize: 12,
    color: "#7B6253",
    fontWeight: "700",
  },
  museumRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
  },
  museumText: {
    color: "#7B6253",
    fontSize: 13,
    fontWeight: "700",
  },
  reviewTitle: {
    fontSize: 17,
    lineHeight: 22,
    color: "#24180E",
    fontWeight: "800",
    marginBottom: 6,
  },
  comment: {
    fontSize: 14,
    color: "#4E4036",
    lineHeight: 20,
  },
  commentMuted: {
    fontSize: 14,
    color: "#947F70",
    fontStyle: "italic",
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  detailPill: {
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F2E8DC",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailLabel: {
    color: "#7B6253",
    fontSize: 12,
    fontWeight: "700",
  },
  detailText: {
    color: "#2F261D",
    fontSize: 12,
    fontWeight: "800",
  },
  reviewImagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  reviewImageThumb: {
    width: 104,
    height: 104,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
  },
  reviewImageThumbCompact: {
    width: 92,
    height: 92,
  },
  divider: {
    height: 14,
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
