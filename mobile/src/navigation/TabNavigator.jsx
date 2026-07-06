import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatListScreen from '../screens/main/ChatListScreen';
import DiscoverScreen from '../screens/main/DiscoverScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', label: 'Home', icon: 'home-variant-outline', activeIcon: 'home-variant' },
  { name: 'Discover', label: 'Discover', icon: 'card-search-outline', activeIcon: 'card-search' },
  { name: 'ChatList', label: 'Messages', icon: 'message-text-outline', activeIcon: 'message-text' },
  { name: 'Profile', label: 'Profile', icon: 'account-circle-outline', activeIcon: 'account-circle' },
];

function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const tab = TABS[index];
          const active = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!active && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name={active ? tab.activeIcon : tab.icon}
                size={23}
                color={active ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            </Pressable>
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
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: 'rgba(250, 247, 242, 0.94)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bar: {
    minHeight: 58,
    flexDirection: 'row',
    gap: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 18,
  },
  itemActive: {
    backgroundColor: colors.primaryLightBg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  labelActive: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.78,
  },
});
