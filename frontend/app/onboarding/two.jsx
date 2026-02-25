import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function OnboardingTwo() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("../../assets/images/onboarding2.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Dark Overlay */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Back and Skip Buttons */}
        <View style={styles.topButtons}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => router.replace("/auth/register")}
          >
            <Text style={styles.skipText}>Skip →</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Content */}
        <View style={styles.bottomSection}>
          <View style={styles.textBackground}>
            <Text style={styles.title}>Bring Artifacts Back to Life</Text>
            <Text style={styles.description}>
              Use AR to scan mysterious statues, artifacts, revealing their original beauty and history.
            </Text>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
              <View style={styles.dot} />
              <View style={[styles.dot, styles.activeDot]} />
              <View style={styles.dot} />
            </View>

            {/* Next Button */}
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push("/onboarding/three")}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  topButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  skipButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  skipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  bottomSection: {
    paddingHorizontal: 25,
    paddingBottom: 80,
  },
  textBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 25,
    paddingVertical: 35,
    borderRadius: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: "#D1D1D1",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  pagination: {
    flexDirection: "row",
    marginBottom: 30,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  activeDot: {
    backgroundColor: "#D2B48C",
    width: 24,
  },
  button: {
    backgroundColor: "#D2B48C",
    paddingVertical: 16,
    paddingHorizontal: 80,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});