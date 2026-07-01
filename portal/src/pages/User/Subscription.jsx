import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { CreditCard, ShieldCheck, CheckCircle2, ChevronRight, Upload, AlertCircle, FileText } from 'lucide-react';

export default function Subscription() {
  const { token, user, refreshUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Checkout states
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(''); // 'easypaisa' | 'bank_transfer'
  const [initiationData, setInitiationData] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [paymentRef, setPaymentRef] = useState('');

  useEffect(() => {
    fetchPlans();
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const sessionId = params.get('session_id');

    if (status === 'success' && sessionId) {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const res = await fetch(`${API_BASE}/subscription/stripe/verify-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ sessionId })
        });
        const data = await res.json();
        if (data.success) {
          setSuccess('Payment Verified successfully! Your premium membership is now active.');
          await refreshUser();
        } else {
          setError(data.message || 'Payment verification failed.');
        }
      } catch (err) {
        setError('Error verifying payment session.');
      } finally {
        setLoading(false);
        // Clear query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (status === 'cancelled') {
      setError('Payment was cancelled.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_BASE}/subscription/plans`);
      const data = await res.json();
      if (data.success) {
        // Filter out contact_unlock from plans grid (it is bought on-demand per card)
        setPlans(data.plans?.filter(p => p.id !== 'contact_unlock') || []);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load premium membership details.');
    } finally {
      setPlansLoading(false);
    }
  };

  const handleInitiate = async (e) => {
    e.preventDefault();
    if (!selectedPlan || !paymentMethod) return;
    setLoading(true);
    setError('');
    setSuccess('');

    if (paymentMethod === 'credit_card') {
      try {
        const res = await fetch(`${API_BASE}/subscription/stripe/checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            plan: selectedPlan.id
          })
        });
        const data = await res.json();
        if (data.success && data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          setError(data.message || 'Failed to initiate card checkout.');
        }
      } catch (err) {
        setError('Connection failure.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/subscription/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: selectedPlan.id,
          paymentMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        setInitiationData(data);
      } else {
        setError(data.message || 'Failed to initiate order.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!receiptFile || !initiationData) {
      setError('Please upload a screenshot of your payment transfer receipt.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('receipt', receiptFile);
    formData.append('paymentReference', paymentRef);

    try {
      const res = await fetch(`${API_BASE}/subscription/${initiationData.subscriptionId}/submit-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Receipt submitted successfully! Admin will review and activate your plan within a few hours.');
        setInitiationData(null);
        setSelectedPlan(null);
        setReceiptFile(null);
        setPaymentRef('');
        await refreshUser();
      } else {
        setError(data.message || 'Proof submission failed.');
      }
    } catch (err) {
      setError('Error uploading proof.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="bg-white border border-[#E5DEC9] p-6 mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#800020]">Premium Memberships</h1>
        <p className="text-sm text-[#605252] mt-1">Upgrade your account to access unified dignified messaging, profile views, and advanced matchmaking options.</p>
      </div>

      {error && (
        <div className="bg-[#FAF2F2] border border-[#800020] text-[#800020] p-4 mb-6 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-[#F2FAF4] border border-[#C5A059] text-[#2C2121] p-4 mb-6 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#C5A059] shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Active Subscription badge */}
      {user?.subscription?.isActive && (
        <div className="bg-green-50 border border-green-200 p-6 mb-8 text-center flex flex-col items-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mb-2" />
          <h3 className="font-serif font-bold text-lg text-green-800">Your Premium Plan is Active</h3>
          <p className="text-xs text-green-700 mt-1 uppercase tracking-widest font-semibold">
            Plan: {user.subscription.plan} · Expires: {new Date(user.subscription.endDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {!initiationData ? (
        <>
          {/* Plans Grid */}
          {plansLoading ? (
            <div className="text-center py-12 text-[#605252]">Loading subscription plans...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white border border-[#E5DEC9] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-[#800020]">{plan.label}</h3>
                    <div className="my-4">
                      <span className="text-3xl font-serif font-bold text-[#C5A059]">PKR {plan.price.toLocaleString()}</span>
                      <span className="text-xs text-[#605252] ml-1">/ {plan.duration} Days</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-[#605252] border-t border-[#F5EFEB] pt-4 mt-4">
                      {plan.features?.map((feat, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 bg-[#FCFBF7] border-t border-[#E5DEC9]">
                    <button
                      onClick={() => setSelectedPlan(plan)}
                      style={{ color: '#ffffff' }}
                      className="w-full py-2.5 bg-[#800020] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#9E1B32] transition-colors cursor-pointer text-center !text-white"
                    >
                      Choose Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Checkout Selection Modal-like Panel */}
          {selectedPlan && (
            <div className="bg-white border border-[#E5DEC9] p-6 md:p-8 space-y-6">
              <h3 className="font-serif text-lg font-bold text-[#800020] border-b border-[#E5DEC9] pb-2">
                Order details: {selectedPlan.label} (PKR {selectedPlan.price.toLocaleString()})
              </h3>

              <form onSubmit={handleInitiate} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-2">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-4 border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        paymentMethod === 'credit_card'
                          ? 'border-[#800020] bg-[#800020]/5'
                          : 'border-[#E5DEC9] hover:border-[#800020]'
                      }`}
                    >
                      <div>
                        <span className="block font-bold text-sm text-[#2C2121]">Credit/Debit Card</span>
                        <span className="text-[10px] text-[#605252]">Secure pay via Visa / MasterCard</span>
                      </div>
                      <CreditCard className="w-5 h-5 text-[#C5A059]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('easypaisa')}
                      className={`p-4 border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        paymentMethod === 'easypaisa'
                          ? 'border-[#800020] bg-[#800020]/5'
                          : 'border-[#E5DEC9] hover:border-[#800020]'
                      }`}
                    >
                      <div>
                        <span className="block font-bold text-sm text-[#2C2121]">EasyPaisa Wallet</span>
                        <span className="text-[10px] text-[#605252]">Transfer via mobile EasyPaisa app</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#C5A059]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-4 border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-[#800020] bg-[#800020]/5'
                          : 'border-[#E5DEC9] hover:border-[#800020]'
                      }`}
                    >
                      <div>
                        <span className="block font-bold text-sm text-[#2C2121]">Direct Bank Transfer</span>
                        <span className="text-[10px] text-[#605252]">Transfer using HBL/Allied bank or HBL app</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#C5A059]" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#F5EFEB] pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(null)}
                    className="px-4 py-2 border border-[#E5DEC9] text-xs font-bold uppercase tracking-wider text-[#605252] hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !paymentMethod}
                    style={{ color: '#ffffff' }}
                    className="px-6 py-2 bg-[#800020] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#9E1B32] transition-colors cursor-pointer !text-white"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      ) : (
        /* Invoice Instructions & Proof Submission Form */
        <div className="bg-white border border-[#E5DEC9] p-6 md:p-8 space-y-6">
          <h3 className="font-serif text-lg font-bold text-[#800020] border-b border-[#E5DEC9] pb-2">
            Payment Instructions - Order ID: {initiationData.subscriptionId}
          </h3>

          <div className="bg-[#FCFBF7] border border-[#E5DEC9] p-6 space-y-4 text-sm">
            <p className="font-semibold text-[#2C2121]">Please send exactly <strong className="text-[#800020]">PKR {initiationData.amount}</strong> to the following account details:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#605252]">Account Title</span>
                <span className="font-serif font-bold text-md text-[#2C2121]">{initiationData.paymentInstructions.accountTitle}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#605252]">Account Number / Mobile</span>
                <span className="font-mono font-bold text-md text-[#2C2121]">{initiationData.paymentInstructions.accountNumber}</span>
              </div>
              {initiationData.paymentInstructions.bankName && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#605252]">Bank Name</span>
                  <span className="font-bold text-md text-[#2C2121]">{initiationData.paymentInstructions.bankName}</span>
                </div>
              )}
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#605252]">Order Reference Code</span>
                <span className="font-mono font-bold text-md text-[#800020]">{initiationData.paymentInstructions.reference}</span>
              </div>
            </div>
            
            <p className="text-xs text-[#605252] border-t border-[#E5DEC9] pt-3">
              * Note: Please include the Order Reference Code in the description/memo of the transaction.
            </p>
          </div>

          <form onSubmit={handleUploadProof} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">
                Transaction Reference ID (optional)
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. TRX-123456789"
                className="w-full px-3 py-2 border border-[#E5DEC9] bg-[#FCFBF7] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">
                Upload Receipt Screenshot
              </label>
              <div className="border border-dashed border-[#E5DEC9] bg-[#FCFBF7] p-8 text-center flex flex-col items-center">
                <FileText className="w-10 h-10 text-[#C5A059] mb-2" />
                <p className="text-xs font-bold text-[#2C2121] mb-2">Upload payment transfer verification screenshot</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="hidden"
                  id="receipt-file-upload"
                />
                <label
                  htmlFor="receipt-file-upload"
                  className="px-4 py-2 border border-[#C5A059] text-[#C5A059] text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {receiptFile ? receiptFile.name : 'Choose Screenshot'}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#F5EFEB] pt-4">
              <button
                type="button"
                onClick={() => setInitiationData(null)}
                className="px-4 py-2 border border-[#E5DEC9] text-xs font-bold uppercase tracking-wider text-[#605252] hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ color: '#ffffff' }}
                className="px-6 py-2 bg-[#800020] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#9E1B32] transition-colors cursor-pointer !text-white"
              >
                {loading ? 'Submitting...' : 'Submit Payment Verification'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
