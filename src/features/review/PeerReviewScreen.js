import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { mockDb } from '../../data/repositories/firebaseRepository';
import { useAuth } from '../auth/AuthContext';

export default function PeerReviewScreen({ route, navigation }) {
  const { groupId } = route.params;
  const [buddies, setBuddies] = useState([]);
  const [selectedBuddyId, setSelectedBuddyId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const { user } = useAuth();
  const currentUserId = user?.uid || 'anonymous';

  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (!user) return;
      const allGroups = await mockDb.getCollection('groups');
      const currentGroup = allGroups.find(g => g.groupId === groupId);
      if (currentGroup) {
        const allUsers = await mockDb.getCollection('users');
        const otherMembers = allUsers.filter(u => 
          currentGroup.members.includes(u.uid) && u.uid !== currentUserId
        );
        setBuddies(otherMembers);
        if (otherMembers.length > 0) {
          setSelectedBuddyId(otherMembers[0].uid);
        }
      }
    };

    fetchGroupMembers();
  }, [groupId, user]);

  const handleSubmitReview = async () => {
    if (!selectedBuddyId) {
      Alert.alert('Lỗi', 'Không tìm thấy bạn học để đánh giá!');
      return;
    }

    if (comment.trim() === '') {
      Alert.alert('Lỗi', 'Vui lòng để lại nhận xét học tập!');
      return;
    }

    const reviewData = {
      reviewerId: currentUserId,
      revieweeId: selectedBuddyId,
      groupId,
      rating,
      comment,
      timestamp: Date.now()
    };

    // 1. Lưu đánh giá mới vào Firestore
    await mockDb.addDocument('reviews', reviewData);

    // 2. Cập nhật chỉ số đánh giá trung bình (rating) của sinh viên được đánh giá
    const allUsers = await mockDb.getCollection('users');
    const targetUser = allUsers.find(u => u.uid === selectedBuddyId);
    if (targetUser) {
      const oldCount = targetUser.ratingCount || 0;
      const oldRating = targetUser.rating || 0;
      
      const newCount = oldCount + 1;
      // Công thức tính trung bình mới
      const newRating = parseFloat(((oldRating * oldCount + rating) / newCount).toFixed(1));

      await mockDb.updateDocument('users', selectedBuddyId, {
        rating: newRating,
        ratingCount: newCount
      });
    }

    // Gửi tin nhắn thông báo vào phòng chat
    const alertMsg = `🌟 ĐÁNH GIÁ ĐỒNG ĐỘI MỚI:
Một thành viên đã gửi đánh giá học tập tích cực trong học kỳ này!`;
    await mockDb.sendMessage(groupId, 'system', 'Hệ Thống', alertMsg);

    Alert.alert(
      'Cảm ơn bạn',
      'Đánh giá đồng đội của bạn đã được gửi thành công!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Đánh Giá Bạn Học 🌟</Text>
        <Text style={styles.subtitle}>
          Để lại nhận xét trung thực để tích lũy điểm uy tín học tập cho bạn học sau kỳ thi.
        </Text>

        {buddies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nhóm này chưa có thành viên khác để đánh giá.</Text>
          </View>
        ) : (
          <View style={styles.form}>
            {/* Chọn bạn học */}
            <Text style={styles.label}>Chọn bạn học để đánh giá:</Text>
            <View style={styles.buddyList}>
              {buddies.map(buddy => (
                <TouchableOpacity
                  key={buddy.uid}
                  style={[
                    styles.buddySelectCard,
                    selectedBuddyId === buddy.uid && styles.buddySelectCardActive
                  ]}
                  onPress={() => setSelectedBuddyId(buddy.uid)}
                >
                  <Text style={[
                    styles.buddySelectText,
                    selectedBuddyId === buddy.uid && styles.buddySelectTextActive
                  ]}>
                    {buddy.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Đánh giá sao */}
            <Text style={styles.label}>Mức độ đóng góp và hỗ trợ học tập:</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity 
                  key={star} 
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Text style={[styles.starText, rating >= star ? styles.starFilled : styles.starEmpty]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingDescription}>
              {rating === 5 ? 'Tuyệt vời: Nhiệt tình, đóng góp nhiều, đúng giờ!' :
               rating === 4 ? 'Khá tốt: Hợp tác tốt, có trách nhiệm.' :
               rating === 3 ? 'Bình thường: Có tham gia nhưng chưa tích cực.' :
               rating === 2 ? 'Kém: Thường xuyên trễ hẹn hoặc không làm bài.' :
               'Rất kém: Không tham gia học, làm ảnh hưởng nhóm.'}
            </Text>

            {/* Nhận xét */}
            <Text style={styles.label}>Để lại nhận xét chi tiết *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Bạn học này đã hỗ trợ bạn như thế nào? Thái độ học tập ra sao?..."
              placeholderTextColor="#8E8E93"
              value={comment}
              onChangeText={setComment}
              multiline={true}
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
              <Text style={styles.submitButtonText}>Gửi Đánh Giá Đồng Đội 🚀</Text>
            </TouchableOpacity>
          </View>
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
  emptyContainer: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 10,
    marginTop: 10,
  },
  buddyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  buddySelectCard: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  buddySelectCardActive: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  buddySelectText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  buddySelectTextActive: {
    color: '#FFFFFF',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  starButton: {
    paddingHorizontal: 6,
  },
  starText: {
    fontSize: 36,
  },
  starFilled: {
    color: '#FF9500',
  },
  starEmpty: {
    color: '#E5E5EA',
  },
  ratingDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1C1C1E',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  submitButton: {
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
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
