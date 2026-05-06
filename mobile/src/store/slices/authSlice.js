import { createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(action.payload)).catch(() => {});
      }
    },

    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, action.payload).catch(() => {});
      }
    },

    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
      if (action.payload) {
        SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, action.payload).catch(() => {});
      }
    },

    // Set both access + refresh tokens at once (used after login/register)
    setTokens: (state, action) => {
      const { token, refreshToken } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken ?? state.refreshToken;
      if (token) SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token).catch(() => {});
      if (refreshToken) SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken).catch(() => {});
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (state.user) {
        SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(state.user)).catch(() => {});
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN).catch(() => {});
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN).catch(() => {});
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER).catch(() => {});
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Called on app start to restore persisted session
    restoreSession: (state, action) => {
      const { token, refreshToken, user } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken ?? null;
      state.user = user;
      state.isAuthenticated = !!(token && user);
    },
  },
});

export const {
  setUser,
  setToken,
  setRefreshToken,
  setTokens,
  updateUser,
  logout,
  setLoading,
  restoreSession,
} = authSlice.actions;

export default authSlice.reducer;

// ─── Storage Keys export (for use in App.jsx bootstrapping) ──────────────────
export { STORAGE_KEYS };
