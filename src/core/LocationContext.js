import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentLocation } from './locationService';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        setLocation(loc);
        return loc; // Trả về giá trị để caller dùng ngay, không phụ thuộc vào state update
      } else {
        setErrorMsg('Không thể truy cập tọa độ GPS. Hãy kiểm tra quyền thiết bị.');
        return null;
      }
    } catch (error) {
      setErrorMsg('Đã xảy ra lỗi khi xin định vị.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Tự động định vị lần đầu khi khởi tạo
    requestLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, errorMsg, isLoading, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation phải được dùng trong LocationProvider');
  }
  return context;
}
