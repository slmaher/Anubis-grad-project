import { Stack } from "expo-router";
import "../i18n/i18n";
import { useEffect } from "react";
import { useTranslation, I18nextProvider } from "react-i18next";
import { I18nManager, Platform } from "react-native";
import i18n from "../i18n/i18n";

function RootLayoutNav() {
  const { i18n: i18nInstance } = useTranslation();

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
        animation: 'fade',
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
