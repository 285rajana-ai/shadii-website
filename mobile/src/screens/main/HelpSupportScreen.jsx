import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    LayoutAnimation,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ui/ScreenHeader';
import colors from '../../theme/colors';
import { glassStyles } from '../../theme/glassmorphism';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');
const CONTACT_CARD_WIDTH = (width - (20 * 2) - 10) / 2;

const CONTACT = {
    general: 'help@shadii.pk',
    support: 'support@shadii.pk',
};

const FAQ_DATA = [
    {
        category: 'Getting Started',
        icon: 'rocket-launch-outline',
        faqs: [
            {
                q: 'How do I create my profile?',
                a: 'Sign up with your email or phone number, then complete your profile with your photo, bio, and preferences. A complete profile gets 3× more matches.',
            },
            {
                q: 'Is Shadii.pk free to use?',
                a: 'Yes! Basic browsing and your first message in any conversation are free. To send unlimited messages and unlock all features, you\'ll need a subscription starting at PKR 1,000/month.',
            },
            {
                q: 'How do I verify my profile?',
                a: 'Go to Profile → Verify Profile. You\'ll upload your CNIC (front & back) and take a live selfie. Our team reviews it within 24-48 hours.',
            },
        ],
    },
    {
        category: 'Matching & Discovery',
        icon: 'heart-search',
        faqs: [
            {
                q: 'How do daily matches work?',
                a: 'Every morning at 8 AM, our algorithm suggests 3–5 highly compatible profiles based on your preferences (age, city, education, caste, interests). These reset daily.',
            },
            {
                q: 'Can I filter who I see?',
                a: 'Yes! On the Discover screen, use filters to narrow by gender, age range, city, education, and caste. Paid members get advanced filters like religion and marital status.',
            },
            {
                q: 'Why are some photos blurred?',
                a: 'Verified female profiles have photos revealed only to subscribed members. This is a privacy protection feature. Subscribe to see all photos.',
            },
        ],
    },
    {
        category: 'Messaging & Safety',
        icon: 'chat-processing-outline',
        faqs: [
            {
                q: 'Why can I only send one free message?',
                a: 'Your first message in each conversation is free. After that, a subscription is required. This keeps conversations meaningful and reduces spam.',
            },
            {
                q: 'What happens if I share my phone number in chat?',
                a: 'Sharing contact info (phone, WhatsApp, Instagram, etc.) in chat is not allowed. First offense results in a warning; repeat violations lead to a 24-hour account suspension.',
            },
            {
                q: 'Why does my message show "delivered" after 6 hours?',
                a: 'For free-tier users, the first message shows as "delivered" and "seen" after a 6-hour delay. This encourages both users to subscribe for real-time updates.',
            },
        ],
    },
    {
        category: 'Subscriptions & Payments',
        icon: 'credit-card-outline',
        faqs: [
            {
                q: 'What payment methods are accepted?',
                a: 'Android purchases are processed securely through Google Play Billing. If we offer any manual transfer option outside Android, access is activated only after payment verification.',
            },
            {
                q: 'What is Profile Boost?',
                a: 'Profile Boost (PKR 500 / 3 days) pushes your profile to the top of search results and Today\'s Picks, giving you up to 10× more views.',
            },
            {
                q: 'How do I cancel my subscription?',
                a: 'Subscriptions are non-refundable but you can choose not to renew. Email support@shadii.pk for assistance.',
            },
        ],
    },
    {
        category: 'Reporting & Safety',
        icon: 'shield-alert-outline',
        faqs: [
            {
                q: 'How do I report a fake or inappropriate profile?',
                a: 'On any profile page, tap the flag icon to report. Select the reason (fake profile, harassment, scam, etc.). Our team reviews all reports within 24 hours.',
            },
            {
                q: 'How do I block someone?',
                a: 'Open their profile and tap "Block". Blocked users cannot message you or see your profile. Go to Settings → Blocked Users to manage your list.',
            },
            {
                q: 'Is my CNIC data safe?',
                a: 'Absolutely. CNIC documents are encrypted, stored securely on our servers, and only used for identity verification. We never share them with other users.',
            },
        ],
    },
];

export default function HelpSupportScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [message, setMessage] = useState('');
    const slideAnim = useRef(new Animated.Value(40)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
        ]).start();
    }, []);

    const toggleFaq = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const sendMessage = () => {
        if (!message.trim()) return;
        const subject = encodeURIComponent('Support Request — Shadii.pk App');
        const body = encodeURIComponent(message.trim());
        Linking.openURL(`mailto:${CONTACT.support}?subject=${subject}&body=${body}`).then(() => {
            setMessage('');
        }).catch(() => {
            Alert.alert('Error', 'Could not open email client. Please email us directly at ' + CONTACT.support);
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient colors={colors.gradients.hero} style={StyleSheet.absoluteFill} />

            <ScreenHeader title="Help & Support" onBack={() => navigation.goBack()} insetsTop={insets.top} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    {/* Hero */}
                    <View style={styles.hero}>
                        <LinearGradient colors={['rgba(212,175,55,0.15)', 'transparent']} style={StyleSheet.absoluteFill} />
                        <MaterialCommunityIcons name="lifebuoy" size={44} color={colors.accent} />
                        <Text style={styles.heroTitle}>How can we help?</Text>
                        <Text style={styles.heroSub}>Browse FAQs or reach our support team directly.</Text>
                    </View>

                    {/* Contact Cards */}
                    <View style={styles.contactGrid}>
                        {[
                            { icon: 'help-circle-outline', label: 'General Help', email: CONTACT.general, color: colors.accent },
                            { icon: 'headset', label: 'Support', email: CONTACT.support, color: '#3498DB' },
                        ].map((c, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.contactCard}
                                onPress={() => Linking.openURL(`mailto:${c.email}`)}
                                activeOpacity={0.75}
                            >
                                <View style={[styles.contactIconBg, { backgroundColor: c.color + '20' }]}>
                                    <MaterialCommunityIcons name={c.icon} size={20} color={c.color} />
                                </View>
                                <Text style={styles.contactLabel}>{c.label}</Text>
                                <Text style={styles.contactEmail}>{c.email}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Quick Message */}
                    <View style={[glassStyles.card, styles.quickMessage]}>
                        <Text style={styles.quickMessageTitle}>Send us a message</Text>
                        <Text style={styles.quickMessageSub}>We typically respond within 24 hours</Text>
                        <TextInput
                            style={styles.messageInput}
                            placeholder="Describe your issue..."
                            placeholderTextColor={colors.textMuted}
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} activeOpacity={0.85}>
                            <LinearGradient colors={['#BF953F', '#D4AF37']} style={StyleSheet.absoluteFill} />
                            <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
                            <Text style={styles.sendBtnText}>Send Message</Text>
                        </TouchableOpacity>
                    </View>

                    {/* FAQs */}
                    <Text style={styles.faqHeading}>Frequently Asked Questions</Text>

                    {FAQ_DATA.map((section, sIdx) => (
                        <View key={sIdx} style={styles.faqSection}>
                            <View style={styles.faqCategoryHeader}>
                                <MaterialCommunityIcons name={section.icon} size={18} color={colors.accent} />
                                <Text style={styles.faqCategory}>{section.category}</Text>
                            </View>
                            <View style={[glassStyles.card, { padding: 0, overflow: 'hidden' }]}>
                                {section.faqs.map((faq, fIdx) => {
                                    const id = `${sIdx}-${fIdx}`;
                                    const isOpen = expandedFaq === id;
                                    return (
                                        <View key={fIdx}>
                                            <TouchableOpacity style={styles.faqQuestion} onPress={() => toggleFaq(id)} activeOpacity={0.8}>
                                                <Text style={styles.faqQText}>{faq.q}</Text>
                                                <MaterialCommunityIcons
                                                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                                                    size={20}
                                                    color={isOpen ? colors.accent : colors.textMuted}
                                                />
                                            </TouchableOpacity>
                                            {isOpen && (
                                                <View style={styles.faqAnswer}>
                                                    <Text style={styles.faqAText}>{faq.a}</Text>
                                                </View>
                                            )}
                                            {fIdx < section.faqs.length - 1 && <View style={styles.faqDivider} />}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    ))}

                    {/* Social Media Links */}
                    <View style={styles.socialContainer}>
                        <Text style={styles.socialTitle}>Follow Us on Social Media</Text>
                        <View style={styles.socialRow}>
                            <TouchableOpacity style={styles.socialIconBtn} onPress={() => Linking.openURL('https://facebook.com/shadii.pk/')} activeOpacity={0.75}>
                                <MaterialCommunityIcons name="facebook" size={22} color={colors.accent} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialIconBtn} onPress={() => Linking.openURL('https://www.instagram.com/shadii.pk')} activeOpacity={0.75}>
                                <MaterialCommunityIcons name="instagram" size={22} color={colors.accent} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialIconBtn} onPress={() => Linking.openURL('https://www.tiktok.com/@shadii.pk')} activeOpacity={0.75}>
                                <MaterialCommunityIcons name="music-note" size={22} color={colors.accent} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Bottom Links */}
                    <View style={styles.bottomLinks}>
                        <TouchableOpacity onPress={() => Linking.openURL('https://shadii.pk/terms')}>
                            <Text style={styles.linkText}>Terms of Service</Text>
                        </TouchableOpacity>
                        <Text style={styles.linkDot}>·</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('https://shadii.pk/privacy')}>
                            <Text style={styles.linkText}>Privacy Policy</Text>
                        </TouchableOpacity>
                        <Text style={styles.linkDot}>·</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('https://shadii.pk')}>
                            <Text style={styles.linkText}>Website</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20, paddingBottom: 40 },

    hero: {
        alignItems: 'center', paddingVertical: 24, borderRadius: 20, marginBottom: 20,
        overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
    },
    heroTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 12 },
    heroSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },

    contactGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs + 2, marginBottom: 20 },
    contactCard: {
        width: CONTACT_CARD_WIDTH,
        padding: 16,
        backgroundColor: colors.surface, borderRadius: 18,
        borderWidth: 1, borderColor: colors.border,
    },
    contactIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    contactLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
    contactEmail: { fontSize: 11, color: colors.textMuted, marginTop: 4 },

    quickMessage: { padding: 20, marginBottom: 24 },
    quickMessageTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    quickMessageSub: { fontSize: 12, color: colors.textSecondary, marginTop: 4, marginBottom: 12 },
    messageInput: {
        backgroundColor: colors.surfaceLight, borderRadius: 14,
        padding: 12, fontSize: 14, color: colors.text,
        borderWidth: 1, borderColor: colors.border,
        minHeight: 100, marginBottom: 12,
    },
    sendBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 12, borderRadius: 14, overflow: 'hidden',
    },
    sendBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

    faqHeading: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 16 },
    faqSection: { marginBottom: 20 },
    faqCategoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    faqCategory: { fontSize: 12, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
    faqQuestion: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 16,
    },
    faqQText: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1, paddingRight: 12, lineHeight: 22 },
    faqAnswer: { paddingHorizontal: 16, paddingBottom: 16 },
    faqAText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
    faqDivider: { height: 1, backgroundColor: colors.divider, marginHorizontal: 16 },

    bottomLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
    linkText: { fontSize: 12, color: colors.accent, fontWeight: '600' },
    linkDot: { color: colors.textMuted, fontSize: 14 },
    socialContainer: { alignItems: 'center', marginVertical: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.divider },
    socialTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    socialRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    socialIconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1.5, elevation: 1 },
});
