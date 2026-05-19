import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import TodoInput from '../components/TodoInput';
import TodoItem from '../components/TodoItem';
import EditModal from '../components/EditModal';

export default function HomeScreen({ navigation }) {
  // Trạng thái danh sách nhiệm vụ học tập
  const [todos, setTodos] = useState([
    { id: '1', text: 'Đọc tài liệu React Navigation v7', completed: false },
    { id: '2', text: 'Làm bài tập trắc nghiệm UI/UX', completed: true },
    { id: '3', text: 'Xem video hướng dẫn Expo CLI', completed: false },
  ]);

  // Trạng thái phục vụ chỉnh sửa nhiệm vụ
  const [editingTodo, setEditingTodo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Thêm nhiệm vụ mới
  const handleAddTodo = (text) => {
    const newTodo = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    setTodos([newTodo, ...todos]);
  };

  // Đổi trạng thái hoàn thành
  const handleToggleComplete = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Xóa nhiệm vụ
  const handleDelete = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Kích hoạt Modal chỉnh sửa
  const handleStartEdit = (todo) => {
    setEditingTodo(todo);
    setModalVisible(true);
  };

  // Lưu chỉnh sửa
  const handleSaveEdit = (id, newText) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Chào mừng quay lại,</Text>
            <Text style={styles.userName}>Study Buddy 👋</Text>
          </View>

          {/* Card Thống kê */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {todos.length > 0
                  ? `${Math.round((todos.filter(t => t.completed).length / todos.length) * 100)}%`
                  : '0%'}
              </Text>
              <Text style={styles.statLabel}>Nhiệm vụ xong</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxBorder]}>
              <Text style={styles.statNumber}>
                {todos.filter(t => !t.completed).length}
              </Text>
              <Text style={styles.statLabel}>Cần làm</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{todos.length}</Text>
              <Text style={styles.statLabel}>Tổng số</Text>
            </View>
          </View>

          {/* Khu vực Todo List */}
          <Text style={styles.sectionTitle}>Nhiệm vụ học tập 📝</Text>
          
          <TodoInput onAddTodo={handleAddTodo} />

          <View style={styles.todoListContainer}>
            {todos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tuyệt vời! Không còn nhiệm vụ nào cần làm 🎉</Text>
              </View>
            ) : (
              todos.map((item) => (
                <TodoItem
                  key={item.id}
                  todo={item}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDelete}
                  onEdit={handleStartEdit}
                />
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal chỉnh sửa nhiệm vụ */}
      <EditModal
        visible={modalVisible}
        todo={editingTodo}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveEdit}
      />
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
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E5EA',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  todoListContainer: {
    marginBottom: 20,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
  },
});
