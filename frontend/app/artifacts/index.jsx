import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const COLLECTIONS = [
  {
    key: "british",
    title: "British Museum",
    subtitle: "Egyptian objects collection",
    embedUrl:
      "https://sketchfab.com/playlists/embed?collection=451a426bdae644029d99e46f5022cd87&autostart=0",
    accent: "#D4AF37",
  },
  {
    key: "rosicrucian",
    title: "Rosicrucian Egyptian Museum",
    subtitle: "Curated 3D artifact collection",
    // Use the canonical playlist embed src provided by the museum
    embedUrl:
      "https://sketchfab.com/playlists/embed?collection=6d9c2aef43ec4e1d83f64f0ae36e61c8&autostart=0",
    accent: "#B9874E",
  },
];

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

export default function ArtifactsScreen() {
  const router = useRouter();
  const [activeCollection, setActiveCollection] = useState(COLLECTIONS[0].key);

  const active = useMemo(
    () =>
      COLLECTIONS.find((item) => item.key === activeCollection) ||
      COLLECTIONS[0],
    [activeCollection],
  );

  const viewerUrl = useMemo(() => {
    const separator = active.embedUrl.includes("?") ? "&" : "?";
    return `${active.embedUrl}${separator}autostart=1&transparent=1&ui_theme=dark&ui_infos=0&ui_watermark=0&ui_stop=0&ui_inspector=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&ui_hint=2`;
  }, [active.embedUrl]);

  const viewerHtml = useMemo(
    () => createEmbedHtml(viewerUrl, active.title),
    [active.title, viewerUrl],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1108" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerCopy}>
            <View style={styles.badge}>
              <MaterialCommunityIcons
                name="cube-scan"
                size={16}
                color="#D4AF37"
              />
              <Text style={styles.badgeText}>3D collections</Text>
            </View>
            <Text style={styles.title}>Artifact Models</Text>
            <Text style={styles.subtitle}>
              Switch between two curated 3D artifact lists and open the
              collection that fits your visit.
            </Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          {COLLECTIONS.map((collection) => {
            const isActive = collection.key === activeCollection;
            return (
              <TouchableOpacity
                key={collection.key}
                style={[
                  styles.tab,
                  isActive && {
                    borderColor: collection.accent,
                    backgroundColor: "rgba(0,0,0,0.12)",
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  setActiveCollection(collection.key);
                }}
              >
                <View style={styles.tabRowTop}>
                  <View
                    style={[
                      styles.tabIconWrap,
                      isActive
                        ? { backgroundColor: collection.accent }
                        : { backgroundColor: "rgba(255,255,255,0.06)" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="cube-outline"
                      size={18}
                      color={isActive ? "#1C1208" : "#CDB9A4"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.tabTitle,
                      isActive && { color: collection.accent },
                    ]}
                  >
                    {collection.title}
                  </Text>
                </View>
                <Text style={styles.tabSubtitle}>{collection.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.viewerShell}>
          <WebView
            key={viewerUrl}
            source={{ html: viewerHtml }}
            style={styles.viewer}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            originWhitelist={["*"]}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerTitle}>{active.title}</Text>
            <Text style={styles.footerText}>
              {active.subtitle} is now shown as an embedded collection. No
              static photo cards or local GLB files are used here.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.openButton}
            onPress={() =>
              router.push({
                pathname: "/artifacts/artifactDetailsScreen",
                params: { collection: active.key },
              })
            }
            activeOpacity={0.9}
          >
            <Text style={styles.openButtonText}>Open {active.title}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1A1108",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 8,
    marginBottom: 14,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 14,
  },
  backArrow: {
    color: "#F7F2EA",
    fontSize: 28,
    lineHeight: 28,
  },
  headerCopy: {
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  badgeText: {
    color: "#EAD9B8",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
    color: "#F7F2EA",
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#D2C4B3",
  },
  tabRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  tabTitle: {
    color: "#F7F2EA",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },
  tabTitleActive: {
    color: "#FFFFFF",
  },
  tabSubtitle: {
    color: "#CDB9A4",
    fontSize: 11,
    lineHeight: 15,
  },
  tabRowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  tabSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  tabIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  viewerShell: {
    flex: 1,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#050302",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.14)",
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.24,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 12,
      },
    }),
  },
  viewer: {
    flex: 1,
    backgroundColor: "transparent",
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
  footer: {
    paddingBottom: 12,
    gap: 12,
  },
  footerInfo: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  footerTitle: {
    color: "#F7F2EA",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  footerText: {
    color: "#D0C2B2",
    fontSize: 13,
    lineHeight: 19,
  },
  openButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#D4AF37",
  },
  openButtonText: {
    color: "#1C1208",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
});
