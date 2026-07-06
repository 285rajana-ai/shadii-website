import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppBackground, Card, TrustBadge } from '../../components/ui/LightPrimitives';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { logout, updateUser } from '../../store/slices/authSlice';
import colors from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { API_BASE_URL } from '../../utils/constants';

export default function ProfileScreen({ navigation }) {
  const { user, token } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [matchCount, setMatchCount] = useState(null);
  const [requestsCount, setRequestsCount] = useState(0);

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) dispatch(updateUser(data.user));
      } catch (_) { }
    };
    const fetchMatchCount = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/matches/today`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setMatchCount(data.matches?.length ?? 0);
      } catch (_) { }
    };
    const fetchRequestsCount = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/profile/incoming-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setRequestsCount((data.photoRequests?.length || 0) + (data.contactRequests?.length || 0));
      } catch (_) { }
    };
    refreshUser();
    fetchMatchCount();
    fetchRequestsCount();
  }, []);

  const profileImage = () => {
    if (user?.photos?.length > 0) {
      const main = user.photos.find((p) => p.isMain) || user.photos[0];
      return main.url;
    }
    return null;
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const completion = user?.profileCompleteness ?? 0;

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Your account</Text>
            <Text style={styles.title}>Profile</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
            <MaterialCommunityIcons name="cog-outline" size={23} color={colors.text} />
          </Pressable>
        </View>

        <Card style={styles.identity}>
          <View style={styles.avatarWrap}>
            {profileImage() ? (
              <Image source={{ uri: profileImage() }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{user?.name?.[0] || '?'}</Text>
              </View>
            )}
            {user?.isVerified ? <View style={styles.verifiedDot}><MaterialCommunityIcons name="check" size={14} color="#FFFFFF" /></View> : null}
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.name}>{user?.name || 'Shadii user'}</Text>
            <Text style={styles.email}>{user?.email || 'No email'}</Text>
            <View style={styles.badgeRow}>
              <TrustBadge icon={user?.isVerified ? 'check-decagram' : 'shield-alert-outline'} label={user?.isVerified ? 'Verified' : 'Verify profile'} tone={user?.isVerified ? 'trust' : 'primary'} />
            </View>
          </View>
        </Card>

        <Card style={styles.completionCard}>
          <View style={styles.completionTop}>
            <View>
              <Text style={styles.cardTitle}>Profile strength</Text>
              <Text style={styles.cardText}>Complete details help families make confident decisions.</Text>
            </View>
            <Text style={styles.percent}>{completion}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(completion, 100)}%` }]} />
          </View>
          <PrimaryButton label="Manage profile" icon="pencil-outline" onPress={() => navigation.navigate('EditProfile')} />
        </Card>

        <View style={styles.statsRow}>
          <Stat value={user?.profileViews ?? 0} label="Views" icon="eye-outline" />
          <Stat value={matchCount ?? 0} label="Matches" icon="heart-outline" />
          <Stat value={requestsCount} label="Requests" icon="account-arrow-down-outline" />
        </View>

        <Pressable style={styles.membership} onPress={() => navigation.navigate('Plans')}>
          <View style={styles.membershipIcon}>
            <MaterialCommunityIcons name={user?.subscription?.isActive ? 'crown' : 'crown-outline'} size={23} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.membershipTitle}>{user?.subscription?.isActive ? 'Premium active' : 'Upgrade to Premium'}</Text>
            <Text style={styles.membershipText}>
              {user?.subscription?.isActive ? 'Manage your membership and unlocks.' : 'Reveal more matches, requests, and approved contacts.'}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
        </Pressable>

        {['admin', 'cacc', 'fasm', 'superadmin'].includes(user?.role) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administration Desk</Text>
            <MenuAction 
              icon="shield-crown-outline" 
              label="Admin Dashboard Panel" 
              onPress={() => navigation.navigate('AdminDashboard')} 
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety and requests</Text>
          <MenuAction icon="bell-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} />
          <MenuAction icon="account-arrow-down-outline" label="Incoming requests" badge={requestsCount} onPress={() => navigation.navigate('IncomingRequests')} />
          <MenuAction icon="shield-lock-outline" label="Privacy settings" onPress={() => navigation.navigate('Settings')} />
          <MenuAction icon="account-cancel-outline" label="Blocked profiles" onPress={() => navigation.navigate('BlockedUsers')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <MenuAction icon="help-circle-outline" label="Help center" onPress={() => navigation.navigate('Help')} />
          <MenuAction icon="file-document-outline" label="Terms of service" onPress={() => Linking.openURL('https://shadii.pk/terms')} />
          <MenuAction icon="logout" label="Logout" color={colors.error} onPress={handleLogout} />
        </View>

        <Text style={styles.version}>Shadii.pk v{Constants.expoConfig?.version || '1.0.7'}</Text>
        <View style={{ height: 112 }} />
      </ScrollView>
    </AppBackground>
  );
}

function Stat({ value, label, icon }) {
  return (
    <Card style={styles.stat}>
      <MaterialCommunityIcons name={icon} size={21} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function MenuAction({ icon, label, onPress, color, badge }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIcon}>
        <MaterialCommunityIcons name={icon} size={21} color={color || colors.primary} />
      </View>
      <Text style={[styles.menuLabel, color && { color }]}>{label}</Text>
      {badge ? <View style={styles.menuBadge}><Text style={styles.menuBadgeText}>{badge}</Text></View> : null}
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: colors.surfaceLight,
  },
  avatarFallback: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightBg,
  },
  avatarInitial: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '900',
  },
  verifiedDot: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  identityCopy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  email: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  badgeRow: {
    marginTop: 5,
  },
  completionCard: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  completionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  cardText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  percent: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  progressTrack: {
    height: 9,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    padding: spacing.md,
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  membership: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#F0D8B5',
  },
  membershipIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  membershipTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  membershipText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  section: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  menuItem: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightBg,
  },
  menuLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  menuBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
  },
  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  version: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: 12,
    fontWeight: '700',
  },
});
