import * as Location from 'expo-location';

/**
 * Xin quyền và lấy tọa độ GPS hiện tại của thiết bị
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export async function getCurrentLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Quyền truy cập vị trí bị từ chối');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Lỗi khi lấy vị trí GPS:', error);
    return null;
  }
}

/**
 * Tính khoảng cách địa lý giữa 2 điểm sử dụng công thức Haversine
 * @param {number} lat1 Vĩ độ điểm 1
 * @param {number} lon1 Kinh độ điểm 1
 * @param {number} lat2 Vĩ độ điểm 2
 * @param {number} lon2 Kinh độ điểm 2
 * @returns {number} Khoảng cách tính bằng Km
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999; // Giá trị lớn đại diện cho lỗi hoặc không có vị trí

  const R = 6371; // Bán kính Trái Đất tính bằng Km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Khoảng cách bằng Km
  
  return parseFloat(distance.toFixed(2)); // Tròn 2 chữ số thập phân
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
