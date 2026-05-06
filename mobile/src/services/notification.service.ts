import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('trip-tracker', {
        name: 'Fahrttracker',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async scheduleMotionDetected(): Promise<string> {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: 'Fahrt erkannt 🚗',
        body: 'Möchtest du die Fahrt dokumentieren?',
        data: { action: 'start_trip' },
        categoryIdentifier: 'trip_action',
      },
      trigger: null, // immediate
    });
  },

  async scheduleParkedDetected(): Promise<string> {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: 'Fahrzeug steht',
        body: 'Fahrt beenden oder weiterführen?',
        data: { action: 'stop_trip' },
        categoryIdentifier: 'trip_action',
      },
      trigger: null,
    });
  },

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  addNotificationListener(
    handler: (notification: Notifications.Notification) => void,
  ) {
    return Notifications.addNotificationReceivedListener(handler);
  },

  addResponseListener(
    handler: (response: Notifications.NotificationResponse) => void,
  ) {
    return Notifications.addNotificationResponseReceivedListener(handler);
  },
};
