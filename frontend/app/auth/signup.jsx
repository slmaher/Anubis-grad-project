import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { api } from "../api/client";
import { saveAuthSession } from "../api/authStorage";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const clearFieldError = (field) => {
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setFormError("");
  };

  const validateForm = () => {
    const nextErrors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    };

    if (!firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(nextErrors);
    return !nextErrors.firstName && !nextErrors.lastName && !nextErrors.email && !nextErrors.password;
  };

  const handleSignup = async () => {
    if (loading) return; // Prevent double submit
    setFormError("");

    if (!validateForm()) {
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();

    console.log("[Signup] Attempting registration for email:", trimmedEmail);

    try {
      setLoading(true);
      const result = await api.register(name, trimmedEmail, password);
      
      console.log("[Signup] Registration successful:", result?.data?.user?.email);

      // Clear fields after successful registration
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setFieldErrors({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });

      // Show success message and redirect to login
      Alert.alert(
        "Account Created!",
        "Your account has been created successfully. Please log in to continue.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/auth/login");
            }
          }
        ]
      );
    } catch (error) {
      console.error("[Signup] failed:", error?.message);
      setFormError(error?.message || "Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("../../assets/images/signup.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Close Button */}
<TouchableOpacity 
  style={styles.closeButton}
  onPress={() => router.replace("/auth/register")}
>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* Welcome Title - Outside overlay */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Welcome</Text>
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
              <Text style={styles.subtitle}>New to us?</Text>

              {/* Tab Buttons */}
              <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                  <Text style={[styles.tabText, styles.activeTabText]}>Sign Up</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.tab}
                  onPress={() => router.replace("/auth/login")}
                >
                  <Text style={styles.tabText}>Log in</Text>
                </TouchableOpacity>
              </View>

              {formError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{formError}</Text>
                </View>
              ) : null}

              {/* First Name and Last Name Row */}
              <View style={styles.nameRow}>
                <View style={styles.nameInputContainer}>
                  <TextInput
                    style={[
                      styles.inputUnderline,
                      fieldErrors.firstName ? styles.inputUnderlineError : null,
                    ]}
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (fieldErrors.firstName) {
                        clearFieldError("firstName");
                      }
                    }}
                    placeholder="First Name"
                    placeholderTextColor="rgba(255, 255, 255, 0.8)"
                  />
                  {fieldErrors.firstName ? (
                    <Text style={styles.fieldErrorText}>{fieldErrors.firstName}</Text>
                  ) : null}
                </View>

                <View style={styles.nameInputContainer}>
                  <TextInput
                    style={[
                      styles.inputUnderline,
                      fieldErrors.lastName ? styles.inputUnderlineError : null,
                    ]}
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      if (fieldErrors.lastName) {
                        clearFieldError("lastName");
                      }
                    }}
                    placeholder="Last Name"
                    placeholderTextColor="rgba(255, 255, 255, 0.8)"
                  />
                  {fieldErrors.lastName ? (
                    <Text style={styles.fieldErrorText}>{fieldErrors.lastName}</Text>
                  ) : null}
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.inputUnderline,
                    fieldErrors.email ? styles.inputUnderlineError : null,
                  ]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (fieldErrors.email) {
                      clearFieldError("email");
                    }
                  }}
                  placeholder="E-mail"
                  placeholderTextColor="rgba(255, 255, 255, 0.8)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {fieldErrors.email ? (
                  <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View
                  style={[
                    styles.passwordRow,
                    fieldErrors.password ? styles.passwordRowError : null,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInputUnderline}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (fieldErrors.password) {
                        clearFieldError("password");
                      }
                    }}
                    placeholder="Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.8)"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <Ionicons name="eye-outline" size={24} color="rgba(255, 255, 255, 0.9)" />
                    ) : (
                      <MaterialCommunityIcons name="eye-closed" size={24} color="rgba(255, 255, 255, 0.9)" />
                    )}
                  </TouchableOpacity>
                </View>
                {fieldErrors.password ? (
                  <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
                ) : null}
              </View>

              {/* Sign up Button */}
              <TouchableOpacity 
                style={styles.signupButton}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#333" />
                ) : (
                  <Text style={styles.signupButtonText}>Sign up</Text>
                )}
              </TouchableOpacity>

              {/* Social Login */}
              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require("../../assets/images/google_black.png")}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require("../../assets/images/apple_icon.png")}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require("../../assets/images/windows-logo.png")}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
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
    fontWeight: "300",
  },
  titleContainer: {
    position: "absolute",
    top: "25%",
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginTop: -50,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    left: 0,
    right: 0,
    height: "65%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 25,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 30,
    gap: 30,
  },
  tab: {
    paddingBottom: 8,
  },
  activeTab: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "400",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "700",
  },
  nameRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 25,
  },
  nameInputContainer: {
    flex: 1,
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
  inputUnderlineError: {
    borderBottomColor: "#ff7a7a",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.7)",
  },
  passwordRowError: {
    borderBottomColor: "#ff7a7a",
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
  errorBanner: {
    marginBottom: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 122, 122, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 122, 122, 0.45)",
  },
  errorBannerText: {
    color: "#ffd4d4",
    fontSize: 14,
    lineHeight: 20,
  },
  fieldErrorText: {
    marginTop: 6,
    color: "#ffb4b4",
    fontSize: 13,
    lineHeight: 18,
  },
  signupButton: {
    backgroundColor: "#C4B5A0",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 25,
  },
  signupButtonText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "700",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 10,
  },
  socialButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  socialIcon: {
    width: 40,
    height: 40,
  },
});