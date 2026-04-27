import { useState, useEffect, useCallback } from 'react'
import './App.css'

const API = 'http://localhost:5000/api'

function useApi<T>(url: string, token: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token || !url) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}${url}`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      if (json.success) setData(json as T)
      else setError(json.message || 'Error')
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }, [url, token, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])
  return { data, loading, error, refresh: load }
}

// ─── Login Screen ──────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (json.success && json.user?.isAdmin) {
        localStorage.setItem('admin_token', json.token)
        onLogin(json.token)
      } else if (json.success && !json.user?.isAdmin) {
        setError('Access denied: admin only')
      } else {
        setError(json.message || 'Invalid credentials')
      }
    } catch {
      setError('Cannot connect to server')
    }
    setLoading(false)
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-icon">💕</div>
          <h1>Shadii.pk Admin</h1>
          <p>Dashboard v2.0</p>
        </div>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={submit} className="login-form">
          <div className="field">
            <label>Admin Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@shadii.pk" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────
interface DashStats { totalUsers: number; activeUsers: number; totalFemale: number; totalMale: number; pendingVerifications: number; flaggedUsers: number; totalReports: number; pendingReports: number; activeSubscriptions: number; totalRevenue: number }

function Dashboard({ token }: { token: string }) {
  const { data, loading } = useApi<{ stats: DashStats }>('/admin/dashboard', token)
  const s = data?.stats

  const cards = s ? [
    { label: 'Total Users', value: s.totalUsers.toLocaleString(), icon: '👥', sub: `${s.activeUsers} active (7d)`, color: 'blue' },
    { label: 'Active Subscriptions', value: s.activeSubscriptions.toLocaleString(), icon: '💳', sub: `PKR ${(s.totalRevenue/1000).toFixed(1)}k revenue`, color: 'green' },
    { label: 'Pending Verifications', value: s.pendingVerifications.toLocaleString(), icon: '🛡️', sub: 'Needs review', color: s.pendingVerifications > 0 ? 'orange' : 'green' },
    { label: 'Pending Reports', value: s.pendingReports.toLocaleString(), icon: '⚠️', sub: `${s.totalReports} total reports`, color: s.pendingReports > 0 ? 'red' : 'green' },
    { label: 'Flagged Users', value: s.flaggedUsers.toLocaleString(), icon: '🚩', sub: 'Contact info violations', color: 'orange' },
    { label: 'Female / Male', value: `${s.totalFemale} / ${s.totalMale}`, icon: '⚤', sub: 'Gender distribution', color: 'purple' },
  ] : []

  if (loading) return <div className="loading-state">Loading dashboard…</div>

  return (
    <div>
      <div className="section-header"><h2>Overview</h2><span className="badge-success">Live Data</span></div>
      <div className="stats-grid">
        {cards.map((c, i) => (
          <div key={i} className={`stat-card stat-${c.color}`}>
            <div className="stat-top"><span className="stat-icon">{c.icon}</span><div className="stat-number">{c.value}</div></div>
            <div className="stat-label">{c.label}</div>
            <div className="stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Users Management ─────────────────────────────────────────────
interface AdminUser { _id: string; name: string; email: string; phone?: string; gender: string; age: number; city?: string; status: string; isVerified: boolean; flagCount: number; createdAt: string }

function UsersTab({ token }: { token: string }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20', ...(search && { search }), ...(status && { status }) })
    try {
      const res = await fetch(`${API}/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      if (json.success) { setUsers(json.users); setTotal(json.total) }
    } catch { /* ignore */ }
    setLoading(false)
  }, [token, search, status, page])

  useEffect(() => { load() }, [load])

  const doAction = async (userId: string, action: 'suspend' | 'ban' | 'unsuspend') => {
    setActionLoading(userId + action)
    try {
      const url = action === 'suspend' ? `/admin/users/${userId}/suspend` : action === 'ban' ? `/admin/users/${userId}/ban` : `/admin/users/${userId}/unsuspend`
      const body = action === 'suspend' ? { hours: 24, reason: 'Admin action' } : undefined
      const res = await fetch(`${API}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined })
      const json = await res.json()
      setMsg(json.message || 'Done')
      setTimeout(() => setMsg(''), 3000)
      load()
    } catch { /* ignore */ }
    setActionLoading('')
  }

  const statusColor: Record<string, string> = { active: 'badge-success', suspended: 'badge-warning', banned: 'badge-danger', pending: 'badge-info' }

  return (
    <div>
      <div className="section-header"><h2>User Management</h2><span className="text-muted">{total} total users</span></div>
      {msg && <div className="toast">{msg}</div>}
      <div className="filter-row">
        <input className="search-input" placeholder="Search name, email, phone…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        <select className="filter-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>
      <div className="table-card">
        {loading ? <div className="loading-state">Loading…</div> : (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Gender</th><th>City</th><th>Status</th><th>Verified</th><th>Flags</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong><div className="text-muted text-xs">{u.age} yrs</div></td>
                  <td>{u.email}</td>
                  <td className="capitalize">{u.gender}</td>
                  <td>{u.city || '—'}</td>
                  <td><span className={`badge ${statusColor[u.status] || 'badge-info'}`}>{u.status}</span></td>
                  <td>{u.isVerified ? '✅' : '—'}</td>
                  <td>{u.flagCount > 0 ? <span className="badge badge-warning">{u.flagCount}</span> : '0'}</td>
                  <td>
                    <div className="action-btns">
                      {u.status === 'suspended' && <button className="btn-approve" onClick={() => doAction(u._id, 'unsuspend')} disabled={actionLoading === u._id + 'unsuspend'}>Unsuspend</button>}
                      {u.status === 'active' && <button className="btn-suspend" onClick={() => doAction(u._id, 'suspend')} disabled={actionLoading === u._id + 'suspend'}>Suspend 24h</button>}
                      {u.status !== 'banned' && <button className="btn-ban" onClick={() => { if (confirm(`Permanently ban ${u.name}?`)) doAction(u._id, 'ban') }} disabled={actionLoading === u._id + 'ban'}>Ban</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page} of {Math.ceil(total / 20)}</span>
          <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      </div>
    </div>
  )
}

// ─── Verification Queue ───────────────────────────────────────────
interface VerifyUser { _id: string; name: string; email: string; gender: string; age: number; city?: string; cnicFront?: string; cnicBack?: string; livePhoto?: string; createdAt: string }

function VerificationTab({ token }: { token: string }) {
  const { data, loading, refresh } = useApi<{ users: VerifyUser[] }>('/admin/verifications', token)
  const [note, setNote] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState('')
  const [msg, setMsg] = useState('')

  const doVerify = async (userId: string, action: 'approve' | 'reject') => {
    setActionLoading(userId + action)
    try {
      const res = await fetch(`${API}/admin/verify/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, note: note[userId] || '' }),
      })
      const json = await res.json()
      setMsg(json.message || 'Done')
      setTimeout(() => setMsg(''), 3000)
      refresh()
    } catch { /* ignore */ }
    setActionLoading('')
  }

  if (loading) return <div className="loading-state">Loading verifications…</div>
  const users = data?.users || []

  return (
    <div>
      <div className="section-header"><h2>CNIC Verification Queue</h2><span className="badge-warning">{users.length} pending</span></div>
      {msg && <div className="toast">{msg}</div>}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal-img-wrap" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPreview(null)}>✕</button>
            <img src={preview} alt="Document" className="modal-img" />
          </div>
        </div>
      )}
      {users.length === 0 ? (
        <div className="empty-state"><span className="empty-icon">✅</span><h3>All clear!</h3><p>No pending verifications at the moment.</p></div>
      ) : (
        <div className="verify-cards">
          {users.map(u => (
            <div key={u._id} className="verify-card">
              <div className="verify-head">
                <div className="verify-avatar">{u.name[0]}</div>
                <div>
                  <div className="verify-name">{u.name}</div>
                  <div className="text-muted text-sm">{u.gender} · {u.age} yrs · {u.city}</div>
                  <div className="text-muted text-xs">{u.email}</div>
                </div>
              </div>
              <div className="doc-images">
                {u.cnicFront && <div className="doc-thumb" onClick={() => setPreview(u.cnicFront!)}><img src={u.cnicFront} alt="CNIC Front" /><span>CNIC Front</span></div>}
                {u.cnicBack && <div className="doc-thumb" onClick={() => setPreview(u.cnicBack!)}><img src={u.cnicBack} alt="CNIC Back" /><span>CNIC Back</span></div>}
                {u.livePhoto && <div className="doc-thumb" onClick={() => setPreview(u.livePhoto!)}><img src={u.livePhoto} alt="Live Selfie" /><span>Live Selfie</span></div>}
              </div>
              <div className="verify-actions">
                <input className="note-input" placeholder="Rejection note (optional)…" value={note[u._id] || ''} onChange={e => setNote(n => ({ ...n, [u._id]: e.target.value }))} />
                <div className="action-btns">
                  <button className="btn-approve" onClick={() => doVerify(u._id, 'approve')} disabled={!!actionLoading}>✅ Approve</button>
                  <button className="btn-reject" onClick={() => doVerify(u._id, 'reject')} disabled={!!actionLoading}>❌ Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Reports & Flags ──────────────────────────────────────────────
interface AdminReport { _id: string; reporter?: { name: string; email: string }; reported?: { name: string; email: string; gender: string }; reason: string; details?: string; status: string; createdAt: string }

function ReportsTab({ token }: { token: string }) {
  const [statusFilter, setStatusFilter] = useState('pending')
  const { data, loading, refresh } = useApi<{ reports: AdminReport[] }>(`/admin/reports?status=${statusFilter}&limit=50`, token, [statusFilter])
  const [msg, setMsg] = useState('')

  const resolveReport = async (reportId: string, action: 'resolved' | 'dismissed') => {
    try {
      const res = await fetch(`${API}/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      setMsg(json.message || 'Done')
      setTimeout(() => setMsg(''), 3000)
      refresh()
    } catch { /* ignore */ }
  }

  const reports = data?.reports || []
  const reasonLabels: Record<string, string> = { fake_profile: 'Fake Profile', harassment: 'Harassment', inappropriate_content: 'Inappropriate', scam: 'Scam', spam: 'Spam', other: 'Other' }

  return (
    <div>
      <div className="section-header"><h2>Reports & Flags</h2>
        <div className="tab-pills">
          {['pending','resolved','dismissed'].map(s => <button key={s} className={statusFilter === s ? 'pill active' : 'pill'} onClick={() => setStatusFilter(s)}>{s}</button>)}
        </div>
      </div>
      {msg && <div className="toast">{msg}</div>}
      <div className="table-card">
        {loading ? <div className="loading-state">Loading…</div> : reports.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">✅</span><h3>No {statusFilter} reports</h3></div>
        ) : (
          <table>
            <thead><tr><th>Reporter</th><th>Reported User</th><th>Reason</th><th>Details</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {reports.map(r => (
                <tr key={r._id}>
                  <td><div className="text-sm">{r.reporter?.name || 'Unknown'}</div><div className="text-muted text-xs">{r.reporter?.email}</div></td>
                  <td><div className="text-sm">{r.reported?.name || 'Unknown'}</div><div className="text-muted text-xs capitalize">{r.reported?.gender}</div></td>
                  <td><span className="badge badge-warning">{reasonLabels[r.reason] || r.reason}</span></td>
                  <td className="text-sm text-muted max-200">{r.details || '—'}</td>
                  <td className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td><span className={`badge ${r.status === 'pending' ? 'badge-warning' : r.status === 'resolved' ? 'badge-success' : 'badge-info'}`}>{r.status}</span></td>
                  <td>
                    {r.status === 'pending' && (
                      <div className="action-btns">
                        <button className="btn-approve" onClick={() => resolveReport(r._id, 'resolved')}>Resolve</button>
                        <button className="btn-reject" onClick={() => resolveReport(r._id, 'dismissed')}>Dismiss</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Flagged Users (chat violations) ─────────────────────────────
interface FlaggedUser { _id: string; name: string; email: string; gender: string; flagCount: number; warningIssued: boolean; status: string; suspendedUntil?: string; suspensionReason?: string }

function FlaggedTab({ token }: { token: string }) {
  const { data, loading, refresh } = useApi<{ users: FlaggedUser[] }>('/admin/flagged', token)
  const [actionLoading, setActionLoading] = useState('')
  const [msg, setMsg] = useState('')

  const doAction = async (userId: string, action: 'suspend' | 'ban' | 'unsuspend') => {
    setActionLoading(userId)
    try {
      const url = `/admin/users/${userId}/${action}`
      const body = action === 'suspend' ? { hours: 24, reason: 'Contact info sharing violation' } : undefined
      const res = await fetch(`${API}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined })
      const json = await res.json()
      setMsg(json.message || 'Done')
      setTimeout(() => setMsg(''), 3000)
      refresh()
    } catch { /* ignore */ }
    setActionLoading('')
  }

  const users = data?.users || []

  return (
    <div>
      <div className="section-header"><h2>Flagged Users — Chat Violations</h2><span className="badge-danger">{users.length} flagged</span></div>
      {msg && <div className="toast">{msg}</div>}
      <div className="info-banner">⚠️ These users attempted to share contact info (phone, WhatsApp, social handles) in chat. Auto-detection triggered.</div>
      <div className="table-card">
        {loading ? <div className="loading-state">Loading…</div> : users.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">✅</span><h3>No flagged users</h3><p>Everyone is behaving.</p></div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Gender</th><th>Flag Count</th><th>Warning Issued</th><th>Current Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td className="capitalize">{u.gender}</td>
                  <td><span className="badge badge-danger">{u.flagCount}×</span></td>
                  <td>{u.warningIssued ? <span className="badge badge-warning">Yes</span> : '—'}</td>
                  <td><span className={`badge ${u.status === 'active' ? 'badge-success' : u.status === 'suspended' ? 'badge-warning' : 'badge-danger'}`}>{u.status}</span></td>
                  <td>
                    <div className="action-btns">
                      {u.status === 'active' && <button className="btn-suspend" onClick={() => doAction(u._id, 'suspend')} disabled={actionLoading === u._id}>Suspend 24h</button>}
                      {u.status === 'suspended' && <button className="btn-approve" onClick={() => doAction(u._id, 'unsuspend')} disabled={actionLoading === u._id}>Unsuspend</button>}
                      {u.status !== 'banned' && <button className="btn-ban" onClick={() => { if (confirm(`Permanently ban ${u.name}?`)) doAction(u._id, 'ban') }} disabled={actionLoading === u._id}>Permaban</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Subscriptions ────────────────────────────────────────────────
function SubscriptionsTab({ token }: { token: string }) {
  const { data, loading } = useApi<{ subscriptions: Array<{ _id: string; user?: { name: string; email: string }; plan: string; amount: number; isActive: boolean; startDate: string; endDate: string; paymentMethod: string }> }>('/admin/subscriptions?limit=50', token)
  const subs = data?.subscriptions || []

  return (
    <div>
      <div className="section-header"><h2>Subscriptions</h2></div>
      <div className="table-card">
        {loading ? <div className="loading-state">Loading…</div> : subs.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">💳</span><h3>No subscriptions yet</h3></div>
        ) : (
          <table>
            <thead><tr><th>User</th><th>Plan</th><th>Amount</th><th>Method</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
            <tbody>
              {subs.map(s => (
                <tr key={s._id}>
                  <td><div>{s.user?.name || 'Unknown'}</div><div className="text-muted text-xs">{s.user?.email}</div></td>
                  <td><span className="badge badge-info capitalize">{s.plan}</span></td>
                  <td>PKR {s.amount?.toLocaleString()}</td>
                  <td className="capitalize">{s.paymentMethod || '—'}</td>
                  <td className="text-xs text-muted">{new Date(s.startDate).toLocaleDateString()}</td>
                  <td className="text-xs text-muted">{new Date(s.endDate).toLocaleDateString()}</td>
                  <td><span className={`badge ${s.isActive ? 'badge-success' : 'badge-info'}`}>{s.isActive ? 'Active' : 'Expired'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'users', label: '👥 Users' },
  { id: 'verification', label: '🛡️ Verification' },
  { id: 'reports', label: '⚠️ Reports' },
  { id: 'flagged', label: '🚩 Flagged Users' },
  { id: 'subscriptions', label: '💳 Subscriptions' },
]

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'))
  const [activeTab, setActiveTab] = useState('dashboard')

  const logout = () => { localStorage.removeItem('admin_token'); setToken(null) }

  if (!token) return <LoginScreen onLogin={setToken} />

  const titles: Record<string, string> = { dashboard: 'Dashboard', users: 'User Management', verification: 'Verification Queue', reports: 'Reports', flagged: 'Flagged Users', subscriptions: 'Subscriptions' }

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">💕</div>
          <div>
            <h2>Shadii.pk</h2>
            <p className="logo-sub">Admin Panel</p>
          </div>
        </div>
        <nav className="nav-menu">
          {TABS.map(t => (
            <button key={t.id} className={activeTab === t.id ? 'active' : ''} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="admin-info"><div className="avatar">A</div><div><div className="admin-name">Admin</div><div className="admin-email">admin@shadii.pk</div></div></div>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <h1>{titles[activeTab]}</h1>
          <div className="topbar-right">
            <div className="live-badge">🟢 Live</div>
          </div>
        </header>
        <div className="content-area">
          {activeTab === 'dashboard' && <Dashboard token={token} />}
          {activeTab === 'users' && <UsersTab token={token} />}
          {activeTab === 'verification' && <VerificationTab token={token} />}
          {activeTab === 'reports' && <ReportsTab token={token} />}
          {activeTab === 'flagged' && <FlaggedTab token={token} />}
          {activeTab === 'subscriptions' && <SubscriptionsTab token={token} />}
        </div>
      </main>
    </div>
  )
}

export default App
