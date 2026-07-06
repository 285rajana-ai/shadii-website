import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { API_BASE_URL } from './constants';

// Set notification handler to decide how to handle notifications when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('shadii_main', {
      name: 'Shadii Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5C0F31',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    if (__DEV__) console.warn('Failed to get push token for push notification.');
    return null;
  }

  try {
    // getDevicePushTokenAsync returns raw FCM token on Android
    token = (await Notifications.getDevicePushTokenAsync()).data;
  } catch (error) {
    console.error('Error fetching device push token:', error);
  }

  return token;
}

export async function registerPushTokenWithBackend(authToken) {
  try {
    const fcmToken = await registerForPushNotificationsAsync();
    if (!fcmToken) {
      if (__DEV__) console.warn('No FCM token obtained; skipping backend registration.');
      return;
    }

    const res = await fetch(`${API_BASE_URL}/auth/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcmToken }),
    });

    const data = await res.json();
    if (data.success) {
      if (__DEV__) console.log('FCM Token registered with backend successfully.');
    } else {
      console.error('Failed to register FCM token with backend:', data.message);
    }
  } catch (error) {
    console.error('Error registering push token with backend:', error);
  }
}
