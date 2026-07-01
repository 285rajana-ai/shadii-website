import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { glassStyles } from '../../theme/glassmorphism';
import { API_BASE_URL } from '../../utils/constants';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function RegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    gender: '', age: '', height: '', education: '',
    city: '', cast: '', about: ''
  });

  const updateForm = (key, value) => setFormData({ ...formData, [key]: value });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.gender) {
        return Alert.alert('Select Gender', 'Please select whether you are Male or Female.');
      }
      if (!formData.name.trim()) {
        return Alert.alert('Name Required', 'Please enter your full name.');
      }
      if (!formData.email.trim() || !EMAIL_REGEX.test(formData.email.trim())) {
        return Alert.alert('Invalid Email', 'Please enter a valid email address (e.g. name@gmail.com).');
      }
      if (!formData.phone.trim() || formData.phone.trim().length < 10) {
        return Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      }
      if (!PASSWORD_REGEX.test(formData.password)) {
        return Alert.alert(
          'Weak Password',
          'Password must be at least 8 characters and include:\n• One uppercase letter (A–Z)\n• One lowercase letter (a–z)\n• One number (0–9)'
        );
      }
      setStep(2);
    } else {
      const age = Number(formData.age);
      if (!formData.age || isNaN(age) || age < 18 || age > 80) {
        return Alert.alert('Invalid Age', 'Age must be between 18 and 80.');
      }
      if (!formData.city.trim()) {
        return Alert.alert('City Required', 'Please enter your city.');
      }
      if (!formData.education.trim()) {
        return Alert.alert('Education Required', 'Please enter your education level.');
      }
      handleRegister();
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Account Created! ✅', 'Your account has been registered successfully. Please sign in.', [
          { text: 'Sign In', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Registration Failed', data.message || 'Something went wrong. Please try again.');
      }
    } catch (e) {
      Alert.alert('Connection Error', 'Our premium matching servers are currently unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={colors.gradients.luxury} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20 }]} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <Text style={styles.title}>Join shadii.pk</Text>
            <Text style={styles.subtitle}>Begin your luxury matchmaking journey</Text>

            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
              <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            </View>
          </View>

          <View style={[glassStyles.card, styles.card]}>
            {step === 1 ? (
              <View style={styles.cardContent}>
                <Text style={styles.sectionTitle}>Identity</Text>

                <Text style={styles.label}>I am seeking a partner as a...</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[styles.genderBtn, formData.gender === 'male' && styles.genderActive]}
                    onPress={() => updateForm('gender', 'male')}
                  >
                    <MaterialCommunityIcons
                      name="human-male" size={24}
                      color={formData.gender === 'male' ? colors.maroon : colors.textMuted}
                    />
                    <Text style={[styles.genderText, formData.gender === 'male' && styles.genderTextActive]}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderBtn, formData.gender === 'female' && styles.genderActive]}
                    onPress={() => updateForm('gender', 'female')}
                  >
                    <MaterialCommunityIcons
                      name="human-female" size={24}
                      color={formData.gender === 'female' ? colors.maroon : colors.textMuted}
                    />
                    <Text style={[styles.genderText, formData.gender === 'female' && styles.genderTextActive]}>Female</Text>
                  </TouchableOpacity>
                </View>

                <InputField
                  icon="account-outline"
                  label="Full Name"
                  value={formData.name}
                  onChange={(v) => updateForm('name', v)}
                  placeholder="Enter your name"
                />
                <InputField
                  icon="email-outline"
                  label="Email Address"
                  value={formData.email}
                  onChange={(v) => updateForm('email', v)}
                  placeholder="name@shadii.pk"
                  keyboardType="email-address"
                />
                <InputField
                  icon="phone-outline"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(v) => updateForm('phone', v)}
                  placeholder="+92 3XX XXXXXXX"
                  keyboardType="phone-pad"
                />
                <InputField
                  icon="lock-outline"
                  label="Password"
                  value={formData.password}
                  onChange={(v) => updateForm('password', v)}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />
                <Text style={styles.passwordHint}>
                  Min 8 chars · one uppercase · one number (e.g. Abc12345)
                </Text>
              </View>
            ) : (
              <View style={styles.cardContent}>
                <Text style={styles.sectionTitle}>Personal Details</Text>

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <InputField
                      icon="calendar-outline"
                      label="Age"
                      value={formData.age}
                      onChange={(v) => updateForm('age', v)}
                      placeholder="25"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ width: 16 }} />
                  <View style={{ flex: 1 }}>
                    <InputField
                      icon="human-height"
                      label="Height"
                      value={formData.height}
                      onChange={(v) => updateForm('height', v)}
                      placeholder="5'11\"
                    />
                  </View>
                </View>

                <InputField
                  icon="map-marker-outline"
                  label="City"
                  value={formData.city}
                  onChange={(v) => updateForm('city', v)}
                  placeholder="Select City"
                />
                <InputField
                  icon="school-outline"
                  label="Education"
                  value={formData.education}
                  onChange={(v) => updateForm('education', v)}
                  placeholder="e.g. Masters in IT"
                />
                <InputField
                  icon="account-group-outline"
                  label="Cast / Community"
                  value={formData.cast}
                  onChange={(v) => updateForm('cast', v)}
                  placeholder="Rajput / Sheikh / Syed"
                />
              </View>
            )}

            <View style={styles.footer}>
              <TouchableOpacity onPress={handleNext} style={styles.btnContainer} activeOpacity={0.8}>
                <LinearGradient colors={colors.gradients.gold} style={styles.btn}>
                  {loading ? (
                    <ActivityIndicator color={colors.maroon} />
                  ) : (
                    <Text style={styles.btnText}>{step === 1 ? 'Continue' : 'Create My Account'}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => step === 1 ? navigation.navigate('Login') : setStep(1)}
              >
                <Text style={styles.backBtnText}>
                  {step === 1 ? 'Already have an account? Sign In' : 'Go Back'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const InputField = ({ label, icon, rightIcon, onRightIconPress, onChange, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputContainer, focused && styles.inputContainerFocused]}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={focused ? colors.accent : colors.textMuted}
        />
        <TextInput
          style={[styles.input, props.multiline && { height: 100, textAlignVertical: 'top' }]}
          placeholderTextColor={colors.textMuted}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconBtn}>
            <MaterialCommunityIcons name={rightIcon} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 32, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '900', color: colors.text, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: colors.accent, marginTop: 4 },

  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 8 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.surfaceLight },
  stepDotActive: { backgroundColor: colors.accent, width: 24 },
  stepLine: { width: 40, height: 2, backgroundColor: colors.surfaceLight },
  stepLineActive: { backgroundColor: colors.accent },

  card: { backgroundColor: 'rgba(26, 26, 26, 0.6)', padding: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },

  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  genderBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: colors.surfaceLight,
  },
  genderActive: { borderColor: colors.accent, backgroundColor: colors.accent },
  genderText: { fontSize: 14, color: colors.textSecondary, fontWeight: '700' },
  genderTextActive: { color: colors.maroon },

  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  passwordHint: { fontSize: 11, color: 'rgba(245,230,200,0.35)', marginTop: -8, marginBottom: 12, paddingHorizontal: 4 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 16, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  inputContainerFocused: {
    borderColor: 'rgba(212,175,55,0.6)',
    backgroundColor: 'rgba(212,175,55,0.04)',
  },
  input: { flex: 1, paddingVertical: 16, marginLeft: 12, color: colors.text, fontSize: 16 },
  rightIconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row' },

  footer: { marginTop: 12 },
  btnContainer: { borderRadius: 16, overflow: 'hidden' },
  btn: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: colors.maroon, fontSize: 16, fontWeight: '800' },
  backBtn: { alignItems: 'center', marginTop: 20 },
  backBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
});
