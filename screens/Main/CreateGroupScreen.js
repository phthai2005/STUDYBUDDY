import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { mockDb } from '../../services/firebase';

export default function CreateGroupScreen({ navigation }) {
  const [groupName, setGroupName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('GENERAL');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Giả lập thông tin người dùng hiện tại
  const currentUser = {
    uid: "current_user_1",
    name: "Lê Minh Triết"
  };

  const coursesList = [
    { code: 'GENERAL', name: 'Học tập Chung' },
    { code: 'CS101', name: 'Nhập môn Lập trình' },
    { code: 'MATH201', name: 'Giải tích 2' },
    { code: 'PHY102', name: 'Vật lý Đại cương' }
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      // Lấy danh sách các sinh viên khác để thêm vào nhóm học tập
      const allUsers = await mockDb.getCollection('users');
      const otherStudents = allUsers.filter(u => u.uid !== currentUser.uid);
      setAvailableUsers(otherStudents);
    };

    fetchStudents();
  }, []);

  const toggleSelectMember = (userId) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter(id => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên nhóm học tập!');
      return;
    }

    setIsLoading(true);

    try {
      // Thành viên mặc định gồm người tạo (currentUser) và các thành viên được chọn
      const members = [currentUser.uid, ...selectedMemberIds];

      const groupData = {
        name: groupName.trim(),
        courseId: selectedCourse,
        members: members,
        lastMessage: {
          text: `Nhóm học tập "${groupName.trim()}" đã được khởi tạo thành công! 🎉`,
          senderName: 'Hệ Thống',
          timestamp: Date.now()
        }
      };

      // Lưu nhóm vào database
      const newGroup = await mockDb.addDocument('study_groups', groupData);

      // Gửi tin nhắn chào mừng từ hệ thống
      await mockDb.sendMessage(
        newGroup.groupId, 
        'system', 
        'Hệ Thống', 
        `Chào mừng các bạn đã tham gia nhóm học tập môn ${selectedCourse}! Hãy cùng nhau chia sẻ tài liệu và lên lịch họp ôn tập nhé.`
      );

      Alert.alert('Thành công', 'Đã khởi tạo nhóm học mới thành công!', [
        { 
          text: 'OK', 
          onPress: () => {
            navigation.goBack();
            navigation.navigate('ChatRoom', { groupId: newGroup.groupId, groupName: newGroup.name });
          } 
        }
      ]);
    } catch (error) {
      console.error('Lỗi khi tạo nhóm:', error);
      Alert.alert('Lỗi', 'Không thể tạo nhóm học tập. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tạo Nhóm Học Mới 👥</Text>
        <Text style={styles.subtitle}>Tạo không gian học tập chung để thảo luận, chia sẻ tài liệu và lên lịch ôn thi.</Text>

        {/* Tên nhóm */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên nhóm học tập *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Nhóm ôn tập Giải Tích kì 2026.1"
            placeholderTextColor="#8E8E93"
            value={groupName}
            onChangeText={setGroupName}
          />
        </View>

        {/* Môn học liên kết */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Lựa chọn Môn học chính *</Text>
          <View style={styles.courseBadgeContainer}>
            {coursesList.map((course) => (
              <TouchableOpacity
                key={course.code}
                style={[
                  styles.courseBadge,
                  selectedCourse === course.code && styles.courseBadgeActive
                ]}
                onPress={() => setSelectedCourse(course.code)}
              >
                <Text style={[
                  styles.courseBadgeText,
                  selectedCourse === course.code && styles.courseBadgeTextActive
                ]}>
                  {course.name} ({course.code})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Thêm thành viên */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Mời bạn học cùng tham gia (Tùy chọn)</Text>
          <Text style={styles.description}>Mời các StudyBuddy đang có nhu cầu học cùng môn:</Text>
          
          <View style={styles.memberList}>
            {availableUsers.map((user) => {
              const isSelected = selectedMemberIds.includes(user.uid);
              return (
                <TouchableOpacity
                  key={user.uid}
                  style={[
                    styles.memberCard,
                    isSelected && styles.memberCardActive
                  ]}
                  onPress={() => toggleSelectMember(user.uid)}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.avatarText}>{user.name[0]}</Text>
                  </View>
                  <View style={styles.memberMeta}>
                    <Text style={[styles.memberName, isSelected && styles.memberNameActive]}>{user.name}</Text>
                    <Text style={styles.memberSub}>Đánh giá: ⭐️ {user.rating}</Text>
                  </View>
                  <View style={[styles.checkboxCircle, isSelected && styles.checkboxCircleActive]}>
                    {isSelected && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleCreateGroup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Khởi Tạo Nhóm Ngay 🚀</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  description: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    color: '#1C1C1E',
  },
  courseBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  courseBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  courseBadgeActive: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  courseBadgeText: {
    fontSize: 13,
    color: '#3A3A3C',
    fontWeight: '500',
  },
  courseBadgeTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  memberList: {
    marginTop: 6,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  memberCardActive: {
    borderColor: '#FF9500',
    backgroundColor: 'rgba(255, 149, 0, 0.03)',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
  memberMeta: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  memberNameActive: {
    color: '#FF9500',
  },
  memberSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCircleActive: {
    borderColor: '#FF9500',
    backgroundColor: '#FF9500',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
