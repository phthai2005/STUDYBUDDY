import React, { createContext, useState, useContext, useEffect } from 'react';
import { mockAuth, mockDb } from '../../data/repositories/firebaseRepository';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Đăng ký lắng nghe sự thay đổi trạng thái xác thực thời gian thực
    const unsubscribe = mockAuth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Hàm Đăng nhập thực tế
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await mockAuth.signInWithEmailAndPassword(email, password);
      return result.user;
    } catch (error) {
      console.error('Lỗi khi đăng nhập tại AuthContext:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm Đăng xuất — chỉ xóa session sau khi Firebase signOut thành công
  const logout = async () => {
    await mockAuth.signOut();
    setUser(null);
  };

  const refreshUserProfile = async () => {
    try {
      if (!user) return null;
      const profileData = await mockDb.getUserById(user.uid);
      if (profileData) {
        setUser(profileData);
      }
      return profileData;
    } catch (error) {
      console.error('Lỗi khi làm mới thông tin người dùng:', error);
      return null;
    }
  };

  // Hàm Đăng ký thực tế
  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const result = await mockAuth.createUserWithEmailAndPassword(email, password, name);
      return result.user;
    } catch (error) {
      console.error('Lỗi khi đăng ký tại AuthContext:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, refreshUserProfile }}>
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
