import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { getAuthToken } from "../api/authStorage";
import { getFriendsList } from "../api/friendsStorage";

export default function FriendsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const token = await getAuthToken();
        if (token) {
          const res = await api.getFriends(token);
          if (res && res.success && Array.isArray(res.data)) {
            if (!mounted) return;
            setFriends(res.data);
            return;
          }
        }

        // fallback to local cached friends
        const local = await getFriendsList();
        if (!mounted) return;
        setFriends(local);
      } catch (err) {
        console.warn("Failed to load friends", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const openProfile = (item) => {
    const id = item._id || item.id;
    if (!id) return;
    router.push({ pathname: "/user/[id]", params: { id } });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => openProfile(item)}>
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.fallbackAvatar}>
          <Text style={styles.fallbackText}>
            {(item.name || "?").trim().charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{item.name || item.username || "Friend"}</Text>
        {item.mutualCount != null && (
          <Text style={styles.subtitle}>{`${item.mutualCount} mutual`}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/community")}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t("menu.friends")}</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#6B5B4F" />
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(i) => String(i._id || i.id || i.name || Math.random())}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No friends found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDE6DF" },
  header: {
    backgroundColor: "#6B5B4F",
    paddingTop: 80,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: "center",
  },
  backButton: { position: "absolute", top: 75, left: 20, width: 40, height: 40, justifyContent: "center", alignItems: "center", zIndex: 10 },
  backIcon: { fontSize: 28, color: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  listContent: { padding: 12, paddingBottom: 40 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#E5DED5" },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  fallbackAvatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12, backgroundColor: "#C4B5A0", alignItems: "center", justifyContent: "center" },
  fallbackText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600", color: "#2C2010" },
  subtitle: { fontSize: 13, color: "#9A8C7A", marginTop: 4 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { padding: 20, alignItems: "center" },
  emptyText: { color: "#8B7B6C", fontSize: 16 },
});
