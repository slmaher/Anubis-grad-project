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
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "../api/client";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    if (!token) {
      Alert.alert(
        "Invalid Link",
        "The password reset link is invalid or missing."
      );
      setLoading(false);
      return;
    }

    try {
      setVerifying(true);
      const result = await api.verifyResetToken(token);
      setTokenValid(true);
      setEmail(result?.data?.email || "");
    } catch (error) {
      console.error("Token verification failed", error);
      Alert.alert(
        "Link Expired",
        error?.message || "The password reset link has expired. Please request a new one."
      );
      setTokenValid(false);
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please enter both password fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Password Too Short", "Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords Don't Match", "Please make sure both passwords are the same.");
      return;
    }

    try {
      setResetting(true);
      await api.resetPassword(token, password, confirmPassword);
      setResetComplete(true);
      Alert.alert(
        "Success!",
        "Your password has been reset successfully. You can now log in with your new password.",
        [
          {
            text: "Go to Login",
            onPress: () => {
              router.replace("/auth/login");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Password reset failed", error);
      Alert.alert(
        "Reset Failed",
        error?.message || "Failed to reset password. Please try again."
      );
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/login.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C4B5A0" />
          <Text style={styles.loadingText}>Verifying reset link...</Text>
        </View>
      </View>
    );
  }

  if (!tokenValid) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/login.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle"
              size={80}
              color="#FF6B6B"
              style={styles.errorIcon}
            />
            <Text style={styles.errorTitle}>Link Expired</Text>
            <Text style={styles.errorText}>
              This password reset link is invalid or has expired.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace("/auth/forgot-password")}
            >
              <Text style={styles.buttonText}>Request New Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

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
        onPress={() => router.replace("/auth/login")}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* Welcome Title - Outside overlay */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Create New Password</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Dark Overlay */}
        <View style={styles.overlay}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.subtitle}>
                Enter a new password for {email}
              </Text>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={styles.passwordInputUnderline}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="New Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.8)"
                    secureTextEntry={!showPassword}
                    editable={!resetting}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <Ionicons
                        name="eye-outline"
                        size={24}
                        color="rgba(255, 255, 255, 0.9)"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="eye-closed"
                        size={24}
                        color="rgba(255, 255, 255, 0.9)"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={styles.passwordInputUnderline}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.8)"
                    secureTextEntry={!showConfirmPassword}
                    editable={!resetting}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? (
                      <Ionicons
                        name="eye-outline"
                        size={24}
                        color="rgba(255, 255, 255, 0.9)"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="eye-closed"
                        size={24}
                        color="rgba(255, 255, 255, 0.9)"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                <Text style={[styles.requirementText, password.length >= 6 && styles.requirementMet]}>
                  {password.length >= 6 ? "✓" : "○"} At least 6 characters
                </Text>
                <Text style={[styles.requirementText, password === confirmPassword && password.length > 0 && styles.requirementMet]}>
                  {password === confirmPassword && password.length > 0 ? "✓" : "○"} Passwords match
                </Text>
              </View>

              {/* Reset Password Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleResetPassword}
                disabled={resetting || !password || !confirmPassword}
              >
                {resetting ? (
                  <ActivityIndicator color="#333" />
                ) : (
                  <Text style={styles.buttonText}>Reset Password</Text>
                )}
              </TouchableOpacity>

              {/* Back to Login */}
              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => router.replace("/auth/login")}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    color: "#C4B5A0",
    fontSize: 16,
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
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 20,
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
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.7)",
  },
  passwordInputUnderline: {
    flex: 1,
    color: "#fff",
    fontSize: 17,
    paddingVertical: 10,
  },
  eyeButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  requirementsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 6,
  },
  requirementMet: {
    color: "#4CAF50",
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
  backToLogin: {
    alignItems: "center",
    paddingVertical: 15,
  },
  backToLoginText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
});
