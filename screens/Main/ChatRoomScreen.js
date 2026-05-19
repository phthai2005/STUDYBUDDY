import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { mockDb } from '../../services/firebase';

export default function ChatRoomScreen({ route, navigation }) {
  const { groupId, groupName } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();

  // Giả lập thông tin người dùng hiện tại
  const currentUser = {
    uid: "current_user_1",
    name: "Lê Minh Triết"
  };

  useEffect(() => {
    // Đăng ký nhận tin nhắn thời gian thực từ database
    const unsubscribe = mockDb.subscribeToChat(groupId, (data) => {
      setMessages([...data]);
      // Cuộn xuống cuối
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    // Cập nhật tiêu đề thanh điều hướng
    navigation.setOptions({
      title: groupName,
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleSend = async () => {
    if (inputText.trim() === '') return;
    await mockDb.sendMessage(groupId, currentUser.uid, currentUser.name, inputText);
    setInputText('');
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Chúng tôi cần quyền truy cập thư viện ảnh để gửi hình ảnh!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      // Gửi tin nhắn chứa ảnh giả lập
      await mockDb.sendMessage(
        groupId, 
        currentUser.uid, 
        currentUser.name, 
        "[Đã gửi một hình ảnh]", 
        selectedUri, 
        'image'
      );
    }
  };

  const renderMessageItem = ({ item }) => {
    const isMe = item.senderId === currentUser.uid;
    const isSystem = item.senderId === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
        {!isMe && (
          <View style={styles.avatarMini}>
            <Text style={styles.avatarMiniText}>{item.senderName[0]}</Text>
          </View>
        )}
        
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}>
          {!isMe && <Text style={styles.senderLabel}>{item.senderName}</Text>}
          
          {item.fileType === 'image' && item.fileUrl ? (
            <Image source={{ uri: item.fileUrl }} style={styles.messageImage} />
          ) : (
            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
              {item.text}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sub header chức năng phụ */}
      <View style={styles.subHeader}>
        <TouchableOpacity 
          style={styles.subHeaderButton}
          onPress={() => navigation.navigate('CreateMeeting', { groupId, groupName })}
        >
          <Text style={styles.subHeaderIcon}>📅</Text>
          <Text style={styles.subHeaderLabel}>Lịch họp</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.subHeaderButton}
          onPress={() => navigation.navigate('FileShare', { groupId, groupName })}
        >
          <Text style={styles.subHeaderIcon}>📁</Text>
          <Text style={styles.subHeaderLabel}>Tài liệu</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.subHeaderButton}
          onPress={() => navigation.navigate('PeerReview', { groupId })}
        >
          <Text style={styles.subHeaderIcon}>⭐️</Text>
          <Text style={styles.subHeaderLabel}>Đánh giá bạn học</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.messageId}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.mediaButton} onPress={handlePickImage}>
            <Text style={styles.mediaIcon}>🖼️</Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#8E8E93"
            multiline={true}
          />
          
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  subHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  subHeaderIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  subHeaderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  messageList: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessageRow: {
    alignSelf: 'flex-end',
  },
  otherMessageRow: {
    alignSelf: 'flex-start',
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatarMiniText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: '#FF9500',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#1C1C1E',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginTop: 4,
  },
  systemMessageContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(142, 142, 147, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginVertical: 12,
  },
  systemMessageText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  mediaButton: {
    padding: 8,
    marginRight: 4,
  },
  mediaIcon: {
    fontSize: 22,
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 15,
    color: '#1C1C1E',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  sendText: {
    color: '#FF9500',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
