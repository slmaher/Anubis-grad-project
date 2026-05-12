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
  Share,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { api } from "../api/client";
import { getAuthToken, getAuthUser } from "../api/authStorage";

const DARK = "#644b2f";
const MUTED = "#8B7B6C";
const ACCENT = "#46392c";
const GOLD = "#D4AF37";
const CARD_BG = "rgba(255,255,255,0.86)";
const BORDER = "rgba(255,255,255,0.9)";

export default function Community() {
  const router = useRouter();
  const { t } = useTranslation();
  const MAX_POST_IMAGE_LENGTH = 2_000_000;

  const [searchQuery, setSearchQuery] = useState("");
  const [isHelpVisible, setHelpVisible] = useState(false);

  const [isPostModalVisible, setPostModalVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isCommentSubmitting, setCommentSubmitting] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);

  const [isLikingPostId, setIsLikingPostId] = useState(null);

  const [postMenuId, setPostMenuId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editPostContent, setEditPostContent] = useState("");

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
    const bootstrap = async () => {
      const authUser = await getAuthUser();
      setCurrentUserId(authUser?._id || authUser?.id || null);
      fetchPosts();
    };

    bootstrap();
  }, []);

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (typeof value._id === "string") return value._id;
      if (typeof value.id === "string") return value.id;
    }
    return String(value);
  };

  const isCurrentUserPost = (post) => {
    const postUserId = normalizeId(post.user || post.userId || post.authorId);
    return currentUserId && postUserId === currentUserId;
  };

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return posts;

    return posts.filter((post) => {
      const author =
        post.user?.name || post.author || t("community.anonymous");
      const content = post.content || "";
      const comments = Array.isArray(post.comments)
        ? post.comments
            .map((comment) => `${comment.user?.name || ""} ${comment.content}`)
            .join(" ")
        : "";

      return `${author} ${content} ${comments}`.toLowerCase().includes(q);
    });
  }, [posts, searchQuery]);

  const isPostLikedByCurrentUser = (post) => {
    if (!currentUserId || !Array.isArray(post?.likedBy)) return false;

    return post.likedBy.some(
      (likedUser) => normalizeId(likedUser) === currentUserId,
    );
  };

  const handleToggleLike = async (postId) => {
    if (!postId || isLikingPostId === postId) return;

    try {
      const token = await getAuthToken();
      if (!token) {
        alert(t("community.must_be_logged_in"));
        return;
      }

      setIsLikingPostId(postId);
      const response = await api.togglePostLike(postId, token);
      const likes = response?.data?.likes;
      const liked = response?.data?.liked;

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          const id = post._id || post.id;
          if (id !== postId) return post;

          const currentLikedBy = Array.isArray(post.likedBy)
            ? post.likedBy
            : [];

          const filteredLikedBy = currentLikedBy.filter(
            (likedUser) => normalizeId(likedUser) !== currentUserId,
          );

          return {
            ...post,
            likes: typeof likes === "number" ? likes : post.likes || 0,
            likedBy:
              liked && currentUserId
                ? [...filteredLikedBy, currentUserId]
                : filteredLikedBy,
          };
        }),
      );
    } catch (error) {
      alert(error.message || "Failed to update like.");
    } finally {
      setIsLikingPostId(null);
    }
  };

  const openCommentModal = (postId) => {
    setActivePostId(postId);
    setNewComment("");
    setReplyTarget(null);
    setCommentModalVisible(true);
  };

  const handleAddComment = async () => {
    if (!activePostId || !newComment.trim() || isCommentSubmitting) return;

    try {
      const token = await getAuthToken();
      if (!token) {
        alert(t("community.must_be_logged_in"));
        return;
      }

      setCommentSubmitting(true);

      const finalContent = replyTarget
        ? `↳ Reply to ${replyTarget.author}: ${newComment.trim()}`
        : newComment.trim();

      const response = await api.addPostComment(activePostId, finalContent, token);

      if (response?.data) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            const id = post._id || post.id;
            return id === activePostId ? response.data : post;
          }),
        );
      }

      setNewComment("");
      setReplyTarget(null);
    } catch (error) {
      alert(error.message || "Failed to add comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedImage) return;

    try {
      const token = await getAuthToken();
      if (!token) {
        alert(t("community.must_be_logged_in"));
        return;
      }

      let imagePayload = null;

      if (selectedImage?.startsWith("data:")) {
        if (selectedImage.length > MAX_POST_IMAGE_LENGTH) {
          alert(
            "The selected image is too large to upload. Please choose a smaller image.",
          );
          return;
        }

        imagePayload = selectedImage;
      }

      await api.createPost(
        {
          content: newPostContent,
          ...(imagePayload ? { image: imagePayload } : {}),
        },
        token,
      );

      setPostModalVisible(false);
      setNewPostContent("");
      setSelectedImage(null);
      fetchPosts();
    } catch (error) {
      console.error("Failed to create post:", error);
      alert(t("community.failed_create_post") + " " + error.message);
    }
  };

  const handleEditPost = (post) => {
    setPostMenuId(null);
    setEditingPost(post);
    setEditPostContent(post.content || "");
  };

  const handleSaveEditedPost = async () => {
    if (!editingPost || !editPostContent.trim()) return;

    try {
      const token = await getAuthToken();
      if (!token) {
        alert(t("community.must_be_logged_in"));
        return;
      }

      const postId = editingPost._id || editingPost.id;
      const response = await api.updatePost(
        postId,
        { content: editPostContent.trim() },
        token,
      );

      if (response?.data) {
        setPosts((prev) =>
          prev.map((post) => ((post._id || post.id) === postId ? response.data : post)),
        );
      } else {
        setPosts((prev) =>
          prev.map((post) =>
            (post._id || post.id) === postId
              ? { ...post, content: editPostContent.trim() }
              : post,
          ),
        );
      }

      setEditingPost(null);
      setEditPostContent("");
    } catch (error) {
      Alert.alert("Edit failed", error.message || "Could not edit this post.");
    }
  };

  const handleDeletePost = async (post) => {
    setPostMenuId(null);

    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getAuthToken();
            if (!token) {
              alert(t("community.must_be_logged_in"));
              return;
            }

            const postId = post._id || post.id;
            await api.deletePost(postId, token);

            setPosts((prev) =>
              prev.filter((item) => (item._id || item.id) !== postId),
            );
          } catch (error) {
            Alert.alert(
              "Delete failed",
              error.message || "Could not delete this post.",
            );
          }
        },
      },
    ]);
  };

  const handleSharePost = async (post) => {
    try {
      const author = post.user?.name || post.author || t("community.anonymous");

      await Share.share({
        title: "Anubis Community Post",
        message: `${author} shared on Anubis Community:\n\n${post.content || ""}`,
      });
    } catch (error) {
      Alert.alert("Share failed", "Could not share this post.");
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
      quality: 0.25,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]?.base64) {
      setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const activePost = posts.find(
    (post) => (post._id || post.id) === activePostId,
  );

  const activePostComments = Array.isArray(activePost?.comments)
    ? activePost.comments
    : [];

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/images/beige-background.jpeg")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={30} color={DARK} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{t("community.title")}</Text>

          <TouchableOpacity
            style={styles.helpButton}
            onPress={(event) => {
              event.stopPropagation();
              setHelpVisible((prev) => !prev);
            }}
          >
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={25}
              color={DARK}
            />
          </TouchableOpacity>
        </View>

        {isHelpVisible && (
          <View style={styles.helpTooltip}>
            <View style={styles.helpTooltipHeader}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={20}
                color={DARK}
              />
              <Text style={styles.helpTooltipTitle}>Community Guide</Text>
            </View>
            <Text style={styles.helpTooltipText}>
              Share your museum experiences, post photos, like posts, comment,
              reply to visitors, chat with friends, find tour guides, and join
              volunteering opportunities.
            </Text>
          </View>
        )}

        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={MUTED} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search profiles or posts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.trim().length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color={MUTED}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.scrollContent}
  onScrollBeginDrag={() => {
    setHelpVisible(false);
    setPostMenuId(null);
  }}
        >
          <Text style={styles.sectionTitle}>{t("community.recent_posts")}</Text>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={DARK}
              style={{ marginTop: 20 }}
            />
          ) : filteredPosts.length === 0 ? (
            <View style={styles.emptyPostsBox}>
              <MaterialCommunityIcons
                name="text-search"
                size={34}
                color={MUTED}
              />
              <Text style={styles.emptyPostsText}>No posts found.</Text>
            </View>
          ) : (
            filteredPosts.map((post) => {
              const postId = post._id || post.id;
              const canManage = isCurrentUserPost(post);

              return (
                <View key={postId} style={styles.postCard}>
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

                    {canManage && (
                      <TouchableOpacity
                        style={styles.postMenuButton}
                        onPress={(event) => {
                          event.stopPropagation();
                          setPostMenuId(postMenuId === postId ? null : postId);
                        }}
                      >
                        <MaterialCommunityIcons
                          name="dots-horizontal"
                          size={24}
                          color={MUTED}
                        />
                      </TouchableOpacity>
                    )}

                    {postMenuId === postId && (
                      <View style={styles.postMenu}>
                        <TouchableOpacity
                          style={styles.postMenuItem}
                          onPress={() => handleEditPost(post)}
                        >
                          <MaterialCommunityIcons
                            name="pencil-outline"
                            size={16}
                            color={DARK}
                          />
                          <Text style={styles.postMenuText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.postMenuItem}
                          onPress={() => handleDeletePost(post)}
                        >
                          <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={16}
                            color="#B3261E"
                          />
                          <Text style={[styles.postMenuText, { color: "#B3261E" }]}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <Text style={styles.postContent}>{post.content}</Text>

                  {post.image && (
                    <Image
                      source={{ uri: post.image }}
                      style={styles.postImage}
                    />
                  )}

                  <View style={styles.postActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleToggleLike(postId)}
                      disabled={isLikingPostId === postId}
                    >
                      <View style={styles.actionRow}>
                        <MaterialCommunityIcons
                          name={
                            isPostLikedByCurrentUser(post)
                              ? "heart"
                              : "heart-outline"
                          }
                          size={20}
                          color={
                            isPostLikedByCurrentUser(post) ? "#d43f3a" : MUTED
                          }
                        />
                        <Text style={styles.actionCount}>{post.likes || 0}</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => openCommentModal(postId)}
                    >
                      <View style={styles.actionRow}>
                        <MaterialCommunityIcons
                          name="comment-text-outline"
                          size={20}
                          color={MUTED}
                        />
                        <Text style={styles.actionCount}>
                          {Array.isArray(post.comments)
                            ? post.comments.length
                            : 0}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSharePost(post)}
                    >
                      <MaterialCommunityIcons
                        name="share-variant-outline"
                        size={20}
                        color={MUTED}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

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
                <Text style={styles.modalTitle}>{t("community.create_post")}</Text>
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
                autoFocus
              />

              {selectedImage && (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
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
                    name="image-plus"
                    size={18}
                    color={DARK}
                    style={styles.attachIcon}
                  />
                  <Text style={styles.attachText}>{t("community.add_photo")}</Text>
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

        <Modal
          animationType="slide"
          transparent={true}
          visible={isCommentModalVisible}
          onRequestClose={() => {
            setCommentModalVisible(false);
            setNewComment("");
            setReplyTarget(null);
          }}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Comments</Text>
                <TouchableOpacity
                  onPress={() => {
                    setCommentModalVisible(false);
                    setNewComment("");
                    setReplyTarget(null);
                  }}
                >
                  <Text style={styles.closeModalText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.commentsList}
                contentContainerStyle={styles.commentsListContent}
                keyboardShouldPersistTaps="handled"
              >
                {activePostComments.length === 0 ? (
                  <Text style={styles.emptyCommentsText}>No comments yet.</Text>
                ) : (
                  activePostComments.map((comment, index) => {
                    const author =
                      comment.user?.name || t("community.anonymous");
                    return (
                      <View
                        key={comment._id || `${normalizeId(comment.user)}_${index}`}
                        style={styles.commentItem}
                      >
                        <View style={styles.commentTopRow}>
                          <Text style={styles.commentAuthor}>{author}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              setReplyTarget({
                                id: comment._id || index,
                                author,
                              })
                            }
                          >
                            <Text style={styles.replyText}>Reply</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.commentContent}>
                          {comment.content}
                        </Text>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              {replyTarget && (
                <View style={styles.replyTargetBox}>
                  <Text style={styles.replyTargetText}>
                    Replying to {replyTarget.author}
                  </Text>
                  <TouchableOpacity onPress={() => setReplyTarget(null)}>
                    <MaterialCommunityIcons
                      name="close"
                      size={16}
                      color={DARK}
                    />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder={
                    replyTarget
                      ? `Reply to ${replyTarget.author}...`
                      : "Write a comment..."
                  }
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={[
                    styles.sendCommentButton,
                    (!newComment.trim() || isCommentSubmitting) &&
                      styles.postButtonDisabled,
                  ]}
                  disabled={!newComment.trim() || isCommentSubmitting}
                  onPress={handleAddComment}
                >
                  <Text style={styles.sendCommentText}>
                    {isCommentSubmitting ? "..." : "Send"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={!!editingPost}
          onRequestClose={() => setEditingPost(null)}
        >
          <KeyboardAvoidingView
            style={styles.centerModalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.editModalCard}>
              <Text style={styles.modalTitle}>Edit Post</Text>

              <TextInput
                style={styles.editInput}
                multiline
                value={editPostContent}
                onChangeText={setEditPostContent}
                placeholder="Edit your post..."
                placeholderTextColor="#999"
              />

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditingPost(null)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveEditedPost}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setPostModalVisible(true)}
        >
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>

        <View style={styles.bottomNavContainer}>
          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push("/tour-guide")}
            >
              <MaterialCommunityIcons
                name="account-tie-hat-outline"
                size={27}
                color={DARK}
              />
              <Text style={styles.navLabel}>{t("community.tour_guide")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push("/messagesList")}
            >
              <MaterialCommunityIcons
                name="chat-processing-outline"
                size={27}
                color={DARK}
              />
              <Text style={styles.navLabel}>{t("community.chat")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push("/volunteering")}
            >
              <MaterialCommunityIcons
                name="hand-heart"
                size={27}
                color={DARK}
              />
              <Text style={styles.navLabel}>{t("community.volunteering")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
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
    paddingTop: 65,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: DARK,
  },
  helpButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  helpTooltip: {
    position: "absolute",
    top: 112,
    right: 20,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    zIndex: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 10,
  },
  helpTooltipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  helpTooltipTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: DARK,
  },
  helpTooltipText: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 19,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 10,
    width: "92%",
    alignSelf: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: DARK,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 125,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: DARK,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  emptyPostsBox: {
    marginHorizontal: 20,
    backgroundColor: CARD_BG,
    borderRadius: 18,
    paddingVertical: 30,
    alignItems: "center",
    gap: 8,
  },
  emptyPostsText: {
    color: MUTED,
    fontWeight: "600",
  },
  postCard: {
    backgroundColor: CARD_BG,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },
  postAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  postInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK,
  },
  postTime: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  postMenuButton: {
    padding: 4,
  },
  postMenu: {
    position: "absolute",
    top: 34,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 120,
    borderWidth: 1,
    borderColor: "#eee",
    zIndex: 20,
    elevation: 8,
  },
  postMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  postMenuText: {
    fontSize: 13,
    color: DARK,
    fontWeight: "600",
  },
  postContent: {
    fontSize: 15,
    color: DARK,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 210,
    borderRadius: 14,
    marginBottom: 12,
    resizeMode: "cover",
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(139,123,108,0.15)",
    paddingTop: 8,
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
    color: MUTED,
    fontSize: 12,
    fontWeight: "600",
  },
  commentsList: {
    maxHeight: 280,
  },
  commentsListContent: {
    paddingBottom: 8,
  },
  emptyCommentsText: {
    color: MUTED,
    textAlign: "center",
    marginVertical: 16,
  },
  commentItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
  },
  commentTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "800",
    color: DARK,
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
    color: ACCENT,
    fontWeight: "700",
  },
  commentContent: {
    fontSize: 13,
    color: DARK,
    lineHeight: 18,
  },
  replyTargetBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EFE7DC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 8,
  },
  replyTargetText: {
    fontSize: 12,
    color: DARK,
    fontWeight: "700",
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    marginTop: 6,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: DARK,
    fontSize: 14,
  },
  sendCommentButton: {
    backgroundColor: ACCENT,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendCommentText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    bottom: 88,
    right: 20,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.26,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  bottomNavContainer: {
    position: "absolute",
  bottom: 30,
  alignSelf: "center",
  width: "82%",
  },
  bottomNav: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  navLabel: {
    fontSize: 11,
    color: DARK,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  centerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: "50%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  editModalCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
  },
  editInput: {
    minHeight: 130,
    backgroundColor: "#f6f3ef",
    borderRadius: 16,
    padding: 14,
    color: DARK,
    textAlignVertical: "top",
    marginTop: 12,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#EFE7DC",
  },
  cancelButtonText: {
    color: DARK,
    fontWeight: "700",
  },
  saveButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: ACCENT,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK,
  },
  closeModalText: {
    fontSize: 20,
    color: MUTED,
    padding: 5,
  },
  postInput: {
    flex: 1,
    fontSize: 16,
    color: DARK,
    textAlignVertical: "top",
    minHeight: 150,
  },
  postButton: {
    backgroundColor: ACCENT,
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
    fontWeight: "700",
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
    backgroundColor: "#f5f1eb",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  attachIcon: {
    marginRight: 5,
  },
  attachText: {
    color: DARK,
    fontSize: 14,
    fontWeight: "600",
  },
});