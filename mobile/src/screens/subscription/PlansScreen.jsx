import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import PrimaryButton from '../../components/ui/PrimaryButton';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { AppBackground, Card, TrustBadge } from '../../components/ui/LightPrimitives';
import colors from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { API_BASE_URL } from '../../utils/constants';

export default function PlansScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { token } = useSelector((s) => s.auth);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/subscription/plans`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && data.plans) {
        const filtered = data.plans.filter((p) => p.id !== 'contact_unlock' && p.id !== 'boost');
        setPlans(filtered);
        setSelectedPlan(filtered.find((p) => p.id === 'standard') || filtered[0]);
      }
    } catch (err) {
      console.warn('Failed to fetch plans:', err.message);
    } finally {
      setPlansLoading(false);
    }
  };

  const durationLabel = (plan) => {
    if (plan.duration <= 30) return '1 month';
    if (plan.duration <= 90) return '3 months';
    return '6 months';
  };

  const monthlyRate = (plan) => {
    const months = plan.duration <= 30 ? 1 : plan.duration <= 90 ? 3 : 6;
    return Math.round(plan.price / months);
  };

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScreenHeader title="Premium" subtitle="Membership" onBack={() => navigation.goBack()} insetsTop={insets.top} />
      {plansLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 36 }]}>
          <Card style={styles.hero}>
            <TrustBadge icon="shield-check-outline" label="Secure membership" tone="trust" />
            <Text style={styles.heroTitle}>Unlock serious matchmaking tools</Text>
            <Text style={styles.heroText}>Premium improves visibility, conversations, and approved contact access while keeping privacy controls intact.</Text>
          </Card>

          <View style={styles.planList}>
            {plans.map((plan) => {
              const selected = selectedPlan?.id === plan.id;
              return (
                <Pressable
                  key={plan.id}
                  style={[styles.planCard, selected && styles.planSelected]}
                  onPress={() => setSelectedPlan(plan)}
                >
                  <View style={styles.planTop}>
                    <View>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planDuration}>{durationLabel(plan)} • approx PKR {monthlyRate(plan).toLocaleString()}/mo</Text>
                    </View>
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected ? <MaterialCommunityIcons name="check" size={15} color="#FFFFFF" /> : null}
                    </View>
                  </View>
                  {plan.popular ? <TrustBadge icon="star-four-points-outline" label="Best value" /> : null}
                  <View style={styles.priceRow}>
                    <Text style={styles.currency}>PKR</Text>
                    <Text style={styles.price}>{plan.price.toLocaleString()}</Text>
                  </View>
                  <View style={styles.featureList}>
                    {plan.features?.slice(0, 5).map((feature) => (
                      <View key={feature} style={styles.feature}>
                        <MaterialCommunityIcons name="check-circle" size={17} color={colors.success} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Card style={styles.assurance}>
            {[
              ['shield-check-outline', 'Privacy controls stay active'],
              ['credit-card-check-outline', 'Secure payment flow'],
              ['account-heart-outline', 'Built for serious matches'],
            ].map(([icon, label]) => (
              <View key={label} style={styles.assuranceRow}>
                <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
                <Text style={styles.assuranceText}>{label}</Text>
              </View>
            ))}
          </Card>

          <PrimaryButton
            label={selectedPlan ? `Continue with ${selectedPlan.name}` : 'Continue'}
            icon="arrow-right"
            onPress={() => selectedPlan && navigation.navigate('Payment', { plan: selectedPlan })}
            disabled={!selectedPlan}
          />
          <Text style={styles.terms}>Payments are processed securely. Subscription features follow Shadii.pk privacy and safety rules.</Text>
        </ScrollView>
      )}
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  hero: {
    gap: spacing.md,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  heroText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  planList: {
    gap: spacing.md,
  },
  planCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFFDF9',
  },
  planTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  planName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  planDuration: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
  },
  currency: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 5,
  },
  price: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  featureList: {
    gap: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  assurance: {
    gap: spacing.sm,
  },
  assuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  assuranceText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  terms: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
