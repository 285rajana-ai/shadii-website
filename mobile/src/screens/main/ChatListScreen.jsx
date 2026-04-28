import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import colors from '../../theme/colors';
import { glassStyles, spacing } from '../../theme/glassmorphism';
import { API_BASE_URL } from '../../utils/constants';

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
    } catch (e) {
      console.log('Chat list fetch error, using mocks:', e.message);
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

  const renderItem = ({ item }) => {
    const user = item.otherUser || item.user;
    const lastMsg = item.lastMessage;

    return (
      <TouchableOpacity
        style={[glassStyles.card, styles.chatCard]}
        onPress={() => navigation.navigate('ChatDetail', { userId: user?.id || user?._id, userName: user?.name })}
        activeOpacity={0.8}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: user?.photo || user?.photos?.[0] || 'https://via.placeholder.com/150' }} style={styles.avatar} />
          {user?.isOnline && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
            {user.isVerified && <MaterialCommunityIcons name="check-decagram" size={16} color={colors.accent} style={{ marginLeft: 4 }} />}
            <Text style={styles.timeText}>{item.lastMessage?.createdAt ? new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : item.time || ''}</Text>
          </View>

          <View style={styles.msgPreviewRow}>
            <Text style={[styles.msgPreview, item.unreadCount > 0 && styles.unreadText]} numberOfLines={1}>
              {typeof lastMsg === 'string' ? lastMsg : (lastMsg?.content || 'Sent a photo')}
            </Text>
            {item.unreadCount > 0 && (
              <LinearGradient colors={colors.gradients.gold} style={styles.unreadBadge}>
                <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
              </LinearGradient>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={colors.gradients.luxury} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Discover')}>
          <MaterialCommunityIcons name="message-plus-outline" size={24} color={colors.accent} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: colors.text },
  iconButton: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center'
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100, gap: 12 },
  chatCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.surface },
  avatarContainer: { position: 'relative' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.surfaceLight },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: colors.online, borderWidth: 3, borderColor: colors.surface
  },
  chatInfo: { flex: 1, marginLeft: 16 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  userName: { fontSize: 17, fontWeight: '700', color: colors.text, flex: 1 },
  timeText: { fontSize: 12, color: colors.textMuted, marginLeft: 8 },
  msgPreviewRow: { flexDirection: 'row', alignItems: 'center' },
  msgPreview: { flex: 1, fontSize: 14, color: colors.textSecondary },
  unreadText: { color: colors.text, fontWeight: '600' },
  unreadBadge: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginLeft: 8
  },
  unreadCountText: { color: colors.maroon, fontSize: 10, fontWeight: '900' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 16 },
  emptySub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }
});
