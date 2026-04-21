import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATIONS_KEY = "local_notifications_v1";

export async function getLocalNotifications() {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addLocalNotification(notification) {
  try {
    const current = await getLocalNotifications();
    const withId = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...notification,
      createdAt: notification?.createdAt || new Date().toISOString(),
      source: notification?.source || "local",
      read: notification?.read ?? false,
    };
    const next = [withId, ...current].slice(0, 100);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
    return withId;
  } catch {
    return null;
  }
}

export async function updateLocalNotification(notificationId, patch) {
  try {
    const current = await getLocalNotifications();
    const next = current.map((item) =>
      item.id === notificationId ? { ...item, ...patch } : item,
    );
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export async function markLocalNotificationAsRead(notificationId) {
  return updateLocalNotification(notificationId, { read: true });
}

export async function markAllLocalNotificationsAsRead() {
  try {
    const current = await getLocalNotifications();
    const next = current.map((item) => ({ ...item, read: true }));
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export async function removeLocalNotification(notificationId) {
  try {
    const current = await getLocalNotifications();
    const next = current.filter((item) => item.id !== notificationId);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export async function clearLocalNotifications() {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
  } catch {
    // ignore
  }
}

export default function NotificationsStorageRouteStub() {
  return null;
}
