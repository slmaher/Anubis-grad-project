import "intl-pluralrules";
import { Stack } from "expo-router";
import "../i18n/i18n";
import { useEffect } from "react";
import { useTranslation, I18nextProvider } from "react-i18next";
import { I18nManager, Platform } from "react-native";
import i18n from "../i18n/i18n";

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
    <I18nextProvider i18n={i18n}>
      <RootLayoutNav />
    </I18nextProvider>
  );
}
