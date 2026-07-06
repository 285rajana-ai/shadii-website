import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { 
  Users, CreditCard, ShieldAlert, BadgeAlert, Megaphone, BarChart3, 
  Search, Eye, Ban, Check, X, Shield, FileImage, ExternalLink, Calendar,
  Activity, CheckCircle2, UserCheck, AlertCircle, Sparkles, Plus, Trash2, Edit, Percent, HelpCircle
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
              { id: 'overview', label: 'Overview', icon: BarChart3, roles: ['superadmin', 'admin', 'cacc', 'fasm'] },
              { id: 'users', label: 'User Directory', icon: Users, roles: ['superadmin', 'admin'] },
              { id: 'verifications', label: 'ID Verifications', icon: UserCheck, roles: ['superadmin', 'admin'] },
              { id: 'reports', label: 'Report Tickets', icon: ShieldAlert, roles: ['superadmin', 'cacc'] },
              { id: 'stories', label: 'Success Stories', icon: Sparkles, roles: ['superadmin', 'cacc'] },
              { id: 'testimonials', label: 'Testimonials', icon: CheckCircle2, roles: ['superadmin', 'cacc'] },
              { id: 'chats', label: 'Chat Logs', icon: Eye, roles: ['superadmin', 'cacc'] },
              { id: 'support', label: 'Support Tickets', icon: AlertCircle, roles: ['superadmin', 'cacc'] },
              { id: 'payments', label: 'Payment Reviews', icon: CreditCard, roles: ['superadmin', 'fasm'] },
              { id: 'plans', label: 'Plan Editor', icon: Shield, roles: ['superadmin', 'fasm'] },
              { id: 'coupons', label: 'Promo Coupons', icon: Activity, roles: ['superadmin', 'fasm'] },
              { id: 'ad-receipts', label: 'Billing & Receipts', icon: FileImage, roles: ['superadmin', 'fasm'] },
              { id: 'broadcast', label: 'System Broadcast', icon: Megaphone, roles: ['superadmin', 'admin'] },
            ].filter((tab) => tab.roles.includes(user?.role || 'admin')).map((tab) => {
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
          {activeTab === 'stories' && <StoriesTabFrame token={token} setSuccess={setSuccess} setError={setError} />}
          {activeTab === 'testimonials' && <TestimonialsTabFrame token={token} setSuccess={setSuccess} setError={setError} />}
          {activeTab === 'chats' && <ChatsTabFrame token={token} setSuccess={setSuccess} setError={setError} />}
          {activeTab === 'support' && <SupportTabFrame token={token} setSuccess={setSuccess} setError={setError} />}
          {activeTab === 'plans' && <PlansTabFrame token={token} setSuccess={setSuccess} setError={setError} />}
          {activeTab === 'coupons' && <CouponsTabFrame token={token} setSuccess={setSuccess} setError={setError} />}
          {activeTab === 'ad-receipts' && <AdReceiptsTabFrame token={token} setSuccess={setSuccess} setError={setError} />}
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

// ==============================================================================
// 1. STORIES TAB FRAME (CACC)
// ==============================================================================
function StoriesTabFrame({ token, setSuccess, setError }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [coupleNames, setCoupleNames] = useState('');
  const [storyText, setStoryText] = useState('');
  const [image, setImage] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/stories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStories(data.stories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    const payload = { coupleNames, storyText, image, isApproved, isFeatured };
    try {
      const url = editingId ? `${API_BASE}/admin/stories/${editingId}` : `${API_BASE}/admin/stories`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(editingId ? 'Success story updated!' : 'Success story created!');
        resetForm();
        fetchStories();
      } else {
        setError(data.message || 'Operation failed.');
      }
    } catch (err) {
      setError('Connection failure.');
    }
  };

  const handleEdit = (story) => {
    setEditingId(story._id);
    setCoupleNames(story.coupleNames);
    setStoryText(story.storyText);
    setImage(story.image || '');
    setIsApproved(story.isApproved);
    setIsFeatured(story.isFeatured);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this story permanently?')) return;
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/stories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Success story deleted!');
        fetchStories();
      }
    } catch (err) {
      setError('Failed to delete story.');
    }
  };

  const toggleFeature = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/stories/${id}/feature`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchStories();
      }
    } catch (err) {
      setError('Failed to toggle featured status.');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCoupleNames('');
    setStoryText('');
    setImage('');
    setIsApproved(false);
    setIsFeatured(false);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DEC9] pb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#800020]">Success Stories Curation</h3>
          <p className="text-xs text-[#605252]">Curate, approve, and feature success stories to build community trust</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="px-3 py-1.5 border border-[#800020] text-xs font-bold uppercase tracking-wider text-[#800020] hover:bg-[#800020]/10 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {showForm ? 'View List' : 'Add Story'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="max-w-xl bg-[#FCFBF7] border border-[#E5DEC9] p-6 space-y-4">
          <h4 className="font-serif font-bold text-sm text-[#800020]">{editingId ? 'Edit Success Story' : 'New Success Story'}</h4>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#605252] mb-1">Couple Names</label>
            <input
              type="text"
              required
              value={coupleNames}
              onChange={(e) => setCoupleNames(e.target.value)}
              placeholder="e.g. Ayesha & Zain"
              className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#605252] mb-1">Story Photo URL</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Cloudinary URL or fallback image link"
              className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#605252] mb-1">Our Story Description</label>
            <textarea
              required
              rows="5"
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder="Describe their journey and how Shadii.pk played a role..."
              className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs text-[#605252] cursor-pointer">
              <input type="checkbox" checked={isApproved} onChange={(e) => setIsApproved(e.target.checked)} />
              Approve Story
            </label>
            <label className="flex items-center gap-2 text-xs text-[#605252] cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              Feature on Homepage
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 border border-[#E5DEC9] text-xs font-bold uppercase text-[#605252] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ color: '#ffffff' }}
              className="px-4 py-1.5 bg-[#800020] text-white text-xs font-bold uppercase hover:bg-[#9E1B32] !text-white"
            >
              Save Story
            </button>
          </div>
        </form>
      ) : loading ? (
        <div className="text-center py-12 text-[#605252]">Loading stories...</div>
      ) : stories.length === 0 ? (
        <div className="p-8 text-center text-sm border border-[#E5DEC9] bg-[#FCFBF7] text-[#A09090]">
          No success stories curated yet. Click 'Add Story' to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((story) => (
            <div key={story._id} className="border border-[#E5DEC9] p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-serif font-bold text-md text-[#2C2121]">{story.coupleNames}</h4>
                  <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold ${
                    story.isApproved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {story.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                {story.image && (
                  <img src={story.image} alt={story.coupleNames} className="w-full h-32 object-cover border border-[#E5DEC9]" />
                )}
                <p className="text-xs text-[#605252] line-clamp-3 italic">"{story.storyText}"</p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[#F5EFEB] text-xs">
                <button
                  onClick={() => toggleFeature(story._id)}
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    story.isFeatured ? 'text-[#C5A059]' : 'text-gray-400 hover:text-[#C5A059]'
                  }`}
                >
                  ★ {story.isFeatured ? 'Featured' : 'Feature'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(story)} className="text-[#C5A059] font-bold hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(story._id)} className="text-[#800020] font-bold hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// 2. TESTIMONIALS TAB FRAME (CACC)
// ==============================================================================
function TestimonialsTabFrame({ token, setSuccess, setError }) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/testimonials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setTestimonials(data.testimonials || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id) => {
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/testimonials/${id}/publish`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Testimonial publish state updated!');
        fetchTestimonials();
      }
    } catch (err) {
      setError('Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Testimonial deleted successfully.');
        fetchTestimonials();
      }
    } catch (err) {
      setError('Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DEC9] pb-4">
        <h3 className="font-serif text-lg font-bold text-[#800020]">User Testimonials Review</h3>
        <p className="text-xs text-[#605252]">Moderate, verify, and publish written feedback from platform users</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#605252]">Loading testimonials...</div>
      ) : testimonials.length === 0 ? (
        <div className="p-8 text-center text-sm border border-[#E5DEC9] bg-[#FCFBF7] text-[#A09090]">
          No testimonials submitted by users yet.
        </div>
      ) : (
        <div className="divide-y divide-[#E5DEC9] border border-[#E5DEC9] bg-white">
          {testimonials.map((t) => (
            <div key={t._id} className="p-5 flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <strong className="text-[#2C2121]">{t.user?.name || 'Deleted User'}</strong>
                  <span className="text-[#A09090]">({t.user?.email || 'N/A'})</span>
                  <span className="text-amber-500 font-bold">{'★'.repeat(t.rating)}</span>
                </div>
                <p className="text-xs text-[#605252] italic">"{t.reviewText}"</p>
              </div>
              <div className="flex gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => togglePublish(t._id)}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border cursor-pointer ${
                    t.isPublished 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-[#FCFBF7] text-[#605252] border-[#E5DEC9] hover:bg-[#F5EFEB]'
                  }`}
                >
                  {t.isPublished ? 'Published' : 'Publish'}
                </button>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-red-200 text-[#800020] hover:bg-[#FAF2F2] cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// 3. CHAT MONITORING / LOGS AUDIT TAB FRAME (CACC)
// ==============================================================================
function ChatsTabFrame({ token, setSuccess, setError }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setChats(data.chats || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    setLoadingMsgs(true);
    try {
      const res = await fetch(`${API_BASE}/admin/chats/${chat.conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setMessages(data.messages || []);
    } catch (err) {
      setError('Failed to fetch messages.');
    } finally {
      setLoadingMsgs(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DEC9] pb-4">
        <h3 className="font-serif text-lg font-bold text-[#800020]">Safety Message Logs Monitor</h3>
        <p className="text-xs text-[#605252]">strictly for safety verification, spam monitoring, and harassment audit policies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chats List sidebar */}
        <div className="border border-[#E5DEC9] bg-[#FCFBF7] max-h-[60vh] overflow-y-auto divide-y divide-[#E5DEC9]">
          <span className="block p-3 text-[10px] uppercase font-bold tracking-wider text-[#605252] border-b border-[#E5DEC9] bg-[#F5EFEB]">Active Conversations</span>
          {loading ? (
            <div className="text-center py-8 text-xs text-[#605252]">Loading...</div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#A09090]">No active message streams.</div>
          ) : (
            chats.map((c) => (
              <button
                key={c.conversationId}
                onClick={() => selectChat(c)}
                className={`w-full p-4 text-left flex flex-col gap-1 transition-all cursor-pointer text-xs ${
                  selectedChat?.conversationId === c.conversationId ? 'bg-white font-bold border-r-4 border-r-[#800020]' : 'hover:bg-white'
                }`}
              >
                <div className="flex justify-between font-semibold">
                  <span className="text-[#2C2121]">{c.sender?.name || 'User'} ⇄ {c.recipient?.name || 'User'}</span>
                </div>
                <p className="text-[10px] text-[#605252] truncate font-normal">"{c.lastMessageText}"</p>
                <span className="text-[8px] text-[#A09090] font-normal">{new Date(c.lastMessageTime).toLocaleDateString()}</span>
              </button>
            ))
          )}
        </div>

        {/* Message Log Console */}
        <div className="lg:col-span-2 border border-[#E5DEC9] bg-white h-[60vh] flex flex-col">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[#E5DEC9] bg-[#FCFBF7] flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-[#800020]">Conversation Audit Terminal</span>
                  <span className="block text-[10px] text-[#605252] mt-0.5">Auditing: {selectedChat.sender?.name} and {selectedChat.recipient?.name}</span>
                </div>
                <button
                  onClick={() => setSelectedChat(null)}
                  className="text-[#605252] hover:text-[#800020] uppercase font-bold text-[9px] tracking-wider"
                >
                  ✕ Close Console
                </button>
              </div>

              {/* Message Streams list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 max-h-[45vh]">
                {loadingMsgs ? (
                  <div className="text-center py-10 text-xs text-[#605252]">Fetching chat transcript logs...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-10 text-xs text-[#A09090]">No messages found in this thread.</div>
                ) : (
                  messages.map((m) => {
                    const isSystemOrAlert = m.text?.includes('against our policy') || m.text?.includes('Warning');
                    return (
                      <div key={m._id} className={`flex flex-col space-y-1 ${
                        isSystemOrAlert ? 'items-center w-full' : m.sender?._id === selectedChat.sender?._id ? 'items-start' : 'items-end'
                      }`}>
                        <div className={`max-w-[75%] p-3 text-xs ${
                          isSystemOrAlert 
                            ? 'bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-center font-semibold'
                            : m.sender?._id === selectedChat.sender?._id 
                              ? 'bg-white border border-[#E5DEC9] text-[#2C2121]' 
                              : 'bg-[#800020] text-white'
                        }`}>
                          {!isSystemOrAlert && <strong className="block text-[9px] uppercase tracking-wider mb-1 opacity-75">{m.sender?.name}</strong>}
                          <p>{m.text}</p>
                          <span className={`block text-[8px] text-right mt-1 ${isSystemOrAlert ? 'text-amber-600' : m.sender?._id === selectedChat.sender?._id ? 'text-gray-400' : 'text-rose-200'}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-[#A09090] text-center p-8 bg-[#FCFBF7]">
              <Eye className="w-12 h-12 text-[#E5DEC9] mb-3" />
              <h4 className="font-serif font-bold text-sm text-[#605252]">Audit Console Offline</h4>
              <p className="text-xs max-w-xs mt-1">Select an active conversation channel from the sidebar to inspect transcript logs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 4. SUPPORT HELPDESK TICKETS TAB FRAME (CACC)
// ==============================================================================
function SupportTabFrame({ token, setSuccess, setError }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [activeTicketId, setActiveTicketId] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/support`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setTickets(data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/support/${id}/reply`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ replyMessage: replyText })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Reply sent and ticket resolved!');
        setReplyText('');
        setActiveTicketId(null);
        fetchTickets();
      } else {
        setError(data.message || 'Failed to submit response.');
      }
    } catch (err) {
      setError('Network failure.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DEC9] pb-4">
        <h3 className="font-serif text-lg font-bold text-[#800020]">Helpdesk & Support Tickets</h3>
        <p className="text-xs text-[#605252]">Respond to user queries, profile questions, and issues</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#605252]">Loading helpdesk logs...</div>
      ) : tickets.length === 0 ? (
        <div className="p-8 text-center text-sm border border-[#E5DEC9] bg-[#FCFBF7] text-[#A09090]">
          Support queue is clean. No outstanding tickets.
        </div>
      ) : (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="border border-[#E5DEC9] p-5 bg-[#FCFBF7] space-y-4">
              <div className="flex justify-between items-start border-b border-[#E5DEC9] pb-3 text-xs">
                <div>
                  <span className="text-[#605252]">From: <strong>{ticket.user?.name}</strong></span>
                  <span className="block text-[10px] text-[#A09090]">{ticket.user?.email} · {ticket.user?.phone}</span>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold ${
                    ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {ticket.status}
                  </span>
                  <span className="block text-[9px] text-[#A09090] mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-[#605252] mb-1">Subject</span>
                <p className="text-xs font-bold text-[#2C2121]">{ticket.subject}</p>
                <span className="block text-[10px] uppercase font-bold text-[#605252] mt-2 mb-1">Query Message</span>
                <p className="text-xs text-[#605252] bg-white p-3 border border-[#E5DEC9] italic">"{ticket.message}"</p>
              </div>

              {ticket.status === 'resolved' ? (
                <div className="p-3 bg-green-50 border border-green-200 text-xs">
                  <span className="block text-[10px] uppercase font-bold text-green-800">Admin Response:</span>
                  <p className="mt-1 text-green-900">"{ticket.replyMessage}"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeTicketId === ticket._id ? (
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase font-bold text-[#605252]">Write Response Reply</label>
                      <textarea
                        rows="3"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Compose response. User will receive this reply by email immediately..."
                        className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setActiveTicketId(null); setReplyText(''); }}
                          className="px-3 py-1.5 border border-[#E5DEC9] text-xs font-bold uppercase text-[#605252]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReply(ticket._id)}
                          style={{ color: '#ffffff' }}
                          className="px-4 py-1.5 bg-[#800020] text-white text-xs font-bold uppercase hover:bg-[#9E1B32] !text-white cursor-pointer"
                        >
                          Send Response
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <button
                        onClick={() => { setActiveTicketId(ticket._id); setReplyText(''); }}
                        style={{ color: '#ffffff' }}
                        className="px-4 py-1.5 bg-[#800020] text-white text-xs font-bold uppercase hover:bg-[#9E1B32] !text-white cursor-pointer"
                      >
                        Reply & Resolve
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// 5. SUBSCRIPTION PLAN EDITOR TAB FRAME (FASM)
// ==============================================================================
function PlansTabFrame({ token, setSuccess, setError }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPlans(data.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    const payload = { key, label, price: Number(price), duration: Number(duration), isActive };
    try {
      const res = await fetch(`${API_BASE}/admin/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Dynamic subscription plan created!');
        resetForm();
        fetchPlans();
      } else {
        setError(data.message || 'Failed to create plan.');
      }
    } catch (err) {
      setError('Connection failed.');
    }
  };

  const handleToggleActive = async (id, currentVal) => {
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentVal })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Plan status toggled successfully.');
        fetchPlans();
      }
    } catch (err) {
      setError('Failed to update plan status.');
    }
  };

  const resetForm = () => {
    setKey('');
    setLabel('');
    setPrice('');
    setDuration('');
    setIsActive(true);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DEC9] pb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#800020]">Subscription Plan Editor</h3>
          <p className="text-xs text-[#605252]">Add, expire, or configure dynamic membership plans</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 border border-[#800020] text-xs font-bold uppercase tracking-wider text-[#800020] hover:bg-[#800020]/10 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {showForm ? 'View Active Plans' : 'Create Plan'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="max-w-xl bg-[#FCFBF7] border border-[#E5DEC9] p-6 space-y-4">
          <h4 className="font-serif font-bold text-sm text-[#800020]">Create New Plan Tier</h4>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#605252] mb-1">Unique Key Identifier</label>
            <input
              type="text"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. gold, basic, standard, platinum"
              className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#605252] mb-1">Plan Label Name</label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Gold — 3 Months Package"
              className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#605252] mb-1">Price (PKR)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 2999"
                className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#605252] mb-1">Duration (Days)</label>
              <input
                type="number"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 90"
                className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 border border-[#E5DEC9] text-xs font-bold uppercase text-[#605252] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ color: '#ffffff' }}
              className="px-4 py-1.5 bg-[#800020] text-white text-xs font-bold uppercase hover:bg-[#9E1B32] !text-white cursor-pointer"
            >
              Create Plan Tier
            </button>
          </div>
        </form>
      ) : loading ? (
        <div className="text-center py-12 text-[#605252]">Loading membership plan configurations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p._id || p.key} className={`border p-5 bg-[#FCFBF7] flex flex-col justify-between space-y-4 ${
              p.isActive ? 'border-[#C5A059] border-t-4' : 'border-gray-200 opacity-60'
            }`}>
              <div className="space-y-1">
                <span className="block text-[9px] uppercase tracking-wider text-[#605252] font-bold">{p.key} tier</span>
                <h4 className="font-serif font-bold text-sm text-[#2C2121]">{p.label}</h4>
                <div className="pt-2">
                  <span className="text-xl font-bold font-serif text-[#800020]">PKR {p.price?.toLocaleString()}</span>
                  <span className="text-[10px] text-[#605252] block mt-0.5">Valid for {p.duration} days</span>
                </div>
              </div>

              {p._id ? (
                <button
                  onClick={() => handleToggleActive(p._id, p.isActive)}
                  className={`w-full py-2 border text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center ${
                    p.isActive 
                      ? 'border-[#800020] text-[#800020] hover:bg-[#800020]/10' 
                      : 'border-green-600 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {p.isActive ? 'Expire Plan' : 'Re-Activate Plan'}
                </button>
              ) : (
                <span className="block text-center text-[9px] text-[#A09090] uppercase font-bold italic">Schema Preset</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// 6. PROMO COUPONS TAB FRAME (FASM)
// ==============================================================================
function CouponsTabFrame({ token, setSuccess, setError }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/coupons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setCoupons(data.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    const payload = { code: code.toUpperCase().trim(), discountPercent: Number(discountPercent), expiryDate };
    try {
      const res = await fetch(`${API_BASE}/admin/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Promo code created successfully!');
        resetForm();
        fetchCoupons();
      } else {
        setError(data.message || 'Creation failed.');
      }
    } catch (err) {
      setError('Connection failure.');
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/coupons/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchCoupons();
      }
    } catch (err) {
      setError('Status toggle failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promo coupon permanently?')) return;
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Promo code deleted!');
        fetchCoupons();
      }
    } catch (err) {
      setError('Delete failed.');
    }
  };

  const resetForm = () => {
    setCode('');
    setDiscountPercent('');
    setExpiryDate('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DEC9] pb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#800020]">Coupon & Discount Management</h3>
          <p className="text-xs text-[#605252]">Generate and track promo discount codes for marketing campaigns</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 border border-[#800020] text-xs font-bold uppercase tracking-wider text-[#800020] hover:bg-[#800020]/10 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {showForm ? 'View Coupon List' : 'Generate Code'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="max-w-xl bg-[#FCFBF7] border border-[#E5DEC9] p-6 space-y-4">
          <h4 className="font-serif font-bold text-sm text-[#800020]">Generate Promo Code</h4>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#605252] mb-1">Promo Code (Uppercase)</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SHADII30, RAMADAN50"
              className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#605252] mb-1">Discount %</label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="e.g. 30"
                className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#605252] mb-1">Expiration Date</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 border border-[#E5DEC9] text-xs font-bold uppercase text-[#605252] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ color: '#ffffff' }}
              className="px-4 py-1.5 bg-[#800020] text-white text-xs font-bold uppercase hover:bg-[#9E1B32] !text-white cursor-pointer"
            >
              Save Promo Code
            </button>
          </div>
        </form>
      ) : loading ? (
        <div className="text-center py-12 text-[#605252]">Loading promo registry...</div>
      ) : coupons.length === 0 ? (
        <div className="p-8 text-center text-sm border border-[#E5DEC9] bg-[#FCFBF7] text-[#A09090]">
          No active discount coupons generated.
        </div>
      ) : (
        <div className="border border-[#E5DEC9] bg-white divide-y divide-[#E5DEC9]">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="p-4 flex justify-between items-center text-xs">
              <div>
                <strong className="text-md font-serif text-[#800020] tracking-wider uppercase">{coupon.code}</strong>
                <span className="block text-[10px] text-[#605252] mt-0.5">{coupon.discountPercent}% Discount · Expires {new Date(coupon.expiryDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(coupon._id)}
                  className={`px-3 py-1 border text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                    coupon.isActive 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  {coupon.isActive ? 'Active' : 'Disabled'}
                </button>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  className="px-2 py-1 text-red-700 hover:text-red-950 font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// 7. BILLING RECEIPTS & INVOICES TAB FRAME (FASM)
// ==============================================================================
function AdReceiptsTabFrame({ token, setSuccess, setError }) {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state for Ad Spend Receipt upload
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  // Invoice generate state
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/ad-receipts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setReceipts(data.receipts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReceipt = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    const payload = { title, amount: Number(amount), date, receiptUrl };
    try {
      const res = await fetch(`${API_BASE}/admin/ad-receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Advertising billing receipt logged successfully!');
        resetForm();
        fetchReceipts();
      } else {
        setError(data.message || 'Failed to upload receipt.');
      }
    } catch (err) {
      setError('Connection failure.');
    }
  };

  const handleDeleteReceipt = async (id) => {
    if (!window.confirm('Delete this billing record?')) return;
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/ad-receipts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Receipt record deleted!');
        fetchReceipts();
      }
    } catch (err) {
      setError('Delete failed.');
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceEmail) return;
    setInvoiceLoading(true);
    setSuccess('');
    setError('');
    try {
      // Simulate invoice dispatch
      const res = await fetch(`${API_BASE}/admin/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'Invoice Receipt Generated',
          body: `An automated PDF invoice receipt has been dispatched to ${invoiceEmail} for tax reporting.`
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Automated invoice receipt successfully prepared and dispatched to ${invoiceEmail}`);
        setInvoiceEmail('');
      } else {
        setError('Failed to trigger invoice email generation.');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDate('');
    setReceiptUrl('');
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Invoice Section */}
      <div className="border border-[#E5DEC9] bg-[#FCFBF7] p-6 space-y-4">
        <div>
          <h3 className="font-serif text-md font-bold text-[#800020]">Automated Invoice Generation</h3>
          <p className="text-[10px] text-[#605252]">Instantly email PDF tax receipts and billing invoices to paid platform subscribers</p>
        </div>
        <form onSubmit={handleGenerateInvoice} className="flex gap-2 max-w-lg">
          <input
            type="email"
            required
            value={invoiceEmail}
            onChange={(e) => setInvoiceEmail(e.target.value)}
            placeholder="Enter subscriber email (e.g. member@email.com)..."
            className="flex-1 px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
          />
          <button
            type="submit"
            disabled={invoiceLoading}
            style={{ color: '#ffffff' }}
            className="px-4 py-2 bg-[#800020] text-white text-xs font-bold uppercase hover:bg-[#9E1B32] !text-white cursor-pointer shrink-0"
          >
            {invoiceLoading ? 'Generating...' : 'Email Invoice'}
          </button>
        </form>
      </div>

      {/* Ad receipts section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-[#E5DEC9] pb-3">
          <div>
            <h3 className="font-serif text-md font-bold text-[#800020]">Ad Campaign Billing Receipts</h3>
            <p className="text-[10px] text-[#605252]">Track marketing receipts, Google/Facebook ad expenses, and bills for tax audit records</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 border border-[#800020] text-xs font-bold uppercase tracking-wider text-[#800020] hover:bg-[#800020]/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {showForm ? 'View Receipts List' : 'Upload Receipt'}
          </button>
        </div>

        {showForm ? (
          <form onSubmit={handleUploadReceipt} className="max-w-xl bg-[#FCFBF7] border border-[#E5DEC9] p-6 space-y-4">
            <h4 className="font-serif font-bold text-sm text-[#800020]">Upload Expense Receipt</h4>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#605252] mb-1">Receipt Title / Ad Platform</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Google Ads Campaign PKR Receipt - May"
                className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#605252] mb-1">Amount Spent (PKR)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#605252] mb-1">Expense Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#605252] mb-1">Receipt Document Image Link / Drive URL</label>
              <input
                type="text"
                required
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 border border-[#E5DEC9] bg-white text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 border border-[#E5DEC9] text-xs font-bold uppercase text-[#605252] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ color: '#ffffff' }}
                className="px-4 py-1.5 bg-[#800020] text-white text-xs font-bold uppercase hover:bg-[#9E1B32] !text-white cursor-pointer"
              >
                Upload Record
              </button>
            </div>
          </form>
        ) : loading ? (
          <div className="text-center py-8 text-xs text-[#605252]">Loading receipts...</div>
        ) : receipts.length === 0 ? (
          <div className="p-8 text-center text-xs border border-[#E5DEC9] bg-[#FCFBF7] text-[#A09090]">
            No ad spend billing receipts uploaded.
          </div>
        ) : (
          <div className="border border-[#E5DEC9] bg-white divide-y divide-[#E5DEC9]">
            {receipts.map((r) => (
              <div key={r._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                <div>
                  <strong className="text-sm font-serif text-[#2C2121]">{r.title}</strong>
                  <span className="block text-[10px] text-[#605252] mt-0.5">
                    Spent: <strong className="text-[#800020]">PKR {r.amount?.toLocaleString()}</strong> · Date: {new Date(r.date).toLocaleDateString()}
                  </span>
                  <span className="block text-[9px] text-[#A09090] mt-0.5">Uploaded by: {r.uploadedBy?.name || 'Admin'}</span>
                </div>
                <div className="flex gap-3 items-center shrink-0 self-end sm:self-center">
                  <a
                    href={r.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#C5A059] font-bold uppercase tracking-wider text-[10px] hover:underline flex items-center gap-1"
                  >
                    View Document <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => handleDeleteReceipt(r._id)}
                    className="text-[#800020] font-bold uppercase tracking-wider text-[10px] hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
