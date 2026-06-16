import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE, readJsonResponse } from '../lib/api';

const AuthContext = createContext(null);
export { API_BASE };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('shadii_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('shadii_token', token);
      fetchMe();
    } else {
      localStorage.removeItem('shadii_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await readJsonResponse(res);
      if (data.success) {
        setUser(data.user);
      } else {
        // Token might have expired
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await readJsonResponse(res);
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (payloadOrName, email, password, gender, phone, age) => {
    const payload = typeof payloadOrName === 'object'
      ? payloadOrName
      : { name: payloadOrName, email, password, gender, phone, age };

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await readJsonResponse(res);
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const verifyOtp = async (userId, otp) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, otp })
    });
    const data = await readJsonResponse(res);
    if (data.success) {
      await fetchMe();
    }
    return data;
  };

  const resendOtp = async (email) => {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await readJsonResponse(res);
  };

  const forgotPassword = async (email) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await readJsonResponse(res);
  };

  const resetPassword = async (email, otp, newPassword) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    return await readJsonResponse(res);
  };

  const updateProfile = async (fields) => {
    if (!token) return { success: false, message: 'Not logged in' };
    const res = await fetch(`${API_BASE}/profile/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(fields)
    });
    const data = await readJsonResponse(res);
    if (data.success) {
      // Re-fetch profile to keep local context synced
      await fetchMe();
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('shadii_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      verifyOtp,
      resendOtp,
      forgotPassword,
      resetPassword,
      updateProfile,
      logout,
      refreshUser: fetchMe
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
