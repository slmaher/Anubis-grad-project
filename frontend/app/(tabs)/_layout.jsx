import { Tabs, useRouter } from "expo-router";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";

const TAB_COUNT = 5;
const GOLD = "#f1b900";
const DARK = "#2C2010";

function CustomTabBar({ state, descriptors, navigation }) {
  const router = useRouter();
  const bubblePosition = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const isCompact = width < 390;
  const isTablet = width >= 768;
  const horizontalInset = isTablet ? 28 : isCompact ? 10 : 16;
  const tabBarWidth = Math.min(width - horizontalInset * 2, 640);
  const TAB_WIDTH = tabBarWidth / TAB_COUNT;
  const iconSize = isCompact ? 22 : 26;
  const scanIconSize = isCompact ? 31 : 35;
  const communityIconSize = isCompact ? 20 : 24;
  const labelSize = isCompact ? 9.5 : 11;
  const scanLabelSize = isCompact ? 12 : 13.5;

  useEffect(() => {
    Animated.spring(bubblePosition, {
      toValue: state.index,
      useNativeDriver: true,
      friction: 7,
      tension: 60,
    }).start();
  }, [state.index]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const getIcon = (routeName) => {
    const isScan = routeName === "scan";
    const color = isScan ? GOLD : DARK;
    const size = isScan ? scanIconSize : iconSize;

    switch (routeName) {
      case "home":
        return <Feather name="home" size={size} color={color} />;
      case "explore":
        return <MaterialIcons name="explore" size={size} color={color} />;
      case "scan":
        return <Ionicons name="scan" size={size} color={color} />;
      case "events":
        return <MaterialIcons name="event-available" size={size} color={color} />;
      case "community":
        return (
          <FontAwesome
            name="group"
            size={isScan ? scanIconSize : communityIconSize}
            color={color}
          />
        );
      default:
        return null;
    }
  };

  const getLabel = (routeName) => {
    switch (routeName) {
      case "home":
        return t("tabs.home");
      case "explore":
        return t("tabs.explore");
      case "scan":
        return t("tabs.scan");
      case "events":
        return t("tabs.events");
      case "community":
        return t("tabs.community");
      default:
        return "";
    }
  };

  const currentRoute = state.routes[state.index].name;

  const hideTabBar =
    currentRoute === "scan" ||
    currentRoute === "community" ||
    currentRoute === "scan-result";

  useEffect(() => {
    if (hideTabBar) {
      Animated.spring(bubblePosition, {
        toValue: -1,
        useNativeDriver: true,
        friction: 7,
        tension: 60,
      }).start();
    }
  }, [hideTabBar]);

  if (hideTabBar) {
    return null;
  }

  return (
    <View
      style={[
        styles.tabBarContainer,
        { left: horizontalInset, right: horizontalInset },
      ]}
    >
      <View style={[styles.tabBar, { width: tabBarWidth }]}>
        <Animated.View
          style={[
            styles.activeBubble,
            {
              width: Math.max(TAB_WIDTH - 6, 52),
              transform: [
                {
                  translateX: bubblePosition.interpolate({
                    inputRange: state.routes.map((_, i) => i),
                    outputRange: state.routes.map((_, i) => i * TAB_WIDTH),
                  }),
                },
              ],
            },
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isScan = route.name === "scan";

          if (options.href === null) return null;

          const onPress = () => {
  const event = navigation.emit({
    type: "tabPress",
    target: route.key,
    canPreventDefault: true,
  });

  if (event.defaultPrevented) return;

  if (route.name === "events") {
    router.push("/eventScreen/eventScreen");
    return;
  }

  if (!isFocused) {
    navigation.navigate(route.name);
  }
};

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tabButton, { width: TAB_WIDTH }]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconContainer,
                  isScan && styles.scanIconContainer,
                ]}
              >
                {isScan && (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.scanShine,
                      {
                        transform: [
                          {
                            translateX: shineAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-24, 24],
                            }),
                          },
                          { rotate: "25deg" },
                        ],
                      },
                    ]}
                  />
                )}

                {getIcon(route.name)}
              </View>

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[
                  styles.tabLabel,
                  { fontSize: isScan ? scanLabelSize : labelSize },
                  isScan && styles.scanLabel,
                  isFocused && !isScan && styles.tabLabelActive,
                ]}
              >
                {getLabel(route.name)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="events" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="scan-result" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 35,
    alignSelf: "center",
  },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.90)",
    borderRadius: 30,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)",
    elevation: 12,
    alignItems: "center",
    overflow: "hidden",
    justifyContent: "space-between",
  },

  activeBubble: {
    position: "absolute",
    height: 60,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.9)",
    top: 1,
    left: 2,
    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.12)",
    elevation: 4,
  },

  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    zIndex: 2,
    paddingHorizontal: 2,
  },

  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  scanIconContainer: {
    width: 44,
    height: 34,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -5,
  },

  scanShine: {
    position: "absolute",
    width: 10,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.65)",
    opacity: 0.75,
  },

  tabLabel: {
    fontWeight: "600",
    color: DARK,
    marginTop: 4,
  },

  tabLabelActive: {
    color: DARK,
    fontWeight: "700",
  },

  scanLabel: {
    color: GOLD,
    fontWeight: "800",
    marginTop: 1,
  },
});