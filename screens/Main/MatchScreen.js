import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocation } from '../../context/LocationContext';
import { mockDb } from '../../services/firebase';
import { getRecommendedBuddies } from '../../utils/matchingAlgorithm';

export default function MatchScreen({ navigation }) {
  const { location, isLoading: isLocating, requestLocation } = useLocation();
  const [buddies, setBuddies] = useState([]);
  const [isMatching, setIsMatching] = useState(false);

  // Giả lập thông tin Sinh viên Hiện tại (đang đăng nhập)
  const currentUser = {
    uid: "current_user_1",
    name: "Lê Minh Triết",
    courses: ["CS101", "MATH201"],
    schedule: {
      "Monday": ["morning"],
      "Wednesday": ["afternoon"],
      "Friday": ["morning", "afternoon"]
    },
    location: location || { latitude: 21.0056, longitude: 105.8433 } // Tọa độ Bách Khoa Hà Nội mặc định
  };

  const handleStartMatching = async () => {
    setIsMatching(true);
    // Cập nhật vị trí GPS thực tế
    await requestLocation();
    
    // Giả lập quét Radar tìm bạn 1.5 giây để WOW người dùng
    setTimeout(async () => {
      const allUsers = await mockDb.getCollection('users');
      // Thêm vị trí mới nhất vào thông tin user hiện tại
      const updatedUser = {
        ...currentUser,
        location: location || currentUser.location
      };
      const results = getRecommendedBuddies(updatedUser, allUsers);
      setBuddies(results);
      setIsMatching(false);
    }, 1500);
  };

  useEffect(() => {
    // Chạy matching tự động khi có vị trí lần đầu
    handleStartMatching();
  }, [location]);

  const handleConnectBuddy = async (buddy) => {
    // Tạo nhóm chat với buddy này
    const chatName = `Study Group: ${currentUser.name} & ${buddy.name}`;
    const newGroup = await mockDb.addDocument('study_groups', {
      name: chatName,
      courseId: buddy.sharedCourses[0] || 'GENERAL',
      members: [currentUser.uid, buddy.uid],
      lastMessage: {
        text: `Các bạn đã được ghép nhóm học môn ${buddy.sharedCourses[0]}! 👋`,
        senderName: 'Hệ Thống',
        timestamp: Date.now()
      }
    });

    // Tạo tin nhắn chào mừng
    await mockDb.sendMessage(newGroup.groupId, 'system', 'Hệ Thống', `Chào mừng hai bạn đã được kết nối để cùng học tập môn ${buddy.sharedCourses[0]}!`);

    // Chuyển hướng sang màn hình Chat list hoặc phòng Chat Room trực tiếp
    navigation.navigate('ChatRoom', { groupId: newGroup.groupId, groupName: chatName });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tìm Bạn Đồng Hành 🤝</Text>
        <Text style={styles.subtitle}>Ghép nhóm học dựa trên môn học, lịch trống và khoảng cách GPS.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Nút kích hoạt Radar quét */}
        <TouchableOpacity 
          style={styles.radarButton} 
          onPress={handleStartMatching}
          disabled={isMatching}
        >
          <View style={styles.radarCircle}>
            {isMatching ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <Text style={styles.radarIcon}>📡</Text>
            )}
          </View>
          <Text style={styles.radarButtonText}>
            {isMatching ? 'Đang tìm kiếm bạn học trùng lịch...' : 'Bấm để quét vị trí & ghép cặp'}
          </Text>
        </TouchableOpacity>

        {/* Danh sách Buddies tìm được */}
        <Text style={styles.sectionTitle}>Gợi ý học tập phù hợp nhất</Text>

        {isMatching ? (
          <View style={styles.matchingPlaceholder}>
            <Text style={styles.placeholderText}>Đang quét trong bán kính 5km xung quanh bạn...</Text>
          </View>
        ) : buddies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa tìm thấy bạn học nào trùng môn CS101/MATH201 gần bạn. Hãy thử cập nhật lại vị trí!</Text>
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
                  <Text style={styles.matchPercent}>{buddy.matchScore}%</Text>
                  <Text style={styles.matchLabel}>Match</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                {/* Môn trùng */}
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

                {/* Khoảng cách */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoTitle}>📍 Cách bạn:</Text>
                  <Text style={styles.infoValue}>
                    {buddy.distance === 9999 ? 'Không xác định' : `${buddy.distance} km`}
                  </Text>
                </View>

                {/* Lịch trùng */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoTitle}>📅 Lịch trống trùng:</Text>
                  <View style={styles.scheduleList}>
                    {Object.keys(buddy.sharedSchedule).map(day => (
                      <Text key={day} style={styles.scheduleText}>
                        • {day}: {buddy.sharedSchedule[day].join(', ')}
                      </Text>
                    ))}
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
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 18,
  },
  scrollContainer: {
    padding: 20,
  },
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
  radarIcon: {
    fontSize: 32,
  },
  radarButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF9500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  matchingPlaceholder: {
    padding: 40,
    alignItems: 'center',
  },
  placeholderText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E5EA',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingStars: {
    fontSize: 13,
    color: '#FF9500',
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  matchBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  matchPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
  },
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    width: 120,
  },
  infoValue: {
    fontSize: 13,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  courseBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  courseText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scheduleList: {
    flex: 1,
  },
  scheduleText: {
    fontSize: 13,
    color: '#3A3A3C',
    lineHeight: 18,
  },
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
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
