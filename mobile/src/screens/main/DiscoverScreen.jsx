import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, Image, Modal, RefreshControl, ScrollView, StatusBar, Switch, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import colors from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { API_BASE_URL, CAST_OPTIONS, EDUCATION_LEVELS, PAKISTAN_CITIES } from '../../utils/constants';

const FILTERS = [
  { id: 'all', label: 'All', icon: 'account-group-outline' },
  { id: 'online', label: 'Online', icon: 'circle' },
  { id: 'verified', label: 'Verified', icon: 'check-decagram' },
  { id: 'premium', label: 'Premium', icon: 'crown' },
  { id: 'new', label: 'New', icon: 'star-outline' },
];

const MARITAL_STATUS_OPTIONS = ['Never Married', 'Divorced', 'Widowed'];
const SECT_OPTIONS = ['Sunni', 'Shia', 'Deobandi', 'Barelvi', 'Ahmadiyya', 'Other'];
const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest Profiles' },
  { id: 'active', label: 'Recently Active' },
  { id: 'premium', label: 'Premium First' },
  { id: 'nearby', label: 'Nearby (Same City)' },
  { id: 'verified', label: 'Verified First' },
];

const DEFAULT_ADV_FILTERS = {
  ageMin: '', ageMax: '',
  city: '', education: '', cast: '',
  maritalStatus: '', sect: '',
  verifiedOnly: false, withPhotoOnly: true,
  sort: 'newest',
};

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
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [advFilters, setAdvFilters] = useState(DEFAULT_ADV_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_ADV_FILTERS);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const countActiveFilters = () => {
    let n = 0;
    if (advFilters.ageMin || advFilters.ageMax) n++;
    if (advFilters.city) n++;
    if (advFilters.education) n++;
    if (advFilters.cast) n++;
    if (advFilters.maritalStatus) n++;
    if (advFilters.sect) n++;
    if (advFilters.verifiedOnly) n++;
    if (!advFilters.withPhotoOnly) n++; // default is true, so toggling off counts
    if (advFilters.sort !== 'newest') n++;
    return n;
  };

  const buildUrl = (pageNum, chipFilter, filters) => {
    let url = `${API_BASE_URL}/profile/discover?page=${pageNum}`;
    // Chip filters
    if (chipFilter === 'online') url += '&sort=active';
    else if (chipFilter === 'premium') url += '&sort=premium';
    else if (filters.sort && chipFilter === 'all') url += `&sort=${filters.sort}`;
    // Advanced filters
    if (filters.ageMin) url += `&ageMin=${filters.ageMin}`;
    if (filters.ageMax) url += `&ageMax=${filters.ageMax}`;
    if (filters.city) url += `&city=${encodeURIComponent(filters.city)}`;
    if (filters.education) url += `&education=${encodeURIComponent(filters.education)}`;
    if (filters.cast) url += `&cast=${encodeURIComponent(filters.cast)}`;
    if (filters.maritalStatus) url += `&maritalStatus=${encodeURIComponent(filters.maritalStatus)}`;
    if (filters.sect) url += `&sect=${encodeURIComponent(filters.sect)}`;
    if (filters.verifiedOnly) url += '&verifiedOnly=true';
    if (filters.withPhotoOnly) url += '&withPhotoOnly=true';
    return url;
  };

  const fetchProfiles = async (pageNum = 1, isRefresh = false, chipFilter = activeFilter, filters = advFilters) => {
    try {
      const url = buildUrl(pageNum, chipFilter, filters);
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        let result = data.profiles || [];
        if (chipFilter === 'verified') result = result.filter(p => p.isVerified);
        if (chipFilter === 'new') result = result.slice(0, 10);
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
    fetchProfiles(1, true, filterId, advFilters);
  };

  const onRefresh = () => { setRefreshing(true); fetchProfiles(1, true); };

  const openFilterModal = () => {
    setDraftFilters({ ...advFilters });
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setAdvFilters({ ...draftFilters });
    setShowFilterModal(false);
    setLoading(true);
    setProfiles([]);
    fetchProfiles(1, true, activeFilter, draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters({ ...DEFAULT_ADV_FILTERS });
  };

  const renderProfile = ({ item, index }) => (
    <ProfileCard item={item} navigation={navigation} index={index} />
  );

  const activeFilterCount = countActiveFilters();

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
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={openFilterModal}>
          <MaterialCommunityIcons name="tune-variant" size={22} color={activeFilterCount > 0 ? '#fff' : colors.accent} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Advanced Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        draft={draftFilters}
        setDraft={setDraftFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        onClose={() => setShowFilterModal(false)}
        insets={insets}
      />

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
        {/* Blur overlay for female photos — non-subscriber view */}
        {item.isPhotoBlurred && item.photo && (
          <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={styles.blurContent}>
              <MaterialCommunityIcons name="lock" size={22} color="rgba(255,255,255,0.9)" />
              <Text style={styles.blurText}>Connect to view</Text>
            </View>
          </BlurView>
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

// ── FilterModal ─────────────────────────────────────────────────────────────
function FilterModal({ visible, draft, setDraft, onApply, onReset, onClose, insets }) {
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      slideAnim.setValue(400);
    }
  }, [visible]);

  const setField = (key, val) => setDraft(prev => ({ ...prev, [key]: val }));

  const ChipGroup = ({ label, options, field }) => (
    <View style={fStyles.section}>
      <Text style={fStyles.sectionLabel}>{label}</Text>
      <View style={fStyles.chipRow}>
        <TouchableOpacity
          style={[fStyles.chip, !draft[field] && fStyles.chipActive]}
          onPress={() => setField(field, '')}
        >
          <Text style={[fStyles.chipText, !draft[field] && fStyles.chipTextActive]}>Any</Text>
        </TouchableOpacity>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[fStyles.chip, draft[field] === opt && fStyles.chipActive]}
            onPress={() => setField(field, draft[field] === opt ? '' : opt)}
          >
            <Text style={[fStyles.chipText, draft[field] === opt && fStyles.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={fStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[fStyles.sheet, { paddingBottom: insets.bottom + 16, transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={fStyles.handle} />
        {/* Title row */}
        <View style={fStyles.titleRow}>
          <Text style={fStyles.title}>Advanced Filters</Text>
          <TouchableOpacity onPress={onReset} style={fStyles.resetBtn}>
            <Text style={fStyles.resetText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

          {/* Age Range */}
          <View style={fStyles.section}>
            <Text style={fStyles.sectionLabel}>Age Range</Text>
            <View style={fStyles.ageRow}>
              <View style={fStyles.ageInput}>
                <Text style={fStyles.ageLabel}>Min Age</Text>
                <TextInput
                  style={fStyles.ageField}
                  value={draft.ageMin}
                  onChangeText={v => setField('ageMin', v.replace(/[^0-9]/g, ''))}
                  placeholder="18" placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad" maxLength={2}
                />
              </View>
              <View style={fStyles.ageSeparator}><Text style={fStyles.ageDash}>—</Text></View>
              <View style={fStyles.ageInput}>
                <Text style={fStyles.ageLabel}>Max Age</Text>
                <TextInput
                  style={fStyles.ageField}
                  value={draft.ageMax}
                  onChangeText={v => setField('ageMax', v.replace(/[^0-9]/g, ''))}
                  placeholder="60" placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad" maxLength={2}
                />
              </View>
            </View>
          </View>

          {/* City */}
          <View style={fStyles.section}>
            <Text style={fStyles.sectionLabel}>City</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={fStyles.chipRow}>
              <TouchableOpacity
                style={[fStyles.chip, !draft.city && fStyles.chipActive]}
                onPress={() => setField('city', '')}
              >
                <Text style={[fStyles.chipText, !draft.city && fStyles.chipTextActive]}>Any City</Text>
              </TouchableOpacity>
              {PAKISTAN_CITIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[fStyles.chip, draft.city === c && fStyles.chipActive]}
                  onPress={() => setField('city', draft.city === c ? '' : c)}
                >
                  <Text style={[fStyles.chipText, draft.city === c && fStyles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Marital Status */}
          <ChipGroup label="Marital Status" options={MARITAL_STATUS_OPTIONS} field="maritalStatus" />

          {/* Education */}
          <ChipGroup label="Education" options={EDUCATION_LEVELS} field="education" />

          {/* Cast */}
          <View style={fStyles.section}>
            <Text style={fStyles.sectionLabel}>Cast / Community</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={fStyles.chipRow}>
              <TouchableOpacity
                style={[fStyles.chip, !draft.cast && fStyles.chipActive]}
                onPress={() => setField('cast', '')}
              >
                <Text style={[fStyles.chipText, !draft.cast && fStyles.chipTextActive]}>Any Cast</Text>
              </TouchableOpacity>
              {CAST_OPTIONS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[fStyles.chip, draft.cast === c && fStyles.chipActive]}
                  onPress={() => setField('cast', draft.cast === c ? '' : c)}
                >
                  <Text style={[fStyles.chipText, draft.cast === c && fStyles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sect */}
          <ChipGroup label="Sect" options={SECT_OPTIONS} field="sect" />

          {/* Sort By */}
          <View style={fStyles.section}>
            <Text style={fStyles.sectionLabel}>Sort By</Text>
            <View style={fStyles.chipRow}>
              {SORT_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[fStyles.chip, draft.sort === s.id && fStyles.chipActive]}
                  onPress={() => setField('sort', s.id)}
                >
                  <Text style={[fStyles.chipText, draft.sort === s.id && fStyles.chipTextActive]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Toggles */}
          <View style={fStyles.section}>
            <Text style={fStyles.sectionLabel}>Show Only</Text>
            <View style={fStyles.toggleRow}>
              <View style={fStyles.toggleItem}>
                <View>
                  <Text style={fStyles.toggleLabel}>Verified Profiles</Text>
                  <Text style={fStyles.toggleSub}>Only show ID-verified users</Text>
                </View>
                <Switch
                  value={draft.verifiedOnly}
                  onValueChange={v => setField('verifiedOnly', v)}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.rose }}
                  thumbColor="#fff"
                />
              </View>
              <View style={[fStyles.toggleItem, { marginTop: 12 }]}>
                <View>
                  <Text style={fStyles.toggleLabel}>With Profile Photo</Text>
                  <Text style={fStyles.toggleSub}>Hide profiles without photos</Text>
                </View>
                <Switch
                  value={draft.withPhotoOnly}
                  onValueChange={v => setField('withPhotoOnly', v)}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.rose }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <TouchableOpacity style={fStyles.applyBtn} onPress={onApply} activeOpacity={0.85}>
          <LinearGradient colors={[colors.rose, colors.maroon]} style={fStyles.applyGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />
            <Text style={fStyles.applyText}>Apply Filters</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const fStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#1A0A10',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg, paddingTop: 12,
    maxHeight: '88%',
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  resetBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.07)' },
  resetText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: { backgroundColor: 'rgba(139,26,74,0.35)', borderColor: colors.rose },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ageInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  ageLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  ageField: { color: colors.text, fontSize: 22, fontWeight: '800', padding: 0 },
  ageSeparator: { paddingTop: 18 },
  ageDash: { color: colors.textMuted, fontSize: 20 },
  toggleRow: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  toggleItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  toggleSub: { color: colors.textMuted, fontSize: 12 },
  applyBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 12 },
  applyGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  applyText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});

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
  filterBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.rose, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.background,
  },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
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
  blurContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  blurText: {
    color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700',
    letterSpacing: 0.4, textAlign: 'center',
  },
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
