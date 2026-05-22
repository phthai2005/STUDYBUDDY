import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity,
  ScrollView, SafeAreaView, ActivityIndicator
} from 'react-native';
import { useLocation } from '../../core/LocationContext';
import { mockDb } from '../../data/repositories/firebaseRepository';
import { useAuth } from '../auth/AuthContext';
import { getRecommendedBuddies } from '../../utils/matchingAlgorithm';

export default function MatchScreen({ navigation }) {
  const { user } = useAuth();
  const { location, isLoading: isLocating, requestLocation, errorMsg } = useLocation();
  const [buddies, setBuddies] = useState([]);
  const [isMatching, setIsMatching] = useState(false);

  // Dùng ref để luôn đọc được location mới nhất bên trong setTimeout/async
  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // Ref để tránh chạy matching tự động nhiều lần
  const hasAutoMatched = useRef(false);

  // ── Build currentUser từ state hiện tại ──────────────────────────────────
  const buildCurrentUser = useCallback((latestLocation) => ({
    uid: user?.uid || 'anonymous',
    name: user?.name || 'Study Buddy',
    email: user?.email || '',
    courses: user?.courses || ['CS101', 'MATH201'],
    schedule: user?.schedule || {
      Monday: [], Tuesday: [], Wednesday: [],
      Thursday: [], Friday: [], Saturday: [], Sunday: []
    },
    // Ưu tiên: vị trí vừa lấy → vị trí trong context → vị trí lưu trong profile → fallback
    location: latestLocation || locationRef.current || user?.location || null
  }), [user]);

  // ── Hàm matching chính ───────────────────────────────────────────────────
  const handleStartMatching = useCallback(async () => {
    if (isMatching) return;
    setIsMatching(true);

    try {
      // requestLocation() giờ trả về location trực tiếp — không cần đợi state update
      const freshLocation = await requestLocation();
      locationRef.current = freshLocation || locationRef.current;

      const currentUser = buildCurrentUser(freshLocation);

      // Giả lập hiệu ứng radar 1.4 giây
      await new Promise(resolve => setTimeout(resolve, 1400));

      const allUsers = await mockDb.getCollection('users');
      const results = getRecommendedBuddies(currentUser, allUsers);
      setBuddies(results);
    } catch (err) {
      console.error('Lỗi khi matching:', err);
    } finally {
      setIsMatching(false);
    }
  }, [isMatching, requestLocation, buildCurrentUser]);

  // ── Chạy matching tự động một lần duy nhất khi màn hình mount ────────────
  useEffect(() => {
    if (!hasAutoMatched.current) {
      hasAutoMatched.current = true;
      handleStartMatching();
    }
    // Không đưa handleStartMatching vào deps để tránh vòng lặp
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Kết nối với buddy ────────────────────────────────────────────────────
  const handleConnectBuddy = async (buddy) => {
    const currentUser = buildCurrentUser(locationRef.current);
    const chatName = `Study Group: ${currentUser.name} & ${buddy.name}`;
    const newGroup = await mockDb.addDocument('groups', {
      name: chatName,
      courseId: buddy.sharedCourses[0] || 'GENERAL',
      members: [currentUser.uid, buddy.uid],
      lastMessage: {
        text: `Các bạn đã được ghép nhóm học môn ${buddy.sharedCourses[0]}! 👋`,
        senderName: 'Hệ Thống',
        timestamp: Date.now()
      }
    });

    await mockDb.sendMessage(
      newGroup.groupId, 'system', 'Hệ Thống',
      `Chào mừng hai bạn đã được kết nối để cùng học tập môn ${buddy.sharedCourses[0]}!`
    );

    navigation.navigate('ChatRoom', { groupId: newGroup.groupId, groupName: chatName });
  };

  // ── Trạng thái vị trí hiển thị ───────────────────────────────────────────
  const locationStatus = isLocating
    ? '📡 Đang định vị GPS...'
    : location
      ? `📍 ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
      : errorMsg
        ? `⚠️ ${errorMsg}`
        : '📍 Chưa có vị trí';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tìm Bạn Đồng Hành 🤝</Text>
        <Text style={styles.subtitle}>Ghép nhóm học dựa trên môn học, lịch trống và khoảng cách GPS.</Text>
        {/* Hiển thị trạng thái GPS */}
        <Text style={[styles.locationStatus, !location && !isLocating && styles.locationStatusWarn]}>
          {locationStatus}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Nút Radar */}
        <TouchableOpacity
          style={[styles.radarButton, isMatching && styles.radarButtonDisabled]}
          onPress={handleStartMatching}
          disabled={isMatching}
          activeOpacity={0.8}
        >
          <View style={styles.radarCircle}>
            {isMatching ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <Text style={styles.radarIcon}>📡</Text>
            )}
          </View>
          <Text style={styles.radarButtonText}>
            {isMatching ? 'Đang quét trong bán kính 5km...' : 'Bấm để quét vị trí & ghép cặp'}
          </Text>
          {!isMatching && (
            <Text style={styles.radarHint}>
              {location ? 'Vị trí GPS đã sẵn sàng' : 'Sẽ xin quyền GPS khi bấm'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Gợi ý học tập phù hợp nhất</Text>

        {isMatching ? (
          <View style={styles.matchingPlaceholder}>
            <ActivityIndicator size="small" color="#FF9500" style={{ marginBottom: 12 }} />
            <Text style={styles.placeholderText}>Đang quét trong bán kính 5km xung quanh bạn...</Text>
          </View>
        ) : buddies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Chưa tìm thấy bạn học</Text>
            <Text style={styles.emptyText}>
              Không có ai trùng môn học gần bạn. Hãy thử bấm quét lại hoặc cập nhật danh sách môn học trong hồ sơ.
            </Text>
          </View>
        ) : (
          buddies.map((buddy) => (
            <View key={buddy.uid} style={styles.card}>
              <View style={styles.cardHeader}>
                <Image source={{ uri: buddy.avatar }} style={styles.avatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{buddy.name}</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingStars}>⭐️ {buddy.rating}</Text>
                    <Text style={styles.ratingCount}>({buddy.ratingCount} đánh giá)</Text>
                  </View>
                </View>
                <View style={styles.matchBadge}>
                  {/* Fix bug 4: hiển thị điểm thô, bỏ nhãn "%" sai nghĩa */}
                  <Text style={styles.matchScore}>{buddy.matchScore}</Text>
                  <Text style={styles.matchLabel}>điểm</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoTitle}>📚 Môn trùng:</Text>
                  <View style={styles.badgeContainer}>
                    {buddy.sharedCourses.map(course => (
                      <View key={course} style={styles.courseBadge}>
                        <Text style={styles.courseText}>{course}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoTitle}>📍 Cách bạn:</Text>
                  <Text style={styles.infoValue}>
                    {buddy.distance === 9999
                      ? 'Không xác định (chưa có GPS)'
                      : `${buddy.distance} km`}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoTitle}>📅 Lịch trùng:</Text>
                  <View style={styles.scheduleList}>
                    {Object.keys(buddy.sharedSchedule).length === 0 ? (
                      <Text style={styles.scheduleEmpty}>Chưa có lịch trùng</Text>
                    ) : (
                      Object.keys(buddy.sharedSchedule).map(day => (
                        <Text key={day} style={styles.scheduleText}>
                          • {day}: {buddy.sharedSchedule[day].join(', ')}
                        </Text>
                      ))
                    )}
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.connectButton}
                onPress={() => handleConnectBuddy(buddy)}
              >
                <Text style={styles.connectButtonText}>Bắt đầu học nhóm 💬</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E' },
  subtitle: { fontSize: 13, color: '#8E8E93', marginTop: 4, lineHeight: 18 },
  locationStatus: {
    fontSize: 12,
    color: '#34C759',
    marginTop: 6,
    fontWeight: '500',
  },
  locationStatusWarn: { color: '#FF9500' },

  scrollContainer: { padding: 20 },

  radarButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  radarButtonDisabled: { opacity: 0.7 },
  radarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  radarIcon: { fontSize: 32 },
  radarButtonText: { fontSize: 15, fontWeight: '600', color: '#FF9500' },
  radarHint: { fontSize: 12, color: '#8E8E93', marginTop: 4 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 16 },

  matchingPlaceholder: { padding: 40, alignItems: 'center' },
  placeholderText: { color: '#8E8E93', fontSize: 14, textAlign: 'center' },

  emptyContainer: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E5E5EA' },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#1C1C1E' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingStars: { fontSize: 13, color: '#FF9500', fontWeight: '600' },
  ratingCount: { fontSize: 12, color: '#8E8E93', marginLeft: 4 },

  matchBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  matchScore: { fontSize: 18, fontWeight: 'bold', color: '#FF9500' },
  matchLabel: {
    fontSize: 9,
    color: '#FF9500',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginTop: 2,
  },

  cardBody: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F2F2F7',
    paddingVertical: 14,
    marginBottom: 16,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  infoTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', width: 120 },
  infoValue: { fontSize: 13, color: '#1C1C1E', fontWeight: '500' },

  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  courseBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  courseText: { fontSize: 11, fontWeight: 'bold', color: '#FFFFFF' },

  scheduleList: { flex: 1 },
  scheduleText: { fontSize: 13, color: '#3A3A3C', lineHeight: 18 },
  scheduleEmpty: { fontSize: 13, color: '#C7C7CC', fontStyle: 'italic' },

  connectButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  connectButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
