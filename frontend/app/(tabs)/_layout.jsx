import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#E8DDD0',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          height: 75,
          paddingBottom: 20,
          paddingTop: 10,
          position: 'absolute',
          bottom: 20,
          left: 10,
          right: 10,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24 }}>🏛</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24 }}>🔍</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24 }}>📸</Text>
          ),
          // HIDE TAB BAR ON SCAN SCREEN
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24 }}>📅</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24 }}>👥</Text>
          ),
          // HIDE DEFAULT TAB BAR ON COMMUNITY SCREEN (it has its own custom glass navbar)
          tabBarStyle: { display: 'none' },
        }}
      />
      
      {/* Hidden screen - not shown in tabs, navbar hidden */}
      <Tabs.Screen
        name="scan-result"
        options={{
          href: null, // This hides it from the tab bar
          tabBarStyle: { display: 'none' }, // HIDE TAB BAR ON SCAN-RESULT SCREEN
        }}
      />
    </Tabs>
  );
}