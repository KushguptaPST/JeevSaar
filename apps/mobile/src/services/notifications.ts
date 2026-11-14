import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { Platform } from 'react-native';

const CHANNEL_ID = 'appointment_reminders';

export async function initNotifications(): Promise<boolean> {
  try {
    // 1. Android 13+ Notification Permission Flow
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
      console.log('[Notifee] Notification permission not granted');
      return false;
    }

    // 2. Create high-importance notification channel for Android
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Appointment Reminders & Health Alerts',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });
    }

    return true;
  } catch (err) {
    console.warn('[Notifee] Initialization notice:', err);
    return false;
  }
}

export async function scheduleAppointmentReminder(
  bookingRef: string,
  hospitalName: string,
  departmentName: string,
  dateStr: string, // YYYY-MM-DD
  timeSlot: string // HH:mm
) {
  try {
    await initNotifications();

    // Schedule notification for 19:00 on the evening before
    const aptDate = new Date(`${dateStr}T${timeSlot}:00`);
    const reminderDate = new Date(aptDate.getTime() - 24 * 60 * 60 * 1000);
    reminderDate.setHours(19, 0, 0, 0);

    const triggerTimestamp =
      reminderDate.getTime() > Date.now()
        ? reminderDate.getTime()
        : Date.now() + 5 * 1000; // Trigger in 5s if in past for immediate verification

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerTimestamp,
    };

    await notifee.createTriggerNotification(
      {
        id: `reminder_${bookingRef}`,
        title: `Appointment Reminder: ${hospitalName}`,
        body: `Your appointment in ${departmentName} is scheduled tomorrow at ${timeSlot}. Please carry your photo ID & documents.`,
        android: {
          channelId: CHANNEL_ID,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger
    );

    return true;
  } catch (err) {
    console.warn('[Notifee] schedule reminder error:', err);
    return false;
  }
}

export async function showInstantNotification(title: string, body: string) {
  try {
    await initNotifications();
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_launcher',
      },
    });
  } catch (e) {
    // non-fatal
  }
}

