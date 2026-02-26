import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export async function saveAuthSession(data) {
  try {
    const token = data?.data?.accessToken || data?.accessToken;
    const user = data?.data?.user || data?.user;

    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
    if (user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.warn("Failed to persist auth session", error);
  }
}

export async function getAuthToken() {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearAuthSession() {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch {
    // ignore
  }
}

