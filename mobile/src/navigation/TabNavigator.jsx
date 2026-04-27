import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import HomeScreen from '../screens/main/HomeScreen';
import DiscoverScreen from '../screens/main/DiscoverScreen';
import ChatListScreen from '../screens/main/ChatListScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', label: 'Home', icon: 'home-variant', iconActive: 'home-variant' },
  { name: 'Discover', label: 'Discover', icon: 'compass-outline', iconActive: 'compass' },
  { name: 'ChatList', label: 'Messages', icon: 'message-text-outline', iconActive: 'message-text' },
  { name: 'Profile', label: 'Profile', icon: 'account-outline', iconActive: 'account' },
];

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = TABS[index];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name={isFocused ? tab.iconActive : tab.icon} 
                  size={26} 
                  color={isFocused ? colors.accent : colors.textMuted} 
                />
                {isFocused && (
                  <View style={styles.activeIndicator} />
                )}
              </View>
              <Text style={[styles.tabLabel, { color: isFocused ? colors.accent : colors.textMuted }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="ChatList" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tabBar: {
    flexDirection: 'row', 
    height: '100%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    alignItems: 'center',
  },
  tabItem: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    height: '100%'
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5
  },
});
