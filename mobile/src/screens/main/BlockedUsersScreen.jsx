import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated, Easing,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';
import colors from '../../theme/colors';
import { glassStyles } from '../../theme/glassmorphism';
import { API_BASE_URL } from '../../utils/constants';

export default function BlockedUsersScreen({ navigation }) {
    const { token } = useSelector((s) => s.auth);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const slideAnim = useRef(new Animated.Value(30)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/profile/blocked`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setBlockedUsers(data.users || []);
        } catch (e) {
            // Use empty state gracefully
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = (userId, name) => {
        Alert.alert(
            'Unblock User',
            `Are you sure you want to unblock ${name}? They will be able to see your profile and message you again.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unblock',
                    onPress: async () => {
                        try {
                            const res = await fetch(`${API_BASE_URL}/profile/unblock/${userId}`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            const data = await res.json();
                            if (data.success) {
                                setBlockedUsers((prev) => prev.filter((u) => u._id !== userId));
                            }
                        } catch (e) {
                            Alert.alert('Error', 'Could not unblock user. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item, index }) => (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={[glassStyles.card, styles.userCard]}>
                <View style={styles.userAvatar}>
                    {item.photo ? (
                        <Image source={{ uri: item.photo }} style={styles.avatarImg} />
                    ) : (
                        <LinearGradient colors={['#5C0F31', '#8B1A4A']} style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitial}>{item.name?.[0] || '?'}</Text>
                        </LinearGradient>
                    )}
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userDetails}>
                        {[item.age && `${item.age} yrs`, item.city].filter(Boolean).join(' · ')}
                    </Text>
                    <View style={styles.blockedBadge}>
                        <MaterialCommunityIcons name="cancel" size={12} color={colors.error} />
                        <Text style={styles.blockedBadgeText}>Blocked</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.unblockBtn}
                    onPress={() => handleUnblock(item._id, item.name)}
                    activeOpacity={0.75}
                >
                    <Text style={styles.unblockBtnText}>Unblock</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1A000A', '#0D0D0D']} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Blocked Users</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{blockedUsers.length}</Text>
                </View>
            </View>

            {!loading && blockedUsers.length === 0 ? (
                <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
                    <MaterialCommunityIcons name="account-check-outline" size={72} color={colors.textMuted} />
                    <Text style={styles.emptyTitle}>No Blocked Users</Text>
                    <Text style={styles.emptySub}>
                        Users you block will appear here.{'\n'}You can unblock them at any time.
                    </Text>
                </Animated.View>
            ) : (
                <FlatList
                    data={blockedUsers}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    ListHeaderComponent={
                        <View style={styles.infoBox}>
                            <MaterialCommunityIcons name="information-outline" size={16} color={colors.textSecondary} />
                            <Text style={styles.infoText}>
                                Blocked users cannot see your profile or send you messages.
                            </Text>
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
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    },
    backBtn: { padding: 8, backgroundColor: colors.glass, borderRadius: 12, borderWidth: 1, borderColor: colors.glassBorderLight },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    countBadge: {
        minWidth: 40, height: 28, borderRadius: 14,
        backgroundColor: 'rgba(231,76,60,0.2)', alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 10, borderWidth: 1, borderColor: 'rgba(231,76,60,0.4)',
    },
    countText: { fontSize: 14, fontWeight: '700', color: colors.error },

    list: { paddingHorizontal: 20, paddingBottom: 40 },
    infoBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        padding: 14, backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12, marginBottom: 16, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    infoText: { fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 18 },

    userCard: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    userAvatar: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden' },
    avatarImg: { width: 52, height: 52, borderRadius: 26 },
    avatarPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    avatarInitial: { fontSize: 20, fontWeight: '800', color: '#FFF' },
    userName: { fontSize: 16, fontWeight: '700', color: colors.text },
    userDetails: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
    blockedBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        marginTop: 6, alignSelf: 'flex-start',
        backgroundColor: 'rgba(231,76,60,0.12)', borderRadius: 6,
        paddingHorizontal: 8, paddingVertical: 3,
    },
    blockedBadgeText: { fontSize: 11, color: colors.error, fontWeight: '600' },

    unblockBtn: {
        paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12,
        borderWidth: 1.5, borderColor: colors.accent,
    },
    unblockBtnText: { fontSize: 13, fontWeight: '700', color: colors.accent },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    emptyTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 20 },
    emptySub: { fontSize: 15, color: colors.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 22 },
});
