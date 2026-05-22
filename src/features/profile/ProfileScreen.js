import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, Alert, ScrollView, Platform, Modal } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { mockDb } from '../../data/repositories/firebaseRepository';

const ORANGE_DARK = '#C2410C';

const SLOTS = [
  { key: 'morning', label: 'Sáng' },
  { key: 'afternoon', label: 'Chiều' },
  { key: 'evening', label: 'Tối' }
];

const defaultSchedule = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: []
};

const DAY_SHORT_VI = {
  Monday: 'T2',
  Tuesday: 'T3',
  Wednesday: 'T4',
  Thursday: 'T5',
  Friday: 'T6',
  Saturday: 'T7',
  Sunday: 'CN'
};

const getDayKey = (date) => {
  const keys = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return keys[date.getDay()];
};

const getDayNameVi = (date) => {
  const names = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  return names[date.getDay()];
};

const getWeekDays = (anchorDate) => {
  const d = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate());
  const dayOfWeek = d.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const dayKey = getDayKey(date);
    week.push({
      date,
      dayKey,
      dayShort: DAY_SHORT_VI[dayKey],
      dayNameVi: getDayNameVi(date)
    });
  }
  return week;
};

const getWeekRangeLabel = (anchorDate) => {
  const week = getWeekDays(anchorDate);
  const start = week[0].date;
  const end = week[6].date;
  const fmt = (dt) => `${dt.getDate()}/${dt.getMonth() + 1}`;
  if (start.getFullYear() === end.getFullYear()) {
    return `${fmt(start)} – ${fmt(end)}/${start.getFullYear()}`;
  }
  return `${fmt(start)}/${start.getFullYear()} – ${fmt(end)}/${end.getFullYear()}`;
};

export default function ProfileScreen() {
  const { user, logout, refreshUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [schedule, setSchedule] = useState(user?.schedule || defaultSchedule);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDays, setCalendarDays] = useState([]);
  const [monthYearInput, setMonthYearInput] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setSchedule(user?.schedule || defaultSchedule);
  }, [user]);

  // Lưới 6 hàng × 7 cột — gồm ngày tháng trước/sau (giống lịch macOS/iOS)
  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = firstDay.getDay() - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLast - i),
        isCurrentMonth: false
      });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({
        date: new Date(year, month, d),
        isCurrentMonth: true
      });
    }

    let nextDay = 1;
    while (days.length < 42) {
      days.push({
        date: new Date(year, month + 1, nextDay++),
        isCurrentMonth: false
      });
    }

    setCalendarDays(days);
  }, [selectedDate]);

  const weekDays = getWeekDays(selectedDate);
  const weekRangeLabel = getWeekRangeLabel(selectedDate);

  const shiftWeek = (delta) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta * 7);
    setSelectedDate(next);
  };

  const getMonthYear = () => {
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return `${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  };

  const getFormattedDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      setShowCalendar(false);
    }
  };

  const formatMonthYearInput = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${month}/${date.getFullYear()}`;
  };

  const applyMonthYearInput = (input) => {
    const trimmed = input.trim();
    const match = trimmed.match(/^(\d{1,2})\s*\/\s*(\d{4})$/);
    if (!match) return false;
    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);
    if (month < 1 || month > 12 || year < 1900 || year > 2099) return false;
    const day = Math.min(selectedDate.getDate(), new Date(year, month, 0).getDate());
    setSelectedDate(new Date(year, month - 1, day));
    setMonthYearInput(formatMonthYearInput(new Date(year, month - 1, day)));
    return true;
  };

  const handlePrevMonth = () => {
    const next = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
    const day = Math.min(selectedDate.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate());
    const updated = new Date(next.getFullYear(), next.getMonth(), day);
    setSelectedDate(updated);
    setMonthYearInput(formatMonthYearInput(updated));
  };

  const handleNextMonth = () => {
    const next = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
    const day = Math.min(selectedDate.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate());
    const updated = new Date(next.getFullYear(), next.getMonth(), day);
    setSelectedDate(updated);
    setMonthYearInput(formatMonthYearInput(updated));
  };

  const handleMonthYearInput = (input) => {
    setMonthYearInput(input);
  };

  const handleMonthYearSubmit = () => {
    if (!applyMonthYearInput(monthYearInput)) {
      Alert.alert('Không hợp lệ', 'Nhập đúng định dạng MM/YYYY, ví dụ: 05/2026');
      setMonthYearInput(formatMonthYearInput(selectedDate));
    }
  };

  const openCalendarModal = () => {
    setMonthYearInput(formatMonthYearInput(selectedDate));
    setShowCalendar(true);
  };

  const toggleScheduleSlot = (day, slotKey) => {
    setSchedule(prev => {
      const daySlots = prev[day] || [];
      const isActive = daySlots.includes(slotKey);
      return {
        ...prev,
        [day]: isActive ? daySlots.filter(item => item !== slotKey) : [...daySlots, slotKey]
      };
    });
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await mockDb.updateDocument('users', user.uid, {
        name: name.trim() || user.name,
        schedule
      });
      await refreshUserProfile();
      Alert.alert('Cập nhật thành công', 'Đã lưu thông tin hồ sơ và lịch rảnh.');
    } catch (error) {
      console.error('Lỗi cập nhật hồ sơ:', error);
      Alert.alert('Lỗi', 'Không thể lưu hồ sơ. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' && window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?');
      if (ok) handleLogout();
      return;
    }
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => handleLogout()
        }
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Đang tải thông tin cá nhân...</Text>
      </SafeAreaView>
    );
  }

  const initial = name.charAt(0).toUpperCase() || 'SB';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{name || 'Study Buddy User'}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hồ sơ cá nhân</Text>
          <Text style={styles.label}>Tên hiển thị</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nhập tên của bạn"
            placeholderTextColor="#8E8E93"
          />
          <Text style={styles.label}>Email</Text>
          <TextInput style={[styles.input, styles.disabledInput]} value={user.email} editable={false} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch rảnh học tập</Text>
          <Text style={styles.sectionSubtitle}>Chọn ca học bạn có thể tham gia để đề xuất người cùng lịch phù hợp.</Text>
          
          <View style={styles.dateRow}>
            <View style={styles.dateDisplay}>
              <Text style={styles.dateLabel}>Ngày chọn:</Text>
              <Text style={styles.dateValue}>
                {getFormattedDate(selectedDate)} ({getDayNameVi(selectedDate)})
              </Text>
              <Text style={styles.weekRangeLabel}>Tuần: {weekRangeLabel}</Text>
            </View>
            <TouchableOpacity style={styles.calendarButton} onPress={openCalendarModal}>
              <Text style={styles.calendarButtonText}>📅 Chọn ngày</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekNavRow}>
            <TouchableOpacity style={styles.weekNavButton} onPress={() => shiftWeek(-1)}>
              <Text style={styles.weekNavButtonText}>{'<'} Tuần trước</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.weekNavButton} onPress={() => shiftWeek(1)}>
              <Text style={styles.weekNavButtonText}>Tuần sau {'>'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableContainer}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <View style={[styles.tableCell, styles.tableHeaderCell, styles.dayCell]}>
                <Text style={styles.tableHeaderText}>Thứ / Ca</Text>
              </View>
              {SLOTS.map((slot) => (
                <View key={slot.key} style={[styles.tableCell, styles.tableHeaderCell]}>
                  <Text style={styles.tableHeaderText}>{slot.label}</Text>
                </View>
              ))}
            </View>
            {weekDays.map(({ date, dayKey, dayShort, dayNameVi }) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              return (
                <View
                  key={`${dayKey}-${date.getTime()}`}
                  style={[styles.tableRow, isSelected && styles.tableRowSelected]}
                >
                  <TouchableOpacity
                    style={[styles.tableCell, styles.dayCell, isSelected && styles.dayCellSelected]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                      {dayShort} · {date.getDate()}/{date.getMonth() + 1}
                    </Text>
                    <Text style={[styles.daySubLabel, isSelected && styles.daySubLabelSelected]}>
                      {dayNameVi}
                    </Text>
                  </TouchableOpacity>
                  {SLOTS.map((slot) => {
                    const active = schedule[dayKey]?.includes(slot.key);
                    return (
                      <TouchableOpacity
                        key={slot.key}
                        style={[
                          styles.tableCell,
                          styles.slotCell,
                          isSelected && styles.slotCellInSelectedRow
                        ]}
                        onPress={() => toggleScheduleSlot(dayKey, slot.key)}
                        activeOpacity={0.85}
                      >
                        <View style={[styles.slotCellInner, active && styles.slotCellInnerActive]}>
                          <Text style={[styles.slotText, active && styles.slotTextActive]}>
                            {active ? 'Có' : '—'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Đang lưu...' : 'Lưu thông tin hồ sơ'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveButton, styles.logoutButton]} onPress={confirmLogout}>
          <Text style={[styles.saveButtonText, { color: '#FF3B30' }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent={true} animationType="slide" onRequestClose={() => setShowCalendar(false)}>
        <SafeAreaView style={styles.calendarModal}>
          <View style={styles.calendarContainer}>
            {/* Header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={handlePrevMonth}>
                <Text style={styles.calendarNavButton}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.calendarMonth}>{getMonthYear()}</Text>
              <TouchableOpacity onPress={handleNextMonth}>
                <Text style={styles.calendarNavButton}>{'>'}</Text>
              </TouchableOpacity>
            </View>

            {/* Month/Year Input — nhảy nhanh tới tháng xa */}
            <View style={styles.calendarInputSection}>
              <Text style={styles.calendarInputLabel}>Nhập tháng/năm (MM/YYYY)</Text>
              <View style={styles.calendarInputRow}>
                <TextInput
                  style={styles.calendarInputField}
                  placeholder="VD: 05/2026"
                  placeholderTextColor="#C7C7CC"
                  value={monthYearInput}
                  onChangeText={handleMonthYearInput}
                  onSubmitEditing={handleMonthYearSubmit}
                  onBlur={handleMonthYearSubmit}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="go"
                  maxLength={7}
                />
                <TouchableOpacity style={styles.calendarGoButton} onPress={handleMonthYearSubmit}>
                  <Text style={styles.calendarGoButtonText}>Đi tới</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.calendarInputHint}>Dùng khi cần chọn ngày cách xa — không cần bấm {'<'} {'>'} nhiều lần</Text>
            </View>

            {/* Lưới ngày — dark, không viền ô, chọn bằng vòng tròn xanh */}
            <ScrollView
              style={styles.calendarGridScroll}
              contentContainerStyle={styles.calendarGridScrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              bounces={false}
            >
              <View style={styles.calendarGrid}>
                {calendarDays.reduce((rows, cell, idx) => {
                  if (idx % 7 === 0) rows.push([]);
                  rows[rows.length - 1].push(cell);
                  return rows;
                }, []).map((week, weekIdx) => (
                  <View key={weekIdx} style={styles.calendarWeek}>
                    {week.map((cell, dayIdx) => {
                      const day = cell.date;
                      const isSelected = day.toDateString() === selectedDate.toDateString();
                      return (
                        <View key={`${weekIdx}-${dayIdx}`} style={styles.calendarDateCell}>
                          <TouchableOpacity
                            style={[styles.calendarDateBubble, isSelected && styles.calendarDateSelected]}
                            onPress={() => handleDateSelect(day)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.calendarDateText,
                                !cell.isCurrentMonth && styles.calendarDateTextMuted,
                                isSelected && styles.calendarDateTextSelected
                              ]}
                            >
                              {day.getDate()}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Close button */}
            <TouchableOpacity style={styles.calendarCloseButton} onPress={() => setShowCalendar(false)}>
              <Text style={styles.calendarCloseButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 36,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  email: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  menuList: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  menuArrow: {
    fontSize: 16,
    color: '#C7C7CC',
  },
  scrollContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1C1C1E',
    marginBottom: 14,
  },
  disabledInput: {
    backgroundColor: '#EFEFF4',
    color: '#8E8E93',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tableHeaderRow: {
    backgroundColor: '#F8F9FA',
  },
  tableCell: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
  },
  tableHeaderCell: {
    backgroundColor: '#F8F9FA',
  },
  dayCell: {
    flex: 1.4,
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A3A3C',
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  slotCell: {
    backgroundColor: '#F7F7FA',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  slotCellInner: {
    alignSelf: 'stretch',
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  slotCellInnerActive: {
    borderWidth: 4,
    borderColor: ORANGE_DARK,
    backgroundColor: '#FFF7ED',
  },
  slotText: {
    fontSize: 13,
    color: '#1C1C1E',
  },
  slotTextActive: {
    color: ORANGE_DARK,
    fontWeight: '800',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#FF9500',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 14,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 50,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  dateDisplay: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  weekRangeLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  weekNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  weekNavButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  weekNavButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9500',
  },
  tableRowSelected: {
    backgroundColor: '#FFF8F0',
  },
  dayCellSelected: {
    backgroundColor: '#FFF3E0',
  },
  dayLabelSelected: {
    color: ORANGE_DARK,
  },
  daySubLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  daySubLabelSelected: {
    color: ORANGE_DARK,
  },
  slotCellInSelectedRow: {
    backgroundColor: '#FFFBF5',
  },
  calendarButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginLeft: 12,
  },
  calendarButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  calendarModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  calendarInputSection: {
    marginBottom: 14,
  },
  calendarInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A3A3C',
    marginBottom: 8,
  },
  calendarInputHint: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 6,
    lineHeight: 16,
  },
  calendarInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarInputField: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  calendarGoButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 10,
  },
  calendarGoButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  calendarGridScroll: {
    flexGrow: 0,
    maxHeight: 252,
    marginBottom: 14,
  },
  calendarGridScrollContent: {
    paddingBottom: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  calendarNavButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9500',
    paddingHorizontal: 12,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  calendarGrid: {
    marginBottom: 0,
  },
  calendarWeek: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  calendarDateCell: {
    flex: 1,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDateBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  calendarDateSelected: {
    backgroundColor: ORANGE_DARK,
  },
  calendarDateText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  calendarDateTextMuted: {
    color: '#C7C7CC',
  },
  calendarDateTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarCloseButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  calendarCloseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
