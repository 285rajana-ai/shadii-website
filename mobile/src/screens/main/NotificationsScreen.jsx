import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Animated, Easing,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';
import colors from '../../theme/colors';

// Mock notifications for offline/demo
const MOCK_NOTIFICATIONS = [
    {
        _id: '1', type: 'match', title: 'New Daily Matches Ready! 💫',
        body: 'Your 5 new match suggestions are ready. Check them out!',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), read: false,
    },
    {
        _id: '2', type: 'message', title: 'Mahnoor sent you a message',
        body: 'As-salamu alaykum! I saw your profile and...',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), read: false,
    },
    {
        _id: '3', type: 'view', title: 'Someone viewed your profile',
        body: 'A verified member from Lahore viewed your profile.',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), read: true,
    },
    {
        _id: '4', type: 'verification', title: 'Verification Approved ✅',
        body: 'Congratulations! Your profile is now verified. You have a blue tick.',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: true,
    },
    {
        _id: '5', type: 'subscription', title: 'Your Premium Plan is Active',
        body: 'Welcome to Premium! You can now send unlimited messages and view all photos.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read: true,
    },
    {
        _id: '6', type: 'promo', title: 'Limited Offer 🎉',
        body: 'Get 20% off Premium this week. Offer expires Sunday.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), read: true,
    },
];

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
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState('all');
    const slideAnim = useRef(new Animated.Value(30)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const markRead = (id) => {
        setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
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
                <View style={{ flex: 1, marginLeft: 14 }}>
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

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && <Text style={styles.headerSub}>{unreadCount} unread</Text>}
                </View>
                {unreadCount > 0 ? (
                    <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
                        <Text style={styles.markAllText}>Mark all read</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 80 }} />
                )}
            </View>

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
                    />
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 56, paddingBottom: 12, paddingHorizontal: 20,
    },
    backBtn: { padding: 8, backgroundColor: colors.glass, borderRadius: 12, borderWidth: 1, borderColor: colors.glassBorderLight },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    headerSub: { fontSize: 12, color: colors.accent, marginTop: 2 },
    markAllBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    markAllText: { fontSize: 13, color: colors.accent, fontWeight: '600' },

    filterRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingBottom: 14 },
    filterPill: {
        paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
        backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorderLight,
    },
    filterPillActive: { backgroundColor: 'rgba(212,175,55,0.15)', borderColor: 'rgba(212,175,55,0.4)' },
    filterPillText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    filterPillTextActive: { color: colors.accent },

    list: { paddingHorizontal: 20, paddingBottom: 40 },

    notifCard: {
        flexDirection: 'row', alignItems: 'flex-start', padding: 14,
        backgroundColor: colors.glassMedium, borderRadius: 18,
        borderWidth: 1, borderColor: colors.glassBorderLight, overflow: 'hidden',
        position: 'relative',
    },
    notifCardUnread: { borderColor: 'rgba(212,175,55,0.25)' },
    iconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    notifTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4, lineHeight: 20 },
    notifBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
    notifTime: { fontSize: 11, color: colors.textMuted, marginTop: 6 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 6 },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    emptyTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 20 },
    emptySub: { fontSize: 15, color: colors.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 22 },
});
