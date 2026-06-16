import React, { useState } from 'react';
import { Link, useNavigate as useNav, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Lock, Calendar, ShieldAlert } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNav();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'free';
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'female',
    age: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (Number(form.age) < 18) {
      setError('You must be at least 18 years old to register.');
      setLoading(false);
      return;
    }

    try {
      const data = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        password: form.password,
        age: Number(form.age),
      });
      if (data.success) {
        // Redirect to OTP verification page
        navigate('/verify-otp', { state: { userId: data.user.id, email: form.email } });
      } else {
        setError(data.message || 'Registration failed. Please check the fields and try again.');
      }
    } catch (err) {
      setError('Cannot connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-[#E5DEC9] p-8 shadow-sm">
        <div className="text-center">
          <span className="text-5xl">💍</span>
          <h2 className="mt-4 font-serif text-3xl font-extrabold tracking-tight text-[#800020]">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-[#605252]">
            {selectedPlan === 'premium'
              ? 'Create your account first, then activate premium from Membership.'
              : 'Start with a free account and upgrade whenever you are ready.'}
          </p>
        </div>

        {error && (
          <div className="bg-[#FAF2F2] border-l-4 border-[#800020] p-4 text-[#800020] text-sm flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setForm({ ...form, gender: 'female' })}
                className={`py-3 text-sm font-semibold border ${
                  form.gender === 'female'
                    ? 'border-[#800020] bg-[#800020] text-white'
                    : 'border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121]'
                } transition-all cursor-pointer`}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, gender: 'male' })}
                className={`py-3 text-sm font-semibold border ${
                  form.gender === 'male'
                    ? 'border-[#800020] bg-[#800020] text-white'
                    : 'border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121]'
                } transition-all cursor-pointer`}
              >
                Male
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 h-5 text-[#C5A059]" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:outline-none focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
                placeholder="Muhammad Khan"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 h-5 text-[#C5A059]" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:outline-none focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
                placeholder="khan@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 h-5 text-[#C5A059]" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:outline-none focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
                  placeholder="+923001234567"
                />
              </div>
            </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">
                Age
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 h-5 text-[#C5A059]" />
                </div>
                <input
                  id="age"
                  name="age"
                  type="number"
                  required
                  min="18"
                  value={form.age}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:outline-none focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
                  placeholder="24"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password font-bold" className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 h-5 text-[#C5A059]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength="8"
                  value={form.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:outline-none focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-[10px] leading-4 text-[#7a6a6a]">
                Use 8+ characters with uppercase, lowercase, and a number.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              style={{ color: '#ffffff' }}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase tracking-wider bg-[#800020] hover:bg-[#9E1B32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800020] transition-colors cursor-pointer !text-white"
            >
              {loading ? 'Creating Account...' : selectedPlan === 'premium' ? 'Create Account & View Premium' : 'Create Free Account'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm mt-4 text-[#605252]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#800020] hover:text-[#C5A059] transition-colors font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
