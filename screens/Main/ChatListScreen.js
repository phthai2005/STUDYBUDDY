import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { mockDb } from '../../services/firebase';

export default function ChatListScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  
  // Giả lập ID người dùng hiện tại
  const currentUserId = "current_user_1";

  useEffect(() => {
    const fetchGroups = async () => {
      const allGroups = await mockDb.getCollection('study_groups');
      // Lọc các nhóm mà user hiện tại tham gia
      const myGroups = allGroups.filter(g => g.members.includes(currentUserId));
      setGroups(myGroups);
    };

    const unsubscribe = navigation.addListener('focus', () => {
      fetchGroups();
    });

    return unsubscribe;
  }, [navigation]);

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.courseId.toLowerCase().includes(search.toLowerCase())
  );

  const renderGroupItem = ({ item }) => {
    const timeString = item.lastMessage?.timestamp
      ? new Date(item.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <TouchableOpacity 
        style={styles.groupCard}
        onPress={() => navigation.navigate('ChatRoom', { groupId: item.groupId, groupName: item.name })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{item.courseId}</Text>
        </View>
        
        <View style={styles.groupInfo}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.timeText}>{timeString}</Text>
          </View>
          <Text style={styles.lastMessageText} numberOfLines={1}>
            <Text style={styles.senderName}>{item.lastMessage?.senderName}: </Text>
            {item.lastMessage?.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.title}>Hộp Thoại Nhóm 💬</Text>
          <TouchableOpacity 
            style={styles.createGroupButton}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            <Text style={styles.createGroupText}>+ Tạo nhóm</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Nơi bạn trao đổi tài liệu và học nhóm cùng các StudyBuddy.</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm nhóm học, môn học..."
          placeholderTextColor="#8E8E93"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filteredGroups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>Chưa có nhóm học nào</Text>
          <Text style={styles.emptyDescription}>
            Hãy quay lại tab "Tìm bạn" để ghép nhóm và bắt đầu trao đổi học tập nhé!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item.groupId}
          renderItem={renderGroupItem}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createGroupButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  createGroupText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
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
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInput: {
    backgroundColor: '#F2F2F7',
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1C1C1E',
  },
  listContainer: {
    padding: 16,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  groupInfo: {
    flex: 1,
    marginLeft: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  lastMessageText: {
    fontSize: 14,
    color: '#3A3A3C',
  },
  senderName: {
    fontWeight: '600',
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  emptyDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});
