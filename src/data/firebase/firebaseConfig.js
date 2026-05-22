import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDIEBU4NMBgXGDehLF7WZfcwcqehCMDzUI",
  authDomain: "studybuddy-8a2fc.firebaseapp.com",
  projectId: "studybuddy-8a2fc",
  storageBucket: "studybuddy-8a2fc.firebasestorage.app",
  messagingSenderId: "964068658871",
  appId: "1:964068658871:web:05c80592e110c18d710732",
  measurementId: "G-KSV6YZ6F0F"
};

// Khởi tạo App (singleton — tránh khởi tạo lại khi hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Analytics chỉ bật trên web
if (Platform.OS === 'web') {
  import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) =>
      isSupported().then((ok) => (ok ? getAnalytics(app) : null))
    )
    .catch(() => {});
}

// Auth với persistence trên mobile, getAuth đơn giản trên web
const auth = Platform.OS === 'web'
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
