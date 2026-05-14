import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const COLLECTIONS = {
  british: {
    title: "British Museum",
    subtitle: "Egyptian objects collection",
    embedUrl:
      "https://sketchfab.com/playlists/embed?collection=451a426bdae644029d99e46f5022cd87&autostart=0",
  },
  rosicrucian: {
    title: "Rosicrucian Egyptian Museum",
    subtitle: "Curated 3D artifact collection",
    // Use the museum's official playlist embed src (user supplied)
    embedUrl:
      "https://sketchfab.com/playlists/embed?collection=6d9c2aef43ec4e1d83f64f0ae36e61c8&autostart=0",
  },
};

function createEmbedHtml(embedUrl, title) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <style>
          html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #050302; }
          iframe { border: 0; width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <iframe
          title="${title}"
          src="${embedUrl}"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowfullscreen
        ></iframe>
      </body>
    </html>
  `;
}

export default function ArtifactDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const collectionKey = params.collection || "rosicrucian";
  const collection = COLLECTIONS[collectionKey] || COLLECTIONS.rosicrucian;

  const viewerUrl = useMemo(() => {
    const separator = collection.embedUrl.includes("?") ? "&" : "?";
    return `${collection.embedUrl}${separator}autostart=1&transparent=1&ui_theme=dark&ui_infos=0&ui_watermark=0&ui_stop=0&ui_inspector=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&ui_hint=2`;
  }, [collection.embedUrl]);

  const viewerHtml = useMemo(
    () => createEmbedHtml(viewerUrl, collection.title),
    [collection.title, viewerUrl],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#050302" />

      <View style={styles.viewerWrap}>
        <WebView
          key={viewerUrl}
          source={{ html: viewerHtml }}
          style={styles.viewer}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          originWhitelist={["*"]}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>{collection.title}</Text>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading embedded 3D model...</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.sheet}>
        <View style={styles.content}>
          <Text style={styles.title}>{collection.title}</Text>
          <Text style={styles.subtitle}>{collection.subtitle}</Text>
          <Text style={styles.body}>
            This is the customized artifact screen for the selected 3D collection. It opens the embedded Sketchfab list directly with no static photos or local GLB files.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/artifacts")}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Back to collections</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1A1108",
  },
  viewerWrap: {
    flex: 0.64,
    backgroundColor: "#050302",
    position: "relative",
  },
  viewer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  backBtn: {
    position: "absolute",
    top: 60,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 28,
    lineHeight: 32,
    color: "#fff",
  },
  backLabel: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(5,3,2,0.72)",
  },
  loadingText: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "700",
  },
  sheet: {
    flex: 1,
    backgroundColor: "#362411",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    justifyContent: "space-between",
  },
  content: {
    gap: 8,
  },
  title: {
    color: "#F7F2EA",
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "#D4AF37",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  body: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  actions: {
    paddingTop: 14,
  },
  secondaryBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  secondaryBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});