import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TextInput, Pressable, 
  ActivityIndicator, Image, Alert, Modal, StatusBar 
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground, Card } from '../../components/ui/LightPrimitives';
import colors from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { API_BASE_URL } from '../../utils/constants';

export default function AdminDashboardScreen({ navigation }) {
  const { user, token } = useSelector((s) => s.auth);
  const insets = useSafeAreaInsets();

  // Selected sub-tab within mobile admin panel
  // By default, open the tab matching their role
  const getInitialTab = () => {
    if (user?.role === 'cacc') return 'support';
    if (user?.role === 'fasm') return 'coupons';
    return 'verifications'; // default for admin and superadmin
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Verification List State (Admin)
  const [verifications, setVerifications] = useState([]);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // Support Tickets State (CACC)
  const [tickets, setTickets] = useState([]);
  const [loadingSupport, setLoadingSupport] = useState(false);
  const [replyTicketId, setReplyTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Promo Code State (FASM)
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPct, setDiscountPct] = useState('');

  useEffect(() => {
    if (activeTab === 'verifications' && ['admin', 'superadmin'].includes(user?.role)) {
      fetchVerifications();
    } else if (activeTab === 'support' && ['cacc', 'superadmin'].includes(user?.role)) {
      fetchTickets();
    } else if (activeTab === 'coupons' && ['fasm', 'superadmin'].includes(user?.role)) {
      fetchCoupons();
    }
  }, [activeTab]);

  // --- VERIFICATION HANDLERS (Admin) ---
  const fetchVerifications = async () => {
    setLoadingVerify(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/verifications?status=pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setVerifications(data.users || []);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch verification queue.');
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleVerifyAction = async (userId, action) => {
    const isApprove = action === 'approve';
    Alert.prompt(
      isApprove ? 'Approve Verification' : 'Reject Verification',
      isApprove ? 'Optionally add a note:' : 'Enter rejection reason:',
      async (note) => {
        try {
          const res = await fetch(`${API_BASE_URL}/admin/verify/${userId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ action, note })
          });
          const data = await res.json();
          if (data.success) {
            Alert.alert('Success', `Verification request ${isApprove ? 'approved' : 'rejected'}.`);
            fetchVerifications();
          } else {
            Alert.alert('Error', data.message || 'Operation failed.');
          }
        } catch (err) {
          Alert.alert('Error', 'Connection failed.');
        }
      }
    );
  };

  // --- SUPPORT HELPDESK HANDLERS (CACC) ---
  const fetchTickets = async () => {
    setLoadingSupport(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/support?status=open`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch support tickets.');
    } finally {
      setLoadingSupport(false);
    }
  };

  const submitTicketReply = async (ticketId) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/support/${ticketId}/reply`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ replyMessage: replyText })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Reply submitted & ticket resolved.');
        setReplyText('');
        setReplyTicketId(null);
        fetchTickets();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to send reply.');
    }
  };

  // --- PROMO COUPONS HANDLERS (FASM) ---
  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch coupons list.');
    } finally {
      setLoadingCoupons(false);
    }
  };

  const createPromoCode = async () => {
    if (!promoCode || !discountPct) return;
    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30); // 30 days validity default

      const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: promoCode.toUpperCase().trim(),
          discountPercent: Number(discountPct),
          expiryDate: expiry.toISOString()
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', `Promo code ${promoCode} created!`);
        setPromoCode('');
        setDiscountPct('');
        fetchCoupons();
      } else {
        Alert.alert('Error', data.message || 'Failed to create promo.');
      }
    } catch (err) {
      Alert.alert('Error', 'Connection failed.');
    }
  };

  const deletePromoCode = async (id) => {
    Alert.alert('Delete Coupon', 'Are you sure you want to delete this promo code?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
              Alert.alert('Success', 'Promo code deleted.');
              fetchCoupons();
            }
          } catch (err) {
            Alert.alert('Error', 'Failed to delete promo.');
          }
        }
      }
    ]);
  };

  // --- UI TAB SELECTOR ROWS ---
  const renderTabs = () => {
    const tabsList = [];
    if (['admin', 'superadmin'].includes(user?.role)) {
      tabsList.push({ id: 'verifications', label: 'Verifications', icon: 'shield-check-outline' });
    }
    if (['cacc', 'superadmin'].includes(user?.role)) {
      tabsList.push({ id: 'support', label: 'Support Queue', icon: 'help-circle-outline' });
    }
    if (['fasm', 'superadmin'].includes(user?.role)) {
      tabsList.push({ id: 'coupons', label: 'Promo Coupons', icon: 'tag-outline' });
    }

    if (tabsList.length <= 1) return null; // No need for tabs selector if only one role

    return (
      <View style={styles.tabRow}>
        {tabsList.map((t) => {
          const active = activeTab === t.id;
          return (
            <Pressable 
              key={t.id}
              onPress={() => setActiveTab(t.id)}
              style={[styles.tabButton, active && styles.tabButtonActive]}
            >
              <MaterialCommunityIcons name={t.icon} size={18} color={active ? colors.primary : colors.textMuted} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.eyebrow}>{user?.role?.toUpperCase()} CONTROL</Text>
          <Text style={styles.title}>Admin Panel</Text>
        </View>
      </View>

      {renderTabs()}

      {/* Main View Area */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* 1. ID VERIFICATIONS TAB */}
        {activeTab === 'verifications' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verification Requests Queue</Text>
            {loadingVerify ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : verifications.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>Verification queue is empty. No pending checks.</Text>
              </Card>
            ) : (
              verifications.map((v) => (
                <Card key={v._id} style={styles.verifyItem}>
                  <View style={styles.verifyItemHeader}>
                    <Text style={styles.verifyName}>{v.name}</Text>
                    <Text style={styles.verifyMeta}>{v.gender?.toUpperCase()} · Age {v.age} · {v.city}</Text>
                  </View>
                  
                  {/* CNIC Images & Live Photo preview thumbnails */}
                  <View style={styles.photoGrid}>
                    {v.cnicFront ? (
                      <Pressable style={styles.photoThumbWrap} onPress={() => setLightboxUrl(v.cnicFront)}>
                        <Image source={{ uri: v.cnicFront }} style={styles.photoThumb} />
                        <Text style={styles.photoThumbLabel}>CNIC Front</Text>
                      </Pressable>
                    ) : null}
                    {v.cnicBack ? (
                      <Pressable style={styles.photoThumbWrap} onPress={() => setLightboxUrl(v.cnicBack)}>
                        <Image source={{ uri: v.cnicBack }} style={styles.photoThumb} />
                        <Text style={styles.photoThumbLabel}>CNIC Back</Text>
                      </Pressable>
                    ) : null}
                    {v.livePhoto ? (
                      <Pressable style={styles.photoThumbWrap} onPress={() => setLightboxUrl(v.livePhoto)}>
                        <Image source={{ uri: v.livePhoto }} style={styles.photoThumb} />
                        <Text style={styles.photoThumbLabel}>Live Photo</Text>
                      </Pressable>
                    ) : null}
                  </View>

                  <View style={styles.actionRow}>
                    <Pressable 
                      style={[styles.actionBtn, styles.rejectBtn]} 
                      onPress={() => handleVerifyAction(v._id, 'reject')}
                    >
                      <Text style={styles.rejectBtnText}>Reject Request</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.actionBtn, styles.approveBtn]} 
                      onPress={() => handleVerifyAction(v._id, 'approve')}
                    >
                      <Text style={styles.approveBtnText}>Verify (Blue Tick)</Text>
                    </Pressable>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* 2. SUPPORT QUEUE TAB */}
        {activeTab === 'support' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Open Support Tickets</Text>
            {loadingSupport ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : tickets.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>All support tickets resolved! Clean desk.</Text>
              </Card>
            ) : (
              tickets.map((t) => (
                <Card key={t._id} style={styles.ticketItem}>
                  <View style={styles.verifyItemHeader}>
                    <Text style={styles.ticketUser}>From: {t.user?.name || 'Deleted User'}</Text>
                    <Text style={styles.verifyMeta}>{t.user?.email || 'N/A'}</Text>
                  </View>
                  <View style={styles.ticketContent}>
                    <Text style={styles.ticketSubject}>Subject: {t.subject}</Text>
                    <Text style={styles.ticketMsg}>"{t.message}"</Text>
                  </View>

                  {replyTicketId === t._id ? (
                    <View style={styles.replyBox}>
                      <TextInput
                        multiline
                        numberOfLines={3}
                        value={replyText}
                        onChangeText={setReplyText}
                        placeholder="Write support resolution reply..."
                        style={styles.replyInput}
                      />
                      <View style={styles.actionRow}>
                        <Pressable 
                          style={[styles.actionBtn, styles.cancelBtn]} 
                          onPress={() => { setReplyTicketId(null); setReplyText(''); }}
                        >
                          <Text style={styles.cancelBtnText}>Cancel</Text>
                        </Pressable>
                        <Pressable 
                          style={[styles.actionBtn, styles.approveBtn]} 
                          onPress={() => submitTicketReply(t._id)}
                        >
                          <Text style={styles.approveBtnText}>Submit Reply</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Pressable 
                      style={styles.replyTrigger}
                      onPress={() => { setReplyTicketId(t._id); setReplyText(''); }}
                    >
                      <MaterialCommunityIcons name="reply" size={16} color={colors.primary} />
                      <Text style={styles.replyTriggerText}>Compose Response</Text>
                    </Pressable>
                  )}
                </Card>
              ))
            )}
          </View>
        )}

        {/* 3. PROMO COUPONS TAB */}
        {activeTab === 'coupons' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Generate Promotion Code</Text>
            <Card style={styles.promoForm}>
              <TextInput
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="PROMO CODE (e.g. SAVE25)"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                style={styles.formInput}
              />
              <TextInput
                value={discountPct}
                onChangeText={setDiscountPct}
                placeholder="Discount Percentage (1-100)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={styles.formInput}
              />
              <Pressable style={styles.submitCodeBtn} onPress={createPromoCode}>
                <Text style={styles.submitCodeText}>Generate Code</Text>
              </Pressable>
            </Card>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Active Promo Registries</Text>
            {loadingCoupons ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : coupons.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No promo codes defined yet.</Text>
              </Card>
            ) : (
              coupons.map((c) => (
                <Card key={c._id} style={styles.couponItem}>
                  <View>
                    <Text style={styles.couponCode}>{c.code}</Text>
                    <Text style={styles.couponMeta}>{c.discountPercent}% Discount · Expires 30 days</Text>
                  </View>
                  <Pressable onPress={() => deletePromoCode(c._id)} style={styles.deleteIcon}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
                  </Pressable>
                </Card>
              ))
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fullscreen Lightbox Modal */}
      {lightboxUrl && (
        <Modal transparent visible={!!lightboxUrl} animationType="fade">
          <View style={styles.lightboxBg}>
            <Pressable style={styles.lightboxClose} onPress={() => setLightboxUrl(null)}>
              <Text style={styles.lightboxCloseText}>✕ CLOSE</Text>
            </Pressable>
            <Image source={{ uri: lightboxUrl }} style={styles.lightboxImg} resizeMode="contain" />
          </View>
        </Modal>
      )}
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitleWrap: {
    flex: 1,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLightBg,
    borderColor: colors.primary,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  loader: {
    marginTop: spacing.xl,
  },
  verifyItem: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  verifyItemHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
    marginBottom: spacing.sm,
  },
  verifyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  verifyMeta: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  photoThumbWrap: {
    flex: 1,
    alignItems: 'center',
  },
  photoThumb: {
    width: '100%',
    height: 70,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceLight,
  },
  photoThumbLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: 'transparent',
  },
  rejectBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.error,
  },
  approveBtn: {
    backgroundColor: colors.primary,
  },
  approveBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  ticketItem: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  ticketUser: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  ticketContent: {
    padding: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  ticketSubject: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  ticketMsg: {
    fontSize: 11,
    color: colors.text,
    fontStyle: 'italic',
  },
  replyTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
  },
  replyTriggerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
  },
  replyBox: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: 11,
    color: colors.text,
    backgroundColor: '#FFFFFF',
    marginBottom: spacing.sm,
    textAlignVertical: 'top',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  promoForm: {
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 12,
    color: colors.text,
    backgroundColor: '#FFFFFF',
  },
  submitCodeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitCodeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  couponItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  couponCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 1,
  },
  couponMeta: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  deleteIcon: {
    padding: spacing.xs,
  },
  lightboxBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  lightboxCloseText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  lightboxImg: {
    width: '90%',
    height: '75%',
  }
});
