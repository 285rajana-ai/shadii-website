import { useEffect, useState } from 'react'
import './App.css'

const API = 'https://shadi-production.up.railway.app/api'

function apiCall(path, token, opts = {}) {
  return fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }).then((r) => r.json())
}

function Avatar({ name, size = 38 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

function Badge({ status }) {
  const map = { active: 'badge-success', approved: 'badge-success', completed: 'badge-success', pending: 'badge-warning', suspended: 'badge-danger', banned: 'badge-danger', rejected: 'badge-danger', resolved: 'badge-info', dismissed: 'badge-info', inactive: 'badge-warning' }
  return <span className={`badge ${map[status] || 'badge-info'} capitalize`}>{status}</span>
}

function Pagination({ page, total, limit, onPage }) {
  const pages = Math.ceil(total / limit)
  if (pages <= 1) return null
  return (
    <div className="pagination">
      <button onClick={() => onPage(page - 1)} disabled={page === 1}>← Prev</button>
      <span>Page {page} of {pages} · {total} total</span>
      <button onClick={() => onPage(page + 1)} disabled={page >= pages}>Next →</button>
    </div>
  )
}

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).then((r) => r.json())
      if (!data.success) return setError(data.message || 'Login failed')
      if (!data.user?.isAdmin) return setError('Admin access required')
      onLogin(data.token, data.user)
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-icon">💍</div>
          <h1>Shadi.pk Admin</h1>
          <p>Management Dashboard</p>
        </div>
        {error && <div className="error-box">{error}</div>}
        <form className="login-form" onSubmit={submit}>
          <div className="field"><label>Email Address</label>
            <input type="email" placeholder="admin@shadi.pk" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="field"><label>Password</label>
            <input type="password" placeholder="Enter password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  )
}

function Dashboard({ token }) {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([apiCall('/admin/dashboard', token), apiCall('/admin/users?limit=6&page=1', token)])
      .then(([s, u]) => {
        if (s.success) setStats(s.stats)
        if (u.success) setRecentUsers(u.users)
        setLoading(false)
      })
  }, [token])

  if (loading) return <div className="loading-state">Loading dashboard…</div>

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', cls: 'stat-blue', sub: `${stats.activeUsers} active this week` },
    { label: 'Male / Female', value: `${stats.totalMale} / ${stats.totalFemale}`, icon: '⚧', cls: 'stat-purple', sub: 'gender distribution' },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: '💳', cls: 'stat-green', sub: 'currently active plans' },
    { label: 'Total Revenue', value: `PKR ${(stats.totalRevenue || 0).toLocaleString()}`, icon: '💰', cls: 'stat-green', sub: 'all completed payments' },
    { label: 'Pending Verifications', value: stats.pendingVerifications, icon: '🪪', cls: 'stat-orange', sub: 'awaiting admin review' },
    { label: 'Pending Reports', value: stats.pendingReports, icon: '🚨', cls: 'stat-red', sub: `${stats.totalReports} total reports` },
    { label: 'Flagged Users', value: stats.flaggedUsers, icon: '⛳', cls: 'stat-red', sub: 'triggered safety filter' },
    { label: 'Active (7 Days)', value: stats.activeUsers, icon: '📶', cls: 'stat-blue', sub: 'recently online users' },
  ]

  return (
    <div>
      <div className="section-header"><h2>Overview</h2><span className="live-badge">● Live</span></div>
      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className={`stat-card ${c.cls}`}>
            <div className="stat-top"><span className="stat-icon">{c.icon}</span></div>
            <div className="stat-number">{c.value}</div>
            <div className="stat-label">{c.label}</div>
            <div className="stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="table-card">
        <h3>Recent Registrations</h3>
        <table>
          <thead><tr><th>User</th><th>Gender</th><th>City</th><th>Status</th><th>Verified</th><th>Joined</th></tr></thead>
          <tbody>
            {recentUsers.map((u) => (
              <tr key={u._id}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={u.name} /><div><div style={{ fontWeight: 700 }}>{u.name}</div><div className="text-xs text-muted">{u.email}</div></div></div></td>
                <td className="capitalize">{u.gender}</td>
                <td>{u.city || '—'}</td>
                <td><Badge status={u.status} /></td>
                <td>{u.isVerified ? '✅' : '❌'}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Users({ token }) {
  const [users, setUsers] = useState([]); const [total, setTotal] = useState(0); const [page, setPage] = useState(1)
  const [search, setSearch] = useState(''); const [gender, setGender] = useState(''); const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false); const [toast, setToast] = useState('')
  const [modal, setModal] = useState(null); const [suspendHours, setSuspendHours] = useState(24); const [suspendReason, setSuspendReason] = useState('')

  const load = (p) => {
    const pg = p ?? page; setLoading(true)
    const q = new URLSearchParams({ page: pg, limit: 20 })
    if (search) q.set('search', search); if (gender) q.set('gender', gender); if (status) q.set('status', status)
    apiCall(`/admin/users?${q}`, token).then((d) => { if (d.success) { setUsers(d.users); setTotal(d.total) }; setLoading(false) })
  }
  useEffect(() => { setPage(1); load(1) }, [search, gender, status])
  useEffect(() => { load(page) }, [page])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const doAction = async () => {
    const { user, action } = modal
    const map = { suspend: [`/admin/users/${user._id}/suspend`, { hours: suspendHours, reason: suspendReason }], unsuspend: [`/admin/users/${user._id}/unsuspend`, {}], ban: [`/admin/users/${user._id}/ban`, {}] }
    const [ep, body] = map[action]
    const d = await apiCall(ep, token, { method: 'POST', body })
    showToast(d.message || 'Done'); setModal(null); load(page)
  }

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      <div className="section-header"><h2>All Users</h2><span className="text-muted text-sm">{total} total</span></div>
      <div className="filter-row">
        <input className="search-input" placeholder="Search name, email, phone…" onKeyDown={(e) => e.key === 'Enter' && setSearch(e.target.value)} onBlur={(e) => setSearch(e.target.value)} />
        <select className="filter-select" value={gender} onChange={(e) => setGender(e.target.value)}><option value="">All Genders</option><option value="male">Male</option><option value="female">Female</option></select>
        <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All Status</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="banned">Banned</option><option value="inactive">Inactive</option></select>
      </div>
      {loading ? <div className="loading-state">Loading users…</div> : (
        <div className="table-card">
          <table>
            <thead><tr><th>User</th><th>Gender/Age</th><th>City</th><th>Status</th><th>Plan</th><th>Verified</th><th>Flags</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users found</td></tr>
                : users.map((u) => (
                  <tr key={u._id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={u.name} /><div><div style={{ fontWeight: 700 }}>{u.name}</div><div className="text-xs text-muted">{u.email}</div><div className="text-xs text-muted">{u.phone}</div></div></div></td>
                    <td className="capitalize">{u.gender}, {u.age || '—'}</td>
                    <td>{u.city || '—'}</td>
                    <td><Badge status={u.status} /></td>
                    <td className="capitalize text-sm">{u.subscription || 'free'}</td>
                    <td>{u.isVerified ? '✅' : '❌'}</td>
                    <td style={{ color: u.flagCount > 0 ? 'var(--danger)' : undefined, fontWeight: u.flagCount > 0 ? 700 : 400 }}>{u.flagCount || 0}</td>
                    <td className="text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td><div className="action-btns">
                      {u.status !== 'suspended' && u.status !== 'banned' && <button className="btn-suspend" onClick={() => { setSuspendHours(24); setSuspendReason(''); setModal({ user: u, action: 'suspend' }) }}>Suspend</button>}
                      {u.status === 'suspended' && <button className="btn-approve" onClick={() => setModal({ user: u, action: 'unsuspend' })}>Unsuspend</button>}
                      {u.status !== 'banned' && <button className="btn-ban" onClick={() => setModal({ user: u, action: 'ban' })}>Ban</button>}
                    </div></td>
                  </tr>
                ))}
            </tbody>
          </table>
          <Pagination page={page} total={total} limit={20} onPage={setPage} />
        </div>
      )}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="login-card" style={{ maxWidth: 440, width: '90vw' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20, fontSize: 20 }}>{modal.action === 'suspend' ? '⛔ Suspend User' : modal.action === 'unsuspend' ? '✅ Unsuspend' : '🚫 Ban User'}</h2>
            <p style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 14 }}>Apply to: <strong>{modal.user.name}</strong>{modal.action === 'ban' ? ' — This cannot be undone.' : ''}</p>
            {modal.action === 'suspend' && (
              <div className="login-form" style={{ gap: 12 }}>
                <div className="field"><label>Hours</label><input type="number" value={suspendHours} onChange={(e) => setSuspendHours(Number(e.target.value))} min={1} max={8760} /></div>
                <div className="field"><label>Reason</label><input type="text" placeholder="Reason" value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} /></div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn-logout" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
              <button className={modal.action === 'unsuspend' ? 'btn-approve' : 'btn-ban'} style={{ flex: 1, padding: 12, borderRadius: 12, fontSize: 14, fontWeight: 700 }} onClick={doAction}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Reports({ token }) {
  const [reports, setReports] = useState([]); const [total, setTotal] = useState(0); const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('pending'); const [loading, setLoading] = useState(false); const [toast, setToast] = useState('')

  const load = (p) => {
    const pg = p ?? page; setLoading(true)
    const q = new URLSearchParams({ page: pg, limit: 20 }); if (statusFilter) q.set('status', statusFilter)
    apiCall(`/admin/reports?${q}`, token).then((d) => { if (d.success) { setReports(d.reports); setTotal(d.total) }; setLoading(false) })
  }
  useEffect(() => { setPage(1); load(1) }, [statusFilter])
  useEffect(() => { load(page) }, [page])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const resolve = async (id, action) => { const d = await apiCall(`/admin/reports/${id}/resolve`, token, { method: 'POST', body: { action } }); showToast(d.message || 'Done'); load(page) }

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      <div className="section-header">
        <h2>User Reports</h2>
        <div className="tab-pills">
          {['', 'pending', 'resolved', 'dismissed'].map((s) => <button key={s} className={`pill ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{s || 'All'}</button>)}
        </div>
      </div>
      {loading ? <div className="loading-state">Loading reports…</div> : (
        <div className="table-card">
          <table>
            <thead><tr><th>Reporter</th><th>Reported User</th><th>Reason</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {reports.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No reports</td></tr>
                : reports.map((r) => (
                  <tr key={r._id}>
                    <td><div style={{ fontWeight: 600 }}>{r.reporter?.name || '—'}</div><div className="text-xs text-muted">{r.reporter?.email}</div></td>
                    <td><div style={{ fontWeight: 600 }}>{r.reported?.name || '—'}</div><div className="text-xs text-muted">{r.reported?.email}</div></td>
                    <td className="max-200 capitalize">{r.reason}</td>
                    <td><Badge status={r.status} /></td>
                    <td className="text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>{r.status === 'pending' && <div className="action-btns"><button className="btn-approve" onClick={() => resolve(r._id, 'resolved')}>Resolve ✅</button><button className="btn-reject" onClick={() => resolve(r._id, 'dismissed')}>Dismiss</button></div>}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <Pagination page={page} total={total} limit={20} onPage={setPage} />
        </div>
      )}
    </div>
  )
}

function Verifications({ token }) {
  const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true); const [toast, setToast] = useState('')
  const [notes, setNotes] = useState({}); const [lightbox, setLightbox] = useState(null); const [processing, setProcessing] = useState({})

  const load = () => { setLoading(true); apiCall('/admin/verifications', token).then((d) => { if (d.success) setUsers(d.users); setLoading(false) }) }
  useEffect(() => { load() }, [])
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const verify = async (userId, action) => {
    setProcessing((p) => ({ ...p, [userId]: true }))
    const d = await apiCall(`/admin/verify/${userId}`, token, { method: 'POST', body: { action, note: notes[userId] || '' } })
    showToast(d.message || 'Done'); load(); setProcessing((p) => ({ ...p, [userId]: false }))
  }

  if (loading) return <div className="loading-state">Loading verifications…</div>

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      {lightbox && <div className="modal-overlay" onClick={() => setLightbox(null)}><div className="modal-img-wrap" onClick={(e) => e.stopPropagation()}><img src={lightbox} alt="doc" className="modal-img" /><button className="modal-close" onClick={() => setLightbox(null)}>✕</button></div></div>}
      <div className="section-header"><h2>Pending Verifications</h2><span className="text-muted text-sm">{users.length} pending</span></div>
      {users.length === 0
        ? <div className="empty-state"><span className="empty-icon">✅</span><h3>All Caught Up!</h3><p>No pending CNIC verifications.</p></div>
        : <div className="verify-cards">
          {users.map((u) => (
            <div key={u._id} className="verify-card">
              <div className="verify-head">
                <div className="verify-avatar">{u.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div className="verify-name">{u.name}</div>
                  <div className="text-sm text-muted">{u.email}</div>
                  <div className="text-sm text-muted capitalize">{u.gender}, {u.age} yrs — {u.city || 'Unknown city'}</div>
                  <div className="text-xs text-muted">Registered: {new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="doc-images">
                {u.cnicFront && <div className="doc-thumb" onClick={() => setLightbox(u.cnicFront)}><img src={u.cnicFront} alt="CNIC Front" /><span>CNIC Front</span></div>}
                {u.cnicBack && <div className="doc-thumb" onClick={() => setLightbox(u.cnicBack)}><img src={u.cnicBack} alt="CNIC Back" /><span>CNIC Back</span></div>}
                {u.livePhoto && <div className="doc-thumb" onClick={() => setLightbox(u.livePhoto)}><img src={u.livePhoto} alt="Live Photo" /><span>Live Photo</span></div>}
                {!u.cnicFront && !u.cnicBack && !u.livePhoto && <div className="info-banner">⚠️ No documents uploaded.</div>}
              </div>
              <div className="verify-actions">
                <input className="note-input" placeholder="Rejection note (optional)…" value={notes[u._id] || ''} onChange={(e) => setNotes((n) => ({ ...n, [u._id]: e.target.value }))} />
                <button className="btn-approve" style={{ padding: '10px 20px', borderRadius: 10, fontWeight: 700 }} disabled={processing[u._id]} onClick={() => verify(u._id, 'approve')}>Approve ✅</button>
                <button className="btn-reject" style={{ padding: '10px 20px', borderRadius: 10, fontWeight: 700 }} disabled={processing[u._id]} onClick={() => verify(u._id, 'reject')}>Reject ❌</button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  )
}

function Flagged({ token }) {
  const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true); const [toast, setToast] = useState('')
  const load = () => { setLoading(true); apiCall('/admin/flagged', token).then((d) => { if (d.success) setUsers(d.users); setLoading(false) }) }
  useEffect(() => { load() }, [])
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const suspend = async (id) => { const d = await apiCall(`/admin/users/${id}/suspend`, token, { method: 'POST', body: { hours: 24, reason: 'Repeated contact sharing' } }); showToast(d.message); load() }
  const ban = async (id) => { if (!window.confirm('Permanently ban?')) return; const d = await apiCall(`/admin/users/${id}/ban`, token, { method: 'POST', body: {} }); showToast(d.message); load() }

  if (loading) return <div className="loading-state">Loading flagged users…</div>

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      <div className="section-header"><h2>Flagged Users</h2><span className="text-muted text-sm">{users.length} flagged</span></div>
      <div className="info-banner">⚠️ These users triggered the chat safety filter for attempting to share contact information.</div>
      {users.length === 0
        ? <div className="empty-state"><span className="empty-icon">🎉</span><h3>No Flagged Users</h3><p>All users are behaving well.</p></div>
        : <div className="table-card">
          <table>
            <thead><tr><th>User</th><th>Gender</th><th>Flags</th><th>Warning</th><th>Status</th><th>Suspended Until</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><div style={{ fontWeight: 700 }}>{u.name}</div><div className="text-xs text-muted">{u.email}</div></td>
                  <td className="capitalize">{u.gender}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 800 }}>{u.flagCount}</td>
                  <td>{u.warningIssued ? '✅' : '❌'}</td>
                  <td><Badge status={u.status} /></td>
                  <td className="text-xs">{u.suspendedUntil ? new Date(u.suspendedUntil).toLocaleString() : '—'}</td>
                  <td><div className="action-btns">
                    {u.status !== 'suspended' && u.status !== 'banned' && <button className="btn-suspend" onClick={() => suspend(u._id)}>Suspend 24h</button>}
                    {u.status !== 'banned' && <button className="btn-ban" onClick={() => ban(u._id)}>Ban</button>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </div>
  )
}

function FlaggedMessages({ token }) {
  const [messages, setMessages] = useState([]); const [total, setTotal] = useState(0); const [page, setPage] = useState(1); const [loading, setLoading] = useState(false)
  const load = (p) => { const pg = p ?? page; setLoading(true); apiCall(`/admin/flagged-messages?page=${pg}&limit=20`, token).then((d) => { if (d.success) { setMessages(d.messages); setTotal(d.total) }; setLoading(false) }) }
  useEffect(() => { load(1) }, [])
  useEffect(() => { load(page) }, [page])

  return (
    <div>
      <div className="section-header"><h2>Flagged Messages</h2><span className="text-muted text-sm">{total} total</span></div>
      <div className="info-banner">⚠️ These messages were blocked by the safety filter for attempting to share contact information.</div>
      {loading ? <div className="loading-state">Loading flagged messages…</div> : (
        <div className="table-card">
          <table>
            <thead><tr><th>Sender</th><th>Receiver</th><th>Flagged Content</th><th>Reason</th><th>Date</th></tr></thead>
            <tbody>
              {messages.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No flagged messages 🎉</td></tr>
                : messages.map((m) => (
                  <tr key={m._id}>
                    <td><div style={{ fontWeight: 600 }}>{m.sender?.name || '—'}</div><div className="text-xs text-muted">{m.sender?.email}</div><span style={{ color: 'var(--danger)', fontSize: 11, fontWeight: 700 }}>⚑ {m.sender?.flagCount || 0} flags</span></td>
                    <td><div style={{ fontWeight: 600 }}>{m.receiver?.name || '—'}</div><div className="text-xs text-muted">{m.receiver?.email}</div></td>
                    <td className="max-200" style={{ color: 'var(--danger)', fontStyle: 'italic' }}>"{m.content}"</td>
                    <td><span className="badge badge-danger capitalize">{m.flagReason?.replace('_', ' ') || '—'}</span></td>
                    <td className="text-xs">{new Date(m.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <Pagination page={page} total={total} limit={20} onPage={setPage} />
        </div>
      )}
    </div>
  )
}

function Analytics({ token }) {
  const [data, setData] = useState(null); const [period, setPeriod] = useState('30d'); const [loading, setLoading] = useState(true)
  useEffect(() => { setLoading(true); apiCall(`/admin/analytics?period=${period}`, token).then((d) => { if (d.success) setData(d); setLoading(false) }) }, [period])

  if (loading) return <div className="loading-state">Loading analytics…</div>
  if (!data) return null

  const totalRevenue = data.revenueGrowth?.reduce((s, r) => s + r.revenue, 0) || 0
  const totalNewUsers = data.userGrowth?.reduce((s, r) => s + r.count, 0) || 0

  return (
    <div>
      <div className="section-header">
        <h2>Analytics</h2>
        <div className="tab-pills">
          {['7d', '30d', '90d'].map((p) => <button key={p} className={`pill ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>)}
        </div>
      </div>
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card stat-green"><div className="stat-top"><span className="stat-icon">💰</span></div><div className="stat-number">PKR {totalRevenue.toLocaleString()}</div><div className="stat-label">Revenue ({period})</div></div>
        <div className="stat-card stat-blue"><div className="stat-top"><span className="stat-icon">👥</span></div><div className="stat-number">{totalNewUsers}</div><div className="stat-label">New Users ({period})</div></div>
      </div>
      <div className="table-card" style={{ marginBottom: 24 }}>
        <h3>Daily Revenue ({period})</h3>
        <table>
          <thead><tr><th>Date</th><th>Revenue (PKR)</th><th>Transactions</th></tr></thead>
          <tbody>
            {(data.revenueGrowth || []).length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No revenue data</td></tr>
              : data.revenueGrowth.map((r) => <tr key={r._id}><td>{r._id}</td><td style={{ fontWeight: 700, color: 'var(--success)' }}>PKR {r.revenue.toLocaleString()}</td><td>{r.count}</td></tr>)}
          </tbody>
        </table>
      </div>
      <div className="table-card">
        <h3>Plan Distribution</h3>
        <table>
          <thead><tr><th>Plan</th><th>Active Subscriptions</th></tr></thead>
          <tbody>
            {(data.planDistribution || []).map((p) => <tr key={p._id}><td className="capitalize" style={{ fontWeight: 700, color: 'var(--primary)' }}>{p._id}</td><td>{p.count}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Broadcast({ token }) {
  const [form, setForm] = useState({ title: '', body: '' }); const [loading, setLoading] = useState(false); const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000) }

  const send = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    if (!window.confirm(`Send push notification to ALL active users?\n\nTitle: ${form.title}\nBody: ${form.body}`)) return
    setLoading(true)
    const d = await apiCall('/admin/broadcast', token, { method: 'POST', body: form })
    showToast(d.message || (d.success ? 'Broadcast sent!' : 'Failed to send'))
    if (d.success) setForm({ title: '', body: '' })
    setLoading(false)
  }

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      <div className="section-header"><h2>Broadcast Notification</h2></div>
      <div className="info-banner">📢 This will send a push notification to ALL active users who have the app installed and notifications enabled.</div>
      <div className="login-card" style={{ maxWidth: 560, marginTop: 24 }}>
        <h3 style={{ marginBottom: 20 }}>New Broadcast</h3>
        <form onSubmit={send}>
          <div className="login-form" style={{ gap: 14 }}>
            <div className="field"><label>Title (max 60 chars)</label><input maxLength={60} placeholder="e.g. New Feature Available!" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="field"><label>Message Body (max 160 chars)</label><textarea maxLength={160} placeholder="e.g. We have added voice messages!" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required rows={3} style={{ resize: 'vertical', background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit' }} /></div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button type="button" className="btn-logout" style={{ flex: 1 }} onClick={() => setForm({ title: '', body: '' })}>Clear</button>
            <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading || !form.title || !form.body}>{loading ? 'Sending…' : '📢 Send to All Users'}</button>
          </div>
        </form>
        <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong>Preview:</strong><br />
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{form.title || 'Title'}</span><br />
          <span>{form.body || 'Message body...'}</span>
        </div>
      </div>
    </div>
  )
}

function Subscriptions({ token }) {
  const [subs, setSubs] = useState([]); const [total, setTotal] = useState(0); const [page, setPage] = useState(1); const [loading, setLoading] = useState(false)
  const load = (p) => { const pg = p ?? page; setLoading(true); apiCall(`/admin/subscriptions?page=${pg}&limit=20`, token).then((d) => { if (d.success) { setSubs(d.subscriptions); setTotal(d.total) }; setLoading(false) }) }
  useEffect(() => { load(page) }, [page])
  const pageRevenue = subs.filter((s) => s.paymentStatus === 'completed').reduce((a, s) => a + (s.amount || 0), 0)

  return (
    <div>
      <div className="section-header"><h2>Subscriptions</h2><span className="text-muted text-sm">{total} total</span></div>
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card stat-green"><div className="stat-top"><span className="stat-icon">💳</span></div><div className="stat-number">{subs.filter((s) => s.isActive).length}</div><div className="stat-label">Active (this page)</div></div>
        <div className="stat-card stat-blue"><div className="stat-top"><span className="stat-icon">💰</span></div><div className="stat-number">PKR {pageRevenue.toLocaleString()}</div><div className="stat-label">Revenue (this page)</div></div>
      </div>
      {loading ? <div className="loading-state">Loading…</div> : (
        <div className="table-card">
          <table>
            <thead><tr><th>User</th><th>Plan</th><th>Amount</th><th>Method</th><th>Payment</th><th>Active</th><th>Start</th><th>End</th></tr></thead>
            <tbody>
              {subs.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No subscriptions</td></tr>
                : subs.map((s) => (
                  <tr key={s._id}>
                    <td><div style={{ fontWeight: 600 }}>{s.user?.name || '—'}</div><div className="text-xs text-muted">{s.user?.email}</div></td>
                    <td className="capitalize" style={{ fontWeight: 700, color: 'var(--primary)' }}>{s.plan}</td>
                    <td style={{ fontWeight: 700 }}>PKR {(s.amount || 0).toLocaleString()}</td>
                    <td className="capitalize">{s.paymentMethod || '—'}</td>
                    <td><Badge status={s.paymentStatus} /></td>
                    <td>{s.isActive ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Expired</span>}</td>
                    <td className="text-xs">{s.startDate ? new Date(s.startDate).toLocaleDateString() : '—'}</td>
                    <td className="text-xs">{s.endDate ? new Date(s.endDate).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <Pagination page={page} total={total} limit={20} onPage={setPage} />
        </div>
      )}
    </div>
  )
}

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'reports', label: 'Reports', icon: '🚨' },
  { id: 'verifications', label: 'Verifications', icon: '🪪' },
  { id: 'flagged', label: 'Flagged Users', icon: '⛳' },
  { id: 'flaggedMessages', label: 'Flagged Messages', icon: '🔇' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '💳' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'broadcast', label: 'Broadcast', icon: '📢' },
]

function App() {
  const [auth, setAuth] = useState(() => { try { const s = sessionStorage.getItem('shadi_admin'); return s ? JSON.parse(s) : null } catch { return null } })
  const [tab, setTab] = useState('dashboard')

  const handleLogin = (token, user) => { const a = { token, user }; setAuth(a); sessionStorage.setItem('shadi_admin', JSON.stringify(a)) }
  const handleLogout = () => { setAuth(null); sessionStorage.removeItem('shadi_admin'); setTab('dashboard') }

  if (!auth) return <Login onLogin={handleLogin} />

  const PAGE = { dashboard: <Dashboard token={auth.token} />, users: <Users token={auth.token} />, reports: <Reports token={auth.token} />, verifications: <Verifications token={auth.token} />, flagged: <Flagged token={auth.token} />, flaggedMessages: <FlaggedMessages token={auth.token} />, subscriptions: <Subscriptions token={auth.token} />, analytics: <Analytics token={auth.token} />, broadcast: <Broadcast token={auth.token} /> }

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <div className="logo"><span className="logo-icon">💍</span><div><h2>Shadi.pk</h2><div className="logo-sub">Admin Panel</div></div></div>
        <nav className="nav-menu">
          {NAV.map((n) => <button key={n.id} className={tab === n.id ? 'active' : ''} onClick={() => setTab(n.id)}>{n.icon} {n.label}</button>)}
        </nav>
        <div className="sidebar-footer">
          <div className="admin-info"><Avatar name={auth.user?.name} /><div><div className="admin-name">{auth.user?.name || 'Admin'}</div><div className="admin-email">{auth.user?.email}</div></div></div>
          <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>
      <div className="main-content">
        <div className="topbar"><h1>{NAV.find((n) => n.id === tab)?.label}</h1><div className="topbar-right"><span className="live-badge">● Live</span></div></div>
        <div className="content-area">{PAGE[tab]}</div>
      </div>
    </div>
  )
}

export default App
