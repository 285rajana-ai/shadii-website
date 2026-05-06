import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import colors from '../../theme/colors';
import { API_BASE_URL } from '../../utils/constants';

export default function LivePhotoScreen({ route, navigation }) {
  const { cnicFront, cnicBack } = route.params;
  const { token } = useSelector((s) => s.auth);
  const insets = useSafeAreaInsets();

  const [livePhoto, setLivePhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Please allow camera access to take a live photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled && result.assets[0]) {
      setLivePhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!livePhoto) {
      return Alert.alert('Required', 'Please take a live selfie.');
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('cnicFront', { uri: cnicFront, type: 'image/jpeg', name: 'front.jpg' });
    formData.append('cnicBack', { uri: cnicBack, type: 'image/jpeg', name: 'back.jpg' });
    formData.append('livePhoto', { uri: livePhoto, type: 'image/jpeg', name: 'live.jpg' });

    try {
      const res = await fetch(`${API_BASE_URL}/profile/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        Alert.alert('Success', 'Verification submitted! Our team will review it within 24-48 hours.', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to submit verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1A000A', '#0D0509', '#0D0D0D']} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification (2/2)</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Live Selfie</Text>
        <Text style={styles.subtitle}>
          Take a clear selfie right now to prove you match your CNIC. Ensure good lighting and remove glasses/masks.
        </Text>

        <TouchableOpacity style={styles.cameraCard} onPress={takePhoto}>
          {livePhoto ? (
            <Image source={{ uri: livePhoto }} style={styles.previewImage} />
          ) : (
            <>
              <View style={styles.cameraCircle}>
                <Text style={styles.cameraIcon}>🤳</Text>
              </View>
              <Text style={styles.cameraText}>Open Camera</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnWrap} onPress={handleSubmit} disabled={loading}>
          <LinearGradient colors={colors.gradients.primary} style={styles.btn}>
            <Text style={styles.btnText}>{loading ? 'Submitting...' : 'Submit Verification ✅'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, marginRight: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  content: { padding: 24, flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 40, lineHeight: 22 },
  cameraCard: {
    width: 250, height: 300, alignSelf: 'center', borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 4, borderColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cameraCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.glassMedium, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  cameraIcon: { fontSize: 40 },
  cameraText: { fontSize: 16, color: colors.primary, fontWeight: '700' },
  btnWrap: { borderRadius: 16, overflow: 'hidden', marginTop: 'auto', marginBottom: 16 },
  btn: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
