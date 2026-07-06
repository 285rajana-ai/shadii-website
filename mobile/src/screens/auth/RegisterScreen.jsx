import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/ui/PrimaryButton';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { AppBackground, Card, Chip, Field, SelectField, TrustBadge } from '../../components/ui/LightPrimitives';
import colors from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import {
  API_BASE_URL,
  CAST_OPTIONS,
  EDUCATION_LEVELS,
  PAKISTAN_REGIONS,
  PAKISTAN_CITIES,
  PHOTO_VISIBILITY_OPTIONS,
} from '../../utils/constants';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const HEIGHT_OPTIONS = [];
for (let ft = 4; ft <= 6; ft++) {
  const maxIn = ft === 6 ? 6 : 11;
  for (let inch = ft === 4 ? 6 : 0; inch <= maxIn; inch++) HEIGHT_OPTIONS.push(`${ft}'${inch}"`);
}

const STEPS = ['Account', 'Details', 'Privacy'];

export default function RegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerField, setPickerField] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
    age: '',
    height: '',
    education: '',
    region: '',
    city: '',
    cast: '',
    about: '',
    hidePhotos: true,
    profilePhotoVisibility: 'registered',
    photoVisibility: 'connected',
  });

  const updateForm = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const pickerOptions = () => {
    if (pickerField === 'city') return PAKISTAN_CITIES;
    if (pickerField === 'region') return PAKISTAN_REGIONS;
    if (pickerField === 'education') return EDUCATION_LEVELS;
    if (pickerField === 'cast') return CAST_OPTIONS;
    if (pickerField === 'height') return HEIGHT_OPTIONS;
    return [];
  };

  const pickerTitle = () => {
    if (pickerField === 'city') return 'Select city';
    if (pickerField === 'region') return 'Select region';
    if (pickerField === 'education') return 'Select education';
    if (pickerField === 'cast') return 'Select cast / community';
    if (pickerField === 'height') return 'Select height';
    return 'Select';
  };

  const openPicker = (field) => {
    setPickerField(field);
    setPickerVisible(true);
  };

  const validateStep = () => {
    const next = {};
    if (step === 0) {
      if (!formData.gender) next.gender = 'Choose who is creating this profile.';
      if (!formData.name.trim()) next.name = 'Full name is required.';
      if (!EMAIL_REGEX.test(formData.email.trim())) next.email = 'Enter a valid email address.';
      if (formData.phone.trim().length < 10) next.phone = 'Enter a valid phone number.';
      if (!PASSWORD_REGEX.test(formData.password)) next.password = 'Use 8+ chars with uppercase, lowercase, and a number.';
    }
    if (step === 1) {
      const age = Number(formData.age);
      if (!age || age < 18 || age > 80) next.age = 'Age must be between 18 and 80.';
      if (!formData.height) next.height = 'Height is required.';
      if (!formData.region) next.region = 'Region is required.';
      if (!formData.city) next.city = 'City is required.';
      if (!formData.education) next.education = 'Education is required.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    handleRegister();
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        hidePhotos: formData.photoVisibility === 'connected' || formData.profilePhotoVisibility === 'connected',
      };
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Account created', 'Please sign in to complete your profile and start matching.', [
          { text: 'Sign in', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Registration failed', data.message || 'Something went wrong. Please try again.');
      }
    } catch (_) {
      Alert.alert('Connection error', 'Could not connect to Shadii.pk. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScreenHeader title="Create Profile" subtitle="Shadii.pk" onBack={() => navigation.goBack()} insetsTop={insets.top} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.stepper}>
            {STEPS.map((s, i) => (
              <View key={s} style={styles.stepItem}>
                <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
                  <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepText, i === step && styles.stepTextActive]}>{s}</Text>
              </View>
            ))}
          </View>

          <Card style={styles.card}>
            {step === 0 ? (
              <AccountStep
                formData={formData}
                updateForm={updateForm}
                errors={errors}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            ) : step === 1 ? (
              <DetailsStep formData={formData} updateForm={updateForm} errors={errors} openPicker={openPicker} />
            ) : (
              <PrivacyStep formData={formData} updateForm={updateForm} />
            )}
          </Card>

          <View style={styles.actions}>
            {step > 0 ? (
              <PrimaryButton label="Back" variant="secondary" onPress={() => setStep((s) => s - 1)} style={styles.actionButton} />
            ) : null}
            <PrimaryButton
              label={step === 2 ? 'Create account' : 'Continue'}
              icon={step === 2 ? 'check' : 'arrow-right'}
              onPress={handleNext}
              loading={loading}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerVisible(false)} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{pickerTitle()}</Text>
          <FlatList
            data={pickerOptions()}
            keyExtractor={(item) => String(item)}
            style={styles.sheetList}
            renderItem={({ item }) => (
              <Pressable
                style={styles.option}
                onPress={() => {
                  updateForm(pickerField, item);
                  setPickerVisible(false);
                }}
              >
                <Text style={styles.optionText}>{item}</Text>
                {formData[pickerField] === item ? <MaterialCommunityIcons name="check" size={20} color={colors.primary} /> : null}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </AppBackground>
  );
}

function AccountStep({ formData, updateForm, errors, showPassword, setShowPassword }) {
  return (
    <View style={styles.section}>
      <TrustBadge icon="shield-account-outline" label="Private account setup" tone="trust" />
      <Text style={styles.title}>Start with the basics</Text>
      <Text style={styles.subtitle}>Use real details. They help keep the community reliable and improve match quality.</Text>

      <View>
        <Text style={styles.label}>Profile created for</Text>
        <View style={styles.genderRow}>
          <Chip label="Male" icon="human-male" active={formData.gender === 'male'} onPress={() => updateForm('gender', 'male')} style={styles.genderChip} />
          <Chip label="Female" icon="human-female" active={formData.gender === 'female'} onPress={() => updateForm('gender', 'female')} style={styles.genderChip} />
        </View>
        {errors.gender ? <Text style={styles.error}>{errors.gender}</Text> : null}
      </View>

      <Field label="Full name" icon="account-outline" value={formData.name} onChangeText={(v) => updateForm('name', v)} placeholder="Enter full name" autoCapitalize="words" error={errors.name} />
      <Field label="Email address" icon="email-outline" value={formData.email} onChangeText={(v) => updateForm('email', v.toLowerCase())} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
      <Field label="Phone number" icon="phone-outline" value={formData.phone} onChangeText={(v) => updateForm('phone', v)} placeholder="+92 3XX XXXXXXX" keyboardType="phone-pad" error={errors.phone} />
      <Field
        label="Password"
        icon="lock-outline"
        value={formData.password}
        onChangeText={(v) => updateForm('password', v)}
        placeholder="At least 8 characters"
        secureTextEntry={!showPassword}
        error={errors.password}
        right={
          <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
            <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        }
      />
    </View>
  );
}

function DetailsStep({ formData, updateForm, errors, openPicker }) {
  return (
    <View style={styles.section}>
      <TrustBadge icon="account-details-outline" label="Match details" />
      <Text style={styles.title}>Tell us what matters</Text>
      <Text style={styles.subtitle}>These details help people understand compatibility before sending requests.</Text>

      <View style={styles.row}>
        <Field label="Age" icon="calendar-outline" value={formData.age} onChangeText={(v) => updateForm('age', v)} placeholder="25" keyboardType="numeric" error={errors.age} style={styles.rowItem} />
        <SelectField label="Height" icon="human-height" value={formData.height} placeholder="Select" onPress={() => openPicker('height')} style={styles.rowItem} />
      </View>
      {errors.height ? <Text style={styles.error}>{errors.height}</Text> : null}
      <SelectField label="Region" icon="map-marker-radius-outline" value={formData.region} placeholder="Select region" onPress={() => openPicker('region')} />
      {errors.region ? <Text style={styles.error}>{errors.region}</Text> : null}
      <SelectField label="City" icon="map-marker-outline" value={formData.city} placeholder="Select city" onPress={() => openPicker('city')} />
      {errors.city ? <Text style={styles.error}>{errors.city}</Text> : null}
      <SelectField label="Education" icon="school-outline" value={formData.education} placeholder="Select education" onPress={() => openPicker('education')} />
      {errors.education ? <Text style={styles.error}>{errors.education}</Text> : null}
      <SelectField label="Cast / community" icon="account-group-outline" value={formData.cast} placeholder="Optional" onPress={() => openPicker('cast')} />
      <Field label="About" value={formData.about} onChangeText={(v) => updateForm('about', v)} placeholder="A short respectful intro..." multiline inputStyle={styles.aboutInput} />
    </View>
  );
}

function PrivacyStep({ formData, updateForm }) {
  return (
    <View style={styles.section}>
      <TrustBadge icon="lock-check-outline" label="Privacy defaults" tone="trust" />
      <Text style={styles.title}>Choose your comfort level</Text>
      <Text style={styles.subtitle}>You can change these settings later from your profile.</Text>

      <PrivacyChoice
        title="Who can see your profile picture?"
        value={formData.profilePhotoVisibility}
        onChange={(value) => updateForm('profilePhotoVisibility', value)}
      />
      <PrivacyChoice
        title="Who can see your photo gallery?"
        value={formData.photoVisibility}
        onChange={(value) => {
          updateForm('photoVisibility', value);
          updateForm('hidePhotos', value === 'connected');
        }}
      />

      <View style={styles.note}>
        <MaterialCommunityIcons name="information-outline" size={20} color={colors.info} />
        <Text style={styles.noteText}>
          Shadii.pk uses verification, request controls, reporting, and blocking to keep conversations respectful.
        </Text>
      </View>
    </View>
  );
}

function PrivacyChoice({ title, value, onChange }) {
  return (
    <View style={styles.privacyChoice}>
      <Text style={styles.privacyTitle}>{title}</Text>
      <View style={styles.visibilityGrid}>
        {PHOTO_VISIBILITY_OPTIONS.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[styles.visibilityOption, value === option.id && styles.visibilityOptionActive]}
          >
            <Text style={[styles.visibilityLabel, value === option.id && styles.visibilityLabelActive]}>{option.label}</Text>
            <Text style={[styles.visibilityHelper, value === option.id && styles.visibilityHelperActive]}>{option.helper}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  stepper: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNum: {
    color: colors.textMuted,
    fontWeight: '900',
  },
  stepNumActive: {
    color: '#FFFFFF',
  },
  stepText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  stepTextActive: {
    color: colors.primary,
  },
  card: {
    padding: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderChip: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowItem: {
    flex: 1,
  },
  aboutInput: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '700',
    marginTop: -6,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  privacyChoice: {
    gap: spacing.sm,
  },
  visibilityGrid: {
    gap: spacing.sm,
  },
  visibilityOption: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  visibilityOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  visibilityLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  visibilityLabelActive: {
    color: '#FFFFFF',
  },
  visibilityHelper: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  visibilityHelperActive: {
    color: '#F8E7ED',
  },
  privacyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  privacyBody: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  note: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#EEF6FD',
  },
  noteText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(32,33,36,0.34)',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  sheetList: {
    marginHorizontal: -spacing.lg,
  },
  option: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
