import AsyncStorage from "@react-native-async-storage/async-storage";

const FRIENDS_KEY = "accepted_friends_v1";

export async function getFriendsList() {
  try {
    const raw = await AsyncStorage.getItem(FRIENDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addFriendToList(friend) {
  try {
    if (!friend?.id) return false;

    const current = await getFriendsList();
    const exists = current.some((item) => item.id === friend.id);
    if (exists) return true;

    const next = [
      {
        id: friend.id,
        name: friend.name || "Friend",
        avatar: friend.avatar || "",
        addedAt: new Date().toISOString(),
      },
      ...current,
    ].slice(0, 200);

    await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export default function FriendsStorageRouteStub() {
  return null;
}
