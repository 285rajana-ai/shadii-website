import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import colors from '../../theme/colors';
import { API_BASE_URL, PAYMENT_METHODS } from '../../utils/constants';

const METHOD_ICONS = {
  easypaisa: { icon: 'cellphone', color: '#4CAF50' },
  jazzcash: { icon: 'cellphone-wireless', color: '#FF5722' },
  card: { icon: 'credit-card-outline', color: '#3498DB' },
  bank_transfer: { icon: 'bank-outline', color: '#9B59B6' },
};

export default function PaymentScreen({ route, navigation }) {
  const { plan: routePlan } = route.params || {};
  const plan = typeof routePlan === 'string'
    ? { id: routePlan, name: routePlan === 'boost' ? 'Profile Boost' : routePlan, price: 500, duration: '3 Days' }
    : routePlan;
  const { token } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!plan?.id || !plan?.price) {
      return Alert.alert('Error', 'Invalid payment plan. Please try again.');
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/subscription/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: plan.id, paymentMethod: selectedMethod }),
      });
      const data = await res.json();
      if (!data.success) {
        setLoading(false);
        return Alert.alert('Payment Error', data.message || 'Could not initiate payment.');
      }

      // Simulate payment gateway processing (2s delay)
      setTimeout(async () => {
        try {
          const confirmRes = await fetch(`${API_BASE_URL}/subscription/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              subscriptionId: data.subscription._id,
              transactionId: `TXN_${Date.now()}`,
            }),
          });
          const confirmData = await confirmRes.json();
          if (confirmData.success) {
            const meRes = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
            const meData = await meRes.json();
            if (meData.success) dispatch(updateUser(meData.user));
            Alert.alert('Payment Successful! 🎉', confirmData.message || 'Your subscription is now active.', [
              { text: 'Continue', onPress: () => navigation.navigate('Home') },
            ]);
          } else {
            Alert.alert('Payment Failed', confirmData.message || 'Payment could not be confirmed. Please contact support.');
          }
        } catch (_) {
          Alert.alert('Connection Error', 'Could not confirm payment. Please contact support@shadii.pk');
        } finally {
          setLoading(false);
        }
      }, 2000);
    } catch (_) {
      Alert.alert('Connection Error', 'Unable to reach payment server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#1A000A', '#0D0509', '#0D0D0D']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary Card — dark glass */}
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['rgba(212,175,55,0.10)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.summaryLabel}>ORDER SUMMARY</Text>
          <View style={styles.row}>
            <Text style={styles.planName}>{plan.name} Plan</Text>
            <Text style={styles.planPrice}>PKR {plan.price.toLocaleString()}</Text>
          </View>
          <Text style={styles.duration}>{plan.duration}</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalText}>Total to pay</Text>
            <Text style={styles.totalPrice}>PKR {plan.price.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Payment Method</Text>

        <View style={styles.methodsContainer}>
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedMethod === method.id;
            const meta = METHOD_ICONS[method.id] || { icon: 'cash', color: colors.accent };
            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodCard, isSelected && styles.methodSelected]}
                onPress={() => setSelectedMethod(method.id)}
                activeOpacity={0.8}
              >
                {isSelected && (
                  <LinearGradient
                    colors={['rgba(139,26,74,0.2)', 'rgba(92,15,49,0.15)']}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <View style={[styles.methodIconWrap, { backgroundColor: meta.color + '22', borderColor: meta.color + '44' }]}>
                  <MaterialCommunityIcons name={meta.icon} size={20} color={meta.color} />
                </View>
                <Text style={[styles.methodName, isSelected && { color: colors.accent }]}>{method.name}</Text>
                <View style={[styles.radio, isSelected && styles.radioActive]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.btnWrap} onPress={handlePayment} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={['#D4AF37', '#A07C10']} style={styles.btn}>
            {loading ? (
              <ActivityIndicator color="#0D0D0D" />
            ) : (
              <>
                <MaterialCommunityIcons name="lock-outline" size={18} color="#0D0D0D" />
                <Text style={styles.btnText}>Pay PKR {plan.price.toLocaleString()}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.secureText}>🔒 256-bit encrypted · Powered by shadii.pk</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },

  content: { padding: 24 },

  summaryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 16, fontWeight: '700', color: colors.text },
  planPrice: { fontSize: 16, fontWeight: '700', color: colors.text },
  duration: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 16 },
  totalText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  totalPrice: { fontSize: 24, fontWeight: '800', color: colors.accent },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },

  methodsContainer: { gap: 8, marginBottom: 32 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
    gap: 12,
  },
  methodSelected: { borderColor: 'rgba(139,26,74,0.5)' },
  methodIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.rose },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.rose },

  btnWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  btn: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: { color: '#0D0D0D', fontSize: 16, fontWeight: '800' },
  secureText: { textAlign: 'center', fontSize: 12, color: 'rgba(245,230,200,0.35)' },
});
