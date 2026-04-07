import {
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
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

const guides = [
  {
    name: 'Ahmed Hassan',
    price: '$25/hour',
    rating: '4.9 (127 reviews)',
    languages: '5 Languages',
    expert: true,
  },
  {
    name: 'Sara Mohamed',
    price: '$30/hour',
    rating: '4.8 (80 reviews)',
    languages: '3 Languages',
    expert: false,
  },
  {
    name: 'Omar Ali',
    price: '$35/hour',
    rating: '4.7 (102 reviews)',
    languages: '4 Languages',
    expert: true,
  },
];

const GuideCard = ({ guide, t }) => {
  return (
    <View style={styles.card}>
      
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={styles.leftRow}>
          <Image
            source={{ uri: guide.avatar || 'https://i.pravatar.cc/100' }}
            style={styles.avatar}
          />

          <View>
            <Text style={styles.name}>{guide.name}</Text>
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons name="star" size={14} color="#FFB800" />
              <Text style={styles.rating}>{guide.rating} | {t("tour_guide.available_now")}</Text>
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
      <TouchableOpacity style={styles.bookBtn}>
        <Text style={styles.bookText}>{t("tour_guide.book_now")}</Text>
      </TouchableOpacity>

    </View>
  );
};

export default function TourGuideScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <ImageBackground
      source={require('../../assets/images/beige-background.jpeg')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#2C2010" />
          </TouchableOpacity>
          <Text style={styles.title}>{t("tour_guide.title")}</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <MaterialCommunityIcons name="cog" size={22} color="#2C2010" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="menu" size={18} color="#666" style={styles.searchIconLeft} />
          <TextInput
            placeholder={t("tour_guide.search_placeholder")}
            placeholderTextColor="#888"
            style={styles.input}
          />
          <MaterialCommunityIcons name="magnify" size={18} color="#666" style={styles.searchIconRight} />
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>{t("tour_guide.available_guides")}</Text>

        {/* Cards */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {guides.map((guide, index) => (
            <GuideCard key={index} guide={guide} t={t} />
          ))}
        </ScrollView>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE6DF',
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2010',
    letterSpacing: 0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: '#000',
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
    color: '#000',
  },

  // Section
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7B6C',
    marginBottom: 14,
    marginTop: 4,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  // Card
  card: {
    backgroundColor: '#F9F7F4',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0D5CC',
  },

  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C2010',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },

  rating: {
    fontSize: 11,
    color: '#8B7B6C',
    fontWeight: '500',
  },

  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C2010',
    textAlign: 'right',
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },

  tagGreen: {
    backgroundColor: '#1FAF38',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  tagOrange: {
    backgroundColor: '#F4B860',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  tagPurple: {
    backgroundColor: '#8A2BE2',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  tagTextWhite: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  // Button
  bookBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#D4CECC',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },

  bookText: {
    fontSize: 11,
    color: '#2C2010',
    fontWeight: '600',
  },
});