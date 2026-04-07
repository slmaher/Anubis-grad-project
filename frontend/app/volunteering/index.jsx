import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';

const opportunities = [
  {
    title: 'Museum Tour Guide',
    desc: 'Help visitors discover amazing artifacts and share cultural stories during guided tours.',
    meta: ['4 hours/ week', 'Weekends', 'National Museum'],
  },
  {
    title: 'Heritage Garden Care',
    desc: 'Maintain traditional museum gardens and learn about historical Egyptian plant cultivation.',
    meta: ['3 hours/ week', 'Flexible', 'Botanical Gardens'],
  },
  {
    title: 'Art Workshop Assistant',
    desc: 'Help children learn traditional Egyptian art techniques and cultural crafts in weekend workshops.',
    meta: ['2 hours/ week', 'Saturdays', 'Cultural Center'],
  },
];

const OpportunityCard = ({ item, index }) => {
  const isSecond = index === 1;

  return (
    <View style={styles.card}>
      
      {/* Left Icon */}
      <View style={styles.iconBox}>
        <Text style={[styles.icon, isSecond && { color: '#2BB673' }]}>
          {isSecond ? '🌱' : '👤'}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>{item.desc}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>🕒 {item.meta[0]}</Text>
          <Text style={styles.meta}>📅 {item.meta[1]}</Text>
          <Text style={styles.meta}>📍 {item.meta[2]}</Text>
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.signBtn}>
        <Text style={styles.signText}>Sign up</Text>
      </TouchableOpacity>

    </View>
  );
};

export default function VolunteeringScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Volunteering</Text>
          <TouchableOpacity>
            <Text style={styles.settings}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Toggle */}
        <View style={styles.toggle}>
          <View style={styles.toggleActive}>
            <Text style={styles.toggleTextActive}>Volunteer</Text>
          </View>
          <View style={styles.toggleInactive}>
            <Text style={styles.toggleText}>Donate</Text>
          </View>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Volunteering opportunities</Text>

        {/* Cards */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {opportunities.map((item, index) => (
            <OpportunityCard key={index} item={item} index={index} />
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
    marginBottom: 20,
  },
  back: {
    fontSize: 28,
    color: '#000',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  settings: {
    fontSize: 18,
  },

  // Toggle
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#E6DFD8',
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  toggleActive: {
    flex: 1,
    backgroundColor: '#3A3735',
    borderRadius: 20,
    paddingVertical: 6,
    alignItems: 'center',
  },
  toggleInactive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTextActive: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  toggleText: {
    color: '#777',
    fontSize: 12,
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
    flexDirection: 'row',
    backgroundColor: '#F2ECE6',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
  },

  iconBox: {
    width: 40,
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
  },

  cardContent: {
    flex: 1,
    paddingHorizontal: 6,
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },

  cardDesc: {
    fontSize: 11,
    color: '#555',
    lineHeight: 16,
    marginBottom: 6,
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  meta: {
    fontSize: 10,
    color: '#444',
  },

  // Button
  signBtn: {
    backgroundColor: '#D9D3CC',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  signText: {
    fontSize: 10,
    color: '#000',
  },
});