import React, { useState } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Text, Keyboard } from 'react-native';

export default function TodoInput({ onAddTodo }) {
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (text.trim() === '') return;
    onAddTodo(text);
    setText('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Thêm nhiệm vụ học tập mới..."
        placeholderTextColor="#8E8E93"
        value={text}
        onChangeText={setText}
      />
      <TouchableOpacity style={styles.button} onPress={handleAdd} activeOpacity={0.8}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1C1C1E',
  },
  button: {
    backgroundColor: '#FF9500',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 24,
  },
});
