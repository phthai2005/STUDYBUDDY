import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function TodoItem({ todo, onToggleComplete, onDelete, onEdit }) {
  return (
    <View style={[styles.itemContainer, todo.completed && styles.itemCompleted]}>
      <TouchableOpacity 
        style={styles.checkboxContainer} 
        onPress={() => onToggleComplete(todo.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, todo.completed && styles.checkboxChecked]}>
          {todo.completed && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <Text style={[styles.todoText, todo.completed && styles.todoTextCompleted]}>
          {todo.text}
        </Text>
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => onEdit(todo)}
          activeOpacity={0.7}
        >
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => onDelete(todo.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  itemCompleted: {
    borderLeftColor: '#34C759',
    opacity: 0.7,
  },
  checkboxContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  todoText: {
    fontSize: 16,
    color: '#1C1C1E',
    flex: 1,
    paddingRight: 8,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  editIcon: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 16,
  },
});
