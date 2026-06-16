import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { 
  Users, CreditCard, ShieldAlert, BadgeAlert, Megaphone, BarChart3, 
  Search, Eye, Ban, Check, X, Shield, FileImage, ExternalLink, Calendar,
  Activity, CheckCircle2, UserCheck, AlertCircle, Sparkles
} from 'lucide-react';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'verifications' | 'payments' | 'reports' | 'broadcast'
  const [stats, setStats] = useState(null);
  const [breakdowns, setBreakdowns] = useState({});
  const [recent, setRecent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // lightbox
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverview();
    }
  }, [activeTab]);

  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setBreakdowns(data.breakdowns);
        setRecent(data.recent);
      } else {
        setError(data.message || 'Failed to load executive statistics.');
      }
    } catch (err) {
      setError('Connection failure to admin API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-100px)]">
      {/* Lightbox Modal */}
      {lightbox && (
        <div 
          className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] bg-white border border-[#E5DEC9]" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute -top-10 right-0 text-white font-bold text-sm tracking-widest uppercase cursor-pointer"
              onClick={() => setLightbox(null)}
            >
              ✕ Close
            </button>
            <img src={lightbox} alt="Document View" className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}

      {/* Main Admin Frame */}
      <div className="bg-white border border-[#E5DEC9] h-full flex divide-x divide-[#E5DEC9]">
        {/* Left Admin Navigation Sidebar */}
        <div className="w-64 shrink-0 flex flex-col h-full bg-[#FCFBF7]">
          <div className="p-6 border-b border-[#E5DEC9] bg-[#800020] text-white">
            <h2 className="font-serif text-lg font-bold">Operations Desk</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold mt-1">Admin Panel Mode</p>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'User Directory', icon: Users },
              { id: 'verifications', label: 'ID Verifications', icon: UserCheck },
              { id: 'payments', label: 'Payment Reviews', icon: CreditCard },
              { id: 'reports', label: 'Chat Moderation', icon: ShieldAlert },
              { id: 'broadcast', label: 'System Broadcast', icon: Megaphone },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setError('');
                    setSuccess('');
                  }}
                  className={`w-full px-6 py-3.5 text-left flex items-center gap-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-l-4 ${
                    isSelected
                      ? 'bg-white border-l-[#800020] text-[#800020]'
                      : 'border-l-transparent text-[#605252] hover:bg-[#F5EFEB] hover:text-[#800020]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Dashboard Content Panel */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white p-6 md:p-8">
          {error && (
            <div className="bg-[#FAF2F2] border border-[#800020] text-[#800020] p-4 mb-6 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-[#F2FAF4] border border-[#C5A059] text-[#2C2121] p-4 mb-6 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#C5A059] shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards Grid */}
              {loading ? (
                <div className="text-center py-20 text-[#605252]">Loading executive overview metrics...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Members', val: stats?.totalUsers, sub: `${stats?.onlineNow || 0} online now`, cls: 'border-[#E5DEC9]' },
                      { label: 'Total Revenue', val: `PKR ${stats?.totalRevenue?.toLocaleString()}`, sub: `${stats?.totalCompletedPayments || 0} completed payments`, cls: 'border-[#C5A059]' },
                      { label: 'ID Verifications', val: stats?.pendingVerifications, sub: 'Pending review queue', cls: 'border-amber-500' },
                      { label: 'Unresolved Reports', val: stats?.pendingReports, sub: 'Active chat report tickets', cls: 'border-[#800020]' },
                    ].map((card, i) => (
                      <div key={i} className={`bg-[#FCFBF7] border border-t-4 p-5 shadow-sm ${card.cls}`}>
                        <span className="block text-[10px] uppercase tracking-wider font-bold text-[#605252]">{card.label}</span>
                        <span className="block text-2xl font-serif font-extrabold text-[#2C2121] mt-2 mb-1">{card.val}</span>
                        <span className="block text-xs text-[#A09090]">{card.sub}</span>
                      </div>
                    ))}
                  </div>

                  {/* Activity and Lists */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Payments queue */}
                    <div className="border border-[#E5DEC9] p-6 space-y-4">
                      <h3 className="font-serif text-md font-bold text-[#800020] border-b border-[#E5DEC9] pb-2">Recent Payment Submissions</h3>
                      <div className="divide-y divide-[#F5EFEB] max-h-80 overflow-y-auto">
                        {recent?.payments?.length === 0 ? (
                          <p className="text-xs text-[#A09090] py-4">No recent payments logged.</p>
                        ) : (
                          recent?.payments?.map((payment) => (
                            <div key={payment._id} className="py-3 flex justify-between items-center text-xs">
                              <div>
                                <strong className="text-[#2C2121]">{payment.user?.name}</strong>
                                <span className="block text-[10px] text-[#605252]">{payment.user?.email}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-[#800020]">PKR {payment.amount?.toLocaleString()}</span>
                                <span className={`block text-[9px] uppercase tracking-widest font-extrabold mt-0.5 ${
                                  payment.paymentStatus === 'completed' ? 'text-green-700' : 'text-amber-600'
                                }`}>
                                  {payment.paymentStatus}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Recent Reports queue */}
                    <div className="border border-[#E5DEC9] p-6 space-y-4">
                      <h3 className="font-serif text-md font-bold text-[#800020] border-b border-[#E5DEC9] pb-2">Recent Chat Violations</h3>
                      <div className="divide-y divide-[#F5EFEB] max-h-80 overflow-y-auto">
                        {recent?.reports?.length === 0 ? (
                          <p className="text-xs text-[#A09090] py-4">No recent reports logged.</p>
                        ) : (
                          recent?.reports?.map((report) => (
                            <div key={report._id} className="py-3 flex justify-between items-center text-xs">
                              <div>
                                <span className="text-[#2C2121]">Reporter: <strong>{report.reporter?.name}</strong></span>
                                <span className="block text-[10px] text-[#605252]">Against: {report.reported?.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="bg-[#800020]/10 text-[#800020] px-2 py-0.5 font-bold uppercase tracking-wider text-[9px]">
                                  {report.reason}
                                </span>
                                <span className="block text-[9px] text-[#A09090] mt-1">
                                  {new Date(report.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'users' && <UsersTabFrame token={token} onLightbox={setLightbox} />}
          {activeTab === 'verifications' && <VerificationsTabFrame token={token} onLightbox={setLightbox} setSuccess={setSuccess} setError={setError} />}
          {activeTab === 'payments' && <PaymentsTabFrame token={token} onLightbox={setLightbox} setSuccess={setSuccess} setError={setError} />}
          {activeTab === 'reports' && <ReportsTabFrame token={token} setSuccess={setSuccess} setError={setError} />}
          {activeTab === 'broadcast' && <BroadcastTabFrame token={token} setSuccess={setSuccess} setError={setError} />}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CHILD COMPONENT TAB FRAMES
// ──────────────────────────────────────────────────────────────────────────────

function UsersTabFrame({ token, onLightbox }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockAction = async (userId, action) => {
    if (!window.confirm(`Are you sure you want to perform ${action} on this account?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(action === 'suspend' ? { hours: 24, reason: 'Manual admin review suspension' } : { reason: 'Banned by Admin' })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#E5DEC9] pb-4">
        <h3 className="font-serif text-lg font-bold text-[#800020]">User Directory</h3>
        <span className="text-xs text-[#605252]">{total} Members Total</span>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-[#C5A059]" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search members by name, email, or phone..."
          className="w-full pl-10 pr-3 py-2 border border-[#E5DEC9] bg-[#FCFBF7] text-sm focus:outline-none focus:ring-1 focus:ring-[#800020] focus:border-[#800020]"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#605252]">Loading directories...</div>
      ) : (
        <div className="overflow-x-auto border border-[#E5DEC9]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FCFBF7] border-b border-[#E5DEC9] text-[#605252] uppercase font-bold tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">City</th>
                <th className="p-4">Gender</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFEB]">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <strong className="text-[#2C2121]">{u.name}</strong>
                    <span className="block text-[10px] text-[#A09090] mt-0.5">{u.email}</span>
                  </td>
                  <td className="p-4">{u.city || '—'}</td>
                  <td className="p-4 capitalize">{u.gender} · {u.age} yrs</td>
                  <td className="p-4">
                    <span className={`inline-block px-1.5 py-0.5 border text-[9px] font-bold uppercase tracking-widest ${
                      u.isVerified ? 'border-green-600 text-green-700 bg-green-50' : 'border-gray-300 text-gray-500 bg-gray-50'
                    }`}>
                      {u.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-1.5 py-0.5 border text-[9px] font-bold uppercase tracking-widest ${
                      u.status === 'active' ? 'border-green-600 text-green-700' : 'border-red-600 text-red-700'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {u.status !== 'suspended' && (
                        <button
                          onClick={() => handleBlockAction(u._id, 'suspend')}
                          className="px-2 py-1 border border-amber-500 text-amber-600 hover:bg-amber-50 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Suspend 24h
                        </button>
                      )}
                      {u.status !== 'banned' && (
                        <button
                          onClick={() => handleBlockAction(u._id, 'ban')}
                          className="px-2 py-1 border border-red-600 text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Ban
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function VerificationsTabFrame({ token, onLightbox, setSuccess, setError }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/verifications?status=pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (userId, action) => {
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/verify/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, note })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Account verification ${action}d successfully.`);
        setNote('');
        loadPending();
      } else {
        setError(data.message || 'Review failed.');
      }
    } catch (err) {
      setError('Connection failure.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DEC9] pb-4">
        <h3 className="font-serif text-lg font-bold text-[#800020]">National Identity Verification Queue</h3>
        <p className="text-xs text-[#605252]">Approve or reject submitted CNIC and selfie documentation</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#605252]">Loading verification lists...</div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-sm border border-[#E5DEC9] bg-[#FCFBF7] text-[#A09090]">
          Verification queue is currently empty.
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item._id} className="border border-[#E5DEC9] p-6 space-y-4">
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-[#F5EFEB] pb-3">
                <div>
                  <h4 className="font-serif font-bold text-[#800020] text-md">{item.name}</h4>
                  <p className="text-xs text-[#605252]">{item.email} · {item.city} · {item.age} yrs</p>
                </div>
                <span className="border border-[#C5A059] px-2 py-0.5 text-[9px] uppercase tracking-widest font-extrabold text-[#C5A059] bg-white">
                  Verification Pending
                </span>
              </div>

              {/* Document Images thumbnails */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {item.cnicFront && (
                  <div className="border border-[#E5DEC9] p-2 bg-[#FCFBF7] text-center cursor-pointer" onClick={() => onLightbox(item.cnicFront)}>
                    <img src={item.cnicFront} alt="CNIC Front" className="w-full h-32 object-contain" />
                    <span className="block text-[10px] uppercase font-bold text-[#605252] mt-2">CNIC Front (Click)</span>
                  </div>
                )}
                {item.cnicBack && (
                  <div className="border border-[#E5DEC9] p-2 bg-[#FCFBF7] text-center cursor-pointer" onClick={() => onLightbox(item.cnicBack)}>
                    <img src={item.cnicBack} alt="CNIC Back" className="w-full h-32 object-contain" />
                    <span className="block text-[10px] uppercase font-bold text-[#605252] mt-2">CNIC Back (Click)</span>
                  </div>
                )}
                {item.livePhoto && (
                  <div className="border border-[#E5DEC9] p-2 bg-[#FCFBF7] text-center cursor-pointer" onClick={() => onLightbox(item.livePhoto)}>
                    <img src={item.livePhoto} alt="Live Selfie" className="w-full h-32 object-contain" />
                    <span className="block text-[10px] uppercase font-bold text-[#605252] mt-2">Live Selfie (Click)</span>
                  </div>
                )}
              </div>

              {/* Review notes input */}
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Optional review or rejection notes (e.g. CNIC photo blurry)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5DEC9] bg-[#FCFBF7] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => handleReview(item._id, 'reject')}
                  className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Reject Verification
                </button>
                <button
                  onClick={() => handleReview(item._id, 'approve')}
                  style={{ color: '#ffffff' }}
                  className="px-4 py-2 bg-[#800020] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#9E1B32] cursor-pointer !text-white"
                >
                  Approve Verification
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentsTabFrame({ token, onLightbox, setSuccess, setError }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/subscriptions?status=pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.subscriptions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (subId, action) => {
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/subscriptions/${subId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, note })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Payment receipt review ${action}d.`);
        setNote('');
        loadPendingPayments();
      } else {
        setError(data.message || 'Review submission failed.');
      }
    } catch (err) {
      setError('Connection failure.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DEC9] pb-4">
        <h3 className="font-serif text-lg font-bold text-[#800020]">Manual Payments Review Console</h3>
        <p className="text-xs text-[#605252]">Review EasyPaisa or direct Bank Transfer receipts uploaded by users</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#605252]">Retrieving payments...</div>
      ) : subscriptions.length === 0 ? (
        <div className="p-8 text-center text-sm border border-[#E5DEC9] bg-[#FCFBF7] text-[#A09090]">
          No pending payment reviews currently.
        </div>
      ) : (
        <div className="space-y-6">
          {subscriptions.map((sub) => (
            <div key={sub._id} className="border border-[#E5DEC9] p-6 space-y-4">
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-[#F5EFEB] pb-3 text-xs">
                <div>
                  <h4 className="font-serif font-bold text-[#800020] text-sm">{sub.user?.name}</h4>
                  <p className="text-[#605252]">{sub.user?.email}</p>
                  <p className="text-[10px] text-[#A09090] mt-1">Order Date: {new Date(sub.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="block font-serif font-extrabold text-md text-[#C5A059]">PKR {sub.amount?.toLocaleString()}</span>
                  <span className="block text-[10px] uppercase font-bold text-[#800020] capitalize">{sub.plan?.replace(/_/g, ' ')}</span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-600">{sub.paymentMethod?.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {/* Receipt screenshot thumbnail */}
              {sub.receiptUrl ? (
                <div className="flex gap-4 items-center">
                  <div 
                    className="border border-[#E5DEC9] p-1.5 bg-[#FCFBF7] w-32 h-32 cursor-pointer flex items-center justify-center overflow-hidden shrink-0"
                    onClick={() => onLightbox(sub.receiptUrl)}
                  >
                    <img src={sub.receiptUrl} alt="Payment Receipt" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#2C2121]">Payment Reference ID:</span>
                    <span className="font-mono text-sm text-[#800020] font-bold">{sub.paymentReference || 'None Provided'}</span>
                    <button 
                      onClick={() => onLightbox(sub.receiptUrl)}
                      className="mt-2 text-[#C5A059] flex items-center gap-1 hover:underline text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Large Receipt
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 text-xs text-[#A09090]">
                  No receipt screenshot uploaded yet. Waiting for receipt proof.
                </div>
              )}

              {/* Review action notes */}
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Review memo (e.g. payment verified, activating Standard membership)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5DEC9] bg-[#FCFBF7] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => handleReview(sub._id, 'reject')}
                  className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Reject Payment
                </button>
                <button
                  onClick={() => handleReview(sub._id, 'approve')}
                  style={{ color: '#ffffff' }}
                  className="px-4 py-2 bg-[#800020] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#9E1B32] cursor-pointer !text-white"
                >
                  Approve & Activate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportsTabFrame({ token, setSuccess, setError }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [action, setAction] = useState('warned');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/reports?status=pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId, resolution) => {
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: resolution, // 'reviewed' | 'action_taken' | 'dismissed'
          note,
          actionTaken: action // 'warned' | 'suspended_24h' | 'suspended_7d' | 'banned'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Report ticket resolved successfully.`);
        setNote('');
        loadReports();
      } else {
        setError(data.message || 'Resolution failed.');
      }
    } catch (err) {
      setError('Connection error.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DEC9] pb-4">
        <h3 className="font-serif text-lg font-bold text-[#800020]">Chat Moderation & Violations</h3>
        <p className="text-xs text-[#605252]">Manage reported users and safety policy violations</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#605252]">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="p-8 text-center text-sm border border-[#E5DEC9] bg-[#FCFBF7] text-[#A09090]">
          Moderation queue is clean. No active report tickets.
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((r) => (
            <div key={r._id} className="border border-[#E5DEC9] p-6 space-y-4">
              <div className="flex justify-between items-baseline border-b border-[#F5EFEB] pb-3 text-xs">
                <div>
                  <span className="text-[#605252]">Reporter: <strong>{r.reporter?.name}</strong></span>
                  <span className="block text-[10px] text-[#A09090]">{r.reporter?.email}</span>
                </div>
                <div>
                  <span className="text-[#800020]">Reported User: <strong>{r.reported?.name}</strong></span>
                  <span className="block text-[10px] text-[#A09090] text-right">{r.reported?.email}</span>
                </div>
              </div>

              <div className="p-4 bg-[#FAF2F2] border border-red-200">
                <span className="block text-[10px] uppercase font-bold text-[#800020]">Reason / Warning Type</span>
                <p className="text-sm font-bold text-[#800020] uppercase tracking-wider mt-1">{r.reason?.replace(/_/g, ' ')}</p>
              </div>

              {/* Action and Resolution Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#605252] mb-1">Internal Note</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Enter moderation decision note..."
                    className="w-full px-3 py-2 border border-[#E5DEC9] bg-[#FCFBF7] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#605252] mb-1">Sanction Action</label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5DEC9] bg-[#FCFBF7] text-xs"
                  >
                    <option value="warned">Issue Formal Warning</option>
                    <option value="suspended_24h">Suspend 24 Hours</option>
                    <option value="suspended_7d">Suspend 7 Days</option>
                    <option value="banned">Ban Account Permanently</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F5EFEB]">
                <button
                  onClick={() => handleResolve(r._id, 'dismissed')}
                  className="px-3 py-1.5 border border-[#E5DEC9] text-xs font-bold uppercase tracking-wider text-[#605252] hover:bg-gray-50 cursor-pointer"
                >
                  Dismiss Ticket
                </button>
                <button
                  onClick={() => handleResolve(r._id, 'reviewed')}
                  className="px-3 py-1.5 border border-[#C5A059] text-xs font-bold uppercase tracking-wider text-[#C5A059] hover:bg-amber-50 cursor-pointer"
                >
                  Mark Reviewed
                </button>
                <button
                  onClick={() => handleResolve(r._id, 'action_taken')}
                  style={{ color: '#ffffff' }}
                  className="px-4 py-1.5 bg-[#800020] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#9E1B32] cursor-pointer !text-white"
                >
                  Apply Sanctions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BroadcastTabFrame({ token, setSuccess, setError }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !body) return;
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch(`${API_BASE}/admin/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, body })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('System push notification broadcast dispatched successfully!');
        setTitle('');
        setBody('');
      } else {
        setError(data.message || 'Failed to dispatch broadcast.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DEC9] pb-4">
        <h3 className="font-serif text-lg font-bold text-[#800020]">System-Wide Push Notification Broadcast</h3>
        <p className="text-xs text-[#605252]">Dispatch notifications instantly to all registered user mobile devices</p>
      </div>

      <form onSubmit={handleSendBroadcast} className="space-y-6 max-w-xl bg-[#FCFBF7] border border-[#E5DEC9] p-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">
            Notification Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Eid Mubarak from Shadii.pk!"
            className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-white text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">
            Notification Message Body
          </label>
          <textarea
            required
            rows="5"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="e.g. We wish you a blessed union. Keep checking your discover feed for today's matchmaking updates."
            className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-white text-sm"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            style={{ color: '#ffffff' }}
            className="px-6 py-3 bg-[#800020] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#9E1B32] transition-colors cursor-pointer !text-white"
          >
            {loading ? 'Dispatching Notification...' : 'Dispatch Notification Broadcast'}
          </button>
        </div>
      </form>
    </div>
  );
}
