import {
  collection, addDoc, query, where, onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { COLLECTIONS } from '../models/CollectionNames';
import { buildMessage } from '../models/MessageModel';
import { groupRepository } from './GroupRepository';

/**
 * Repository thao tác với collection `messages` và Firebase Storage.
 */
class MessageRepository {
  /**
   * Gửi tin nhắn văn bản hoặc file vào nhóm.
   * Tự động cập nhật lastMessage của group.
   */
  async send(groupId, senderId, senderName, text, fileUrl = null, fileType = 'text') {
    const message = buildMessage({ groupId, senderId, senderName, text, fileUrl, fileType });
    // Bỏ messageId rỗng — Firestore tự sinh
    const { messageId: _ignored, ...payload } = message;
    const ref_ = await addDoc(collection(db, COLLECTIONS.MESSAGES), payload);

    // Cập nhật preview tin nhắn cuối trong group
    await groupRepository.updateLastMessage(groupId, {
      text: fileType === 'text' ? text : `[Chia sẻ ${fileType.toUpperCase()}]`,
      senderName,
      timestamp: message.timestamp,
    });

    return buildMessage({ messageId: ref_.id, ...payload });
  }

  /**
   * Đăng ký lắng nghe tin nhắn realtime của một nhóm.
   * @returns {Function} unsubscribe — gọi khi unmount component
   */
  subscribeToGroup(groupId, callback) {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('groupId', '==', groupId)
    );
    return onSnapshot(
      q,
      (snap) => {
        const msgs = snap.docs
          .map(d => buildMessage({ messageId: d.id, ...d.data() }))
          .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        callback(msgs);
      },
      (err) => console.error('[MessageRepository] subscribeToGroup:', err)
    );
  }

  /**
   * Upload file lên Firebase Storage, trả về download URL.
   * @param {string} storagePath  Đường dẫn trong Storage, vd: "chatFiles/groupId/filename.jpg"
   * @param {string} localUri     URI file trên thiết bị
   */
  async uploadFile(storagePath, localUri) {
    const response = await fetch(localUri);
    const blob = await response.blob();
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, blob);
    return getDownloadURL(snapshot.ref);
  }
}

export const messageRepository = new MessageRepository();
