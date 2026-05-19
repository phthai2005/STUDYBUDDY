import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { mockDb } from '../../services/firebase';

export default function FileShareScreen({ route }) {
  const { groupId, groupName } = route.params;
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Thu thập toàn bộ các file được chia sẻ từ tin nhắn nhóm
    const unsubscribe = mockDb.subscribeToChat(groupId, (messages) => {
      const sharedFiles = messages
        .filter(m => m.fileUrl !== null)
        .map(m => ({
          id: m.messageId,
          name: m.fileType === 'image' ? 'Hình ảnh ôn tập' : 'Đề cương tài liệu.pdf',
          type: m.fileType,
          url: m.fileUrl,
          senderName: m.senderName,
          timestamp: m.timestamp
        }));
      setFiles(sharedFiles);
    });

    return unsubscribe;
  }, [groupId]);

  const handleDownloadFile = (file) => {
    Alert.alert(
      'Tải tài liệu',
      `Bạn có muốn tải xuống tập tin "${file.name}" được chia sẻ bởi ${file.senderName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Tải xuống', onPress: () => Alert.alert('Thành công', 'Đã lưu tài liệu về thiết bị của bạn!') }
      ]
    );
  };

  const renderFileItem = ({ item }) => {
    const isImage = item.type === 'image';
    const dateStr = new Date(item.timestamp).toLocaleDateString();

    return (
      <View style={styles.fileCard}>
        <View style={styles.fileIconContainer}>
          {isImage ? (
            <Image source={{ uri: item.url }} style={styles.thumbnail} />
          ) : (
            <Text style={styles.pdfIcon}>📕</Text>
          )}
        </View>
        
        <View style={styles.fileMeta}>
          <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.fileSubtitle}>Chia sẻ bởi: {item.senderName}</Text>
          <Text style={styles.fileDate}>{dateStr}</Text>
        </View>

        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={() => handleDownloadFile(item)}
        >
          <Text style={styles.downloadIcon}>⬇️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>TÀI LIỆU CHIA SẺ TRONG NHÓM:</Text>
        <Text style={styles.groupTitle} numberOfLines={1}>{groupName}</Text>
      </View>

      {files.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📁</Text>
          <Text style={styles.emptyTitle}>Kho tài liệu trống</Text>
          <Text style={styles.emptyText}>
            Mọi tệp tin hình ảnh hoặc PDF bạn gửi trong phòng chat nhóm sẽ tự động được thu thập và hiển thị tại đây để cả nhóm dễ dàng ôn tập.
          </Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          renderItem={renderFileItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8E8E93',
    letterSpacing: 1,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9500',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  fileIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  pdfIcon: {
    fontSize: 24,
  },
  fileMeta: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  fileName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  fileSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  fileDate: {
    fontSize: 11,
    color: '#AEAEB2',
    marginTop: 2,
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadIcon: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});
