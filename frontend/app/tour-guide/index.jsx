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
} from 'react-native';
import { useRouter } from 'expo-router';

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

const GuideCard = ({ guide }) => {
  return (
    <View style={styles.card}>
      
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={styles.leftRow}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100' }}
            style={styles.avatar}
          />

          <View>
            <Text style={styles.name}>{guide.name}</Text>
            <Text style={styles.rating}>⭐ {guide.rating} | Available Now</Text>
          </View>
        </View>

        <Text style={styles.price}>{guide.price}</Text>
      </View>

      {/* Tags */}
      <View style={styles.tagsRow}>
        <View style={styles.tagGreen}>
          <Text style={styles.tagTextWhite}>Verified</Text>
        </View>

        {guide.expert && (
          <View style={styles.tagOrange}>
            <Text style={styles.tagTextWhite}>Expert</Text>
          </View>
        )}

        <View style={styles.tagPurple}>
          <Text style={styles.tagTextWhite}>{guide.languages}</Text>
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.bookBtn}>
        <Text style={styles.bookText}>Book now</Text>
      </TouchableOpacity>

    </View>
  );
};

export default function TourGuideScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Tour guide</Text>
          <TouchableOpacity>
            <Text style={styles.settings}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>≡</Text>
          <TextInput
            placeholder="Search"
            placeholderTextColor="#888"
            style={styles.input}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Available tour guides</Text>

        {/* Cards */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {guides.map((guide, index) => (
            <GuideCard key={index} guide={guide} />
          ))}
        </ScrollView>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE6DF',
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 18,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  back: {
    fontSize: 28,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  settings: {
    fontSize: 18,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1ECE7',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 18,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 14,
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },

  // Section
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B6F5A',
    marginBottom: 12,
  },

  // Card
  card: {
    backgroundColor: '#F2ECE6',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  name: {
    fontSize: 13,
    fontWeight: '700',
  },

  rating: {
    fontSize: 11,
    color: '#555',
  },

  price: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },

  tagGreen: {
    backgroundColor: '#1FAF38',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  tagOrange: {
    backgroundColor: '#F4B860',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  tagPurple: {
    backgroundColor: '#8A2BE2',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  tagTextWhite: {
    color: '#fff',
    fontSize: 10,
  },

  // Button
  bookBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#CFC8C2',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },

  bookText: {
    fontSize: 10,
    color: '#000',
  },
});