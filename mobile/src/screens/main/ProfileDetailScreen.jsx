import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import colors from '../../theme/colors';
import { API_BASE_URL } from '../../utils/constants';

const { width } = Dimensions.get('window');

export default function ProfileDetailScreen({ route, navigation }) {
  const { userId } = route.params;
  const { token, user } = useSelector((s) => s.auth);
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setProfile(data.profile);
    } catch (e) {
      console.log('Error fetching profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    navigation.navigate('ChatDetail', { userId: profile._id, userName: profile.name });
  };

  if (loading) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.accent} /></View>;
  }

  if (!profile) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={{ color: colors.textSecondary, fontSize: 16 }}>Profile not found</Text></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Photo Header */}
        <View style={styles.photoContainer}>
          {profile.photo ? (
            <Image
              source={{ uri: profile.photo }}
              style={styles.photo}
              blurRadius={profile.isPhotoBlurred ? 20 : 0}
            />
          ) : (
            <LinearGradient colors={colors.gradients.primary} style={styles.photoPlaceholder}>
              <Text style={styles.initials}>{profile.name?.[0]}</Text>
            </LinearGradient>
          )}

          {profile.isPhotoBlurred && (
            <View style={styles.blurOverlay}>
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              <Text style={styles.lockIcon}>🔒</Text>
              <Text style={styles.blurText}>Subscribe to view clear photos</Text>
              <TouchableOpacity style={styles.subscribeBtn} onPress={() => navigation.navigate('Plans')}>
                <Text style={styles.subscribeBtnText}>View Plans</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => navigation.goBack()}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Content */}
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}, {profile.age}</Text>
            {profile.isVerified && <Text style={styles.verifiedBadge}>✅ Verified</Text>}
          </View>

          <Text style={styles.basicInfo}>
            {profile.city}, {profile.country} • {profile.education}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.msgBtn} onPress={handleMessage}>
              <LinearGradient colors={colors.gradients.primary} style={styles.btnGradient}>
                <Text style={styles.msgBtnText}>💬 Send Message</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.likeBtn}>
              <Text style={styles.likeIcon}>🤍</Text>
            </TouchableOpacity>
          </View>

          {/* About */}
          {profile.about && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About {profile.name}</Text>
              <Text style={styles.aboutText}>{profile.about}</Text>
            </View>
          )}

          {/* Details Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.grid}>
              <DetailItem icon="📏" label="Height" value={profile.height} />
              <DetailItem icon="🎓" label="Education" value={profile.education} />
              <DetailItem icon="🕌" label="Religion" value={profile.religion} />
              <DetailItem icon="👨‍👩‍👧" label="Cast" value={profile.cast} />
              <DetailItem icon="💍" label="Marital Status" value={profile.maritalStatus} />
              <DetailItem icon="🗣️" label="Mother Tongue" value={profile.motherTongue} />
            </View>
          </View>

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests & Hobbies</Text>
              <View style={styles.tagsContainer}>
                {profile.interests.map((interest, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Report/Block */}
          <View style={styles.footerActions}>
            <TouchableOpacity onPress={() => navigation.navigate('Report', { userId: profile._id })}>
              <Text style={styles.reportText}>⚠️ Report {profile.name}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const DetailItem = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoContainer: { width, height: width * 1.1, position: 'relative' },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 80, color: '#fff', fontWeight: 'bold' },
  backBtn: { position: 'absolute', left: 16, width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.18)' },
  blurOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  lockIcon: { fontSize: 48, marginBottom: 16 },
  blurText: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 24, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  subscribeBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  subscribeBtnText: { color: '#fff', fontWeight: '700' },
  content: { padding: 24, backgroundColor: colors.background, marginTop: -30, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  name: { fontSize: 28, fontWeight: '800', color: colors.text },
  verifiedBadge: { backgroundColor: 'rgba(29, 161, 242, 0.1)', color: '#1DA1F2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '700', overflow: 'hidden' },
  basicInfo: { fontSize: 15, color: colors.textSecondary, marginBottom: 24 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  msgBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  btnGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  msgBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  likeBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.glassMedium, borderWidth: 1, borderColor: colors.glassBorderLight, alignItems: 'center', justifyContent: 'center' },
  likeIcon: { fontSize: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 },
  aboutText: { fontSize: 15, color: colors.textSecondary, lineHeight: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  detailItem: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder },
  detailIcon: { fontSize: 20 },
  detailLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 2 },
  detailValue: { fontSize: 13, fontWeight: '600', color: colors.text },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: colors.glassMedium, borderWidth: 1, borderColor: colors.glassBorderLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tagText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  footerActions: { alignItems: 'center', marginTop: 16, borderTopWidth: 1, borderTopColor: colors.glassBorderLight, paddingTop: 24 },
  reportText: { color: colors.error, fontSize: 14, fontWeight: '600' },
});
