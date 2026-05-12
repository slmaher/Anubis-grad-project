import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { WebView } from "react-native-webview";
import { useRouter, useLocalSearchParams } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function ModelViewerScreen() {
  const router = useRouter();
  const { url } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  if (!url) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No 3D model URL provided.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  let viewerUrl = url;
  if (viewerUrl && viewerUrl.includes("/embed")) {
    const separator = viewerUrl.includes("?") ? "&" : "?";
    viewerUrl += `${separator}autostart=1&transparent=1&ui_theme=dark&ui_infos=0&ui_watermark=0&ui_stop=0&ui_inspector=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&ui_hint=2`;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity style={styles.floatingBackButton} onPress={() => router.back()}>
        <AntDesign name="left" size={24} color="#FFF" />
      </TouchableOpacity>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading 3D Engine...</Text>
        </View>
      )}
      <View style={styles.webviewWrapper}>
        <WebView
          source={{ uri: viewerUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          onLoadEnd={() => setIsLoading(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050302",
  },
  floatingBackButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 20,
    width: 30,
    height: 30,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  webviewWrapper: {
    flex: 1,
    backgroundColor: "#050302",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#050302",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#D4AF37",
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#1A1108",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
