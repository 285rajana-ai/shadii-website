import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API = 'https://shadi-production.up.railway.app/api'

function apiCall(path, token, opts = {}) {
    const headers = {
        ...(opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
    }

    return fetch(`${API}${path}`, {
        ...opts,
        headers,
        body: opts.body
            ? opts.body instanceof FormData
                ? opts.body
                : JSON.stringify(opts.body)
            : undefined,
    }).then((response) => response.json())
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString()
}

function formatCurrency(value) {
    return `PKR ${Number(value || 0).toLocaleString()}`
}

function formatDate(value, withTime = false) {
    if (!value) return '—'
    return new Date(value).toLocaleString('en-PK', withTime
        ? { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }
        : { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatRelative(dateString) {
    if (!dateString) return '—'
    const diff = Date.now() - new Date(dateString).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
}

function planName(plan) {
    if (!plan) return 'free'
    if (typeof plan === 'string') return plan
    return plan.plan || 'free'
}

function Avatar({ name, size = 40 }) {
    return (
        <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
            {name?.[0]?.toUpperCase() || '?'}
        </div>
    )
}

function Badge({ status }) {
    const key = String(status || '').toLowerCase()
    const map = {
        active: 'badge-success',
        approved: 'badge-success',
        completed: 'badge-success',
        reviewed: 'badge-info',
        action_taken: 'badge-danger',
        pending: 'badge-warning',
        awaiting_payment: 'badge-warning',
        verification_submitted: 'badge-warning',
        suspended: 'badge-danger',
        banned: 'badge-danger',
        rejected: 'badge-danger',
        dismissed: 'badge-info',
        failed: 'badge-danger',
        inactive: 'badge-warning',
    }
    return <span className={`badge ${map[key] || 'badge-info'} capitalize`}>{key.replace(/_/g, ' ') || '—'}</span>
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

function EmptyState({ icon, title, text }) {
    return (
        <div className="empty-state">
            <span className="empty-icon">{icon}</span>
            <h3>{title}</h3>
            {text ? <p>{text}</p> : null}
        </div>
    )
}

function Modal({ children, onClose, wide = false }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`admin-modal ${wide ? 'admin-modal-wide' : ''}`} onClick={(event) => event.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                {children}
            </div>
        </div>
    )
}

function KeyValue({ label, value }) {
    return (
        <div className="kv-row">
            <span>{label}</span>
            <strong>{value || '—'}</strong>
        </div>
    )
}

// ── Visual bar chart for breakdowns ─────────────────────────────────────────
function MiniBarChart({ items, getValue, getLabel, getExtra, colorClass = 'bar-primary' }) {
    if (!items || items.length === 0) return <div className="text-muted text-sm">No data yet</div>
    const max = Math.max(...items.map((item) => getValue(item) || 0), 1)
    return (
        <div className="bar-chart-list">
            {items.map((item, index) => {
                const val = getValue(item) || 0
                const pct = Math.round((val / max) * 100)
                return (
                    <div key={index} className="bar-row">
                        <div className="bar-row-top">
                            <span className="bar-label capitalize">{getLabel(item)}</span>
                            <span className="bar-value">{getExtra ? getExtra(item) : formatNumber(val)}</span>
                        </div>
                        <div className="bar-track">
                            <div className={`bar-fill ${colorClass}`} style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ── KPI stat card with optional trend badge ──────────────────────────────────
function KPICard({ label, value, icon, cls, sub, trend }) {
    return (
        <div className={`stat-card ${cls}`}>
            <div className="stat-top">
                <span className="stat-icon">{icon}</span>
                {trend !== undefined && trend !== null ? (
                    <span className={`trend-badge ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
                        {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
                    </span>
                ) : null}
            </div>
            <div className="stat-number">{value}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-sub">{sub}</div>
        </div>
    )
}

function Login({ onLogin }) {
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const submit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setError('')

        try {
            const data = await apiCall('/auth/login', null, { method: 'POST', body: form })
            if (!data.success) return setError(data.message || 'Login failed')
            if (!data.user?.isAdmin) return setError('Admin access required')
            onLogin(data.token, data.user)
        } catch {
            setError('Cannot connect to server.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-bg">
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-icon">💍</div>
                    <h1>Shadii.pk Admin</h1>
                    <p>Operations Console</p>
                </div>
                {error ? <div className="error-box">{error}</div> : null}
                <form className="login-form" onSubmit={submit}>
                    <div className="field">
                        <label>Email Address</label>
                        <input type="email" placeholder="admin@shadii.pk" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="field">
                        <label>Password</label>
                        <input type="password" placeholder="Enter password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
                </form>
            </div>
        </div>
    )
}

function Dashboard({ token, onOpenUser, onNavigate }) {
    const [dashboard, setDashboard] = useState(null)
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        Promise.all([
            apiCall('/admin/dashboard', token),
            apiCall('/admin/analytics?period=30d', token),
        ]).then(([dashboardData, analyticsData]) => {
            if (cancelled) return
            if (dashboardData.success) setDashboard(dashboardData)
            if (analyticsData.success) setAnalytics(analyticsData)
            setLoading(false)
        })

        return () => {
            cancelled = true
        }
    }, [token])

    if (loading) return <div className="loading-state">Loading dashboard…</div>
    if (!dashboard) return <EmptyState icon="⚠️" title="Dashboard unavailable" text="Could not load admin metrics right now." />

    const stats = dashboard.stats || {}
    const breakdowns = dashboard.breakdowns || {}
    const recent = dashboard.recent || {}
    const relationshipSignals = analytics?.relationshipSignals || {}

    const cards = [
        { label: 'Total Users', value: formatNumber(stats.totalUsers), icon: '👥', cls: 'stat-blue', sub: `${formatNumber(stats.activeUsers)} active in 7 days` },
        { label: 'Revenue (All Time)', value: formatCurrency(stats.totalRevenue), icon: '💰', cls: 'stat-green', sub: `${formatNumber(stats.totalCompletedPayments)} verified payments` },
        { label: 'Active Plans', value: formatNumber(stats.activeSubscriptions), icon: '💳', cls: 'stat-green', sub: `${formatNumber(stats.pendingPaymentReviews)} payments need review` },
        { label: 'Verifications', value: formatNumber(stats.pendingVerifications), icon: '🪪', cls: 'stat-orange', sub: 'pending manual review' },
        { label: 'Reports', value: formatNumber(stats.pendingReports), icon: '🚨', cls: 'stat-red', sub: `${formatNumber(stats.totalReports)} total reports` },
        { label: 'Online Now', value: formatNumber(stats.onlineNow), icon: '🟢', cls: 'stat-blue', sub: `${formatNumber(stats.newUsersThisMonth)} new users this month` },
        { label: 'Conversations', value: formatNumber(stats.activeConversations), icon: '💬', cls: 'stat-purple', sub: `${formatNumber(stats.totalMessages)} messages in 14 days` },
        { label: 'Match Signals', value: formatNumber(stats.mutualConnections), icon: '❤️', cls: 'stat-purple', sub: `${formatNumber(stats.totalMatchSuggestions)} suggestions generated` },
    ]

    return (
        <div>
            <div className="section-header">
                <h2>Executive Overview</h2>
                <span className="live-badge">● Live snapshot</span>
            </div>

            <div className="stats-grid">
                {cards.map((card) => (
                    <KPICard key={card.label} {...card} />
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="panel-card dashboard-span-2">
                    <div className="section-header compact"><h3>Recent Payments</h3><button className="btn-link" onClick={() => onNavigate('subscriptions')}>Open payments</button></div>
                    <table className="mini-table">
                        <thead><tr><th>User</th><th>Plan</th><th>Method</th><th>Status</th><th>Amount</th><th>Created</th></tr></thead>
                        <tbody>
                            {(recent.payments || []).length === 0 ? <tr><td colSpan={6}>No recent payments</td></tr> : recent.payments.map((payment) => (
                                <tr key={payment._id}>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>{payment.user?.name || '—'}</div>
                                        <div className="text-xs text-muted">{payment.user?.email || '—'}</div>
                                    </td>
                                    <td className="capitalize">{payment.plan}</td>
                                    <td className="capitalize">{String(payment.paymentMethod || '—').replace(/_/g, ' ')}</td>
                                    <td><Badge status={payment.paymentStatus} /></td>
                                    <td>{formatCurrency(payment.amount)}</td>
                                    <td>{formatDate(payment.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="panel-card">
                    <div className="section-header compact"><h3>Relationship Signals</h3></div>
                    <div className="stack-list">
                        <KeyValue label="Mutual interest pairs" value={formatNumber(stats.mutualConnections)} />
                        <KeyValue label="Total likes logged" value={formatNumber(stats.totalLikedProfiles)} />
                        <KeyValue label="Messages in period" value={formatNumber(relationshipSignals.totalMessages)} />
                        <KeyValue label="Active conversations" value={formatNumber(relationshipSignals.activeConversations)} />
                    </div>
                </div>

                <div className="panel-card">
                    <div className="section-header compact"><h3>Active Plan Mix</h3></div>
                    <MiniBarChart
                        items={breakdowns.activePlanBreakdown || []}
                        getValue={(item) => item.count}
                        getLabel={(item) => String(item._id || 'unknown').replace(/_/g, ' ')}
                        getExtra={(item) => `${formatNumber(item.count)} · ${formatCurrency(item.revenue)}`}
                        colorClass="bar-primary"
                    />
                </div>

                <div className="panel-card">
                    <div className="section-header compact"><h3>Payment Methods</h3></div>
                    <MiniBarChart
                        items={breakdowns.paymentMethodBreakdown || []}
                        getValue={(item) => item.completed}
                        getLabel={(item) => String(item._id || 'unknown').replace(/_/g, ' ')}
                        getExtra={(item) => `${formatNumber(item.completed)} done / ${formatNumber(item.count)} total`}
                        colorClass="bar-green"
                    />
                </div>

                <div className="panel-card">
                    <div className="section-header compact"><h3>Report Reasons</h3></div>
                    <MiniBarChart
                        items={breakdowns.reportReasonBreakdown || []}
                        getValue={(item) => item.count}
                        getLabel={(item) => String(item._id).replace(/_/g, ' ')}
                        colorClass="bar-red"
                    />
                </div>

                <div className="panel-card">
                    <div className="section-header compact"><h3>Verification Status</h3></div>
                    <MiniBarChart
                        items={breakdowns.verificationBreakdown || []}
                        getValue={(item) => item.count}
                        getLabel={(item) => String(item._id || 'none')}
                        colorClass="bar-orange"
                    />
                </div>

                <div className="panel-card dashboard-span-2">
                    <div className="section-header compact"><h3>Recent Users</h3><button className="btn-link" onClick={() => onNavigate('users')}>Open users</button></div>
                    <table className="mini-table">
                        <thead><tr><th>User</th><th>City</th><th>Gender</th><th>Verification</th><th>Plan</th><th></th></tr></thead>
                        <tbody>
                            {(recent.users || []).length === 0 ? <tr><td colSpan={6}>No recent users</td></tr> : recent.users.map((user) => (
                                <tr key={user._id}>
                                    <td><div style={{ fontWeight: 700 }}>{user.name}</div><div className="text-xs text-muted">{user.email}</div></td>
                                    <td>{user.city || '—'}</td>
                                    <td className="capitalize">{user.gender || '—'}</td>
                                    <td>{user.isVerified ? '✅ Verified' : <Badge status="pending" />}</td>
                                    <td className="capitalize">{planName(user.subscription)}</td>
                                    <td><button className="btn-link" onClick={() => onOpenUser(user._id)}>Open</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="panel-card dashboard-span-2">
                    <div className="section-header compact"><h3>Recent Reports</h3><button className="btn-link" onClick={() => onNavigate('reports')}>Open reports</button></div>
                    <table className="mini-table">
                        <thead><tr><th>Reporter</th><th>Reported</th><th>Reason</th><th>Status</th><th>Created</th></tr></thead>
                        <tbody>
                            {(recent.reports || []).length === 0 ? <tr><td colSpan={5}>No recent reports</td></tr> : recent.reports.map((report) => (
                                <tr key={report._id}>
                                    <td><div style={{ fontWeight: 700 }}>{report.reporter?.name || '—'}</div><div className="text-xs text-muted">{report.reporter?.email || '—'}</div></td>
                                    <td><div style={{ fontWeight: 700 }}>{report.reported?.name || '—'}</div><div className="text-xs text-muted">{report.reported?.email || '—'}</div></td>
                                    <td className="capitalize">{String(report.reason || '—').replace(/_/g, ' ')}</td>
                                    <td><Badge status={report.status} /></td>
                                    <td>{formatDate(report.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function UserDetailModal({ token, userId, onClose }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        apiCall(`/admin/users/${userId}`, token).then((response) => {
            if (cancelled) return
            if (response.success) setData(response)
            setLoading(false)
        })
        return () => {
            cancelled = true
        }
    }, [token, userId])

    return (
        <Modal onClose={onClose} wide>
            {loading ? <div className="loading-state">Loading user activity…</div> : !data ? <EmptyState icon="⚠️" title="User not found" /> : (
                <div>
                    <div className="modal-header-row">
                        <div className="profile-head">
                            <Avatar name={data.user?.name} size={56} />
                            <div>
                                <h2>{data.user?.name}</h2>
                                <div className="text-muted">{data.user?.email} · {data.user?.phone || 'No phone'}</div>
                                <div className="text-muted capitalize">{data.user?.gender || '—'} · {data.user?.city || 'Unknown city'} · {data.user?.country || '—'}</div>
                            </div>
                        </div>
                        <div className="inline-badges">
                            <Badge status={data.user?.status} />
                            <Badge status={data.user?.verificationStatus || (data.user?.isVerified ? 'approved' : 'pending')} />
                        </div>
                    </div>

                    <div className="modal-grid">
                        <div className="panel-card">
                            <h3>Account Snapshot</h3>
                            <div className="stack-list">
                                <KeyValue label="Joined" value={formatDate(data.user?.createdAt)} />
                                <KeyValue label="Last Active" value={`${formatDate(data.user?.lastActive, true)} · ${formatRelative(data.user?.lastActive)}`} />
                                <KeyValue label="Online" value={data.user?.isOnline ? 'Yes' : 'No'} />
                                <KeyValue label="Subscription" value={planName(data.user?.subscription)} />
                                <KeyValue label="Profile Completeness" value={`${data.user?.profileCompleteness || 0}%`} />
                                <KeyValue label="Blocked Users" value={formatNumber(data.user?.blockedUsers?.length)} />
                            </div>
                        </div>

                        <div className="panel-card">
                            <h3>Activity Metrics</h3>
                            <div className="stack-list">
                                <KeyValue label="Total Messages" value={formatNumber(data.metrics?.messageCount)} />
                                <KeyValue label="Sent / Received" value={`${formatNumber(data.metrics?.sentCount)} / ${formatNumber(data.metrics?.receivedCount)}`} />
                                <KeyValue label="Active Conversations" value={formatNumber(data.metrics?.activeConversationCount)} />
                                <KeyValue label="Reports Filed" value={formatNumber(data.metrics?.reportCount)} />
                                <KeyValue label="Reports Against" value={formatNumber(data.metrics?.reportsAgainstCount)} />
                                <KeyValue label="Matches / Likes" value={`${formatNumber(data.metrics?.totalMatches)} / ${formatNumber(data.metrics?.likedMatches)}`} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-grid">
                        <div className="panel-card">
                            <h3>Recent Messages</h3>
                            {(data.recentMessages || []).length === 0 ? <div className="text-muted">No recent messages</div> : (
                                <div className="activity-list">
                                    {data.recentMessages.map((message) => (
                                        <div key={message._id} className="activity-item">
                                            <div className="activity-title">{message.sender?.name} → {message.receiver?.name}</div>
                                            <div className="activity-sub">{message.content}</div>
                                            <div className="activity-meta">{formatDate(message.createdAt, true)} · {message.status}{message.isFlagged ? ` · flagged: ${message.flagReason || 'yes'}` : ''}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="panel-card">
                            <h3>Subscription History</h3>
                            {(data.subHistory || []).length === 0 ? <div className="text-muted">No subscriptions yet</div> : (
                                <div className="activity-list">
                                    {data.subHistory.map((subscription) => (
                                        <div key={subscription._id} className="activity-item">
                                            <div className="activity-title capitalize">{subscription.plan} · {formatCurrency(subscription.amount)}</div>
                                            <div className="activity-sub capitalize">{String(subscription.paymentMethod || '—').replace(/_/g, ' ')} · {subscription.paymentStatus.replace(/_/g, ' ')}</div>
                                            <div className="activity-meta">{formatDate(subscription.createdAt)} · ends {formatDate(subscription.endDate)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-grid">
                        <div className="panel-card">
                            <h3>Reports Filed</h3>
                            {(data.reportsFiled || []).length === 0 ? <div className="text-muted">No outgoing reports</div> : (
                                <div className="activity-list">
                                    {data.reportsFiled.map((report) => (
                                        <div key={report._id} className="activity-item">
                                            <div className="activity-title capitalize">{String(report.reason).replace(/_/g, ' ')}</div>
                                            <div className="activity-sub">Against {report.reported?.name || 'Unknown user'}</div>
                                            <div className="activity-meta">{formatDate(report.createdAt)} · {report.status}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="panel-card">
                            <h3>Reports Against User</h3>
                            {(data.reportsAgainst || []).length === 0 ? <div className="text-muted">No incoming reports</div> : (
                                <div className="activity-list">
                                    {data.reportsAgainst.map((report) => (
                                        <div key={report._id} className="activity-item">
                                            <div className="activity-title capitalize">{String(report.reason).replace(/_/g, ' ')}</div>
                                            <div className="activity-sub">Reported by {report.reporter?.name || 'Unknown user'}</div>
                                            <div className="activity-meta">{formatDate(report.createdAt)} · {report.status}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    )
}

function UsersTab({ token, onOpenUser }) {
    const [users, setUsers] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [gender, setGender] = useState('')
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState('')

    const load = async (nextPage = page) => {
        setLoading(true)
        const params = new URLSearchParams({ page: nextPage, limit: 20 })
        if (search) params.set('search', search)
        if (gender) params.set('gender', gender)
        if (status) params.set('status', status)
        const response = await apiCall(`/admin/users?${params.toString()}`, token)
        if (response.success) {
            setUsers(response.users)
            setTotal(response.total)
        }
        setLoading(false)
    }

    useEffect(() => {
        setPage(1)
    }, [search, gender, status])

    useEffect(() => {
        load(page)
    }, [page, search, gender, status])

    const showToast = (message) => {
        setToast(message)
        setTimeout(() => setToast(''), 3000)
    }

    const doAction = async (userId, action) => {
        if (action === 'ban' && !window.confirm('Permanently ban this user?')) return
        const endpoint = action === 'suspend'
            ? `/admin/users/${userId}/suspend`
            : action === 'unsuspend'
                ? `/admin/users/${userId}/unsuspend`
                : `/admin/users/${userId}/ban`
        const body = action === 'suspend' ? { hours: 24, reason: 'Admin action' } : {}
        const response = await apiCall(endpoint, token, { method: 'POST', body })
        showToast(response.message || 'Done')
        load(page)
    }

    return (
        <div>
            {toast ? <div className="toast">{toast}</div> : null}
            <div className="section-header">
                <h2>User Directory</h2>
                <span className="text-muted text-sm">{total} total users</span>
            </div>
            <div className="filter-row">
                <input className="search-input" placeholder="Search by name, email, phone…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput.trim())} />
                <button className="btn-primary small" onClick={() => setSearch(searchInput.trim())}>Search</button>
                <select className="filter-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">All genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {loading ? <div className="loading-state">Loading users…</div> : (
                <div className="table-card">
                    <table>
                        <thead><tr><th>User</th><th>Gender / Age</th><th>City</th><th>Status</th><th>Plan</th><th>Verified</th><th>Flags</th><th>Last Active</th><th>Actions</th></tr></thead>
                        <tbody>
                            {users.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users found</td></tr> : users.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="row-user">
                                            <Avatar name={user.name} />
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{user.name}</div>
                                                <div className="text-xs text-muted">{user.email}</div>
                                                <div className="text-xs text-muted">{user.phone || 'No phone'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="capitalize">{user.gender || '—'} / {user.age || '—'}</td>
                                    <td>{user.city || '—'}</td>
                                    <td><Badge status={user.status} /></td>
                                    <td className="capitalize">{planName(user.subscription)}</td>
                                    <td>{user.isVerified ? '✅' : '❌'}</td>
                                    <td>{user.flagCount || 0}</td>
                                    <td>{formatRelative(user.lastActive)}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="btn-link" onClick={() => onOpenUser(user._id)}>Open</button>
                                            {user.status !== 'suspended' && user.status !== 'banned' ? <button className="btn-suspend" onClick={() => doAction(user._id, 'suspend')}>Suspend</button> : null}
                                            {user.status === 'suspended' ? <button className="btn-approve" onClick={() => doAction(user._id, 'unsuspend')}>Unsuspend</button> : null}
                                            {user.status !== 'banned' ? <button className="btn-ban" onClick={() => doAction(user._id, 'ban')}>Ban</button> : null}
                                        </div>
                                    </td>
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

function ReportsTab({ token }) {
    const [reports, setReports] = useState([])
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [status, setStatus] = useState('pending')
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState('')
    const [selectedReport, setSelectedReport] = useState(null)
    const [note, setNote] = useState('')
    const [actionTaken, setActionTaken] = useState('warned')

    const load = async (nextPage = page) => {
        setLoading(true)
        const params = new URLSearchParams({ page: nextPage, limit: 20 })
        if (status) params.set('status', status)
        const response = await apiCall(`/admin/reports?${params.toString()}`, token)
        if (response.success) {
            setReports(response.reports)
            setTotal(response.total)
        }
        setLoading(false)
    }

    useEffect(() => {
        setPage(1)
    }, [status])

    useEffect(() => {
        load(page)
    }, [page, status])

    const showToast = (message) => {
        setToast(message)
        setTimeout(() => setToast(''), 3000)
    }

    const submitAction = async (action) => {
        if (!selectedReport) return
        const response = await apiCall(`/admin/reports/${selectedReport._id}/resolve`, token, {
            method: 'POST',
            body: { action, note, actionTaken },
        })
        showToast(response.message || 'Report updated')
        setSelectedReport(null)
        setNote('')
        setActionTaken('warned')
        load(page)
    }

    return (
        <div>
            {toast ? <div className="toast">{toast}</div> : null}
            <div className="section-header">
                <h2>Reports & Moderation</h2>
                <div className="tab-pills">
                    {['', 'pending', 'reviewed', 'action_taken', 'dismissed'].map((value) => (
                        <button key={value || 'all'} className={`pill ${status === value ? 'active' : ''}`} onClick={() => setStatus(value)}>{value || 'all'}</button>
                    ))}
                </div>
            </div>
            {loading ? <div className="loading-state">Loading reports…</div> : (
                <div className="table-card">
                    <table>
                        <thead><tr><th>Reporter</th><th>Reported User</th><th>Reason</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {reports.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No reports in this filter</td></tr> : reports.map((report) => (
                                <tr key={report._id}>
                                    <td><div style={{ fontWeight: 700 }}>{report.reporter?.name || '—'}</div><div className="text-xs text-muted">{report.reporter?.email || '—'}</div></td>
                                    <td><div style={{ fontWeight: 700 }}>{report.reported?.name || '—'}</div><div className="text-xs text-muted">{report.reported?.email || '—'}</div></td>
                                    <td className="capitalize">{String(report.reason || '—').replace(/_/g, ' ')}</td>
                                    <td><Badge status={report.status} /></td>
                                    <td>{formatDate(report.createdAt)}</td>
                                    <td>{report.status === 'pending' ? <button className="btn-link" onClick={() => setSelectedReport(report)}>Review</button> : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination page={page} total={total} limit={20} onPage={setPage} />
                </div>
            )}

            {selectedReport ? (
                <Modal onClose={() => setSelectedReport(null)}>
                    <h2>Review Report</h2>
                    <p className="text-muted modal-intro">Reason: {String(selectedReport.reason || '—').replace(/_/g, ' ')} · Reporter {selectedReport.reporter?.name || '—'} · Reported {selectedReport.reported?.name || '—'}</p>
                    <div className="field">
                        <label>Admin Note</label>
                        <textarea className="admin-textarea" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal moderation note" />
                    </div>
                    <div className="field">
                        <label>Action Taken label</label>
                        <select className="filter-select" value={actionTaken} onChange={(e) => setActionTaken(e.target.value)}>
                            <option value="warned">Warned</option>
                            <option value="suspended_24h">Suspended 24h</option>
                            <option value="suspended_7d">Suspended 7d</option>
                            <option value="banned">Banned</option>
                        </select>
                    </div>
                    <div className="modal-actions-row">
                        <button className="btn-approve large-action" onClick={() => submitAction('reviewed')}>Mark Reviewed</button>
                        <button className="btn-suspend large-action" onClick={() => submitAction('action_taken')}>Action Taken</button>
                        <button className="btn-reject large-action" onClick={() => submitAction('dismissed')}>Dismiss</button>
                    </div>
                </Modal>
            ) : null}
        </div>
    )
}

function VerificationsTab({ token }) {
    const [users, setUsers] = useState([])
    const [status, setStatus] = useState('pending')
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState('')
    const [lightbox, setLightbox] = useState(null)
    const [notes, setNotes] = useState({})

    const load = async () => {
        setLoading(true)
        const response = await apiCall(`/admin/verifications?status=${status}`, token)
        if (response.success) setUsers(response.users)
        setLoading(false)
    }

    useEffect(() => {
        load()
    }, [status])

    const showToast = (message) => {
        setToast(message)
        setTimeout(() => setToast(''), 3000)
    }

    const verify = async (userId, action) => {
        const response = await apiCall(`/admin/verify/${userId}`, token, {
            method: 'POST',
            body: { action, note: notes[userId] || '' },
        })
        showToast(response.message || 'Updated')
        load()
    }

    if (loading) return <div className="loading-state">Loading verifications…</div>

    return (
        <div>
            {toast ? <div className="toast">{toast}</div> : null}
            {lightbox ? <div className="modal-overlay" onClick={() => setLightbox(null)}><div className="modal-img-wrap" onClick={(event) => event.stopPropagation()}><img src={lightbox} alt="document" className="modal-img" /><button className="modal-close" onClick={() => setLightbox(null)}>✕</button></div></div> : null}
            <div className="section-header">
                <h2>Verification Queue</h2>
                <div className="tab-pills">
                    {['pending', 'approved', 'rejected', 'all'].map((value) => (
                        <button key={value} className={`pill ${status === value ? 'active' : ''}`} onClick={() => setStatus(value)}>{value}</button>
                    ))}
                </div>
            </div>
            {users.length === 0 ? <EmptyState icon="✅" title="No verification items" text="Nothing is waiting in this queue right now." /> : (
                <div className="verify-cards">
                    {users.map((user) => (
                        <div key={user._id} className="verify-card">
                            <div className="verify-head">
                                <div className="verify-avatar">{user.name?.[0]?.toUpperCase()}</div>
                                <div>
                                    <div className="verify-name">{user.name}</div>
                                    <div className="text-sm text-muted">{user.email}</div>
                                    <div className="text-sm text-muted capitalize">{user.gender}, {user.age} yrs · {user.city || 'Unknown city'}</div>
                                    <div className="text-xs text-muted">Submitted {formatDate(user.createdAt)}</div>
                                </div>
                            </div>
                            <div className="doc-images">
                                {user.cnicFront ? <div className="doc-thumb" onClick={() => setLightbox(user.cnicFront)}><img src={user.cnicFront} alt="CNIC front" /><span>CNIC Front</span></div> : null}
                                {user.cnicBack ? <div className="doc-thumb" onClick={() => setLightbox(user.cnicBack)}><img src={user.cnicBack} alt="CNIC back" /><span>CNIC Back</span></div> : null}
                                {user.livePhoto ? <div className="doc-thumb" onClick={() => setLightbox(user.livePhoto)}><img src={user.livePhoto} alt="live selfie" /><span>Live Selfie</span></div> : null}
                            </div>
                            {status === 'pending' ? (
                                <div className="verify-actions">
                                    <input className="note-input" placeholder="Rejection note (optional)" value={notes[user._id] || ''} onChange={(e) => setNotes((prev) => ({ ...prev, [user._id]: e.target.value }))} />
                                    <button className="btn-approve" onClick={() => verify(user._id, 'approve')}>Approve</button>
                                    <button className="btn-reject" onClick={() => verify(user._id, 'reject')}>Reject</button>
                                </div>
                            ) : user.verificationNote ? <div className="info-banner">Note: {user.verificationNote}</div> : null}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function FlaggedUsersTab({ token }) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState('')

    const load = async () => {
        setLoading(true)
        const response = await apiCall('/admin/flagged', token)
        if (response.success) setUsers(response.users)
        setLoading(false)
    }

    useEffect(() => {
        load()
    }, [])

    const showToast = (message) => {
        setToast(message)
        setTimeout(() => setToast(''), 3000)
    }

    const handleAction = async (userId, action) => {
        const endpoint = action === 'suspend' ? `/admin/users/${userId}/suspend` : `/admin/users/${userId}/ban`
        const body = action === 'suspend' ? { hours: 24, reason: 'Triggered chat safety filter' } : { reason: 'Admin ban after repeated contact sharing' }
        const response = await apiCall(endpoint, token, { method: 'POST', body })
        showToast(response.message || 'Done')
        load()
    }

    if (loading) return <div className="loading-state">Loading flagged users…</div>

    return (
        <div>
            {toast ? <div className="toast">{toast}</div> : null}
            <div className="section-header"><h2>Flagged Users</h2><span className="text-muted text-sm">{users.length} flagged</span></div>
            <div className="info-banner">These users attempted to share contact information or triggered safety filters in chat.</div>
            {users.length === 0 ? <EmptyState icon="🎉" title="No flagged users" text="Safety queue is clear right now." /> : (
                <div className="table-card">
                    <table>
                        <thead><tr><th>User</th><th>Gender</th><th>Flags</th><th>Warning</th><th>Status</th><th>Suspended Until</th><th>Actions</th></tr></thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td><div style={{ fontWeight: 700 }}>{user.name}</div><div className="text-xs text-muted">{user.email}</div></td>
                                    <td className="capitalize">{user.gender}</td>
                                    <td>{user.flagCount}</td>
                                    <td>{user.warningIssued ? '✅' : '❌'}</td>
                                    <td><Badge status={user.status} /></td>
                                    <td>{user.suspendedUntil ? formatDate(user.suspendedUntil, true) : '—'}</td>
                                    <td><div className="action-btns">{user.status !== 'suspended' && user.status !== 'banned' ? <button className="btn-suspend" onClick={() => handleAction(user._id, 'suspend')}>Suspend</button> : null}{user.status !== 'banned' ? <button className="btn-ban" onClick={() => handleAction(user._id, 'ban')}>Ban</button> : null}</div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function FlaggedMessagesTab({ token }) {
    const [messages, setMessages] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)

    const load = async (nextPage = page) => {
        setLoading(true)
        const response = await apiCall(`/admin/flagged-messages?page=${nextPage}&limit=20`, token)
        if (response.success) {
            setMessages(response.messages)
            setTotal(response.total)
        }
        setLoading(false)
    }

    useEffect(() => {
        load(page)
    }, [page])

    return (
        <div>
            <div className="section-header"><h2>Flagged Messages</h2><span className="text-muted text-sm">{total} total</span></div>
            <div className="info-banner">Messages shown here were blocked or flagged by the chat safety filter.</div>
            {loading ? <div className="loading-state">Loading flagged messages…</div> : (
                <div className="table-card">
                    <table>
                        <thead><tr><th>Sender</th><th>Receiver</th><th>Content</th><th>Reason</th><th>Date</th></tr></thead>
                        <tbody>
                            {messages.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No flagged messages</td></tr> : messages.map((message) => (
                                <tr key={message._id}>
                                    <td><div style={{ fontWeight: 700 }}>{message.sender?.name || '—'}</div><div className="text-xs text-muted">{message.sender?.email || '—'}</div></td>
                                    <td><div style={{ fontWeight: 700 }}>{message.receiver?.name || '—'}</div><div className="text-xs text-muted">{message.receiver?.email || '—'}</div></td>
                                    <td className="max-200">{message.content}</td>
                                    <td className="capitalize">{String(message.flagReason || '—').replace(/_/g, ' ')}</td>
                                    <td>{formatDate(message.createdAt, true)}</td>
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

function PaymentReviewModal({ token, subscription, onClose, onDone }) {
    const [note, setNote] = useState(subscription.reviewNote || '')
    const [loading, setLoading] = useState(false)

    const review = async (action) => {
        setLoading(true)
        const response = await apiCall(`/admin/subscriptions/${subscription._id}/review`, token, {
            method: 'POST',
            body: { action, note },
        })
        setLoading(false)
        onDone(response.message || 'Updated')
    }

    return (
        <Modal onClose={onClose} wide>
            <h2>Payment Review</h2>
            <div className="modal-grid" style={{ marginTop: 18 }}>
                <div className="panel-card">
                    <h3>Payment Details</h3>
                    <div className="stack-list">
                        <KeyValue label="User" value={subscription.user?.name || '—'} />
                        <KeyValue label="Email" value={subscription.user?.email || '—'} />
                        <KeyValue label="Plan" value={subscription.plan} />
                        <KeyValue label="Amount" value={formatCurrency(subscription.amount)} />
                        <KeyValue label="Method" value={String(subscription.paymentMethod || '—').replace(/_/g, ' ')} />
                        <KeyValue label="Status" value={subscription.paymentStatus.replace(/_/g, ' ')} />
                        <KeyValue label="Reference" value={subscription.paymentReference || subscription.transactionId || '—'} />
                        <KeyValue label="Submitted" value={formatDate(subscription.proofSubmittedAt || subscription.createdAt, true)} />
                    </div>
                </div>
                <div className="panel-card">
                    <h3>Receipt Preview</h3>
                    {subscription.receiptUrl ? <img src={subscription.receiptUrl} alt="receipt" className="receipt-preview" /> : <div className="text-muted">No receipt uploaded</div>}
                </div>
            </div>
            <div className="field">
                <label>Admin Note</label>
                <textarea className="admin-textarea" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Approval or rejection note" />
            </div>
            <div className="modal-actions-row">
                <button className="btn-approve large-action" disabled={loading} onClick={() => review('approve')}>Approve Payment</button>
                <button className="btn-reject large-action" disabled={loading} onClick={() => review('reject')}>Reject Payment</button>
            </div>
        </Modal>
    )
}

function SubscriptionsTab({ token, onOpenUser }) {
    const [subscriptions, setSubscriptions] = useState([])
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('pending')
    const [plan, setPlan] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('')
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [selectedSubscription, setSelectedSubscription] = useState(null)
    const [toast, setToast] = useState('')

    const load = async (nextPage = page) => {
        setLoading(true)
        const params = new URLSearchParams({ page: nextPage, limit: 20 })
        if (status) params.set('status', status)
        if (plan) params.set('plan', plan)
        if (paymentMethod) params.set('paymentMethod', paymentMethod)
        if (search) params.set('search', search)
        const response = await apiCall(`/admin/subscriptions?${params.toString()}`, token)
        if (response.success) {
            setSubscriptions(response.subscriptions)
            setTotal(response.total)
        }
        setLoading(false)
    }

    useEffect(() => {
        setPage(1)
    }, [status, plan, paymentMethod, search])

    useEffect(() => {
        load(page)
    }, [page, status, plan, paymentMethod, search])

    const pageStats = useMemo(() => ({
        revenue: subscriptions.filter((subscription) => subscription.paymentStatus === 'completed').reduce((sum, subscription) => sum + (subscription.amount || 0), 0),
        pending: subscriptions.filter((subscription) => ['awaiting_payment', 'pending', 'verification_submitted'].includes(subscription.paymentStatus)).length,
        active: subscriptions.filter((subscription) => subscription.isActive).length,
    }), [subscriptions])

    const showToast = (message) => {
        setToast(message)
        setTimeout(() => setToast(''), 3000)
    }

    return (
        <div>
            {toast ? <div className="toast">{toast}</div> : null}
            <div className="section-header"><h2>Subscriptions & Payments</h2><span className="text-muted text-sm">{total} records</span></div>
            <div className="filter-row">
                <input className="search-input" placeholder="Search by user name, email, phone…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput.trim())} />
                <button className="btn-primary small" onClick={() => setSearch(searchInput.trim())}>Search</button>
                <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All status</option>
                    <option value="pending">Pending review</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                </select>
                <select className="filter-select" value={plan} onChange={(e) => setPlan(e.target.value)}>
                    <option value="">All plans</option>
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="boost">Boost</option>
                    <option value="contact_unlock">Contact Unlock</option>
                </select>
                <select className="filter-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="">All methods</option>
                    <option value="bank_transfer">Bank transfer</option>
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="card">Card</option>
                </select>
            </div>
            <div className="stats-grid compact-grid">
                <div className="stat-card stat-green"><div className="stat-number">{formatCurrency(pageStats.revenue)}</div><div className="stat-label">Verified revenue on this page</div></div>
                <div className="stat-card stat-orange"><div className="stat-number">{formatNumber(pageStats.pending)}</div><div className="stat-label">Pending payment items</div></div>
                <div className="stat-card stat-blue"><div className="stat-number">{formatNumber(pageStats.active)}</div><div className="stat-label">Active subscriptions on this page</div></div>
            </div>
            {loading ? <div className="loading-state">Loading payments…</div> : (
                <div className="table-card">
                    <table>
                        <thead><tr><th>User</th><th>Plan</th><th>Amount</th><th>Method</th><th>Payment Status</th><th>Active</th><th>Reference</th><th>Created</th><th>Actions</th></tr></thead>
                        <tbody>
                            {subscriptions.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No payment records found</td></tr> : subscriptions.map((subscription) => (
                                <tr key={subscription._id}>
                                    <td><div style={{ fontWeight: 700 }}>{subscription.user?.name || '—'}</div><div className="text-xs text-muted">{subscription.user?.email || '—'}</div></td>
                                    <td className="capitalize">{subscription.plan}</td>
                                    <td>{formatCurrency(subscription.amount)}</td>
                                    <td className="capitalize">{String(subscription.paymentMethod || '—').replace(/_/g, ' ')}</td>
                                    <td><Badge status={subscription.paymentStatus} /></td>
                                    <td>{subscription.isActive ? '✅' : '—'}</td>
                                    <td>{subscription.paymentReference || subscription.transactionId || '—'}</td>
                                    <td>{formatDate(subscription.createdAt)}</td>
                                    <td>
                                        <div className="action-btns">
                                            {subscription.user?._id ? <button className="btn-link" onClick={() => onOpenUser(subscription.user._id)}>User</button> : null}
                                            {['awaiting_payment', 'pending', 'verification_submitted', 'rejected'].includes(subscription.paymentStatus) ? <button className="btn-approve" onClick={() => setSelectedSubscription(subscription)}>Review</button> : null}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination page={page} total={total} limit={20} onPage={setPage} />
                </div>
            )}
            {selectedSubscription ? <PaymentReviewModal token={token} subscription={selectedSubscription} onClose={() => setSelectedSubscription(null)} onDone={(message) => { setSelectedSubscription(null); showToast(message); load(page) }} /> : null}
        </div>
    )
}

function AnalyticsTab({ token }) {
    const [period, setPeriod] = useState('30d')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        apiCall(`/admin/analytics?period=${period}`, token).then((response) => {
            if (response.success) setData(response)
            setLoading(false)
        })
    }, [token, period])

    if (loading) return <div className="loading-state">Loading analytics…</div>
    if (!data) return <EmptyState icon="⚠️" title="Analytics unavailable" />

    const revenueTotal = (data.revenueGrowth || []).reduce((sum, row) => sum + (row.revenue || 0), 0)
    const newUsersTotal = (data.userGrowth || []).reduce((sum, row) => sum + (row.count || 0), 0)

    return (
        <div>
            <div className="section-header">
                <h2>Analytics</h2>
                <div className="tab-pills">{['7d', '30d', '90d'].map((value) => <button key={value} className={`pill ${period === value ? 'active' : ''}`} onClick={() => setPeriod(value)}>{value}</button>)}</div>
            </div>
            <div className="stats-grid compact-grid">
                <KPICard value={formatCurrency(revenueTotal)} label={`Revenue (${period})`} icon="💰" cls="stat-green" sub={`${(data.revenueGrowth || []).length} days with transactions`} />
                <KPICard value={formatNumber(newUsersTotal)} label={`New users (${period})`} icon="👥" cls="stat-blue" sub="registrations in period" />
                <KPICard value={formatNumber(data.relationshipSignals?.activeConversations)} label={`Active conversations (${period})`} icon="💬" cls="stat-purple" sub="unique conversation pairs" />
                <KPICard value={formatNumber(data.relationshipSignals?.totalMatchSuggestions)} label={`Match suggestions (${period})`} icon="❤️" cls="stat-purple" sub="system-generated matches" />
            </div>
            <div className="dashboard-grid">
                <div className="panel-card dashboard-span-2">
                    <h3>Revenue Trend</h3>
                    {(data.revenueGrowth || []).length === 0 ? <div className="text-muted text-sm">No revenue data for this period</div> : (
                        <MiniBarChart
                            items={data.revenueGrowth}
                            getValue={(row) => row.revenue}
                            getLabel={(row) => row._id}
                            getExtra={(row) => `${formatCurrency(row.revenue)} · ${formatNumber(row.count)} txns`}
                            colorClass="bar-green"
                        />
                    )}
                </div>
                <div className="panel-card">
                    <h3>User Growth</h3>
                    {(data.userGrowth || []).length === 0 ? <div className="text-muted text-sm">No user growth data</div> : (
                        <MiniBarChart
                            items={data.userGrowth}
                            getValue={(row) => row.count}
                            getLabel={(row) => row._id}
                            colorClass="bar-primary"
                        />
                    )}
                </div>
                <div className="panel-card">
                    <h3>Payment Methods</h3>
                    <MiniBarChart
                        items={data.paymentMethodDistribution || []}
                        getValue={(item) => item.count}
                        getLabel={(item) => String(item._id || 'unknown').replace(/_/g, ' ')}
                        getExtra={(item) => `${formatNumber(item.count)} · ${formatCurrency(item.revenue)}`}
                        colorClass="bar-green"
                    />
                </div>
                <div className="panel-card">
                    <h3>Plan Distribution</h3>
                    <MiniBarChart
                        items={data.planDistribution || []}
                        getValue={(item) => item.count}
                        getLabel={(item) => item._id || 'unknown'}
                        colorClass="bar-primary"
                    />
                </div>
                <div className="panel-card">
                    <h3>Report Reasons</h3>
                    <MiniBarChart
                        items={data.reportReasonDistribution || []}
                        getValue={(item) => item.count}
                        getLabel={(item) => String(item._id).replace(/_/g, ' ')}
                        colorClass="bar-red"
                    />
                </div>
            </div>
        </div>
    )
}

function BroadcastTab({ token }) {
    const [form, setForm] = useState({ title: '', body: '' })
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState('')

    const showToast = (message) => {
        setToast(message)
        setTimeout(() => setToast(''), 4000)
    }

    const send = async (event) => {
        event.preventDefault()
        if (!form.title.trim() || !form.body.trim()) return
        if (!window.confirm(`Send push notification to all users?\n\nTitle: ${form.title}\nBody: ${form.body}`)) return
        setLoading(true)
        const response = await apiCall('/admin/broadcast', token, { method: 'POST', body: form })
        showToast(response.message || (response.success ? 'Broadcast sent' : 'Failed'))
        if (response.success) setForm({ title: '', body: '' })
        setLoading(false)
    }

    return (
        <div>
            {toast ? <div className="toast">{toast}</div> : null}
            <div className="section-header"><h2>Broadcast Notification</h2></div>
            <div className="info-banner">This sends a push notification to all active users who have notifications enabled.</div>
            <div className="login-card form-card-wide">
                <form onSubmit={send}>
                    <div className="login-form">
                        <div className="field"><label>Title</label><input maxLength={60} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="New feature announcement" required /></div>
                        <div className="field"><label>Message</label><textarea className="admin-textarea" rows={4} maxLength={160} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write the push notification body" required /></div>
                    </div>
                    <div className="modal-actions-row">
                        <button type="button" className="btn-logout large-action" onClick={() => setForm({ title: '', body: '' })}>Clear</button>
                        <button type="submit" className="btn-primary large-action" disabled={loading}>{loading ? 'Sending…' : 'Send Broadcast'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function PhotoRequestsTab({ token }) {
    const [rows, setRows] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    const load = async (nextPage = page) => {
        setLoading(true)
        const response = await apiCall(`/admin/photo-requests?page=${nextPage}&limit=20`, token)
        if (response.success) {
            setRows(response.rows || [])
            setTotal(response.total || 0)
        }
        setLoading(false)
    }

    useEffect(() => {
        load(page)
    }, [page])

    return (
        <div>
            <div className="section-header">
                <h2>Photo View Requests</h2>
                <span className="text-muted text-sm">{total} users with pending requests</span>
            </div>
            <div className="info-banner">These are user-to-user photo view requests awaiting approval by the recipient. Monitor for spam patterns.</div>
            {loading ? <div className="loading-state">Loading photo requests…</div> : rows.length === 0 ? <EmptyState icon="📷" title="No pending photo requests" text="All photo view requests have been handled." /> : (
                <div className="table-card">
                    <table>
                        <thead><tr><th>Recipient</th><th>Gender / Age / City</th><th>Pending Requests From</th><th>Count</th></tr></thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.targetUser._id}>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>{row.targetUser.name}</div>
                                        <div className="text-xs text-muted">{row.targetUser.email}</div>
                                    </td>
                                    <td className="capitalize">{row.targetUser.gender || '—'} / {row.targetUser.age || '—'} / {row.targetUser.city || '—'}</td>
                                    <td>
                                        <div className="requester-list">
                                            {row.requests.slice(0, 5).map((r) => (
                                                <span key={r._id} className="requester-chip">{r.name} ({r.gender}, {r.age})</span>
                                            ))}
                                            {row.requests.length > 5 ? <span className="text-muted text-xs">+{row.requests.length - 5} more</span> : null}
                                        </div>
                                    </td>
                                    <td><span className="badge badge-warning">{row.count}</span></td>
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

function ContactUnlockPaymentsTab({ token, onOpenUser }) {
    const [payments, setPayments] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [toast, setToast] = useState('')

    const load = async (nextPage = page) => {
        setLoading(true)
        const response = await apiCall(`/admin/contact-unlock-payments?page=${nextPage}&limit=20`, token)
        if (response.success) {
            setPayments(response.payments || [])
            setTotal(response.total || 0)
        }
        setLoading(false)
    }

    useEffect(() => {
        load(page)
    }, [page])

    const showToast = (message) => {
        setToast(message)
        setTimeout(() => setToast(''), 3000)
    }

    return (
        <div>
            {toast ? <div className="toast">{toast}</div> : null}
            <div className="section-header">
                <h2>Contact Unlock Payments (PKR 299)</h2>
                <span className="text-muted text-sm">{total} total</span>
            </div>
            <div className="info-banner">Users pay PKR 299 to unlock a specific contact after their request was accepted. Review and approve/reject these manually.</div>
            {loading ? <div className="loading-state">Loading…</div> : payments.length === 0 ? <EmptyState icon="🔓" title="No contact unlock payments" text="None yet." /> : (
                <div className="table-card">
                    <table>
                        <thead><tr><th>Requester (Payer)</th><th>Target Contact</th><th>Amount</th><th>Status</th><th>Reference</th><th>Created</th><th>Actions</th></tr></thead>
                        <tbody>
                            {payments.map((p) => (
                                <tr key={p._id}>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>{p.user?.name || '—'}</div>
                                        <div className="text-xs text-muted">{p.user?.email || '—'}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>{p.targetUser?.name || '—'}</div>
                                        <div className="text-xs text-muted">{p.targetUser?.phone || 'phone hidden'}</div>
                                    </td>
                                    <td>{formatCurrency(p.amount)}</td>
                                    <td><Badge status={p.paymentStatus} /></td>
                                    <td>{p.paymentReference || p._id.toString().slice(-8)}</td>
                                    <td>{formatDate(p.createdAt)}</td>
                                    <td>
                                        <div className="action-btns">
                                            {p.user?._id ? <button className="btn-link" onClick={() => onOpenUser(p.user._id)}>Payer</button> : null}
                                            {['awaiting_payment', 'pending', 'verification_submitted', 'rejected'].includes(p.paymentStatus) ? (
                                                <button className="btn-approve" onClick={() => setSelectedPayment(p)}>Review</button>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination page={page} total={total} limit={20} onPage={setPage} />
                </div>
            )}
            {selectedPayment ? <PaymentReviewModal token={token} subscription={selectedPayment} onClose={() => setSelectedPayment(null)} onDone={(message) => { setSelectedPayment(null); showToast(message); load(page) }} /> : null}
        </div>
    )
}

const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'subscriptions', label: 'Payments', icon: '💳' },
    { id: 'contactUnlock', label: 'Contact Unlocks', icon: '🔓' },
    { id: 'verifications', label: 'Verifications', icon: '🪪' },
    { id: 'photoRequests', label: 'Photo Requests', icon: '📷' },
    { id: 'reports', label: 'Reports', icon: '🚨' },
    { id: 'flagged', label: 'Flagged Users', icon: '🚩' },
    { id: 'flaggedMessages', label: 'Flagged Messages', icon: '🔇' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'broadcast', label: 'Broadcast', icon: '📢' },
]

function App() {
    const [auth, setAuth] = useState(() => {
        try {
            const stored = sessionStorage.getItem('shadi_admin')
            return stored ? JSON.parse(stored) : null
        } catch {
            return null
        }
    })
    const [tab, setTab] = useState('dashboard')
    const [selectedUserId, setSelectedUserId] = useState(null)

    const handleLogin = (token, user) => {
        const nextAuth = { token, user }
        setAuth(nextAuth)
        sessionStorage.setItem('shadi_admin', JSON.stringify(nextAuth))
    }

    const handleLogout = () => {
        setAuth(null)
        setTab('dashboard')
        sessionStorage.removeItem('shadi_admin')
    }

    if (!auth) return <Login onLogin={handleLogin} />

    const pages = {
        dashboard: <Dashboard token={auth.token} onOpenUser={setSelectedUserId} onNavigate={setTab} />,
        users: <UsersTab token={auth.token} onOpenUser={setSelectedUserId} />,
        subscriptions: <SubscriptionsTab token={auth.token} onOpenUser={setSelectedUserId} />,
        contactUnlock: <ContactUnlockPaymentsTab token={auth.token} onOpenUser={setSelectedUserId} />,
        verifications: <VerificationsTab token={auth.token} />,
        photoRequests: <PhotoRequestsTab token={auth.token} />,
        reports: <ReportsTab token={auth.token} />,
        flagged: <FlaggedUsersTab token={auth.token} />,
        flaggedMessages: <FlaggedMessagesTab token={auth.token} />,
        analytics: <AnalyticsTab token={auth.token} />,
        broadcast: <BroadcastTab token={auth.token} />,
    }

    return (
        <div className="admin-container">
            <aside className="sidebar">
                <div className="logo"><span className="logo-icon">💍</span><div><h2>Shadii.pk</h2><div className="logo-sub">Admin Console</div></div></div>
                <nav className="nav-menu">
                    {NAV.map((item) => <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}>{item.icon} {item.label}</button>)}
                </nav>
                <div className="sidebar-footer">
                    <div className="admin-info"><Avatar name={auth.user?.name} /><div><div className="admin-name">{auth.user?.name || 'Admin'}</div><div className="admin-email">{auth.user?.email}</div></div></div>
                    <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
                </div>
            </aside>
            <div className="main-content">
                <div className="topbar"><h1>{NAV.find((item) => item.id === tab)?.label || 'Admin'}</h1><div className="topbar-right"><span className="live-badge">● Connected</span></div></div>
                <div className="content-area">{pages[tab]}</div>
            </div>
            {selectedUserId ? <UserDetailModal token={auth.token} userId={selectedUserId} onClose={() => setSelectedUserId(null)} /> : null}
        </div>
    )
}

export default App
