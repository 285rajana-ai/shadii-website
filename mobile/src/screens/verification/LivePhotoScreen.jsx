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
        <Text style={styles.title}>Live Selfie with ID Card</Text>
        <Text style={styles.subtitle}>
          Take a selfie while holding your CNIC clearly visible next to your face. Both your face and the CNIC text must be clearly readable.
        </Text>

        <View style={styles.instructionBox}>
          <View style={styles.instructionRow}>
            <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
            <Text style={styles.instructionText}>Hold CNIC next to your face</Text>
          </View>
          <View style={styles.instructionRow}>
            <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
            <Text style={styles.instructionText}>Good lighting — no shadows</Text>
          </View>
          <View style={styles.instructionRow}>
            <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
            <Text style={styles.instructionText}>Remove glasses, masks, or caps</Text>
          </View>
          <View style={styles.instructionRow}>
            <MaterialCommunityIcons name="close-circle" size={16} color={colors.error} />
            <Text style={styles.instructionText}>No filters or edited photos</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.cameraCard} onPress={takePhoto}>
          {livePhoto ? (
            <>
              <Image source={{ uri: livePhoto }} style={styles.previewImage} />
              <TouchableOpacity style={styles.retakeBtn} onPress={takePhoto}>
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.cameraCircle}>
                <MaterialCommunityIcons name="camera-front" size={40} color={colors.accent} />
              </View>
              <Text style={styles.cameraText}>Open Front Camera</Text>
              <Text style={styles.cameraSubText}>Hold your CNIC next to your face</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnWrap} onPress={handleSubmit} disabled={loading}>
          <LinearGradient colors={loading ? ['#555', '#333'] : colors.gradients.primary} style={styles.btn}>
            <Text style={styles.btnText}>{loading ? 'Submitting...' : 'Submit for Review'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.securityNote}>
          🔒 Your verification data is stored securely and never shown publicly. Review takes 24-48 hours.
        </Text>
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
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 20, lineHeight: 22 },
  instructionBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 24, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  instructionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  instructionText: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  cameraCard: {
    height: 240, borderRadius: 20, marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'rgba(212,175,55,0.3)',
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  retakeBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12 },
  retakeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cameraCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(212,175,55,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' },
  cameraText: { fontSize: 16, color: colors.text, fontWeight: '700', marginBottom: 4 },
  cameraSubText: { fontSize: 12, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 16 },
  btnWrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  btn: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  securityNote: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 17, paddingHorizontal: 8 },
});
