import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Cấu hình cách thông báo hiển thị khi ứng dụng đang mở (Foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Expo Go không hỗ trợ push token từ server (SDK 53+) */
export function isExpoGo() {
  return Constants.appOwnership === 'expo';
}

function getExpoProjectId() {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? null;
}

/** Push từ server chỉ dùng khi có development build + projectId */
export function canRegisterRemotePush() {
  if (Platform.OS === 'web') return false;
  if (isExpoGo()) return false;
  return Boolean(getExpoProjectId());
}

/**
 * Đăng ký nhận thông báo đẩy Push Notification và lấy Token gửi về máy chủ FCM
 * @returns {Promise<string | null>} Token thiết bị (FCM Token) hoặc null nếu bị từ chối
 */
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    return null;
  }

  if (!canRegisterRemotePush()) {
    if (__DEV__) {
      const reason = isExpoGo()
        ? 'Expo Go không hỗ trợ push từ server — dùng development build khi cần.'
        : 'Chưa cấu hình extra.eas.projectId trong app.json.';
      console.log(`[notifications] Bỏ qua đăng ký push token: ${reason}`);
    }
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      if (__DEV__) {
        console.log('[notifications] Quyền thông báo bị từ chối.');
      }
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: getExpoProjectId(),
    });
    const token = tokenData.data;
    if (__DEV__) {
      console.log('[notifications] Đăng ký push token thành công.');
    }
    return token;
  } catch (error) {
    if (__DEV__) {
      console.log('[notifications] Không lấy được push token:', error?.message ?? error);
    }
    return null;
  }
}

/**
 * Gửi thông báo cục bộ (Local Notification) kiểm thử
 */
export async function sendLocalNotification(title, body) {
  if (Platform.OS === 'web') return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: true,
    },
    trigger: null,
  });
}

export async function scheduleNotificationForMeeting(title, body, date) {
  if (Platform.OS === 'web') return null;

  try {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return null;
    }

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: date,
    });
  } catch (error) {
    if (__DEV__) {
      console.log('[notifications] Không lên lịch thông báo họp:', error?.message ?? error);
    }
    return null;
  }
}
