import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { API_URL } from "../api/baseUrl";

const DEFAULT_AVATAR = require("../../assets/images/profile-benjamin.png");

function mapGuideFromApi(item) {
  const hourlyRate = Number(item?.hourlyRate || 0);
  const ratingValue = Number(item?.rating || 0);
  const totalTours = Number(item?.totalTours || 0);
  const languages = Array.isArray(item?.languages) ? item.languages : [];
  const specialties = Array.isArray(item?.specialties) ? item.specialties : [];

  return {
    id: item?._id,
    userId: item?.user?._id || "",
    name: item?.user?.name || "Unknown Guide",
    email: item?.user?.email || "",
    avatar: item?.user?.avatar || "",
    price: `${hourlyRate} EGP/hour`,
    hourlyRate,
    ratingValue,
    totalTours,
    rating: `${ratingValue.toFixed(1)} (${totalTours} tours)`,
    languages,
    languagesText:
      languages.length > 0 ? languages.join(", ") : "No languages added",
    languagesCount: `${languages.length} Languages`,
    specialties,
    specialtiesText:
      specialties.length > 0 ? specialties.join(", ") : "No specialties added",
    experienceYears: Number(item?.experienceYears || 0),
    bio: item?.bio || "No bio added yet.",
    expert: Number(item?.experienceYears || 0) >= 5,
  };
}

const GuideCard = ({ guide, t, onChat, onOpenProfile }) => {
  const avatarSource = guide.avatar ? { uri: guide.avatar } : DEFAULT_AVATAR;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onOpenProfile}
    >
      <View style={styles.topRow}>
        <View style={styles.leftRow}>
          <Image source={avatarSource} style={styles.avatar} />

          <View style={styles.mainInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {guide.name}
            </Text>

            <View style={styles.ratingRow}>
              <MaterialCommunityIcons name="star" size={14} color="#D9A441" />
              <Text style={styles.rating}>{guide.rating}</Text>
            </View>

            <View style={styles.tagsRow}>
              <View style={styles.verifiedTag}>
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={12}
                  color="#fff"
                />
                <Text style={styles.tagTextWhite}>{t("tour_guide.verified")}</Text>
              </View>

              <View style={styles.availableTag}>
                <MaterialCommunityIcons
                  name="circle"
                  size={8}
                  color="#fff"
                />
                <Text style={styles.tagTextWhite}>
                  {t("tour_guide.available_now")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.rightBlock}>
          <Text style={styles.price}>{guide.price}</Text>
          <Text style={styles.languageCount}>{guide.languagesCount}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.chatBtn}
        onPress={(e) => {
          e.stopPropagation();
          onChat();
        }}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="chat-processing-outline" size={16} color="#fff" />
        <Text style={styles.chatText}>Chat now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function TourGuideScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await fetch(`${API_URL}/tour-guides?limit=100`);
        const res = await response.json();

        if (response.ok && res?.success) {
          setGuides((res.data || []).map(mapGuideFromApi));
        } else {
          setGuides([]);
        }
      } catch (error) {
        setGuides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const filteredGuides = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return guides;

    return guides.filter((guide) => {
      const inName = guide.name.toLowerCase().includes(query);
      const inBio = guide.bio.toLowerCase().includes(query);
      const inSpecialties = guide.specialtiesText.toLowerCase().includes(query);
      const inLanguages = guide.languagesText.toLowerCase().includes(query);

      return inName || inBio || inSpecialties || inLanguages;
    });
  }, [guides, searchText]);

  const handleChatNow = (guide) => {
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

  const handleOpenProfile = (guide) => {
    router.push({
      pathname: "/tour-guide/guideDetails",
      params: {
        guide: JSON.stringify(guide),
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
        <View style={styles.pageContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color="#2C2010" />
            </TouchableOpacity>

            <Text style={styles.title}>{t("tour_guide.title")}</Text>

            <View style={styles.settingsButton} />
          </View>

          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={19} color="#8B7B6C" />

            <TextInput
              placeholder={t("tour_guide.search_placeholder")}
              placeholderTextColor="#8B7B6C"
              style={styles.input}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <Text style={styles.sectionTitle}>{t("tour_guide.available_guides")}</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#D9A441" />
            ) : filteredGuides.length === 0 ? (
              <Text style={styles.emptyState}>No tour guides found.</Text>
            ) : (
              filteredGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  t={t}
                  onChat={() => handleChatNow(guide)}
                  onOpenProfile={() => handleOpenProfile(guide)}
                />
              ))
            )}
          </ScrollView>
        </View>
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
  pageContent: {
    flex: 1,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2C2010",
    letterSpacing: 0.3,
  },
  settingsButton: {
    width: 40,
    height: 40,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    elevation: 3,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#2C2010",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#8B7B6C",
    marginBottom: 14,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  emptyState: {
    fontSize: 14,
    color: "#8B7B6C",
    textAlign: "center",
    marginTop: 24,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "rgba(249,247,244,0.98)",
    borderRadius: 20,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 13,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  mainInfo: {
    flex: 1,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "#D9A441",
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2C2010",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    color: "#8B7B6C",
    fontWeight: "700",
  },
  rightBlock: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "800",
    color: "#D9A441",
    textAlign: "right",
  },
  languageCount: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "700",
    color: "#8B7B6C",
  },
  tagsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },
  verifiedTag: {
    backgroundColor: "#1FAF38",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  availableTag: {
    backgroundColor: "#7A9A6C",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagTextWhite: {
    color: "#fff",
    fontSize: 10.5,
    fontWeight: "800",
  },
  chatBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#756557",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chatText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "800",
  },
});