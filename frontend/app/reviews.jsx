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

export default function Reviews() {
  const router = useRouter();
  const params = useLocalSearchParams();
const rawMuseumId = params.museumId;
const museumId =
  typeof rawMuseumId === "string" &&
  /^[a-f\d]{24}$/i.test(rawMuseumId)
    ? rawMuseumId
    : undefined;

const museumName = params.museumName;
const museumLookupName = params.museumLookupName;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/home");
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
  }, [museumId]);

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
