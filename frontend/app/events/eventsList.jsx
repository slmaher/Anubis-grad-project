import {
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

const EVENT_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80',
};

const events = [
  { date: '17 Aug', time: '17:00 PM' },
  { date: '23 Aug', time: '17:00 PM' },
  { date: '2 Sep', time: '17:00 PM' },
];

const EventCard = ({ time }) => (
  <View style={styles.card}>
    <ImageBackground source={EVENT_IMAGE} style={styles.cardImage}>
      <View style={styles.overlay}>
        
        <TouchableOpacity style={styles.ticketBtn}>
          <Text style={styles.ticketText}>Buy ticket →</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.eventTitle}>Grand Egyptian Museum</Text>
          <Text style={styles.eventTime}>{time}</Text>
        </View>

      </View>
    </ImageBackground>
  </View>
);

export default function EventsListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.back}>‹</Text>

          <View style={styles.headerIcons}>
            <Text style={styles.icon}>🔔</Text>
            <Text style={styles.icon}>≡</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Text style={styles.activeTab}>All</Text>
          <Text style={styles.tab}>Now</Text>
          <Text style={styles.tab}>Upcoming</Text>
          <Text style={styles.tab}>Past</Text>
        </View>

        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Events list</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        {/* Timeline */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {events.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              
              {/* Date */}
              <View style={styles.dateContainer}>
                <Text style={styles.date}>{item.date}</Text>
              </View>

              {/* Line */}
              <View style={styles.line} />

              {/* Card */}
              <EventCard time={item.time} />

            </View>
          ))}
        </ScrollView>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  back: {
    fontSize: 28,
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    fontSize: 16,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  tab: {
    color: '#aaa',
    fontSize: 14,
  },
  activeTab: {
    color: '#000',
    fontWeight: '700',
  },

  // Title
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 12,
    color: '#888',
  },

  // Timeline
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  dateContainer: {
    width: 60,
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#d00',
    fontWeight: '500',
  },

  line: {
    width: 2,
    backgroundColor: '#eee',
    marginHorizontal: 10,
  },

  // Card
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    height: 140,
    justifyContent: 'space-between',
  },

  overlay: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  ticketBtn: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  ticketText: {
    color: '#fff',
    fontSize: 12,
  },

  eventTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  eventTime: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
});