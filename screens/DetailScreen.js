import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';

export default function DetailScreen({ route, navigation }) {
  const { itemId, title } = route.params || { itemId: 1, title: 'Bài học mặc định' };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.idText}>Bài học #{itemId}</Text>
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.contentCard}>
          <Text style={styles.contentText}>
            Chào mừng bạn đến với chương trình học tập của StudyBuddy! Đây là giao diện chi tiết của bài học. Tại đây, bạn sẽ học và làm các bài tập trắc nghiệm ngắn để củng cố kiến thức của mình.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại Trang chủ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    flex: 1,
  },
  idText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9500',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contentText: {
    fontSize: 16,
    color: '#3A3A3C',
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
