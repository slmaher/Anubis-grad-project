import { useRouter } from "expo-router";
import React from "react";
import { clearAuthSession, getAuthUser } from "../api/authStorage";
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  PanResponder,
} from "react-native";

const menuItems = [
  { label: "Setting", icon: "⚙️", route: "/settings/settings" },
  { label: "Profile", icon: "👤" },
  { label: "Notifications", icon: "🔔", route: "/notifications" },
  { label: "Friends", icon: "🤝", route: "/messagesList" },
  { label: "Museums", icon: "🏛️", route: "/Museums" },
  { label: "Community", icon: "👥", route: "/Community" },
  { label: "Map", icon: "📍", route: "/Map" },
  { label: "Logout", icon: "🚪" },
];

export default function MenuScreen({ onClose }) {
  const router = useRouter();

  const handleMenuPress = async (item) => {
    if (item.label === "Profile") {
      onClose && onClose();
      const user = await getAuthUser();
      const userId = user?._id || user?.id;
      if (userId) {
        router.push({ pathname: "/user/[id]", params: { id: userId } });
      }
      return;
    }

    if (item.label === "Logout") {
      await clearAuthSession();
      router.replace("/auth/login");
      onClose && onClose();
      return;
    }

    if (item.route) {
      onClose && onClose();
      router.push(item.route);
    }
  };

  const slideAnim = React.useRef(new Animated.Value(-300)).current; // hidden left initially

  React.useEffect(() => {
    // slide in from left when screen opens
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // only horizontal swipes
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0) {
          // moving left
          slideAnim.setValue(Math.max(gestureState.dx, -300));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -100) {
          // if swiped left enough, close
          Animated.timing(slideAnim, {
            toValue: -300,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose && onClose());
        } else {
          // if swipe too short, snap back
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* DARK OVERLAY */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* SLIDING MENU */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.background, { transform: [{ translateX: slideAnim }] }]}
      >
        <ImageBackground
          source={require("../../assets/images/beige-background.jpeg")}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <View style={styles.headerSpacer} />
              <Text style={styles.headerTitle}>Menu</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.menuList}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.menuRow}
                  onPress={() => handleMenuPress(item)}
                >
                  <View style={styles.iconBox}>
                    <Text style={styles.iconText}>{item.icon}</Text>
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        </ImageBackground>
      </Animated.View>
    </View>
  );
}

const DARK = "#2C2010";
const MUTED = "#9A8C7A";
const DIVIDER = "rgba(180,160,130,0.3)";

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 350, // drawer width
    backgroundColor: "transparent",
    zIndex: 999,
    elevation: 20,
  },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerSpacer: { width: 32 },
  headerTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#B8965A",
    letterSpacing: 0.4,
  },
  menuList: {
    marginTop: 8,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: { fontSize: 24 },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: DARK,
    letterSpacing: 0.2,
  },
  chevron: {
    fontSize: 26,
    color: MUTED,
    lineHeight: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});
