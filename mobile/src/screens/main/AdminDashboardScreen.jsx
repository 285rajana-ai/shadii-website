import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TextInput, Pressable,
  ActivityIndicator, Image, Alert, Modal, StatusBar, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/LightPrimitives';
import colors from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { API_BASE_URL } from '../../utils/constants';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Role Badge Label ──────────────────────────────────────────────
function roleName(role) {
  if (role === 'superadmin') return 'Super Admin';
  if (role === 'cacc') return 'CACC Officer';
  if (role === 'fasm') return 'FASM Officer';
  return 'Admin';
}

// ─── Status Badge ──────────────────────────────────────────────────
function StatusPill({ label, color = colors.primary, bg = colors.primaryLightBg }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────
export default function AdminDashboardScreen({ navigation }) {
  const { user, token } = useSelector((s) => s.auth);
  const insets = useSafeAreaInsets();

  const getInitialTab = () => {
    if (user?.role === 'cacc') return 'support';
    if (user?.role === 'fasm') return 'coupons';
    return 'verifications';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // ── Verification State ──────────────────────────────────────────
  const [verifications, setVerifications] = useState([]);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // ── Support Tickets State ───────────────────────────────────────
  const [tickets, setTickets] = useState([]);
  const [loadingSupport, setLoadingSupport] = useState(false);
  const [replyTicketId, setReplyTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // ── Promo Codes State ───────────────────────────────────────────
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

  // ── API Handlers ────────────────────────────────────────────────
  const fetchVerifications = async () => {
    setLoadingVerify(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/verifications?status=pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setVerifications(data.users || []);
    } catch {
      Alert.alert('Error', 'Failed to fetch verification queue.');
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleVerifyAction = async (userId, action) => {
    const isApprove = action === 'approve';
    Alert.prompt(
      isApprove ? 'Approve Verification' : 'Reject Verification',
      isApprove ? 'Add an optional note:' : 'Enter rejection reason:',
      async (note) => {
        try {
          const res = await fetch(`${API_BASE_URL}/admin/verify/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action, note })
          });
          const data = await res.json();
          if (data.success) {
            Alert.alert('Done', isApprove ? 'Profile verified with Blue Tick ✓' : 'Profile rejected.');
            fetchVerifications();
          }
        } catch {
          Alert.alert('Error', 'Action failed. Try again.');
        }
      },
      'plain-text'
    );
  };

  const fetchTickets = async () => {
    setLoadingSupport(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/support?status=open`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setTickets(data.tickets || []);
    } catch {
      Alert.alert('Error', 'Failed to load support tickets.');
    } finally {
      setLoadingSupport(false);
    }
  };

  const submitTicketReply = async (ticketId) => {
    if (!replyText.trim()) return Alert.alert('Empty', 'Reply cannot be blank.');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/support/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply: replyText })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Sent', 'Reply submitted successfully.');
        setReplyTicketId(null);
        setReplyText('');
        fetchTickets();
      }
    } catch {
      Alert.alert('Error', 'Reply failed.');
    }
  };

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setCoupons(data.coupons || []);
    } catch {
      Alert.alert('Error', 'Failed to load promo codes.');
    } finally {
      setLoadingCoupons(false);
    }
  };

  const createPromoCode = async () => {
    if (!promoCode.trim() || !discountPct.trim()) return Alert.alert('Missing', 'Enter both code and discount %.');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: promoCode.toUpperCase(), discountPercent: Number(discountPct) })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Created', `Promo code "${promoCode.toUpperCase()}" is now active.`);
        setPromoCode('');
        setDiscountPct('');
        fetchCoupons();
      }
    } catch {
      Alert.alert('Error', 'Could not create promo code.');
    }
  };

  const deletePromoCode = (id) => {
    Alert.alert('Delete Promo Code', 'Remove this promotion permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
              Alert.alert('Deleted', 'Promo code removed.');
              fetchCoupons();
            }
          } catch {
            Alert.alert('Error', 'Failed to delete promo.');
          }
        }
      }
    ]);
  };

  // ── Tab Configuration ────────────────────────────────────────────
  const allTabs = [
    { id: 'verifications', label: 'ID Verify', icon: 'shield-check', roles: ['admin', 'superadmin'] },
    { id: 'support', label: 'Support', icon: 'headset', roles: ['cacc', 'superadmin'] },
    { id: 'coupons', label: 'Promotions', icon: 'tag-multiple', roles: ['fasm', 'superadmin'] },
  ];
  const tabs = allTabs.filter(t => t.roles.includes(user?.role));

  // ── Render ───────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#800020" />

      {/* ── HEADER ── */}
      <LinearGradient
        colors={['#800020', '#5C0010', '#3A000A']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerTop}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={22} color="rgba(255,255,255,0.9)" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerEyebrow}>{roleName(user?.role)}</Text>
            <Text style={styles.headerTitle}>Admin Console</Text>
          </View>
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name="shield-crown" size={12} color="#C5A059" />
            <Text style={styles.roleBadgeText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        {/* User Info Strip */}
        <View style={styles.userStrip}>
          <MaterialCommunityIcons name="account-circle" size={18} color="rgba(255,255,255,0.6)" />
          <Text style={styles.userStripName}>{user?.name}</Text>
          <Text style={styles.userStripEmail}>· {user?.email}</Text>
        </View>
      </LinearGradient>

      {/* ── TAB BAR ── */}
      {tabs.length > 1 && (
        <View style={styles.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {tabs.map((t) => {
              const active = activeTab === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setActiveTab(t.id)}
                  style={[styles.tab, active && styles.tabActive]}
                >
                  <MaterialCommunityIcons
                    name={t.icon}
                    size={16}
                    color={active ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── CONTENT ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── 1. ID VERIFICATIONS ── */}
        {activeTab === 'verifications' && (
          <View>
            <SectionHeader icon="shield-check-outline" title="Verification Queue" subtitle="Pending government ID reviews" />
            {loadingVerify ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : verifications.length === 0 ? (
              <EmptyCard icon="shield-check" message="Verification queue is empty. All identities reviewed." />
            ) : (
              verifications.map((v) => (
                <View key={v._id} style={styles.itemCard}>
                  {/* Person Header */}
                  <View style={styles.itemCardHeader}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarInitial}>{v.name?.[0]?.toUpperCase() || '?'}</Text>
                    </View>
                    <View style={styles.itemCardInfo}>
                      <Text style={styles.itemCardName}>{v.name}</Text>
                      <Text style={styles.itemCardMeta}>{v.gender?.toUpperCase()} · Age {v.age} · {v.city}</Text>
                    </View>
                    <StatusPill label="Pending" color="#B7791F" bg="#FEF3C7" />
                  </View>

                  {/* CNIC Document thumbnails */}
                  {(v.cnicFront || v.cnicBack || v.livePhoto) && (
                    <View style={styles.docRow}>
                      {v.cnicFront && (
                        <Pressable style={styles.docThumb} onPress={() => setLightboxUrl(v.cnicFront)}>
                          <Image source={{ uri: v.cnicFront }} style={styles.docImg} />
                          <Text style={styles.docLabel}>CNIC Front</Text>
                        </Pressable>
                      )}
                      {v.cnicBack && (
                        <Pressable style={styles.docThumb} onPress={() => setLightboxUrl(v.cnicBack)}>
                          <Image source={{ uri: v.cnicBack }} style={styles.docImg} />
                          <Text style={styles.docLabel}>CNIC Back</Text>
                        </Pressable>
                      )}
                      {v.livePhoto && (
                        <Pressable style={styles.docThumb} onPress={() => setLightboxUrl(v.livePhoto)}>
                          <Image source={{ uri: v.livePhoto }} style={styles.docImg} />
                          <Text style={styles.docLabel}>Live Photo</Text>
                        </Pressable>
                      )}
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionRow}>
                    <Pressable
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleVerifyAction(v._id, 'reject')}
                    >
                      <MaterialCommunityIcons name="close-circle-outline" size={15} color={colors.error} />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleVerifyAction(v._id, 'approve')}
                    >
                      <MaterialCommunityIcons name="check-decagram" size={15} color="#FFFFFF" />
                      <Text style={styles.approveBtnText}>Grant Blue Tick</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ── 2. SUPPORT TICKETS ── */}
        {activeTab === 'support' && (
          <View>
            <SectionHeader icon="headset" title="Support Queue" subtitle="Open user help requests" />
            {loadingSupport ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : tickets.length === 0 ? (
              <EmptyCard icon="check-circle-outline" message="All support tickets are resolved! Clean desk." />
            ) : (
              tickets.map((t) => (
                <View key={t._id} style={styles.itemCard}>
                  <View style={styles.itemCardHeader}>
                    <View style={[styles.avatarCircle, { backgroundColor: '#E0F0FF' }]}>
                      <Text style={[styles.avatarInitial, { color: colors.info }]}>{t.user?.name?.[0]?.toUpperCase() || '?'}</Text>
                    </View>
                    <View style={styles.itemCardInfo}>
                      <Text style={styles.itemCardName}>{t.user?.name || 'Deleted User'}</Text>
                      <Text style={styles.itemCardMeta}>{t.user?.email || 'N/A'}</Text>
                    </View>
                    <StatusPill label="Open" color={colors.info} bg="#EFF6FF" />
                  </View>

                  <View style={styles.ticketBody}>
                    <Text style={styles.ticketSubject}>Subject: {t.subject}</Text>
                    <Text style={styles.ticketMessage}>"{t.message}"</Text>
                  </View>

                  {replyTicketId === t._id ? (
                    <View style={styles.replyBox}>
                      <TextInput
                        multiline
                        numberOfLines={3}
                        value={replyText}
                        onChangeText={setReplyText}
                        placeholder="Write your support response..."
                        placeholderTextColor={colors.textMuted}
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
                          <MaterialCommunityIcons name="send" size={14} color="#fff" />
                          <Text style={styles.approveBtnText}>Send Reply</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.replyTrigger}
                      onPress={() => { setReplyTicketId(t._id); setReplyText(''); }}
                    >
                      <MaterialCommunityIcons name="reply" size={15} color={colors.primary} />
                      <Text style={styles.replyTriggerText}>Compose Response</Text>
                    </Pressable>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* ── 3. PROMO COUPONS ── */}
        {activeTab === 'coupons' && (
          <View>
            <SectionHeader icon="tag-multiple" title="Promo Codes" subtitle="Create & manage discount promotions" />

            {/* Create Form */}
            <View style={styles.itemCard}>
              <Text style={styles.formSectionLabel}>Generate New Code</Text>
              <TextInput
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="CODE (e.g. SAVE25)"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                style={styles.formInput}
              />
              <TextInput
                value={discountPct}
                onChangeText={setDiscountPct}
                placeholder="Discount % (1–100)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={[styles.formInput, { marginTop: 8 }]}
              />
              <Pressable style={styles.createBtn} onPress={createPromoCode}>
                <MaterialCommunityIcons name="tag-plus" size={16} color="#fff" />
                <Text style={styles.createBtnText}>Generate Promo Code</Text>
              </Pressable>
            </View>

            <SectionHeader icon="ticket-percent" title="Active Promotions" subtitle={`${coupons.length} codes in registry`} />
            {loadingCoupons ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : coupons.length === 0 ? (
              <EmptyCard icon="tag-off-outline" message="No promo codes active yet. Create one above." />
            ) : (
              coupons.map((c) => (
                <View key={c._id} style={[styles.itemCard, styles.couponCard]}>
                  <View style={styles.couponLeft}>
                    <View style={styles.couponBadgeWrap}>
                      <MaterialCommunityIcons name="ticket-percent" size={18} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.couponCode}>{c.code}</Text>
                      <Text style={styles.couponMeta}>{c.discountPercent}% off · 30-day validity</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => deletePromoCode(c._id)} style={styles.deleteBtn}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>

      {/* ── LIGHTBOX MODAL ── */}
      <Modal transparent visible={!!lightboxUrl} animationType="fade" onRequestClose={() => setLightboxUrl(null)}>
        <View style={styles.lightboxBg}>
          <Pressable style={styles.lightboxClose} onPress={() => setLightboxUrl(null)}>
            <MaterialCommunityIcons name="close-circle" size={32} color="rgba(255,255,255,0.9)" />
          </Pressable>
          <Image source={{ uri: lightboxUrl }} style={styles.lightboxImg} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrap}>
        <MaterialCommunityIcons name={icon} size={18} color={colors.primary} />
      </View>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function EmptyCard({ icon, message }) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconWrap}>
        <MaterialCommunityIcons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F3EF',
  },

  // ── Header
  header: {
    paddingBottom: 16,
    paddingHorizontal: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerCenter: {
    flex: 1,
  },
  headerEyebrow: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(197,160,89,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(197,160,89,0.35)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  roleBadgeText: {
    color: '#C5A059',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  userStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userStripName: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
  },
  userStripEmail: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
  },

  // ── Tab Bar
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primaryLightBg,
    borderColor: colors.primary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
  },

  // ── Scroll Content
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  loader: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },

  // ── Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightBg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },

  // ── Item Cards
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#1D1A16',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightBg,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  itemCardInfo: {
    flex: 1,
  },
  itemCardName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  itemCardMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  // ── Status Pill
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  // ── Document Thumbnails
  docRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  docThumb: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  docImg: {
    width: '100%',
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceLight,
  },
  docLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: radius.lg,
  },
  rejectBtn: {
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: '#FFF7F7',
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.error,
  },
  approveBtn: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  approveBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },

  // ── Support Ticket
  ticketBody: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: 10,
  },
  ticketSubject: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  ticketMessage: {
    fontSize: 12,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  replyTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  replyTriggerText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  replyBox: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: 4,
    gap: 8,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: 13,
    color: colors.text,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 80,
  },

  // ── Coupon Cards
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  couponBadgeWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightBg,
  },
  couponCode: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  couponMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F1',
  },

  // ── Promo Form
  formSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.surfaceLight,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 12,
    marginTop: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // ── Empty State
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightBg,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Lightbox
  lightboxBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxClose: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
  },
  lightboxImg: {
    width: SCREEN_W - 40,
    height: '70%',
  },
});
