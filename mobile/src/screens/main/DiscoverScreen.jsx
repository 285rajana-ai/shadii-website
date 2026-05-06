import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, Image, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import colors from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { API_BASE_URL } from '../../utils/constants';

const FILTERS = [
  { id: 'all', label: 'All', icon: 'account-group-outline' },
  { id: 'online', label: 'Online', icon: 'circle' },
  { id: 'verified', label: 'Verified', icon: 'check-decagram' },
  { id: 'premium', label: 'Premium', icon: 'crown' },
  { id: 'new', label: 'New', icon: 'star-outline' },
];

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - spacing.lg * 3) / 2;

export default function DiscoverScreen({ navigation }) {
  const { token } = useSelector((s) => s.auth);
  const insets = useSafeAreaInsets();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchProfiles = async (pageNum = 1, isRefresh = false, filter = activeFilter) => {
    try {
      let url = `${API_BASE_URL}/profile/discover?page=${pageNum}`;
      if (filter === 'online') url += '&sort=active';
      else if (filter === 'premium') url += '&sort=premium';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        let result = data.profiles || [];
        if (filter === 'verified') result = result.filter(p => p.isVerified);
        if (filter === 'new') result = result.slice(0, 10);
        if (isRefresh) setProfiles(result);
        else setProfiles(prev => [...prev, ...result]);
        setHasMore(data.hasMore);
        setPage(pageNum);
      }
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfiles(1);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const onFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setLoading(true);
    setProfiles([]);
    fetchProfiles(1, true, filterId);
  };

  const onRefresh = () => { setRefreshing(true); fetchProfiles(1, true); };

  const renderProfile = ({ item, index }) => (
    <ProfileCard item={item} navigation={navigation} index={index} />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#1A000A', '#0D0509', '#0D0D0D']} style={StyleSheet.absoluteFill} />
      <View style={styles.orb} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.headerSubtitle}>Explore & Connect</Text>
          <Text style={styles.headerTitle}>Discover</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <MaterialCommunityIcons name="tune-variant" size={22} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}
            onPress={() => onFilterChange(f.id)}
            activeOpacity={0.75}
          >
            {activeFilter === f.id && (
              <LinearGradient
                colors={[colors.rose, colors.maroon]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                borderRadius={20}
              />
            )}
            <MaterialCommunityIcons
              name={f.icon}
              size={13}
              color={activeFilter === f.id ? '#fff' : colors.textSecondary}
            />
            <Text style={[styles.filterLabel, activeFilter === f.id && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && page === 1 ? (
        <DiscoverSkeleton />
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={profiles}
            keyExtractor={(item) => String(item.id || item._id)}
            renderItem={renderProfile}
            numColumns={2}
            contentContainerStyle={[styles.listContent, profiles.length === 0 && { flex: 1 }]}
            columnWrapperStyle={profiles.length > 0 ? styles.columnWrapper : undefined}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                tintColor={colors.accent} colors={[colors.accent]} />
            }
            onEndReached={() => hasMore && fetchProfiles(page + 1)}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-heart-outline" size={72} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Profiles Found</Text>
                <Text style={styles.emptyText}>Try a different filter or check back later</Text>
              </View>
            }
            ListFooterComponent={hasMore && page > 1
              ? <ActivityIndicator style={{ margin: 20 }} color={colors.accent} />
              : <View style={{ height: 110 }} />}
          />
        </Animated.View>
      )}
    </View>
  );
}

function ProfileCard({ item, navigation, index }) {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1, delay: Math.min(index * 40, 200),
      useNativeDriver: true, tension: 80, friction: 8
    }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('ProfileDetail', { userId: item.id || item._id })}
      >
        <Image
          source={{ uri: item.photo }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        {!item.photo && (
          <LinearGradient colors={colors.gradients.royal} style={StyleSheet.absoluteFill} />
        )}
        {/* Dark gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.88)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0.3 }} end={{ x: 0, y: 1 }}
        />
        {/* Top badges */}
        <View style={styles.cardTopRow}>
          {item.isPremium && (
            <LinearGradient colors={colors.gradients.gold} style={styles.goldBadge}>
              <MaterialCommunityIcons name="crown" size={11} color={colors.maroon} />
              <Text style={styles.goldText}>GOLD</Text>
            </LinearGradient>
          )}
          <View style={{ flex: 1 }} />
          {item.isOnline && <View style={styles.onlineDot} />}
        </View>
        {/* Bottom info */}
        <View style={styles.cardInfo}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}, {item.age}
            </Text>
            {item.isVerified && (
              <MaterialCommunityIcons name="check-decagram" size={14} color={colors.accent} />
            )}
          </View>
          <Text style={styles.cardCity} numberOfLines={1}>
            <MaterialCommunityIcons name="map-marker" size={11} color="rgba(255,255,255,0.6)" /> {item.city}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  orb: { position: 'absolute', width: width * 0.7, height: width * 0.7, borderRadius: width * 0.35, top: -width * 0.15, right: -width * 0.2, backgroundColor: 'rgba(139,26,74,0.1)' },
  header: {
    paddingBottom: 12, paddingHorizontal: spacing.lg,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  headerSubtitle: { color: colors.textSecondary, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '600' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: colors.text, marginTop: 2, letterSpacing: -0.5 },
  iconButton: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  filterScroll: { maxHeight: 52, marginBottom: 12 },
  filterRow: { paddingHorizontal: spacing.lg, gap: 8, alignItems: 'center' },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: { borderColor: colors.rose },
  filterLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  filterLabelActive: { color: '#fff', fontWeight: '700' },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 112 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    width: COLUMN_WIDTH, height: COLUMN_WIDTH * 1.55,
    borderRadius: 22, overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  cardImage: { width: '100%', height: '100%', position: 'absolute' },
  cardTopRow: {
    position: 'absolute', top: 10, left: 10, right: 10,
    flexDirection: 'row', alignItems: 'center',
  },
  goldBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8,
  },
  goldText: { color: colors.maroon, fontSize: 11, fontWeight: '900', letterSpacing: 0.4 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.online, borderWidth: 2, borderColor: 'rgba(0,0,0,0.5)' },
  cardInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardName: { fontSize: 14, fontWeight: '800', color: '#fff', flex: 1 },
  cardCity: { color: 'rgba(255,255,255,0.72)', fontSize: 12, marginTop: 3 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 56, paddingHorizontal: 40 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 16 },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500', letterSpacing: 0.3 },

  // Skeleton
  skeletonGrid: { paddingHorizontal: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  skeletonCard: { width: COLUMN_WIDTH, height: COLUMN_WIDTH * 1.55, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  skeletonBar: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  skeletonFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, gap: 8 },
});

function DiscoverSkeleton() {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    return () => shimmer.stopAnimation();
  }, []);
  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.85] });
  return (
    <Animated.View style={[styles.skeletonGrid, { opacity }]}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.skeletonFooter}>
            <View style={[styles.skeletonBar, { height: 14, width: '70%' }]} />
            <View style={[styles.skeletonBar, { height: 11, width: '45%' }]} />
          </View>
        </View>
      ))}
    </Animated.View>
  );
}
