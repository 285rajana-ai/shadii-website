import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { AppBackground, Card, EmptyState, TrustBadge } from '../../components/ui/LightPrimitives';
import colors from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { API_BASE_URL } from '../../utils/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.76, 310);

export default function HomeScreen({ navigation }) {
  const { user, token } = useSelector((s) => s.auth);
  const insets = useSafeAreaInsets();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotif, setUnreadNotif] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMatches(data.matches || []);
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setUnreadNotif(data.notifications.filter((n) => !n.read).length);
      }
    } catch (_) { }
  };

  useEffect(() => {
    fetchMatches();
    fetchUnreadCount();
    Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
    fetchUnreadCount();
  };

  const firstName = user?.name?.split(' ')[0] || 'Friend';
  const completion = user?.profileCompleteness || 65;

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Welcome back</Text>
              <Text style={styles.title}>{firstName}</Text>
            </View>
            <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
              <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
              {unreadNotif > 0 ? <View style={styles.notifDot} /> : null}
            </Pressable>
          </View>

          <Card style={styles.profileCard}>
            <View style={styles.profileTop}>
              <TrustBadge icon="shield-check-outline" label={user?.isVerified ? 'Verified profile' : 'Verification pending'} tone={user?.isVerified ? 'trust' : 'primary'} />
              <Text style={styles.profileScore}>{completion}%</Text>
            </View>
            <Text style={styles.profileTitle}>Complete profile, better matches</Text>
            <Text style={styles.profileBody}>Add clear details, privacy preferences, and verification to improve serious match quality.</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(completion, 100)}%` }]} />
            </View>
            <View style={styles.profileActions}>
              <PrimaryButton label="Edit profile" icon="pencil-outline" onPress={() => navigation.navigate('EditProfile')} style={styles.profileAction} />
              <PrimaryButton label="Verify" variant="secondary" icon="check-decagram-outline" onPress={() => navigation.navigate('Verification')} style={styles.profileAction} />
            </View>
          </Card>

          {!user?.subscription?.isActive ? (
            <Pressable style={styles.membership} onPress={() => navigation.navigate('Plans')}>
              <View style={styles.membershipIcon}>
                <MaterialCommunityIcons name="crown-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.membershipTitle}>Premium unlocks safer discovery</Text>
                <Text style={styles.membershipText}>View more matches, send more requests, and unlock approved contacts.</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
            </Pressable>
          ) : null}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionKicker}>Today</Text>
              <Text style={styles.sectionTitle}>Recommended matches</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('Discover')} hitSlop={10}>
              <Text style={styles.link}>See all</Text>
            </Pressable>
          </View>

          {loading ? (
            <LoadingMatchCard />
          ) : matches.length === 0 ? (
            <Card>
              <EmptyState
                icon="account-heart-outline"
                title="No daily matches yet"
                body="Complete your profile and adjust discovery filters to receive stronger suggestions."
                action={<PrimaryButton label="Open discover" variant="secondary" onPress={() => navigation.navigate('Discover')} style={{ marginTop: spacing.sm }} />}
              />
            </Card>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchScroll}>
              {matches.map((match) => (
                <MatchCard key={String(match.id || match._id)} match={match} navigation={navigation} />
              ))}
            </ScrollView>
          )}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionKicker}>Shortcuts</Text>
              <Text style={styles.sectionTitle}>Your next action</Text>
            </View>
          </View>
          <View style={styles.grid}>
            <QuickAction icon="card-search-outline" title="Discover" body="Browse profiles" onPress={() => navigation.navigate('Discover')} />
            <QuickAction icon="account-arrow-down-outline" title="Requests" body="Review incoming" onPress={() => navigation.navigate('IncomingRequests')} />
            <QuickAction icon="message-text-outline" title="Messages" body="Continue chats" onPress={() => navigation.navigate('ChatList')} />
            <QuickAction icon="rocket-launch-outline" title="Boost" body="Get noticed" onPress={() => navigation.navigate('Boost')} />
          </View>
        </Animated.View>
        <View style={{ height: 112 }} />
      </ScrollView>
    </AppBackground>
  );
}

function MatchCard({ match, navigation }) {
  const photo = match.photo || match.photos?.[0];
  const userId = match.id || match._id;
  return (
    <Pressable style={styles.matchCard} onPress={() => navigation.navigate('ProfileDetail', { userId })}>
      <View style={styles.matchPhotoWrap}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.matchPhoto} />
        ) : (
          <View style={styles.matchPhotoFallback}>
            <Text style={styles.initial}>{match.name?.[0] || '?'}</Text>
          </View>
        )}
        {match.isPhotoBlurred ? (
          <View style={styles.privateOverlay}>
            <MaterialCommunityIcons name="lock-outline" size={22} color={colors.primary} />
            <Text style={styles.privateText}>Private photo</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.matchInfo}>
        <View style={styles.matchNameRow}>
          <Text style={styles.matchName} numberOfLines={1}>{match.name}, {match.age}</Text>
          {match.isVerified ? <MaterialCommunityIcons name="check-decagram" size={17} color={colors.success} /> : null}
        </View>
        <Text style={styles.matchMeta} numberOfLines={1}>{match.city || 'Pakistan'} • {match.education || 'Profile details'}</Text>
        <View style={styles.matchFooter}>
          <TrustBadge icon="heart-outline" label={match.matchScore ? `${Math.round(match.matchScore)}% match` : 'Recommended'} />
        </View>
      </View>
    </Pressable>
  );
}

function QuickAction({ icon, title, body, onPress }) {
  return (
    <Pressable style={styles.quickCard} onPress={onPress}>
      <View style={styles.quickIcon}>
        <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickBody}>{body}</Text>
    </Pressable>
  );
}

function LoadingMatchCard() {
  return (
    <Card style={styles.loadingCard}>
      <View style={styles.loadingPhoto} />
      <View style={styles.loadingLine} />
      <View style={[styles.loadingLine, { width: '52%' }]} />
    </Card>
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
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notifDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  profileCard: {
    gap: spacing.md,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileScore: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
  },
  profileTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  profileBody: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
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
  profileActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  profileAction: {
    flex: 1,
  },
  membership: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#F0D8B5',
  },
  membershipIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  membershipTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  membershipText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionKicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  matchScroll: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  matchCard: {
    width: CARD_WIDTH,
    overflow: 'hidden',
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  matchPhotoWrap: {
    height: 260,
    backgroundColor: colors.surfaceLight,
  },
  matchPhoto: {
    width: '100%',
    height: '100%',
  },
  matchPhotoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightBg,
  },
  initial: {
    color: colors.primary,
    fontSize: 48,
    fontWeight: '900',
  },
  privateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(250, 247, 242, 0.84)',
  },
  privateText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  matchInfo: {
    padding: spacing.md,
    gap: 7,
  },
  matchNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  matchName: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  matchMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  matchFooter: {
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickCard: {
    width: '48.5%',
    minHeight: 132,
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightBg,
    marginBottom: spacing.sm,
  },
  quickTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  quickBody: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  loadingCard: {
    width: CARD_WIDTH,
    gap: spacing.sm,
  },
  loadingPhoto: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceLight,
  },
  loadingLine: {
    height: 14,
    width: '76%',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceLight,
  },
});
