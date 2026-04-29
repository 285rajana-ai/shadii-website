import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../theme/colors';

export default function CNICUploadScreen({ navigation }) {
  const [cnicFront, setCnicFront] = useState(null);
  const [cnicBack, setCnicBack] = useState(null);

  const pickImage = async (side) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (side === 'front') setCnicFront(result.assets[0].uri);
      else setCnicBack(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!cnicFront || !cnicBack) {
      return Alert.alert('Required', 'Please upload both front and back of your CNIC.');
    }
    navigation.navigate('LivePhoto', { cnicFront, cnicBack });
  };

  return (
    <LinearGradient colors={['#1A000A', '#0D0509', '#0D0D0D']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification (1/2)</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Upload your CNIC</Text>
        <Text style={styles.subtitle}>
          To get the Blue Tick ✅ and keep our community safe, please upload clear pictures of your CNIC.
        </Text>

        <View style={styles.uploadCards}>
          {/* Front */}
          <TouchableOpacity style={styles.uploadCard} onPress={() => pickImage('front')}>
            {cnicFront ? (
              <Image source={{ uri: cnicFront }} style={styles.previewImage} />
            ) : (
              <>
                <Text style={styles.uploadIcon}>📸</Text>
                <Text style={styles.uploadText}>Tap to upload Front</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Back */}
          <TouchableOpacity style={styles.uploadCard} onPress={() => pickImage('back')}>
            {cnicBack ? (
              <Image source={{ uri: cnicBack }} style={styles.previewImage} />
            ) : (
              <>
                <Text style={styles.uploadIcon}>📸</Text>
                <Text style={styles.uploadText}>Tap to upload Back</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btnWrap} onPress={handleNext}>
          <LinearGradient colors={colors.gradients.primary} style={styles.btn}>
            <Text style={styles.btnText}>Continue to Live Photo</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.securityNote}>🔒 Your data is encrypted and securely stored. It will not be shown on your profile.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, marginRight: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  content: { padding: 24, flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 32, lineHeight: 22 },
  uploadCards: { gap: 16, marginBottom: 32 },
  uploadCard: {
    height: 140, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadIcon: { fontSize: 32, marginBottom: 8 },
  uploadText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  btnWrap: { borderRadius: 16, overflow: 'hidden', marginTop: 'auto', marginBottom: 16 },
  btn: { paddingVertical: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  securityNote: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
});
