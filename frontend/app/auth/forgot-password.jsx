import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { api } from "../api/client";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await api.forgotPassword(email.trim());
      setEmailSent(true);
      Alert.alert(
        "Email Sent!",
        "If an account with this email exists, a password reset link has been sent to your email."
      );
    } catch (error) {
      console.error("Forgot password failed", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("../../assets/images/login.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* Welcome Title - Outside overlay */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Reset Password</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Dark Overlay - Only bottom half */}
        <View style={styles.overlay}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Content */}
            <View style={styles.content}>
              {!emailSent ? (
                <>
                  <Text style={styles.subtitle}>
                    Enter your email address and we'll send you a link to reset your password.
                  </Text>

                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputUnderline}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email Address"
                      placeholderTextColor="rgba(255, 255, 255, 0.8)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  {/* Send Reset Link Button */}
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleForgotPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#333" />
                    ) : (
                      <Text style={styles.buttonText}>Send Reset Link</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.successContainer}>
                    <Ionicons
                      name="checkmark-circle"
                      size={80}
                      color="#C4B5A0"
                      style={styles.successIcon}
                    />
                    <Text style={styles.successTitle}>Check Your Email</Text>
                    <Text style={styles.successText}>
                      We've sent a password reset link to {email}
                    </Text>
                    <Text style={styles.successSubtext}>
                      Click the link in the email to reset your password. The link expires in 15 minutes.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => setEmail("")}
                  >
                    <Text style={styles.secondaryButtonText}>Send to Another Email</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Back to Login */}
              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => router.back()}
              >
                <Text style={styles.backToLoginText}>← Back to Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 32,
  },
  titleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 40,
    minHeight: "60%",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputUnderline: {
    color: "#fff",
    fontSize: 17,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.7)",
  },
  button: {
    backgroundColor: "#C4B5A0",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 25,
  },
  buttonText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#C4B5A0",
  },
  secondaryButtonText: {
    color: "#C4B5A0",
    fontSize: 18,
    fontWeight: "700",
  },
  backToLogin: {
    alignItems: "center",
    paddingVertical: 15,
  },
  backToLoginText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
  },
  successContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 15,
    textAlign: "center",
  },
  successSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 20,
  },
});
