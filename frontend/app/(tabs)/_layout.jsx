import { Tabs } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { useEffect, useRef } from "react";
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';

const SCREEN_WIDTH = Dimensions.get("window").width;

function CustomTabBar({ state, descriptors, navigation }) {
  const bubblePosition = useRef(new Animated.Value(0)).current;

  const TAB_WIDTH = (SCREEN_WIDTH - 80) / 5; // dynamic width (left+right = 40+40)

  useEffect(() => {
    Animated.spring(bubblePosition, {
      toValue: state.index,
      useNativeDriver: true,
      friction: 7,
      tension: 60,
    }).start();
  }, [state.index]);

  const getIcon = (routeName, isFocused) => {
    const color = isFocused ? "#000" : "#666";

    switch (routeName) {
      case 'home':
        return <Feather name="home" size={26} color={color} />;
      case 'explore':
        return <MaterialIcons name="explore" size={26} color={color} />;
      case 'scan':
        return <Ionicons name="scan" size={26} color={color} />;
      case 'events':
        return <MaterialIcons name="event-available" size={26} color={color} />;
      case 'community':
        return <FontAwesome name="group" size={24} color={color} />;
      default:
        return null;
    }
  };

  const getLabel = (routeName) => {
    switch (routeName) {
      case 'home': return 'Home';
      case 'explore': return 'Explore';
      case 'scan': return 'Scan';
      case 'events': return 'Events';
      case 'community': return 'Community';
      default: return '';
    }
  };

  const currentRoute = state.routes[state.index].name;

  if (currentRoute === 'scan' || currentRoute === 'community' || currentRoute === 'scan-result') {
    return null;
  }

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>

        {/* 🔥 SMOOTH MOVING BUBBLE */}
        <Animated.View
          style={[
            styles.activeBubble,
            {
              width: TAB_WIDTH + 10,
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

        {/* TABS */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          if (options.href === null) return null;

          const onPress = () => {
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
              <View style={styles.iconContainer}>
                {getIcon(route.name, isFocused)}
              </View>

              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
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
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // 🔥 less transparent
    borderRadius: 35,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 12,

    alignItems: 'center',
    overflow: 'hidden',
  },

  activeBubble: {
    position: 'absolute',
    height: 65, // 🔥 bigger bubble
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.9)',

    top: 4,
    left: 0,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 65,
    zIndex: 2,
  },

  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginTop: 4,
  },

  tabLabelActive: {
    color: '#000',
    fontWeight: '700',
  },
});
