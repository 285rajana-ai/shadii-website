import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { AppBackground, TrustBadge } from '../../components/ui/LightPrimitives';
import { useSocket } from '../../hooks/useSocket';
import colors from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
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
  const [sending, setSending] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(isOnline ?? false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('accepted');
  const [fetchingConnection, setFetchingConnection] = useState(true);
  const [chatAccess, setChatAccess] = useState(null);
  const [acceptingInvite, setAcceptingInvite] = useState(false);
  const flatListRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  const myId = user?.id || user?._id;
  const conversationId = [myId, otherUserId].sort().join('_');

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const show = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    fetchMessages();
    checkConnection();
    fetch(`${API_BASE_URL}/chat/${otherUserId}/seen`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }, []);

  const checkConnection = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setConnectionStatus(data.profile.photoRequestStatus || null);
    } catch (_) {
    } finally {
      setFetchingConnection(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/${otherUserId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessages([...(data.messages || [])].reverse());
        setChatAccess(data.chatAccess || null);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return undefined;

    socket.on('message:receive', (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => (prev.some((m) => m._id && m._id === msg._id) ? prev : [msg, ...prev]));
        socket.emit('message:seen', { conversationId });
      }
    });

    socket.on('message:sent', (msg) => {
      setSending(false);
      if (msg.chatAccess) setChatAccess(msg.chatAccess);
      setMessages((prev) => {
        if (prev.some((m) => m._id && m._id === msg._id)) return prev;
        if (msg.clientMessageId) {
          const replaced = prev.map((m) => (m.clientMessageId === msg.clientMessageId ? msg : m));
          if (replaced.some((m) => m._id === msg._id)) return replaced;
        }
        return [msg, ...prev];
      });
    });

    socket.on('message:flagged', ({ action, label }) => {
      Alert.alert(
        'Message warning',
        `Sharing ${label} is not allowed. ${action === 'suspended_24h' ? 'Your account has been suspended for 24 hours.' : 'Repeated violations can restrict your account.'}`
      );
      if (action === 'suspended_24h') navigation.navigate('Home');
    });

    socket.on('message:typing', ({ userId }) => {
      if (userId === otherUserId) {
        setTyping(true);
        setTimeout(() => setTyping(false), 3000);
      }
    });

    socket.on('subscription:required', ({ message, chatAccess: nextAccess }) => {
      if (nextAccess) setChatAccess(nextAccess);
      Alert.alert('Subscription required', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View plans', onPress: () => navigation.navigate('Plans') },
      ]);
    });

    socket.on('message:error', ({ error, chatAccess: nextAccess }) => {
      if (nextAccess) setChatAccess(nextAccess);
      setSending(false);
      setMessages((prev) => prev.map((m) => (m.isPending ? { ...m, isPending: false, failed: true, status: 'failed' } : m)));
      Alert.alert('Message error', error || 'Failed to send message.');
    });

    return () => {
      socket.off('message:receive');
      socket.off('message:sent');
      socket.off('message:flagged');
      socket.off('message:typing');
      socket.off('subscription:required');
      socket.off('message:error');
    };
  }, [socket, conversationId, otherUserId, navigation]);

  useEffect(() => {
    if (!socket) return undefined;
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
  }, [socket, otherUserId]);

  const getLastActiveText = () => {
    if (otherUserOnline) return 'Online';
    if (!lastActive) return 'Last seen recently';
    const diff = Date.now() - new Date(lastActive).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return 'Active just now';
    if (mins < 60) return `Active ${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Active ${hrs}h ago`;
    return 'Recently active';
  };

  const handleSend = () => {
    const content = inputText.trim();
    if (!socket || !content || !canChat || sending) return;
    const clientMessageId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const optimisticMessage = {
      _id: clientMessageId,
      clientMessageId,
      conversationId,
      sender: myId,
      receiver: otherUserId,
      content,
      status: 'sent',
      createdAt: new Date().toISOString(),
      isPending: true,
    };
    setMessages((prev) => [optimisticMessage, ...prev]);
    setSending(true);
    setInputText('');
    socket.emit('message:send', {
      receiverId: otherUserId,
      content,
      conversationId,
      clientMessageId,
    });
  };

  const handleTyping = (text) => {
    setInputText(text);
    const now = Date.now();
    if (socket && text.length > 0 && now - lastTypingSentRef.current > 1200) {
      lastTypingSentRef.current = now;
      socket.emit('message:typing', { receiverId: otherUserId });
    }
  };

  const handleAcceptInvite = async () => {
    setAcceptingInvite(true);
    try {
      const res = await fetch(`${API_BASE_URL}/profile/photo-requests/${otherUserId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'accept' }),
      });
      const data = await res.json();
      if (!data.success) {
        Alert.alert('Could not accept', data.message || 'Please try again.');
        return;
      }
      setConnectionStatus('accepted');
      await fetchMessages();
      Alert.alert('Invite accepted', 'You can now send your free reply.');
    } catch (_) {
      Alert.alert('Connection error', 'Unable to accept this invite right now.');
    } finally {
      setAcceptingInvite(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender === myId;
    return (
      <View style={[styles.messageWrap, isMine ? styles.messageMine : styles.messageTheirs]}>
        {item.isFlagged && isMine ? <Text style={styles.flagWarning}>Flagged for contact info</Text> : null}
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.messageText, isMine && styles.messageTextMine]}>{item.content}</Text>
        </View>
        <View style={[styles.metaRow, isMine && { justifyContent: 'flex-end' }]}>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isMine ? (
            <Text style={[styles.readReceipt, item.status === 'seen' && styles.readSeen]}>
            {item.failed ? 'Failed' : item.isPending ? 'Sending...' : item.status === 'seen' ? 'Seen' : item.status === 'delivered' ? 'Delivered' : 'Sent'}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  const headerHeight = insets.top + 76;
  const canChat = chatAccess ? chatAccess.canSend : true;
  const needsInviteAcceptance = chatAccess?.reason === 'accept_invite' || (chatAccess?.incomingRequestPending && !chatAccess?.isApproved);
  const waitingForAcceptance = chatAccess?.reason === 'waiting_for_acceptance';
  const needsSubscription = chatAccess?.reason === 'subscription_required';

  return (
    <AppBackground>
      <View style={[styles.header, { paddingTop: insets.top + 8, height: headerHeight }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Pressable
          style={styles.headerProfile}
          onPress={() => navigation.navigate('ProfileDetail', { userId: otherUserId })}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName?.[0]?.toUpperCase() || '?'}</Text>
            {otherUserOnline ? <View style={styles.onlineDot} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName} numberOfLines={1}>{userName || 'Profile'}</Text>
            <Text style={[styles.headerSub, otherUserOnline && { color: colors.success }]}>{typing ? 'typing...' : getLastActiveText()}</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('ProfileDetail', { userId: otherUserId })} style={styles.backButton}>
          <MaterialCommunityIcons name="dots-vertical" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      {!canChat && !fetchingConnection ? (
        <View style={styles.lockBanner}>
          <TrustBadge
            icon={needsInviteAcceptance ? 'email-check-outline' : needsSubscription ? 'crown-outline' : 'lock-outline'}
            label={needsInviteAcceptance ? 'Rishta invite received' : needsSubscription ? 'Package required' : 'Request pending'}
          />
          <Text style={styles.lockText}>
            {needsInviteAcceptance
              ? 'Accept this invite to send your free reply.'
              : needsSubscription
                ? 'Both free intro messages are used. Upgrade to continue this conversation.'
                : waitingForAcceptance
                  ? 'Your intro has been sent. You can continue after they accept and reply.'
                  : 'Send a respectful intro to begin this conversation.'}
          </Text>
          {needsInviteAcceptance ? (
            <PrimaryButton
              label="Accept invite"
              icon="check"
              loading={acceptingInvite}
              onPress={handleAcceptInvite}
              style={styles.acceptButton}
            />
          ) : needsSubscription ? (
            <PrimaryButton
              label="View packages"
              icon="crown-outline"
              onPress={() => navigation.navigate('Plans')}
              style={styles.acceptButton}
            />
          ) : null}
        </View>
      ) : (
        <View style={styles.safeBanner}>
          <MaterialCommunityIcons name="shield-check-outline" size={17} color={colors.success} />
          <Text style={styles.safeText}>Keep contact details private until both sides approve.</Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        <View style={[styles.flex, Platform.OS === 'android' && { marginBottom: keyboardHeight }]}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(i, index) => i._id || `${index}`}
              renderItem={renderMessage}
              contentContainerStyle={styles.list}
              inverted
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}

          <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 6) + 6 }]}>
            <View style={styles.inputMeta}>
              <Text style={styles.inputHint}>
                {canChat ? 'No phone, WhatsApp, Instagram, or email in chat.' : 'Approval required before messaging.'}
              </Text>
              <Text style={styles.charCount}>{inputText.length}/500</Text>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, !canChat && styles.inputDisabled]}
                value={inputText}
                onChangeText={handleTyping}
                placeholder={canChat ? (chatAccess?.sentByMe === 0 ? 'Send a respectful intro...' : 'Type a respectful message...') : 'Chat locked for now'}
                placeholderTextColor={colors.textPlaceholder}
                multiline
                maxLength={500}
                editable={canChat}
              />
              <Pressable
                onPress={handleSend}
                disabled={!inputText.trim() || !canChat || sending}
                style={[styles.sendButton, (!inputText.trim() || !canChat || sending) && styles.sendDisabled]}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <MaterialCommunityIcons name="send" size={19} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(250,247,242,0.96)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightBg,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  headerSub: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  safeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    backgroundColor: '#EEF7F2',
    borderBottomWidth: 1,
    borderBottomColor: '#CFE8DC',
  },
  safeText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  lockBanner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: 7,
    backgroundColor: '#FFF4E6',
    borderBottomWidth: 1,
    borderBottomColor: '#F0D8B5',
  },
  lockText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  acceptButton: {
    marginTop: 2,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  messageWrap: {
    maxWidth: '82%',
    marginBottom: spacing.sm,
  },
  messageMine: {
    alignSelf: 'flex-end',
  },
  messageTheirs: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderWidth: 1,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderBottomRightRadius: 7,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderBottomLeftRadius: 7,
  },
  messageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  messageTextMine: {
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  readReceipt: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  readSeen: {
    color: colors.success,
  },
  flagWarning: {
    color: colors.error,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  inputArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 8,
  },
  inputHint: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  charCount: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    maxHeight: 118,
    minHeight: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSoft,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  sendDisabled: {
    backgroundColor: colors.textMuted,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
