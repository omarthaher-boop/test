import * as Notifications from 'expo-notifications';

// Used from background task — no React imports allowed
export async function scheduleParkedNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Fahrzeug steht 🅿️',
      body: 'Fahrt beenden oder weiterführen?',
      data: { action: 'stop_trip' },
    },
    trigger: null,
  });
}

export async function scheduleMotionNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Fahrt erkannt 🚗',
      body: 'Möchtest du die Fahrt dokumentieren?',
      data: { action: 'start_trip' },
    },
    trigger: null,
  });
}
