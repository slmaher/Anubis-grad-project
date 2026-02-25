import { View, Text, Image, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.replace("/onboarding/one");
    }, 2500);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/Logo.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>ANUBIS</Text>
      <Text style={styles.subtitle}>EXPLORE EGYPT</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6D5C3",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 2,
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 5,
    letterSpacing: 1,
    color: "#000",
  },
});