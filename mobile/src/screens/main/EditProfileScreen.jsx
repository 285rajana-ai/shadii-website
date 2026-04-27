import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import colors from '../../theme/colors';
import { API_BASE_URL, EDUCATION_LEVELS, INTERESTS } from '../../utils/constants';

export default function EditProfileScreen({ navigation }) {
  const { token, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
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
    religion: user?.religion || 'Islam',
  });

  const [selectedInterests, setSelectedInterests] = useState(user?.interests || []);

  const getProfileImage = () => {
    if (user?.photos && user.photos.length > 0) {
      const main = user.photos.find(p => p.isMain) || user.photos[0];
      return main.url;
    }
    return null;
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = { ...formData, age: Number(formData.age), interests: selectedInterests };
      const res = await fetch(`${API_BASE_URL}/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        dispatch(updateUser(data.user));
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
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
    const formData = new FormData();
    formData.append('photo', {
      uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });

    try {
      const res = await fetch(`${API_BASE_URL}/profile/photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        // Just refresh user object here for simplicity, in real app update the store photos array
        const userRes = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const userData = await userRes.json();
        if (userData.success) dispatch(updateUser(userData.user));
        Alert.alert('Success', 'Photo uploaded');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      if (selectedInterests.length >= 10) return Alert.alert('Limit Reached', 'You can select up to 10 interests');
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const updateForm = (key, val) => setFormData({ ...formData, [key]: val });

  return (
    <LinearGradient colors={[colors.background, '#FCE4EC']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Photo Edit */}
          <View style={styles.photoSection}>
            <View style={styles.avatarWrap}>
              {getProfileImage() ? (
                <Image source={{ uri: getProfileImage() }} style={styles.avatar} />
              ) : (
                <View style={styles.placeholder}><Text style={styles.initials}>{formData.name[0]}</Text></View>
              )}
            </View>
            <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage} disabled={uploading}>
              <Text style={styles.changePhotoText}>{uploading ? 'Uploading...' : 'Change Photo'}</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <InputField label="Full Name" value={formData.name} onChange={(v) => updateForm('name', v)} />
            <View style={styles.row}>
              <InputField label="Age" value={formData.age} onChange={(v) => updateForm('age', v)} keyboardType="numeric" style={{ flex: 1, marginRight: 8 }} />
              <InputField label="Height" value={formData.height} onChange={(v) => updateForm('height', v)} style={{ flex: 1, marginLeft: 8 }} placeholder="5'6" />
            </View>
            <InputField label="City" value={formData.city} onChange={(v) => updateForm('city', v)} />
            <InputField label="Education" value={formData.education} onChange={(v) => updateForm('education', v)} />
            <InputField label="Cast / Community" value={formData.cast} onChange={(v) => updateForm('cast', v)} />
            <InputField label="About Me" value={formData.about} onChange={(v) => updateForm('about', v)} multiline />
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

          {/* Save Button */}
          <TouchableOpacity style={styles.btnWrap} onPress={handleUpdate} disabled={loading}>
            <LinearGradient colors={colors.gradients.primary} style={styles.btn}>
              <Text style={styles.btnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const InputField = ({ label, style, multiline, ...props }) => (
  <View style={[styles.inputGroup, style]}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={[styles.input, multiline && { height: 100, paddingTop: 14 }]} placeholderTextColor={colors.textMuted} multiline={multiline} {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 8, marginRight: 8 },
  backIcon: { fontSize: 24, color: colors.primary },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  scroll: { padding: 24, paddingBottom: 40 },
  
  photoSection: { alignItems: 'center', marginBottom: 32 },
  avatarWrap: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', marginBottom: 12, borderWidth: 2, borderColor: colors.primaryLight },
  avatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { width: '100%', height: '100%', backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
  changePhotoBtn: { backgroundColor: 'rgba(139,26,74,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  changePhotoText: { color: colors.primary, fontWeight: '600', fontSize: 13 },

  form: { marginBottom: 24 },
  row: { flexDirection: 'row' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.text, fontSize: 15 },
  
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tagSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  tagTextSelected: { color: '#fff' },

  btnWrap: { borderRadius: 16, overflow: 'hidden' },
  btn: { paddingVertical: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
