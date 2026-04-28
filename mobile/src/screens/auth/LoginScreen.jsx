import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../../store/slices/authSlice';
import colors from '../../theme/colors';
import { API_BASE_URL } from '../../utils/constants';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const dispatch = useDispatch();
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      shake();
      Alert.alert('Incomplete Fields', 'Please enter your credentials to proceed.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await response.json();

      if (data.success) {
        dispatch(setToken(data.token));
        dispatch(setUser(data.user));
        navigation.replace('Main');
      } else {
        shake();
        Alert.alert('Login Failed', data.message || 'The credentials provided are incorrect.');
      }
    } catch (err) {
      shake();
      Alert.alert('Connection Error', 'Unable to reach our premium servers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#1A000A', '#0D0509', '#0D0D0D']} style={StyleSheet.absoluteFill} />
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <LinearGradient colors={colors.gradients.gold} style={styles.logoContainer}>
              <MaterialCommunityIcons name="heart-multiple" size={40} color={colors.maroon} />
            </LinearGradient>
            <Text style={styles.logoText}>shadii<Text style={styles.logoDot}>.pk</Text></Text>
            <Text style={styles.tagline}>ہم قدم — ایک مکمل زندگی کا سفر</Text>
          </Animated.View>

          {/* Login Card */}
          <Animated.View style={[styles.loginCard, { transform: [{ translateX: shakeAnim }, { translateY: slideAnim }], opacity: fadeAnim }]}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to your premium account</Text>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, emailFocused && styles.inputFocused]}>
                <MaterialCommunityIcons name="email-outline" size={20} color={emailFocused ? colors.accent : colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@shadii.pk"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputContainer, passFocused && styles.inputFocused]}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={passFocused ? colors.accent : colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Premium Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.loginBtnContainer}
            >
              <LinearGradient
                colors={colors.gradients.gold}
                style={styles.loginBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={colors.maroon} />
                ) : (
                  <Text style={styles.loginBtnText}>Enter shadii.pk</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>New to Shadii.pk? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Text style={styles.versionText}>Secured by shadii.pk Luxury Vault</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 70 },
  orb1: { position: 'absolute', width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4, top: -width * 0.25, right: -width * 0.25, backgroundColor: 'rgba(139,26,74,0.2)' },
  orb2: { position: 'absolute', width: width * 0.7, height: width * 0.7, borderRadius: width * 0.35, bottom: -width * 0.2, left: -width * 0.25, backgroundColor: 'rgba(212,175,55,0.08)' },

  header: { alignItems: 'center', marginBottom: 36 },
  logoContainer: {
    width: 80, height: 80, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20,
  },
  logoText: { fontSize: 38, fontWeight: '900', color: colors.text, letterSpacing: -1.5 },
  logoDot: { color: colors.accent },
  tagline: { fontSize: 13, color: colors.textSecondary, marginTop: 6, letterSpacing: 0.5 },

  loginCard: {
    padding: 28,
    backgroundColor: 'rgba(26,0,10,0.7)',
    borderRadius: 28, borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
  },
  cardTitle: { fontSize: 26, fontWeight: '900', color: colors.text, textAlign: 'center', letterSpacing: -0.5 },
  cardSubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 30 },

  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  forgotText: { fontSize: 12, color: colors.accent, fontWeight: '700' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  inputFocused: { borderColor: 'rgba(212,175,55,0.6)', backgroundColor: 'rgba(212,175,55,0.04)' },
  input: { flex: 1, paddingVertical: 16, marginLeft: 12, color: colors.text, fontSize: 16 },

  loginBtnContainer: { marginTop: 10, borderRadius: 18, overflow: 'hidden' },
  loginBtn: { paddingVertical: 18, alignItems: 'center' },
  loginBtnText: { color: colors.maroon, fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: colors.textSecondary, fontSize: 14 },
  footerLink: { color: colors.accent, fontSize: 14, fontWeight: '700' },

  versionText: { textAlign: 'center', color: colors.textMuted, fontSize: 11, marginTop: 36, letterSpacing: 0.3 }
});
