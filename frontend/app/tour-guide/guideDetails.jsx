import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const DEFAULT_AVATAR = require("../../assets/images/profile-farita.png");

export default function GuideDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const guide = params.guide ? JSON.parse(params.guide) : null;

  if (!guide) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Guide not found.</Text>
      </View>
    );
  }

  const avatarSource = guide.avatar ? { uri: guide.avatar } : DEFAULT_AVATAR;

  const handleChatNow = () => {
    if (!guide?.userId) return;

    router.push({
      pathname: "/messagesList/chatScreen",
      params: {
        contactId: guide.userId,
        contactName: guide.name,
        contactAvatar: guide.avatar || "",
      },
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/images/beige-background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={30} color="#2C2010" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Guide Profile</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profileCard}>
            <Image source={avatarSource} style={styles.avatar} />

            <Text style={styles.name}>{guide.name}</Text>
            <Text style={styles.email}>{guide.email}</Text>

            <View style={styles.badgesRow}>
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check-decagram" size={14} color="#fff" />
                <Text style={styles.badgeText}>Verified</Text>
              </View>

              {guide.expert ? (
                <View style={styles.expertBadge}>
                  <MaterialCommunityIcons name="medal" size={14} color="#fff" />
                  <Text style={styles.badgeText}>Expert</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{guide.ratingValue?.toFixed?.(1) || "0.0"}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statValue}>{guide.totalTours || 0}</Text>
                <Text style={styles.statLabel}>Tours</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statValue}>{guide.hourlyRate || 0}</Text>
                <Text style={styles.statLabel}>EGP/hr</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{guide.bio}</Text>

            <View style={styles.infoBox}>
              <View style={styles.infoHeader}>
                <MaterialCommunityIcons name="map-marker-star-outline" size={19} color="#D9A441" />
                <Text style={styles.infoLabel}>Specialities</Text>
              </View>
              <Text style={styles.infoValue}>{guide.specialtiesText}</Text>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoHeader}>
                <MaterialCommunityIcons name="translate" size={19} color="#D9A441" />
                <Text style={styles.infoLabel}>Languages</Text>
              </View>
              <Text style={styles.infoValue}>{guide.languagesText}</Text>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoHeader}>
                <MaterialCommunityIcons name="briefcase-clock-outline" size={19} color="#D9A441" />
                <Text style={styles.infoLabel}>Experience</Text>
              </View>
              <Text style={styles.infoValue}>
                {guide.experienceYears} {guide.experienceYears === 1 ? "year" : "years"}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.chatBtn} onPress={handleChatNow} activeOpacity={0.85}>
            <MaterialCommunityIcons name="chat-processing-outline" size={19} color="#fff" />
            <Text style={styles.chatText}>Chat now</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE6DF",
  },
  safeArea: {
    flex: 1,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDE6DF",
  },
  emptyText: {
    color: "#8B7B6C",
    fontSize: 15,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2C2010",
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: "rgba(249,247,244,0.98)",
    borderRadius: 26,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    elevation: 4,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: "#D9A441",
    marginBottom: 14,
  },
  name: {
    fontSize: 25,
    fontWeight: "900",
    color: "#2C2010",
  },
  email: {
    marginTop: 4,
    fontSize: 13,
    color: "#8B7B6C",
    fontWeight: "600",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  verifiedBadge: {
    backgroundColor: "#1FAF38",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  expertBadge: {
    backgroundColor: "#F4B860",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  statsRow: {
    marginTop: 18,
    width: "100%",
    flexDirection: "row",
    backgroundColor: "rgba(184, 150, 90, 0.12)",
    borderRadius: 18,
    paddingVertical: 14,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#D9A441",
  },
  statLabel: {
    marginTop: 3,
    fontSize: 12,
    color: "#8B7B6C",
    fontWeight: "700",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(44,32,16,0.15)",
  },
  detailsCard: {
    marginTop: 16,
    backgroundColor: "rgba(249,247,244,0.98)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2C2010",
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: "#8B7B6C",
    lineHeight: 21,
    fontWeight: "600",
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: "rgba(184, 150, 90, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(184, 150, 90, 0.20)",
    borderRadius: 16,
    padding: 13,
    marginBottom: 11,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#2C2010",
  },
  infoValue: {
    fontSize: 13,
    color: "#8B7B6C",
    lineHeight: 19,
    fontWeight: "700",
  },
  chatBtn: {
    marginTop: 18,
    backgroundColor: "#756557",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    elevation: 4,
  },
  chatText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
});