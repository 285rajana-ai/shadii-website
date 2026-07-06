import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { AppBackground, Card, Chip, EmptyState, SelectField, TrustBadge } from '../../components/ui/LightPrimitives';
import colors from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import {
  API_BASE_URL,
  CAST_OPTIONS,
  EDUCATION_LEVELS,
  MARITAL_STATUS_OPTIONS,
  MOTHER_TONGUE_OPTIONS,
  PAKISTAN_CITIES,
  PAKISTAN_REGIONS,
  SECT_OPTIONS,
} from '../../utils/constants';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - spacing.lg * 2 - spacing.sm) / 2;

const FILTERS = [
  { id: 'all', label: 'All', icon: 'account-group-outline' },
  { id: 'online', label: 'Online', icon: 'circle' },
  { id: 'nearby', label: 'Nearby', icon: 'map-marker-radius-outline' },
  { id: 'verified', label: 'Verified', icon: 'check-decagram-outline' },
  { id: 'boosted', label: 'Boosted', icon: 'rocket-launch-outline' },
  { id: 'premium', label: 'Premium', icon: 'crown-outline' },
  { id: 'new', label: 'New', icon: 'star-four-points-outline' },
];

const DEFAULT_ADV_FILTERS = {
  ageMin: '',
  ageMax: '',
  region: '',
  city: '',
  education: '',
  cast: '',
  maritalStatus: '',
  sect: '',
  motherTongue: '',
  verifiedOnly: false,
  withPhotoOnly: true,
  sort: 'newest',
};

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

  const activeFilterCount = Object.entries(advFilters).reduce((count, [key, value]) => {
    if (key === 'withPhotoOnly') return count + (value ? 0 : 1);
    if (key === 'sort') return count + (value !== 'newest' ? 1 : 0);
    return count + (value ? 1 : 0);
  }, 0);

  const buildUrl = (pageNum, chipFilter, filters) => {
    let url = `${API_BASE_URL}/profile/discover?page=${pageNum}`;
    if (chipFilter === 'online') url += '&sort=active';
    else if (chipFilter === 'nearby') url += '&sort=nearby';
    else if (chipFilter === 'boosted') url += '&sort=boosted';
    else if (chipFilter === 'premium') url += '&sort=premium';
    else if (filters.sort && chipFilter === 'all') url += `&sort=${filters.sort}`;
    if (filters.ageMin) url += `&ageMin=${filters.ageMin}`;
    if (filters.ageMax) url += `&ageMax=${filters.ageMax}`;
    if (filters.region) url += `&region=${encodeURIComponent(filters.region)}`;
    if (filters.city) url += `&city=${encodeURIComponent(filters.city)}`;
    if (filters.education) url += `&education=${encodeURIComponent(filters.education)}`;
    if (filters.cast) url += `&cast=${encodeURIComponent(filters.cast)}`;
    if (filters.maritalStatus) url += `&maritalStatus=${encodeURIComponent(filters.maritalStatus)}`;
    if (filters.sect) url += `&sect=${encodeURIComponent(filters.sect)}`;
    if (filters.motherTongue) url += `&motherTongue=${encodeURIComponent(filters.motherTongue)}`;
    if (filters.verifiedOnly) url += '&verifiedOnly=true';
    if (filters.withPhotoOnly) url += '&withPhotoOnly=true';
    return url;
  };

  const fetchProfiles = async (pageNum = 1, isRefresh = false, chipFilter = activeFilter, filters = advFilters) => {
    try {
      const res = await fetch(buildUrl(pageNum, chipFilter, filters), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        let result = data.profiles || [];
        if (chipFilter === 'verified') result = result.filter((p) => p.isVerified);
        if (chipFilter === 'new') result = result.slice(0, 10);
        setProfiles((prev) => (isRefresh ? result : [...prev, ...result]));
        setHasMore(Boolean(data.hasMore));
        setPage(pageNum);
      }
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfiles(1, true);
  }, []);

  const onFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setLoading(true);
    setProfiles([]);
    fetchProfiles(1, true, filterId, advFilters);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfiles(1, true);
  };

  const applyFilters = () => {
    setAdvFilters({ ...draftFilters });
    setShowFilterModal(false);
    setLoading(true);
    setProfiles([]);
    fetchProfiles(1, true, activeFilter, draftFilters);
  };

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View>
          <Text style={styles.eyebrow}>Browse respectfully</Text>
          <Text style={styles.title}>Discover</Text>
        </View>
        <Pressable
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
          onPress={() => {
            setDraftFilters({ ...advFilters });
            setShowFilterModal(true);
          }}
        >
          <MaterialCommunityIcons name="tune-variant" size={22} color={activeFilterCount > 0 ? '#FFFFFF' : colors.primary} />
          {activeFilterCount > 0 ? <Text style={styles.filterCount}>{activeFilterCount}</Text> : null}
        </Pressable>
      </View>

      <View style={styles.insightRow}>
        <View style={styles.insightPill}>
          <MaterialCommunityIcons name="map-marker-outline" size={15} color={colors.primary} />
          <Text style={styles.insightText}>{advFilters.city || 'All Pakistan'}</Text>
        </View>
        <View style={styles.insightPill}>
          <MaterialCommunityIcons name="shield-check-outline" size={15} color={colors.success} />
          <Text style={styles.insightText}>Verified-first browsing</Text>
        </View>
      </View>

      <ScrollView horizontal style={styles.filterScroll} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <Chip key={f.id} label={f.label} icon={f.icon} active={activeFilter === f.id} onPress={() => onFilterChange(f.id)} />
        ))}
      </ScrollView>

      {loading && page === 1 ? (
        <View style={styles.skeletonWrap}>
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Finding profiles...</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => String(item.id || item._id)}
          numColumns={2}
          columnWrapperStyle={profiles.length ? styles.column : undefined}
          contentContainerStyle={[styles.list, profiles.length === 0 && { flex: 1 }]}
          renderItem={({ item }) => <ProfileCard item={item} navigation={navigation} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
          onEndReached={() => hasMore && !loading && fetchProfiles(page + 1)}
          onEndReachedThreshold={0.45}
          ListEmptyComponent={
            <EmptyState
              icon="account-search-outline"
              title="No profiles found"
              body="Try relaxing filters or checking back after your profile is complete."
            />
          }
          ListFooterComponent={hasMore && profiles.length > 0 ? <ActivityIndicator style={{ margin: 18 }} color={colors.primary} /> : <View style={{ height: 112 }} />}
        />
      )}

      <FilterModal
        visible={showFilterModal}
        draft={draftFilters}
        setDraft={setDraftFilters}
        onApply={applyFilters}
        onReset={() => setDraftFilters(DEFAULT_ADV_FILTERS)}
        onClose={() => setShowFilterModal(false)}
        insets={insets}
      />
    </AppBackground>
  );
}

function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonPhoto} />
      <View style={styles.skeletonLineWide} />
      <View style={styles.skeletonLine} />
    </View>
  );
}

function ProfileCard({ item, navigation }) {
  const userId = item.id || item._id;
  return (
    <Pressable style={styles.card} onPress={() => navigation.navigate('ProfileDetail', { userId })}>
      <View style={styles.photoWrap}>
        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.photo} />
        ) : (
          <View style={styles.photoFallback}>
            <Text style={styles.initial}>{item.name?.[0] || '?'}</Text>
          </View>
        )}
        {item.isPhotoBlurred && item.photo ? (
          <View style={styles.privateLayer}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={colors.primary} />
            <Text style={styles.privateLabel}>Private</Text>
          </View>
        ) : null}
        {item.isOnline ? <View style={styles.onlineDot} /> : null}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}, {item.age}</Text>
          {item.isVerified ? <MaterialCommunityIcons name="check-decagram" size={15} color={colors.success} /> : null}
        </View>
        <Text style={styles.meta} numberOfLines={1}>{item.city || 'Pakistan'}</Text>
        <Text style={styles.meta} numberOfLines={1}>{item.education || 'Education not added'}</Text>
      </View>
    </Pressable>
  );
}

function FilterModal({ visible, draft, setDraft, onApply, onReset, onClose, insets }) {
  const [picker, setPicker] = useState(null);
  const options =
    picker === 'region' ? PAKISTAN_REGIONS :
      picker === 'city' ? PAKISTAN_CITIES :
        picker === 'education' ? EDUCATION_LEVELS :
          picker === 'cast' ? CAST_OPTIONS :
            picker === 'maritalStatus' ? MARITAL_STATUS_OPTIONS :
              picker === 'sect' ? SECT_OPTIONS :
                picker === 'motherTongue' ? MOTHER_TONGUE_OPTIONS : [];
  const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        <View style={styles.sheetHandle} />
        {!picker ? (
          <>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Refine matches</Text>
              <Pressable onPress={onReset}><Text style={styles.reset}>Reset</Text></Pressable>
            </View>
            <View style={styles.ageRow}>
              <View style={styles.ageField}>
                <Text style={styles.filterLabel}>Min age</Text>
                <TextInput value={draft.ageMin} onChangeText={(v) => set('ageMin', v)} placeholder="18" keyboardType="numeric" placeholderTextColor={colors.textPlaceholder} style={styles.ageInput} />
              </View>
              <View style={styles.ageField}>
                <Text style={styles.filterLabel}>Max age</Text>
                <TextInput value={draft.ageMax} onChangeText={(v) => set('ageMax', v)} placeholder="35" keyboardType="numeric" placeholderTextColor={colors.textPlaceholder} style={styles.ageInput} />
              </View>
            </View>
            <SelectField label="Region" value={draft.region} placeholder="Any region" onPress={() => setPicker('region')} />
            <SelectField label="City" value={draft.city} placeholder="Any city" onPress={() => setPicker('city')} />
            <SelectField label="Education" value={draft.education} placeholder="Any education" onPress={() => setPicker('education')} />
            <SelectField label="Cast / community" value={draft.cast} placeholder="Any community" onPress={() => setPicker('cast')} />
            <SelectField label="Marital status" value={draft.maritalStatus} placeholder="Any status" onPress={() => setPicker('maritalStatus')} />
            <SelectField label="Sect" value={draft.sect} placeholder="Any sect" onPress={() => setPicker('sect')} />
            <SelectField label="Mother tongue" value={draft.motherTongue} placeholder="Any language" onPress={() => setPicker('motherTongue')} />
            <ToggleRow label="Verified only" value={draft.verifiedOnly} onValueChange={(v) => set('verifiedOnly', v)} />
            <ToggleRow label="With photos only" value={draft.withPhotoOnly} onValueChange={(v) => set('withPhotoOnly', v)} />
            <PrimaryButton label="Apply filters" icon="check" onPress={onApply} style={{ marginTop: spacing.md }} />
          </>
        ) : (
          <>
            <View style={styles.sheetHeader}>
              <Pressable onPress={() => setPicker(null)}><Text style={styles.reset}>Back</Text></Pressable>
              <Text style={styles.sheetTitle}>Select {picker}</Text>
              <View style={{ width: 38 }} />
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    set(picker, item);
                    setPicker(null);
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                  {draft[picker] === item ? <MaterialCommunityIcons name="check" size={20} color={colors.primary} /> : null}
                </Pressable>
              )}
            />
          </>
        )}
      </View>
    </Modal>
  );
}

function ToggleRow({ label, value, onValueChange }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.borderStrong, true: colors.accentLight }}
        thumbColor={value ? colors.primary : '#FFFFFF'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
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
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterCount: {
    position: 'absolute',
    top: 6,
    right: 7,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  insightRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  insightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  insightText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  filterScroll: {
    flexGrow: 0,
    maxHeight: 48,
  },
  filterRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  column: {
    gap: spacing.sm,
  },
  card: {
    width: COLUMN_WIDTH,
    marginBottom: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  photoWrap: {
    height: 184,
    backgroundColor: colors.surfaceLight,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightBg,
  },
  initial: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: '900',
  },
  privateLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.blur,
  },
  privateLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  onlineDot: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cardBody: {
    padding: spacing.sm,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  loader: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  loaderText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  skeletonWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  skeletonCard: {
    width: COLUMN_WIDTH,
    height: 248,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  skeletonPhoto: {
    height: 176,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceLight,
  },
  skeletonLineWide: {
    height: 14,
    width: '76%',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceLight,
  },
  skeletonLine: {
    height: 12,
    width: '52%',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(32,33,36,0.36)',
  },
  sheet: {
    maxHeight: '78%',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  reset: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  ageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ageField: {
    flex: 1,
    gap: 7,
  },
  filterLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  ageInput: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 16,
    backgroundColor: colors.surface,
  },
  toggleRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  toggleLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  option: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
