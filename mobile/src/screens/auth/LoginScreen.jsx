import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
  Alert, StatusBar, ActivityIndicator, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { glassStyles, radius, spacing } from '../../theme/glassmorphism';
import { API_BASE_URL } from '../../utils/constants';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../../store/slices/authSlice';

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
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={colors.gradients.luxury} style={StyleSheet.absoluteFill} />
      
      {/* Decorative Orbs */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Luxury Branding */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="heart-multiple" size={48} color={colors.accent} />
            </View>
            <Text style={styles.logoText}>shadii.pk</Text>
            <Text style={styles.tagline}>ہم قدم: ایک مکمل زندگی کا سفر</Text>
          </View>

          {/* Premium Login Card */}
          <Animated.View style={[glassStyles.card, styles.loginCard, { transform: [{ translateX: shakeAnim }] }]}>
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
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60 },
  orb: { position: 'absolute', width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4, opacity: 0.15 },
  orb1: { top: -width * 0.2, right: -width * 0.2, backgroundColor: colors.accent },
  orb2: { bottom: -width * 0.2, left: -width * 0.2, backgroundColor: colors.rose },
  
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { 
    width: 80, height: 80, borderRadius: 24, 
    backgroundColor: 'rgba(212, 175, 55, 0.1)', 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)',
    marginBottom: 16
  },
  logoText: { fontSize: 36, fontWeight: '900', color: colors.text, letterSpacing: -1.5 },
  tagline: { fontSize: 14, color: colors.accent, marginTop: 4, letterSpacing: 0.5 },

  loginCard: { padding: 24, backgroundColor: 'rgba(26, 26, 26, 0.6)' },
  cardTitle: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' },
  cardSubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 32 },

  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  forgotText: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: colors.surfaceLight, 
    borderRadius: 16, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  inputFocused: { borderColor: colors.accent, backgroundColor: 'rgba(212, 175, 55, 0.05)' },
  input: { flex: 1, paddingVertical: 16, marginLeft: 12, color: colors.text, fontSize: 16 },

  loginBtnContainer: { marginTop: 12, borderRadius: 16, overflow: 'hidden' },
  loginBtn: { paddingVertical: 18, alignItems: 'center' },
  loginBtnText: { color: colors.maroon, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: colors.textSecondary, fontSize: 14 },
  footerLink: { color: colors.accent, fontSize: 14, fontWeight: '700' },

  versionText: { textAlign: 'center', color: colors.textMuted, fontSize: 11, marginTop: 40 }
});
