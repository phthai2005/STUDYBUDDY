import {
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbCreateUser,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile as fbUpdateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { COLLECTIONS } from '../models/CollectionNames';

/**
 * Tầng dịch vụ xác thực — bọc Firebase Auth và đồng bộ hồ sơ Firestore.
 * Không chứa logic UI, không import React.
 */
class AuthService {
  /** Lắng nghe thay đổi trạng thái đăng nhập, trả về unsubscribe fn */
  onAuthStateChanged(callback) {
    return fbOnAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        callback(null);
        return;
      }
      try {
        const snap = await getDoc(doc(db, COLLECTIONS.USERS, fbUser.uid));
        const profile = snap.exists() ? snap.data() : {};
        callback({
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email.split('@')[0].toUpperCase(),
          email: fbUser.email,
          ...profile,
        });
      } catch (err) {
        console.error('[AuthService] onAuthStateChanged — lỗi lấy profile:', err);
        callback({
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email.split('@')[0].toUpperCase(),
          email: fbUser.email,
        });
      }
    });
  }

  /** Đăng nhập bằng email + password, trả về user object kèm profile */
  async signIn(email, password) {
    if (!email || !password) throw new Error('Email và mật khẩu không được trống.');
    const credential = await fbSignIn(auth, email, password);
    const fbUser = credential.user;
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, fbUser.uid));
    const profile = snap.exists() ? snap.data() : {};
    return {
      uid: fbUser.uid,
      name: fbUser.displayName || fbUser.email.split('@')[0].toUpperCase(),
      email: fbUser.email,
      ...profile,
    };
  }

  /** Đăng ký tài khoản mới, tạo document users/{uid} */
  async register(email, password, name = 'Sinh Viên Mới') {
    if (!email || !password) throw new Error('Email và mật khẩu không được trống.');
    const credential = await fbCreateUser(auth, email, password);
    const fbUser = credential.user;

    await fbUpdateProfile(fbUser, { displayName: name });

    const userProfile = {
      name,
      email,
      school: '',
      major: '',
      courses: [],
      schedule: {
        Monday: [], Tuesday: [], Wednesday: [],
        Thursday: [], Friday: [], Saturday: [], Sunday: [],
      },
      location: null,
      rating: 5.0,
      ratingCount: 0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop',
    };

    await setDoc(doc(db, COLLECTIONS.USERS, fbUser.uid), userProfile);
    return { uid: fbUser.uid, ...userProfile };
  }

  /** Đăng xuất */
  async signOut() {
    await fbSignOut(auth);
  }
}

export const authService = new AuthService();
