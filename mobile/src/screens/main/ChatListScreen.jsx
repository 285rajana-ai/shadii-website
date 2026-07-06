import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { AppBackground, EmptyState, TrustBadge } from '../../components/ui/LightPrimitives';
import colors from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setConversations(data.conversations || []);
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View>
          <Text style={styles.eyebrow}>Safe conversations</Text>
          <Text style={styles.title}>Messages</Text>
        </View>
        <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Discover')}>
          <MaterialCommunityIcons name="card-search-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.notice}>
        <TrustBadge icon="shield-check-outline" label="Contact sharing is protected" tone="trust" />
        <Text style={styles.noticeText}>Keep chat respectful. Phone numbers are unlocked only through approved contact flow.</Text>
      </View>

      {loading && conversations.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id || item.conversationId}
          renderItem={({ item, index }) => {
            const other = item.otherUser || item.user;
            const lastMsg = item.lastMessage;
            const preview = typeof lastMsg === 'string' ? lastMsg : lastMsg?.content || '';
            return (
              <ConversationCard
                user={other}
                preview={preview}
                mine={lastMsg?.isMine}
                unreadCount={item.unreadCount}
                time={item.lastMessage?.createdAt}
                index={index}
                onPress={() => navigation.navigate('ChatDetail', {
                  userId: other?.id || other?._id,
                  userName: other?.name,
                  isOnline: other?.isOnline,
                  lastActive: other?.lastActive,
                })}
              />
            );
          }}
          contentContainerStyle={[styles.list, conversations.length === 0 && { flex: 1 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
          ListEmptyComponent={
            <EmptyState
              icon="message-text-outline"
              title="No conversations yet"
              body="Send a connection request from Discover. Once accepted, your chat will appear here."
            />
          }
        />
      )}
    </AppBackground>
  );
}

function ConversationCard({ user, preview, mine, unreadCount, time, index, onPress }) {
  const slideAnim = useRef(new Animated.Value(18)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasUnread = unreadCount > 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 260, delay: Math.min(index * 35, 180), useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 260, delay: Math.min(index * 35, 180), useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, index, slideAnim]);

  const photo = user?.photo || user?.photos?.[0];

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Pressable style={styles.chatCard} onPress={onPress}>
        <View style={styles.avatarWrap}>
          {photo ? <Image source={{ uri: photo }} style={styles.avatar} /> : <View style={styles.avatarFallback}><Text style={styles.avatarInitial}>{user?.name?.[0] || '?'}</Text></View>}
          {user?.isOnline ? <View style={styles.onlineDot} /> : null}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.row}>
            <Text style={styles.userName} numberOfLines={1}>{user?.name || 'Profile'}</Text>
            {user?.isVerified ? <MaterialCommunityIcons name="check-decagram" size={15} color={colors.success} /> : null}
            <Text style={[styles.time, hasUnread && styles.timeUnread]}>{relativeTime(time)}</Text>
          </View>
          <View style={styles.previewRow}>
            {mine && !hasUnread ? <MaterialCommunityIcons name="check" size={14} color={colors.textMuted} /> : null}
            <Text style={[styles.preview, hasUnread && styles.previewUnread]} numberOfLines={1}>
              {preview || 'Tap to open conversation'}
            </Text>
            {hasUnread ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  notice: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: '#EEF7F2',
    borderWidth: 1,
    borderColor: '#CFE8DC',
    gap: spacing.sm,
  },
  noticeText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
    gap: spacing.sm,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
  },
  avatarFallback: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightBg,
  },
  avatarInitial: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
  },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  userName: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  time: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  timeUnread: {
    color: colors.primary,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  preview: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  previewUnread: {
    color: colors.text,
    fontWeight: '800',
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
