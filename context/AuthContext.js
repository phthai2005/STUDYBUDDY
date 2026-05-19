import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Giả lập kiểm tra trạng thái đăng nhập từ bộ nhớ (e.g. AsyncStorage)
    const checkLoginStatus = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(checkLoginStatus);
  }, []);

  // Đăng nhập giả lập
  const login = async (email, password) => {
    setIsLoading(true);
    // Giả lập độ trễ kết nối API 1 giây
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        setIsLoading(false);
        if (email && password) {
          const loggedInUser = {
            id: 'usr_' + Date.now(),
            name: 'Study Buddy User',
            email: email,
          };
          setUser(loggedInUser);
          resolve(loggedInUser);
        } else {
          reject(new Error('Vui lòng điền đầy đủ email và mật khẩu.'));
        }
      }, 1000);
    });
  };

  // Đăng xuất
  const logout = async () => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser(null);
        setIsLoading(false);
        resolve();
      }, 800);
    });
  };

  // Đăng ký giả lập
  const register = async (name, email, password) => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        setIsLoading(false);
        if (name && email && password) {
          const newUser = {
            id: 'usr_' + Date.now(),
            name: name,
            email: email,
          };
          setUser(newUser);
          resolve(newUser);
        } else {
          reject(new Error('Vui lòng điền đầy đủ thông tin đăng ký.'));
        }
      }, 1200);
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}
