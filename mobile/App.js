import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { Platform, StatusBar, UIManager } from 'react-native';
import 'react-native-gesture-handler';
import { Provider, useDispatch } from 'react-redux';
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
        const token = await SecureStore.getItemAsync('auth_token');
        const userRaw = await SecureStore.getItemAsync('auth_user');
        if (token && userRaw) {
          dispatch(restoreSession({ token, user: JSON.parse(userRaw) }));
        }
      } catch {
        // Silent fail — user will see login screen
      }
    };
    restore();
  }, []);

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
      <Provider store={store}>
        <AppRoot />
      </Provider>
    </ErrorBoundary>
  );
}
