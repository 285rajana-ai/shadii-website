import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ShieldAlert, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = request code, 2 = verify and reset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await forgotPassword(email);
      if (data.success) {
        setMessage('A password reset code has been sent to your email.');
        setStep(2);
      } else {
        setError(data.message || 'Failed to request password reset code.');
      }
    } catch (err) {
      setError('Cannot connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await resetPassword(email, otp, newPassword);
      if (data.success) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Resetting password failed. Check code and fields.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-[#E5DEC9] p-8 shadow-sm">
        <div className="text-center">
          <span className="text-5xl">🔑</span>
          <h2 className="mt-4 font-serif text-3xl font-extrabold tracking-tight text-[#800020]">
            {step === 1 ? 'Reset Password' : 'Enter New Password'}
          </h2>
          <p className="mt-2 text-sm text-[#605252]">
            {step === 1
              ? 'Enter your registered email to receive a recovery code'
              : 'Enter the code sent to your email and your new password'}
          </p>
        </div>

        {error && (
          <div className="bg-[#FAF2F2] border-l-4 border-[#800020] p-4 text-[#800020] text-sm flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-[#F2FAF4] border-l-4 border-[#C5A059] p-4 text-[#2C2121] text-sm flex items-start gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0 text-[#C5A059]" />
            <span>{message}</span>
          </div>
        )}

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequestCode}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:outline-none focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
                  placeholder="khan@email.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                style={{ color: '#ffffff' }}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase tracking-wider bg-[#800020] hover:bg-[#9E1B32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800020] transition-colors cursor-pointer !text-white"
              >
                {loading ? 'Sending Code...' : 'Send Recovery Code'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="otp" className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">
                6-Digit Recovery Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength="6"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="appearance-none relative block w-full px-3 py-3 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:outline-none focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-center text-xl font-bold tracking-widest"
                placeholder="000000"
              />
            </div>

            <div>
              <label htmlFor="newPassword font-bold" className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 h-5 text-[#C5A059]" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:outline-none focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                style={{ color: '#ffffff' }}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase tracking-wider bg-[#800020] hover:bg-[#9E1B32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800020] transition-colors cursor-pointer !text-white"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-sm mt-4 flex items-center justify-center gap-2">
          <Link to="/login" className="font-medium text-[#800020] hover:text-[#C5A059] transition-colors flex items-center gap-1 font-bold">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
