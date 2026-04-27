import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import colors from '../../theme/colors';
import { API_BASE_URL } from '../../utils/constants';

export default function OTPVerifyScreen({ route, navigation }) {
  const { userId, email } = route.params || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length < 6) return Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Account verified! Please login.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      Alert.alert('OTP Resent', data.message);
    } catch (e) { }
  };

  return (
    <LinearGradient colors={['#1A000A', '#0D0D0D']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.content}>
          <Text style={styles.icon}>✉️</Text>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>We sent a 6-digit code to {email}</Text>

          <View style={styles.card}>
            <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity onPress={handleVerify} style={styles.btnWrap} disabled={loading}>
              <LinearGradient colors={colors.gradients.primary} style={styles.btn}>
                <Text style={styles.btnText}>{loading ? 'Verifying...' : 'Verify Now'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
              <Text style={styles.resendText}>Didn't receive code? Resend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.primary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 32, textAlign: 'center' },
  card: {
    width: '100%', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.glassBorder,
    padding: 24, backgroundColor: colors.glassMedium,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingVertical: 16, fontSize: 24, letterSpacing: 8, textAlign: 'center',
    marginBottom: 24, fontWeight: '700', color: colors.text,
  },
  btnWrap: { borderRadius: 14, overflow: 'hidden' },
  btn: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resendBtn: { marginTop: 16, alignItems: 'center' },
  resendText: { color: colors.primary, fontWeight: '600' },
});
