import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function Reviews() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Reviews data
  const reviews = [
    {
      id: 1,
      name: "Nischal",
      rating: 4,
      comment: "Amazing experience! Truly loved it",
    },
    {
      id: 2,
      name: "Nischal",
      rating: 5,
      comment: "So well organized and full of history",
    },
    {
      id: 3,
      name: "Nischal",
      rating: 5,
      comment: "Absolutely breathtaking — a must-see!",
    },
    {
      id: 4,
      name: "Nischal",
      rating: 5,
      comment: "Beautiful place and friendly staff",
    },
    {
      id: 5,
      name: "Nischal",
      rating: 4,
      comment: "Great museum, learned so much!",
    },
    {
      id: 6,
      name: "Nischal",
      rating: 5,
      comment: "Perfect for history lovers",
    },
    {
      id: 7,
      name: "Nischal",
      rating: 5,
      comment: "A memorable visit — will come again!",
    },
  ];

  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Reviews List */}
        {reviews.map((review, index) => (
          <View key={review.id}>
            <View style={styles.reviewCard}>
              {/* Avatar and Name */}
              <View style={styles.reviewHeader}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>👤</Text>
                  </View>
                  <Text style={styles.reviewerName}>{review.name}</Text>
                </View>
                {/* Stars */}
                <Text style={styles.stars}>{renderStars(review.rating)}</Text>
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
        onPress={() => router.push("/write-review")}
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
    paddingTop: 50,
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
