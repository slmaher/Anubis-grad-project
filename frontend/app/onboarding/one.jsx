import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function OnboardingOne() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("../../assets/images/onboarding1.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Dark Overlay */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Skip Button */}
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => router.replace("/auth/register")}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Bottom Content */}
        <View style={styles.bottomSection}>
          <View style={styles.textBackground}>
            <Text style={styles.title}>Explore Museums Like Never Before</Text>
            <Text style={styles.description}>
              Step into history and discover artifacts, stories, and hidden treasures with Anubis.
            </Text>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
              <View style={[styles.dot, styles.activeDot]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

            {/* Get Started Button */}
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push("/onboarding/two")}
            >
              <Text style={styles.buttonText}>Get Started</Text>
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
  skipButton: {
    alignSelf: "flex-end",
    marginTop: 60,
    marginRight: 20,
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