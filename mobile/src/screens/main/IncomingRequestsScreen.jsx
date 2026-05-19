import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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

export default function IncomingRequestsScreen({ navigation }) {
    const { token } = useSelector((s) => s.auth);
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [photoRequests, setPhotoRequests] = useState([]);
    const [contactRequests, setContactRequests] = useState([]);
    const [tab, setTab] = useState('photos'); // 'photos' | 'contacts'
    const [acting, setActing] = useState(null); // userId being acted on

    const load = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/profile/incoming-requests`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setPhotoRequests(data.photoRequests || []);
                setContactRequests(data.contactRequests || []);
            }
        } catch (_) { }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // ── Photo request handlers ──────────────────────────────────────────────────
    const respondPhoto = async (fromUserId, action) => {
        setActing(fromUserId);
        try {
            const res = await fetch(`${API_BASE_URL}/profile/photo-requests/${fromUserId}/respond`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            if (data.success) {
                setPhotoRequests((prev) => prev.filter((u) => u._id !== fromUserId));
                Alert.alert(
                    action === 'accept' ? 'Photos Shared ✓' : 'Request Declined',
                    action === 'accept'
                        ? 'They can now view your profile photos.'
                        : 'The request has been declined.',
                    [{ text: 'OK' }]
                );
            }
        } catch (_) {
            Alert.alert('Error', 'Could not process request. Please try again.');
        } finally {
            setActing(null);
        }
    };

    // ── Contact share request handlers ─────────────────────────────────────────
    const respondContact = async (requestId, fromUserId, status) => {
        setActing(requestId);
        try {
            const res = await fetch(`${API_BASE_URL}/profile/contact-requests/${requestId}/respond`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (data.success) {
                setContactRequests((prev) => prev.filter((r) => r._id !== requestId));
                Alert.alert(
                    status === 'accepted' ? 'Request Accepted ✓' : 'Request Declined',
                    status === 'accepted'
                        ? 'They will be notified and can pay PKR 299 to unlock your contact details.'
                        : 'The contact share request has been declined.',
                    [{ text: 'OK' }]
                );
            }
        } catch (_) {
            Alert.alert('Error', 'Could not process request. Please try again.');
        } finally {
            setActing(null);
        }
    };

    const totalCount = photoRequests.length + contactRequests.length;

    const renderPhotoItem = ({ item }) => {
        const photo = item.photos?.find((p) => p.isMain)?.url || item.photos?.[0]?.url;
        const isActing = acting === item._id;
        return (
            <View style={styles.card}>
                <View style={styles.cardLeft}>
                    <View style={styles.avatarCircle}>
                        {photo ? null : (
                            <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase()}</Text>
                        )}
                        <LinearGradient
                            colors={colors.gradients.primary}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <Text style={[styles.avatarText, { position: 'absolute' }]}>
                            {item.name?.[0]?.toUpperCase()}
                        </Text>
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.cardName}>{item.name}</Text>
                        <Text style={styles.cardSub}>{item.age} yrs · {item.city || 'Pakistan'}</Text>
                        <View style={styles.requestTypeBadge}>
                            <MaterialCommunityIcons name="eye-outline" size={12} color={colors.accent} />
                            <Text style={styles.requestTypeText}>Photo View Request</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.actionRow}>
                    {isActing ? (
                        <ActivityIndicator color={colors.accent} />
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.declineBtn]}
                                onPress={() => respondPhoto(item._id, 'reject')}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="close" size={16} color="#EE5D50" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.acceptBtn]}
                                onPress={() => respondPhoto(item._id, 'accept')}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="check" size={16} color="#05CD99" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        );
    };

    const renderContactItem = ({ item }) => {
        const fromUser = item.fromUser;
        const photo = fromUser?.photos?.find((p) => p.isMain)?.url || fromUser?.photos?.[0]?.url;
        const isActing = acting === item._id;
        return (
            <View style={styles.card}>
                <View style={styles.cardLeft}>
                    <View style={styles.avatarCircle}>
                        <LinearGradient
                            colors={colors.gradients.royal || colors.gradients.primary}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <Text style={[styles.avatarText, { position: 'absolute' }]}>
                            {fromUser?.name?.[0]?.toUpperCase()}
                        </Text>
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.cardName}>{fromUser?.name || 'Unknown'}</Text>
                        <Text style={styles.cardSub}>{fromUser?.age} yrs · {fromUser?.city || 'Pakistan'}</Text>
                        <View style={[styles.requestTypeBadge, { backgroundColor: 'rgba(123,97,255,0.12)' }]}>
                            <MaterialCommunityIcons name="phone-forward" size={12} color="#7B61FF" />
                            <Text style={[styles.requestTypeText, { color: '#7B61FF' }]}>Contact Share Request</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.actionRow}>
                    {isActing ? (
                        <ActivityIndicator color={colors.accent} />
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.declineBtn]}
                                onPress={() => respondContact(item._id, fromUser?._id, 'rejected')}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="close" size={16} color="#EE5D50" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.acceptBtn]}
                                onPress={() => respondContact(item._id, fromUser?._id, 'accepted')}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="check" size={16} color="#05CD99" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        );
    };

    const activeData = tab === 'photos' ? photoRequests : contactRequests;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1A000A', '#0D0D0D']} style={StyleSheet.absoluteFill} />

            <ScreenHeader
                title="Incoming Requests"
                onBack={() => navigation.goBack()}
                insetsTop={insets.top}
            />

            {/* Tab Pills */}
            <View style={styles.tabRow}>
                <TouchableOpacity
                    style={[styles.tabPill, tab === 'photos' && styles.tabPillActive]}
                    onPress={() => setTab('photos')}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons
                        name="eye-outline"
                        size={16}
                        color={tab === 'photos' ? colors.accent : colors.textMuted}
                    />
                    <Text style={[styles.tabText, tab === 'photos' && styles.tabTextActive]}>
                        Photo Requests {photoRequests.length > 0 ? `(${photoRequests.length})` : ''}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabPill, tab === 'contacts' && styles.tabPillActive]}
                    onPress={() => setTab('contacts')}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons
                        name="phone-forward"
                        size={16}
                        color={tab === 'contacts' ? '#7B61FF' : colors.textMuted}
                    />
                    <Text style={[styles.tabText, tab === 'contacts' && { color: '#7B61FF' }]}>
                        Contact Requests {contactRequests.length > 0 ? `(${contactRequests.length})` : ''}
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : activeData.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons
                        name={tab === 'photos' ? 'eye-off-outline' : 'phone-off-outline'}
                        size={72}
                        color={colors.textMuted}
                    />
                    <Text style={styles.emptyTitle}>No Pending Requests</Text>
                    <Text style={styles.emptySub}>
                        {tab === 'photos'
                            ? 'When someone requests to view your photos, they will appear here.'
                            : 'When someone requests your contact, they will appear here.'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={activeData}
                    keyExtractor={(item) => (item._id || item).toString()}
                    renderItem={tab === 'photos' ? renderPhotoItem : renderContactItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); load(); }}
                            tintColor={colors.accent}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    tabRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    tabPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    tabPillActive: {
        backgroundColor: 'rgba(212,175,55,0.1)',
        borderColor: 'rgba(212,175,55,0.3)',
    },
    tabText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
    tabTextActive: { color: colors.accent },
    list: { paddingHorizontal: 16, paddingBottom: 40 },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { fontSize: 20, fontWeight: '700', color: '#fff', zIndex: 1 },
    cardName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
    cardSub: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
    requestTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(212,175,55,0.12)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    requestTypeText: { fontSize: 11, fontWeight: '600', color: colors.accent },
    actionRow: { flexDirection: 'row', gap: 10, marginLeft: 10 },
    actionBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
    },
    declineBtn: {
        borderColor: 'rgba(238,93,80,0.4)',
        backgroundColor: 'rgba(238,93,80,0.1)',
    },
    acceptBtn: {
        borderColor: 'rgba(5,205,153,0.4)',
        backgroundColor: 'rgba(5,205,153,0.1)',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginTop: 20,
        marginBottom: 10,
    },
    emptySub: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
});
