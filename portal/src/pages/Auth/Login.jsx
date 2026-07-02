import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ShieldAlert } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      if (data.success) {
        navigate('/');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Cannot connect to the authentication server. Please try again.');
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
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-[#605252]">
            Dignified Matchmaking for Pakistani Families
          </p>
        </div>

        {error && (
          <div className="bg-[#FAF2F2] border-l-4 border-[#800020] p-4 text-[#800020] text-sm flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 h-5 text-[#C5A059]" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:outline-none focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:outline-none focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="font-medium text-[#800020] hover:text-[#C5A059] transition-colors">
              Forgot your password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              style={{ color: '#ffffff' }}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase tracking-wider bg-[#800020] hover:bg-[#9E1B32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800020] transition-colors cursor-pointer !text-white"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm mt-4 text-[#605252]">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-[#800020] hover:text-[#C5A059] transition-colors font-bold">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
