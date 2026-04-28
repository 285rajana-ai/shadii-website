import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import colors from '../../theme/colors';
import { spacing } from '../../theme/glassmorphism';
import { API_BASE_URL } from '../../utils/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.78;

export default function HomeScreen({ navigation }) {
  const { user, token } = useSelector((s) => s.auth);
  const insets = useSafeAreaInsets();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches || []);
      }
    } catch (e) {
      console.log('Match fetch error, using mocks:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMatches();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#1A000A', '#0D0509', '#0D0D0D']} style={StyleSheet.absoluteFill} />
      {/* Ambient glow orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greetingText}>{getGreeting()},</Text>
                <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'User'} 🌹</Text>
              </View>
              <TouchableOpacity
                style={styles.notifBtn}
                onPress={() => navigation.navigate('Notifications')}
              >
                <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
                <View style={styles.notifBadge} />
              </TouchableOpacity>
            </View>

            {/* Stats strip */}
            <View style={styles.statsStrip}>
              {[{ icon: 'eye-outline', val: user?.profileViews || 0, label: 'Views' },
              { icon: 'heart-outline', val: '—', label: 'Likes' },
              { icon: 'account-check-outline', val: user?.subscription?.isActive ? user.subscription.plan : 'Free', label: 'Plan' },
              ].map((s, i) => (
                <View key={i} style={[styles.statItem, i < 2 && styles.statBorder]}>
                  <MaterialCommunityIcons name={s.icon} size={16} color={colors.accent} />
                  <Text style={styles.statVal}>{s.val}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {!user?.subscription?.isActive && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Plans')}
                style={styles.upgradeCard}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['rgba(212,175,55,0.22)', 'rgba(92,15,49,0.15)', 'rgba(212,175,55,0.08)']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                />
                <LinearGradient colors={colors.gradients.gold} style={styles.upgradeIconBg}>
                  <MaterialCommunityIcons name="crown" size={20} color={colors.maroon} />
                </LinearGradient>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.upgradeTitle}>Unlock Premium Experience</Text>
                  <Text style={styles.upgradeSub}>Starting from PKR 1,000 • Cancel anytime</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color={colors.accent} />
              </TouchableOpacity>
            )}
          </View>

          {/* Today's Premium Picks */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionAccentBar} />
                <Text style={styles.sectionTitle}>Today's Premium Picks</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Discover')} style={styles.seeAllBtn}>
                <Text style={styles.seeAll}>See All</Text>
                <MaterialCommunityIcons name="arrow-right" size={14} color={colors.accent} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.accent} size="large" />
              </View>
            ) : matches.length === 0 ? (
              <TouchableOpacity
                style={styles.emptyMatchesCard}
                onPress={() => navigation.navigate('Discover')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="heart-search" size={40} color={colors.accent} />
                <Text style={styles.emptyMatchesText}>Complete your profile to get matched</Text>
                <Text style={styles.emptyMatchesSub}>Tap to discover profiles →</Text>
              </TouchableOpacity>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 16}
                decelerationRate="fast"
                contentContainerStyle={styles.matchesScroll}
              >
                {matches.map((match) => (
                  <MatchCard key={String(match.id || match._id)} match={match} navigation={navigation} />
                ))}
              </ScrollView>
            )}
          </View>

          {/* Exclusive Quick Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionAccentBar} />
                <Text style={styles.sectionTitle}>Exclusive Premium Services</Text>
              </View>
            </View>
            <View style={styles.actionsGrid}>
              <QuickAction icon="account-search-outline" title="Discover" sub="Find matches" onPress={() => navigation.navigate('Discover')} premium />
              <QuickAction icon="shield-check-outline" title="Verify" sub="Get blue tick" onPress={() => navigation.navigate('Verification')} premium />
              <QuickAction icon="lightning-bolt" title="Boost" sub="Top of results" onPress={() => navigation.navigate('Boost')} highlight premium />
              <QuickAction icon="message-text-outline" title="Messages" sub="Your chats" onPress={() => navigation.navigate('ChatList')} premium />
            </View>
          </View>

          {/* Profile Progress */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.progressCard}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['rgba(92,15,49,0.4)', 'rgba(26,0,10,0.6)']}
                style={StyleSheet.absoluteFill}
                borderRadius={24}
              />
              <View style={styles.progressTop}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressTitle}>Complete Your Profile</Text>
                  <Text style={styles.progressSub}>{user?.profileCompleteness || 65}% done • Tap to finish</Text>
                </View>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressPercent}>{user?.profileCompleteness || 65}%</Text>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={colors.gradients.gold}
                  style={[styles.progressBarFill, { width: `${user?.profileCompleteness || 65}%` }]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function MatchCard({ match, navigation }) {
  // API returns: { id, name, age, city, photo, isVerified, isOnline, matchScore }
  // photo is singular field from backend
  const photo = match.photo || (match.photos && match.photos[0]);
  const userId = match.id || match._id;
  const score = match.matchScore ? `${Math.round(match.matchScore)}%` : (match.compatibility || '');
  return (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => navigation.navigate('ProfileDetail', { userId })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: photo || 'https://via.placeholder.com/400' }}
        style={styles.matchPhoto}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.matchGradient}
      />

      <View style={styles.matchContent}>
        <View style={styles.matchTopInfo}>
          <View style={styles.matchHeaderRow}>
            <Text style={styles.matchName}>{match.name}, {match.age}</Text>
            {match.isVerified && (
              <MaterialCommunityIcons name="check-decagram" size={18} color={colors.accent} />
            )}
          </View>
          <Text style={styles.matchLocation}>
            <MaterialCommunityIcons name="map-marker" size={12} color="rgba(255,255,255,0.7)" /> {match.city}
          </Text>
        </View>

        <View style={styles.matchFooter}>
          {score ? (
            <View style={styles.compatibilityBadge}>
              <Text style={styles.compatibilityText}>{score} Match</Text>
            </View>
          ) : <View />}
          <TouchableOpacity
            style={styles.chatIconButton}
            onPress={() => navigation.navigate('ChatDetail', { userId, userName: match.name })}
          >
            <MaterialCommunityIcons name="message-text" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function QuickAction({ icon, title, sub, onPress, highlight }) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, highlight && styles.actionBtnHighlight]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {highlight && <LinearGradient colors={['rgba(212,175,55,0.15)', 'rgba(212,175,55,0.03)']} style={StyleSheet.absoluteFill} borderRadius={20} />}
      <View style={[styles.actionIconCircle, highlight && styles.actionIconHighlight]}>
        <MaterialCommunityIcons name={icon} size={22} color={highlight ? colors.maroon : colors.accent} />
      </View>
      <Text style={[styles.actionLabel, highlight && { color: colors.accent }]}>{title}</Text>
      {sub && <Text style={styles.actionSub}>{sub}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  orb1: { position: 'absolute', width: width * 0.7, height: width * 0.7, borderRadius: width * 0.35, top: -width * 0.2, right: -width * 0.15, backgroundColor: 'rgba(139,26,74,0.12)' },
  orb2: { position: 'absolute', width: width * 0.6, height: width * 0.6, borderRadius: width * 0.3, bottom: width * 0.3, left: -width * 0.2, backgroundColor: 'rgba(212,175,55,0.06)' },
  scrollContent: {},
  header: { paddingHorizontal: spacing.lg, marginBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  greetingText: { color: colors.textSecondary, fontSize: 15, fontWeight: '500', letterSpacing: 0.3 },
  userName: { color: colors.text, fontSize: 30, fontWeight: '900', marginTop: 2, letterSpacing: -0.5 },
  notifBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  notifBadge: {
    position: 'absolute', top: 11, right: 12,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.background
  },
  statsStrip: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16, marginBottom: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)'
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.07)' },
  statVal: { color: colors.text, fontSize: 15, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  upgradeCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)'
  },
  upgradeIconBg: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center'
  },
  upgradeTitle: { color: colors.text, fontWeight: '700', fontSize: 14 },
  upgradeSub: { color: colors.accent, fontSize: 11, marginTop: 3, fontWeight: '500' },

  section: { marginTop: 28 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: 16
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionAccentBar: { width: 3, height: 20, borderRadius: 2, backgroundColor: colors.accent },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAll: { color: colors.accent, fontWeight: '600', fontSize: 13 },

  matchesScroll: { paddingHorizontal: spacing.lg, gap: 16 },
  emptyMatchesCard: {
    marginHorizontal: spacing.lg, padding: 36, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)',
  },
  emptyMatchesText: { color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 14, textAlign: 'center' },
  emptyMatchesSub: { color: colors.accent, fontSize: 13, marginTop: 6, fontWeight: '500' },
  matchCard: { width: CARD_WIDTH, height: 440, borderRadius: 32, overflow: 'hidden', backgroundColor: colors.surface },
  matchPhoto: { width: '100%', height: '100%' },
  matchGradient: { ...StyleSheet.absoluteFillObject },
  matchContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 22 },
  matchHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  matchName: { fontSize: 22, fontWeight: '800', color: '#FFF', flex: 1 },
  matchLocation: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  matchFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },
  compatibilityBadge: {
    backgroundColor: 'rgba(212,175,55,0.25)', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 14, borderWidth: 0.5, borderColor: colors.accent
  },
  compatibilityText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  chatIconButton: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8
  },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: 12, marginTop: 4 },
  actionBtn: {
    width: (width - spacing.lg * 2 - 12) / 2,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 18, borderRadius: 22,
    alignItems: 'center', overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)'
  },
  actionBtnHighlight: { borderColor: 'rgba(212,175,55,0.3)' },
  actionIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(212,175,55,0.12)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)'
  },
  actionIconHighlight: { backgroundColor: colors.accent },
  actionLabel: { color: colors.text, fontSize: 14, fontWeight: '700' },
  actionSub: { color: colors.textMuted, fontSize: 11, marginTop: 3, fontWeight: '400' },

  progressCard: {
    marginHorizontal: spacing.lg, padding: 22, borderRadius: 24, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)'
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  progressTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  progressSub: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  progressCircle: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 2, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.08)'
  },
  progressPercent: { color: colors.accent, fontSize: 13, fontWeight: '900' },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },

  loadingContainer: { height: 300, justifyContent: 'center', alignItems: 'center' },
  matchTopInfo: {},
});
