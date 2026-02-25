import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function Community() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const stories = [
    { id: 1, name: "You", image: require("../../assets/images/profile-you.png"), isUser: true },
    { id: 2, name: "Benjamin", image: require("../../assets/images/profile-benjamin.png"), isUser: false },
    { id: 3, name: "Farita", image: require("../../assets/images/profile-farita.png"), isUser: false },
    { id: 4, name: "Marie", image: require("../../assets/images/profile-marie.png"), isUser: false },
    { id: 5, name: "Claire", image: require("../../assets/images/profile-claire.png"), isUser: false },
  ];

  const posts = [
    {
      id: 1,
      author: "James",
      time: "1 hour ago",
      content: "Loved my visit to the Grand Egyptian Museum! Amazing exhibits and a wonderful atmosphere — a must-see in Egypt!",
      avatar: require("../../assets/images/profile-james.png"),
      likes: 0,
    },
    {
      id: 2,
      author: "Tomas",
      time: "2 hour ago",
      content: "Hello! I'm heading to the National Museum of Egyptian Civilization on Saturday, October 19th at 11:00 AM. If anyone is interested in visiting, let's go together and enjoy the tour!",
      avatar: require("../../assets/images/profile-tomas.png"),
      likes: 0,
    },
    {
      id: 3,
      author: "Alex",
      time: "3 hour ago",
      content: "A hidden gem! The Museum of Islamic Art showcases breathtaking patterns, calligraphy, and rare historical artifacts. It's peaceful, informative, and beautifully designed.",
      avatar: require("../../assets/images/profile-alex.png"),
      likes: 0,
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
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Community</Text>
        
        <TouchableOpacity style={styles.helpButton}>
          <Image
            source={require("../../assets/images/question-icon.png")}
            style={styles.questionIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.menuIcon}>
            <Text style={styles.menuIconText}>☰</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.searchIconButton}>
            <Image
              source={require("../../assets/images/search-icon.png")}
              style={styles.searchIcon}
            />
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
              <View style={[
                styles.storyAvatar, 
                story.isUser && styles.storyAvatarUser
              ]}>
                <Image
                  source={story.image}
                  style={styles.avatarImage}
                />
                {story.isUser && (
                  <View style={styles.plusIconContainer}>
                    <Text style={styles.plusIcon}>+</Text>
                  </View>
                )}
              </View>
              <Text style={styles.storyName}>{story.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Posts */}
        <Text style={styles.sectionTitle}>Recent posts</Text>

        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Image
                source={post.avatar}
                style={styles.postAvatar}
              />
              <View style={styles.postInfo}>
                <Text style={styles.postAuthor}>{post.author}</Text>
                <Text style={styles.postTime}>{post.time}</Text>
              </View>
            </View>

            <Text style={styles.postContent}>{post.content}</Text>

            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>♡</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Floating Bottom Navigation Bar with Glass Effect */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push("/tour-guide")}
          >
            <Image
              source={require("../../assets/images/tour-guide-icon.png")}
              style={styles.navIcon}
            />
            <Text style={styles.navLabel}>Tour Guide</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push("/messagesList")}
          >
            <Image
              source={require("../../assets/images/chat-icon.png")}
              style={styles.navIcon}
            />
            <Text style={styles.navLabel}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push("/volunteering")}
          >
            <Image
              source={require("../../assets/images/volunteering-icon.png")}
              style={styles.navIcon}
            />
            <Text style={styles.navLabel}>Volunteering</Text>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: "#000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8B7B6C",
  },
  helpButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  questionIcon: {
    width: 24,
    height: 24,
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
    paddingHorizontal: 15,
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
  },
  menuIconText: {
    fontSize: 18,
    color: "#666",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  searchIconButton: {
    marginLeft: 10,
    width: 20,
    height: 20,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "#666",
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
  plusIcon: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  storyName: {
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#917466",
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
  postActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
  },
  actionButton: {
    padding: 5,
  },
  actionIcon: {
    fontSize: 18,
    color: "#666",
  },
  fab: {
    position: "absolute",
    bottom: 105,
    right: 20,
    width: 56,
    height: 56,
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
  fabIcon: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "300",
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
    paddingVertical: 12,
    paddingHorizontal: 20,
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
  navIcon: {
    width: 26,
    height: 26,
  },
  navLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
});