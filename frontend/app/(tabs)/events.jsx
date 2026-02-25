import { View, Text, StyleSheet } from "react-native";

export default function Events() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Events</Text>
      <Text style={styles.subtitle}>Upcoming cultural events and exhibitions</Text>
      <Text style={styles.comingSoon}>Coming Soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  comingSoon: {
    fontSize: 14,
    color: "#D4AF37",
    fontWeight: "600",
    marginTop: 10,
  },
});
