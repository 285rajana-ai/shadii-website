import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [liked, setLiked] = useState(false);
  const [photoViewRequested, setPhotoViewRequested] = useState(false);
  const [requestingPhoto, setRequestingPhoto] = useState(false);
  const [contactShareRequested, setContactShareRequested] = useState(false);

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
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    setLiked((prev) => !prev);
    try {
      await fetch(`${API_BASE_URL}/profile/${userId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (_) { }
  };

  const handleMessage = () => {
    navigation.navigate('ChatDetail', { userId: profile._id, userName: profile.name, isOnline: profile.isOnline, lastActive: profile.lastActive });
  };

  const handlePhotoViewRequest = async () => {
    if (!user?.subscription?.isActive) {
      Alert.alert('Subscription Required', 'You need an active subscription to request photo views.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Plans', onPress: () => navigation.navigate('Plans') }
      ]);
      return;
    }
    setRequestingPhoto(true);
    try {
      const res = await fetch(`${API_BASE_URL}/profile/${userId}/request-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPhotoViewRequested(true);
        Alert.alert('Request Sent', 'Your request to view photos has been sent. You will be notified when they accept.');
      } else {
        Alert.alert('Already Requested', data.message || 'You have already sent a photo view request.');
      }
    } catch (_) {
      Alert.alert('Error', 'Could not send request. Please try again.');
    } finally {
      setRequestingPhoto(false);
    }
  };

  const handleContactShareRequest = async () => {
    if (!user?.subscription?.isActive) {
      Alert.alert('Subscription Required', 'Only subscribers can request contact sharing.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Plans', onPress: () => navigation.navigate('Plans') }
      ]);
      return;
    }
    Alert.alert(
      'Request Contact Share',
      `Send a contact share request to ${profile.name}? If they accept, you will be asked to pay PKR 299 to unlock contact details.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request', onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/profile/${userId}/contact-request`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              if (data.success) {
                setContactShareRequested(true);
                Alert.alert('Request Sent ✓', `${profile.name} will be notified. If they accept, you can pay PKR 299 to unlock contact details.`);
              } else {
                Alert.alert('Info', data.message || 'Request already sent.');
              }
            } catch (_) {
              Alert.alert('Error', 'Could not send request.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.accent} /></View>;
  }

  if (!profile) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={{ color: colors.textSecondary, fontSize: 16 }}>Profile not found</Text></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
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
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
              <MaterialCommunityIcons name="eye-off" size={40} color="rgba(255,255,255,0.6)" />
              <Text style={styles.blurText}>Photos are private</Text>
              {photoViewRequested ? (
                <View style={styles.requestedBadge}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.requestedText}>Request Sent</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.requestViewBtn}
                  onPress={handlePhotoViewRequest}
                  disabled={requestingPhoto}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={colors.gradients.primary} style={styles.requestViewBtnGrad}>
                    <MaterialCommunityIcons name="eye" size={16} color="#fff" />
                    <Text style={styles.requestViewBtnText}>
                      {requestingPhoto ? 'Sending...' : 'Request to View'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
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
          {/* Last Active */}
          <View style={styles.activeRow}>
            <View style={[styles.activeDot, { backgroundColor: profile.isOnline ? colors.online : 'rgba(255,255,255,0.3)' }]} />
            <Text style={styles.activeText}>
              {profile.isOnline ? 'Online now' : profile.lastActive ? `Active ${getLastActive(profile.lastActive)}` : 'Recently active'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.msgBtn} onPress={handleMessage}>
              <LinearGradient colors={colors.gradients.primary} style={styles.btnGradient}>
                <MaterialCommunityIcons name="message-text" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.msgBtnText}>Send Message</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.likeBtn, liked && styles.likeBtnActive]}
              onPress={handleLike}
              activeOpacity={0.8}
              accessibilityLabel={liked ? 'Unlike profile' : 'Like profile'}
            >
              <MaterialCommunityIcons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? '#E53935' : colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Contact Share Request */}
          <TouchableOpacity
            style={[styles.contactShareBtn, contactShareRequested && styles.contactShareBtnDone]}
            onPress={handleContactShareRequest}
            disabled={contactShareRequested}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={contactShareRequested ? 'check-circle' : 'phone-forward'}
              size={18}
              color={contactShareRequested ? colors.success : colors.accent}
            />
            <Text style={[styles.contactShareText, contactShareRequested && { color: colors.success }]}>
              {contactShareRequested ? 'Contact Request Sent' : 'Request Contact Share (PKR 299)'}
            </Text>
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
          <TouchableOpacity onPress={() => navigation.navigate('Report', { user: { _id: profile._id, name: profile.name, photo: profile.photo, age: profile.age, city: profile.city } })}>
            <Text style={styles.reportText}>⚠️ Report {profile.name}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const getLastActive = (date) => {
  if (!date) return 'recently';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return 'long ago';
};

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
  initials: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
  backBtn: { position: 'absolute', left: 16, width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.18)' },
  blurOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 12 },
  blurText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '700' },
  requestViewBtn: { borderRadius: 20, overflow: 'hidden', marginTop: 4 },
  requestViewBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12 },
  requestViewBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  requestedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(46,204,113,0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  requestedText: { color: colors.success, fontWeight: '700', fontSize: 13 },
  content: { padding: 24, backgroundColor: colors.background, marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  name: { fontSize: 24, fontWeight: '800', color: colors.text },
  verifiedBadge: { backgroundColor: 'rgba(212,175,55,0.12)', color: colors.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '700', overflow: 'hidden' },
  basicInfo: { fontSize: 14, color: colors.textSecondary, marginBottom: 12 },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  activeText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  msgBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  btnGradient: { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  msgBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  likeBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.glassMedium, borderWidth: 1, borderColor: colors.glassBorderLight, alignItems: 'center', justifyContent: 'center' },
  likeBtnActive: { backgroundColor: 'rgba(229,57,53,0.15)', borderColor: 'rgba(229,57,53,0.4)' },
  likeIcon: { fontSize: 24 },
  contactShareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 28, backgroundColor: 'rgba(212,175,55,0.06)',
  },
  contactShareBtnDone: { borderColor: 'rgba(46,204,113,0.3)', backgroundColor: 'rgba(46,204,113,0.06)' },
  contactShareText: { color: colors.accent, fontWeight: '700', fontSize: 14, flex: 1 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 },
  aboutText: { fontSize: 14, color: colors.textSecondary, lineHeight: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  detailItem: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder },
  detailIcon: { fontSize: 20 },
  detailLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 2 },
  detailValue: { fontSize: 12, fontWeight: '600', color: colors.text },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: colors.glassMedium, borderWidth: 1, borderColor: colors.glassBorderLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tagText: { color: colors.textSecondary, fontSize: 12, fontWeight: '500' },
  footerActions: { alignItems: 'center', marginTop: 16, borderTopWidth: 1, borderTopColor: colors.glassBorderLight, paddingTop: 24 },
  reportText: { color: colors.error, fontSize: 14, fontWeight: '600' },
});
