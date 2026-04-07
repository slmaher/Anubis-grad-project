import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function Register() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleClose = () => {
    // Navigate back to the last onboarding screen
    router.replace("/onboarding/three");
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("../../assets/images/register.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Dark Overlay */}
      <View style={styles.overlay} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Close Button */}
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={handleClose}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{t("auth.register.title")}</Text>
          <Text style={styles.subtitle}>{t("auth.register.subtitle")}</Text>

          {/* Gray Container Card */}
          <View style={styles.cardContainer}>
            {/* Create Account Button */}
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push("/auth/signup")}
            >
              <Text style={styles.createButtonText}>{t("auth.register.create_account")}</Text>
            </TouchableOpacity>

            {/* Already Have Account */}
            <TouchableOpacity 
              style={styles.loginPrompt}
              onPress={() => router.push("/auth/login")}
            >
              <Text style={styles.loginPromptText}>{t("auth.register.already_have_account")}</Text>
            </TouchableOpacity>

            {/* Sign up with */}
            <Text style={styles.signupWith}>{t("auth.register.signup_with")}</Text>

            {/* Social Login Buttons */}
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={require("../../assets/images/apple_white.png")}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={require("../../assets/images/google_icon.png")}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={require("../../assets/images/microsoft.png")}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "300",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 150,
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#D1D1D1",
    textAlign: "center",
    marginBottom: 50,
    lineHeight: 24,
  },
  cardContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 30,
    width: "100%",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  createButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 30,
    width: "90%",
    alignItems: "center",
    marginBottom: 15,
  },
  createButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  loginPrompt: {
    paddingVertical: 10,
    marginBottom: 30,
  },
  loginPromptText: {
    color: "#fff",
    fontSize: 15,
    textDecorationLine: "none",
  },
  signupWith: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 20,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 15,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  socialIcon: {
    width: 40,
    height: 40,
  },
});