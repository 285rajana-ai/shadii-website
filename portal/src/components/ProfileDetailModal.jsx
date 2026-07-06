import React, { useEffect, useState } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { getProfilePhotoSrc, getInitials } from '../lib/profile';
import {
  X,
  MapPin,
  ShieldCheck,
  Crown,
  Sparkles,
  Phone,
  Lock,
  User,
  Heart,
  Briefcase,
  Layers,
  GraduationCap,
  Calendar,
  AlertCircle,
  Loader2,
  Mail,
  HelpCircle,
  HeartCrack,
} from 'lucide-react';

export default function ProfileDetailModal({ profileId, isOpen, onClose, onConnect }) {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    if (isOpen && profileId) {
      fetchProfileDetails();
    } else {
      setProfile(null);
      setError('');
      setActivePhotoIdx(0);
    }
  }, [isOpen, profileId]);

  const fetchProfileDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/profile/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      } else {
        setError(data.message || 'Failed to load profile details.');
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background backdrop blur overlay */}
      <div 
        className="fixed inset-0 bg-[#202124]/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-[#E7DED3] text-[#202124] flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-none">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 bg-white/80 hover:bg-[#8A1538] hover:text-white rounded-full transition-all border border-[#E7DED3]/40 shadow-sm cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {loading ? (
            <div className="w-full min-h-[30rem] grid place-items-center bg-white p-8">
              <span className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#8A1538]" />
                <span className="font-semibold uppercase tracking-wider text-xs text-[#5F6673]">Loading partner details...</span>
              </span>
            </div>
          ) : error ? (
            <div className="w-full min-h-[25rem] flex flex-col items-center justify-center p-8 text-center bg-white gap-3">
              <AlertCircle className="h-10 w-10 text-red-600" />
              <p className="font-semibold text-red-800">{error}</p>
              <button onClick={onClose} className="btn-premium-secondary px-5 py-2 rounded-lg text-xs font-bold uppercase">Close</button>
            </div>
          ) : !profile ? null : (
            <>
              {/* LEFT SIDE: Photo Display / Gallery */}
              <div className="w-full md:w-[240px] shrink-0 bg-[#F6F0E8] relative flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E7DED3] aspect-square md:aspect-auto">
                <div className="relative w-full h-full min-h-[260px] md:min-h-[320px]">
                  <img
                    src={profile.photos?.[activePhotoIdx]?.url || getProfilePhotoSrc(profile, profile.isPhotoBlurred)}
                    alt={profile.name}
                    className={`w-full h-full object-cover ${profile.isPhotoBlurred ? 'blur-2xl scale-110 saturate-50' : ''}`}
                  />
                  {profile.isPhotoBlurred && (
                    <div className="absolute inset-0 bg-[#202124]/40 flex flex-col items-center justify-center p-4 text-center backdrop-blur-[3px] z-10">
                      <Lock className="h-6 w-6 text-white mb-1.5" />
                      <span className="font-serif text-md font-bold text-white">Photos Locked</span>
                      <span className="text-[8px] uppercase tracking-widest text-[#FFFDF9]/80 font-bold block mt-0.5">Approved matches only</span>
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute left-3 top-3 flex flex-col gap-1 z-10">
                    {profile.isVerified && (
                      <span className="bg-[#147A5C] text-white px-2 py-0.5 text-[8px] font-black uppercase rounded tracking-wider shadow-sm">
                        Verified
                      </span>
                    )}
                    {profile.isPremium && (
                      <span className="bg-[#8A1538] text-white px-2 py-0.5 text-[8px] font-black uppercase rounded tracking-wider shadow-sm">
                        Premium
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnails Row */}
                {profile.photos?.length > 1 && !profile.isPhotoBlurred && (
                  <div className="p-3 bg-white/70 border-t border-[#E7DED3] flex gap-2 overflow-x-auto">
                    {profile.photos.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhotoIdx(idx)}
                        className={`w-10 h-10 border rounded overflow-hidden shrink-0 transition-all ${
                          activePhotoIdx === idx ? 'border-[#8A1538] ring-1 ring-[#8A1538]' : 'border-[#E7DED3]'
                        }`}
                      >
                        <img src={p.url} className="w-full h-full object-cover" alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT SIDE: Profile Bio & lifestyle Details */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[60vh] md:max-h-[85vh]">
                <div className="space-y-6">
                  {/* Title & Location header */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-2xl font-black text-[#8A1538] tracking-tight">
                        {profile.name}, {profile.age}
                      </h2>
                      {profile.isOnline && (
                        <span className="h-2.5 w-2.5 bg-emerald-600 rounded-full animate-pulse shadow-[0_0_8px_#05cd99]" />
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-xs font-bold text-[#5F6673] mt-1 uppercase tracking-wider">
                      <MapPin className="h-4 w-4 text-[#8A1538]" />
                      {profile.city}, {profile.region || 'Pakistan'}
                    </p>
                  </div>

                  {/* Grid details specifications */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-[#EFE7DD] pt-4 text-xs">
                    <DetailItem icon={Calendar} label="Marital Status" value={profile.maritalStatus || 'Never Married'} />
                    <DetailItem icon={Briefcase} label="Caste / Cast" value={profile.cast || 'Not set'} />
                    <DetailItem icon={Layers} label="Sect / Faith" value={profile.sect || 'Not set'} />
                    <DetailItem icon={User} label="Mother Tongue" value={profile.motherTongue || 'Not set'} />
                    <DetailItem icon={GraduationCap} label="Education" value={profile.education || 'Not set'} />
                    <DetailItem icon={Sparkles} label="Height" value={profile.height || 'Not set'} />
                  </div>

                  {/* About segment */}
                  {profile.about && (
                    <div className="border-t border-[#EFE7DD] pt-4">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-[#5F6673] mb-1.5">About Me</h4>
                      <p className="text-xs text-[#202124]/85 leading-relaxed font-semibold">
                        {profile.about}
                      </p>
                    </div>
                  )}

                  {/* Tags lifestyles */}
                  {(profile.hobbies?.length > 0 || profile.interests?.length > 0) && (
                    <div className="border-t border-[#EFE7DD] pt-4 space-y-3">
                      {profile.hobbies?.length > 0 && (
                        <div>
                          <h4 className="text-[9px] font-black uppercase tracking-wider text-[#5F6673] mb-1.5">Hobbies</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.hobbies.map((h, idx) => (
                              <span key={idx} className="bg-[#FAF7F2] border border-[#E7DED3] text-[#202124]/80 px-2.5 py-1 text-[10px] font-bold rounded-lg">
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.interests?.length > 0 && (
                        <div>
                          <h4 className="text-[9px] font-black uppercase tracking-wider text-[#5F6673] mb-1.5">Interests</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.interests.map((i, idx) => (
                              <span key={idx} className="bg-[#FAF7F2] border border-[#E7DED3] text-[#202124]/80 px-2.5 py-1 text-[10px] font-bold rounded-lg">
                                {i}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Private phone/contact info check */}
                  <div className="border-t border-[#EFE7DD] pt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-[#5F6673] mb-2 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      Contact Details
                    </h4>
                    {profile.phone ? (
                      <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#147A5C]/20 p-3 rounded-xl">
                        <Phone className="h-4 w-4 text-[#147A5C]" />
                        <span className="font-mono text-sm font-black text-[#147A5C]">{profile.phone}</span>
                        <span className="text-[9px] uppercase font-black text-[#147A5C] bg-emerald-50 border border-emerald-500/10 px-2 py-0.5 rounded ml-auto">
                          Unlocked
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E7DED3] p-3 rounded-xl text-xs font-semibold text-[#5F6673]/70">
                        <Lock className="h-3.5 w-3.5 text-[#5F6673]/50" />
                        <span>Phone number hidden for profile privacy. Unlocked upon connection approval.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-8 border-t border-[#EFE7DD] pt-4 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="btn-premium-secondary px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl"
                  >
                    Close
                  </button>
                  {onConnect && (
                    <button
                      onClick={() => {
                        onConnect();
                        onClose();
                      }}
                      className="btn-premium-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5"
                    >
                      <Mail className="w-4 h-4 text-white" />
                      Connect Now
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <Icon className="h-4 w-4 text-[#8A1538] shrink-0 mt-0.5" />
      <div className="min-w-0">
        <span className="block text-[9px] uppercase font-black tracking-wider text-[#5F6673]/50">{label}</span>
        <span className="font-bold text-[#202124] truncate block mt-0.5">{value}</span>
      </div>
    </div>
  );
}
