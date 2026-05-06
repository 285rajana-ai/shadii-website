import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { API_BASE_URL } from '../../utils/constants';

const RESEND_COOLDOWN = 60; // seconds
const OTP_LENGTH = 6;

export default function OTPVerifyScreen({ route, navigation }) {
  const { userId, email } = route.params || {};
  const insets = useSafeAreaInsets();
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const timerRef = useRef(null);
  const inputRefs = useRef(Array(OTP_LENGTH).fill(null));

  const otp = digits.join('');

  // Start the resend cooldown timer on mount
  useEffect(() => {
    startCooldown();
    return () => clearInterval(timerRef.current);
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleDigitChange = (text, index) => {
    const cleaned = text.replace(/\D/g, '');
    if (!cleaned && text !== '') return; // reject non-numeric (except backspace/empty)

    const newDigits = [...digits];
    if (cleaned.length > 1) {
      // Handle paste of full code
      const pasted = cleaned.slice(0, OTP_LENGTH);
      const filled = Array(OTP_LENGTH).fill('').map((_, i) => pasted[i] || '');
      setDigits(filled);
      const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }
    newDigits[index] = cleaned;
    setDigits(newDigits);
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.length < OTP_LENGTH) {
      return Alert.alert('Invalid Code', 'Please enter the complete 6-digit code sent to your email.');
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Verified! ✅', 'Your account is now active. Please sign in.', [
          { text: 'Sign In', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Incorrect Code', data.message || 'The code you entered is invalid. Please try again.');
      }
    } catch (_) {
      Alert.alert('Connection Error', 'Unable to verify. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
        startCooldown();
      } else {
        Alert.alert('Failed to Resend', data.message || 'Could not resend the code. Please try again.');
      }
    } catch (_) {
      Alert.alert('Connection Error', 'Could not resend the code. Please check your internet connection.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#1A000A', '#0D0509', '#0D0D0D']} style={StyleSheet.absoluteFill} />
      <View style={styles.glowOrb} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>

          {/* Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.accent} />
          </TouchableOpacity>

          {/* Icon & Title */}
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="email-check-outline" size={48} color={colors.accent} />
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.emailHighlight}>{email || 'your email'}</Text>
          </Text>

          {/* OTP Input Card */}
          <View style={styles.card}>
            <View style={styles.otpRow}>
              {digits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpBox,
                    focusedIndex === index && styles.otpBoxFocused,
                    digit && styles.otpBoxFilled,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleDigitChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(-1)}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  autoFocus={index === 0}
                  selectTextOnFocus
                  caretHidden
                  accessibilityLabel={`OTP digit ${index + 1}`}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.btnWrap, (loading || otp.length < OTP_LENGTH) && styles.btnDisabled]}
              onPress={handleVerify}
              disabled={loading || otp.length < OTP_LENGTH}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={otp.length === OTP_LENGTH ? ['#D4AF37', '#A07C10'] : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.05)']}
                style={styles.btn}
              >
                {loading
                  ? <ActivityIndicator color={otp.length === OTP_LENGTH ? '#0D0D0D' : colors.textMuted} />
                  : <Text style={[styles.btnText, otp.length < OTP_LENGTH && styles.btnTextDisabled]}>
                    Verify &amp; Continue
                  </Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendPrompt}>Didn't receive the code? </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={cooldown > 0 || resendLoading}
              activeOpacity={0.7}
            >
              {resendLoading ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : cooldown > 0 ? (
                <Text style={styles.cooldownText}>Resend in {cooldown}s</Text>
              ) : (
                <Text style={styles.resendBtn}>Resend Code</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            Check your spam folder if you don't see it in your inbox.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  glowOrb: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(212,175,55,0.12)',
    top: -60,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 0,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emailHighlight: {
    color: colors.accent,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 24,
    marginBottom: 24,
  },
  btnWrap: { borderRadius: 14, overflow: 'hidden' },
  btnDisabled: { opacity: 0.6 },
  btn: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#0D0D0D', fontSize: 16, fontWeight: '800' },
  btnTextDisabled: { color: colors.textMuted },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
  },
  otpBoxFocused: {
    borderColor: 'rgba(212,175,55,0.7)',
    backgroundColor: 'rgba(212,175,55,0.05)',
  },
  otpBoxFilled: {
    borderColor: 'rgba(212,175,55,0.4)',
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resendPrompt: { fontSize: 14, color: colors.textSecondary },
  cooldownText: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  resendBtn: { fontSize: 14, color: colors.accent, fontWeight: '700' },

  hint: {
  fontSize: 12,
  color: 'rgba(245,230,200,0.3)',
  textAlign: 'center',
  lineHeight: 18,
  paddingHorizontal: 24,
},
});
