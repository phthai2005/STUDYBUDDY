import { calculateDistance } from '../core/locationService';

/**
 * Thuật toán ghép cặp bạn học thông minh
 * @param {Object} currentUser Người dùng hiện tại
 * @param {Array} otherUsers Danh sách sinh viên khác trong hệ thống
 * @returns {Array} Danh sách đã sắp xếp kèm điểm tương thích và thông tin chi tiết
 */
export function getRecommendedBuddies(currentUser, otherUsers) {
  if (!currentUser) return [];

  const currentUserCourses = currentUser.courses || [];
  const currentUserSchedule = currentUser.schedule || {};
  const currentUserLocation = currentUser.location || {};

  const matches = otherUsers
    .filter(user => user.uid !== currentUser.uid) // Loại trừ chính mình
    .map(user => {
      // 1. Tính toán môn học trùng nhau
      const otherCourses = user.courses || [];
      const sharedCourses = currentUserCourses.filter(course => otherCourses.includes(course));

      // Nếu không có môn học nào trùng nhau, độ tương thích sẽ rất thấp
      if (sharedCourses.length === 0) return null;

      // 2. Tính toán lịch rảnh trùng khớp (lượng khung giờ trùng)
      let sharedSlotsCount = 0;
      const sharedSchedule = {};
      
      const otherSchedule = user.schedule || {};
      Object.keys(currentUserSchedule).forEach(day => {
        if (otherSchedule[day]) {
          const userSlots = currentUserSchedule[day] || [];
          const otherSlots = otherSchedule[day] || [];
          const common = userSlots.filter(slot => otherSlots.includes(slot));
          if (common.length > 0) {
            sharedSchedule[day] = common;
            sharedSlotsCount += common.length;
          }
        }
      });

      // 3. Tính khoảng cách địa lý (Km)
      const userLoc = user.location || {};
      let distance = 9999;
      if (currentUserLocation.latitude && currentUserLocation.longitude && userLoc.latitude && userLoc.longitude) {
        distance = calculateDistance(
          currentUserLocation.latitude,
          currentUserLocation.longitude,
          userLoc.latitude,
          userLoc.longitude
        );
      }

      // 4. Tính điểm Match Score (Càng cao càng tốt)
      // Hệ số trọng lượng (Weights)
      const W_COURSE = 40;     // Tầm quan trọng của trùng môn học (Rất cao)
      const W_SCHEDULE = 15;   // Tầm quan trọng của trùng lịch
      const W_DISTANCE = 5;    // Tầm quan trọng của khoảng cách gần

      // Điểm cộng từ các yếu tố
      const courseScore = sharedCourses.length * W_COURSE;
      const scheduleScore = sharedSlotsCount * W_SCHEDULE;
      
      // Điểm trừ khoảng cách (nếu xa quá sẽ bị trừ điểm, trong phạm vi 10km)
      let distanceScore = 0;
      if (distance <= 10) {
        // Càng gần (0km) càng được cộng nhiều điểm (tối đa 30 điểm), xa 10km được 0 điểm
        distanceScore = (10 - distance) * W_DISTANCE;
      }

      const totalScore = Math.round(courseScore + scheduleScore + distanceScore);

      return {
        ...user,
        sharedCourses,
        sharedSchedule,
        distance,
        matchScore: totalScore
      };
    })
    .filter(item => item !== null) // Loại bỏ các học sinh không trùng môn nào
    .sort((a, b) => b.matchScore - a.matchScore); // Sắp xếp theo điểm match giảm dần

  return matches;
}
