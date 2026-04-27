import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';
import colors from '../../theme/colors';
import { glassStyles } from '../../theme/glassmorphism';

const { width } = Dimensions.get('window');

export default function BoostProfileScreen({ navigation }) {
    const { user, token } = useSelector((s) => s.auth);
    const [selected, setSelected] = useState('boost');
    const [loading, setLoading] = useState(false);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(60)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();

        // Pulse rocket animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.sine) }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.sine) }),
            ])
        ).start();

        // Glow loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] });

    const handleBoost = async () => {
        Alert.alert(
            '🚀 Confirm Boost',
            'Boost your profile for PKR 500 — appear at the top of searches for 3 days.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Proceed to Payment',
                    onPress: () => navigation.navigate('Payment', { plan: 'boost', paymentMethod: null }),
                },
            ]
        );
    };

    const isAlreadyBoosted = user?.boost?.isActive && new Date(user.boost.endDate) > new Date();
    const boostEnds = isAlreadyBoosted ? new Date(user.boost.endDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : null;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1A000A', '#0D0D0D', '#1A000A']} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Boost Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    {/* Hero Rocket Visual */}
                    <View style={styles.heroSection}>
                        <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <LinearGradient colors={['#FF6B35', '#FF4500']} style={styles.rocketCircle}>
                                <MaterialCommunityIcons name="rocket-launch" size={52} color="#FFF" />
                            </LinearGradient>
                        </Animated.View>
                        <Text style={styles.heroTitle}>Supercharge Your Visibility</Text>
                        <Text style={styles.heroSubtitle}>
                            Get seen by 10× more profiles. Appear at the top of Discover for 3 days.
                        </Text>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        {[
                            { icon: 'eye-outline', value: '10×', label: 'More Views' },
                            { icon: 'account-group-outline', value: '3×', label: 'Match Rate' },
                            { icon: 'clock-fast', value: '3', label: 'Days Active' },
                        ].map((stat, i) => (
                            <View key={i} style={[glassStyles.card, styles.statCard]}>
                                <MaterialCommunityIcons name={stat.icon} size={22} color={colors.boost} />
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Active Boost Banner */}
                    {isAlreadyBoosted && (
                        <View style={styles.activeBanner}>
                            <LinearGradient colors={['rgba(255, 107, 53, 0.25)', 'rgba(255, 69, 0, 0.1)']} style={StyleSheet.absoluteFill} />
                            <MaterialCommunityIcons name="rocket-launch" size={24} color={colors.boost} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.activeBannerTitle}>Boost is Active! 🔥</Text>
                                <Text style={styles.activeBannerSub}>Your profile is featured until {boostEnds}</Text>
                            </View>
                        </View>
                    )}

                    {/* Boost Package Card */}
                    <View style={[glassStyles.cardPremium, styles.packageCard]}>
                        <LinearGradient
                            colors={['rgba(255, 107, 53, 0.15)', 'rgba(0,0,0,0)']}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        />
                        <View style={styles.packageHeader}>
                            <View style={styles.packageIconBg}>
                                <MaterialCommunityIcons name="rocket" size={20} color="#FF6B35" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.packageName}>Profile Boost</Text>
                                <Text style={styles.packageDuration}>3 Days Visibility</Text>
                            </View>
                            <View style={styles.packagePrice}>
                                <Text style={styles.priceAmount}>PKR 500</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {[
                            'Appear at top of all search results',
                            'Featured in Today\'s Picks section',
                            'Priority in daily match suggestions',
                            'Boost badge on your profile card',
                            '10× more profile views guaranteed',
                        ].map((feat, i) => (
                            <View key={i} style={styles.featureRow}>
                                <MaterialCommunityIcons name="check-circle" size={18} color={colors.boost} />
                                <Text style={styles.featureText}>{feat}</Text>
                            </View>
                        ))}
                    </View>

                    {/* CTA Button */}
                    <TouchableOpacity
                        style={[styles.boostButton, isAlreadyBoosted && styles.disabledButton]}
                        onPress={isAlreadyBoosted ? null : handleBoost}
                        activeOpacity={0.85}
                    >
                        <LinearGradient colors={isAlreadyBoosted ? ['#444', '#333'] : ['#FF6B35', '#FF4500']} style={StyleSheet.absoluteFill} />
                        <MaterialCommunityIcons name="rocket-launch" size={22} color="#FFF" />
                        <Text style={styles.boostButtonText}>
                            {isAlreadyBoosted ? '🚀 Already Boosted' : 'Boost Now — PKR 500'}
                        </Text>
                    </TouchableOpacity>

                    {/* Info Note */}
                    <Text style={styles.infoNote}>
                        Boost resets every 3 days. You can re-boost after your current boost expires.
                        Payment processed securely via EasyPaisa, JazzCash, or card.
                    </Text>
                </Animated.View>
            </ScrollView>
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
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: 0.5 },
    scroll: { paddingHorizontal: 20, paddingBottom: 40 },

    heroSection: { alignItems: 'center', paddingVertical: 32 },
    glowRing: {
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
        backgroundColor: 'rgba(255, 107, 53, 0.2)', top: 16,
    },
    rocketCircle: {
        width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center',
        shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20,
        elevation: 20,
    },
    heroTitle: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 24, textAlign: 'center', letterSpacing: 0.3 },
    heroSubtitle: { fontSize: 15, color: colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },

    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: 16, gap: 4 },
    statValue: { fontSize: 20, fontWeight: '800', color: colors.boost },
    statLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },

    activeBanner: {
        flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(255,107,53,0.4)', marginBottom: 20, overflow: 'hidden',
    },
    activeBannerTitle: { fontSize: 16, fontWeight: '700', color: colors.boost },
    activeBannerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

    packageCard: { padding: 20, marginBottom: 20, borderColor: 'rgba(255,107,53,0.4)' },
    packageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    packageIconBg: {
        width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,107,53,0.15)',
        alignItems: 'center', justifyContent: 'center',
    },
    packageName: { fontSize: 18, fontWeight: '700', color: colors.text },
    packageDuration: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    packagePrice: { alignItems: 'flex-end' },
    priceAmount: { fontSize: 22, fontWeight: '800', color: colors.boost },

    divider: { height: 1, backgroundColor: colors.glassBorderLight, marginBottom: 16 },

    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    featureText: { fontSize: 14, color: colors.textSecondary, flex: 1 },

    boostButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        paddingVertical: 18, borderRadius: 20, overflow: 'hidden', marginBottom: 16,
        shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16,
        elevation: 12,
    },
    disabledButton: { shadowOpacity: 0 },
    boostButtonText: { fontSize: 17, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },

    infoNote: { fontSize: 12, color: colors.textMuted, textAlign: 'center', lineHeight: 18, paddingHorizontal: 8 },
});
