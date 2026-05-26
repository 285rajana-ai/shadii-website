import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ErrorCode, useIAP } from 'expo-iap';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import colors from '../../theme/colors';
import {
    API_BASE_URL,
    CONTACT_UNLOCK_PRICE,
    PAYMENT_METHODS,
    getPlanIdFromPlayProductId,
    getPlayProductIdForPlan,
} from '../../utils/constants';

const METHOD_ICONS = {
    google_play: { icon: 'google-play', color: '#34A853' },
    easypaisa: { icon: 'cellphone', color: '#4CAF50' },
    bank_transfer: { icon: 'bank-outline', color: '#9B59B6' },
};

function normalizePlan(routePlan) {
    if (!routePlan) {
        return null;
    }

    if (typeof routePlan === 'string') {
        if (routePlan === 'boost') {
            return {
                id: 'boost',
                name: 'Profile Boost',
                price: 500,
                duration: '3 Days',
            };
        }

        return {
            id: routePlan,
            name: routePlan,
            price: 0,
            duration: 'One-time',
        };
    }

    return routePlan;
}

export default function PaymentScreen({ route, navigation }) {
    const plan = normalizePlan(route.params?.plan);
    const targetUserId = route.params?.targetUserId || null;
    const isAndroidPlayBilling = Platform.OS === 'android';
    const visibleMethods = isAndroidPlayBilling
        ? PAYMENT_METHODS.filter((method) => method.id === 'google_play')
        : PAYMENT_METHODS.filter((method) => method.id !== 'google_play');
    const defaultMethod = visibleMethods[0]?.id || 'google_play';
    const planProductId = getPlayProductIdForPlan(plan?.id);

    const { token } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();

    const [selectedMethod, setSelectedMethod] = useState(defaultMethod);
    const [loading, setLoading] = useState(false);
    const [verifyingPurchase, setVerifyingPurchase] = useState(false);
    const [currentSubscriptionId, setCurrentSubscriptionId] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [paymentInstructions, setPaymentInstructions] = useState(null);
    const [paymentReference, setPaymentReference] = useState('');
    const [paymentNote, setPaymentNote] = useState('');
    const [receiptAsset, setReceiptAsset] = useState(null);
    const [submittingProof, setSubmittingProof] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [methodAvailability, setMethodAvailability] = useState({});

    const didFetchProductsRef = useRef(false);
    const processedPurchaseKeysRef = useRef(new Set());

    const {
        connected,
        products,
        availablePurchases,
        fetchProducts,
        requestPurchase,
        finishTransaction,
        getAvailablePurchases,
    } = useIAP({
        onPurchaseSuccess: (purchase) => {
            void handleVerifiedPurchase(purchase);
        },
        onPurchaseError: (error) => {
            setLoading(false);
            setVerifyingPurchase(false);

            if (error.code === ErrorCode.UserCancelled) {
                return;
            }

            Alert.alert('Purchase Error', error.message || 'Could not complete the Google Play purchase.');
        },
    });

    useEffect(() => {
        setSelectedMethod(defaultMethod);
    }, [defaultMethod]);

    useEffect(() => {
        const loadPaymentMethods = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/subscription/payment-methods`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                if (data.success) {
                    const availability = {};
                    data.methods.forEach((method) => {
                        availability[method.id] = method;
                    });
                    setMethodAvailability(availability);
                }
            } catch (_) {
            }
        };

        loadPaymentMethods();
    }, [token]);

    useEffect(() => {
        if (!isAndroidPlayBilling || !connected || !planProductId || didFetchProductsRef.current) {
            return;
        }

        didFetchProductsRef.current = true;

        Promise.all([
            fetchProducts({ skus: [planProductId], type: 'in-app' }),
            getAvailablePurchases(),
        ]).catch(() => {
            didFetchProductsRef.current = false;
        });
    }, [connected, fetchProducts, getAvailablePurchases, isAndroidPlayBilling, planProductId]);

    useEffect(() => {
        if (!isAndroidPlayBilling || !availablePurchases?.length) {
            return;
        }

        const pendingPurchase = availablePurchases.find((purchase) => getPlanIdFromPlayProductId(purchase.productId || purchase.id));
        if (pendingPurchase) {
            void handleVerifiedPurchase(pendingPurchase);
        }
    }, [availablePurchases, isAndroidPlayBilling]);

    const isManualPayment = !isAndroidPlayBilling && (selectedMethod === 'bank_transfer' || selectedMethod === 'easypaisa');
    const isBusy = loading || verifyingPurchase;
    const selectedMethodMeta = methodAvailability[selectedMethod];
    const playProduct = products.find((item) => (item.productId || item.id) === planProductId);
    const displayPrice = playProduct?.displayPrice || playProduct?.localizedPrice || playProduct?.price || `PKR ${plan?.price?.toLocaleString?.() || plan?.price || ''}`;

    async function syncUser() {
        const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const meData = await meRes.json();
        if (meData.success) {
            dispatch(updateUser(meData.user));
        }
    }

    async function handleVerifiedPurchase(purchase) {
        const productId = purchase.productId || purchase.id;
        const purchaseToken = purchase.purchaseToken?.trim?.();

        if (!productId || !purchaseToken) {
            return;
        }

        const purchaseKey = `${productId}:${purchaseToken}`;
        if (processedPurchaseKeysRef.current.has(purchaseKey)) {
            return;
        }

        processedPurchaseKeysRef.current.add(purchaseKey);
        setLoading(false);
        setVerifyingPurchase(true);
        setPaymentStatus('verifying');

        try {
            const verifiedPlanId = getPlanIdFromPlayProductId(productId) || plan?.id;
            const res = await fetch(`${API_BASE_URL}/subscription/google-play/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    plan: verifiedPlanId,
                    productId,
                    purchaseToken,
                    transactionId: purchase.transactionId || purchase.orderIdAndroid || '',
                    packageName: 'pk.shadii',
                    targetUserId,
                    purchase,
                }),
            });
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Could not verify the Google Play purchase.');
            }

            await finishTransaction({ purchase, isConsumable: true });
            await syncUser();

            setCurrentSubscriptionId(data.subscriptionId || null);
            setPaymentStatus(data.paymentStatus || 'completed');

            Alert.alert(
                'Payment Verified',
                data.message || 'Your Google Play purchase has been verified successfully.',
                [
                    {
                        text: 'Continue',
                        onPress: () => {
                            if (verifiedPlanId === 'contact_unlock' && targetUserId) {
                                navigation.replace('ProfileDetail', { userId: targetUserId });
                                return;
                            }
                            navigation.navigate('Main');
                        },
                    },
                ]
            );
        } catch (error) {
            processedPurchaseKeysRef.current.delete(purchaseKey);
            setPaymentStatus('verification_failed');
            Alert.alert('Verification Failed', error.message || 'Could not verify the Google Play purchase.');
        } finally {
            setVerifyingPurchase(false);
        }
    }

    const handleCheckStatus = async (subscriptionId = currentSubscriptionId) => {
        if (!subscriptionId) {
            return;
        }

        setCheckingStatus(true);
        try {
            const res = await fetch(`${API_BASE_URL}/subscription/${subscriptionId}/status`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (!data.success) {
                return Alert.alert('Status Error', data.message || 'Could not check payment status.');
            }

            setPaymentStatus(data.subscription.paymentStatus);

            if (data.subscription.paymentStatus === 'completed') {
                await syncUser();
                Alert.alert('Payment Verified', 'Your payment has been verified and your plan is now active.', [
                    { text: 'Continue', onPress: () => navigation.navigate('Main') },
                ]);
                return;
            }

            if (data.subscription.paymentStatus === 'verification_submitted') {
                Alert.alert('Under Review', 'Your payment proof has been submitted. We will activate your plan after verification.');
                return;
            }

            if (data.subscription.paymentStatus === 'rejected') {
                Alert.alert('Payment Rejected', data.subscription.reviewNote || 'We could not verify your payment. Please submit correct proof or contact support.');
                return;
            }

            Alert.alert('Pending', 'Your payment is still pending. Complete payment first, then check status again.');
        } catch (_) {
            Alert.alert('Connection Error', 'Could not check payment status right now.');
        } finally {
            setCheckingStatus(false);
        }
    };

    const pickReceipt = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            return Alert.alert('Permission Required', 'Please allow photo library access to upload your payment receipt.');
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
        });

        if (!result.canceled && result.assets?.[0]) {
            setReceiptAsset(result.assets[0]);
        }
    };

    const handleSubmitProof = async () => {
        if (!currentSubscriptionId) {
            return Alert.alert('Start Payment First', 'Generate your bank transfer order before uploading proof.');
        }
        if (!paymentReference.trim()) {
            return Alert.alert('Reference Required', 'Enter the bank transaction reference / receipt number.');
        }
        if (!receiptAsset?.uri) {
            return Alert.alert('Receipt Required', 'Upload the payment receipt screenshot before submitting.');
        }

        setSubmittingProof(true);
        try {
            const formData = new FormData();
            formData.append('paymentReference', paymentReference.trim());
            formData.append('note', paymentNote.trim());
            formData.append('receipt', {
                uri: receiptAsset.uri,
                type: receiptAsset.mimeType || 'image/jpeg',
                name: receiptAsset.fileName || `receipt-${Date.now()}.jpg`,
            });

            const res = await fetch(`${API_BASE_URL}/subscription/${currentSubscriptionId}/submit-proof`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();

            if (!data.success) {
                return Alert.alert('Submission Failed', data.message || 'Could not submit payment proof.');
            }

            setPaymentStatus(data.paymentStatus);
            Alert.alert('Proof Submitted', data.message, [
                { text: 'OK', onPress: () => handleCheckStatus(currentSubscriptionId) },
            ]);
        } catch (_) {
            Alert.alert('Connection Error', 'Could not submit payment proof. Please try again.');
        } finally {
            setSubmittingProof(false);
        }
    };

    const handlePayment = async () => {
        if (!plan?.id) {
            return Alert.alert('Error', 'Invalid payment plan. Please try again.');
        }

        if (selectedMethodMeta && !selectedMethodMeta.enabled) {
            return Alert.alert('Unavailable', selectedMethodMeta.message || 'This payment method is not available right now.');
        }

        if (isAndroidPlayBilling) {
            if (!connected) {
                return Alert.alert('Store Not Ready', 'Google Play is still connecting. Please try again in a few seconds.');
            }

            if (!planProductId) {
                return Alert.alert('Product Missing', 'No Google Play product is configured for this plan yet.');
            }

            setLoading(true);
            setPaymentStatus('processing');

            try {
                await requestPurchase({
                    request: {
                        apple: { sku: planProductId },
                        google: { skus: [planProductId] },
                    },
                    type: 'in-app',
                });
            } catch (error) {
                setLoading(false);
                setPaymentStatus(null);
                Alert.alert('Purchase Error', error.message || 'Could not open Google Play Billing.');
            }
            return;
        }

        if (!isManualPayment) {
            return Alert.alert('Unavailable', 'This payment method is not available on this platform yet.');
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/subscription/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ plan: plan.id, paymentMethod: selectedMethod }),
            });
            const data = await res.json();
            if (!data.success) {
                setLoading(false);
                return Alert.alert('Payment Error', data.message || 'Could not initiate payment.');
            }

            setCurrentSubscriptionId(data.subscriptionId);
            setPaymentStatus(data.paymentStatus || 'awaiting_payment');
            setPaymentInstructions(data.paymentInstructions || null);

            if (selectedMethod === 'easypaisa' || selectedMethod === 'bank_transfer') {
                Alert.alert(
                    'Transfer Details Ready',
                    'Send the payment using the details shown below, then upload your receipt for manual verification.'
                );
            } else if (data.paymentUrl) {
                await Linking.openURL(data.paymentUrl);
                Alert.alert(
                    'Complete Payment',
                    'Finish the payment on the opened page, then come back here and tap Check Payment Status. Your plan activates only after gateway verification.'
                );
            } else {
                Alert.alert('Unavailable', data.message || 'This payment method is not available right now.');
            }
        } catch (_) {
            Alert.alert('Connection Error', 'Unable to reach payment server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient colors={['#1A000A', '#0D0509', '#0D0D0D']} style={StyleSheet.absoluteFill} />

            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="chevron-left" size={26} color={colors.accent} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.summaryCard}>
                    <LinearGradient
                        colors={['rgba(212,175,55,0.10)', 'transparent']}
                        style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.summaryLabel}>ORDER SUMMARY</Text>
                    <View style={styles.row}>
                        <Text style={styles.planName}>{plan?.name} Plan</Text>
                        <Text style={styles.planPrice}>{displayPrice}</Text>
                    </View>
                    <Text style={styles.duration}>{plan?.duration}</Text>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.totalText}>Total to pay</Text>
                        <Text style={styles.totalPrice}>{displayPrice}</Text>
                    </View>
                </View>

                <View style={styles.reviewNotice}>
                    <MaterialCommunityIcons
                        name={isAndroidPlayBilling ? 'google-play' : 'shield-check-outline'}
                        size={18}
                        color={colors.accent}
                    />
                    <Text style={styles.reviewNoticeText}>
                        {isAndroidPlayBilling
                            ? 'Payments on Android are handled by Google Play Billing. Your purchase is activated after secure Play verification.'
                            : 'Your plan activates only after real payment verification. No subscription is enabled automatically.'}
                    </Text>
                </View>

                {isAndroidPlayBilling && (
                    <View style={styles.playInfoCard}>
                        <Text style={styles.instructionsTitle}>Google Play Billing</Text>
                        <Text style={styles.instructionsText}>Use an internal testing or production build signed with the Play Console app ID.</Text>
                        <Text style={styles.instructionsHint}>Billing does not work inside Expo Go. Use a development build or Play-distributed build for real testing.</Text>
                    </View>
                )}

                <Text style={styles.sectionTitle}>{isAndroidPlayBilling ? 'Payment Method' : 'Select Payment Method'}</Text>

                <View style={styles.methodsContainer}>
                    {visibleMethods.map((method) => {
                        const isSelected = selectedMethod === method.id;
                        const meta = METHOD_ICONS[method.id] || { icon: 'cash', color: colors.accent };
                        const availability = methodAvailability[method.id];
                        const isDisabled = availability && !availability.enabled;

                        return (
                            <TouchableOpacity
                                key={method.id}
                                style={[styles.methodCard, isSelected && styles.methodSelected, isDisabled && styles.methodDisabled]}
                                onPress={() => {
                                    if (!isDisabled) setSelectedMethod(method.id);
                                }}
                                activeOpacity={0.8}
                                disabled={isDisabled}
                            >
                                {isSelected && (
                                    <LinearGradient
                                        colors={['rgba(139,26,74,0.2)', 'rgba(92,15,49,0.15)']}
                                        style={StyleSheet.absoluteFill}
                                    />
                                )}
                                <View style={[styles.methodIconWrap, { backgroundColor: `${meta.color}22`, borderColor: `${meta.color}44` }]}>
                                    <MaterialCommunityIcons name={meta.icon} size={20} color={meta.color} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.methodName, isSelected && { color: colors.accent }, isDisabled && styles.methodNameDisabled]}>{method.name}</Text>
                                    <Text style={[styles.methodHint, isDisabled && styles.methodHintDisabled]} numberOfLines={2}>
                                        {availability?.message || (method.id === 'google_play' ? 'Secure checkout inside Google Play.' : '')}
                                    </Text>
                                </View>
                                <View style={[styles.radio, isSelected && styles.radioActive]}>
                                    {isSelected && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {(paymentStatus || currentSubscriptionId) && (
                    <View style={styles.statusCard}>
                        <Text style={styles.statusLabel}>Payment Status</Text>
                        <Text style={styles.statusValue}>{(paymentStatus || 'pending').replace(/_/g, ' ')}</Text>
                        {currentSubscriptionId ? <Text style={styles.statusSub}>Order ID: {currentSubscriptionId}</Text> : null}
                    </View>
                )}

                {paymentInstructions && isManualPayment && (
                    <View style={styles.instructionsCard}>
                        <Text style={styles.instructionsTitle}>
                            {paymentInstructions.method === 'easypaisa' ? 'EasyPaisa Details' : 'Bank Transfer Details'}
                        </Text>
                        {paymentInstructions.method === 'easypaisa' && (
                            <Text style={styles.instructionsText}>Send To (EasyPaisa No.): {paymentInstructions.accountNumber}</Text>
                        )}
                        {paymentInstructions.method !== 'easypaisa' && (
                            <>
                                <Text style={styles.instructionsText}>Bank: {paymentInstructions.bankName}</Text>
                                <Text style={styles.instructionsText}>Account Number: {paymentInstructions.accountNumber}</Text>
                                {!!paymentInstructions.iban && <Text style={styles.instructionsText}>IBAN: {paymentInstructions.iban}</Text>}
                                {!!paymentInstructions.branchCode && <Text style={styles.instructionsText}>Branch Code: {paymentInstructions.branchCode}</Text>}
                            </>
                        )}
                        <Text style={styles.instructionsText}>Account Title: {paymentInstructions.accountTitle}</Text>
                        <Text style={styles.instructionsText}>Reference to mention: {paymentInstructions.reference}</Text>
                        <Text style={styles.instructionsHint}>Upload your receipt below. Your plan activates only after manual verification.</Text>
                    </View>
                )}

                {isManualPayment && currentSubscriptionId && (
                    <View style={styles.proofCard}>
                        <Text style={styles.instructionsTitle}>Submit Transfer Proof</Text>
                        <TextInput
                            style={styles.input}
                            value={paymentReference}
                            onChangeText={setPaymentReference}
                            placeholder="Transaction reference / receipt number"
                            placeholderTextColor="rgba(255,255,255,0.35)"
                        />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={paymentNote}
                            onChangeText={setPaymentNote}
                            placeholder="Optional note"
                            placeholderTextColor="rgba(255,255,255,0.35)"
                            multiline
                        />

                        <TouchableOpacity style={styles.uploadBtn} onPress={pickReceipt} activeOpacity={0.85}>
                            <MaterialCommunityIcons name="image-plus" size={18} color={colors.accent} />
                            <Text style={styles.uploadBtnText}>{receiptAsset ? 'Receipt Selected' : 'Upload Receipt Screenshot'}</Text>
                        </TouchableOpacity>

                        {receiptAsset?.uri && (
                            <Text style={styles.receiptName}>{receiptAsset.fileName || 'Receipt attached'}</Text>
                        )}

                        <TouchableOpacity style={styles.secondaryBtnWrap} onPress={handleSubmitProof} disabled={submittingProof} activeOpacity={0.85}>
                            <LinearGradient colors={['#8B1A4A', '#5C0F31']} style={styles.secondaryBtn}>
                                {submittingProof ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.secondaryBtnText}>Submit Proof for Verification</Text>}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity style={styles.btnWrap} onPress={handlePayment} disabled={isBusy} activeOpacity={0.85}>
                    <LinearGradient colors={['#D4AF37', '#A07C10']} style={styles.btn}>
                        {isBusy ? (
                            <ActivityIndicator color="#0D0D0D" />
                        ) : (
                            <>
                                <MaterialCommunityIcons
                                    name={isAndroidPlayBilling ? 'google-play' : isManualPayment ? 'bank-transfer' : 'lock-outline'}
                                    size={18}
                                    color="#0D0D0D"
                                />
                                <Text style={styles.btnText}>
                                    {isAndroidPlayBilling
                                        ? `Buy via Google Play${plan?.price ? ` - ${displayPrice}` : ''}`
                                        : selectedMethod === 'easypaisa'
                                            ? 'Generate EasyPaisa Order'
                                            : selectedMethod === 'bank_transfer'
                                                ? 'Generate Bank Transfer Order'
                                                : `Proceed to Pay ${displayPrice}`}
                                </Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {!isAndroidPlayBilling && currentSubscriptionId && (
                    <TouchableOpacity style={styles.checkBtn} onPress={() => handleCheckStatus()} disabled={checkingStatus} activeOpacity={0.85}>
                        <MaterialCommunityIcons name="refresh" size={16} color={colors.accent} />
                        <Text style={styles.checkBtnText}>{checkingStatus ? 'Checking...' : 'Check Payment Status'}</Text>
                    </TouchableOpacity>
                )}

                <Text style={styles.secureText}>
                    {isAndroidPlayBilling
                        ? `Only verified Google Play purchases activate access. ${plan?.id === 'contact_unlock' ? `This unlock costs PKR ${CONTACT_UNLOCK_PRICE}.` : 'Support: support@shadii.pk'}`
                        : 'Only verified payments activate premium access. For help, contact support@shadii.pk'}
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },

    content: { padding: 24 },

    summaryCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.2)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20,
        marginBottom: 24,
    },
    summaryLabel: {
        fontSize: 11,
        color: colors.accent,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    planName: { fontSize: 16, fontWeight: '700', color: colors.text },
    planPrice: { fontSize: 16, fontWeight: '700', color: colors.text },
    duration: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 16 },
    totalText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
    totalPrice: { fontSize: 24, fontWeight: '800', color: colors.accent },

    sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },

    methodsContainer: { gap: 8, marginBottom: 24 },
    reviewNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        padding: 14,
        marginBottom: 18,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.22)',
        backgroundColor: 'rgba(212,175,55,0.08)',
    },
    reviewNoticeText: { flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
    playInfoCard: {
        marginBottom: 18,
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(52,168,83,0.18)',
    },
    statusCard: {
        marginBottom: 18,
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.15)',
    },
    statusLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 },
    statusValue: { fontSize: 18, fontWeight: '800', color: colors.accent, textTransform: 'capitalize' },
    statusSub: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
    instructionsCard: {
        marginBottom: 18,
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(155,89,182,0.22)',
    },
    proofCard: {
        marginBottom: 20,
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    instructionsTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
    instructionsText: { fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
    instructionsHint: { fontSize: 12, color: colors.textMuted, marginTop: 8, lineHeight: 18 },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        overflow: 'hidden',
        gap: 12,
    },
    methodSelected: { borderColor: 'rgba(139,26,74,0.5)' },
    methodDisabled: { opacity: 0.45 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
        color: colors.text,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 12,
    },
    textArea: {
        minHeight: 90,
        textAlignVertical: 'top',
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.25)',
        backgroundColor: 'rgba(212,175,55,0.08)',
        borderRadius: 14,
        paddingVertical: 14,
        marginBottom: 8,
    },
    uploadBtnText: { color: colors.accent, fontSize: 14, fontWeight: '700' },
    receiptName: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
    methodIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    methodName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
    methodNameDisabled: { color: colors.textMuted },
    methodHint: { fontSize: 11, color: colors.textMuted, marginTop: 4, lineHeight: 16 },
    methodHintDisabled: { color: 'rgba(255,255,255,0.32)' },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioActive: { borderColor: colors.rose },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.rose },

    btnWrap: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
        elevation: 8,
    },
    btn: {
        paddingVertical: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    btnText: { color: '#0D0D0D', fontSize: 16, fontWeight: '800' },
    secondaryBtnWrap: { borderRadius: 14, overflow: 'hidden' },
    secondaryBtn: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    secondaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
    checkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.2)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        marginBottom: 16,
    },
    checkBtnText: { color: colors.accent, fontSize: 14, fontWeight: '700' },
    secureText: { textAlign: 'center', fontSize: 12, color: 'rgba(245,230,200,0.35)', lineHeight: 18 },
});
