import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Clipboard, Dimensions, Image, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import colors from '../../theme/colors';
import { API_BASE_URL } from '../../utils/constants';

const { width } = Dimensions.get('window');

export default function ProfileDetailScreen({ route, navigation }) {
  const { userId } = route.params;
  const isAndroidPlayBilling = Platform.OS === 'android';
  const { token, user } = useSelector((s) => s.auth);
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [photoViewRequested, setPhotoViewRequested] = useState(false);
  const [requestingPhoto, setRequestingPhoto] = useState(false);
  const [contactShareRequested, setContactShareRequested] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockInstructions, setUnlockInstructions] = useState(null);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockPending, setUnlockPending] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        // Sync contact request state from server
        if (data.profile.contactRequestStatus) {
          setContactShareRequested(true);
        }
        if (data.profile.contactUnlocked) {
          setUnlockPending(false);
        }
        if (data.profile.photoRequestStatus) {
          setPhotoViewRequested(data.profile.photoRequestStatus === 'pending');
        }
      }
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

  // ── Contact unlock payment flow ─────────────────────────────────────────────
  const handleUnlockContact = async () => {
    if (!user?.subscription?.isActive) {
      Alert.alert('Subscription Required', 'You need an active subscription to unlock contacts.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Plans', onPress: () => navigation.navigate('Plans') },
      ]);
      return;
    }

    if (isAndroidPlayBilling) {
      navigation.navigate('Payment', {
        plan: {
          id: 'contact_unlock',
          name: 'Contact Unlock',
          price: 299,
          duration: 'One-time',
          features: [`Unlock ${profile?.name || 'this profile'}\'s phone number`, 'Secure checkout via Google Play Billing'],
        },
        targetUserId: userId,
      });
      return;
    }

    setUnlockLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/profile/${userId}/contact-unlock-payment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.alreadyUnlocked) {
        // refresh profile to get phone
        await fetchProfile();
        return;
      }
      if (data.success) {
        setUnlockInstructions(data);
        setShowUnlockModal(true);
      } else {
        Alert.alert('Cannot Unlock', data.message || 'Unable to initiate payment.');
      }
    } catch (_) {
      Alert.alert('Error', 'Could not initiate unlock. Please try again.');
    } finally {
      setUnlockLoading(false);
    }
  };

  const handleUnlockModalClose = () => {
    setShowUnlockModal(false);
    setUnlockPending(true); // show pending state on button
  };

  const handleMessage = () => {
    if (profile.photoRequestStatus !== 'accepted') {
      if (profile.photoRequestStatus === 'pending') {
        Alert.alert('Connection Pending', 'Your connection request is still pending approval.');
      } else {
        handlePhotoViewRequest();
      }
      return;
    }
    navigation.navigate('ChatDetail', { userId: profile._id, userName: profile.name, isOnline: profile.isOnline, lastActive: profile.lastActive });
  };

  const handlePhotoViewRequest = async () => {
    setRequestingPhoto(true);
    try {
      const res = await fetch(`${API_BASE_URL}/profile/${userId}/request-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPhotoViewRequested(true);
        setProfile(prev => prev ? { ...prev, photoRequestStatus: 'pending' } : null);
        const isFree = !user?.subscription?.isActive;
        const msg = isFree 
          ? 'Your connection request has been sent! Free accounts can send exactly 1 message request once connected. Upgrade to premium for unlimited chatting.'
          : 'Your connection request has been sent! You will be notified when they accept.';
        Alert.alert('Request Sent ✓', msg);
      } else {
        Alert.alert('Already Requested', data.message || 'You have already sent a connection request.');
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to send connection request. Please try again.');
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
              <Text style={styles.blurText}>Profile is private</Text>
              {photoViewRequested ? (
                <View style={styles.requestedBadge}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.requestedText}>Request Pending</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.requestViewBtn}
                  onPress={handlePhotoViewRequest}
                  disabled={requestingPhoto}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={colors.gradients.primary} style={styles.requestViewBtnGrad}>
                    <MaterialCommunityIcons name="link-variant" size={16} color="#fff" />
                    <Text style={styles.requestViewBtnText}>
                      {requestingPhoto ? 'Sending...' : 'Connect to View & Chat'}
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
              <LinearGradient
                colors={profile.photoRequestStatus === 'accepted' ? colors.gradients.primary : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                style={styles.btnGradient}
              >
                <MaterialCommunityIcons
                  name={profile.photoRequestStatus === 'accepted' ? 'message-text' : profile.photoRequestStatus === 'pending' ? 'clock-outline' : 'message-text-lock'}
                  size={18}
                  color={profile.photoRequestStatus === 'accepted' ? '#fff' : colors.textMuted}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.msgBtnText, profile.photoRequestStatus !== 'accepted' && { color: colors.textMuted }]}>
                  {profile.photoRequestStatus === 'accepted' ? 'Send Message' : profile.photoRequestStatus === 'pending' ? 'Connection Pending' : 'Request Connection to Chat'}
                </Text>
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

          {/* Contact Share / Unlock Flow removed */}

          {/* Contact Unlock Payment Modal */}
          {!isAndroidPlayBilling && (
            <Modal
              visible={showUnlockModal}
              transparent
              animationType="slide"
              onRequestClose={handleUnlockModalClose}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.paymentModal}>
                  <LinearGradient colors={['#1A000A', '#100808']} style={StyleSheet.absoluteFill} />
                  <View style={styles.paymentModalHandle} />
                  <Text style={styles.paymentModalTitle}>Unlock Contact — PKR 299</Text>
                  <Text style={styles.paymentModalSub}>
                    Transfer PKR 299 to the account below and include the reference number. Admin will verify and unlock contact within 24 hours.
                  </Text>

                  {unlockInstructions?.paymentInstructions && (
                    <View style={styles.paymentDetails}>
                      {[
                        { label: 'Account Title', value: unlockInstructions.paymentInstructions.accountTitle },
                        { label: 'Account Number', value: unlockInstructions.paymentInstructions.accountNumber },
                        unlockInstructions.paymentInstructions.iban ? { label: 'IBAN', value: unlockInstructions.paymentInstructions.iban } : null,
                        { label: 'Bank', value: unlockInstructions.paymentInstructions.bankName },
                        { label: 'Reference (MUST include)', value: unlockInstructions.paymentInstructions.reference },
                        { label: 'Amount', value: 'PKR 299' },
                        { label: 'Support', value: unlockInstructions.paymentInstructions.supportEmail },
                      ].filter(Boolean).map((row) => (
                        <View key={row.label} style={styles.paymentRow}>
                          <Text style={styles.paymentRowLabel}>{row.label}</Text>
                          <TouchableOpacity
                            onPress={() => { Clipboard.setString(row.value); Alert.alert('Copied!', `${row.label} copied.`); }}
                            activeOpacity={0.7}
                            style={styles.paymentRowValueBox}
                          >
                            <Text style={styles.paymentRowValue}>{row.value}</Text>
                            <MaterialCommunityIcons name="content-copy" size={14} color={colors.accent} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.paymentDoneBtn}
                    onPress={handleUnlockModalClose}
                    activeOpacity={0.8}
                  >
                    <LinearGradient colors={colors.gradients.primary} style={StyleSheet.absoluteFill} />
                    <Text style={styles.paymentDoneBtnText}>I've Sent the Payment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
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
  contactShareText: { color: colors.accent, fontWeight: '700', fontSize: 14 },
  contactUnlockSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  contactUnlockedCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(5,205,153,0.35)',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 28, overflow: 'hidden',
  },
  contactUnlockedLabel: { fontSize: 11, color: colors.success, fontWeight: '600', marginBottom: 2 },
  contactUnlockedPhone: { fontSize: 18, color: colors.text, fontWeight: '800', letterSpacing: 1 },
  // Payment modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  paymentModal: {
    backgroundColor: '#1A000A',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, overflow: 'hidden',
    borderTopWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
  },
  paymentModalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center', marginBottom: 20,
  },
  paymentModalTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 8 },
  paymentModalSub: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: 20 },
  paymentDetails: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16, padding: 16, gap: 12, marginBottom: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentRowLabel: { fontSize: 12, color: colors.textMuted, flex: 1 },
  paymentRowValueBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paymentRowValue: { fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'right', maxWidth: 200 },
  paymentDoneBtn: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    overflow: 'hidden',
  },
  paymentDoneBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
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
