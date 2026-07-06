import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { AppBackground, Card, TrustBadge } from '../../components/ui/LightPrimitives';
import colors from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { API_BASE_URL } from '../../utils/constants';

export default function ProfileDetailScreen({ route, navigation }) {
  const { userId } = route.params;
  const { token, user } = useSelector((s) => s.auth);
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [requestingPhoto, setRequestingPhoto] = useState(false);
  const [photoViewRequested, setPhotoViewRequested] = useState(false);
  const [contactShareRequested, setContactShareRequested] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockPending, setUnlockPending] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setContactShareRequested(Boolean(data.profile.contactRequestStatus));
        setPhotoViewRequested(data.profile.photoRequestStatus === 'pending');
        setUnlockPending(false);
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
        setProfile((prev) => prev ? { ...prev, photoRequestStatus: 'pending' } : null);
        Alert.alert('Request sent', 'You will be notified when the profile accepts your connection request.');
      } else {
        Alert.alert('Info', data.message || 'You have already sent a request.');
      }
    } catch (_) {
      Alert.alert('Error', 'Unable to send request. Please try again.');
    } finally {
      setRequestingPhoto(false);
    }
  };

  const handleMessage = () => {
    navigation.navigate('ChatDetail', {
      userId: profile._id,
      userName: profile.name,
      isOnline: profile.isOnline,
      lastActive: profile.lastActive,
    });
  };

  const handleContactShareRequest = async () => {
    if (!user?.subscription?.isActive) {
      Alert.alert('Subscription required', 'Only subscribers can request contact sharing.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View plans', onPress: () => navigation.navigate('Plans') },
      ]);
      return;
    }
    Alert.alert('Request contact share', `Send a contact share request to ${profile.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send request',
        onPress: async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/profile/${userId}/contact-request`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
              setContactShareRequested(true);
              Alert.alert('Request sent', 'You can unlock contact details after they approve.');
            } else {
              Alert.alert('Info', data.message || 'Request already sent.');
            }
          } catch (_) {
            Alert.alert('Error', 'Could not send contact request.');
          }
        },
      },
    ]);
  };

  const handleUnlockContact = async () => {
    if (!user?.subscription?.isActive) {
      Alert.alert('Subscription required', 'You need an active subscription to unlock contacts.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View plans', onPress: () => navigation.navigate('Plans') },
      ]);
      return;
    }

    if (Platform.OS === 'android') {
      navigation.navigate('Payment', {
        plan: {
          id: 'contact_unlock',
          name: 'Contact Unlock',
          price: 299,
          duration: 'One-time',
          features: [`Unlock ${profile?.name || 'this profile'}'s phone number`, 'Secure checkout via Google Play Billing'],
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
        await fetchProfile();
      } else if (data.success) {
        setUnlockPending(true);
        Alert.alert('Payment instructions', 'Transfer PKR 299 using the provided admin instructions. Contact will unlock after verification.');
      } else {
        Alert.alert('Cannot unlock', data.message || 'Unable to initiate payment.');
      }
    } catch (_) {
      Alert.alert('Error', 'Could not initiate unlock. Please try again.');
    } finally {
      setUnlockLoading(false);
    }
  };

  if (loading) {
    return (
      <AppBackground style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </AppBackground>
    );
  }

  if (!profile) {
    return (
      <AppBackground style={styles.center}>
        <Text style={styles.emptyText}>Profile not found</Text>
      </AppBackground>
    );
  }

  const canChat = profile.photoRequestStatus === 'accepted';
  const contactUnlocked = profile.contactUnlocked && profile.phone;

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          {profile.photo && !profile.isPhotoBlurred ? (
            <Image source={{ uri: profile.photo }} style={styles.photo} />
          ) : (
            <View style={styles.photoFallback}>
              <Text style={styles.initial}>{profile.name?.[0] || '?'}</Text>
              {profile.isPhotoBlurred ? <Text style={styles.privatePhotoText}>Private photo</Text> : null}
            </View>
          )}
          <Pressable style={[styles.backButton, { top: insets.top + 10 }]} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Pressable style={[styles.likeButton, { top: insets.top + 10 }]} onPress={handleLike}>
            <MaterialCommunityIcons name={liked ? 'heart' : 'heart-outline'} size={23} color={liked ? colors.error : colors.text} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Card style={styles.identity}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.name}, {profile.age}</Text>
              {profile.isVerified ? <MaterialCommunityIcons name="check-decagram" size={22} color={colors.success} /> : null}
            </View>
            <Text style={styles.meta}>{profile.city || 'Pakistan'}{profile.country ? `, ${profile.country}` : ''}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.activeDot, { backgroundColor: profile.isOnline ? colors.online : colors.textMuted }]} />
              <Text style={styles.statusText}>{profile.isOnline ? 'Online now' : 'Recently active'}</Text>
            </View>
            <View style={styles.badges}>
              {profile.isVerified ? <TrustBadge icon="check-decagram" label="Verified" tone="trust" /> : null}
              {profile.isPremium ? <TrustBadge icon="crown-outline" label="Premium" /> : null}
            </View>
          </Card>

          <VerificationSummary profile={profile} />

          <View style={styles.actions}>
            <PrimaryButton
              label={canChat ? 'Send message' : 'Send intro'}
              icon={canChat ? 'message-text-outline' : 'message-plus-outline'}
              onPress={handleMessage}
              style={styles.actionMain}
            />
            <PrimaryButton
              label="Report"
              variant="secondary"
              icon="flag-outline"
              onPress={() => navigation.navigate('Report', { userId: profile._id })}
              style={styles.actionSide}
            />
          </View>

          <InfoSection title="Profile details" rows={[
            ['Region', profile.region],
            ['City', profile.city],
            ['Country', profile.country],
            ['Education', profile.education],
            ['Height', profile.height],
            ['Marital status', profile.maritalStatus],
            ['Religion', profile.religion],
            ['Sect', profile.sect],
            ['Community', profile.cast],
            ['Mother tongue', profile.motherTongue],
          ]} />

          {profile.about ? (
            <Card style={styles.aboutCard}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.aboutText}>{profile.about}</Text>
            </Card>
          ) : null}

          <Card style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <MaterialCommunityIcons name="phone-lock-outline" size={24} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.contactTitle}>Contact sharing</Text>
                <Text style={styles.contactText}>Phone details unlock only after approval and payment.</Text>
              </View>
            </View>
            {contactUnlocked ? (
              <View style={styles.phoneBox}>
                <Text style={styles.phoneLabel}>Phone number</Text>
                <Text style={styles.phone}>{profile.phone}</Text>
              </View>
            ) : profile.contactRequestStatus === 'accepted' ? (
              <PrimaryButton label="Unlock contact - PKR 299" icon="lock-open-outline" loading={unlockLoading} onPress={handleUnlockContact} />
            ) : contactShareRequested ? (
              <TrustBadge icon={unlockPending ? 'clock-outline' : 'clock-outline'} label={unlockPending ? 'Unlock pending' : 'Contact request pending'} />
            ) : (
              <PrimaryButton label="Request contact share" variant="secondary" icon="phone-outline" onPress={handleContactShareRequest} />
            )}
          </Card>
        </View>
      </ScrollView>
    </AppBackground>
  );
}

function VerificationSummary({ profile }) {
  const rows = [
    {
      icon: 'cellphone-check',
      label: profile.isPhoneVerified ? 'Mobile number is verified' : 'Mobile number not verified',
      active: profile.isPhoneVerified,
    },
    {
      icon: 'email-check-outline',
      label: profile.isEmailVerified ? 'Email is verified' : 'Email not verified',
      active: profile.isEmailVerified,
    },
    {
      icon: 'camera-check-outline',
      label: profile.photos?.length ? 'Profile picture added' : 'Profile picture not added',
      active: Boolean(profile.photos?.length),
    },
    {
      icon: 'card-account-details-star-outline',
      label: profile.isVerified ? 'Identity is verified' : 'Identity verification pending',
      active: profile.isVerified,
    },
  ];

  return (
    <Card style={styles.verificationCard}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Trust & verification</Text>
          <Text style={styles.sectionSub}>Signals that help families browse with confidence.</Text>
        </View>
        <MaterialCommunityIcons name="shield-check-outline" size={24} color={colors.success} />
      </View>
      {rows.map((row) => (
        <View key={row.label} style={styles.verifyRow}>
          <View style={[styles.verifyIcon, row.active && styles.verifyIconActive]}>
            <MaterialCommunityIcons name={row.icon} size={18} color={row.active ? colors.success : colors.textMuted} />
          </View>
          <Text style={styles.verifyText}>{row.label}</Text>
        </View>
      ))}
    </Card>
  );
}

function InfoSection({ title, rows }) {
  const visibleRows = rows.filter(([, value]) => value);
  if (!visibleRows.length) return null;
  return (
    <Card style={styles.infoCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {visibleRows.map(([label, value]) => (
        <View key={label} style={styles.infoRow}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: spacing.xxxl,
  },
  hero: {
    height: 420,
    backgroundColor: colors.surfaceLight,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightBg,
  },
  initial: {
    color: colors.primary,
    fontSize: 76,
    fontWeight: '900',
  },
  privatePhotoText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  likeButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  content: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    gap: spacing.md,
  },
  identity: {
    gap: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  activeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionMain: {
    flex: 1.45,
  },
  actionSide: {
    flex: 0.75,
  },
  infoCard: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionSub: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  verificationCard: {
    gap: spacing.sm,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSoft,
  },
  verifyIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  verifyIconActive: {
    backgroundColor: '#E4F6EE',
  },
  verifyText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  aboutCard: {
    gap: spacing.sm,
  },
  aboutText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  contactCard: {
    gap: spacing.md,
  },
  contactHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contactTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  contactText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  phoneBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#EEF7F2',
  },
  phoneLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  phone: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
});
