import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import colors from '../../theme/colors';
import { glassStyles, radius, spacing } from '../../theme/glassmorphism';
import { API_BASE_URL } from '../../utils/constants';
import { MOCK_USERS } from '../../utils/mockData';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - spacing.lg * 3) / 2;

export default function DiscoverScreen({ navigation }) {
  const { token } = useSelector((s) => s.auth);
  const [profiles, setProfiles] = useState(MOCK_USERS); // Start with mock data for instant preview
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProfiles = async (pageNum = 1, isRefresh = false) => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/discover?page=${pageNum}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.profiles.length > 0) {
        if (isRefresh) {
          setProfiles(data.profiles);
        } else {
          setProfiles((prev) => [...prev, ...data.profiles]);
        }
        setHasMore(data.hasMore);
        setPage(pageNum);
      }
    } catch (e) {
      console.log('Discover fetch error, using mock data:', e.message);
      // Keep using mock data if fetch fails
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    setLoading(true);
    fetchProfiles(1); 
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfiles(1, true);
  };

  const renderProfile = ({ item }) => (
    <TouchableOpacity
      style={[glassStyles.card, styles.card]}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ProfileDetail', { userId: item.id })}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.photos && item.photos[0] ? item.photos[0] : 'https://via.placeholder.com/300' }} 
          style={styles.image} 
          resizeMode="cover"
        />
        
        {/* Luxury Overlays */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />

        {item.isPremium && (
          <View style={styles.premiumBadge}>
            <MaterialCommunityIcons name="crown" size={14} color={colors.accent} />
            <Text style={styles.premiumText}>GOLD</Text>
          </View>
        )}

        <View style={styles.badgeContainer}>
          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={16} color={colors.accent} />
            </View>
          )}
          {item.isOnline && <View style={styles.onlineDot} />}
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {item.name}, {item.age}
        </Text>
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.locationText}>{item.city}</Text>
        </View>
        <Text style={styles.professionText} numberOfLines={1}>
          {item.profession || item.education}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={colors.gradients.luxury} style={StyleSheet.absoluteFill} />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Find Your Perfect</Text>
          <Text style={styles.headerTitle}>Humsafar</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="tune-variant" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {loading && page === 1 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Curating Premium Matches...</Text>
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          renderItem={renderProfile}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={colors.accent} 
              colors={[colors.accent]}
            />
          }
          onEndReached={() => hasMore && fetchProfiles(page + 1)}
          onEndReachedThreshold={0.5}
          ListFooterComponent={hasMore && page > 1 ? <ActivityIndicator style={{ margin: 20 }} color={colors.accent} /> : <View style={{ height: 100 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    paddingTop: 60, 
    paddingBottom: 20, 
    paddingHorizontal: spacing.lg, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end' 
  },
  headerSubtitle: { color: colors.textSecondary, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: colors.text, marginTop: 4 },
  iconButton: { 
    width: 45, 
    height: 45, 
    borderRadius: 12, 
    backgroundColor: colors.surfaceLight, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: spacing.lg },
  card: { width: COLUMN_WIDTH, height: COLUMN_WIDTH * 1.5, borderRadius: 24 },
  imageContainer: { flex: 1, width: '100%' },
  image: { width: '100%', height: '100%' },
  gradient: { ...StyleSheet.absoluteFillObject },
  premiumBadge: { 
    position: 'absolute', 
    top: 12, 
    left: 12, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.accent
  },
  premiumText: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  badgeContainer: { position: 'absolute', top: 12, right: 12, alignItems: 'center', gap: 8 },
  verifiedBadge: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.online, borderWidth: 1.5, borderColor: '#000' },
  infoContainer: { padding: spacing.md, backgroundColor: colors.surface },
  nameText: { fontSize: 17, fontWeight: '700', color: colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { color: colors.textSecondary, fontSize: 12 },
  professionText: { color: colors.accent, fontSize: 12, marginTop: 4, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' }
});
