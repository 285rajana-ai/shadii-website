import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useSocket } from '../../hooks/useSocket';
import colors from '../../theme/colors';
import { API_BASE_URL } from '../../utils/constants';

export default function ChatDetailScreen({ route, navigation }) {
  const { userId: otherUserId, userName } = route.params;
  const { token, user } = useSelector((s) => s.auth);
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const flatListRef = useRef(null);

  const myId = user?.id || user?._id;
  const conversationId = [myId, otherUserId].sort().join('_');

  useEffect(() => {
    fetchMessages();

    // Mark seen on mount
    fetch(`${API_BASE_URL}/chat/${otherUserId}/seen`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('message:receive', (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [msg, ...prev]);
        socket.emit('message:seen', { conversationId });
      }
    });

    socket.on('message:sent', (msg) => {
      setMessages((prev) => [msg, ...prev]);
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

    return () => {
      socket.off('message:receive');
      socket.off('message:sent');
      socket.off('message:flagged');
      socket.off('message:typing');
      socket.off('subscription:required');
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
    } catch (e) {
      console.log('Fetch msgs error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || !socket) return;

    socket.emit('message:send', {
      receiverId: otherUserId,
      content: inputText.trim(),
      conversationId
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

  return (
    <LinearGradient colors={[colors.background, '#FCE4EC']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{userName}</Text>
            {typing ? (
              <Text style={styles.typingText}>typing...</Text>
            ) : (
              <Text style={styles.onlineText}>Online</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileDetail', { userId: otherUserId })}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        {loading ? (
          <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(i) => i._id || Math.random().toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.list}
            inverted
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input */}
        <View style={styles.inputArea}>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={handleTyping}
              placeholder="Type a message..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSend}
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              disabled={!inputText.trim()}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.safetyNote}>🔒 Contact sharing is monitored. Stay safe.</Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingTop: 50, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
    zIndex: 10
  },
  headerInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backBtn: { padding: 8, marginRight: 8 },
  backIcon: { fontSize: 24, color: colors.primary },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 18, fontWeight: '800', color: colors.text },
  onlineText: { fontSize: 12, color: colors.online, fontWeight: '500' },
  typingText: { fontSize: 12, color: colors.primaryLight, fontStyle: 'italic' },
  profileIcon: { fontSize: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingVertical: 20 },

  msgWrapper: { marginBottom: 16, maxWidth: '80%' },
  msgMine: { alignSelf: 'flex-end' },
  msgTheirs: { alignSelf: 'flex-start' },
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  bubbleMine: { backgroundColor: colors.bubbleSent, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.bubbleReceived, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.glassBorder },
  msgContent: { fontSize: 15, lineHeight: 22 },
  msgContentMine: { color: '#fff' },
  msgContentTheirs: { color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  timeText: { fontSize: 11, color: colors.textMuted },
  readReceipt: { fontSize: 12, color: colors.textMuted },
  readReceiptSeen: { color: colors.primary },
  freeDelayNote: { fontSize: 10, color: colors.primaryLight, fontStyle: 'italic' },
  flagWarning: { fontSize: 11, color: colors.error, marginBottom: 4, alignSelf: 'flex-end' },

  inputArea: {
    borderTopWidth: 1, borderTopColor: colors.glassBorder,
    paddingHorizontal: 16, paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12,
    maxHeight: 100, fontSize: 15, color: colors.text
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center'
  },
  sendBtnDisabled: { backgroundColor: colors.border },
  sendIcon: { color: '#fff', fontSize: 18, transform: [{ rotate: '-45deg' }], marginLeft: 4, marginTop: -2 },
  safetyNote: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
});
