import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { mockDb } from '../../services/firebase';

export default function CreateMeetingScreen({ route, navigation }) {
  const { groupId, groupName } = route.params;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [locationName, setLocationName] = useState('');
  
  // Tọa độ ghim cuộc họp mặc định tại Bách Khoa Hà Nội
  const [coordinates, setCoordinates] = useState({
    latitude: 21.0056,
    longitude: 105.8433
  });

  const handleSaveMeeting = async () => {
    if (!title || !dateTime || !locationName) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tiêu đề, thời gian và địa điểm họp!');
      return;
    }

    const meetingData = {
      groupId,
      title,
      description,
      dateTime: Date.parse(dateTime) || Date.now() + 86400000,
      locationName,
      coordinates,
      createdById: "current_user_1"
    };

    // Lưu vào database
    await mockDb.addDocument('meetings', meetingData);

    // Gửi tin nhắn tự động vào phòng chat
    const alertMsg = `📅 LỊCH HỌP MỚI ĐÃ LÊN:
• Tiêu đề: ${title}
• Thời gian: ${dateTime}
• Địa điểm: ${locationName}`;
    await mockDb.sendMessage(groupId, 'system', 'Hệ Thống', alertMsg);

    Alert.alert('Thành công', 'Đã đặt lịch họp nhóm thành công!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleMapPress = (e) => {
    setCoordinates(e.nativeEvent.coordinate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.infoLabel}>LÊN LỊCH HỌP NHÓM CHO:</Text>
        <Text style={styles.groupNameText}>{groupName}</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tiêu đề cuộc họp *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Ôn tập đề cương cuối kỳ môn Giải tích"
            placeholderTextColor="#8E8E93"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mô tả chi tiết</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nội dung thảo luận, chuẩn bị tài liệu..."
            placeholderTextColor="#8E8E93"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={3}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Thời gian họp *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: 19:30 - Thứ Năm tuần này (21/05)"
            placeholderTextColor="#8E8E93"
            value={dateTime}
            onChangeText={setDateTime}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Địa điểm gặp mặt *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Thư viện Tạ Quang Bửu - Phòng 302"
            placeholderTextColor="#8E8E93"
            value={locationName}
            onChangeText={setLocationName}
          />
        </View>

        {/* Bản đồ định vị cuộc họp */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ghim vị trí họp trên bản đồ (Bấm để ghim)</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              onPress={handleMapPress}
            >
              <Marker coordinate={coordinates} title="Địa điểm họp" pinColor="#FF9500" />
            </MapView>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveMeeting}>
          <Text style={styles.saveButtonText}>Lưu & Đăng Lên Nhóm Chat 🚀</Text>
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
  infoLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8E8E93',
    letterSpacing: 1,
  },
  groupNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 20,
    marginTop: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
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
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginTop: 8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  saveButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
