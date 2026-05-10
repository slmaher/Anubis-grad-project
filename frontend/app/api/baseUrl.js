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

function extractHost(value) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).hostname;
  } catch {
    return String(value)
      .replace(/^https?:\/\//i, "")
      .split(":")[0]
      .split("/")[0];
  }
}

function isPrivateNetworkHost(host) {
  const normalized = String(host || "").trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  if (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1"
  ) {
    return true;
  }

  if (/^10\./.test(normalized) || /^192\.168\./.test(normalized)) {
    return true;
  }

  const match = normalized.match(/^172\.(\d{1,3})\./);
  if (!match) {
    return false;
  }

  const secondOctet = Number(match[1]);
  return secondOctet >= 16 && secondOctet <= 31;
}

function resolveApiBaseUrl() {
  const envBase = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);
  const expoHost = getExpoHost();

  if (envBase) {
    const envHost = extractHost(envBase);
    if (expoHost && isPrivateNetworkHost(envHost) && envHost !== expoHost) {
      return `http://${expoHost}:4000`;
    }

    return envBase;
  }

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

export default { API_BASE_URL, API_URL };
