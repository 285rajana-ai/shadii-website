import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SUBSCRIPTION_PLANS } from '../../utils/constants';
import colors from '../../theme/colors';

const { width } = Dimensions.get('window');

export default function PlansScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[1]); // Default standard

  const handleContinue = () => {
    navigation.navigate('Payment', { plan: selectedPlan });
  };

  return (
    <LinearGradient colors={[colors.background, '#FCE4EC']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium ✨</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Unlock Unlimited Potential</Text>
          <Text style={styles.introSub}>Get more matches, view clear photos, and send unlimited messages.</Text>
        </View>

        {/* Plan Cards */}
        <View style={styles.plansContainer}>
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;
            
            return (
              <TouchableOpacity 
                key={plan.id}
                style={[styles.planCard, isSelected && { borderColor: plan.color, borderWidth: 2 }]}
                onPress={() => setSelectedPlan(plan)}
                activeOpacity={0.9}
              >
                {plan.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}
                
                {isSelected ? (
                  <LinearGradient colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']} style={StyleSheet.absoluteFill} />
                ) : (
                  <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
                )}

                <View style={styles.planHeader}>
                  <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
                  <Text style={styles.planDuration}>{plan.duration}</Text>
                </View>
                
                <Text style={styles.planPrice}>
                  PKR <Text style={styles.planPriceNum}>{plan.price.toLocaleString()}</Text>
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Features List */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What's included in {selectedPlan.name}?</Text>
          {selectedPlan.features.map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.btnWrap} onPress={handleContinue}>
          <LinearGradient colors={colors.gradients.primary} style={styles.btn}>
            <Text style={styles.btnText}>Continue to Payment</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy. Payments are securely processed.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  closeIcon: { fontSize: 18, color: colors.text, fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '700', color: colors.text, marginRight: 40 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  intro: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  introTitle: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' },
  introSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  plansContainer: { gap: 16, marginBottom: 32 },
  planCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 20, position: 'relative' },
  popularBadge: { position: 'absolute', top: 0, right: 20, paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, zIndex: 1 },
  popularText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  planName: { fontSize: 20, fontWeight: '800' },
  planDuration: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  planPrice: { fontSize: 16, color: colors.text },
  planPriceNum: { fontSize: 32, fontWeight: '800' },
  featuresCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: colors.border },
  featuresTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  featureIcon: { fontSize: 16 },
  featureText: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  btnWrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  btn: { paddingVertical: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  termsText: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 18, paddingHorizontal: 16 },
});
