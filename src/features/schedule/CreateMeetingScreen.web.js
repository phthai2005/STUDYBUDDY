import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, SafeAreaView, Alert
} from 'react-native';
import { mockDb } from '../../data/repositories/firebaseRepository';
import { useAuth } from '../auth/AuthContext';

// ─── Helpers lịch ────────────────────────────────────────────────────────────

const MONTHS_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const DAYS_SHORT_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];

  const prevMonthLast = new Date(year, month, 0).getDate();
  for (let i = firstDay.getDay() - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, prevMonthLast - i), isCurrentMonth: false });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }
  let nextDay = 1;
  while (days.length < 42) {
    days.push({ date: new Date(year, month + 1, nextDay++), isCurrentMonth: false });
  }
  return days;
}

function formatDateVi(date) {
  if (!date) return '';
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function padTwo(n) {
  return String(n).padStart(2, '0');
}

// ─── Component chính ─────────────────────────────────────────────────────────

export default function CreateMeetingScreen({ route, navigation }) {
  const { user } = useAuth();
  const { groupId, groupName } = route.params;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [hour, setHour] = useState('19');
  const [minute, setMinute] = useState('30');

  // Calendar inline (web không dùng Modal)
  const [showCalendar, setShowCalendar] = useState(false);
  const [calViewDate, setCalViewDate] = useState(new Date(tomorrow));
  const [calendarDays, setCalendarDays] = useState([]);

  const [coordinates] = useState({ latitude: 21.0056, longitude: 105.8433 });

  useEffect(() => {
    setCalendarDays(buildCalendarDays(calViewDate.getFullYear(), calViewDate.getMonth()));
  }, [calViewDate]);

  const getMonthYearLabel = () =>
    `${MONTHS_VI[calViewDate.getMonth()]} ${calViewDate.getFullYear()}`;

  const shiftMonth = (delta) => {
    setCalViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const parseHour = () => {
    const h = parseInt(hour, 10);
    return Number.isNaN(h) ? null : Math.min(23, Math.max(0, h));
  };

  const parseMinute = () => {
    const m = parseInt(minute, 10);
    return Number.isNaN(m) ? null : Math.min(59, Math.max(0, m));
  };

  const getMeetingDate = () => {
    const h = parseHour();
    const m = parseMinute();
    if (h === null || m === null) return null;
    return new Date(
      selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(),
      h, m, 0
    );
  };

  const getTimeLabel = () => {
    const h = parseHour();
    const m = parseMinute();
    if (h === null || m === null) return '';
    return `${padTwo(h)}:${padTwo(m)}`;
  };

  const handleSaveMeeting = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề cuộc họp!');
      return;
    }
    if (!locationName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa điểm gặp mặt!');
      return;
    }
    if (parseHour() === null || parseMinute() === null) {
      Alert.alert('Lỗi', 'Giờ hoặc phút không hợp lệ!');
      return;
    }

    const meetingDate = getMeetingDate();
    const timeLabel = getTimeLabel();
    const dateLabel = formatDateVi(selectedDate);
    const dateTimeLabel = `${timeLabel} — ${dateLabel}`;

    const meetingData = {
      groupId,
      title: title.trim(),
      description: description.trim(),
      dateTime: meetingDate.getTime(),
      locationName: locationName.trim(),
      coordinates,
      createdById: user?.uid || 'anonymous'
    };

    await mockDb.addDocument('meetings', meetingData);

    const alertMsg = `📅 LỊCH HỌP MỚI ĐÃ LÊN:\n• Tiêu đề: ${title.trim()}\n• Thời gian: ${dateTimeLabel}\n• Địa điểm: ${locationName.trim()}`;
    await mockDb.sendMessage(groupId, 'system', 'Hệ Thống', alertMsg);

    Alert.alert('Thành công', 'Đã đặt lịch họp nhóm thành công!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.infoLabel}>LÊN LỊCH HỌP NHÓM CHO:</Text>
        <Text style={styles.groupNameText}>{groupName}</Text>

        {/* Tiêu đề */}
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

        {/* Mô tả */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Mô tả chi tiết</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nội dung thảo luận, chuẩn bị tài liệu..."
            placeholderTextColor="#8E8E93"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* ── THỜI GIAN ── */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Thời gian họp *</Text>

          {/* Chọn ngày */}
          <View style={styles.dateBlock}>
            <Text style={styles.subLabel}>📅 Ngày họp</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowCalendar(v => !v)}
            >
              <Text style={styles.datePickerText}>{formatDateVi(selectedDate)}</Text>
              <Text style={styles.datePickerChevron}>{showCalendar ? '▲' : '▼'}</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar inline (web) */}
          {showCalendar && (
            <View style={styles.calInline}>
              <View style={styles.calHeader}>
                <TouchableOpacity onPress={() => shiftMonth(-1)}>
                  <Text style={styles.calNavBtn}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.calMonthLabel}>{getMonthYearLabel()}</Text>
                <TouchableOpacity onPress={() => shiftMonth(1)}>
                  <Text style={styles.calNavBtn}>{'>'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.calWeekHeader}>
                {DAYS_SHORT_VI.map(d => (
                  <View key={d} style={styles.calDayHeaderCell}>
                    <Text style={styles.calDayHeaderText}>{d}</Text>
                  </View>
                ))}
              </View>

              {calendarDays.reduce((rows, cell, idx) => {
                if (idx % 7 === 0) rows.push([]);
                rows[rows.length - 1].push(cell);
                return rows;
              }, []).map((week, wi) => (
                <View key={wi} style={styles.calWeekRow}>
                  {week.map((cell, di) => {
                    const isSelected = cell.date.toDateString() === selectedDate.toDateString();
                    const isToday = cell.date.toDateString() === new Date().toDateString();
                    return (
                      <View key={di} style={styles.calDayCell}>
                        <TouchableOpacity
                          style={[
                            styles.calDayBubble,
                            isSelected && styles.calDayBubbleSelected,
                            isToday && !isSelected && styles.calDayBubbleToday,
                          ]}
                          onPress={() => handleSelectDate(cell.date)}
                        >
                          <Text style={[
                            styles.calDayText,
                            !cell.isCurrentMonth && styles.calDayTextMuted,
                            isSelected && styles.calDayTextSelected,
                            isToday && !isSelected && styles.calDayTextToday,
                          ]}>
                            {cell.date.getDate()}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          )}

          {/* Nhập giờ + phút */}
          <View style={[styles.timeRow, { marginTop: 12 }]}>
            <View style={styles.timeBlock}>
              <Text style={styles.subLabel}>🕐 Giờ (0–23)</Text>
              <TextInput
                style={styles.timeInput}
                value={hour}
                onChangeText={(v) => setHour(v.replace(/[^0-9]/g, '').slice(0, 2))}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="19"
                placeholderTextColor="#C7C7CC"
                textAlign="center"
              />
            </View>

            <Text style={styles.timeSeparator}>:</Text>

            <View style={styles.timeBlock}>
              <Text style={styles.subLabel}>⏱ Phút (0–59)</Text>
              <TextInput
                style={styles.timeInput}
                value={minute}
                onChangeText={(v) => setMinute(v.replace(/[^0-9]/g, '').slice(0, 2))}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="30"
                placeholderTextColor="#C7C7CC"
                textAlign="center"
              />
            </View>

            <View style={styles.timePreviewBlock}>
              <Text style={styles.subLabel}>Kết quả</Text>
              <View style={styles.timePreview}>
                <Text style={styles.timePreviewText}>
                  {getTimeLabel() || '--:--'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Địa điểm */}
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

        {/* Bản đồ web placeholder */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Vị trí họp trên bản đồ (Web Demo)</Text>
          <View style={styles.mapContainer}>
            <View style={styles.webMapPlaceholder}>
              <Text style={styles.webMapIcon}>🗺️</Text>
              <Text style={styles.webMapTitle}>Bản đồ định vị họp nhóm</Text>
              <Text style={styles.webMapText}>
                Tọa độ: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
              </Text>
              <Text style={styles.webMapSubText}>
                Bản đồ tương tác hoạt động đầy đủ trên thiết bị di động
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveMeeting}>
          <Text style={styles.saveButtonText}>Lưu & Đăng Lên Nhóm Chat 🚀</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ORANGE = '#FF9500';
const ORANGE_DARK = '#C2410C';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContainer: { padding: 20 },

  infoLabel: { fontSize: 11, fontWeight: 'bold', color: '#8E8E93', letterSpacing: 1 },
  groupNameText: { fontSize: 18, fontWeight: 'bold', color: ORANGE, marginBottom: 20, marginTop: 4 },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', marginBottom: 8 },
  subLabel: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 6 },

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
  textArea: { height: 80, paddingTop: 12, textAlignVertical: 'top' },

  // ── Ngày ──
  dateBlock: { marginBottom: 0 },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  datePickerText: { fontSize: 15, color: '#1C1C1E', fontWeight: '500' },
  datePickerChevron: { fontSize: 16, color: ORANGE, fontWeight: 'bold' },

  // ── Calendar inline (web) ──
  calInline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  calNavBtn: { fontSize: 20, fontWeight: 'bold', color: ORANGE, paddingHorizontal: 8 },
  calMonthLabel: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },

  calWeekHeader: { flexDirection: 'row', marginBottom: 4 },
  calDayHeaderCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  calDayHeaderText: { fontSize: 11, fontWeight: '700', color: '#8E8E93' },

  calWeekRow: { flexDirection: 'row', marginBottom: 2 },
  calDayCell: { flex: 1, height: 36, justifyContent: 'center', alignItems: 'center' },
  calDayBubble: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  calDayBubbleSelected: { backgroundColor: ORANGE_DARK },
  calDayBubbleToday: { borderWidth: 1.5, borderColor: ORANGE },
  calDayText: { fontSize: 14, fontWeight: '500', color: '#1C1C1E' },
  calDayTextMuted: { color: '#C7C7CC' },
  calDayTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  calDayTextToday: { color: ORANGE, fontWeight: '700' },

  // ── Giờ ──
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  timeBlock: { flex: 1 },
  timeInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    height: 52,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3A3A3C',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  timePreviewBlock: { flex: 1.2 },
  timePreview: {
    backgroundColor: 'rgba(255,149,0,0.1)',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,149,0,0.3)',
  },
  timePreviewText: { fontSize: 22, fontWeight: 'bold', color: ORANGE },

  // ── Bản đồ web ──
  mapContainer: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginTop: 8,
    backgroundColor: '#F2F2F7',
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  webMapIcon: { fontSize: 28, marginBottom: 6 },
  webMapTitle: { fontSize: 13, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 4 },
  webMapText: { fontSize: 12, color: '#3A3A3C', textAlign: 'center' },
  webMapSubText: { fontSize: 10, color: '#8E8E93', marginTop: 4, fontStyle: 'italic' },

  // ── Nút lưu ──
  saveButton: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
