import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../theme/colors';

const createPlaceholder = (title) => {
  return function PlaceholderScreen({ navigation }) {
    return (
      <LinearGradient colors={[colors.background, '#FCE4EC']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
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
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 8, marginRight: 8 },
  backIcon: { fontSize: 24, color: colors.primary },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  icon: { fontSize: 64, marginBottom: 16 },
  text: { fontSize: 16, color: colors.textSecondary, fontWeight: '600' }
});

export const BoostProfileScreen = createPlaceholder('Boost Profile');
export const SettingsScreen = createPlaceholder('Settings');
export const ReportUserScreen = createPlaceholder('Report User');
export const BlockedUsersScreen = createPlaceholder('Blocked Users');
export const HelpSupportScreen = createPlaceholder('Help & Support');
export const NotificationsScreen = createPlaceholder('Notifications');
