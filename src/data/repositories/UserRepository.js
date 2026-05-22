import {
  doc, getDoc, getDocs, updateDoc,
  collection, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from '../models/CollectionNames';
import { buildUser } from '../models/UserModel';

/**
 * Repository thao tác với collection `users`.
 * Mỗi phương thức trả về plain object đã qua buildUser (hoặc mảng).
 */
class UserRepository {
  /** Lấy tất cả users */
  async getAll() {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));
    return snap.docs.map(d => buildUser({ uid: d.id, ...d.data() }));
  }

  /** Lấy một user theo uid */
  async getById(uid) {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (!snap.exists()) return null;
    return buildUser({ uid: snap.id, ...snap.data() });
  }

  /** Cập nhật một phần thông tin user */
  async update(uid, fields) {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
      ...fields,
      updatedAt: Timestamp.now(),
    });
  }

  /** Lưu Expo Push Token cho user */
  async savePushToken(uid, expoPushToken) {
    if (!uid || !expoPushToken) return;
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
      expoPushToken,
      lastPushTokenUpdate: Timestamp.now(),
    });
  }

  /**
   * Cập nhật rating trung bình sau khi nhận đánh giá mới.
   * Dùng công thức rolling average để tránh đọc toàn bộ reviews.
   */
  async updateRating(uid, newRating) {
    const user = await this.getById(uid);
    if (!user) return;
    const oldCount = user.ratingCount || 0;
    const oldRating = user.rating || 0;
    const newCount = oldCount + 1;
    const avgRating = parseFloat(((oldRating * oldCount + newRating) / newCount).toFixed(1));
    await this.update(uid, { rating: avgRating, ratingCount: newCount });
  }
}

export const userRepository = new UserRepository();
