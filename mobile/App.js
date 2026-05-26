import * as SecureStore from 'expo-secure-store';
import React, { useEffect } from 'react';
import { Platform, StatusBar, Text, UIManager, View } from 'react-native';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { registerPushTokenWithBackend } from './src/utils/notifications';
import AppNavigator from './src/navigation/AppNavigator';
import store from './src/store';
import { restoreSession } from './src/store/slices/authSlice';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: '#0D0D0D', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: '#D4AF37', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Crash Report</Text>
          <Text style={{ color: '#fff', fontSize: 13 }}>{this.state.error?.message}</Text>
          <Text style={{ color: '#A0A0A0', fontSize: 11, marginTop: 8 }}>{this.state.error?.stack?.slice(0, 500)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppRoot() {
  const dispatch = useDispatch();

  useEffect(() => {
    const restore = async () => {
      try {
        const [token, refreshToken, userRaw] = await Promise.all([
          SecureStore.getItemAsync('auth_token'),
          SecureStore.getItemAsync('auth_refresh_token'),
          SecureStore.getItemAsync('auth_user'),
        ]);

        if (!userRaw) return; // No persisted session

        const user = JSON.parse(userRaw);

        if (token) {
          // Check if access token is still valid (not expired)
          try {
            const { API_BASE_URL } = require('./src/utils/constants');
            // Ping /me with current token
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              dispatch(restoreSession({ token, refreshToken, user }));
              return;
            }
          } catch { /* network error — restore anyway */ }
        }

        // Access token expired or failed — try to refresh
        if (refreshToken) {
          try {
            const { API_BASE_URL } = require('./src/utils/constants');
            const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
            const data = await res.json();
            if (data.success && data.token) {
              dispatch(restoreSession({ token: data.token, refreshToken: data.refreshToken, user }));
              return;
            }
          } catch { /* silent fail */ }
        }

        // Both tokens invalid — don't restore (user sees login)
      } catch {
        // Silent fail — user will see login screen
      }
    };
    restore();
  }, []);

  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      registerPushTokenWithBackend(auth.token);
    }
  }, [auth.isAuthenticated, auth.token]);


  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Provider store={store}>
          <AppRoot />
        </Provider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
