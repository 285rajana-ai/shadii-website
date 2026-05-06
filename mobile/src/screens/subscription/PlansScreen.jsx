import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { SUBSCRIPTION_PLANS } from '../../utils/constants';

const { width } = Dimensions.get('window');

const PLAN_GRADIENTS = {
  basic: ['#4A0E26', '#2D0817'],
  standard: ['#7A5C00', '#4A3800'],
  premium: ['#5C0F31', '#2D0618'],
};

const PLAN_ACCENT = {
  basic: '#C45C80',
  standard: '#D4AF37',
  premium: '#9B3060',
};

const ICONS = {
  basic: 'star-outline',
  standard: 'star-half-full',
  premium: 'crown',
};

export default function PlansScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[1]);
  const scaleAnims = useRef(SUBSCRIPTION_PLANS.map(() => new Animated.Value(1))).current;

  const handleSelect = (plan, idx) => {
    setSelectedPlan(plan);
    Animated.sequence([
      Animated.timing(scaleAnims[idx], { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnims[idx], { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = () => {
    navigation.navigate('Payment', { plan: selectedPlan });
  };

  const monthlyRate = (plan) => {
    const months = plan.duration === '1 Month' ? 1 : plan.duration === '3 Months' ? 3 : 6;
    return Math.round(plan.price / months);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#1A000A', '#0D0509', '#0D0D0D']} style={StyleSheet.absoluteFill} />

      {/* Decorative glow */}
      <View style={styles.glowOrb} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="close" size={20} color={colors.accent} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MaterialCommunityIcons name="crown" size={18} color={colors.accent} />
          <Text style={styles.headerTitle}>Premium Plans</Text>
        </View>
        <View style={styles.closeBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient
            colors={['rgba(212,175,55,0.18)', 'rgba(212,175,55,0)']}
            style={styles.heroGlow}
          />
          <Text style={styles.heroTitle}>Unlock Your{'\n'}Full Story</Text>
          <Text style={styles.heroSub}>
            View real photos, send unlimited messages, and get more matches today.
          </Text>
        </View>

        {/* Plan Cards */}
        <View style={styles.plansRow}>
          {SUBSCRIPTION_PLANS.map((plan, idx) => {
            const isSelected = selectedPlan.id === plan.id;
            const accent = PLAN_ACCENT[plan.id];
            return (
              <Animated.View
                key={plan.id}
                style={[styles.planCardWrap, { transform: [{ scale: scaleAnims[idx] }] }]}
              >
                <TouchableOpacity
                  style={[styles.planCard, isSelected && { borderColor: accent }]}
                  onPress={() => handleSelect(plan, idx)}
                  activeOpacity={0.85}
                >
                  {isSelected && (
                    <LinearGradient
                      colors={PLAN_GRADIENTS[plan.id]}
                      style={StyleSheet.absoluteFill}
                    />
                  )}

                  {plan.popular && (
                    <View style={[styles.popularBadge, { backgroundColor: accent }]}>
                      <Text style={styles.popularText}>BEST VALUE</Text>
                    </View>
                  )}

                  {/* Plan icon */}
                  <View style={[styles.planIconWrap, { borderColor: accent + '40' }]}>
                    <MaterialCommunityIcons name={ICONS[plan.id]} size={22} color={accent} />
                  </View>

                  <Text style={[styles.planName, { color: accent }]}>{plan.name}</Text>
                  <Text style={styles.planDuration}>{plan.duration}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceCurrency}>PKR</Text>
                    <Text style={[styles.priceNum, { color: isSelected ? accent : colors.text }]}>
                      {plan.price.toLocaleString()}
                    </Text>
                  </View>

                  <Text style={styles.perMonth}>≈ {monthlyRate(plan).toLocaleString()}/mo</Text>

                  {/* Selected check */}
                  <View style={[styles.checkCircle, isSelected && { backgroundColor: accent, borderColor: accent }]}>
                    {isSelected && <MaterialCommunityIcons name="check-bold" size={13} color="#fff" />}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Features Card */}
        <View style={styles.featuresCard}>
          <LinearGradient
            colors={['rgba(212,175,55,0.08)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.featuresHeader}>
            <MaterialCommunityIcons name="check-decagram" size={18} color={colors.accent} />
            <Text style={styles.featuresTitle}>What's included in {selectedPlan.name}</Text>
          </View>
          {selectedPlan.features.map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
              <View style={[styles.featureDot, { backgroundColor: PLAN_ACCENT[selectedPlan.id] }]} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Value badges */}
        <View style={styles.badgeRow}>
          {[
            { icon: 'shield-check-outline', label: 'Secure Payment' },
            { icon: 'refresh', label: 'Cancel Anytime' },
            { icon: 'lock-outline', label: 'Privacy Protected' },
          ].map((b) => (
            <View key={b.label} style={styles.badge}>
              <MaterialCommunityIcons name={b.icon} size={18} color={colors.accent} />
              <Text style={styles.badgeLabel}>{b.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaWrap} onPress={handleContinue} activeOpacity={0.85}>
          <LinearGradient colors={['#D4AF37', '#A07C10']} style={styles.cta}>
            <Text style={styles.ctaText}>Continue to Payment</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#0D0D0D" />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing you agree to our Terms of Service &amp; Privacy Policy.{'\n'}Payments are processed securely.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  glowOrb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(92,15,49,0.35)',
    top: -80,
    right: -80,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.5,
  },

  scroll: { paddingHorizontal: 20 },

  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 200,
    height: 100,
    borderRadius: 100,
    top: 0,
    alignSelf: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },

  plansRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    marginTop: 8,
  },
  planCardWrap: { flex: 1 },
  planCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 12,
    paddingBottom: 16,
    alignItems: 'center',
    position: 'relative',
    minHeight: 200,
  },

  popularBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: 'center',
    zIndex: 1,
  },
  popularText: {
    color: '#0D0D0D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  planIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
    textAlign: 'center',
  },
  planDuration: {
    fontSize: 11,
    color: 'rgba(245,230,200,0.45)',
    fontWeight: '500',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginBottom: 2,
  },
  priceCurrency: {
    fontSize: 11,
    color: 'rgba(245,230,200,0.5)',
    fontWeight: '600',
    marginBottom: 4,
  },
  priceNum: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  perMonth: {
    fontSize: 11,
    color: 'rgba(245,230,200,0.4)',
    marginBottom: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  featuresCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.18)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 20,
    marginBottom: 20,
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featureText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  badge: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  badgeLabel: {
    fontSize: 11,
    color: 'rgba(245,230,200,0.55)',
    fontWeight: '600',
    textAlign: 'center',
  },

  ctaWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  cta: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#0D0D0D',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  termsText: {
    fontSize: 11,
    color: 'rgba(245,230,200,0.3)',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
