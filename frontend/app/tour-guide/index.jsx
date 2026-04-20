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
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";

const API_URL = "http://localhost:4000/api";
const DEFAULT_AVATAR = "https://i.pravatar.cc/100";

function mapGuideFromApi(item) {
  const hourlyRate = Number(item?.hourlyRate || 0);
  const ratingValue = Number(item?.rating || 0);
  const totalTours = Number(item?.totalTours || 0);
  const languagesCount = Array.isArray(item?.languages)
    ? item.languages.length
    : 0;

  return {
    id: item?._id,
    userId: item?.user?._id || "",
    name: item?.user?.name || "Unknown Guide",
    avatar: item?.user?.avatar || DEFAULT_AVATAR,
    price: `$${hourlyRate}/hour`,
    rating: `${ratingValue.toFixed(1)} (${totalTours} tours)`,
    languages: `${languagesCount} Languages`,
    expert: Number(item?.experienceYears || 0) >= 5,
    specialties: Array.isArray(item?.specialties) ? item.specialties : [],
  };
}

const GuideCard = ({ guide, t, onChat }) => {
  return (
    <View style={styles.card}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={styles.leftRow}>
          <Image
            source={{ uri: guide.avatar || "https://i.pravatar.cc/100" }}
            style={styles.avatar}
          />

          <View>
            <Text style={styles.name}>{guide.name}</Text>
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons name="star" size={14} color="#FFB800" />
              <Text style={styles.rating}>
                {guide.rating} | {t("tour_guide.available_now")}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.price}>{guide.price}</Text>
      </View>

      {/* Tags */}
      <View style={styles.tagsRow}>
        <View style={styles.tagGreen}>
          <MaterialCommunityIcons name="check-circle" size={12} color="#fff" />
          <Text style={styles.tagTextWhite}>{t("tour_guide.verified")}</Text>
        </View>

        {guide.expert && (
          <View style={styles.tagOrange}>
            <MaterialCommunityIcons name="medal" size={12} color="#fff" />
            <Text style={styles.tagTextWhite}>{t("tour_guide.expert")}</Text>
          </View>
        )}

        <View style={styles.tagPurple}>
          <MaterialCommunityIcons name="translate" size={12} color="#fff" />
          <Text style={styles.tagTextWhite}>{guide.languages}</Text>
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.bookBtn} onPress={onChat}>
        <Text style={styles.bookText}>Chat now</Text>
      </TouchableOpacity>
    </View>
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
    if (!query) {
      return guides;
    }

    return guides.filter((guide) => {
      const inName = guide.name.toLowerCase().includes(query);
      const inSpecialties = guide.specialties.some((s) =>
        String(s).toLowerCase().includes(query),
      );
      return inName || inSpecialties;
    });
  }, [guides, searchText]);

  const handleChatNow = (guide) => {
    if (!guide?.userId) {
      return;
    }

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
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.pageContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={28}
                color="#2C2010"
              />
            </TouchableOpacity>
            <Text style={styles.title}>{t("tour_guide.title")}</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <MaterialCommunityIcons name="cog" size={22} color="#2C2010" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <MaterialCommunityIcons
              name="menu"
              size={18}
              color="#666"
              style={styles.searchIconLeft}
            />
            <TextInput
              placeholder={t("tour_guide.search_placeholder")}
              placeholderTextColor="#888"
              style={styles.input}
              value={searchText}
              onChangeText={setSearchText}
            />
            <MaterialCommunityIcons
              name="magnify"
              size={18}
              color="#666"
              style={styles.searchIconRight}
            />
          </View>

          {/* Section Title */}
          <Text style={styles.sectionTitle}>
            {t("tour_guide.available_guides")}
          </Text>

          {/* Cards */}
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

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2010",
    letterSpacing: 0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIconLeft: {
    marginRight: 10,
  },
  searchIconRight: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },

  // Section
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B7B6C",
    marginBottom: 14,
    marginTop: 4,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  emptyState: {
    fontSize: 14,
    color: "#8B7B6C",
    textAlign: "center",
    marginTop: 24,
  },

  // Card
  card: {
    backgroundColor: "#F9F7F4",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E0D5CC",
  },

  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C2010",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },

  rating: {
    fontSize: 11,
    color: "#8B7B6C",
    fontWeight: "500",
  },

  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C2010",
    textAlign: "right",
  },

  // Tags
  tagsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  tagGreen: {
    backgroundColor: "#1FAF38",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  tagOrange: {
    backgroundColor: "#F4B860",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  tagPurple: {
    backgroundColor: "#8A2BE2",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  tagTextWhite: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  // Button
  bookBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#D4CECC",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },

  bookText: {
    fontSize: 11,
    color: "#2C2010",
    fontWeight: "600",
  },
});
