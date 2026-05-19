import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Cấu hình cách thông báo hiển thị khi ứng dụng đang mở (Foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Đăng ký nhận thông báo đẩy Push Notification và lấy Token gửi về máy chủ FCM
 * @returns {Promise<string | null>} Token thiết bị (FCM Token) hoặc null nếu bị từ chối
 */
export async function registerForPushNotificationsAsync() {
  let token = null;

  if (Platform.OS === 'web') {
    console.log('Thông báo đẩy không được hỗ trợ trực tiếp trên nền tảng Web ở chế độ demo.');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Nếu chưa được cấp quyền, tiến hành xin quyền từ người dùng
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Quyền nhận thông báo đẩy bị từ chối!');
      return null;
    }

    // Lấy Token định danh thiết bị
    const tokenData = await Notifications.getExpoPushTokenAsync();
    token = tokenData.data;
    console.log('🔔 Đăng ký thành công Push Notification Token:', token);

    // Thiết lập kênh thông báo riêng cho thiết bị Android (Yêu cầu từ Android 8.0 trở lên)
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9500',
      });
    }
  } catch (error) {
    console.error('Lỗi khi cấu hình Push Notifications:', error);
  }

  return token;
}

/**
 * Gửi thông báo cục bộ (Local Notification) kiểm thử
 * @param {string} title Tiêu đề thông báo
 * @param {string} body Nội dung thông báo
 */
export async function sendLocalNotification(title, body) {
  if (Platform.OS === 'web') return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: true,
    },
    trigger: null, // Gửi ngay lập tức
  });
}
