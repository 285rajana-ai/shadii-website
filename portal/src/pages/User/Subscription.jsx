import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { CreditCard, ShieldCheck, CheckCircle2, ChevronRight, Upload, AlertCircle, FileText, Sparkles, Gem, HelpCircle, BadgePercent, Loader2 } from 'lucide-react';

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
    <div className="flex flex-col gap-6 text-[#202124]">
      {/* Page Title Header */}
      <section className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden flex items-center justify-between bg-white border border-[#E7DED3]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#8A1538]/5 to-transparent blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8A1538] mb-2">
            <Gem className="h-4 w-4 text-[#8A1538]" />
            Shadii Premium Services
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-[#8A1538] tracking-tight">
            Premium Membership Packages
          </h1>
          <p className="mt-1 text-xs font-bold text-[#5F6673] uppercase tracking-wider">
            Choose a plan to communicate with matches and browse photos without restriction
          </p>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 border border-red-800/25 bg-red-50 p-4 text-sm rounded-xl text-red-800 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span className="font-semibold">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 border border-emerald-800/20 bg-emerald-50/50 p-4 text-sm rounded-xl text-[#147A5C] shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-[#147A5C]" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {/* Active Subscription badge */}
      {user?.subscription?.isActive && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 flex flex-col items-center justify-center text-center relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl rounded-full" />
          <CheckCircle2 className="w-10 h-10 text-[#147A5C] mb-2.5" />
          <h3 className="font-serif font-black text-lg text-emerald-800">Your Premium Plan is Active</h3>
          <p className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest mt-1">
            Tier: {user.subscription.plan} • Expires: {new Date(user.subscription.endDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {!initiationData ? (
        <>
          {/* Plans Grid */}
          {plansLoading ? (
            <div className="glass-panel grid min-h-[20rem] place-items-center text-sm text-[#202124]/60 rounded-2xl bg-white border border-[#E7DED3]">
              <span className="inline-flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-[#8A1538]" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Loading Pricing Plans...</span>
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isRecommended = plan.id === 'standard' || plan.id === 'premium';
                return (
                  <div 
                    key={plan.id} 
                    className={`glass-panel flex flex-col justify-between overflow-hidden rounded-2xl transition-all duration-300 relative border border-[#E7DED3] bg-white ${
                      isRecommended ? 'border-l-4 border-l-[#8A1538] shadow-md scale-[1.01]' : ''
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute top-3 right-3 bg-[#8A1538] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded shadow-sm">
                        Recommended
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-serif text-xl font-black text-[#8A1538]">{plan.label}</h3>
                      <div className="my-4">
                        <span className="text-3xl font-serif font-black text-[#202124]">PKR {plan.price.toLocaleString()}</span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5F6673] ml-1">/ {plan.duration} Days</span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-[#202124]/75 border-t border-[#EFE7DD] pt-4 mt-4 font-semibold">
                        {plan.features?.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#147A5C] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-[#FAF7F2] border-t border-[#E7DED3] flex items-center justify-center">
                      <button
                        onClick={() => setSelectedPlan(plan)}
                        className="w-full btn-premium-primary py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center"
                      >
                        Select {plan.label}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Checkout Selection Modal-like Panel */}
          {selectedPlan && (
            <div className="glass-panel p-6 md:p-8 rounded-2xl space-y-6 shadow-sm border border-[#E7DED3] bg-white">
              <h3 className="font-serif text-lg font-black text-[#8A1538] border-b border-[#EFE7DD] pb-3">
                Order details: {selectedPlan.label} (PKR {selectedPlan.price.toLocaleString()})
              </h3>

              <form onSubmit={handleInitiate} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5F6673] mb-3">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-4 border text-left flex items-center justify-between transition-all rounded-xl cursor-pointer ${
                        paymentMethod === 'credit_card'
                          ? 'border-[#8A1538] bg-[#FCE8EF]/40 shadow-sm'
                          : 'border-[#E7DED3] bg-white hover:border-[#8A1538]'
                      }`}
                    >
                      <div>
                        <span className="block font-bold text-sm text-[#202124]">Credit/Debit Card</span>
                        <span className="text-[10px] text-[#5F6673]/50 font-semibold mt-0.5 block">Pay securely via Stripe API</span>
                      </div>
                      <CreditCard className="w-5 h-5 text-[#8A1538]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('easypaisa')}
                      className={`p-4 border text-left flex items-center justify-between transition-all rounded-xl cursor-pointer ${
                        paymentMethod === 'easypaisa'
                          ? 'border-[#8A1538] bg-[#FCE8EF]/40 shadow-sm'
                          : 'border-[#E7DED3] bg-white hover:border-[#8A1538]'
                      }`}
                    >
                      <div>
                        <span className="block font-bold text-sm text-[#202124]">EasyPaisa Wallet</span>
                        <span className="text-[10px] text-[#5F6673]/50 font-semibold mt-0.5 block">Transfer via Easypaisa mobile app</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8A1538]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-4 border text-left flex items-center justify-between transition-all rounded-xl cursor-pointer ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-[#8A1538] bg-[#FCE8EF]/40 shadow-sm'
                          : 'border-[#E7DED3] bg-white hover:border-[#8A1538]'
                      }`}
                    >
                      <div>
                        <span className="block font-bold text-sm text-[#202124]">Bank Transfer</span>
                        <span className="text-[10px] text-[#5F6673]/50 font-semibold mt-0.5 block">Transfer using any Pakistani bank app</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8A1538]" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#E7DED3] pt-5">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(null)}
                    className="btn-premium-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !paymentMethod}
                    className="btn-premium-primary px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                  >
                    {loading ? 'Processing...' : 'Proceed to Checkout'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      ) : (
        /* Invoice Instructions & Proof Submission Form */
        <div className="glass-panel p-6 md:p-8 rounded-2xl space-y-6 bg-white border border-[#E7DED3] shadow-sm">
          <h3 className="font-serif text-lg font-black text-[#8A1538] border-b border-[#EFE7DD] pb-3">
            Payment Transfer Instructions - Order ID: {initiationData.subscriptionId}
          </h3>

          <div className="bg-[#FAF7F2] border border-[#E7DED3] p-6 rounded-xl space-y-4 text-sm font-medium text-[#202124]/85">
            <p className="font-bold text-[#202124]">Please send exactly <strong className="text-[#8A1538]">PKR {initiationData.amount}</strong> to the following account:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-[9px] uppercase font-extrabold text-[#5F6673] tracking-wider">Account Title</span>
                <span className="font-serif font-black text-md text-[#8A1538]">{initiationData.paymentInstructions.accountTitle}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase font-extrabold text-[#5F6673] tracking-wider">Account / Mobile Number</span>
                <span className="font-mono font-black text-md text-[#8A1538]">{initiationData.paymentInstructions.accountNumber}</span>
              </div>
              {initiationData.paymentInstructions.bankName && (
                <div>
                  <span className="block text-[9px] uppercase font-extrabold text-[#5F6673] tracking-wider">Bank Name</span>
                  <span className="font-bold text-md text-[#202124]">{initiationData.paymentInstructions.bankName}</span>
                </div>
              )}
              <div>
                <span className="block text-[9px] uppercase font-extrabold text-[#5F6673] tracking-wider">Order Memo Reference</span>
                <span className="font-mono font-bold text-md text-[#C5A059]">{initiationData.paymentInstructions.reference}</span>
              </div>
            </div>
            
            <p className="text-[10px] text-[#5F6673]/50 font-bold uppercase tracking-wider border-t border-[#E7DED3] pt-3">
              * Note: Please write the Order Memo Reference in the transfer memo box.
            </p>
          </div>

          <form onSubmit={handleUploadProof} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5F6673] mb-1.5">
                Transaction ID (TRX ID)
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. TRX123456789"
                className="w-full border border-[#E7DED3] bg-white focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] transition-all px-3 py-2.5 text-sm text-[#202124] rounded-lg outline-none font-medium placeholder-[#5F6673]/30"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5F6673] mb-1.5">
                Upload Proof Receipt Screen
              </label>
              <div className="border-2 border-dashed border-[#E7DED3] bg-[#FAF7F2] p-8 text-center flex flex-col items-center justify-center rounded-xl relative aspect-[1.5/1]">
                <FileText className="w-8 h-8 text-[#8A1538] opacity-50 mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F6673] mb-3">Drag or select receipt transfer screenshot</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="hidden"
                  id="receipt-file-upload"
                />
                <label
                  htmlFor="receipt-file-upload"
                  className="btn-premium-secondary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  {receiptFile ? receiptFile.name : 'Choose Screenshot'}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E7DED3] pt-5">
              <button
                type="button"
                onClick={() => setInitiationData(null)}
                className="btn-premium-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-premium-primary px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Submit Payment Screenshot'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
