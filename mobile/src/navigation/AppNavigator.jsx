import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import OTPVerifyScreen from '../screens/auth/OTPVerifyScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import SplashScreen from '../screens/auth/SplashScreen';

// Main
import TabNavigator from './TabNavigator';

// Detail screens
import ChatDetailScreen from '../screens/main/ChatDetailScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import ProfileDetailScreen from '../screens/main/ProfileDetailScreen';

// Subscription
import PaymentScreen from '../screens/subscription/PaymentScreen';
import PlansScreen from '../screens/subscription/PlansScreen';

// Verification
import CNICUploadScreen from '../screens/verification/CNICUploadScreen';
import LivePhotoScreen from '../screens/verification/LivePhotoScreen';

// Full Feature Screens
import BlockedUsersScreen from '../screens/main/BlockedUsersScreen';
import BoostProfileScreen from '../screens/main/BoostProfileScreen';
import HelpSupportScreen from '../screens/main/HelpSupportScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ReportUserScreen from '../screens/main/ReportUserScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated } = useSelector((s) => s.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Plans" component={PlansScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="Boost" component={BoostProfileScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Verification" component={CNICUploadScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="LivePhoto" component={LivePhotoScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Report" component={ReportUserScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
            <Stack.Screen name="Help" component={HelpSupportScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
