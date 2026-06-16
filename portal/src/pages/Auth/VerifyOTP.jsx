import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ShieldAlert, Timer } from 'lucide-react';

export default function VerifyOTP() {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(60);

  const userId = location.state?.userId;
  const email = location.state?.email;

  useEffect(() => {
    if (!userId) {
      // Redirect to login if user context is missing
      navigate('/login');
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError('Please enter a 6-digit verification code.');
      setLoading(false);
      return;
    }

    try {
      const data = await verifyOtp(userId, otp);
      if (data.success) {
        setMessage('Verification successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError(data.message || 'Verification failed. Please check the OTP.');
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setError('');
    setMessage('');
    try {
      const data = await resendOtp(email);
      if (data.success) {
        setMessage('A new OTP has been sent to your email.');
        setTimer(60);
      } else {
        setError(data.message || 'Resending OTP failed.');
      }
    } catch (err) {
      setError('Could not resend code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-[#E5DEC9] p-8 shadow-sm">
        <div className="text-center">
          <span className="text-5xl">🛡️</span>
          <h2 className="mt-4 font-serif text-3xl font-extrabold tracking-tight text-[#800020]">
            Verify Account
          </h2>
          <p className="mt-2 text-sm text-[#605252]">
            We have sent a 6-digit verification code to <strong className="text-[#2C2121]">{email || 'your email'}</strong>
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="block text-xs font-semibold uppercase tracking-wider text-[#605252] mb-1 text-center">
              Verification Code (OTP)
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              pattern="\d*"
              maxLength="6"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="appearance-none relative block w-full px-3 py-4 border border-[#E5DEC9] bg-[#FCFBF7] text-[#2C2121] focus:outline-none focus:ring-1 focus:ring-[#800020] focus:border-[#800020] text-2xl font-bold tracking-[0.75em] text-center"
              placeholder="000000"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              style={{ color: '#ffffff' }}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase tracking-wider bg-[#800020] hover:bg-[#9E1B32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800020] transition-colors cursor-pointer !text-white"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm mt-4 text-[#605252] flex flex-col items-center gap-2">
          <span>Didn't receive the email?</span>
          <button
            onClick={handleResend}
            disabled={timer > 0}
            className={`font-semibold transition-colors uppercase tracking-wider text-xs ${
              timer > 0
                ? 'text-[#A09090] cursor-not-allowed flex items-center gap-1'
                : 'text-[#800020] hover:text-[#C5A059] cursor-pointer'
            }`}
          >
            {timer > 0 ? (
              <>
                <Timer className="w-3.5 h-3.5" />
                Resend Code in {timer}s
              </>
            ) : (
              'Resend Code Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
