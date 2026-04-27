import { createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      // Persist user data
      if (action.payload) {
        SecureStore.setItemAsync('auth_user', JSON.stringify(action.payload)).catch(() => { });
      }
    },
    setToken: (state, action) => {
      state.token = action.payload;
      // Persist token to secure storage
      if (action.payload) {
        SecureStore.setItemAsync('auth_token', action.payload).catch(() => { });
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      SecureStore.deleteItemAsync('auth_token').catch(() => { });
      SecureStore.deleteItemAsync('auth_user').catch(() => { });
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // Called on app start to restore session
    restoreSession: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = !!(token && user);
    },
  },
});

export const { setUser, setToken, updateUser, logout, setLoading, restoreSession } = authSlice.actions;
export default authSlice.reducer;
