import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { AppBackground, Card, Field, TrustBadge } from '../../components/ui/LightPrimitives';
import { setTokens, setUser } from '../../store/slices/authSlice';
import colors from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { API_BASE_URL } from '../../utils/constants';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 70, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
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
        dispatch(setTokens({ token: data.token, refreshToken: data.refreshToken }));
        dispatch(setUser(data.user));
        navigation.replace('Main');
      } else {
        setError(data.message || 'Email or password is incorrect.');
      }
    } catch (_) {
      Alert.alert('Connection Error', 'Unable to reach Shadii.pk. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.brandRow}>
              <View style={styles.logo}>
                <MaterialCommunityIcons name="heart-multiple" size={30} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.brand}>Shadii.pk</Text>
                <Text style={styles.brandSub}>Respectful matchmaking</Text>
              </View>
            </View>

            <Card style={styles.card}>
              <TrustBadge icon="shield-check-outline" label="Secure sign in" tone="trust" />
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Continue managing matches, requests, and conversations from one calm place.</Text>

              <View style={styles.form}>
                <Field
                  label="Email address"
                  icon="email-outline"
                  value={email}
                  onChangeText={(v) => setEmail(v.toLowerCase())}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Field
                  label="Password"
                  icon="lock-outline"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  right={
                    <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                      <MaterialCommunityIcons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={colors.textMuted}
                      />
                    </Pressable>
                  }
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <PrimaryButton label="Sign in" icon="arrow-right" onPress={handleLogin} loading={loading} />
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>New to Shadii.pk?</Text>
                <Pressable onPress={() => navigation.navigate('Register')} hitSlop={10}>
                  <Text style={styles.footerLink}>Create account</Text>
                </Pressable>
              </View>
            </Card>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.xl,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brand: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  brandSub: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.sm,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});
