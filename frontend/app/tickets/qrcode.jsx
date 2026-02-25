import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from "react-native";
import { useRouter } from "expo-router";

export default function QRCode() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/beige-background.jpeg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Tickets</Text>
          
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Your QR Code Label */}
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Your QR code</Text>
          </View>

          {/* QR Code Card */}
          <View style={styles.qrCard}>
            <View style={styles.qrContainer}>
              <Image
                source={require("../../assets/images/qr-code.jpeg")}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Scan your QR code at the gate to enter
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: "#000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8B7B6C",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  labelContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  labelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B5B4F",
  },
  qrCard: {
    width: "85%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  qrContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  instructionContainer: {
    backgroundColor: "rgba(210, 180, 140, 0.6)",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(210, 180, 140, 0.8)",
  },
  instructionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#5C4A3A",
    textAlign: "center",
  },
});