import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ImageBackground,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { api } from "../api/client";
import { getAuthToken } from "../api/authStorage";

export default function Community() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostModalVisible, setPostModalVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await api.getPosts();
      setPosts(response.data || []);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedImage) return;
    try {
      const token = await getAuthToken();
      if (!token) {
        alert(t("community.must_be_logged_in"));
        return;
      }

      let base64Image = selectedImage;
      if (selectedImage && !selectedImage.startsWith("data:")) {
        // Optionally, handling base64, but assuming the image is processed properly
      }

      await api.createPost(
        { content: newPostContent, image: base64Image },
        token,
      );
      setPostModalVisible(false);
      setNewPostContent("");
      setSelectedImage(null);
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error("Failed to create post:", error);
      alert(t("community.failed_create_post") + " " + error.message);
    }
  };

  const handleUserClick = (userId) => {
    if (!userId) return;
    router.push(`/user/${userId}`);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      if (result.assets[0].base64) {
        setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      } else {
        setSelectedImage(result.assets[0].uri);
      }
    }
  };

  const stories = [
    {
      id: 1,
      name: t("community.you"),
      image: require("../../assets/images/profile-you.png"),
      isUser: true,
    },
    {
      id: 2,
      name: "Benjamin",
      image: require("../../assets/images/profile-benjamin.png"),
      isUser: false,
    },
    {
      id: 3,
      name: "Farita",
      image: require("../../assets/images/profile-farita.png"),
      isUser: false,
    },
    {
      id: 4,
      name: "Marie",
      image: require("../../assets/images/profile-marie.png"),
      isUser: false,
    },
    {
      id: 5,
      name: "Claire",
      image: require("../../assets/images/profile-claire.png"),
      isUser: false,
    },
  ];

  return (
    <ImageBackground
      source={require("../../assets/images/community-background.png")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)/home")}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t("community.title")}</Text>

        <TouchableOpacity style={styles.helpButton}>
          <MaterialCommunityIcons
            name="help-circle-outline"
            size={24}
            color="#2C2010"
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.menuIcon}>
            <MaterialCommunityIcons name="menu" size={18} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder={t("community.search_placeholder")}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.searchIconButton}>
            <MaterialCommunityIcons name="magnify" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stories/Avatars Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storiesContainer}
          contentContainerStyle={styles.storiesContent}
        >
          {stories.map((story) => (
            <TouchableOpacity key={story.id} style={styles.storyItem}>
              <View
                style={[
                  styles.storyAvatar,
                  story.isUser && styles.storyAvatarUser,
                ]}
              >
                <Image source={story.image} style={styles.avatarImage} />
                {story.isUser && (
                  <View style={styles.plusIconContainer}>
                    <MaterialCommunityIcons
                      name="plus"
                      size={14}
                      color="#fff"
                    />
                  </View>
                )}
              </View>
              <Text style={styles.storyName}>{story.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Posts */}
        {/* Recent Posts */}
        <Text style={styles.sectionTitle}>{t("community.recent_posts")}</Text>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#000"
            style={{ marginTop: 20 }}
          />
        ) : posts.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            {t("community.no_posts")}
          </Text>
        ) : (
          posts.map((post) => (
            <View key={post._id || post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Image
                  source={
                    post.user && post.user.avatar
                      ? { uri: post.user.avatar }
                      : require("../../assets/images/profile-you.png")
                  }
                  style={styles.postAvatar}
                />
                <View style={styles.postInfo}>
                  <TouchableOpacity
                    onPress={() =>
                      handleUserClick(post.user?._id || post.user?.id)
                    }
                  >
                    <Text style={styles.postAuthor}>
                      {post.user?.name ||
                        post.author ||
                        t("community.anonymous")}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.postTime}>
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : post.time || t("community.just_now")}
                  </Text>
                </View>
              </View>

              <Text style={styles.postContent}>{post.content}</Text>
              {post.image && (
                <Image source={{ uri: post.image }} style={styles.postImage} />
              )}

              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <View style={styles.actionRow}>
                    <MaterialCommunityIcons
                      name="heart-outline"
                      size={18}
                      color="#666"
                    />
                    <Text style={styles.actionCount}>{post.likes || 0}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialCommunityIcons
                    name="comment-outline"
                    size={18}
                    color="#666"
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialCommunityIcons
                    name="share-outline"
                    size={18}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPostModalVisible}
        onRequestClose={() => setPostModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("community.create_post")}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setPostModalVisible(false);
                  setSelectedImage(null);
                  setNewPostContent("");
                }}
              >
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.postInput}
              placeholder={t("community.whats_going_on")}
              multiline
              value={newPostContent}
              onChangeText={setNewPostContent}
              placeholderTextColor="#999"
              autoFocus={true}
            />

            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.imagePreview}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
                <MaterialCommunityIcons
                  name="camera-outline"
                  size={18}
                  color="#333"
                  style={styles.attachIcon}
                />
                <Text style={styles.attachText}>
                  {t("community.add_photo")}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.postButton,
                !newPostContent.trim() &&
                  !selectedImage &&
                  styles.postButtonDisabled,
              ]}
              disabled={!newPostContent.trim() && !selectedImage}
              onPress={handleCreatePost}
            >
              <Text style={styles.postButtonText}>{t("community.post")}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setPostModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Floating Bottom Navigation Bar with Glass Effect */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/tour-guide")}
          >
            <MaterialCommunityIcons
              name="map-marker-account-outline"
              size={30}
              color="#2C2010"
            />
            <Text style={styles.navLabel}>{t("community.tour_guide")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/messagesList")}
          >
            <MaterialCommunityIcons
              name="message-text-outline"
              size={30}
              color="#2C2010"
            />
            <Text style={styles.navLabel}>{t("community.chat")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/volunteering")}
          >
            <MaterialCommunityIcons
              name="hand-heart-outline"
              size={30}
              color="#2C2010"
            />
            <Text style={styles.navLabel}>{t("community.volunteering")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8DDD0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2010",
  },
  helpButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "90%",
    alignSelf: "center",
  },
  menuIcon: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  searchIconButton: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    width: 24,
    height: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  storiesContainer: {
    marginBottom: 20,
  },
  storiesContent: {
    paddingHorizontal: 20,
    gap: 15,
  },
  storyItem: {
    alignItems: "center",
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#D4AF37",
    padding: 2,
    marginBottom: 5,
    position: "relative",
  },
  storyAvatarUser: {
    borderColor: "#4A90E2",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
  },
  plusIconContainer: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  storyName: {
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2010",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  postCard: {
    backgroundColor: "rgba(245, 245, 245, 0.95)",
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 15,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
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
    gap: 10,
  },
  actionButton: {
    padding: 5,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionCount: {
    color: "#666",
    fontSize: 12,
  },
  fab: {
    position: "absolute",
    bottom: 85,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 28,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 15,
    left: 15,
    right: 15,
  },
  bottomNav: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    alignItems: "center",
    gap: 5,
  },
  navLabel: {
    fontSize: 11,
    color: "#444141",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: "50%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  closeModalText: {
    fontSize: 20,
    color: "#666",
    padding: 5,
  },
  postInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
    minHeight: 150,
  },
  postButton: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  postButtonDisabled: {
    backgroundColor: "#ccc",
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    paddingVertical: 10,
    position: "relative",
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 20,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalActions: {
    flexDirection: "row",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 10,
  },
  attachButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  attachIcon: {
    marginRight: 5,
  },
  attachText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
});
