import React, { useState } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { User, Image, ShieldCheck, Save, Upload, Check, AlertCircle, Trash2, KeyRound, Loader2 } from 'lucide-react';

const CAST_OPTIONS = [
  'Abbasi', 'Ansari', 'Arain', 'Awan', 'Baloch', 'Bhatti', 'Bosan', 'Butt',
  'Chaudhry', 'Dogar', 'Farooqi', 'Gakhar', 'Gill', 'Gujjar', 'Hashmi', 'Janjua',
  'Jatt', 'Joya', 'Kakazai', 'Khan', 'Kharal', 'Khokhar', 'Malik', 'Memon',
  'Mughal', 'Naqvi', 'Pathan', 'Qureshi', 'Rajput', 'Siddiqui', 'Sheikh',
  'Syed', 'Tarar', 'Tiwana', 'Warraich', 'Wattoo', 'Yousafzai', 'Other'
];

const SECT_OPTIONS = [
  'Sunni', 'Shia', 'Wahabi', 'Deobandi', 'Barelvi', 'Ahl-e-Hadith', 'Other'
];

export default function ProfileWizard() {
  const { user, token, updateProfile, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'photos' | 'verification'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCasteDropdown, setShowCasteDropdown] = useState(false);
  const [showSectDropdown, setShowSectDropdown] = useState(false);

  // Details Form State
  const [details, setDetails] = useState({
    name: user?.name || '',
    age: user?.age || '',
    height: user?.height || '',
    education: user?.education || '',
    cast: user?.cast || '',
    sect: user?.sect || '',
    maritalStatus: user?.maritalStatus || '',
    city: user?.city || '',
    country: user?.country || 'Pakistan',
    motherTongue: user?.motherTongue || '',
    hobbies: user?.hobbies ? user.hobbies.join(', ') : '',
    interests: user?.interests ? user.interests.join(', ') : '',
    aboutMe: user?.aboutMe || '',
    hidePhotos: user?.hidePhotos || false,
  });

  // Photos State
  const [photos, setPhotos] = useState(user?.photos || []);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Verification State
  const [verification, setVerification] = useState({
    cnicFront: user?.verification?.cnicFront || '',
    cnicBack: user?.verification?.cnicBack || '',
    livePhoto: user?.verification?.livePhoto || '',
  });

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    if (name === 'height') {
      const clean = value.replace(/[^0-9']/g, '');
      if (clean.length > 0) {
        const ft = clean[0];
        setDetails(prev => ({ ...prev, height: `${ft}'` }));
      } else {
        setDetails(prev => ({ ...prev, height: '' }));
      }
    } else {
      setDetails({ ...details, [name]: value });
    }
  };

  const saveDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...details,
        hobbies: details.hobbies ? details.hobbies.split(',').map(s => s.trim()).filter(Boolean) : [],
        interests: details.interests ? details.interests.split(',').map(s => s.trim()).filter(Boolean) : [],
      };

      const success = await updateProfile(payload);
      if (success) {
        setSuccess('Bio & profile settings updated successfully.');
        await refreshUser();
      } else {
        setError('Failed to update details.');
      }
    } catch {
      setError('An error occurred while saving details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch(`${API_BASE}/profile/upload-photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setPhotos(data.photos);
        setSuccess('Photo uploaded successfully.');
        await refreshUser();
      } else {
        setError(data.message || 'Failed to upload photo.');
      }
    } catch {
      setError('Error uploading photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const deletePhoto = async (photoUrl) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE}/profile/photo`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ photoUrl }),
      });

      const data = await res.json();
      if (data.success) {
        setPhotos(data.photos);
        setSuccess('Photo deleted successfully.');
        await refreshUser();
      } else {
        setError(data.message || 'Failed to delete photo.');
      }
    } catch {
      setError('Error deleting photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append(type, file);

    try {
      const res = await fetch(`${API_BASE}/profile/verify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setVerification(data.verification);
        setSuccess(`${type === 'livePhoto' ? 'Selfie' : type === 'cnicFront' ? 'CNIC Front' : 'CNIC Back'} uploaded successfully.`);
        await refreshUser();
      } else {
        setError(data.message || 'Failed to upload verification document.');
      }
    } catch {
      setError('Error uploading verification file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header Wizard Panel */}
      <section className="glass-panel p-6 rounded-2xl relative overflow-hidden flex items-center justify-between">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#800020]/5 to-transparent blur-3xl pointer-events-none" />
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-[#580820] tracking-tight">
            Complete Your Profile
          </h1>
          <p className="mt-1 text-xs font-bold text-[#1F1515]/45 uppercase tracking-wider">
            Trustworthy profiles receive 8x more response rate
          </p>
        </div>
        <div className="text-right">
          <span className="block text-xs font-bold text-[#1F1515]/50">Verification Status</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase mt-1 tracking-wider border ${
            user?.isVerified
              ? 'bg-emerald-50 border-emerald-500/20 text-emerald-700'
              : 'bg-[#FAF8F5] border-[#D4AF37]/35 text-[#B5902B]'
          }`}>
            {user?.isVerified ? '✅ Verified Profile' : 'Pending Verification'}
          </span>
        </div>
      </section>

      {/* Tabs */}
      <div className="glass-panel p-1 rounded-2xl flex border border-[#D4AF37]/15 bg-[#FAF8F5] shadow-sm">
        <WizardTabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')} icon={User}>
          1. Bio & Lifestyle
        </WizardTabButton>
        <WizardTabButton active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} icon={Image}>
          2. Photos
        </WizardTabButton>
        <WizardTabButton active={activeTab === 'verification'} onClick={() => setActiveTab('verification')} icon={ShieldCheck}>
          3. Verification
        </WizardTabButton>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-3 border border-red-800/25 bg-red-50 p-4 text-sm rounded-xl text-red-800 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span className="font-semibold">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 border border-[#D4AF37]/25 bg-[#FAF8F5] p-4 text-sm rounded-xl text-[#580820] shadow-sm">
          <Check className="w-5 h-5 shrink-0 text-[#D4AF37]" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {/* ==========================================
          DETAILS FORM WIZARD STEP
          ========================================== */}
      {activeTab === 'details' && (
        <form onSubmit={saveDetails} className="glass-panel p-6 md:p-8 rounded-2xl space-y-6 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Full Name</Label>
              <Field
                type="text"
                name="name"
                value={details.name}
                onChange={handleDetailsChange}
                required
              />
            </div>
            <div>
              <Label>Age</Label>
              <Field
                type="number"
                name="age"
                value={details.age}
                onChange={handleDetailsChange}
                required
              />
            </div>
            <div className="relative">
              <Label>Height (e.g. 5'6")</Label>
              <Field
                type="text"
                name="height"
                value={details.height}
                onChange={handleDetailsChange}
                placeholder="5'4"
              />
              {/* Inline Height Suggestions */}
              {details.height && details.height.endsWith("'") && (
                <div className="absolute z-10 left-0 right-0 mt-1.5 p-3 bg-white border border-[#D4AF37]/20 shadow-xl max-h-48 overflow-y-auto grid grid-cols-4 gap-2 rounded-xl">
                  {Array.from({ length: 12 }).map((_, inch) => {
                    const opt = `${details.height}${inch}"`;
                    return (
                      <button
                        type="button"
                        key={inch}
                        onClick={() => setDetails(prev => ({ ...prev, height: opt }))}
                        className="px-2 py-1.5 text-xs border border-[#D4AF37]/25 bg-white hover:bg-[#800020] hover:text-white transition-colors rounded-lg text-center cursor-pointer font-bold text-[#1F1515]"
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <Label>Education</Label>
              <select
                name="education"
                value={details.education}
                onChange={handleDetailsChange}
                className="w-full px-3 py-2.5 border border-[#D4AF37]/20 bg-white/70 focus:bg-white focus:border-[#800020] focus:ring-1 focus:ring-[#800020] text-sm rounded-lg outline-none font-medium text-[#1F1515] transition-all"
              >
                <option value="">Select education</option>
                <option value="Matric">Matric</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Bachelors">Bachelors</option>
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="relative">
              <Label>Caste / Cast</Label>
              <Field
                type="text"
                name="cast"
                value={details.cast}
                onChange={handleDetailsChange}
                onFocus={() => setShowCasteDropdown(true)}
                onBlur={() => setTimeout(() => setShowCasteDropdown(false), 200)}
                placeholder="Arain, Rajput, Syed"
              />
              {showCasteDropdown && (
                <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-[#D4AF37]/20 shadow-xl rounded-xl">
                  {CAST_OPTIONS.filter(c => c.toLowerCase().includes((details.cast || '').toLowerCase())).map(c => (
                    <button
                      type="button"
                      key={c}
                      onMouseDown={() => setDetails(prev => ({ ...prev, cast: c }))}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#1F1515] hover:bg-[#800020] hover:text-white transition-colors cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <Label>Sect</Label>
              <Field
                type="text"
                name="sect"
                value={details.sect}
                onChange={handleDetailsChange}
                onFocus={() => setShowSectDropdown(true)}
                onBlur={() => setTimeout(() => setShowSectDropdown(false), 200)}
                placeholder="Sunni, Shia"
              />
              {showSectDropdown && (
                <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-[#D4AF37]/20 shadow-xl rounded-xl">
                  {SECT_OPTIONS.filter(s => s.toLowerCase().includes((details.sect || '').toLowerCase())).map(s => (
                    <button
                      type="button"
                      key={s}
                      onMouseDown={() => setDetails(prev => ({ ...prev, sect: s }))}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#1F1515] hover:bg-[#800020] hover:text-white transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>Marital Status</Label>
              <select
                name="maritalStatus"
                value={details.maritalStatus}
                onChange={handleDetailsChange}
                className="w-full px-3 py-2.5 border border-[#D4AF37]/20 bg-white/70 focus:bg-white focus:border-[#800020] focus:ring-1 focus:ring-[#800020] text-sm rounded-lg outline-none font-medium text-[#1F1515] transition-all"
              >
                <option value="">Select status</option>
                <option value="Never Married">Never Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
              </select>
            </div>
            <div>
              <Label>Mother Tongue</Label>
              <Field
                type="text"
                name="motherTongue"
                value={details.motherTongue}
                onChange={handleDetailsChange}
                placeholder="Punjabi, Urdu, Pashto"
              />
            </div>
            <div>
              <Label>City</Label>
              <Field
                type="text"
                name="city"
                value={details.city}
                onChange={handleDetailsChange}
                placeholder="Lahore, Karachi, Islamabad"
              />
            </div>
            <div>
              <Label>Country</Label>
              <Field
                type="text"
                name="country"
                value={details.country}
                onChange={handleDetailsChange}
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-4 border-t border-[#D4AF37]/15">
            <div>
              <Label>Hobbies (comma separated)</Label>
              <Field
                type="text"
                name="hobbies"
                value={details.hobbies}
                onChange={handleDetailsChange}
                placeholder="Reading, Gardening, Cooking"
              />
            </div>
            <div>
              <Label>Interests (comma separated)</Label>
              <Field
                type="text"
                name="interests"
                value={details.interests}
                onChange={handleDetailsChange}
                placeholder="Travelling, Poetry, Social Work"
              />
            </div>
            <div>
              <Label>About Me</Label>
              <textarea
                name="aboutMe"
                value={details.aboutMe}
                onChange={handleDetailsChange}
                rows="4"
                placeholder="Describe your family background, career, and partner expectations..."
                className="w-full border border-[#D4AF37]/20 bg-white/70 focus:bg-white focus:border-[#800020] focus:ring-1 focus:ring-[#800020] transition-all p-3 text-sm text-[#1F1515] rounded-xl outline-none font-medium placeholder-[#1F1515]/30 leading-relaxed"
              />
            </div>
          </div>

          {/* Privacy Switch option */}
          <div className="flex items-center justify-between border-t border-[#D4AF37]/15 pt-6">
            <div>
              <span className="block text-sm font-bold text-[#580820]">Hide Profile Photos</span>
              <p className="text-[10px] text-[#1F1515]/50 font-semibold uppercase tracking-wider mt-0.5">
                Require connection approval from members before they can unblur your pictures.
              </p>
            </div>
            <label className="flex cursor-pointer items-center select-none relative">
              <input
                type="checkbox"
                checked={details.hidePhotos}
                onChange={(e) => setDetails({ ...details, hidePhotos: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white border border-[#D4AF37]/35 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#D4AF37] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#800020] peer-checked:after:bg-white" />
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-premium-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* ==========================================
          PHOTOS UPLOAD WIZARD STEP
          ========================================== */}
      {activeTab === 'photos' && (
        <div className="glass-panel p-6 md:p-8 rounded-2xl space-y-6 shadow-md">
          <div>
            <h2 className="font-serif text-lg font-black text-[#580820]">Upload Gallery</h2>
            <p className="text-xs text-[#1F1515]/50 font-semibold uppercase tracking-wider mt-0.5">
              Add clear pictures to build trust. Max size 5MB.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Uploader Card */}
            <label className="border-2 border-dashed border-[#D4AF37]/35 hover:border-[#800020] hover:bg-[#800020]/5 cursor-pointer flex flex-col items-center justify-center aspect-square rounded-xl p-4 transition-all relative">
              {uploadingPhoto ? (
                <div className="flex flex-col items-center gap-2 text-[#800020]">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-[10px] font-black uppercase">Uploading...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-[#D4AF37] mb-2" />
                  <span className="text-[10px] font-black uppercase text-[#1F1515]/60 text-center">Add Photo</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
              />
            </label>

            {/* Photo Cards List */}
            {photos.map((photo, index) => (
              <div key={index} className="aspect-square border border-[#D4AF37]/15 rounded-xl overflow-hidden relative group">
                <img
                  src={photo}
                  alt={`Gallery photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#1F1515]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => deletePhoto(photo)}
                    className="p-2.5 bg-red-800 text-white rounded-lg cursor-pointer hover:brightness-110 shadow-sm"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          VERIFICATION UPLOAD WIZARD STEP
          ========================================== */}
      {activeTab === 'verification' && (
        <div className="glass-panel p-6 md:p-8 rounded-2xl space-y-6 shadow-md">
          <div>
            <h2 className="font-serif text-lg font-black text-[#580820]">Official Verification</h2>
            <p className="text-xs text-[#1F1515]/50 font-semibold uppercase tracking-wider mt-0.5">
              Securely verify your CNIC identity card. Verification increases match requests by up to 200%.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DocUploadCard
              title="CNIC Front"
              required={true}
              fileSrc={verification.cnicFront}
              loading={loading}
              onChange={(e) => handleVerificationUpload(e, 'cnicFront')}
            />
            <DocUploadCard
              title="CNIC Back"
              required={true}
              fileSrc={verification.cnicBack}
              loading={loading}
              onChange={(e) => handleVerificationUpload(e, 'cnicBack')}
            />
            <DocUploadCard
              title="Live Selfie"
              required={false}
              fileSrc={verification.livePhoto}
              loading={loading}
              onChange={(e) => handleVerificationUpload(e, 'livePhoto')}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function WizardTabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
        active
          ? 'bg-[#800020] text-white shadow-sm border border-[#800020]/20'
          : 'text-[#1F1515]/60 hover:text-[#800020]'
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function Label({ children }) {
  return <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#1F1515]/65">{children}</label>;
}

function Field(props) {
  return (
    <input 
      {...props} 
      className="w-full border border-[#D4AF37]/20 bg-white/70 focus:bg-white focus:border-[#800020] focus:ring-1 focus:ring-[#800020] transition-all px-3 py-2.5 text-sm text-[#1F1515] rounded-lg outline-none font-medium placeholder-[#1F1515]/30" 
    />
  );
}

function DocUploadCard({ title, required, fileSrc, loading, onChange }) {
  return (
    <div className="border border-[#D4AF37]/15 bg-white/80 p-4 rounded-xl flex flex-col justify-between items-center text-center shadow-sm relative aspect-[1.1/1]">
      <div className="mb-2">
        <span className="block text-sm font-bold text-[#580820]">{title}</span>
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#1F1515]/40 block mt-0.5">
          {required ? 'Required' : 'Optional'}
        </span>
      </div>

      {fileSrc ? (
        <div className="w-full flex-1 border border-[#D4AF37]/15 rounded-lg overflow-hidden relative my-2">
          <img src={fileSrc} alt={title} className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 bg-emerald-700 text-white rounded-full p-1 shadow-sm">
            <Check className="w-3.5 h-3.5" />
          </div>
        </div>
      ) : (
        <label className="w-full flex-1 border-2 border-dashed border-[#D4AF37]/35 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#800020] transition-colors my-2">
          <Upload className="w-5 h-5 text-[#D4AF37]" />
          <input type="file" accept="image/*" onChange={onChange} disabled={loading} className="hidden" />
        </label>
      )}

      <span className="text-[9px] text-[#1F1515]/45 font-medium mt-1">
        {fileSrc ? 'Document uploaded ✓' : 'Upload photo'}
      </span>
    </div>
  );
}
