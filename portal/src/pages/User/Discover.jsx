import React, { useEffect, useMemo, useState } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { getInitials, getProfilePhotoSrc } from '../../lib/profile';
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  Filter,
  KeyRound,
  Loader2,
  MapPin,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  UserCheck,
  SlidersHorizontal,
} from 'lucide-react';

const defaultIncoming = { photoRequests: [], contactRequests: [] };

export default function Discover() {
  const { token, user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [incoming, setIncoming] = useState(defaultIncoming);
  const [loading, setLoading] = useState(false);
  const [incomingLoading, setIncomingLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('browse');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    ageMin: '18',
    ageMax: '60',
    city: '',
    sect: '',
    cast: '',
    verifiedOnly: false,
    withPhotoOnly: false,
  });

  const requestCount = (incoming.photoRequests?.length || 0) + (incoming.contactRequests?.length || 0);
  const verifiedCount = useMemo(() => profiles.filter((profile) => profile.isVerified).length, [profiles]);
  const premiumCount = useMemo(() => profiles.filter((profile) => profile.isPremium).length, [profiles]);

  useEffect(() => {
    fetchBrowse();
    fetchIncoming();
  }, []);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchBrowse = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value === true) queryParams.append(key, 'true');
        if (typeof value === 'string' && value.trim()) queryParams.append(key, value.trim());
      });

      const res = await fetch(`${API_BASE}/profile/discover?${queryParams.toString()}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        setProfiles(data.profiles || []);
      } else {
        setError(data.message || 'Failed to fetch matches.');
      }
    } catch {
      setError('Could not connect to matches server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchIncoming = async () => {
    setIncomingLoading(true);
    try {
      const res = await fetch(`${API_BASE}/profile/incoming-requests`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        setIncoming({
          photoRequests: data.photoRequests || data.requests?.photoRequests || [],
          contactRequests: data.contactRequests || data.requests?.contactRequests || [],
        });
      }
    } catch (err) {
      console.error('Error fetching incoming requests:', err);
    } finally {
      setIncomingLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFilters((prev) => ({ ...prev, [event.target.name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      ageMin: '18',
      ageMax: '60',
      city: '',
      sect: '',
      cast: '',
      verifiedOnly: false,
      withPhotoOnly: false,
    });
  };

  const requestPhotoUnlock = async (profileId) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/profile/${profileId}/request-photo`, {
        method: 'POST',
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        const isFree = !user?.subscription?.isActive;
        const successMsg = isFree 
          ? 'Connection request sent! Free accounts can send exactly 1 message request once approved. Upgrade to premium for unlimited chatting.'
          : 'Connection request sent successfully! You will be notified once they approve.';
        setSuccess(data.message === 'Already requested' ? 'Connection request already sent.' : successMsg);
        fetchBrowse();
      } else {
        setError(data.message || 'Failed to request connection.');
      }
    } catch {
      setError('Error sending connection request.');
    }
  };

  const requestContactShare = async (profileId) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/profile/${profileId}/contact-request`, {
        method: 'POST',
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message || 'Contact sharing request sent.');
        fetchBrowse();
      } else {
        setError(data.message || 'Upgrade to request contact details.');
      }
    } catch {
      setError('Error sending request.');
    }
  };

  const handlePhotoResponse = async (requesterId, action) => {
    try {
      const res = await fetch(`${API_BASE}/profile/photo-requests/${requesterId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Photo request ${action === 'accept' ? 'approved' : 'ignored'}.`);
        fetchIncoming();
        fetchBrowse();
      } else {
        setError(data.message || 'Could not respond to photo request.');
      }
    } catch {
      setError('Error responding to photo request.');
    }
  };

  const handleContactResponse = async (requestId, status) => {
    try {
      const res = await fetch(`${API_BASE}/profile/contact-requests/${requestId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Contact sharing request ${status === 'accepted' ? 'approved' : 'ignored'}.`);
        fetchIncoming();
      } else {
        setError(data.message || 'Could not respond to contact request.');
      }
    } catch {
      setError('Error responding to contact request.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner Card */}
      <section className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Soft decorative background spots */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#800020]/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-gradient-to-tr from-[#D4AF37]/5 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
            <Sparkles className="h-4 w-4 text-[#D4AF37] animate-pulse" />
            Curated Matchmaking Suite
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-[#580820] tracking-tight">
            Discover Verified Matches
          </h1>
          <p className="mt-2 text-sm text-[#1F1515]/70 max-w-xl font-medium">
            Browse compatible partner recommendations, control photo privacy settings, and initiate conversations securely.
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="relative z-10 grid grid-cols-3 gap-2.5 sm:gap-4 self-start md:self-center shrink-0">
          <Metric icon={Users} label="Profiles" value={profiles.length} />
          <Metric icon={ShieldCheck} label="Verified" value={verifiedCount} />
          <Metric icon={BadgeCheck} label="Premium" value={premiumCount} />
        </div>
      </section>

      {/* Sub Tabs bar */}
      <div className="glass-panel p-3 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex bg-[#FAF8F5] p-1 rounded-lg border border-[#D4AF37]/15 self-start">
          <TabButton active={activeSubTab === 'browse'} onClick={() => setActiveSubTab('browse')}>
            <Search className="h-3.5 w-3.5" />
            Browse Profiles
          </TabButton>
          <TabButton active={activeSubTab === 'incoming'} onClick={() => setActiveSubTab('incoming')}>
            <Clock3 className="h-3.5 w-3.5" />
            Requests
            {requestCount > 0 && (
              <span className="ml-2 bg-[#800020] text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-2 ring-white">
                {requestCount}
              </span>
            )}
          </TabButton>
        </div>

        <button
          onClick={() => {
            fetchBrowse();
            fetchIncoming();
          }}
          className="btn-premium-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 self-stretch sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Feed
        </button>
      </div>

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      {activeSubTab === 'browse' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] items-start">
          {/* Main Feed */}
          <main className="order-2 lg:order-1">
            {loading ? (
              <div className="glass-panel grid min-h-[30rem] place-items-center text-sm text-[#1F1515]/60 rounded-2xl">
                <span className="inline-flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#800020]" />
                  <span className="font-semibold uppercase tracking-wider text-xs">Curating Matches...</span>
                </span>
              </div>
            ) : profiles.length === 0 ? (
              <EmptyState title="No profiles found" description="Try widening your age, city, sect, or caste filter parameters." />
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onPhotoRequest={() => requestPhotoUnlock(profile.id)}
                    onContactRequest={() => requestContactShare(profile.id)}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Filters Pane */}
          <aside className="glass-panel p-5 rounded-2xl lg:sticky lg:top-6 order-1 lg:order-2 border border-[#D4AF37]/20 shadow-[0_12px_24px_rgba(58,38,31,0.03)]">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-4 mb-5">
              <h2 className="flex items-center gap-2 font-serif text-lg font-black text-[#580820]">
                <SlidersHorizontal className="h-4 w-4 text-[#D4AF37]" />
                Filters
              </h2>
              <button onClick={resetFilters} className="text-xs font-bold text-[#1F1515]/50 hover:text-[#800020] transition-colors">
                Clear all
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Age Range</Label>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <Field type="number" name="ageMin" value={filters.ageMin} onChange={handleFilterChange} />
                  <span className="text-xs font-bold text-[#1F1515]/40 uppercase">to</span>
                  <Field type="number" name="ageMax" value={filters.ageMax} onChange={handleFilterChange} />
                </div>
              </div>
              <div>
                <Label>City</Label>
                <Field name="city" value={filters.city} onChange={handleFilterChange} placeholder="Lahore, Islamabad" />
              </div>
              <div>
                <Label>Sect</Label>
                <Field name="sect" value={filters.sect} onChange={handleFilterChange} placeholder="Sunni, Shia" />
              </div>
              <div>
                <Label>Caste / Cast</Label>
                <Field name="cast" value={filters.cast} onChange={handleFilterChange} placeholder="Arain, Rajput" />
              </div>
              <div className="space-y-2 border-t border-[#D4AF37]/15 pt-4">
                <CheckField name="verifiedOnly" checked={filters.verifiedOnly} onChange={handleFilterChange}>
                  Verified profiles only
                </CheckField>
                <CheckField name="withPhotoOnly" checked={filters.withPhotoOnly} onChange={handleFilterChange}>
                  With photos only
                </CheckField>
              </div>
              <button onClick={fetchBrowse} className="btn-premium-primary w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider mt-4">
                Apply Preferences
              </button>
            </div>
          </aside>
        </div>
      ) : (
        <IncomingRequests
          incoming={incoming}
          loading={incomingLoading}
          onPhotoResponse={handlePhotoResponse}
          onContactResponse={handleContactResponse}
        />
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/80 border border-[#D4AF37]/15 p-3 rounded-xl text-center shadow-[0_4px_12px_rgba(58,38,31,0.02)] min-w-[70px] sm:min-w-[90px]">
      <Icon className="mx-auto h-4 w-4 text-[#D4AF37]" />
      <div className="mt-1 font-serif text-xl sm:text-2xl font-black text-[#580820]">{value}</div>
      <div className="text-[9px] font-bold uppercase tracking-wider text-[#1F1515]/50">{label}</div>
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase transition-all duration-200 rounded-md cursor-pointer ${
        active 
          ? 'bg-[#800020] text-white shadow-sm' 
          : 'text-[#1F1515]/60 hover:text-[#800020]'
      }`}
    >
      {children}
    </button>
  );
}

function Notice({ tone, children }) {
  const isError = tone === 'error';
  return (
    <div className={`flex items-start gap-3 border p-4 text-sm rounded-xl shadow-sm ${
      isError 
        ? 'border-[#800020]/25 bg-[#800020]/5 text-[#800020]' 
        : 'border-[#D4AF37]/25 bg-[#FAF8F5] text-[#580820]'
    }`}>
      {isError ? <X className="h-5 w-5 shrink-0" /> : <Check className="h-5 w-5 shrink-0 text-[#D4AF37]" />}
      <span className="font-medium">{children}</span>
    </div>
  );
}

function Label({ children }) {
  return <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#1F1515]/60">{children}</label>;
}

function Field(props) {
  return (
    <input 
      {...props} 
      className="w-full border border-[#D4AF37]/20 bg-white/70 focus:bg-white focus:border-[#800020] focus:ring-1 focus:ring-[#800020] transition-all px-3 py-2 text-sm text-[#1F1515] rounded-lg outline-none font-medium placeholder-[#1F1515]/30" 
    />
  );
}

function CheckField({ children, ...props }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-[#1F1515]/75 select-none">
      <input type="checkbox" {...props} className="h-4 w-4 rounded border-[#D4AF37]/35 text-[#800020] focus:ring-[#800020] accent-[#800020]" />
      {children}
    </label>
  );
}

function ProfileCard({ profile, onPhotoRequest, onContactRequest }) {
  const photoSrc = getProfilePhotoSrc(profile, profile.isPhotoBlurred);

  return (
    <article className="glass-card flex flex-col overflow-hidden rounded-2xl relative min-h-[380px]">
      {/* Image Area */}
      <div className="relative aspect-[1/1.1] image-fallback overflow-hidden">
        <img
          src={photoSrc}
          alt={profile.name || 'Profile photo'}
          onError={(event) => { event.currentTarget.src = '/avatar-placeholder.svg'; }}
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            profile.isPhotoBlurred ? 'blur-2xl scale-110 saturate-50' : ''
          }`}
        />

        {/* Floating Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
          {profile.isVerified && <CardBadge>Verified</CardBadge>}
          {profile.isPremium && <CardBadge tone="berry">Premium</CardBadge>}
          {profile.isOnline && <CardBadge tone="green">Online</CardBadge>}
        </div>

        {/* Private Overlay */}
        {profile.isPhotoBlurred && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1F1515]/50 p-5 text-center backdrop-blur-[4px] z-10">
            <KeyRound className="mb-2 h-7 w-7 text-[#D4AF37]" />
            <p className="font-serif text-lg font-black text-white">Photos Blurred</p>
            <p className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold mt-0.5">Approval Required</p>
            <button 
              onClick={onPhotoRequest} 
              className="btn-premium-primary mt-4 px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg"
            >
              Request Access
            </button>
          </div>
        )}
      </div>

      {/* Info Details Area */}
      <div className="flex flex-1 flex-col p-4 bg-white/45 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-xl font-bold text-[#580820]">
              {profile.name}, {profile.age}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#1F1515]/50">
              <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
              {profile.city || 'Unknown'}, {profile.country || 'Pakistan'}
            </p>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center border border-[#D4AF37]/35 bg-[#FAF8F5] text-xs font-black rounded-lg text-[#800020] shadow-sm">
            {getInitials(profile.name)}
          </div>
        </div>

        {/* Profile Details attributes */}
        <dl className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2.5 border-y border-[#D4AF37]/15 py-3 text-[10px]">
          <Info label="Sect" value={profile.sect || 'Not set'} />
          <Info label="Caste" value={profile.cast || 'Not set'} />
          <Info label="Education" value={profile.education || 'Not set'} />
          <Info label="Marital Status" value={profile.maritalStatus || 'Never Married'} />
        </dl>

        {/* Action Button */}
        <div className="mt-auto pt-4">
          <button 
            onClick={onPhotoRequest} 
            className="w-full btn-premium-primary inline-flex items-center justify-center gap-2 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-xl"
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#D4AF37]" />
            Connect
          </button>
        </div>
      </div>
    </article>
  );
}

function CardBadge({ children, tone = 'gold' }) {
  const styles = {
    gold: 'bg-[#D4AF37] text-white border border-[#D4AF37]/20 shadow-sm',
    berry: 'bg-[#800020] text-white border border-[#800020]/20 shadow-sm',
    green: 'bg-[#1e6b48] text-white border border-green-500/20 shadow-sm',
  };
  return (
    <span className={`${styles[tone]} px-2 py-0.5 text-[9px] font-extrabold uppercase rounded tracking-wider`}>
      {children}
    </span>
  );
}

function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="font-bold uppercase tracking-wider text-[#1F1515]/40 text-[9px]">{label}</dt>
      <dd className="mt-0.5 font-bold text-[#1F1515] truncate">{value}</dd>
    </div>
  );
}

function IncomingRequests({ incoming, loading, onPhotoResponse, onContactResponse }) {
  if (loading) {
    return (
      <div className="glass-panel grid min-h-[22rem] place-items-center text-sm text-[#1F1515]/60 rounded-2xl">
        <Loader2 className="mr-2 inline h-5 w-5 animate-spin text-[#800020]" />
        Loading pending requests...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RequestSection
        title="Incoming Photo View Requests"
        empty="No pending photo view requests."
        items={incoming.photoRequests || []}
        renderItem={(requester) => (
          <RequestCard
            key={requester._id}
            user={requester}
            primaryLabel="Accept"
            secondaryLabel="Ignore"
            onPrimary={() => onPhotoResponse(requester._id, 'accept')}
            onSecondary={() => onPhotoResponse(requester._id, 'reject')}
          />
        )}
      />
      <RequestSection
        title="Incoming Contact Detail Requests"
        empty="No pending contact detail requests."
        items={incoming.contactRequests || []}
        renderItem={(request) => (
          <RequestCard
            key={request._id}
            user={request.fromUser}
            primaryLabel="Approve"
            secondaryLabel="Ignore"
            onPrimary={() => onContactResponse(request._id, 'accepted')}
            onSecondary={() => onContactResponse(request._id, 'rejected')}
          />
        )}
      />
    </div>
  );
}

function RequestSection({ title, empty, items, renderItem }) {
  return (
    <section className="glass-panel p-6 rounded-2xl border border-[#D4AF37]/20 shadow-md">
      <h2 className="border-b border-[#D4AF37]/15 pb-3 font-serif text-xl font-black text-[#580820]">{title}</h2>
      {items.length === 0 ? (
        <div className="py-8 text-sm text-[#1F1515]/50 font-medium">{empty}</div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(renderItem)}</div>
      )}
    </section>
  );
}

function RequestCard({ user, primaryLabel, secondaryLabel, onPrimary, onSecondary }) {
  return (
    <div className="flex gap-4 border border-[#D4AF37]/15 bg-white/80 p-4 rounded-xl shadow-sm">
      <img
        src={getProfilePhotoSrc(user)}
        alt={user?.name || 'Requester'}
        onError={(event) => { event.currentTarget.src = '/avatar-placeholder.svg'; }}
        className="h-16 w-16 object-cover image-fallback rounded-lg border border-[#D4AF37]/15 shadow-inner"
      />
      <div className="min-w-0 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="truncate font-serif text-base font-bold text-[#580820]">
            {user?.name || 'Member'}, {user?.age || '-'}
          </h3>
          <p className="text-xs text-[#1F1515]/50 font-semibold">{user?.city || 'Pakistan'}</p>
        </div>
        <div className="mt-3 flex gap-2">
          <button 
            onClick={onPrimary} 
            className="inline-flex items-center gap-1 bg-[#1a613f] px-3 py-1.5 text-[10px] font-black uppercase text-white rounded-lg cursor-pointer hover:brightness-110 shadow-sm"
          >
            <CheckCircle2 className="h-3 w-3" />
            {primaryLabel}
          </button>
          <button 
            onClick={onSecondary} 
            className="border border-red-800/30 px-3 py-1.5 text-[10px] font-black uppercase text-red-700 rounded-lg cursor-pointer hover:bg-red-50"
          >
            {secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="glass-panel grid min-h-[26rem] place-items-center p-8 text-center rounded-2xl">
      <div>
        <Search className="mx-auto h-12 w-12 text-[#D4AF37] mb-4" />
        <h2 className="font-serif text-2xl font-black text-[#580820]">{title}</h2>
        <p className="mt-2 text-sm text-[#1F1515]/60 font-medium max-w-sm mx-auto">{description}</p>
      </div>
    </div>
  );
}
