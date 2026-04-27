import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { useSelector } from 'react-redux';
import colors from '../../theme/colors';
import { glassStyles, spacing } from '../../theme/glassmorphism';
import { API_BASE_URL } from '../../utils/constants';
import { MOCK_MATCHES } from '../../utils/mockData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.78;

export default function HomeScreen({ navigation }) {
  const { user, token } = useSelector((s) => s.auth);
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.matches.length > 0) {
        setMatches(data.matches);
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
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={colors.gradients.luxury} style={StyleSheet.absoluteFill} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        contentContainerStyle={styles.scrollContent}
      >
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
              <MaterialCommunityIcons name="bell-outline" size={24} color={colors.text} />
              <View style={styles.notifBadge} />
            </TouchableOpacity>
          </View>

          {!user?.subscription?.isActive && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Plans')}
              style={styles.upgradeCard}
            >
              <LinearGradient
                colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.05)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              />
              <MaterialCommunityIcons name="star-circle" size={28} color={colors.accent} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.upgradeTitle}>Unlock Premium Experiences</Text>
                <Text style={styles.upgradeSub}>Plans starting from PKR 1,000</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.accent} />
            </TouchableOpacity>
          )}
        </View>

        {/* Today's Premium Picks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Premium Picks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Discover')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.accent} size="large" />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 16}
              decelerationRate="fast"
              contentContainerStyle={styles.matchesScroll}
            >
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} navigation={navigation} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Exclusive Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exclusive Services</Text>
          <View style={styles.actionsGrid}>
            <QuickAction
              icon="account-search-outline"
              title="Advanced Search"
              onPress={() => navigation.navigate('Discover')}
            />
            <QuickAction
              icon="shield-check-outline"
              title="Identity Verify"
              onPress={() => navigation.navigate('Verification')}
            />
            <QuickAction
              icon="lightning-bolt-outline"
              title="Profile Boost"
              onPress={() => navigation.navigate('Boost')}
              highlight
            />
            <QuickAction
              icon="chat-processing-outline"
              title="Secret Chat"
              onPress={() => navigation.navigate('ChatList')}
            />
          </View>
        </View>

        {/* Profile Progress */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[glassStyles.card, styles.progressCard]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.progressTop}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressTitle}>Your Journey to Verified</Text>
                <Text style={styles.progressSub}>Profile is {user?.profileCompleteness || 65}% complete</Text>
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
      </ScrollView>
    </View>
  );
}

function MatchCard({ match, navigation }) {
  const user = match.user || match; // Handle both Match object or User object
  return (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => navigation.navigate('ProfileDetail', { userId: user.id || user._id })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: user.photos?.[0] || 'https://via.placeholder.com/400' }}
        style={styles.matchPhoto}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.matchGradient}
      />

      <View style={styles.matchContent}>
        <View style={styles.matchTopInfo}>
          <View style={styles.matchHeaderRow}>
            <Text style={styles.matchName}>{user.name}, {user.age}</Text>
            {user.isVerified && (
              <MaterialCommunityIcons name="check-decagram" size={18} color={colors.accent} />
            )}
          </View>
          <Text style={styles.matchLocation}>
            <MaterialCommunityIcons name="map-marker" size={12} color="rgba(255,255,255,0.7)" /> {user.city}
          </Text>
        </View>

        <View style={styles.matchFooter}>
          <View style={styles.compatibilityBadge}>
            <Text style={styles.compatibilityText}>{match.compatibility || '92%'} Match</Text>
          </View>
          <TouchableOpacity
            style={styles.chatIconButton}
            onPress={() => navigation.navigate('ChatDetail', { userId: user.id || user._id, userName: user.name })}
          >
            <MaterialCommunityIcons name="message-text" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function QuickAction({ icon, title, onPress, highlight }) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, highlight && styles.actionBtnHighlight]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIconCircle, highlight && { backgroundColor: 'rgba(212, 175, 55, 0.2)' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={highlight ? colors.accent : colors.textSecondary} />
      </View>
      <Text style={[styles.actionLabel, highlight && { color: colors.accent, fontWeight: '700' }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingTop: 60 },
  header: { paddingHorizontal: spacing.lg, marginBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingText: { color: colors.textSecondary, fontSize: 16, fontWeight: '500' },
  userName: { color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 4 },
  notifBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  notifBadge: {
    position: 'absolute', top: 12, right: 14,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.surfaceLight
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)'
  },
  upgradeTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  upgradeSub: { color: colors.accent, fontSize: 12, marginTop: 2, fontWeight: '500' },

  section: { marginTop: 32 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: 16
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  seeAll: { color: colors.accent, fontWeight: '600', fontSize: 14 },

  matchesScroll: { paddingHorizontal: spacing.lg, gap: 16 },
  matchCard: { width: CARD_WIDTH, height: 420, borderRadius: 32, overflow: 'hidden', backgroundColor: colors.surface },
  matchPhoto: { width: '100%', height: '100%' },
  matchGradient: { ...StyleSheet.absoluteFillObject },
  matchContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24 },
  matchHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  matchName: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  matchLocation: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
  matchFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  compatibilityBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, borderWidth: 0.5, borderColor: colors.accent
  },
  compatibilityText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  chatIconButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center'
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: 12,
    marginTop: 8
  },
  actionBtn: {
    width: (width - spacing.lg * 2 - 12) / 2,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)'
  },
  actionBtnHighlight: { borderColor: 'rgba(212, 175, 55, 0.2)', backgroundColor: 'rgba(212, 175, 55, 0.03)' },
  actionIconCircle: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: 10
  },
  actionLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },

  progressCard: { marginHorizontal: spacing.lg, padding: 20, backgroundColor: colors.surface, borderRadius: 24 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  progressTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  progressSub: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  progressCircle: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center'
  },
  progressPercent: { color: colors.accent, fontSize: 12, fontWeight: '800' },
  progressBarBg: { height: 8, backgroundColor: colors.surfaceLight, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },

  loadingContainer: { height: 300, justifyContent: 'center', alignItems: 'center' }
});
