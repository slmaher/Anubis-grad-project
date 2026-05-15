import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getArModelById } from "../src/data/arModels";

const QUICK_LOOK_BASE_URL = process.env.EXPO_PUBLIC_QUICK_LOOK_BASE_URL || "";

const createArViewerHtml = ({ modelName, modelTitle, modelDescription, modelDataUrl, iosSrc }) => `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.2.0/model-viewer.min.js"></script>
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: radial-gradient(circle at top, #2b1c10 0%, #140e08 45%, #050302 100%);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      * { box-sizing: border-box; }
      model-viewer {
        width: 100vw;
        height: 100vh;
        background: transparent;
      }
      .overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        color: #f6ead1;
      }
      .topBar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        padding: 18px 16px 12px;
        background: linear-gradient(to bottom, rgba(5, 3, 2, 0.75), rgba(5, 3, 2, 0));
      }
      .titleWrap { max-width: 72%; }
      .eyebrow {
        font-size: 11px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #d4af37;
        margin-bottom: 5px;
      }
      .title {
        font-size: 22px;
        font-weight: 800;
        line-height: 1.15;
        margin: 0;
      }
      .subtitle {
        margin-top: 4px;
        font-size: 13px;
        line-height: 1.45;
        color: #ead9b8;
      }
      .statusPill {
        pointer-events: none;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(10, 7, 4, 0.72);
        border: 1px solid rgba(212, 175, 55, 0.25);
        font-size: 12px;
        color: #f1dfb9;
        max-width: 30%;
        text-align: right;
      }
      .hint {
        position: absolute;
        left: 50%;
        bottom: 120px;
        transform: translateX(-50%);
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(10, 7, 4, 0.68);
        border: 1px solid rgba(212, 175, 55, 0.18);
        font-size: 13px;
        letter-spacing: 0.02em;
        color: #fff4dc;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
      }
      .label {
        position: absolute;
        left: 50%;
        bottom: 180px;
        transform: translateX(-50%);
        display: none;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(212, 175, 55, 0.16);
        border: 1px solid rgba(212, 175, 55, 0.3);
        color: #fff4dc;
        font-size: 13px;
        font-weight: 700;
        text-shadow: 0 1px 8px rgba(0, 0, 0, 0.55);
      }
      .controls {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 16px;
        background: linear-gradient(to top, rgba(5, 3, 2, 0.92), rgba(5, 3, 2, 0.34), rgba(5, 3, 2, 0));
        display: flex;
        justify-content: center;
        gap: 12px;
        pointer-events: none;
      }
      button {
        pointer-events: auto;
        border: 0;
        border-radius: 999px;
        font-weight: 800;
        letter-spacing: 0.01em;
      }
      #enterArButton {
        padding: 13px 18px;
        background: linear-gradient(135deg, #d4af37, #f3dc8a);
        color: #2b1d12;
        box-shadow: 0 12px 28px rgba(212, 175, 55, 0.26);
      }
      #photoButton {
        padding: 13px 18px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff4dc;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }
      #statusBadge {
        position: absolute;
        top: 78px;
        left: 16px;
        right: 16px;
        display: none;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 18px;
        background: rgba(15, 10, 4, 0.7);
        border: 1px solid rgba(212, 175, 55, 0.18);
        backdrop-filter: blur(14px);
      }
      #statusCopy {
        font-size: 13px;
        line-height: 1.35;
        color: #f6ead1;
      }
      #particles {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        opacity: 0;
        transition: opacity 220ms ease;
      }
      .particle {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(248, 216, 140, 0.95) 0%, rgba(212, 175, 55, 0.1) 100%);
        filter: blur(0.3px);
        animation: floatUp 4.8s linear infinite;
      }
      .particle:nth-child(2n) { animation-duration: 5.6s; }
      .particle:nth-child(3n) { animation-duration: 6.2s; }
      .particle:nth-child(4n) { animation-duration: 4.3s; }
      @keyframes floatUp {
        0% { transform: translate3d(0, 12px, 0) scale(0.6); opacity: 0; }
        15% { opacity: 0.9; }
        100% { transform: translate3d(var(--drift, 24px), -120vh, 0) scale(1.15); opacity: 0; }
      }
      model-viewer[ar-status="object-placed"] ~ .overlay #label,
      model-viewer[ar-status="session-started"] ~ .overlay #label {
        display: inline-flex;
      }
      model-viewer[ar-status="object-placed"] ~ .overlay #particles {
        opacity: 1;
      }
      model-viewer[ar-status="session-started"] ~ .overlay #statusBadge,
      model-viewer[ar-status="object-placed"] ~ .overlay #statusBadge,
      model-viewer[ar-tracking="not-tracking"] ~ .overlay #statusBadge {
        display: flex;
      }
    </style>
  </head>
  <body>
    <model-viewer
      id="viewer"
      src="${modelDataUrl}"
      ${iosSrc ? `ios-src="${iosSrc}"` : ""}
      alt="${modelTitle}"
      ar
      ar-modes="webxr scene-viewer quick-look"
      ar-placement="floor"
      ar-scale="auto"
      camera-controls
      touch-action="pan-y"
      auto-rotate
      auto-rotate-delay="1200"
      shadow-intensity="1"
      exposure="1.1"
      loading="eager"
      interaction-prompt="none"
    >
      <button slot="ar-button" id="enterArButton">Enter AR</button>
    </model-viewer>

    <div class="overlay">
      <div class="topBar">
        <div class="titleWrap">
          <div class="eyebrow">AR Souvenir Mode</div>
          <h1 class="title">${modelTitle}</h1>
          <div class="subtitle">${modelDescription}</div>
        </div>
        <div id="statusPill" class="statusPill">Ready for AR placement</div>
      </div>

      <div id="statusBadge">
        <div id="statusCopy">Move your phone to find a surface.</div>
      </div>

      <div id="label" class="label">${modelName}</div>
      <div class="hint" id="hint">Move your phone to find a surface</div>
      <div id="particles" aria-hidden="true">
        <span class="particle" style="left: 12%; top: 78%; --drift: 26px;"></span>
        <span class="particle" style="left: 24%; top: 86%; --drift: -12px;"></span>
        <span class="particle" style="left: 36%; top: 72%; --drift: 18px;"></span>
        <span class="particle" style="left: 50%; top: 84%; --drift: 32px;"></span>
        <span class="particle" style="left: 63%; top: 76%; --drift: -20px;"></span>
        <span class="particle" style="left: 76%; top: 88%; --drift: 22px;"></span>
        <span class="particle" style="left: 88%; top: 79%; --drift: -16px;"></span>
      </div>

      <div class="controls">
        <button id="photoButton" type="button">Take Souvenir Photo</button>
      </div>
    </div>

    <script>
      const modelViewer = document.getElementById('viewer');
      const statusCopy = document.getElementById('statusCopy');
      const statusPill = document.getElementById('statusPill');
      const hint = document.getElementById('hint');
      const enterArButton = document.getElementById('enterArButton');
      const photoButton = document.getElementById('photoButton');

      const postMessage = (payload) => {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      };

      const updateStatus = (status) => {
        if (status === 'session-started') {
          statusCopy.textContent = 'Move your phone to find a surface.';
          statusPill.textContent = 'Searching for a surface';
          hint.textContent = 'Move your phone to find a surface';
          return;
        }

        if (status === 'object-placed') {
          statusCopy.textContent = 'Object placed. Capture your souvenir selfie now.';
          statusPill.textContent = 'Model placed';
          hint.textContent = 'Tap and pinch to adjust the model';
          return;
        }

        if (status === 'failed') {
          statusCopy.textContent = 'AR could not start on this device.';
          statusPill.textContent = 'AR unavailable';
          hint.textContent = 'Use the 3D preview instead';
          return;
        }

        statusCopy.textContent = 'Ready for AR placement';
        statusPill.textContent = 'Ready for AR placement';
        hint.textContent = 'Move your phone to find a surface';
      };

      modelViewer.addEventListener('ar-status', (event) => {
        updateStatus(event.detail.status);
        postMessage({ type: 'ar-status', status: event.detail.status });
      });

      modelViewer.addEventListener('ar-tracking', (event) => {
        postMessage({ type: 'ar-tracking', status: event.detail.status });
      });

      modelViewer.addEventListener('error', () => {
        updateStatus('failed');
        postMessage({ type: 'error', message: 'model-viewer error' });
      });

      enterArButton.addEventListener('click', () => {
        if (modelViewer.canActivateAR) {
          modelViewer.activateAR();
        } else {
          postMessage({ type: 'ar-unavailable' });
          updateStatus('failed');
        }
      });

      photoButton.addEventListener('click', async () => {
        try {
          if (!modelViewer.toDataURL) {
            throw new Error('Screenshot export is not available');
          }

          const dataUrl = await modelViewer.toDataURL('image/png');
          postMessage({
            type: 'souvenir-photo',
            dataUrl,
          });
        } catch (error) {
          postMessage({ type: 'capture-error', message: error?.message || 'Unable to capture souvenir photo' });
        }
      });

    </script>
  </body>
</html>
`;

export default function ArViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const webviewRef = useRef(null);
  const writableDirectory = FileSystem.cacheDirectory || FileSystem.documentDirectory || "";
  const [modelDataUrl, setModelDataUrl] = useState(null);
  const [iosSrc, setIosSrc] = useState(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [statusText, setStatusText] = useState("Preparing your AR scene...");
  const [banner, setBanner] = useState(null); // { type: 'info'|'error'|'success', text }

  const model = useMemo(() => getArModelById(params?.modelId ? String(params.modelId) : ""), [params?.modelId]);

  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      try {
        setLoadingModel(true);
        const asset = Asset.fromModule(model.asset);
        await asset.downloadAsync();

        const uri = asset.localUri || asset.uri;
        if (!uri) {
          throw new Error("Unable to resolve the selected GLB file.");
        }

        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (isMounted) {
          setModelDataUrl(`data:model/gltf-binary;base64,${base64Data}`);
          setStatusText(`Loaded ${model.title}. Ready to launch AR.`);
        }

        // load ios USDZ if available
        try {
          if (model.iosAsset) {
            const iosAsset = Asset.fromModule(model.iosAsset);
            await iosAsset.downloadAsync();
            const iosUri = iosAsset.localUri || iosAsset.uri;
            if (isMounted && iosUri) setIosSrc(iosUri);
          } else if (isMounted) {
            setIosSrc(null);
          }
        } catch (e) {
          console.warn('Unable to load ios USDZ asset:', e);
        }
      } catch (error) {
        console.error("AR model load error:", error);
        if (isMounted) {
          setStatusText("Could not load the selected model.");
          setBanner({ type: "error", text: error?.message || "Failed to load the selected model." });
        }
      } finally {
        if (isMounted) {
          setLoadingModel(false);
        }
      }
    };

    loadModel();

    return () => {
      isMounted = false;
    };
  }, [model]);

  const handleSouvenirCapture = async ({ dataUrl }) => {
    try {
      if (!dataUrl || typeof dataUrl !== "string") {
        throw new Error("No capture data returned from the AR viewer.");
      }

      setSavingPhoto(true);

      const permission = await MediaLibrary.requestPermissionsAsync(true);
      const sanitizedName = model.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const finalFileName = `egyptian_souvenir_${sanitizedName}_${timestamp}.png`;
      const base64Payload = dataUrl.split(",")[1];

      if (writableDirectory) {
        const targetPath = `${writableDirectory}${finalFileName}`;

        await FileSystem.writeAsStringAsync(targetPath, base64Payload, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (permission.granted) {
          await MediaLibrary.createAssetAsync(targetPath);
          setStatusText(`Saved ${finalFileName} to your gallery.`);
          setBanner({ type: "success", text: `${finalFileName} was added to your gallery.` });
          return;
        }

        const shareAvailable = await Sharing.isAvailableAsync();
        if (shareAvailable) {
          await Sharing.shareAsync(targetPath, {
            mimeType: "image/png",
            dialogTitle: "Share your Egyptian souvenir",
          });
          setStatusText(`Prepared ${finalFileName} for sharing.`);
          return;
        }
      }

      const shareAvailable = await Sharing.isAvailableAsync();
      if (shareAvailable) {
        await Sharing.shareAsync(dataUrl, {
          mimeType: "image/png",
          dialogTitle: "Share your Egyptian souvenir",
        });
        setStatusText(`Prepared ${finalFileName} for sharing.`);
        return;
      }

      setBanner({ type: "success", text: `${finalFileName} was captured successfully.` });
      setStatusText(`Captured ${finalFileName}.`);
    } catch (error) {
      console.error("Souvenir capture error:", error);
      setBanner({ type: "error", text: error?.message || "Unable to save the souvenir photo." });
    } finally {
      setSavingPhoto(false);
    }
  };

  const openArSession = () => {
    if (!webviewRef.current) {
      setBanner({ type: "info", text: "Please wait for the model to finish loading." });
      return;
    }

    webviewRef.current.injectJavaScript(`
      (function() {
        const modelViewer = document.getElementById('viewer');
        const arButton = document.getElementById('enterArButton');
        if (arButton) {
          arButton.click();
        } else if (modelViewer && modelViewer.canActivateAR) {
          modelViewer.activateAR();
        }
      })();
      true;
    `);
  };

  const openIphoneArSession = async () => {
    if (QUICK_LOOK_BASE_URL) {
      try {
        const hostedUrl = `${QUICK_LOOK_BASE_URL.replace(/\/$/, "")}/quick-look/${model.id}.html`;
        await WebBrowser.openBrowserAsync(hostedUrl);
        return;
      } catch (error) {
        console.error("Hosted Quick Look launch error:", error);
        setBanner({ type: "error", text: "Could not open the hosted Quick Look page." });
        return;
      }
    }

    try {
      setBanner({
        type: "info",
        text: "Set EXPO_PUBLIC_QUICK_LOOK_BASE_URL to your hosted site URL to open Quick Look directly from Safari.",
      });
    } catch (error) {
      console.error("iPhone AR launch error:", error);
      setBanner({ type: "error", text: error?.message || "Could not open Quick Look on iPhone." });
    }
  };

  const viewerHtml = useMemo(() => {
    if (!modelDataUrl) {
      return null;
    }

    return createArViewerHtml({
      modelName: model.name,
      modelTitle: model.title,
      modelDescription: model.subtitle,
      modelDataUrl,
      iosSrc,
    });
  }, [model.subtitle, model.name, model.title, modelDataUrl, iosSrc]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCopy}>
          <Text style={styles.headerEyebrow}>AR Souvenir Mode</Text>
          <Text style={styles.headerTitle}>{model.title}</Text>
          <Text style={styles.headerSubtitle}>{statusText}</Text>
        </View>
      </View>

      <View style={styles.viewerShell}>
        {loadingModel || !viewerHtml ? (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingTitle}>Loading AR scene...</Text>
            <Text style={styles.loadingText}>Optimizing the GLB for mobile AR.</Text>
          </View>
        ) : (
          <>
            <WebView
              ref={webviewRef}
              originWhitelist={["*"]}
              source={{ html: viewerHtml }}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              allowFileAccess
              allowUniversalAccessFromFileURLs
              mixedContentMode="always"
              style={styles.webview}
              onMessage={(event) => {
                try {
                  const message = JSON.parse(event.nativeEvent.data);

                  if (message.type === "souvenir-photo") {
                    handleSouvenirCapture(message);
                    return;
                  }

                  if (message.type === "ar-status") {
                    if (message.status === "session-started") {
                      setStatusText("Find a flat surface to place the model.");
                    } else if (message.status === "object-placed") {
                      setStatusText("The model is placed. Capture your souvenir now.");
                    } else if (message.status === "failed") {
                      setStatusText("AR is unavailable on this device.");
                    }
                  }

                  if (message.type === "capture-error") {
                    setBanner({ type: "error", text: message.message || "Unable to capture the souvenir photo." });
                  }

                  if (message.type === "ar-unavailable") {
                    setBanner({
                      type: "error",
                      text: "This device cannot start a browser AR session for this model. Quick Look requires hosted or USDZ assets.",
                    });
                  }
                } catch (error) {
                  console.log("AR viewer message:", event.nativeEvent.data);
                }
              }}
            />
            {banner ? (
              <View
                style={[
                  styles.banner,
                  banner.type === "error" ? styles.bannerError : banner.type === "success" ? styles.bannerSuccess : styles.bannerInfo,
                ]}
              >
                <Text style={styles.bannerText}>{banner.text}</Text>
                <TouchableOpacity onPress={() => setBanner(null)} style={styles.bannerDismiss}>
                  <Text style={styles.bannerDismissText}>OK</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <TouchableOpacity
              style={styles.openArButton}
              onPress={Platform.OS === "ios" ? openIphoneArSession : openArSession}
              activeOpacity={0.9}
            >
              <MaterialCommunityIcons name="camera-iris" size={18} color="#2B1D12" />
              <Text style={styles.openArButtonText}>
                {Platform.OS === "ios" ? "Try iPhone AR" : "Open Camera AR"}
              </Text>
            </TouchableOpacity>
            {Platform.OS === "ios" && iosSrc ? (
              <TouchableOpacity
                style={[styles.openArButton, { bottom: 76, backgroundColor: '#FFFFFF' }]}
                onPress={async () => {
                  await openIphoneArSession();
                }}
                activeOpacity={0.9}
              >
                <MaterialCommunityIcons name="apple" size={18} color="#2B1D12" />
                <Text style={styles.openArButtonText}>Open iPhone AR</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>{model.title}</Text>
          <Text style={styles.footerText}>{model.subtitle}</Text>
        </View>

        {savingPhoto ? (
          <View style={styles.savingPill}>
            <Text style={styles.savingText}>Saving souvenir photo...</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050302",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: "row",
    gap: 12,
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "rgba(5, 3, 2, 0.45)",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.16)",
  },
  backIcon: {
    color: "#F6EAD1",
    fontSize: 30,
    lineHeight: 30,
    marginTop: -2,
  },
  headerCopy: {
    flex: 1,
  },
  headerEyebrow: {
    color: "#D4AF37",
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  headerTitle: {
    color: "#FFF4DC",
    fontSize: 20,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#EAD9B8",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  viewerShell: {
    flex: 1,
    backgroundColor: "#050302",
  },
  webview: {
    flex: 1,
    backgroundColor: "#050302",
  },
  loadingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFF4DC",
    marginBottom: 8,
    textAlign: "center",
  },
  loadingText: {
    color: "#D8C6A4",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  openArButton: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 132,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 18,
    zIndex: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  openArButtonText: {
    color: "#2B1D12",
    fontSize: 16,
    fontWeight: "900",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    gap: 10,
    backgroundColor: "rgba(5, 3, 2, 0.96)",
  },
  footerCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(15, 10, 4, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.14)",
  },
  footerTitle: {
    color: "#FFF4DC",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  footerText: {
    color: "#EAD9B8",
    fontSize: 13,
    lineHeight: 19,
  },
  savingPill: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.22)",
  },
  savingText: {
    color: "#FFF4DC",
    fontSize: 13,
    fontWeight: "700",
  },
  banner: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 110,
    zIndex: 40,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerText: {
    color: "#fff",
    flex: 1,
    marginRight: 12,
  },
  bannerDismiss: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  bannerDismissText: {
    color: "#fff",
    fontWeight: "700",
  },
  bannerError: {
    backgroundColor: "rgba(180, 40, 40, 0.92)",
  },
  bannerSuccess: {
    backgroundColor: "rgba(40, 140, 60, 0.9)",
  },
  bannerInfo: {
    backgroundColor: "rgba(30, 40, 80, 0.9)",
  },
});