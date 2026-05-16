import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { WebView } from "react-native-webview";
import {
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  State,
} from "react-native-gesture-handler";
import AR_MODELS, { getSuggestedArModel } from "../data/arModels";

const { width: screenWidth } = Dimensions.get("window");

const DEFAULT_TRANSFORM = {
  translateX: 0,
  translateY: 0,
  scale: 1,
  rotation: 0,
};

const sanitizeModelName = (name) =>
  String(name || "artifact")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "artifact";

const makeModelHtml = (modelUri) => {
  const safeSrc = JSON.stringify(modelUri || "");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.2.0/model-viewer.min.js"></script>
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: transparent;
      }
      * { box-sizing: border-box; }
      .stage {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        transform: translate3d(0px, 0px, 0) scale(1) rotate(0rad);
        transform-origin: center center;
      }
      .frame {
        width: min(86vw, 360px);
        height: min(86vw, 360px);
        border-radius: 34px;
        overflow: hidden;
        background: transparent;
      }
      model-viewer {
        width: 100%;
        height: 100%;
        background: transparent;
        --poster-color: transparent;
      }
    </style>
  </head>
  <body>
    <div class="stage" id="stage">
      <div class="frame">
        <model-viewer
          id="viewer"
          src=${safeSrc}
          camera-controls
          auto-rotate
          interaction-prompt="none"
          disable-zoom
          disable-pan
          exposure="1.1"
          shadow-intensity="1"
          reveal="auto"
        ></model-viewer>
      </div>
    </div>

    <script>
      const stage = document.getElementById('stage');
      const viewer = document.getElementById('viewer');

      const transform = {
        translateX: 0,
        translateY: 0,
        scale: 1,
        rotation: 0,
      };

      const renderTransform = () => {
        stage.style.transform = "translate3d(" + transform.translateX + "px, " + transform.translateY + "px, 0) scale(" + transform.scale + ") rotate(" + transform.rotation + "rad)";
      };

      window.__setTransform = (nextTransform) => {
        if (!nextTransform) return;
        Object.assign(transform, nextTransform);
        renderTransform();
      };

      const loadImage = (src) => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
      });

      window.__composeCapture = async ({ requestId, cameraDataUrl }) => {
        try {
          const overlayDataUrl = await viewer.toDataURL('image/png');
          const [cameraImage, overlayImage] = await Promise.all([
            loadImage(cameraDataUrl),
            loadImage(overlayDataUrl),
          ]);

          const canvas = document.createElement('canvas');
          canvas.width = cameraImage.naturalWidth || cameraImage.width;
          canvas.height = cameraImage.naturalHeight || cameraImage.height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(cameraImage, 0, 0, canvas.width, canvas.height);
          ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'captureResult',
            requestId,
            dataUrl: canvas.toDataURL('image/png'),
          }));
        } catch (error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'captureError',
            requestId,
            error: error?.message || 'Failed to compose capture',
          }));
        }
      };

      viewer.addEventListener('load', () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'modelReady' }));
      });
    </script>
  </body>
</html>`;
};

export default function SelfieArModal({
  visible,
  onClose,
  artifactTitle = "",
  initialModelId = "",
  onSaved,
}) {
  const cameraRef = useRef(null);
  const webViewRef = useRef(null);
  const panGestureRef = useRef(null);
  const pinchGestureRef = useRef(null);
  const rotationGestureRef = useRef(null);
  const requestIdRef = useRef(null);
  const pendingCameraUriRef = useRef(null);
  const transformRef = useRef(DEFAULT_TRANSFORM);
  const panStartRef = useRef(DEFAULT_TRANSFORM);
  const pinchStartScaleRef = useRef(1);
  const rotationStartRef = useRef(0);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);
  const [modelUri, setModelUri] = useState(null);
  const [modelId, setModelId] = useState(() => {
    if (initialModelId) return initialModelId;
    return getSuggestedArModel(artifactTitle).id;
  });

  const selectedModel = useMemo(
    () => AR_MODELS.find((model) => model.id === modelId) || AR_MODELS[0],
    [modelId],
  );

  const isPrefilledModel = Boolean(initialModelId || artifactTitle);

  useEffect(() => {
    if (!visible) {
      setBanner(null);
      setCameraReady(false);
      setModelReady(false);
      setSaving(false);
      setCameraLoading(false);
      transformRef.current = DEFAULT_TRANSFORM;
      panStartRef.current = DEFAULT_TRANSFORM;
      return;
    }

    if (!permission?.granted) {
      requestPermission();
    }

    if (!mediaPermission?.granted) {
      requestMediaPermission();
    }
  }, [
    visible,
    permission?.granted,
    mediaPermission?.granted,
    requestPermission,
    requestMediaPermission,
  ]);

  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      if (!visible || !selectedModel?.asset) {
        setModelUri(null);
        return;
      }

      try {
        setModelReady(false);
        const asset = Asset.fromModule(selectedModel.asset);
        await asset.downloadAsync();
        const uri = asset.localUri || asset.uri;
        if (!uri) {
          throw new Error("Model URI unavailable.");
        }

        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (isMounted) {
          setModelUri(`data:model/gltf-binary;base64,${base64Data}`);
        }
      } catch (error) {
        console.error("Failed to load selfie AR model:", error);
        if (isMounted) {
          setBanner({
            type: "error",
            text: "Could not load this artifact model.",
          });
        }
      }
    };

    loadModel();

    return () => {
      isMounted = false;
    };
  }, [visible, selectedModel?.asset]);

  useEffect(() => {
    setModelId((current) => {
      if (current && AR_MODELS.some((model) => model.id === current)) {
        return current;
      }

      return initialModelId || getSuggestedArModel(artifactTitle).id;
    });
  }, [artifactTitle, initialModelId, visible]);

  useEffect(() => {
    if (!webViewRef.current || !modelReady) {
      return;
    }

    const payload = JSON.stringify(transformRef.current);
    webViewRef.current.injectJavaScript(
      `window.__setTransform(${payload}); true;`,
    );
  }, [modelUri, modelReady]);

  const syncTransform = (nextTransform) => {
    transformRef.current = nextTransform;

    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `window.__setTransform(${JSON.stringify(nextTransform)}); true;`,
      );
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || !webViewRef.current) {
      return;
    }

    try {
      setSaving(true);
      setBanner(null);

      const mediaAccess = mediaPermission?.granted
        ? mediaPermission
        : await requestMediaPermission();

      if (!mediaAccess?.granted) {
        setBanner({
          type: "error",
          text: "Photos access is required. Tap Allow Photos Access and try again.",
        });
        setSaving(false);
        return;
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.75,
        base64: true,
        exif: false,
      });

      if (!photo?.base64) {
        throw new Error("Camera capture failed.");
      }

      const requestId = String(Date.now());
      requestIdRef.current = requestId;
      pendingCameraUriRef.current = photo.uri;
      setCameraLoading(true);

      webViewRef.current.injectJavaScript(
        `window.__composeCapture(${JSON.stringify({
          requestId,
          cameraDataUrl: `data:image/jpeg;base64,${photo.base64}`,
        })}); true;`,
      );
    } catch (error) {
      console.error("Selfie capture failed:", error);
      setCameraLoading(false);
      setSaving(false);
      setBanner({
        type: "error",
        text: error?.message || "Could not capture the souvenir photo.",
      });
    }
  };

  const handleWebViewMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === "modelReady") {
        setModelReady(true);
        setCameraLoading(false);
        return;
      }

      if (message.type === "captureError") {
        if (message.requestId !== requestIdRef.current) {
          return;
        }

        setCameraLoading(false);
        setSaving(false);
        setBanner({
          type: "error",
          text: message.error || "Could not compose the souvenir photo.",
        });
        return;
      }

      if (message.type !== "captureResult") {
        return;
      }

      if (message.requestId !== requestIdRef.current || !message.dataUrl) {
        return;
      }

      const cameraUri = pendingCameraUriRef.current;
      if (!cameraUri) {
        throw new Error("Camera file location was not available.");
      }

      const fileName = `egyptian_souvenir_${sanitizeModelName(
        selectedModel.name,
      )}_${Date.now()}.png`;
      const cameraFolder = cameraUri.replace(/[^/]+$/, "");
      const targetPath = `${cameraFolder}${fileName}`;
      const base64Payload = String(message.dataUrl).replace(
        /^data:image\/png;base64,/,
        "",
      );

      await FileSystem.writeAsStringAsync(targetPath, base64Payload, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const asset = await MediaLibrary.createAssetAsync(targetPath);

      setCameraLoading(false);
      setSaving(false);
      setBanner({
        type: "success",
        text: "Souvenir saved to your Photos gallery.",
      });

      if (onSaved) {
        onSaved(asset?.uri || targetPath);
      }

      pendingCameraUriRef.current = null;
    } catch (error) {
      console.error("Failed to save souvenir capture:", error);
      setCameraLoading(false);
      setSaving(false);
      pendingCameraUriRef.current = null;
      setBanner({
        type: "error",
        text: error?.message || "Could not save the souvenir photo.",
      });
    }
  };

  const runTransformGesture = (gestureType, event) => {
    if (gestureType === "pan") {
      syncTransform({
        ...transformRef.current,
        translateX:
          panStartRef.current.translateX + event.nativeEvent.translationX,
        translateY:
          panStartRef.current.translateY + event.nativeEvent.translationY,
      });
      return;
    }

    if (gestureType === "pinch") {
      syncTransform({
        ...transformRef.current,
        scale: Math.max(
          0.6,
          pinchStartScaleRef.current * event.nativeEvent.scale,
        ),
      });
      return;
    }

    if (gestureType === "rotation") {
      syncTransform({
        ...transformRef.current,
        rotation: rotationStartRef.current + event.nativeEvent.rotation,
      });
    }
  };

  const panHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.BEGAN) {
      panStartRef.current = transformRef.current;
    }
  };

  const pinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.BEGAN) {
      pinchStartScaleRef.current = transformRef.current.scale;
    }
  };

  const rotationHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.BEGAN) {
      rotationStartRef.current = transformRef.current.rotation;
    }
  };

  const showSelector = !isPrefilledModel;
  const needsPhotoAccess = mediaPermission && !mediaPermission.granted;

  const webHtml = useMemo(() => {
    if (!modelUri) {
      return null;
    }

    return makeModelHtml(modelUri);
  }, [modelUri]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>AR Souvenir Photo</Text>
              <Text style={styles.title}>Take a selfie with this artifact</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helperText}>
            Move and resize the artifact, then capture your souvenir.
          </Text>

          {banner && (
            <View
              style={[
                styles.banner,
                banner.type === "success"
                  ? styles.bannerSuccess
                  : banner.type === "error"
                    ? styles.bannerError
                    : styles.bannerInfo,
              ]}
            >
              <Text style={styles.bannerText}>{banner.text}</Text>
            </View>
          )}

          {needsPhotoAccess && (
            <View style={styles.photoAccessCard}>
              <Text style={styles.photoAccessTitle}>Allow Photos Access</Text>
              <Text style={styles.photoAccessText}>
                The souvenir photo must be saved to your gallery.
              </Text>
              <TouchableOpacity
                style={styles.photoAccessButton}
                onPress={requestMediaPermission}
              >
                <Text style={styles.photoAccessButtonText}>
                  Allow Photos Access
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.stage}>
            {permission?.granted ? (
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="front"
                onCameraReady={() => setCameraReady(true)}
              />
            ) : (
              <View style={styles.permissionPanel}>
                <Image
                  source={require("../../assets/images/grand-museum.png")}
                  style={styles.permissionImage}
                />
                <Text style={styles.permissionTitle}>
                  Front camera access needed
                </Text>
                <Text style={styles.permissionText}>
                  Grant camera access to create your souvenir selfie.
                </Text>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestPermission}
                >
                  <Text style={styles.permissionButtonText}>Allow Camera</Text>
                </TouchableOpacity>
              </View>
            )}

            {permission?.granted && webHtml && (
              <PanGestureHandler
                ref={panGestureRef}
                simultaneousHandlers={[pinchGestureRef, rotationGestureRef]}
                onGestureEvent={(event) => runTransformGesture("pan", event)}
                onHandlerStateChange={panHandlerStateChange}
              >
                <RotationGestureHandler
                  ref={rotationGestureRef}
                  simultaneousHandlers={[panGestureRef, pinchGestureRef]}
                  onGestureEvent={(event) =>
                    runTransformGesture("rotation", event)
                  }
                  onHandlerStateChange={rotationHandlerStateChange}
                >
                  <PinchGestureHandler
                    ref={pinchGestureRef}
                    simultaneousHandlers={[panGestureRef, rotationGestureRef]}
                    onGestureEvent={(event) =>
                      runTransformGesture("pinch", event)
                    }
                    onHandlerStateChange={pinchHandlerStateChange}
                  >
                    <View style={styles.webViewLayer} pointerEvents="box-none">
                      <WebView
                        ref={webViewRef}
                        key={modelUri}
                        source={{ html: webHtml }}
                        originWhitelist={["*"]}
                        allowFileAccess
                        allowFileAccessFromFileURLs
                        allowUniversalAccessFromFileURLs
                        onMessage={handleWebViewMessage}
                        javaScriptEnabled
                        domStorageEnabled
                        androidLayerType="hardware"
                        setSupportMultipleWindows={false}
                        style={styles.webView}
                        backgroundColor="transparent"
                      />

                      {!cameraReady && (
                        <View style={styles.loadingOverlay}>
                          <ActivityIndicator size="large" color="#D4AF37" />
                          <Text style={styles.loadingText}>
                            Preparing camera...
                          </Text>
                        </View>
                      )}

                      {cameraLoading && (
                        <View style={styles.loadingOverlay}>
                          <ActivityIndicator size="large" color="#D4AF37" />
                          <Text style={styles.loadingText}>
                            Creating souvenir...
                          </Text>
                        </View>
                      )}
                    </View>
                  </PinchGestureHandler>
                </RotationGestureHandler>
              </PanGestureHandler>
            )}
          </View>

          <View style={styles.footer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modelRow}
            >
              {AR_MODELS.map((model) => {
                const isActive = model.id === modelId;
                return (
                  <TouchableOpacity
                    key={model.id}
                    style={[
                      styles.modelCard,
                      isActive && styles.modelCardActive,
                      isActive && { borderColor: model.accent },
                    ]}
                    onPress={() => setModelId(model.id)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.modelDot,
                        { backgroundColor: model.accent },
                      ]}
                    />
                    <Text style={styles.modelName}>{model.name}</Text>
                    <Text style={styles.modelSubtitle} numberOfLines={2}>
                      {model.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {showSelector && (
              <Text style={styles.selectorHint}>
                No model was selected elsewhere, so pick one here.
              </Text>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.secondaryButton, styles.closeActionButton]}
                onPress={onClose}
              >
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCapture}
                disabled={!permission?.granted || !modelReady || saving}
              >
                <Text style={styles.captureButtonText}>
                  {saving ? "Saving..." : "Capture Photo"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#090603",
  },
  container: {
    flex: 1,
    backgroundColor: "#090603",
    paddingTop: Platform.OS === "ios" ? 54 : 24,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  eyebrow: {
    color: "#D4AF37",
    letterSpacing: 2.6,
    textTransform: "uppercase",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  title: {
    color: "#F8E8C8",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    maxWidth: screenWidth - 120,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.28)",
    backgroundColor: "rgba(212,175,55,0.08)",
  },
  closeText: {
    color: "#F8E8C8",
    fontSize: 18,
    fontWeight: "700",
  },
  helperText: {
    color: "#EAD9B8",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  photoAccessCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.24)",
    backgroundColor: "rgba(212,175,55,0.08)",
    padding: 14,
    marginBottom: 14,
  },
  photoAccessTitle: {
    color: "#F8E8C8",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  photoAccessText: {
    color: "#EAD9B8",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  photoAccessButton: {
    alignSelf: "flex-start",
    borderRadius: 14,
    backgroundColor: "#D4AF37",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  photoAccessButtonText: {
    color: "#120B07",
    fontWeight: "800",
  },
  banner: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  bannerInfo: {
    backgroundColor: "rgba(212,175,55,0.1)",
    borderColor: "rgba(212,175,55,0.3)",
  },
  bannerSuccess: {
    backgroundColor: "rgba(70, 153, 96, 0.16)",
    borderColor: "rgba(70, 153, 96, 0.4)",
  },
  bannerError: {
    backgroundColor: "rgba(173, 57, 57, 0.16)",
    borderColor: "rgba(173, 57, 57, 0.4)",
  },
  bannerText: {
    color: "#FFF4DC",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  stage: {
    flex: 1,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.18)",
    backgroundColor: "#120B07",
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  webViewLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  webView: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,3,2,0.5)",
    gap: 8,
  },
  loadingText: {
    color: "#F8E8C8",
    fontWeight: "600",
  },
  permissionPanel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
    backgroundColor: "#120B07",
  },
  permissionImage: {
    width: 88,
    height: 88,
    borderRadius: 22,
    marginBottom: 8,
  },
  permissionTitle: {
    color: "#F8E8C8",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  permissionText: {
    color: "#EAD9B8",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  permissionButton: {
    marginTop: 10,
    backgroundColor: "#D4AF37",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  permissionButtonText: {
    color: "#120B07",
    fontWeight: "800",
  },
  footer: {
    paddingTop: 14,
  },
  modelRow: {
    gap: 10,
    paddingBottom: 14,
  },
  modelCard: {
    width: 140,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  modelCardActive: {
    backgroundColor: "rgba(212,175,55,0.12)",
  },
  modelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  modelName: {
    color: "#FFF4DC",
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 4,
  },
  modelSubtitle: {
    color: "#EAD9B8",
    fontSize: 12,
    lineHeight: 16,
  },
  selectorHint: {
    color: "#CBB98B",
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.28)",
    backgroundColor: "rgba(212,175,55,0.08)",
  },
  closeActionButton: {
    flex: 0.9,
  },
  secondaryButtonText: {
    color: "#F8E8C8",
    fontWeight: "800",
  },
  captureButton: {
    flex: 1.2,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4AF37",
  },
  captureButtonText: {
    color: "#120B07",
    fontWeight: "900",
    fontSize: 15,
  },
});
