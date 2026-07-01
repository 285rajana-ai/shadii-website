import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useSocket } from '../../hooks/useSocket';
import colors from '../../theme/colors';
import { API_BASE_URL } from '../../utils/constants';

export default function ChatDetailScreen({ route, navigation }) {
  const { userId: otherUserId, userName, isOnline, lastActive } = route.params;
  const { token, user } = useSelector((s) => s.auth);
  const socket = useSocket();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(isOnline ?? false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('accepted');
  const [fetchingConnection, setFetchingConnection] = useState(true);
  const flatListRef = useRef(null);

  const myId = user?.id || user?._id;
  const conversationId = [myId, otherUserId].sort().join('_');

  // Track keyboard height for Android manual adjustment
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    fetchMessages();
    checkConnection();

    // Mark seen on mount
    fetch(`${API_BASE_URL}/chat/${otherUserId}/seen`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  }, []);

  const checkConnection = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConnectionStatus(data.profile.photoRequestStatus || null);
      }
    } catch (_) {
    } finally {
      setFetchingConnection(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('message:receive', (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id && m._id === msg._id)) return prev;
          return [msg, ...prev];
        });
        socket.emit('message:seen', { conversationId });
      }
    });

    socket.on('message:sent', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id && m._id === msg._id)) return prev;
        return [msg, ...prev];
      });
    });

    socket.on('message:flagged', ({ action, label }) => {
      Alert.alert(
        '⚠️ Warning',
        `Sharing ${label} is not allowed. ${action === 'suspended_24h' ? 'Your account has been suspended for 24 hours.' : 'Repeated violations will result in suspension.'}`
      );
      if (action === 'suspended_24h') navigation.navigate('Home');
    });

    socket.on('message:typing', ({ userId }) => {
      if (userId === otherUserId) {
        setTyping(true);
        setTimeout(() => setTyping(false), 3000);
      }
    });

    socket.on('subscription:required', ({ message }) => {
      Alert.alert(
        'Subscription Required',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Subscribe Now', onPress: () => navigation.navigate('Plans') }
        ]
      );
    });

    socket.on('message:error', ({ error }) => {
      Alert.alert('Message Error', error || 'Failed to send message.');
    });

    return () => {
      socket.off('message:receive');
      socket.off('message:sent');
      socket.off('message:flagged');
      socket.off('message:typing');
      socket.off('subscription:required');
      socket.off('message:error');
    };
  }, [socket]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/${otherUserId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  // Listen for online/offline status changes
  useEffect(() => {
    if (!socket) return;
    socket.on('user:online', ({ userId }) => {
      if (userId === otherUserId) setOtherUserOnline(true);
    });
    socket.on('user:offline', ({ userId }) => {
      if (userId === otherUserId) setOtherUserOnline(false);
    });
    return () => {
      socket.off('user:online');
      socket.off('user:offline');
    };
  }, [socket]);

  const getLastActiveText = () => {
    if (otherUserOnline) return '● Online';
    if (!lastActive) return 'Last seen recently';
    const diff = Date.now() - new Date(lastActive).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return 'Active just now';
    if (mins < 60) return `Active ${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Active ${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Active yesterday';
    if (days < 7) return `Active ${days} days ago`;
    return 'Last seen long ago';
  };

  const handleSend = () => {
    if (!socket || !inputText.trim()) return;
    socket.emit('message:send', {
      receiverId: otherUserId,
      content: inputText.trim(),
      conversationId,
    });
    setInputText('');
  };

  const handleTyping = (text) => {
    setInputText(text);
    if (socket && text.length > 0) {
      socket.emit('message:typing', { receiverId: otherUserId });
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender === myId;

    return (
      <View style={[styles.msgWrapper, isMine ? styles.msgMine : styles.msgTheirs]}>
        {item.isFlagged && isMine && (
          <Text style={styles.flagWarning}>⚠️ Flagged for contact info</Text>
        )}
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.msgContent, isMine ? styles.msgContentMine : styles.msgContentTheirs]}>
            {item.content}
          </Text>
        </View>
        <View style={[styles.statusRow, isMine ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isMine && (
            <Text style={[styles.readReceipt, item.status === 'seen' && styles.readReceiptSeen]}>
              {item.status === 'seen' ? '✓✓' : item.status === 'delivered' ? '✓' : '⏳'}
            </Text>
          )}
          {isMine && item.isFreeMessage && item.status !== 'seen' && (
            <Text style={styles.freeDelayNote}> (Seen delayed 6h)</Text>
          )}
        </View>
      </View>
    );
  };

  const headerHeight = insets.top + 68;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1A000A', '#0D0509', '#0D0D0D']} style={StyleSheet.absoluteFill} />
      {/* Header — outside KAV so it never gets pushed off screen */}
      <View style={[styles.header, { paddingTop: insets.top + 8, height: headerHeight }]}>
        <LinearGradient colors={['rgba(26,0,10,0.98)', 'rgba(13,5,9,0.95)']} style={StyleSheet.absoluteFill} />
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerProfile}
            onPress={() => navigation.navigate('ProfileDetail', { userId: otherUserId })}
            activeOpacity={0.8}
          >
            <View style={styles.headerAvatarWrap}>
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>{userName?.[0]?.toUpperCase() || '?'}</Text>
              </View>
              {otherUserOnline && <View style={styles.headerOnlineDot} />}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{userName}</Text>
              {typing ? (
                <Text style={styles.typingText}>typing...</Text>
              ) : (
                <Text style={[styles.onlineText, !otherUserOnline && styles.lastSeenText]}>
                  {getLastActiveText()}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => navigation.navigate('ProfileDetail', { userId: otherUserId })}
          >
            <MaterialCommunityIcons name="dots-vertical" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {connectionStatus !== 'accepted' && !fetchingConnection && (
        <View style={styles.notConnectedBanner}>
          <MaterialCommunityIcons name="information-outline" size={16} color={colors.accent} />
          <Text style={styles.notConnectedText}>
            {connectionStatus === 'pending'
              ? 'Connection request is pending approval.'
              : 'Request connection to start chatting.'}
          </Text>
        </View>
      )}

      {/* KAV only wraps messages + input */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        <View style={[styles.flex, Platform.OS === 'android' && { marginBottom: keyboardHeight }]}>
          {loading ? (
            <MessageSkeleton />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(i) => i._id || Math.random().toString()}
              renderItem={renderMessage}
              contentContainerStyle={styles.list}
              inverted
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}

          {/* Input */}
          <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 4) + 4 }]}>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, connectionStatus !== 'accepted' && styles.disabledInput]}
                value={inputText}
                onChangeText={handleTyping}
                placeholder={connectionStatus === 'accepted' ? "Type a message..." : "Chat locked until approved"}
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                maxLength={500}
                editable={connectionStatus === 'accepted'}
              />
              <TouchableOpacity
                onPress={handleSend}
                style={styles.sendBtnWrap}
                disabled={!inputText.trim() || connectionStatus !== 'accepted'}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={inputText.trim() && connectionStatus === 'accepted' ? [colors.rose, colors.maroon] : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                  style={styles.sendBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons
                    name="send"
                    size={18}
                    color={inputText.trim() && connectionStatus === 'accepted' ? '#fff' : colors.textMuted}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <Text style={styles.safetyNote}>Contact sharing is monitored</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(212,175,55,0.15)',
    zIndex: 10, overflow: 'hidden',
  },
  headerInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, flex: 1 },
  backBtn: { padding: 8, marginRight: 4 },
  headerProfile: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatarWrap: { position: 'relative' },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.maroon,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.4)',
  },
  headerAvatarText: { color: colors.accent, fontSize: 16, fontWeight: '800' },
  headerOnlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: colors.online, borderWidth: 2, borderColor: colors.background,
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  onlineText: { fontSize: 11, color: colors.online, fontWeight: '600', marginTop: 1 },
  lastSeenText: { color: 'rgba(255,255,255,0.45)' },
  typingText: { fontSize: 11, color: colors.accent, fontStyle: 'italic', marginTop: 1 },
  headerActionBtn: { padding: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 12, paddingVertical: 16 },

  msgWrapper: { marginBottom: 8, maxWidth: '78%' },
  msgMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  msgTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18 },
  bubbleMine: {
    backgroundColor: colors.maroon,
    borderBottomRightRadius: 4,
    borderWidth: 0.5, borderColor: 'rgba(212,175,55,0.2)',
  },
  bubbleTheirs: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderBottomLeftRadius: 4,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  msgContent: { fontSize: 14, lineHeight: 22 },
  msgContentMine: { color: '#fff' },
  msgContentTheirs: { color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  timeText: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  readReceipt: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  readReceiptSeen: { color: colors.accent },
  freeDelayNote: { fontSize: 11, color: colors.textMuted, fontStyle: 'italic' },
  flagWarning: { fontSize: 11, color: colors.error, marginBottom: 4, alignSelf: 'flex-end' },

  inputArea: {
    borderTopWidth: 0.5, borderTopColor: 'rgba(212,175,55,0.15)',
    paddingHorizontal: 12, paddingTop: 8,
    backgroundColor: 'rgba(13,5,9,0.97)',
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12,
    maxHeight: 110, fontSize: 14, color: '#fff',
  },
  sendBtnWrap: { marginBottom: 2 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  safetyNote: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 8, letterSpacing: 0.2 },
  notConnectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(212,175,55,0.25)',
  },
  notConnectedText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  disabledInput: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.03)',
    color: colors.textMuted,
  },
});

function MessageSkeleton() {
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
  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });
  const rows = [
    { mine: false, w: '60%' }, { mine: true, w: '45%' },
    { mine: false, w: '70%' }, { mine: true, w: '55%' },
    { mine: false, w: '50%' }, { mine: true, w: '65%' },
  ];
  return (
    <View style={{ flex: 1, padding: 12, gap: 12 }}>
      {rows.map((r, i) => (
        <Animated.View
          key={i}
          style={[{
            alignSelf: r.mine ? 'flex-end' : 'flex-start',
            height: 44, width: r.w, borderRadius: 18,
            backgroundColor: r.mine ? 'rgba(92,15,49,0.35)' : 'rgba(255,255,255,0.07)',
            opacity,
          }]}
        />
      ))}
    </View>
  );
}
