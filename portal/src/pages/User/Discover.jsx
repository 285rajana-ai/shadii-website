import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { getInitials, getProfilePhotoSrc } from '../../lib/profile';
import ProfileDetailModal from '../../components/ProfileDetailModal';
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

const PAKISTAN_REGIONS = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Kashmir',
  'Gilgit-Baltistan'
];

const MARITAL_STATUS_OPTIONS = ['Never Married', 'Divorced', 'Widowed', 'Separated'];

const MOTHER_TONGUE_OPTIONS = [
  'Urdu', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi', 'Saraiki', 'Kashmiri', 'Hindko', 'Other'
];

const QUICK_FILTERS = [
  { id: 'all', label: 'All', icon: Users },
  { id: 'online', label: 'Online', icon: Clock3 },
  { id: 'nearby', label: 'Nearby', icon: MapPin },
  { id: 'verified', label: 'Verified', icon: ShieldCheck },
  { id: 'boosted', label: 'Boosted', icon: Sparkles },
  { id: 'premium', label: 'Premium', icon: BadgeCheck },
];

export default function Discover() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [incoming, setIncoming] = useState(defaultIncoming);
  const [loading, setLoading] = useState(false);
  const [incomingLoading, setIncomingLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('browse');
  const [activeChipFilter, setActiveChipFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    ageMin: '18',
    ageMax: '60',
    region: '',
    city: '',
    sect: '',
    cast: '',
    maritalStatus: '',
    motherTongue: '',
    verifiedOnly: false,
    withPhotoOnly: true,
    sort: 'newest',
  });

  const requestCount = (incoming.photoRequests?.length || 0) + (incoming.contactRequests?.length || 0);
  const verifiedCount = useMemo(() => profiles.filter((profile) => profile.isVerified).length, [profiles]);
  const premiumCount = useMemo(() => profiles.filter((profile) => profile.isPremium).length, [profiles]);

  useEffect(() => {
    fetchBrowse();
    fetchIncoming();
  }, [activeChipFilter]);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchBrowse = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      
      // Apply advanced filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value === true) queryParams.append(key, 'true');
        if (typeof value === 'string' && value.trim()) queryParams.append(key, value.trim());
      });

      // Apply chip-based quick filters sorting
      if (activeChipFilter === 'online') {
        queryParams.set('sort', 'active');
      } else if (activeChipFilter === 'nearby') {
        queryParams.set('sort', 'nearby');
      } else if (activeChipFilter === 'boosted') {
        queryParams.set('sort', 'boosted');
      } else if (activeChipFilter === 'premium') {
        queryParams.set('sort', 'premium');
      } else if (activeChipFilter === 'verified') {
        queryParams.set('verifiedOnly', 'true');
      }

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
      region: '',
      city: '',
      sect: '',
      cast: '',
      maritalStatus: '',
      motherTongue: '',
      verifiedOnly: false,
      withPhotoOnly: true,
      sort: 'newest',
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
      if (data.success || data.message === 'Already requested') {
        const isFree = !user?.subscription?.isActive;
        const successMsg = isFree 
          ? 'Connection request sent! Free accounts can send exactly 1 message request once approved. Upgrade to premium for unlimited chatting.'
          : 'Connection request sent successfully! You will be notified once they approve.';
        setSuccess(data.message === 'Already requested' ? 'Connection request already sent.' : successMsg);
        fetchBrowse();
        
        // Navigate to chat room immediately
        navigate('/chat', { state: { selectUserId: profileId } });
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#8A1538]/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-gradient-to-tr from-[#245C54]/5 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8A1538] mb-2">
            <Sparkles className="h-4 w-4 text-[#8A1538] animate-pulse" />
            Serious Matrimonial Matches
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-[#8A1538] tracking-tight">
            Find Your Life Partner
          </h1>
          <p className="mt-2 text-sm text-[#202124]/75 max-w-xl font-medium">
            Browse compatible profiles in Punjab, Sindh, KPK, and Balochistan. Control photo visibility & connect securely.
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
      <div className="glass-panel p-3 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
        <div className="flex bg-[#FAF7F2] p-1 rounded-lg border border-[#E7DED3] self-start">
          <TabButton active={activeSubTab === 'browse'} onClick={() => setActiveSubTab('browse')}>
            <Search className="h-3.5 w-3.5" />
            Browse Feed
          </TabButton>
          <TabButton active={activeSubTab === 'incoming'} onClick={() => setActiveSubTab('incoming')}>
            <Clock3 className="h-3.5 w-3.5" />
            Requests
            {requestCount > 0 && (
              <span className="ml-2 bg-[#8A1538] text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-2 ring-white">
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
          <main className="order-2 lg:order-1 flex flex-col gap-6">
            
            {/* Horizontal Scrollable Quick Chips Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {QUICK_FILTERS.map((chip) => {
                const Icon = chip.icon;
                const active = activeChipFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setActiveChipFilter(chip.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase rounded-full transition-all border whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-[#8A1538] border-[#8A1538] text-white shadow-sm'
                        : 'bg-white border-[#E7DED3] text-[#5F6673] hover:border-[#8A1538] hover:text-[#8A1538]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="glass-panel grid min-h-[30rem] place-items-center text-sm text-[#202124]/60 rounded-2xl bg-white">
                <span className="inline-flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#8A1538]" />
                  <span className="font-semibold uppercase tracking-wider text-xs text-[#202124]/80">Loading matches...</span>
                </span>
              </div>
            ) : profiles.length === 0 ? (
              <EmptyState title="No profiles found" description="Try widening your advanced or quick filter preferences." />
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onPhotoRequest={() => requestPhotoUnlock(profile.id)}
                    onContactRequest={() => requestContactShare(profile.id)}
                    onViewDetails={() => {
                      setSelectedProfileId(profile.id);
                      setDetailModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Filters Panel */}
          <aside className="glass-panel p-5 rounded-2xl lg:sticky lg:top-6 order-1 lg:order-2 border border-[#E7DED3] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E7DED3] pb-4 mb-5">
              <h2 className="flex items-center gap-2 font-serif text-lg font-black text-[#8A1538]">
                <SlidersHorizontal className="h-4 w-4 text-[#8A1538]" />
                Filters
              </h2>
              <button onClick={resetFilters} className="text-xs font-bold text-[#5F6673] hover:text-[#8A1538] transition-colors">
                Reset
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Age Range</Label>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <Field type="number" name="ageMin" value={filters.ageMin} onChange={handleFilterChange} />
                  <span className="text-xs font-bold text-[#5F6673]/60 uppercase">to</span>
                  <Field type="number" name="ageMax" value={filters.ageMax} onChange={handleFilterChange} />
                </div>
              </div>
              <div>
                <Label>Province / Region</Label>
                <select
                  name="region"
                  value={filters.region}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-[#E7DED3] bg-white text-sm rounded-lg outline-none font-medium text-[#202124]"
                >
                  <option value="">All Regions</option>
                  {PAKISTAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
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
              <div>
                <Label>Marital Status</Label>
                <select
                  name="maritalStatus"
                  value={filters.maritalStatus}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-[#E7DED3] bg-white text-sm rounded-lg outline-none font-medium text-[#202124]"
                >
                  <option value="">All Statuses</option>
                  {MARITAL_STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <Label>Mother Tongue</Label>
                <select
                  name="motherTongue"
                  value={filters.motherTongue}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-[#E7DED3] bg-white text-sm rounded-lg outline-none font-medium text-[#202124]"
                >
                  <option value="">All Tongues</option>
                  {MOTHER_TONGUE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-2 border-t border-[#E7DED3] pt-4">
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

      <ProfileDetailModal
        profileId={selectedProfileId}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onConnect={selectedProfileId ? () => requestPhotoUnlock(selectedProfileId) : null}
      />
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-[#E7DED3] p-3 rounded-xl text-center shadow-sm min-w-[70px] sm:min-w-[90px]">
      <Icon className="mx-auto h-4 w-4 text-[#8A1538]" />
      <div className="mt-1 font-serif text-xl sm:text-2xl font-black text-[#8A1538]">{value}</div>
      <div className="text-[9px] font-bold uppercase tracking-wider text-[#5F6673]">{label}</div>
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase transition-all duration-200 rounded-md cursor-pointer ${
        active 
          ? 'bg-[#8A1538] text-white shadow-sm' 
          : 'text-[#5F6673] hover:text-[#8A1538]'
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
        ? 'border-red-800/25 bg-red-50 text-red-800' 
        : 'border-emerald-800/25 bg-emerald-50/50 text-[#147A5C]'
    }`}>
      {isError ? <X className="h-5 w-5 shrink-0" /> : <Check className="h-5 w-5 shrink-0 text-[#147A5C]" />}
      <span className="font-semibold">{children}</span>
    </div>
  );
}

function Label({ children }) {
  return <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#5F6673]">{children}</label>;
}

function Field(props) {
  return (
    <input 
      {...props} 
      className="w-full border border-[#E7DED3] bg-white focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] transition-all px-3 py-2 text-sm text-[#202124] rounded-lg outline-none font-medium placeholder-[#5F6673]/30" 
    />
  );
}

function CheckField({ children, ...props }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-[#202124]/75 select-none">
      <input type="checkbox" {...props} className="h-4 w-4 rounded border-[#E7DED3] text-[#8A1538] focus:ring-[#8A1538] accent-[#8A1538]" />
      {children}
    </label>
  );
}

function ProfileCard({ profile, onPhotoRequest, onContactRequest, onViewDetails }) {
  const photoSrc = getProfilePhotoSrc(profile, profile.isPhotoBlurred);

  return (
    <article className="glass-card flex flex-col overflow-hidden rounded-2xl relative min-h-[380px] bg-white border border-[#E7DED3]">
      {/* Image Area */}
      <div 
        onClick={onViewDetails}
        className="relative aspect-[1/1.1] image-fallback overflow-hidden bg-[#F6F0E8] cursor-pointer group"
      >
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
          {profile.isVerified && <CardBadge tone="verified">Verified</CardBadge>}
          {profile.isPremium && <CardBadge tone="berry">Premium</CardBadge>}
          {profile.isOnline && <CardBadge tone="green">Online</CardBadge>}
        </div>

        {/* Private Overlay */}
        {profile.isPhotoBlurred && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#202124]/40 p-5 text-center backdrop-blur-[4px] z-10">
            <KeyRound className="mb-2 h-7 w-7 text-white" />
            <p className="font-serif text-lg font-black text-white">Photos Private</p>
            <p className="text-[9px] uppercase tracking-widest text-[#FFFDF9]/85 font-extrabold mt-0.5">Rishta Approval Needed</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onPhotoRequest();
              }} 
              className="btn-premium-primary mt-4 px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg"
            >
              Request Access
            </button>
          </div>
        )}
      </div>

      {/* Info Details Area */}
      <div className="flex flex-1 flex-col p-4 bg-white relative">
        <div 
          onClick={onViewDetails}
          className="flex items-start justify-between gap-3 cursor-pointer group/title"
        >
          <div className="min-w-0">
            <h3 className="truncate font-serif text-xl font-bold text-[#8A1538] group-hover/title:underline">
              {profile.name}, {profile.age}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#5F6673]">
              <MapPin className="h-3.5 w-3.5 text-[#8A1538]" />
              {profile.city}{profile.region ? `, ${profile.region}` : ''}
            </p>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center border border-[#E7DED3] bg-[#FAF7F2] text-xs font-black rounded-lg text-[#8A1538] shadow-sm">
            {getInitials(profile.name)}
          </div>
        </div>

        {/* Profile Details attributes */}
        <dl 
          onClick={onViewDetails}
          className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2.5 border-y border-[#EFE7DD] py-3 text-[10px] text-[#202124] cursor-pointer"
        >
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
            <MessageSquare className="h-3.5 w-3.5 text-white" />
            Connect
          </button>
        </div>
      </div>
    </article>
  );
}

function CardBadge({ children, tone = 'gold' }) {
  const styles = {
    gold: 'bg-[#B5902B] text-white shadow-sm',
    berry: 'bg-[#8A1538] text-white shadow-sm',
    green: 'bg-[#18A66A] text-white shadow-sm',
    verified: 'bg-[#147A5C] text-white shadow-sm',
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
      <dt className="font-bold uppercase tracking-wider text-[#5F6673] text-[9px]">{label}</dt>
      <dd className="mt-0.5 font-bold text-[#202124] truncate">{value}</dd>
    </div>
  );
}

function IncomingRequests({ incoming, loading, onPhotoResponse, onContactResponse }) {
  if (loading) {
    return (
      <div className="glass-panel grid min-h-[22rem] place-items-center text-sm text-[#202124]/60 rounded-2xl bg-white border border-[#E7DED3]">
        <Loader2 className="mr-2 inline h-5 w-5 animate-spin text-[#8A1538]" />
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
    <section className="glass-panel p-6 rounded-2xl border border-[#E7DED3] bg-white shadow-sm">
      <h2 className="border-b border-[#EFE7DD] pb-3 font-serif text-xl font-black text-[#8A1538]">{title}</h2>
      {items.length === 0 ? (
        <div className="py-8 text-sm text-[#5F6673] font-medium">{empty}</div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(renderItem)}</div>
      )}
    </section>
  );
}

function RequestCard({ user, primaryLabel, secondaryLabel, onPrimary, onSecondary }) {
  return (
    <div className="flex gap-4 border border-[#E7DED3] bg-[#FFFDF9] p-4 rounded-xl shadow-sm">
      <img
        src={getProfilePhotoSrc(user)}
        alt={user?.name || 'Requester'}
        onError={(event) => { event.currentTarget.src = '/avatar-placeholder.svg'; }}
        className="h-16 w-16 object-cover image-fallback rounded-lg border border-[#E7DED3] shadow-inner"
      />
      <div className="min-w-0 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="truncate font-serif text-base font-bold text-[#8A1538]">
            {user?.name || 'Member'}, {user?.age || '-'}
          </h3>
          <p className="text-xs text-[#5F6673] font-semibold">{user?.city || 'Pakistan'}</p>
        </div>
        <div className="mt-3 flex gap-2">
          <button 
            onClick={onPrimary} 
            className="inline-flex items-center gap-1 bg-[#147A5C] px-3 py-1.5 text-[10px] font-black uppercase text-white rounded-lg cursor-pointer hover:brightness-110 shadow-sm"
          >
            <CheckCircle2 className="h-3 w-3" />
            {primaryLabel}
          </button>
          <button 
            onClick={onSecondary} 
            className="border border-red-800/20 px-3 py-1.5 text-[10px] font-black uppercase text-red-700 rounded-lg cursor-pointer hover:bg-red-50"
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
    <div className="glass-panel grid min-h-[26rem] place-items-center p-8 text-center rounded-2xl bg-white border border-[#E7DED3]">
      <div>
        <Search className="mx-auto h-12 w-12 text-[#8A1538] opacity-30 mb-4" />
        <h2 className="font-serif text-2xl font-black text-[#8A1538]">{title}</h2>
        <p className="mt-2 text-sm text-[#5F6673] font-medium max-w-sm mx-auto">{description}</p>
      </div>
    </div>
  );
}
