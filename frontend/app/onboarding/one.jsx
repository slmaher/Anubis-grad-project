import React, { useMemo } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, PanResponder } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function OnboardingOne() {
  const router = useRouter();
  const { t } = useTranslation();

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 20,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -50) {
            router.push("/onboarding/two");
          }
        },
      }),
    [router]
  );

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
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
          <Text style={styles.skipText}>{t("common.skip")}</Text>
        </TouchableOpacity>

        {/* Bottom Content */}
        <View style={styles.bottomSection}>
          <View style={styles.textBackground}>
            <Text style={styles.title}>{t("onboarding.one.title")}</Text>
            <Text style={styles.description}>
              {t("onboarding.one.description")}
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
              <Text style={styles.buttonText}>{t("common.get_started")}</Text>
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
    paddingVertical: 30,
  },
  skipText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  bottomSection: {
    paddingHorizontal: 25,
    paddingBottom: 100,
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