import React, { useState } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { User, Image, ShieldCheck, Save, Upload, Check, AlertCircle } from 'lucide-react';

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
    country: user?.country || 'Pakistan',
    city: user?.city || '',
    about: user?.about || '',
    hobbies: user?.hobbies?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    maritalStatus: user?.maritalStatus || 'Never Married',
    motherTongue: user?.motherTongue || '',
    sect: user?.sect || '',
    hidePhotos: user?.hidePhotos || false,
    preferencesNote: ''
  });

  // Photo & Verification State
  const [photoFile, setPhotoFile] = useState(null);
  const [verificationFiles, setVerificationFiles] = useState({
    cnicFront: null,
    cnicBack: null,
    livePhoto: null
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

    // Format hobbies & interests into arrays
    const formattedDetails = {
      ...details,
      age: Number(details.age),
      hobbies: details.hobbies.split(',').map(h => h.trim()).filter(Boolean),
      interests: details.interests.split(',').map(i => i.trim()).filter(Boolean),
    };
    delete formattedDetails.preferencesNote;

    try {
      const data = await updateProfile(formattedDetails);
      if (data.success) {
        setSuccess('Profile details saved successfully!');
      } else {
        setError(data.message || 'Failed to update profile details.');
      }
    } catch (err) {
      setError('An error occurred while saving details.');
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePhoto = async (e) => {
    e.preventDefault();
    if (!photoFile) return;
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('photo', photoFile);

    try {
      const res = await fetch(`${API_BASE}/profile/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Profile photo uploaded successfully!');
        setPhotoFile(null);
        await refreshUser();
      } else {
        setError(data.message || 'Failed to upload photo.');
      }
    } catch (err) {
      setError('An error occurred during photo upload.');
    } finally {
      setLoading(false);
    }
  };

  const uploadVerificationDocs = async (e) => {
    e.preventDefault();
    if (!verificationFiles.cnicFront || !verificationFiles.cnicBack) {
      setError('Please select both CNIC Front and CNIC Back images.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('cnicFront', verificationFiles.cnicFront);
    formData.append('cnicBack', verificationFiles.cnicBack);
    if (verificationFiles.livePhoto) {
      formData.append('livePhoto', verificationFiles.livePhoto);
    }

    try {
      const res = await fetch(`${API_BASE}/profile/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Verification documents submitted successfully! Admin will review shortly.');
        await refreshUser();
      } else {
        setError(data.message || 'Failed to submit verification.');
      }
    } catch (err) {
      setError('An error occurred during verification upload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Wizard Header */}
      <div className="bg-white border border-[#E5DEC9] p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#800020]">Complete Your Profile</h1>
          <p className="text-sm text-[#605252] mt-1">Provide accurate details to boost matchmaking recommendations.</p>
        </div>
        <div className="text-right">
          <span className="block text-xs font-semibold uppercase tracking-wider text-[#605252]">Profile Progress</span>
          <span className="text-2xl font-serif font-extrabold text-[#C5A059]">{user?.profileCompleteness || 0}%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5DEC9] mb-8 bg-white">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-4 text-center font-semibold text-sm border-b-2 transition-colors uppercase tracking-widest ${
            activeTab === 'details'
              ? 'border-[#800020] text-[#800020]'
              : 'border-transparent text-[#605252] hover:text-[#800020]'
          }`}
        >
          1. Bio & Lifestyle
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex-1 py-4 text-center font-semibold text-sm border-b-2 transition-colors uppercase tracking-widest ${
            activeTab === 'photos'
              ? 'border-[#800020] text-[#800020]'
              : 'border-transparent text-[#605252] hover:text-[#800020]'
          }`}
        >
          2. Profile Photos
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`flex-1 py-4 text-center font-semibold text-sm border-b-2 transition-colors uppercase tracking-widest ${
            activeTab === 'verification'
              ? 'border-[#800020] text-[#800020]'
              : 'border-transparent text-[#605252] hover:text-[#800020]'
          }`}
        >
          3. ID Verification
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-[#FAF2F2] border border-[#800020] text-[#800020] p-4 mb-6 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-[#F2FAF4] border border-[#C5A059] text-[#2C2121] p-4 mb-6 text-sm flex items-start gap-2">
          <Check className="w-5 h-5 shrink-0 text-[#C5A059]" />
          <span>{success}</span>
        </div>
      )}

      {/* Detail Fields Form */}
      {activeTab === 'details' && (
        <form onSubmit={saveDetails} className="bg-white border border-[#E5DEC9] p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={details.name}
                onChange={handleDetailsChange}
                required
                className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={details.age}
                onChange={handleDetailsChange}
                required
                className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">Height (e.g. 5'6")</label>
              <input
                type="text"
                name="height"
                value={details.height}
                onChange={handleDetailsChange}
                placeholder="5'4"
                className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
              />
              {/* Inline Height Suggestions (NEW) */}
              {details.height && details.height.endsWith("'") && (
                <div className="absolute z-10 left-0 right-0 mt-1 p-3 bg-white border border-[#E5DEC9] shadow-lg max-h-48 overflow-y-auto grid grid-cols-4 gap-2">
                  {Array.from({ length: 12 }).map((_, inch) => {
                    const opt = `${details.height}${inch}"`;
                    return (
                      <button
                        type="button"
                        key={inch}
                        onClick={() => setDetails(prev => ({ ...prev, height: opt }))}
                        className="px-2 py-1.5 text-xs border border-[#E5DEC9] bg-white hover:bg-[#800020] hover:text-white transition-colors rounded text-center cursor-pointer text-[#2C2121]"
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">Education</label>
              <select
                name="education"
                value={details.education}
                onChange={handleDetailsChange}
                className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">Caste / Cast</label>
              <input
                type="text"
                name="cast"
                value={details.cast}
                onChange={handleDetailsChange}
                onFocus={() => setShowCasteDropdown(true)}
                onBlur={() => setTimeout(() => setShowCasteDropdown(false), 200)}
                placeholder="Arain, Rajput, Syed"
                className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
              />
              {showCasteDropdown && (
                <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-[#E5DEC9] shadow-lg">
                  {CAST_OPTIONS.filter(c => c.toLowerCase().includes((details.cast || '').toLowerCase())).map(c => (
                    <button
                      type="button"
                      key={c}
                      onMouseDown={() => setDetails(prev => ({ ...prev, cast: c }))}
                      className="w-full text-left px-4 py-2 text-sm text-[#2C2121] hover:bg-[#800020] hover:text-white transition-colors cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">Sect</label>
              <input
                type="text"
                name="sect"
                value={details.sect}
                onChange={handleDetailsChange}
                onFocus={() => setShowSectDropdown(true)}
                onBlur={() => setTimeout(() => setShowSectDropdown(false), 200)}
                placeholder="Sunni, Shia"
                className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
              />
              {showSectDropdown && (
                <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-[#E5DEC9] shadow-lg">
                  {SECT_OPTIONS.filter(s => s.toLowerCase().includes((details.sect || '').toLowerCase())).map(s => (
                    <button
                      type="button"
                      key={s}
                      onMouseDown={() => setDetails(prev => ({ ...prev, sect: s }))}
                      className="w-full text-left px-4 py-2 text-sm text-[#2C2121] hover:bg-[#800020] hover:text-white transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">Marital Status</label>
              <select
                name="maritalStatus"
                value={details.maritalStatus}
                onChange={handleDetailsChange}
                className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
              >
                <option value="Never Married">Single / Never Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">Mother Tongue</label>
              <input
                type="text"
                name="motherTongue"
                value={details.motherTongue}
                onChange={handleDetailsChange}
                placeholder="Punjabi, Urdu, Pashto"
                className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">City</label>
              <input
                type="text"
                name="city"
                value={details.city}
                onChange={handleDetailsChange}
                placeholder="Lahore, Islamabad"
                className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={details.country}
                onChange={handleDetailsChange}
                className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">Hobbies (comma separated)</label>
            <input
              type="text"
              name="hobbies"
              value={details.hobbies}
              onChange={handleDetailsChange}
              placeholder="Reading, Gardening, Cooking"
              className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">Interests (comma separated)</label>
            <input
              type="text"
              name="interests"
              value={details.interests}
              onChange={handleDetailsChange}
              placeholder="Travelling, Poetry, Social Work"
              className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">About Me</label>
            <textarea
              name="about"
              value={details.about}
              onChange={handleDetailsChange}
              rows="4"
              placeholder="Describe your family background, profession, and details about yourself."
              className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">Partner Preferences</label>
            <textarea
              name="preferences"
              value={details.preferencesNote}
              onChange={(e) => setDetails({ ...details, preferencesNote: e.target.value })}
              rows="3"
              placeholder="Desired education, age range, location, and qualities in partner."
              className="w-full px-3 py-2.5 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
            />
          </div>

          <div className="flex items-start mt-4 p-4 bg-[#FCFBF7] border border-[#E5DEC9]">
            <div className="flex items-center h-5">
              <input
                id="hidePhotos"
                name="hidePhotos"
                type="checkbox"
                checked={details.hidePhotos}
                onChange={(e) => setDetails(prev => ({ ...prev, hidePhotos: e.target.checked }))}
                className="focus:ring-[#800020] h-4 w-4 text-[#800020] border-[#E5DEC9] rounded cursor-pointer"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="hidePhotos" className="font-semibold text-[#2c2121] select-none cursor-pointer">Private Profile Pictures</label>
              <p className="text-xs text-[#605252] mt-0.5">Hide your photos from free members (requires connection approval)</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-[#800020] text-white font-bold uppercase tracking-wider text-xs hover:bg-[#9E1B32] transition-colors cursor-pointer !text-white"
            >
              <Save className="w-4 h-4 text-white" />
              {loading ? 'Saving Details...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      )}

      {/* Photo Upload View */}
      {activeTab === 'photos' && (
        <div className="bg-white border border-[#E5DEC9] p-6 md:p-8 space-y-8">
          {/* Upload Widget */}
          <form onSubmit={uploadProfilePhoto} className="border border-dashed border-[#E5DEC9] bg-[#FCFBF7] p-8 text-center flex flex-col items-center">
            <Image className="w-12 h-12 text-[#C5A059] mb-3" />
            <p className="text-sm font-semibold text-[#2C2121]">Select your profile photo</p>
            <p className="text-xs text-[#605252] mt-1 mb-4">Supported formats: JPG, PNG, WebP. Max size: 5MB.</p>
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files[0])}
              className="hidden"
              id="photo-file-upload"
            />
            <label
              htmlFor="photo-file-upload"
              className="px-4 py-2 border border-[#C5A059] text-[#C5A059] text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              {photoFile ? photoFile.name : 'Choose File'}
            </label>

            {photoFile && (
              <button
                type="submit"
                disabled={loading}
                className="mt-4 px-6 py-2.5 bg-[#800020] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#9E1B32] transition-colors cursor-pointer !text-white"
              >
                {loading ? 'Uploading...' : 'Upload Selected Photo'}
              </button>
            )}
          </form>

          {/* Photo Gallery Grid */}
          <div>
            <h3 className="text-md font-serif font-bold text-[#800020] border-b border-[#E5DEC9] pb-2 mb-4">Your Photo Gallery</h3>
            {user?.photos && user.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {user.photos.map((photo, i) => (
                  <div key={i} className="border border-[#E5DEC9] relative group">
                    <img
                      src={photo.url}
                      alt={`Profile ${i}`}
                      className="w-full aspect-square object-cover"
                    />
                    {photo.isMain && (
                      <span className="absolute top-2 left-2 bg-[#C5A059] text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#A09090] text-sm">
                No photos uploaded yet. Upload your main photo to display on matches feed.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ID Verification View */}
      {activeTab === 'verification' && (
        <div className="bg-white border border-[#E5DEC9] p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-4 mb-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#800020]">National Identity Verification</h3>
              <p className="text-xs text-[#605252] mt-0.5">Provide verification to build trust. Verified matches get 4x more interests.</p>
            </div>
            <div className="text-right">
              <span className="block text-[10px] uppercase font-semibold text-[#605252]">Status</span>
              <span className={`inline-block border px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold ${
                user?.verificationStatus === 'approved'
                  ? 'border-green-600 text-green-700 bg-green-50'
                  : user?.verificationStatus === 'pending'
                  ? 'border-amber-500 text-amber-700 bg-amber-50'
                  : user?.verificationStatus === 'rejected'
                  ? 'border-red-600 text-red-700 bg-red-50'
                  : 'border-gray-300 text-gray-500 bg-gray-50'
              }`}>
                {user?.verificationStatus || 'unverified'}
              </span>
            </div>
          </div>

          {user?.verificationStatus === 'approved' ? (
            <div className="p-6 bg-green-50 border border-green-200 text-green-800 text-center flex flex-col items-center">
              <ShieldCheck className="w-16 h-16 text-green-600 mb-2" />
              <h4 className="font-serif font-bold text-lg">Your Profile is Verified</h4>
              <p className="text-xs text-green-700 mt-1 max-w-md">Your CNIC documentation has been approved by admin. A verified seal is now visible on your match profile card.</p>
            </div>
          ) : user?.verificationStatus === 'pending' ? (
            <div className="p-6 bg-amber-50 border border-amber-200 text-amber-800 text-center flex flex-col items-center">
              <AlertCircle className="w-16 h-16 text-amber-500 mb-2 animate-pulse" />
              <h4 className="font-serif font-bold text-lg">Verification Pending</h4>
              <p className="text-xs text-amber-700 mt-1 max-w-md">Our operations desk is reviewing your uploaded documents. This process takes up to 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={uploadVerificationDocs} className="space-y-6">
              {user?.verificationStatus === 'rejected' && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
                  <strong>Verification Rejected:</strong> {user.verificationNote || 'Documents were blurred or mismatched.'} Please re-upload clear photos.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CNIC Front */}
                <div className="border border-[#E5DEC9] p-4 bg-[#FCFBF7] flex flex-col items-center text-center">
                  <span className="text-2xl mb-1">💳</span>
                  <p className="text-xs font-bold uppercase text-[#2C2121]">CNIC Front Page</p>
                  <p className="text-[10px] text-[#605252] mt-0.5 mb-4">Upload a clear photo of CNIC Front side</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setVerificationFiles({ ...verificationFiles, cnicFront: e.target.files[0] })}
                    className="hidden"
                    id="cnic-front-upload"
                  />
                  <label
                    htmlFor="cnic-front-upload"
                    className="px-3 py-1.5 border border-[#C5A059] text-[#C5A059] text-[10px] uppercase font-bold tracking-wider hover:bg-[#C5A059] hover:text-white transition-all cursor-pointer"
                  >
                    {verificationFiles.cnicFront ? verificationFiles.cnicFront.name : 'Choose Image'}
                  </label>
                </div>

                {/* CNIC Back */}
                <div className="border border-[#E5DEC9] p-4 bg-[#FCFBF7] flex flex-col items-center text-center">
                  <span className="text-2xl mb-1">💳</span>
                  <p className="text-xs font-bold uppercase text-[#2C2121]">CNIC Back Page</p>
                  <p className="text-[10px] text-[#605252] mt-0.5 mb-4">Upload a clear photo of CNIC Back side</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setVerificationFiles({ ...verificationFiles, cnicBack: e.target.files[0] })}
                    className="hidden"
                    id="cnic-back-upload"
                  />
                  <label
                    htmlFor="cnic-back-upload"
                    className="px-3 py-1.5 border border-[#C5A059] text-[#C5A059] text-[10px] uppercase font-bold tracking-wider hover:bg-[#C5A059] hover:text-white transition-all cursor-pointer"
                  >
                    {verificationFiles.cnicBack ? verificationFiles.cnicBack.name : 'Choose Image'}
                  </label>
                </div>

                {/* Live Selfie */}
                <div className="border border-[#E5DEC9] p-4 bg-[#FCFBF7] flex flex-col items-center text-center">
                  <span className="text-2xl mb-1">📸</span>
                  <p className="text-xs font-bold uppercase text-[#2C2121]">Live Selfie Photo (Optional)</p>
                  <p className="text-[10px] text-[#605252] mt-0.5 mb-4">Take a selfie photo holding your CNIC card (if requested)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setVerificationFiles({ ...verificationFiles, livePhoto: e.target.files[0] })}
                    className="hidden"
                    id="live-photo-upload"
                  />
                  <label
                    htmlFor="live-photo-upload"
                    className="px-3 py-1.5 border border-[#C5A059] text-[#C5A059] text-[10px] uppercase font-bold tracking-wider hover:bg-[#C5A059] hover:text-white transition-all cursor-pointer"
                  >
                    {verificationFiles.livePhoto ? verificationFiles.livePhoto.name : 'Choose Image'}
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-[#800020] text-white font-bold uppercase tracking-wider text-xs hover:bg-[#9E1B32] transition-colors cursor-pointer !text-white"
                >
                  <Upload className="w-4 h-4 text-white" />
                  {loading ? 'Uploading Documents...' : 'Submit Documents for Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
