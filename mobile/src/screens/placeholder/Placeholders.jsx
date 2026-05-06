import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';

const createPlaceholder = (title) => {
  return function PlaceholderScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    return (
      <LinearGradient colors={['#1A000A', '#0D0509', '#0D0D0D']} style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={26} color={colors.accent} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.icon}>🚧</Text>
          <Text style={styles.text}>{title} is under construction</Text>
        </View>
      </LinearGradient>
    );
  };
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, marginRight: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  icon: { fontSize: 40, marginBottom: 16 },
  text: { fontSize: 16, color: colors.textSecondary, fontWeight: '600' }
});

export const BoostProfileScreen = createPlaceholder('Boost Profile');
export const SettingsScreen = createPlaceholder('Settings');
export const ReportUserScreen = createPlaceholder('Report User');
export const BlockedUsersScreen = createPlaceholder('Blocked Users');
export const HelpSupportScreen = createPlaceholder('Help & Support');
export const NotificationsScreen = createPlaceholder('Notifications');
