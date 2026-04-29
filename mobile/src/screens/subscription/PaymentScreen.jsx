import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import colors from '../../theme/colors';
import { API_BASE_URL, PAYMENT_METHODS } from '../../utils/constants';

export default function PaymentScreen({ route, navigation }) {
  const { plan: routePlan } = route.params || {};
  const plan = typeof routePlan === 'string'
    ? { id: routePlan, name: routePlan === 'boost' ? 'Profile Boost' : routePlan, price: 500, duration: '3 Days' }
    : routePlan;
  const { token, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!plan?.id || !plan?.price) {
      return Alert.alert('Error', 'Invalid payment plan. Please try again.');
    }
    setLoading(true);
    try {
      // 1. Initiate Payment
      const res = await fetch(`${API_BASE_URL}/subscription/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan: plan.id, paymentMethod: selectedMethod }),
      });
      const data = await res.json();

      if (!data.success) {
        return Alert.alert('Error', data.message);
      }

      // 2. Simulate Payment Gateway Redirect (Fake processing for now)
      setTimeout(async () => {
        try {
          // 3. Confirm Payment (Fake webhook/return simulation)
          const confirmRes = await fetch(`${API_BASE_URL}/subscription/confirm`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              subscriptionId: data.subscription._id,
              transactionId: `TXN_${Math.floor(Math.random() * 10000000)}`
            }),
          });
          const confirmData = await confirmRes.json();

          if (confirmData.success) {
            // Update user in Redux
            const meRes = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
            const meData = await meRes.json();
            if (meData.success) dispatch(updateUser(meData.user));

            Alert.alert('Success! 🎉', confirmData.message, [
              { text: 'Awesome', onPress: () => navigation.navigate('Home') }
            ]);
          }
        } catch (e) { } finally {
          setLoading(false);
        }
      }, 2000);

    } catch (e) {
      Alert.alert('Error', 'Payment failed to initiate.');
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1A000A', '#0D0509', '#0D0D0D']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.row}>
            <Text style={styles.planName}>{plan.name} Plan</Text>
            <Text style={styles.planPrice}>PKR {plan.price.toLocaleString()}</Text>
          </View>
          <Text style={styles.duration}>Duration: {plan.duration}</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalText}>Total to pay</Text>
            <Text style={styles.totalPrice}>PKR {plan.price.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Payment Method</Text>

        <View style={styles.methodsContainer}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodSelected
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={[styles.radio, selectedMethod === method.id && styles.radioActive]} />
              <Text style={[styles.methodName, selectedMethod === method.id && { color: colors.primary }]}>{method.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btnWrap} onPress={handlePayment} disabled={loading}>
          <LinearGradient colors={colors.gradients.primary} style={styles.btn}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Pay PKR {plan.price.toLocaleString()}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.secureText}>🔒 Securely processed with 256-bit encryption</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, marginRight: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  content: { padding: 24 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: colors.border },
  summaryTitle: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', marginBottom: 16, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 18, fontWeight: '700', color: colors.text },
  planPrice: { fontSize: 18, fontWeight: '700', color: colors.text },
  duration: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  totalText: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalPrice: { fontSize: 24, fontWeight: '800', color: colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 },
  methodsContainer: { gap: 12, marginBottom: 32 },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  methodSelected: { borderColor: colors.primary, backgroundColor: 'rgba(139,26,74,0.05)' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.textMuted, marginRight: 16 },
  radioActive: { borderColor: colors.primary, borderWidth: 6 },
  methodName: { fontSize: 16, fontWeight: '600', color: colors.text },
  btnWrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  btn: { paddingVertical: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secureText: { textAlign: 'center', fontSize: 12, color: colors.textMuted },
});
