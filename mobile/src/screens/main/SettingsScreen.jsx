import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated, Easing, Linking,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import PrimaryButton from '../../components/ui/PrimaryButton';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { logout } from '../../store/slices/authSlice';
import colors from '../../theme/colors';
import { glassStyles } from '../../theme/glassmorphism';
import { radius, spacing } from '../../theme/spacing';
import { API_BASE_URL } from '../../utils/constants';

const CONTACT_EMAILS = {
    general: 'help@shadii.pk',
    admin: 'admin@shadii.pk',
    support: 'support@shadii.pk',
    abuse: 'abuse@shadii.pk',
};

export default function SettingsScreen({ navigation }) {
    const { user, token } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const slideAnim = useRef(new Animated.Value(40)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [notifications, setNotifications] = useState({
        messages: user?.settings?.notifications?.messages ?? true,
        matches: user?.settings?.notifications?.matches ?? true,
        profileViews: user?.settings?.notifications?.profileViews ?? false,
        promotions: user?.settings?.notifications?.promotions ?? false,
    });
    const [privacy, setPrivacy] = useState({
        showOnlineStatus: user?.settings?.privacy?.showOnlineStatus ?? true,
        showLastSeen: user?.settings?.privacy?.showLastSeen ?? true,
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
        ]).start();
    }, []);

    const saveSettings = async (newNotifications, newPrivacy) => {
        try {
            await fetch(`${API_BASE_URL}/profile/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ notifications: newNotifications, privacy: newPrivacy }),
            });
        } catch (_) { }
    };

    const updateNotification = (key, val) => {
        const updated = { ...notifications, [key]: val };
        setNotifications(updated);
        saveSettings(updated, privacy);
    };

    const updatePrivacy = (key, val) => {
        const updated = { ...privacy, [key]: val };
        setPrivacy(updated);
        saveSettings(notifications, updated);
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your profile and all data. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive', onPress: async () => {
                        try {
                            const res = await fetch(`${API_BASE_URL}/auth/delete-account`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            const data = await res.json();
                            if (data.success) {
                                Alert.alert('Account Deleted', 'Your account has been deleted.');
                                dispatch(logout());
                            } else {
                                Alert.alert('Error', data.message || 'Failed to delete account.');
                            }
                        } catch (_) {
                            Alert.alert('Error', 'Could not connect to server. Please try again.');
                        }
                    }
                },
            ]
        );
    };

    const openEmail = (email) => Linking.openURL(`mailto:${email}`);

    const resetPasswordModal = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setPasswordLoading(false);
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('All password fields are required.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('New password and confirm password do not match.');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters.');
            return;
        }

        setPasswordError('');
        setPasswordLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();

            if (data.success) {
                Alert.alert('Success', data.message || 'Password updated successfully.');
                setShowPasswordModal(false);
                resetPasswordModal();
            } else {
                setPasswordError(data.message || 'Failed to change password.');
            }
        } catch (_) {
            setPasswordError('Could not connect to server. Please try again.');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1A000A', '#0D0D0D']} style={StyleSheet.absoluteFill} />

            <ScreenHeader title="Settings" onBack={() => navigation.goBack()} insetsTop={insets.top} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    {/* Account Info */}
                    <View style={[glassStyles.card, styles.accountCard]}>
                        <View style={styles.accountAvatar}>
                            <LinearGradient colors={['#5C0F31', '#8B1A4A']} style={styles.avatarGrad}>
                                <Text style={styles.avatarInitial}>{user?.name?.[0] || 'U'}</Text>
                            </LinearGradient>
                            {user?.isVerified && (
                                <View style={styles.verifiedDot}>
                                    <MaterialCommunityIcons name="check-decagram" size={16} color={colors.accent} />
                                </View>
                            )}
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.accountName}>{user?.name || 'User'}</Text>
                            <Text style={styles.accountEmail}>{user?.email || 'user@shadii.pk'}</Text>
                            <View style={styles.planBadge}>
                                <Text style={styles.planBadgeText}>
                                    {user?.subscription?.isActive ? `${user.subscription.plan} plan` : 'Free Plan'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Notifications */}
                    <SectionTitle title="Notifications" icon="bell-outline" />
                    <View style={[glassStyles.card, styles.sectionCard]}>
                        {[
                            { key: 'messages', label: 'New Messages', sub: 'Alert when you receive a message' },
                            { key: 'matches', label: 'Daily Matches', sub: 'Alert when new matches are ready' },
                            { key: 'profileViews', label: 'Profile Views', sub: 'Know who viewed your profile' },
                            { key: 'promotions', label: 'Promotions & Offers', sub: 'Special deals and discounts' },
                        ].map((item, i, arr) => (
                            <View key={item.key}>
                                <View style={styles.toggleRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.toggleLabel}>{item.label}</Text>
                                        <Text style={styles.toggleSub}>{item.sub}</Text>
                                    </View>
                                    <Switch
                                        value={notifications[item.key]}
                                        onValueChange={(v) => updateNotification(item.key, v)}
                                        trackColor={{ false: colors.inactive, true: colors.accent }}
                                        thumbColor="#FFF"
                                    />
                                </View>
                                {i < arr.length - 1 && <View style={styles.rowDivider} />}
                            </View>
                        ))}
                    </View>

                    {/* Privacy */}
                    <SectionTitle title="Privacy" icon="shield-lock-outline" />
                    <View style={[glassStyles.card, styles.sectionCard]}>
                        {[
                            { key: 'showOnlineStatus', label: 'Show Online Status', sub: 'Others can see when you\'re active' },
                            { key: 'showLastSeen', label: 'Show Last Seen', sub: 'Display your last active time' },
                        ].map((item, i, arr) => (
                            <View key={item.key}>
                                <View style={styles.toggleRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.toggleLabel}>{item.label}</Text>
                                        <Text style={styles.toggleSub}>{item.sub}</Text>
                                    </View>
                                    <Switch
                                        value={privacy[item.key]}
                                        onValueChange={(v) => updatePrivacy(item.key, v)}
                                        trackColor={{ false: colors.inactive, true: colors.accent }}
                                        thumbColor="#FFF"
                                    />
                                </View>
                                {i < arr.length - 1 && <View style={styles.rowDivider} />}
                            </View>
                        ))}
                    </View>

                    {/* Account Actions */}
                    <SectionTitle title="Account" icon="account-settings-outline" />
                    <View style={[glassStyles.card, styles.sectionCard]}>
                        <MenuItem icon="pencil-outline" label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
                        <View style={styles.rowDivider} />
                        <MenuItem icon="shield-check-outline" label="Verify Profile" sub="Get blue tick" onPress={() => navigation.navigate('Verification')} />
                        <View style={styles.rowDivider} />
                        <MenuItem icon="cancel" label="Blocked Users" onPress={() => navigation.navigate('BlockedUsers')} />
                        <View style={styles.rowDivider} />
                        <MenuItem icon="lock-reset" label="Change Password" onPress={() => setShowPasswordModal(true)} />
                    </View>

                    {/* Support */}
                    <SectionTitle title="Support & Legal" icon="help-circle-outline" />
                    <View style={[glassStyles.card, styles.sectionCard]}>
                        <MenuItem icon="lifebuoy" label="Help & Support" onPress={() => navigation.navigate('Help')} />
                        <View style={styles.rowDivider} />
                        <MenuItem icon="email-outline" label="Contact Support" sub={CONTACT_EMAILS.support} onPress={() => openEmail(CONTACT_EMAILS.support)} />
                        <View style={styles.rowDivider} />
                        <MenuItem icon="shield-alert-outline" label="Report Abuse" sub={CONTACT_EMAILS.abuse} onPress={() => openEmail(CONTACT_EMAILS.abuse)} />
                        <View style={styles.rowDivider} />
                        <MenuItem icon="file-document-outline" label="Terms of Service" onPress={() => Linking.openURL('https://shadii.pk/terms')} />
                        <View style={styles.rowDivider} />
                        <MenuItem icon="lock-outline" label="Privacy Policy" onPress={() => Linking.openURL('https://shadii.pk/privacy')} />
                    </View>

                    {/* Danger Zone */}
                    <SectionTitle title="Danger Zone" icon="alert-circle-outline" iconColor={colors.error} />
                    <View style={[glassStyles.card, styles.sectionCard]}>
                        <TouchableOpacity style={styles.dangerRow} onPress={handleLogout}>
                            <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
                            <Text style={[styles.toggleLabel, { color: colors.error, flex: 1, marginLeft: 12 }]}>Log Out</Text>
                            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.error} />
                        </TouchableOpacity>
                        <View style={styles.rowDivider} />
                        <TouchableOpacity style={styles.dangerRow} onPress={handleDeleteAccount}>
                            <MaterialCommunityIcons name="delete-forever-outline" size={20} color={colors.error} />
                            <Text style={[styles.toggleLabel, { color: colors.error, flex: 1, marginLeft: 12 }]}>Delete Account</Text>
                            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.error} />
                        </TouchableOpacity>
                    </View>

                    {/* App Version */}
                    <Text style={styles.version}>Shadii.pk v1.0.0 — © 2026 Shadii Technologies{'\n'}Contact: {CONTACT_EMAILS.general}</Text>
                </Animated.View>
            </ScrollView>

            <Modal
                visible={showPasswordModal}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowPasswordModal(false);
                    resetPasswordModal();
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Change Password</Text>
                        <Text style={styles.modalSub}>Use at least 8 characters with upper/lowercase and a number.</Text>

                        <TextInput
                            style={styles.modalInput}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Current password"
                            placeholderTextColor={colors.textPlaceholder}
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.modalInput}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="New password"
                            placeholderTextColor={colors.textPlaceholder}
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.modalInput}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm new password"
                            placeholderTextColor={colors.textPlaceholder}
                            secureTextEntry
                        />

                        {!!passwordError && <Text style={styles.modalError}>{passwordError}</Text>}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancel}
                                onPress={() => {
                                    setShowPasswordModal(false);
                                    resetPasswordModal();
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <PrimaryButton
                                label="Update"
                                onPress={handleChangePassword}
                                loading={passwordLoading}
                                style={styles.modalPrimaryBtn}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function SectionTitle({ title, icon, iconColor }) {
    return (
        <View style={styles.sectionTitle}>
            <MaterialCommunityIcons name={icon} size={16} color={iconColor || colors.accent} />
            <Text style={[styles.sectionTitleText, iconColor && { color: iconColor }]}>{title}</Text>
        </View>
    );
}

function MenuItem({ icon, label, sub, onPress }) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.menuIconBg}>
                <MaterialCommunityIcons name={icon} size={18} color={colors.accent} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.menuLabel}>{label}</Text>
                {sub && <Text style={styles.menuSub}>{sub}</Text>}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20, paddingBottom: 40 },

    accountCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8 },
    accountAvatar: { position: 'relative' },
    avatarGrad: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    avatarInitial: { fontSize: 20, fontWeight: '800', color: '#FFF' },
    verifiedDot: { position: 'absolute', bottom: -2, right: -2 },
    accountName: { fontSize: 16, fontWeight: '700', color: colors.text },
    accountEmail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    planBadge: {
        alignSelf: 'flex-start', backgroundColor: 'rgba(212,175,55,0.15)',
        borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4,
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
    },
    planBadgeText: { fontSize: 11, color: colors.accent, fontWeight: '600', textTransform: 'capitalize' },

    sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 4 },
    sectionTitleText: { fontSize: 12, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', letterSpacing: 1 },
    sectionCard: { padding: 4, marginBottom: 4 },

    toggleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    toggleLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
    toggleSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

    rowDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 16 },

    menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    menuIconBg: {
        width: 44, height: 44, borderRadius: 10,
        backgroundColor: 'rgba(212,175,55,0.1)', alignItems: 'center', justifyContent: 'center',
    },
    menuLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
    menuSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

    dangerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },

    version: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 24, lineHeight: 20 },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    modalCard: {
        width: '100%',
        backgroundColor: colors.surfaceElevated,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.xl,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text,
    },
    modalSub: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    modalInput: {
        minHeight: 48,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceLight,
        color: colors.text,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
    },
    modalError: {
        color: colors.error,
        fontSize: 12,
        marginTop: 2,
        marginBottom: spacing.sm,
    },
    modalActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    modalCancel: {
        minHeight: 52,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCancelText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '700',
    },
    modalPrimaryBtn: {
        flex: 1,
    },
});
