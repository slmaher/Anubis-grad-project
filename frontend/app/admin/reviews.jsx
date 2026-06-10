import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getAuthToken } from "../api/authStorage";
import { API_URL } from "../api/baseUrl";

const DEFAULT_AVATAR = require("../../assets/images/profile-you.png");

export default function ReviewManagement() {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/reviews/admin/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await response.json();
      if (res.success) {
        setReviews(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getAuthToken();
              const response = await fetch(`${API_URL}/reviews/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              const res = await response.json();
              if (res.success) {
                setReviews(reviews.filter((r) => r._id !== id));
              }
            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
    );
  };

  const renderStars = (rating) => {
    const value = Number(rating) || 0;
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <MaterialCommunityIcons
            key={s}
            name={s <= value ? "star" : "star-outline"}
            size={17}
            color="#D9A441"
          />
        ))}
      </View>
    );
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

  const renderDetail = (label, value) => {
    if (!value) return null;
    return (
      <View style={styles.detailPill}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
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

  const renderReview = ({ item }) => {
    const reviewImages = getReviewImages(item);

    return (
      <View style={[styles.reviewCard, isCompact && styles.reviewCardCompact]}>
        <View style={[styles.reviewHeader, isCompact && styles.reviewHeaderCompact]}>
          <View style={styles.identityRow}>
            <Image
              source={item.user?.avatar ? { uri: item.user.avatar } : DEFAULT_AVATAR}
              style={styles.avatar}
            />
            <View style={styles.reviewMeta}>
              <Text style={styles.userName}>{item.user?.name || "Anonymous"}</Text>
              <Text style={styles.userEmail}>{item.user?.email || "No email"}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => deleteReview(item._id)}
          >
            <MaterialCommunityIcons
              name="delete-sweep-outline"
              size={24}
              color="#C94F4F"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.museumLine}>
          <MaterialCommunityIcons name="bank-outline" size={16} color="#8B7B6C" />
          <Text style={styles.museumName}>
            {item.museum?.name || "Unknown museum"}
            {item.museum?.city ? `, ${item.museum.city}` : ""}
          </Text>
        </View>

        <View style={styles.ratingRow}>
          {renderStars(item.rating)}
          <Text style={styles.ratingText}>{item.rating || 0}/5</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>

        {item.title ? <Text style={styles.reviewTitle}>{item.title}</Text> : null}
        {item.comment ? (
          <Text style={styles.comment}>{item.comment}</Text>
        ) : (
          <Text style={styles.commentMuted}>No written comment added.</Text>
        )}

        <View style={styles.detailsRow}>
          {item.recommend ? renderDetail("Recommend", "Yes") : null}
          {renderDetail("Access", item.easeRating ? `${item.easeRating}/5` : "")}
          {renderDetail(
            "Facilities",
            item.facilitiesRating ? `${item.facilitiesRating}/5` : "",
          )}
        </View>

        {reviewImages.length > 0 ? (
          <View style={styles.photosRow}>
            {reviewImages.map((uri, index) => (
              <Image
                key={`${item._id}-photo-${index}`}
                source={{ uri }}
                style={[styles.photo, isCompact && styles.photoCompact]}
                resizeMode="cover"
              />
            ))}
          </View>
        ) : (
          <Text style={styles.noPhotos}>No review photos submitted.</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#D9A441" style={{ flex: 1 }} />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={[styles.title, isCompact && styles.titleCompact]}>
          Review Management
        </Text>
        <Text style={styles.subtitle}>
          {reviews.length} submitted {reviews.length === 1 ? "review" : "reviews"}
        </Text>
      </View>
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No reviews submitted yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#F5EFE7" },
  headerBlock: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2C2010",
  },
  titleCompact: {
    fontSize: 22,
  },
  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#8B7B6C",
    fontWeight: "700",
  },
  list: { gap: 16, paddingBottom: 24 },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(44,32,16,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  reviewCardCompact: {
    padding: 14,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  reviewHeaderCompact: {
    gap: 8,
  },
  identityRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E6D9C9",
  },
  reviewMeta: {
    flex: 1,
  },
  userName: { fontSize: 16, fontWeight: "800", color: "#2C2010" },
  userEmail: {
    fontSize: 12,
    color: "#8B7B6C",
    marginTop: 2,
  },
  museumLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  museumName: { fontSize: 13, color: "#6C5947", fontWeight: "700", flex: 1 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  stars: { flexDirection: "row", gap: 2 },
  ratingText: {
    color: "#2C2010",
    fontSize: 13,
    fontWeight: "800",
  },
  reviewTitle: {
    color: "#2C2010",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  },
  comment: { fontSize: 14, color: "#3E3127", lineHeight: 20 },
  commentMuted: {
    fontSize: 14,
    color: "#9B8876",
    fontStyle: "italic",
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailPill: {
    backgroundColor: "#F2E8DC",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailLabel: {
    color: "#8B7B6C",
    fontSize: 12,
    fontWeight: "700",
  },
  detailValue: {
    color: "#2C2010",
    fontSize: 12,
    fontWeight: "800",
  },
  photosRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
  },
  photo: {
    width: 112,
    height: 112,
    borderRadius: 10,
    backgroundColor: "#E6D9C9",
  },
  photoCompact: {
    width: 92,
    height: 92,
  },
  noPhotos: {
    color: "#A08A76",
    fontSize: 12,
    fontWeight: "700",
  },
  date: { fontSize: 12, color: "#8B7B6C", fontWeight: "700" },
  deleteBtn: {
    padding: 6,
    alignSelf: "flex-start",
  },
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 22,
    alignItems: "center",
  },
  emptyText: {
    color: "#8B7B6C",
    fontWeight: "700",
  },
});
