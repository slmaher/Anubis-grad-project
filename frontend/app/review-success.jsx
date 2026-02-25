import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

export default function ReviewSuccess() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.push("/reviews")}
      >
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>

      {/* Stars decoration at top */}
      <View style={styles.starsDecoration}>
        <Text style={styles.starDecoSmall}>★</Text>
        <Text style={styles.starDecoMedium}>★</Text>
        <Text style={styles.starDecoLarge}>★</Text>
        <Text style={styles.starDecoMedium}>★</Text>
        <Text style={styles.starDecoSmall}>★</Text>
      </View>

      {/* Thank You Text */}
      <View style={styles.content}>
        <Text style={styles.thankYouTitle}>Thank you for your review!</Text>
        <Text style={styles.thankYouSubtitle}>
          You help fellow travelers find what's good out there in discovering the best experiences.
        </Text>
      </View>

      {/* Photos preview decoration */}
      <View style={styles.photosDecoration}>
        <View style={styles.photoCard}>
          <Image
            source={require("../assets/images/grand-museum.png")}
            style={styles.photoPreview}
            resizeMode="cover"
          />
          <Text style={styles.photoLabel}>grand-museum.jpg</Text>
        </View>
        <View style={[styles.photoCard, styles.photoCardMiddle]}>
          <Image
            source={require("../assets/images/egyptian-museum.png")}
            style={styles.photoPreview}
            resizeMode="cover"
          />
          <Text style={styles.photoLabel}>egyptian-museum.jpg</Text>
        </View>
        <View style={styles.photoCard}>
          <Image
            source={require("../assets/images/grand-museum.png")}
            style={styles.photoPreview}
            resizeMode="cover"
          />
          <Text style={styles.photoLabel}>museum.jpg</Text>
        </View>
      </View>

      {/* See All Button */}
      <TouchableOpacity
        style={styles.seeAllButton}
        onPress={() => router.push("/reviews")}
      >
        <Text style={styles.seeAllButtonText}>See All your Review</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8DDD0",
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
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
  starsDecoration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 40,
  },
  starDecoSmall: {
    fontSize: 28,
    color: "#fff",
  },
  starDecoMedium: {
    fontSize: 38,
    color: "#fff",
  },
  starDecoLarge: {
    fontSize: 48,
    color: "#fff",
  },
  content: {
    alignItems: "center",
    marginBottom: 50,
    paddingHorizontal: 10,
  },
  thankYouTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 34,
  },
  thankYouSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  photosDecoration: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: -15,
    marginBottom: 50,
  },
  photoCard: {
    width: 100,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ rotate: "-8deg" }],
  },
  photoCardMiddle: {
    transform: [{ rotate: "0deg" }],
    zIndex: 1,
    marginHorizontal: -20,
    marginBottom: 10,
  },
  photoPreview: {
    width: "100%",
    height: 100,
  },
  photoLabel: {
    fontSize: 9,
    color: "#666",
    padding: 6,
    textAlign: "center",
  },
  seeAllButton: {
    backgroundColor: "#000",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    width: "100%",
  },
  seeAllButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
