import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { glassStyles, radius, spacing } from '../../theme/glassmorphism';
import { API_BASE_URL } from '../../utils/constants';

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    gender: '', age: '', height: '', education: '',
    city: '', cast: '', about: ''
  });

  const updateForm = (key, value) => setFormData({ ...formData, [key]: value });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.gender) {
        return Alert.alert('Incomplete Details', 'Please provide your essential information to proceed.');
      }
      setStep(2);
    } else {
      if (!formData.age || !formData.city || !formData.education) {
        return Alert.alert('Incomplete Details', 'Please share a few more details to help us find matches.');
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
        navigation.navigate('OTPVerify', { userId: data.user.id, email: formData.email });
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
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={colors.gradients.luxury} style={StyleSheet.absoluteFill} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
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
                  secureTextEntry 
                />
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
                    <Text style={styles.btnText}>{step === 1 ? 'Continue Journey' : 'Create My Account'}</Text>
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

const InputField = ({ label, icon, ...props }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputContainer}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.textMuted} />
      <TextInput 
        style={[styles.input, props.multiline && { height: 100, textAlignVertical: 'top' }]} 
        placeholderTextColor={colors.textMuted} 
        {...props} 
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 40 },
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
  genderText: { fontSize: 15, color: colors.textSecondary, fontWeight: '700' },
  genderTextActive: { color: colors.maroon },

  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: colors.surfaceLight, 
    borderRadius: 16, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  input: { flex: 1, paddingVertical: 16, marginLeft: 12, color: colors.text, fontSize: 16 },
  row: { flexDirection: 'row' },

  footer: { marginTop: 12 },
  btnContainer: { borderRadius: 16, overflow: 'hidden' },
  btn: { paddingVertical: 18, alignItems: 'center' },
  btnText: { color: colors.maroon, fontSize: 16, fontWeight: '800' },
  backBtn: { alignItems: 'center', marginTop: 20 },
  backBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
});
