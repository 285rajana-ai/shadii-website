import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert, FlatList, Image, KeyboardAvoidingView, Modal,
  Platform, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { updateUser } from '../../store/slices/authSlice';
import colors from '../../theme/colors';
import { radius } from '../../theme/spacing';
import {
  API_BASE_URL, INTERESTS, PAKISTAN_CITIES,
  EDUCATION_LEVELS, CAST_OPTIONS,
} from '../../utils/constants';

const MARITAL_STATUS_OPTIONS = ['Never Married', 'Divorced', 'Widowed'];
const SECT_OPTIONS = ['Sunni', 'Shia', 'Deobandi', 'Barelvi', 'Other'];

// Generate height options 4'6" to 6'6"
const HEIGHT_OPTIONS = [];
for (let ft = 4; ft <= 6; ft++) {
  const maxIn = ft === 6 ? 6 : 11;
  for (let inch = ft === 4 ? 6 : 0; inch <= maxIn; inch++) {
    HEIGHT_OPTIONS.push(`${ft}'${inch}"`);
  }
}

export default function EditProfileScreen({ navigation }) {
  const { token, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerField, setPickerField] = useState(null);
  const [heightSearch, setHeightSearch] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    height: user?.height || '',
    city: user?.city || '',
    education: user?.education || '',
    cast: user?.cast || '',
    about: user?.about || '',
    maritalStatus: user?.maritalStatus || 'Never Married',
    motherTongue: user?.motherTongue || '',
    sect: user?.sect || '',
  });

  const [selectedInterests, setSelectedInterests] = useState(user?.interests || []);

  const getProfileImage = () => {
    if (user?.photos && user.photos.length > 0) {
      const main = user.photos.find(p => p.isMain) || user.photos[0];
      return main.url;
    }
    return null;
  };

  const openPicker = (field) => {
    setPickerField(field);
    setHeightSearch('');
    setPickerVisible(true);
  };

  const closePicker = () => {
    setPickerVisible(false);
    setPickerField(null);
  };

  const selectOption = (value) => {
    updateForm(pickerField, value);
    closePicker();
  };

  const getPickerOptions = () => {
    switch (pickerField) {
      case 'city': return PAKISTAN_CITIES;
      case 'education': return EDUCATION_LEVELS;
      case 'cast': return CAST_OPTIONS;
      case 'height':
        if (!heightSearch) return HEIGHT_OPTIONS;
        return HEIGHT_OPTIONS.filter(h => h.startsWith(heightSearch.trim()));
      default: return [];
    }
  };

  const getPickerTitle = () => {
    switch (pickerField) {
      case 'city': return 'Select City';
      case 'education': return 'Select Education';
      case 'cast': return 'Select Cast / Community';
      case 'height': return 'Select Height';
      default: return 'Select';
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = { ...formData, age: Number(formData.age), interests: selectedInterests };
      const res = await fetch(`${API_BASE_URL}/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        dispatch(updateUser(data.user));
        Alert.alert('✅ Profile Updated', 'Your profile has been saved successfully.');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return Alert.alert('Permission Required', 'Please allow photo access to upload a photo.');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      uploadPhoto(result.assets[0].uri);
    }
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
        const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        if (userData.success) dispatch(updateUser(userData.user));
        Alert.alert('✅ Photo Uploaded', 'Your profile photo has been updated.');
      } else {
        Alert.alert('Upload Failed', data.message || 'Failed to upload photo.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      if (selectedInterests.length >= 10)
        return Alert.alert('Limit Reached', 'You can select up to 10 interests');
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const updateForm = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.background, '#1A000A']} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo */}
          <View style={styles.photoSection}>
            <View style={styles.avatarWrap}>
              {getProfileImage() ? (
                <Image source={{ uri: getProfileImage() }} style={styles.avatar} />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.initials}>{formData.name[0] || '?'}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Text style={styles.changePhotoText}>📷 Change Photo</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <InputField label="Full Name" value={formData.name} onChangeText={(v) => updateForm('name', v)} autoCapitalize="words" />

            <View style={styles.row}>
              <InputField label="Age" value={formData.age} onChangeText={(v) => updateForm('age', v)} keyboardType="numeric" style={{ flex: 1, marginRight: 8 }} />
              {/* Height picker */}
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Height</Text>
                <TouchableOpacity style={styles.pickerField} onPress={() => openPicker('height')}>
                  <Text style={[styles.pickerFieldText, formData.height && { color: colors.text }]}>
                    {formData.height || "Select"}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* City picker */}
            <Text style={styles.label}>City</Text>
            <TouchableOpacity style={styles.pickerField} onPress={() => openPicker('city')}>
              <Text style={[styles.pickerFieldText, formData.city && { color: colors.text }]}>
                {formData.city || "Select City"}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Education picker */}
            <Text style={styles.label}>Education</Text>
            <TouchableOpacity style={styles.pickerField} onPress={() => openPicker('education')}>
              <Text style={[styles.pickerFieldText, formData.education && { color: colors.text }]}>
                {formData.education || "Select Education Level"}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Cast picker */}
            <Text style={styles.label}>Cast / Community</Text>
            <TouchableOpacity style={styles.pickerField} onPress={() => openPicker('cast')}>
              <Text style={[styles.pickerFieldText, formData.cast && { color: colors.text }]}>
                {formData.cast || "Select Cast (Optional)"}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <InputField label="About Me" value={formData.about} onChangeText={(v) => updateForm('about', v)} multiline placeholder="Write a few words about yourself..." />
            <InputField label="Mother Tongue" value={formData.motherTongue} onChangeText={(v) => updateForm('motherTongue', v)} placeholder="e.g. Punjabi, Urdu, Sindhi" />
          </View>

          {/* Marital Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Marital Status</Text>
            <View style={styles.tagsContainer}>
              {MARITAL_STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.tag, formData.maritalStatus === opt && styles.tagSelected]}
                  onPress={() => updateForm('maritalStatus', opt)}
                >
                  <Text style={[styles.tagText, formData.maritalStatus === opt && styles.tagTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sect */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sect</Text>
            <View style={styles.tagsContainer}>
              {SECT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.tag, formData.sect === opt && styles.tagSelected]}
                  onPress={() => updateForm('sect', opt)}
                >
                  <Text style={[styles.tagText, formData.sect === opt && styles.tagTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests ({selectedInterests.length}/10)</Text>
            <View style={styles.tagsContainer}>
              {INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <TouchableOpacity
                    key={interest}
                    style={[styles.tag, isSelected && styles.tagSelected]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{interest}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <PrimaryButton label="Save Changes" onPress={handleUpdate} loading={loading} disabled={loading} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Picker Modal */}
      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={closePicker}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={closePicker} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getPickerTitle()}</Text>
              <TouchableOpacity onPress={closePicker}>
                <MaterialCommunityIcons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {pickerField === 'height' && (
              <View style={styles.searchBox}>
                <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Type 5 or 6 to filter"
                  placeholderTextColor={colors.textMuted}
                  value={heightSearch}
                  onChangeText={setHeightSearch}
                  keyboardType="numeric"
                  maxLength={1}
                />
              </View>
            )}

            <FlatList
              data={getPickerOptions()}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    formData[pickerField] === item && styles.optionRowSelected,
                  ]}
                  onPress={() => selectOption(item)}
                >
                  {formData[pickerField] === item && (
                    <MaterialCommunityIcons name="check-circle" size={18} color={colors.accent} style={{ marginRight: 8 }} />
                  )}
                  <Text style={[
                    styles.optionText,
                    formData[pickerField] === item && styles.optionTextSelected,
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const InputField = ({ label, style, multiline, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.inputGroup, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          multiline && { height: 100, paddingTop: 12, textAlignVertical: 'top' },
        ]}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 44, height: 44, borderRadius: 22, marginRight: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  scroll: { padding: 24, paddingBottom: 60 },

  photoSection: { alignItems: 'center', marginBottom: 32 },
  avatarWrap: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', marginBottom: 12, borderWidth: 2, borderColor: colors.accent },
  avatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { width: '100%', height: '100%', backgroundColor: 'rgba(212,175,55,0.2)', alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 40, color: colors.accent, fontWeight: 'bold' },
  changePhotoBtn: { backgroundColor: 'rgba(212,175,55,0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' },
  changePhotoText: { color: colors.accent, fontWeight: '600', fontSize: 13 },

  form: { marginBottom: 24 },
  row: { flexDirection: 'row', marginBottom: 4 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 16, color: colors.text, fontSize: 14 },
  inputFocused: { borderColor: 'rgba(212,175,55,0.6)', backgroundColor: 'rgba(212,175,55,0.04)' },

  pickerField: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 16,
  },
  pickerFieldText: { flex: 1, color: colors.textMuted, fontSize: 14 },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tagSelected: { backgroundColor: 'rgba(212,175,55,0.2)', borderColor: colors.accent },
  tagText: { color: colors.textSecondary, fontSize: 12, fontWeight: '500' },
  tagTextSelected: { color: colors.accent, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: '#1A0A0A', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '75%', paddingBottom: 40,
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)',
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, marginHorizontal: 16, marginTop: 12, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: 8, color: colors.text, fontSize: 16 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  optionRowSelected: { backgroundColor: 'rgba(212,175,55,0.08)' },
  optionText: { fontSize: 16, color: colors.textSecondary },
  optionTextSelected: { color: colors.accent, fontWeight: '700' },
});
