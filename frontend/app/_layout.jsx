import "react-native-gesture-handler";
import "intl-pluralrules";
import { Stack } from "expo-router";
import "../i18n/i18n";
import { useEffect } from "react";
import { useTranslation, I18nextProvider } from "react-i18next";
import { I18nManager, Platform, Image } from "react-native";
import i18n from "../i18n/i18n";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { resolveImageSource } from "./utils/cloudinary";

// Global Monkey-patch for React Native Image to automatically resolve Cloudinary resources
if (Image && !Image.__cloudinaryPatched) {
  try {
    const originalRender = Image.render;
    if (typeof originalRender === "function") {
      Image.render = function (props, ref) {
        if (props && (props.bypassCloudinary || (props.source && props.source.bypassCloudinary))) {
          const { bypassCloudinary, ...cleanProps } = props;
          if (cleanProps.source && typeof cleanProps.source === "object") {
            const { bypassCloudinary: _, ...cleanSource } = cleanProps.source;
            cleanProps.source = cleanSource;
          }
          return originalRender.call(this, cleanProps, ref);
        }
        const newProps = { ...props };
        if (props && props.source) {
          // If style has a width, we can use it to request an appropriately sized image from Cloudinary
          let targetWidth = 800;
          if (props.style) {
            const flatStyle = Array.isArray(props.style)
              ? Object.assign({}, ...props.style)
              : props.style;
            if (typeof flatStyle.width === "number") {
              targetWidth = flatStyle.width;
            }
          }
          newProps.source = resolveImageSource(props.source, targetWidth);
        }
        return originalRender.call(this, newProps, ref);
      };
      console.log("🛠️ [Cloudinary] Global Image.render patched successfully.");
    }
  } catch (e) {
    console.warn("⚠️ [Cloudinary] Failed to patch Image.render:", e);
  }

  try {
    const originalResolveAssetSource = Image.resolveAssetSource;
    if (typeof originalResolveAssetSource === "function") {
      Image.resolveAssetSource = function (source) {
        if (source && (source.bypassCloudinary || source.uri === "bypassCloudinary")) {
          const { bypassCloudinary, ...cleanSource } = source;
          return originalResolveAssetSource.call(this, cleanSource);
        }
        const resolved = resolveImageSource(source);
        return originalResolveAssetSource.call(this, resolved);
      };
      console.log("🛠️ [Cloudinary] Global Image.resolveAssetSource patched successfully.");
    }
  } catch (e) {
    console.warn("⚠️ [Cloudinary] Failed to patch Image.resolveAssetSource:", e);
  }

  Image.__cloudinaryPatched = true;
}


function RootLayoutNav() {
  const { i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const historyObject = window.history;
    if (!historyObject || historyObject.__anubisSafeHistoryPatched) {
      return;
    }

    const getNativeHistoryMethod = (methodName) => {
      const protoMethod = window.History?.prototype?.[methodName];
      if (typeof protoMethod === "function") {
        return protoMethod.bind(historyObject);
      }

      try {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        const iframeMethod = iframe.contentWindow?.history?.[methodName];
        document.body.removeChild(iframe);

        if (typeof iframeMethod === "function") {
          return iframeMethod.bind(historyObject);
        }
      } catch {
        // No-op: keep fallback chain.
      }

      return null;
    };

    const isNullDispatchEventError = (error) => {
      const message = String(error?.message || error || "").toLowerCase();
      return (
        message.includes("dispatchevent") &&
        (message.includes("null") || message.includes("undefined"))
      );
    };

    const originalPushState = historyObject.pushState?.bind(historyObject);
    const originalReplaceState =
      historyObject.replaceState?.bind(historyObject);
    const nativePushState = getNativeHistoryMethod("pushState");
    const nativeReplaceState = getNativeHistoryMethod("replaceState");

    const safeCall = (primary, nativeFallback, lastResort, args) => {
      try {
        return primary?.(...args);
      } catch (error) {
        if (!isNullDispatchEventError(error)) {
          throw error;
        }

        try {
          if (nativeFallback) {
            return nativeFallback(...args);
          }
        } catch {
          // No-op: try last resort.
        }

        if (lastResort) {
          return lastResort(...args);
        }

        return undefined;
      }
    };

    historyObject.pushState = (...args) =>
      safeCall(originalPushState, nativePushState, originalReplaceState, args);

    historyObject.replaceState = (...args) =>
      safeCall(
        originalReplaceState,
        nativeReplaceState,
        originalPushState,
        args,
      );

    historyObject.__anubisSafeHistoryPatched = true;
  }, []);

  useEffect(() => {
    const isRTL = i18nInstance.language === "ar";
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);

      if (Platform.OS === "web") {
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
        document.documentElement.lang = i18nInstance.language;
      }
    }
  }, [i18nInstance.language]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 300,
      }}
    />
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <RootLayoutNav />
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
