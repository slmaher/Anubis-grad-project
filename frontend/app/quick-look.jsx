import { useEffect } from "react";
import { ActivityIndicator, Linking, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getArModelById } from "../src/data/arModels";

const PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_QUICK_LOOK_BASE_URL || "";

export default function QuickLookRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const modelId = params?.modelId ? String(params.modelId) : "statue";
  const model = getArModelById(modelId);

  useEffect(() => {
    const openHostedQuickLook = async () => {
      if (!PUBLIC_BASE_URL) {
        return;
      }

      const url = `${PUBLIC_BASE_URL.replace(/\/$/, "")}/quick-look/${model.id}.html`;

      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error("Unable to open hosted Quick Look URL:", error);
      } finally {
        router.back();
      }
    };

    openHostedQuickLook();
  }, [model.id, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#D4AF37" />
      <Text style={styles.title}>Opening Quick Look…</Text>
      <Text style={styles.text}>
        {PUBLIC_BASE_URL
          ? "If Safari does not open, check the hosted Quick Look URL and try again."
          : "Set EXPO_PUBLIC_QUICK_LOOK_BASE_URL to your hosted site URL, then tap the AR button again."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050302",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#FFF4DC",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    color: "#EAD9B8",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});