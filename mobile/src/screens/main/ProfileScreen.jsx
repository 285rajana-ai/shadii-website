import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateUser } from '../../store/slices/authSlice';
import colors from '../../theme/colors';
import { glassStyles } from '../../theme/glassmorphism';
import { spacing } from '../../theme/spacing';
import { API_BASE_URL } from '../../utils/constants';

export default function ProfileScreen({ navigation }) {
  const { user, token } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [matchCount, setMatchCount] = useState(null);

  useEffect(() => {
    // Refresh user data from API to get latest stats
    const refreshUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) dispatch(updateUser(data.user));
      } catch (_) { }
    };
    // Fetch match count
    const fetchMatchCount = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/matches/today`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setMatchCount(data.matches?.length ?? 0);
      } catch (_) { }
    };
    refreshUser();
    fetchMatchCount();
  }, []);

  const getSubscriptionExpiry = () => {
    const endDate = user?.subscription?.endDate;
    if (!endDate) return null;
    return new Date(endDate).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) }
    ]);
  };

  const getProfileImage = () => {
    if (user?.photos && user.photos.length > 0) {
      const main = user.photos.find(p => p.isMain) || user.photos[0];
      return main.url;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#1A000A', '#0D0509', '#0D0D0D']} style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}>
        {/* Luxury Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
            <MaterialCommunityIcons name="cog-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Identity Card */}
        <View style={[glassStyles.card, styles.profileCard]}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarBorder}>
                {getProfileImage() ? (
                  <Image source={{ uri: getProfileImage() }} style={styles.avatar} />
                ) : (
                  <LinearGradient colors={colors.gradients.royal} style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{user?.name?.[0]}</Text>
                  </LinearGradient>
                )}
              </View>
              {user?.isVerified && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check-decagram" size={20} color={colors.accent} />
                </View>
              )}
            </View>
            <Text style={styles.userName}>{user?.name || 'Test User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'test@shadii.pk'}</Text>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <MaterialCommunityIcons name="pencil-outline" size={14} color={colors.accent} />
              <Text style={styles.editBtnText}>Manage Profile</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <StatItem label="Profile Views" value={user?.profileViews ?? 0} icon="eye-outline" />
            <View style={styles.statDivider} />
            <StatItem label="Trust Score" value={`${user?.profileCompleteness ?? 0}%`} icon="shield-check-outline" />
            <View style={styles.statDivider} />
            <StatItem label="Matches" value={matchCount ?? 0} icon="heart-outline" />
          </View>
        </View>

        {/* Subscription / Membership Section */}
        <TouchableOpacity
          style={styles.membershipCard}
          onPress={() => navigation.navigate('Plans')}
        >
          <LinearGradient
            colors={user?.subscription?.isActive ? colors.gradients.gold : colors.gradients.royal}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          />
          <View style={styles.membershipContent}>
            <View style={styles.membershipIconBg}>
              <MaterialCommunityIcons
                name={user?.subscription?.isActive ? "crown" : "star-outline"}
                size={24}
                color={user?.subscription?.isActive ? colors.maroon : '#FFF'}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={[styles.membershipTitle, user?.subscription?.isActive && { color: colors.maroon }]}>
                {user?.subscription?.isActive ? 'Premium Member' : 'Go Premium'}
              </Text>
              <Text style={[styles.membershipSub, user?.subscription?.isActive && { color: 'rgba(92, 15, 49, 0.7)' }]}>
                {user?.subscription?.isActive
                  ? `Valid until ${getSubscriptionExpiry() || 'N/A'}`
                  : 'Reveal all photos & get featured'}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={user?.subscription?.isActive ? colors.maroon : '#FFF'}
            />
          </View>
        </TouchableOpacity>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Preferences</Text>
          <View style={[glassStyles.card, styles.menuList]}>
            <MenuAction icon="bell-ring-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} />
            <MenuAction icon="shield-lock-outline" label="Privacy & Security" onPress={() => navigation.navigate('Settings')} />
            <MenuAction icon="account-cancel-outline" label="Blocked Profiles" onPress={() => navigation.navigate('BlockedUsers')} />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Support</Text>
          <View style={[glassStyles.card, styles.menuList]}>
            <MenuAction icon="help-circle-outline" label="Help Center" onPress={() => navigation.navigate('Help')} />
            <MenuAction icon="file-document-outline" label="Terms of Service" onPress={() => { }} />
            <MenuAction icon="logout" label="Logout" onPress={handleLogout} color={colors.error} last />
          </View>
        </View>

        <Text style={styles.versionText}>Shadii.pk Premium • v1.2.4</Text>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function StatItem({ label, value, icon }) {
  return (
    <View style={styles.statItem}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.accent} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuAction({ icon, label, onPress, color, last }) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, last && { borderBottomWidth: 0 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconBg}>
        <MaterialCommunityIcons name={icon} size={22} color={color || colors.textSecondary} />
      </View>
      <Text style={[styles.menuLabel, color && { color }]}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 112 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: colors.text },
  settingsBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center'
  },

  profileCard: { padding: 24, alignItems: 'center', marginBottom: 24 },
  profileInfo: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { marginBottom: 16 },
  avatarBorder: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 3, borderColor: colors.accent, padding: 4
  },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 40, color: '#FFF', fontWeight: 'bold' },
  verifiedBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: colors.surface, borderRadius: 15, padding: 2
  },
  userName: { fontSize: 20, fontWeight: '800', color: colors.text },
  userEmail: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 16, backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
    borderWidth: 0.5, borderColor: colors.accent
  },
  editBtnText: { color: colors.accent, fontSize: 12, fontWeight: '700' },

  statsContainer: {
    flexDirection: 'row', width: '100%',
    paddingTop: 24, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)'
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 4 },
  statLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'center' },

  membershipCard: {
    borderRadius: 24, overflow: 'hidden', marginBottom: 32,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8
  },
  membershipContent: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  membershipIconBg: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center'
  },
  membershipTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  membershipSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },

  menuSection: { marginBottom: 32 },
  menuSectionTitle: {
    color: colors.textSecondary, fontSize: 12,
    fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 12, marginLeft: 4
  },
  menuList: { paddingVertical: 8 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)'
  },
  menuIconBg: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center'
  },
  menuLabel: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '500', marginLeft: 16 },

  versionText: {
    textAlign: 'center', color: colors.textMuted,
    fontSize: 12, marginTop: 8, marginBottom: 40
  }
});
