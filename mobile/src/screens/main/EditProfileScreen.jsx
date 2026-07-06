import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import PrimaryButton from '../../components/ui/PrimaryButton';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { AppBackground, Card, Chip, Field, SelectField, TrustBadge } from '../../components/ui/LightPrimitives';
import { updateUser } from '../../store/slices/authSlice';
import colors from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import {
  API_BASE_URL,
  CAST_OPTIONS,
  EDUCATION_LEVELS,
  INTERESTS,
  MARITAL_STATUS_OPTIONS,
  MOTHER_TONGUE_OPTIONS,
  PAKISTAN_REGIONS,
  PAKISTAN_CITIES,
  PHOTO_VISIBILITY_OPTIONS,
  SECT_OPTIONS,
} from '../../utils/constants';

const HEIGHT_OPTIONS = [];
for (let ft = 4; ft <= 6; ft++) {
  const maxIn = ft === 6 ? 6 : 11;
  for (let inch = ft === 4 ? 6 : 0; inch <= maxIn; inch++) HEIGHT_OPTIONS.push(`${ft}'${inch}"`);
}

export default function EditProfileScreen({ navigation }) {
  const { token, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerField, setPickerField] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    height: user?.height || '',
    region: user?.region || '',
    city: user?.city || '',
    education: user?.education || '',
    cast: user?.cast || '',
    about: user?.about || '',
    maritalStatus: user?.maritalStatus || 'Never Married',
    motherTongue: user?.motherTongue || '',
    sect: user?.sect || '',
    hidePhotos: user?.hidePhotos || false,
    profilePhotoVisibility: user?.profilePhotoVisibility || (user?.hidePhotos ? 'connected' : 'registered'),
    photoVisibility: user?.photoVisibility || (user?.hidePhotos ? 'connected' : 'registered'),
  });
  const [selectedInterests, setSelectedInterests] = useState(user?.interests || []);

  const updateForm = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const profileImage = () => {
    if (user?.photos?.length > 0) {
      const main = user.photos.find((p) => p.isMain) || user.photos[0];
      return main.url;
    }
    return null;
  };

  const options = () => {
    if (pickerField === 'city') return PAKISTAN_CITIES;
    if (pickerField === 'region') return PAKISTAN_REGIONS;
    if (pickerField === 'education') return EDUCATION_LEVELS;
    if (pickerField === 'cast') return CAST_OPTIONS;
    if (pickerField === 'height') return HEIGHT_OPTIONS;
    if (pickerField === 'motherTongue') return MOTHER_TONGUE_OPTIONS;
    return [];
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Please allow photo access to upload a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) uploadPhoto(result.assets[0].uri);
  };

  const uploadPhoto = async (uri) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('photo', { uri, type: 'image/jpeg', name: 'profile.jpg' });
    try {
      const res = await fetch(`${API_BASE_URL}/profile/photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        const userRes = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const userData = await userRes.json();
        if (userData.success) dispatch(updateUser(userData.user));
        Alert.alert('Photo uploaded', 'Your profile photo has been updated.');
      } else {
        Alert.alert('Upload failed', data.message || 'Failed to upload photo.');
      }
    } catch (_) {
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
      return;
    }
    if (selectedInterests.length >= 10) {
      Alert.alert('Limit reached', 'You can select up to 10 interests.');
      return;
    }
    setSelectedInterests([...selectedInterests, interest]);
  };

  const handleUpdate = async () => {
    const nextErrors = {};
    const age = Number(formData.age);
    if (!formData.name.trim()) nextErrors.name = 'Full name is required.';
    if (!age || age < 18 || age > 80) nextErrors.age = 'Age must be between 18 and 80.';
    if (!formData.height) nextErrors.height = 'Height is required.';
    if (!formData.region) nextErrors.region = 'Region is required.';
    if (!formData.city) nextErrors.city = 'City is required.';
    if (!formData.education) nextErrors.education = 'Education is required.';
    if (formData.about?.length > 500) nextErrors.about = 'About section must be under 500 characters.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      Alert.alert('Check profile details', 'Please fix the highlighted fields before saving.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        age,
        interests: selectedInterests,
        hidePhotos: formData.photoVisibility === 'connected' || formData.profilePhotoVisibility === 'connected',
      };
      const res = await fetch(`${API_BASE_URL}/profile/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        dispatch(updateUser(data.user));
        Alert.alert('Profile updated', 'Your profile has been saved successfully.');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile.');
      }
    } catch (_) {
      Alert.alert('Error', 'Failed to update profile. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScreenHeader title="Edit Profile" subtitle="Improve matches" onBack={() => navigation.goBack()} insetsTop={insets.top} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Card style={styles.photoCard}>
            <View style={styles.avatarWrap}>
              {profileImage() ? (
                <Image source={{ uri: profileImage() }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>{formData.name?.[0] || '?'}</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Profile photo</Text>
              <Text style={styles.cardText}>Use a clear, respectful photo. Private mode protects it until approval.</Text>
              <Pressable style={styles.photoButton} onPress={pickImage} disabled={uploading}>
                {uploading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.photoButtonText}>Change photo</Text>}
              </Pressable>
            </View>
          </Card>

          <Card style={styles.section}>
            <TrustBadge icon="lock-check-outline" label="Privacy" tone="trust" />
            <PrivacyChoice
              title="Profile picture visibility"
              value={formData.profilePhotoVisibility}
              onChange={(value) => updateForm('profilePhotoVisibility', value)}
            />
            <PrivacyChoice
              title="Gallery visibility"
              value={formData.photoVisibility}
              onChange={(value) => {
                updateForm('photoVisibility', value);
                updateForm('hidePhotos', value === 'connected');
              }}
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.cardTitle}>Basic details</Text>
            <Field label="Full name" value={formData.name} onChangeText={(v) => updateForm('name', v)} placeholder="Full name" error={errors.name} />
            <View style={styles.row}>
              <Field label="Age" value={formData.age} onChangeText={(v) => updateForm('age', v.replace(/\D/g, ''))} keyboardType="numeric" placeholder="25" style={styles.rowItem} error={errors.age} />
              <SelectField label="Height" value={formData.height} placeholder="Select" onPress={() => { setPickerField('height'); setPickerVisible(true); }} style={styles.rowItem} />
            </View>
            {errors.height ? <Text style={styles.errorText}>{errors.height}</Text> : null}
            <SelectField label="Region" value={formData.region} placeholder="Select region" onPress={() => { setPickerField('region'); setPickerVisible(true); }} />
            {errors.region ? <Text style={styles.errorText}>{errors.region}</Text> : null}
            <SelectField label="City" value={formData.city} placeholder="Select city" onPress={() => { setPickerField('city'); setPickerVisible(true); }} />
            {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
            <SelectField label="Education" value={formData.education} placeholder="Select education" onPress={() => { setPickerField('education'); setPickerVisible(true); }} />
            {errors.education ? <Text style={styles.errorText}>{errors.education}</Text> : null}
            <SelectField label="Cast / community" value={formData.cast} placeholder="Optional" onPress={() => { setPickerField('cast'); setPickerVisible(true); }} />
            <SelectField label="Mother tongue" value={formData.motherTongue} placeholder="Select mother tongue" onPress={() => { setPickerField('motherTongue'); setPickerVisible(true); }} />
            <Field label="About me" value={formData.about} onChangeText={(v) => updateForm('about', v)} placeholder="Write a short introduction..." multiline maxLength={500} inputStyle={styles.aboutInput} error={errors.about} />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.cardTitle}>Marital status</Text>
            <View style={styles.chips}>
              {MARITAL_STATUS_OPTIONS.map((opt) => <Chip key={opt} label={opt} active={formData.maritalStatus === opt} onPress={() => updateForm('maritalStatus', opt)} />)}
            </View>
            <Text style={styles.cardTitle}>Sect</Text>
            <View style={styles.chips}>
              {SECT_OPTIONS.map((opt) => <Chip key={opt} label={opt} active={formData.sect === opt} onPress={() => updateForm('sect', opt)} />)}
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.cardTitle}>Interests</Text>
            <Text style={styles.cardText}>Choose up to 10. These make conversations easier to start.</Text>
            <View style={styles.chips}>
              {INTERESTS.map((interest) => (
                <Chip key={interest} label={interest} active={selectedInterests.includes(interest)} onPress={() => toggleInterest(interest)} />
              ))}
            </View>
          </Card>

          <PrimaryButton label="Save profile" icon="check" loading={loading} onPress={handleUpdate} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerVisible(false)} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Select {pickerField}</Text>
          <FlatList
            data={options()}
            keyExtractor={(item) => String(item)}
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

function PrivacyChoice({ title, value, onChange }) {
  return (
    <View style={styles.privacyChoice}>
      <Text style={styles.switchTitle}>{title}</Text>
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
    gap: spacing.md,
  },
  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {
    width: 86,
    height: 86,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: colors.surfaceLight,
  },
  avatarFallback: {
    width: 86,
    height: 86,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightBg,
  },
  avatarInitial: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: '900',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  cardText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  photoButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLightBg,
  },
  photoButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  section: {
    gap: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  switchTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  switchText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
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
    backgroundColor: colors.backgroundSoft,
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowItem: {
    flex: 1,
  },
  aboutInput: {
    minHeight: 94,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '700',
    marginTop: -8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(32,33,36,0.36)',
  },
  sheet: {
    maxHeight: '72%',
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
  option: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
