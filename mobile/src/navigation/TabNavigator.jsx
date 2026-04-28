import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatListScreen from '../screens/main/ChatListScreen';
import DiscoverScreen from '../screens/main/DiscoverScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', label: 'Home', icon: 'home-variant', iconActive: 'home-variant' },
  { name: 'Discover', label: 'Discover', icon: 'compass-outline', iconActive: 'compass' },
  { name: 'ChatList', label: 'Messages', icon: 'message-text-outline', iconActive: 'message-text' },
  { name: 'Profile', label: 'Profile', icon: 'account-outline', iconActive: 'account' },
];

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.tabBarContainer, { height: 60 + bottomPad, paddingBottom: bottomPad }]}>
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(26,0,10,0.95)', 'rgba(13,5,9,0.98)']}
        style={[StyleSheet.absoluteFill, { opacity: 0.85 }]}
      />
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = TABS[index];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              {isFocused && (
                <LinearGradient
                  colors={['rgba(212,175,55,0.18)', 'rgba(212,175,55,0)']}
                  style={styles.activeGlow}
                  start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                />
              )}
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={isFocused ? tab.iconActive : tab.icon}
                  size={24}
                  color={isFocused ? colors.accent : 'rgba(255,255,255,0.35)'}
                />
              </View>
              <Text style={[styles.tabLabel, { color: isFocused ? colors.accent : 'rgba(255,255,255,0.35)' }]}>
                {tab.label}
              </Text>
              {isFocused && <View style={styles.activeBar} />}
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
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(212,175,55,0.15)',
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    height: '100%', overflow: 'hidden', position: 'relative',
  },
  activeGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  iconContainer: {
    alignItems: 'center', justifyContent: 'center',
    height: 32, width: 32,
  },
  activeBar: {
    position: 'absolute', top: 0, left: '25%', right: '25%',
    height: 2, borderRadius: 2,
    backgroundColor: colors.accent,
  },
  tabLabel: {
    fontSize: 10, fontWeight: '600',
    marginTop: 3, letterSpacing: 0.4,
  },
});
