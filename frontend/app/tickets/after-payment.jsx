import { View, Text, StyleSheet } from "react-native";

export default function AfterPayment() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F5F0",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C2010",
  },
});
