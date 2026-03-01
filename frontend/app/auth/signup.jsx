import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { api } from "../api/client";
import { saveAuthSession } from "../api/authStorage";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Signup() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Missing details", "Please fill in all fields.");
      return;
    }

    const name = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      setLoading(true);
      const result = await api.register(name, email.trim(), password);
      
      // DON'T save the session - just create the account
      // User must log in manually after signup
      
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
      console.error("Signup failed", error);
      Alert.alert(
        "Sign up failed",
        error?.message || "Please check your details and try again."
      );
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
        onPress={() => router.back()}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* Welcome Title - Outside overlay */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Welcome</Text>
      </View>

      {/* Dark Overlay - Only bottom half */}
      <View style={styles.overlay}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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

            {/* First Name and Last Name Row */}
            <View style={styles.nameRow}>
              <View style={styles.nameInputContainer}>
                <TextInput
                  style={styles.inputUnderline}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First Name"
                  placeholderTextColor="rgba(255, 255, 255, 0.8)"
                />
              </View>

              <View style={styles.nameInputContainer}>
                <TextInput
                  style={styles.inputUnderline}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last Name"
                  placeholderTextColor="rgba(255, 255, 255, 0.8)"
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputUnderline}
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail"
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInputUnderline}
                  value={password}
                  onChangeText={setPassword}
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
  overlay: {
    position: "absolute",
    bottom: 0,
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