import Constants from "expo-constants";
import { Platform } from "react-native";

function normalizeBaseUrl(value) {
  if (!value) {
    return "";
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return "";
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `http://${trimmed}`;

  return withProtocol.replace(/\/+$/, "");
}

function getExpoHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  if (!hostUri) {
    return "";
  }

  return String(hostUri).split(":")[0];
}

function resolveApiBaseUrl() {
  const envBase = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);
  if (envBase) {
    return envBase;
  }

  const expoHost = getExpoHost();
  if (expoHost) {
    return `http://${expoHost}:4000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000";
  }

  return "http://localhost:4000";
}

export const API_BASE_URL = resolveApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;
