import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Animated, Easing,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import ScreenHeader from '../../components/ui/ScreenHeader';
import colors from '../../theme/colors';
import { API_BASE_URL } from '../../utils/constants';

// Remove the MOCK_NOTIFICATIONS block entirely

const ICON_MAP = {
    match: { icon: 'heart-multiple-outline', color: colors.rose },
    message: { icon: 'message-outline', color: '#3498DB' },
    view: { icon: 'eye-outline', color: '#9B59B6' },
    verification: { icon: 'check-decagram', color: colors.accent },
    subscription: { icon: 'crown-outline', color: colors.accent },
    promo: { icon: 'tag-outline', color: colors.boost },
    default: { icon: 'bell-outline', color: colors.textSecondary },
};

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsScreen({ navigation }) {
    const { token } = useSelector((s) => s.auth);
    const insets = useSafeAreaInsets();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const slideAnim = useRef(new Animated.Value(30)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setNotifications(data.notifications || []);
        } catch (_) { }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        try {
            await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (_) { }
    };

    const markRead = async (id) => {
        setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
        try {
            await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (_) { }
    };

    const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

    const renderItem = ({ item }) => {
        const { icon, color } = ICON_MAP[item.type] || ICON_MAP.default;
        return (
            <TouchableOpacity
                style={[styles.notifCard, !item.read && styles.notifCardUnread]}
                onPress={() => markRead(item._id)}
                activeOpacity={0.8}
            >
                {!item.read && <LinearGradient colors={['rgba(212,175,55,0.07)', 'transparent']} style={StyleSheet.absoluteFill} />}
                <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
                    <MaterialCommunityIcons name={icon} size={22} color={color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
                    <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1A000A', '#0D0D0D']} style={StyleSheet.absoluteFill} />

            <ScreenHeader
                title="Notifications"
                onBack={() => navigation.goBack()}
                insetsTop={insets.top}
                rightWidth={96}
                right={
                    unreadCount > 0 ? (
                        <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead} activeOpacity={0.8}>
                            <Text style={styles.markAllText}>Mark all read</Text>
                        </TouchableOpacity>
                    ) : null
                }
            />

            {unreadCount > 0 && (
                <View style={styles.unreadMetaRow}>
                    <Text style={styles.headerSub}>{unreadCount} unread</Text>
                </View>
            )}

            {/* Filter Pills */}
            <View style={styles.filterRow}>
                {[
                    { id: 'all', label: 'All' },
                    { id: 'unread', label: `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}` },
                ].map((f) => (
                    <TouchableOpacity
                        key={f.id}
                        style={[styles.filterPill, filter === f.id && styles.filterPillActive]}
                        onPress={() => setFilter(f.id)}
                    >
                        <Text style={[styles.filterPillText, filter === f.id && styles.filterPillTextActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {filtered.length === 0 ? (
                <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
                    <MaterialCommunityIcons name="bell-sleep-outline" size={72} color={colors.textMuted} />
                    <Text style={styles.emptyTitle}>All Caught Up!</Text>
                    <Text style={styles.emptySub}>No unread notifications. You're up to date.</Text>
                </Animated.View>
            ) : (
                <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => { setRefreshing(true); fetchNotifications(); }}
                                tintColor={colors.accent}
                            />
                        }
                    />
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    unreadMetaRow: {
        paddingHorizontal: 20,
        marginTop: -8,
        paddingBottom: 8,
    },
    headerSub: { fontSize: 12, color: colors.accent, marginTop: 2 },
    markAllBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    markAllText: { fontSize: 12, color: colors.accent, fontWeight: '600' },

    filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
    filterPill: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorderLight,
    },
    filterPillActive: { backgroundColor: 'rgba(212,175,55,0.15)', borderColor: 'rgba(212,175,55,0.4)' },
    filterPillText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    filterPillTextActive: { color: colors.accent },

    list: { paddingHorizontal: 20, paddingBottom: 40 },

    notifCard: {
        flexDirection: 'row', alignItems: 'flex-start', padding: 12,
        backgroundColor: colors.glassMedium, borderRadius: 18,
        borderWidth: 1, borderColor: colors.glassBorderLight, overflow: 'hidden',
        position: 'relative',
    },
    notifCardUnread: { borderColor: 'rgba(212,175,55,0.25)' },
    iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    notifTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4, lineHeight: 20 },
    notifBody: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
    notifTime: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 4 },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 20 },
    emptySub: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 22 },
});
