import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated, Easing, Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import colors from '../../theme/colors';
import { glassStyles } from '../../theme/glassmorphism';

const CONTACT_EMAILS = {
    general: 'help@shadii.pk',
    admin: 'admin@shadii.pk',
    support: 'support@shadii.pk',
    abuse: 'abuse@shadii.pk',
};

export default function SettingsScreen({ navigation }) {
    const { user } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const slideAnim = useRef(new Animated.Value(40)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [notifications, setNotifications] = useState({
        messages: true,
        matches: true,
        profileViews: false,
        promotions: false,
    });
    const [privacy, setPrivacy] = useState({
        showOnlineStatus: true,
        showLastSeen: true,
        blurMyPhoto: false,
    });

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
        ]).start();
    }, []);

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
                { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Request Sent', 'Your account deletion request has been sent to support@shadii.pk') },
            ]
        );
    };

    const openEmail = (email) => Linking.openURL(`mailto:${email}`);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1A000A', '#0D0D0D']} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

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
                        <View style={{ flex: 1, marginLeft: 14 }}>
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
                                        onValueChange={(v) => setNotifications((p) => ({ ...p, [item.key]: v }))}
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
                                        onValueChange={(v) => setPrivacy((p) => ({ ...p, [item.key]: v }))}
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
                        <MenuItem icon="lock-reset" label="Change Password" onPress={() => Alert.alert('Change Password', 'A password reset link will be sent to ' + (user?.email || 'your email'))} />
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
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    },
    backBtn: { padding: 8, backgroundColor: colors.glass, borderRadius: 12, borderWidth: 1, borderColor: colors.glassBorderLight },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: 0.5 },
    scroll: { paddingHorizontal: 20, paddingBottom: 40 },

    accountCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8 },
    accountAvatar: { position: 'relative' },
    avatarGrad: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    avatarInitial: { fontSize: 22, fontWeight: '800', color: '#FFF' },
    verifiedDot: { position: 'absolute', bottom: -2, right: -2 },
    accountName: { fontSize: 17, fontWeight: '700', color: colors.text },
    accountEmail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    planBadge: {
        alignSelf: 'flex-start', backgroundColor: 'rgba(212,175,55,0.15)',
        borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6,
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
    },
    planBadgeText: { fontSize: 11, color: colors.accent, fontWeight: '600', textTransform: 'capitalize' },

    sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 4 },
    sectionTitleText: { fontSize: 13, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', letterSpacing: 1 },
    sectionCard: { padding: 4, marginBottom: 4 },

    toggleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    toggleLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
    toggleSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

    rowDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 16 },

    menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    menuIconBg: {
        width: 34, height: 34, borderRadius: 10,
        backgroundColor: 'rgba(212,175,55,0.1)', alignItems: 'center', justifyContent: 'center',
    },
    menuLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
    menuSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

    dangerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },

    version: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 24, lineHeight: 20 },
});
