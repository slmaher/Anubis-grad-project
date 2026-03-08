import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ImageBackground, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { api } from "../api/client";
import { getAuthToken } from "../api/authStorage";

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          Alert.alert("Error", "You need to be logged in to view profiles.");
          router.back();
          return;
        }

        const response = await api.getUserProfile(id, token);
        const postsResponse = await api.getPosts(id);

        if (response.success && response.data) {
          setProfile(response.data);
          setUserPosts(postsResponse.data || []);
        } else {
          Alert.alert("Error", "Failed to load user profile.");
          router.back();
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        Alert.alert("Error", "Could not load user profile.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  const handleSendFriendRequest = () => {
    // In a real app, this would call an API
    setFriendRequestSent(true);
    Alert.alert("Success", `Friend request sent to ${profile?.name}!`);
  };

  const handleChat = () => {
    if (!profile) return;
    router.push({
      pathname: "/messagesList/chatScreen",
      params: {
        contactId: profile._id || id,
        contactName: profile.name,
        contactAvatar: profile.avatar || "",
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B5B4F" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  const avatarSource = profile.avatar 
    ? { uri: profile.avatar } 
    : require("../../assets/images/profile-farita.png"); // Default generic avatar

  return (
    <ImageBackground
      source={require("../../assets/images/community-background.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <Image source={avatarSource} style={styles.avatar} />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.role}>{profile.role || "Member"}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userPosts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>128</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton, friendRequestSent && styles.sentButton]} 
              onPress={handleSendFriendRequest}
              disabled={friendRequestSent}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                {friendRequestSent ? "✓ Request Sent" : "Add Friend"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleChat}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>User Posts</Text>
        
        {userPosts.length === 0 ? (
          <Text style={styles.noPostsText}>This user hasn't posted anything yet.</Text>
        ) : (
          userPosts.map((post) => (
            <View key={post._id || post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Image
                  source={avatarSource}
                  style={styles.postAvatar}
                />
                <View style={styles.postInfo}>
                  <Text style={styles.postAuthor}>{profile.name}</Text>
                  <Text style={styles.postTime}>
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : post.time || "Just now"}
                  </Text>
                </View>
              </View>

              <Text style={styles.postContent}>{post.content}</Text>
              {post.image && (
                <Image source={{ uri: post.image }} style={styles.postImage} />
              )}

              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>♡ {post.likes || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>💬</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EFEC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5EFEC",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5EFEC",
  },
  errorText: {
    fontSize: 18,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 20,
  },
  backIcon: {
    fontSize: 24,
    color: "#333",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A3E39",
  },
  headerRight: {
    width: 40, // To balance the back button
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: "#888",
    marginBottom: 25,
    textTransform: "capitalize",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: "100%",
    marginBottom: 30,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginHorizontal: 15,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 15,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#6B5B4F",
    shadowColor: "#6B5B4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sentButton: {
    backgroundColor: "#42A5F5",
    shadowColor: "#42A5F5",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#6B5B4F",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  primaryButtonText: {
    color: "#fff",
  },
  secondaryButtonText: {
    color: "#6B5B4F",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A3E39",
    marginTop: 30,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  noPostsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    marginTop: 20,
  },
  postCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginBottom: 15,
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  postTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  postContent: {
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
    resizeMode: "cover",
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
  },
  actionIcon: {
    fontSize: 18,
    color: "#666",
  },
});
