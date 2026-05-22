import React, { createContext, useState, useContext } from 'react';

// Định nghĩa bảng màu thiết kế cao cấp cho Light và Dark Mode
export const lightTheme = {
  dark: false,
  colors: {
    primary: '#FF9500',      // Cam StudyBuddy đặc trưng
    background: '#F8F9FA',   // Xám nhạt hiện đại
    card: '#FFFFFF',         // Trắng tinh tế
    text: '#1C1C1E',         // Đen tối của hệ thống
    border: '#E5E5EA',       // Viền xám mảnh
    notification: '#FF3B30',  // Đỏ cảnh báo
    textSecondary: '#8E8E93', // Xám nhạt cho mô tả
    success: '#34C759',      // Xanh lá thành công
  }
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: '#FF9500',      // Cam StudyBuddy đặc trưng
    background: '#121212',   // Đen sâu nguyên bản (True Black)
    card: '#1E1E1E',         // Đen nhạt cho Card
    text: '#FFFFFF',         // Chữ trắng sắc nét
    border: '#2C2C2E',       // Viền tối mảnh
    notification: '#FF453A',  // Đỏ cảnh báo tối
    textSecondary: '#AEAEB2', // Xám sáng cho mô tả
    success: '#30D158',      // Xanh lá tối
  }
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme phải được dùng bên trong ThemeProvider');
  }
  return context;
}
