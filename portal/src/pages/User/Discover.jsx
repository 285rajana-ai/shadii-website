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
  PhoneCall,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
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
    <div className="max-w-7xl mx-auto px-4 py-7 sm:px-6 lg:px-8">
      <section className="surface-panel mb-6 overflow-hidden">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr] lg:p-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#9d7c37]">
              <Sparkles className="h-4 w-4" />
              Curated matrimonial dashboard
            </div>
            <h1 className="mt-3 text-3xl font-bold text-[#871635] sm:text-4xl">Find serious, verified matches</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#665c58]">
              Browse compatible profiles, request private photo access, and move conversations forward only when both sides are comfortable.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Metric icon={Users} label="Matches" value={profiles.length} />
            <Metric icon={ShieldCheck} label="Verified" value={verifiedCount} />
            <Metric icon={BadgeCheck} label="Premium" value={premiumCount} />
          </div>
        </div>
      </section>

      <div className="surface-panel mb-6 flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex flex-wrap gap-2">
          <TabButton active={activeSubTab === 'browse'} onClick={() => setActiveSubTab('browse')}>
            <Search className="h-4 w-4" />
            Find Matches
          </TabButton>
          <TabButton active={activeSubTab === 'incoming'} onClick={() => setActiveSubTab('incoming')}>
            <Clock3 className="h-4 w-4" />
            Incoming Requests
            {requestCount > 0 && <span className="ml-1 bg-white px-2 py-0.5 text-[10px] text-[#871635]">{requestCount}</span>}
          </TabButton>
        </div>
        <button
          onClick={() => {
            fetchBrowse();
            fetchIncoming();
          }}
          className="button-secondary inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      {activeSubTab === 'browse' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="surface-panel h-fit p-5 lg:sticky lg:top-28">
            <div className="flex items-center justify-between border-b border-[#e5d8bd] pb-3">
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-[#871635]">
                <Filter className="h-4 w-4 text-[#b6903f]" />
                Filters
              </h2>
              <button onClick={resetFilters} className="text-xs font-bold text-[#8a7670] hover:text-[#871635]">
                Reset
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <Label>Age Range</Label>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <Field type="number" name="ageMin" value={filters.ageMin} onChange={handleFilterChange} />
                  <span className="text-[#9b8c83]">to</span>
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
                <Label>Caste / Community</Label>
                <Field name="cast" value={filters.cast} onChange={handleFilterChange} placeholder="Rajput, Jatt" />
              </div>
              <div className="space-y-2 border-t border-[#eadfc9] pt-4">
                <CheckField name="verifiedOnly" checked={filters.verifiedOnly} onChange={handleFilterChange}>
                  Verified accounts only
                </CheckField>
                <CheckField name="withPhotoOnly" checked={filters.withPhotoOnly} onChange={handleFilterChange}>
                  With photos only
                </CheckField>
              </div>
              <button onClick={fetchBrowse} className="button-primary w-full px-4 py-3 text-xs font-bold uppercase">
                Apply Filters
              </button>
            </div>
          </aside>

          <main>
            {loading ? (
              <div className="surface-panel grid min-h-[28rem] place-items-center text-sm text-[#665c58]">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-[#b6903f]" />
                  Loading matches...
                </span>
              </div>
            ) : profiles.length === 0 ? (
              <EmptyState title="No profiles found" description="Try widening your age, city, sect, or caste filters." />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
    <div className="border border-[#eadcc1] bg-white/80 p-4 text-center">
      <Icon className="mx-auto h-5 w-5 text-[#b6903f]" />
      <div className="mt-2 font-serif text-2xl font-bold text-[#322421]">{value}</div>
      <div className="text-[10px] font-bold uppercase text-[#7b6d66]">{label}</div>
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase transition-colors ${
        active ? 'button-primary' : 'button-secondary'
      }`}
    >
      {children}
    </button>
  );
}

function Notice({ tone, children }) {
  const isError = tone === 'error';
  return (
    <div className={`mb-6 flex items-start gap-2 border p-4 text-sm ${
      isError ? 'border-[#871635] bg-[#fff4f5] text-[#871635]' : 'border-[#d8bd78] bg-[#fbf6e9] text-[#322421]'
    }`}>
      {isError ? <X className="h-5 w-5 shrink-0" /> : <Check className="h-5 w-5 shrink-0 text-[#9d7c37]" />}
      <span>{children}</span>
    </div>
  );
}

function Label({ children }) {
  return <label className="mb-1 block text-[11px] font-bold uppercase text-[#665c58]">{children}</label>;
}

function Field(props) {
  return <input {...props} className="w-full border border-[#e1d2b6] bg-[#fffdf8] px-3 py-2.5 text-sm text-[#322421]" />;
}

function CheckField({ children, ...props }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#665c58]">
      <input type="checkbox" {...props} className="h-4 w-4 accent-[#871635]" />
      {children}
    </label>
  );
}

function ProfileCard({ profile, onPhotoRequest, onContactRequest }) {
  const photoSrc = getProfilePhotoSrc(profile, profile.isPhotoBlurred);

  return (
    <article className="premium-card group flex min-h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/5] image-fallback overflow-hidden">
        <img
          src={photoSrc}
          alt={profile.name || 'Profile photo'}
          onError={(event) => { event.currentTarget.src = '/avatar-placeholder.svg'; }}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
            profile.isPhotoBlurred ? 'blur-xl scale-110 saturate-75' : ''
          }`}
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {profile.isVerified && <Badge>Verified</Badge>}
          {profile.isPremium && <Badge tone="berry">Premium</Badge>}
          {profile.isOnline && <Badge tone="green">Online</Badge>}
        </div>

        {profile.isPhotoBlurred && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#261513]/45 p-5 text-center backdrop-blur-[2px]">
            <KeyRound className="mb-3 h-9 w-9 text-white" />
            <p className="font-serif text-xl font-bold text-white">Photos Private</p>
            <p className="mt-1 text-xs uppercase text-white/80">Request permission first</p>
            <button onClick={onPhotoRequest} className="button-primary mt-4 px-4 py-2 text-[11px] font-bold uppercase">
              Request Unlock
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-2xl font-bold text-[#871635]">
              {profile.name}, {profile.age}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-[#665c58]">
              <MapPin className="h-4 w-4 text-[#b6903f]" />
              {profile.city || 'Unknown'}, {profile.country || 'Pakistan'}
            </p>
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center border border-[#e1d2b6] bg-[#fbf3e4] text-sm font-bold text-[#871635]">
            {getInitials(profile.name)}
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-[#eadfc9] py-4 text-xs">
          <Info label="Sect" value={profile.sect || 'Not set'} />
          <Info label="Caste" value={profile.cast || 'Not set'} />
          <Info label="Education" value={profile.education || 'Not set'} />
          <Info label="Status" value={profile.maritalStatus || 'Never Married'} />
        </dl>

        <div className="mt-auto pt-4">
          <button onClick={onPhotoRequest} className="w-full button-primary inline-flex items-center justify-center gap-2 px-3 py-2.5 text-[11px] font-bold uppercase">
            <MessageSquare className="h-4 w-4" />
            Connect
          </button>
        </div>
      </div>
    </article>
  );
}

function Badge({ children, tone = 'gold' }) {
  const styles = {
    gold: 'bg-[#b6903f] text-white',
    berry: 'bg-[#871635] text-white',
    green: 'bg-[#18784f] text-white',
  };
  return <span className={`${styles[tone]} px-2 py-1 text-[10px] font-black uppercase`}>{children}</span>;
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="font-bold uppercase text-[#9b8c83]">{label}</dt>
      <dd className="mt-1 truncate font-semibold text-[#322421]">{value}</dd>
    </div>
  );
}

function IncomingRequests({ incoming, loading, onPhotoResponse, onContactResponse }) {
  if (loading) {
    return (
      <div className="surface-panel grid min-h-[22rem] place-items-center text-sm text-[#665c58]">
        <Loader2 className="mr-2 inline h-5 w-5 animate-spin text-[#b6903f]" />
        Loading requests...
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
    <section className="surface-panel p-6">
      <h2 className="border-b border-[#e5d8bd] pb-3 font-serif text-2xl font-bold text-[#871635]">{title}</h2>
      {items.length === 0 ? (
        <div className="py-8 text-sm text-[#8a7670]">{empty}</div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(renderItem)}</div>
      )}
    </section>
  );
}

function RequestCard({ user, primaryLabel, secondaryLabel, onPrimary, onSecondary }) {
  return (
    <div className="flex gap-4 border border-[#eadcc1] bg-[#fffdf8] p-4">
      <img
        src={getProfilePhotoSrc(user)}
        alt={user?.name || 'Requester'}
        onError={(event) => { event.currentTarget.src = '/avatar-placeholder.svg'; }}
        className="h-16 w-16 object-cover image-fallback"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-serif text-lg font-bold text-[#871635]">
          {user?.name || 'Member'}, {user?.age || '-'}
        </h3>
        <p className="text-sm text-[#665c58]">{user?.city || 'Pakistan'}</p>
        <div className="mt-3 flex gap-2">
          <button onClick={onPrimary} className="inline-flex items-center gap-1 bg-[#18784f] px-3 py-1.5 text-xs font-bold uppercase text-white">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {primaryLabel}
          </button>
          <button onClick={onSecondary} className="border border-[#c65454] px-3 py-1.5 text-xs font-bold uppercase text-[#b23b3b]">
            {secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="surface-panel grid min-h-[24rem] place-items-center p-8 text-center">
      <div>
        <Search className="mx-auto h-10 w-10 text-[#b6903f]" />
        <h2 className="mt-4 font-serif text-2xl font-bold text-[#871635]">{title}</h2>
        <p className="mt-2 text-sm text-[#665c58]">{description}</p>
      </div>
    </div>
  );
}

