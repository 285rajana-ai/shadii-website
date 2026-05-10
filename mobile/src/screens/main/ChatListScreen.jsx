import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Image, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import colors from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { API_BASE_URL } from '../../utils/constants';

const relativeTime = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(dateStr).toLocaleDateString([], { day: 'numeric', month: 'short' });
};

export default function ChatListScreen({ navigation }) {
  const { token } = useSelector((s) => s.auth);
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchConversations();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); fetchConversations(); };

  const renderItem = ({ item, index }) => {
    const user = item.otherUser || item.user;
    const lastMsg = item.lastMessage;
    const preview = typeof lastMsg === 'string' ? lastMsg : (lastMsg?.content || '');
    const mine = lastMsg?.isMine;

    return (
      <ConversationCard
        user={user}
        preview={preview}
        mine={mine}
        unreadCount={item.unreadCount}
        time={item.lastMessage?.createdAt}
        index={index}
        onPress={() => navigation.navigate('ChatDetail', { userId: user?.id || user?._id, userName: user?.name, isOnline: user?.isOnline, lastActive: user?.lastActive })}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#1A000A', '#0D0509', '#0D0D0D']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.headerSub}>Your</Text>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Discover')}>
          <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {loading && conversations.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id || item.conversationId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="message-off-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Messages Yet</Text>
              <Text style={styles.emptySub}>Start a conversation with your premium matches!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function ConversationCard({ user, preview, mine, unreadCount, time, index, onPress }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay: index * 50, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, index, slideAnim]);
  const hasUnread = unreadCount > 0;
  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity style={styles.chatCard} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.avatarWrapper}>
          {user?.isOnline && <View style={styles.onlineRing} />}
          <Image
            source={user?.photo || user?.photos?.[0] ? { uri: user.photo || user.photos[0] } : null}
            style={styles.avatar}
          />
          {user?.isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatRow}>
            <Text style={styles.userName} numberOfLines={1}>{user?.name}</Text>
            {user?.isVerified && <MaterialCommunityIcons name="check-decagram" size={14} color={colors.accent} />}
            <Text style={[styles.timeText, hasUnread && { color: colors.accent }]}>{relativeTime(time)}</Text>
          </View>
          <View style={styles.previewRow}>
            {mine && !hasUnread && <MaterialCommunityIcons name="check" size={13} color={colors.textMuted} style={{ marginRight: 3 }} />}
            <Text style={[styles.previewText, hasUnread && styles.previewUnread]} numberOfLines={1}>
              {preview || 'Tap to chat'}
            </Text>
            {hasUnread ? (
              <LinearGradient colors={[colors.rose, colors.maroon]} style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </LinearGradient>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingBottom: 16, paddingHorizontal: spacing.lg,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  headerSub: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.5 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  iconButton: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 112, gap: 4 },
  chatCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  avatarWrapper: { position: 'relative', marginRight: 12 },
  onlineRing: {
    position: 'absolute', inset: -3,
    borderRadius: 35, borderWidth: 2, borderColor: colors.online, zIndex: 1,
    width: 66, height: 66,
  },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.surfaceLight },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: colors.online, borderWidth: 2.5, borderColor: colors.background, zIndex: 2,
  },
  chatInfo: { flex: 1 },
  chatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 },
  userName: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  timeText: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  previewRow: { flexDirection: 'row', alignItems: 'center' },
  previewText: { flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  previewUnread: { color: colors.text, fontWeight: '600' },
  badge: {
    minWidth: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4, marginLeft: 8,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 16 },
  emptySub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 40, lineHeight: 22 }
});
