/**
 * @file firebaseRepository.js
 * @description Compatibility shim — giữ nguyên interface cũ (mockAuth, mockDb)
 * để các màn hình feature không cần sửa import.
 * Toàn bộ logic thực tế đã được chuyển sang:
 *   - src/data/services/AuthService.js
 *   - src/data/repositories/UserRepository.js
 *   - src/data/repositories/GroupRepository.js
 *   - src/data/repositories/MessageRepository.js
 *   - src/data/repositories/MeetingRepository.js
 *   - src/data/repositories/ReviewRepository.js
 */

import { app, auth, db, storage } from '../firebase';
import { authService } from '../services/AuthService';
import { userRepository } from './UserRepository';
import { groupRepository } from './GroupRepository';
import { messageRepository } from './MessageRepository';
import { meetingRepository } from './MeetingRepository';
import { reviewRepository } from './ReviewRepository';
import { COLLECTIONS } from '../models/CollectionNames';

// ─── mockAuth shim ────────────────────────────────────────────────────────────

const mockAuth = {
  onAuthStateChanged: (cb) => authService.onAuthStateChanged(cb),
  signInWithEmailAndPassword: (email, password) => authService.signIn(email, password).then(user => ({ user })),
  createUserWithEmailAndPassword: (email, password, name) => authService.register(email, password, name).then(user => ({ user })),
  signOut: () => authService.signOut(),
};

// ─── mockDb shim ──────────────────────────────────────────────────────────────

/**
 * Map tên collection → repository tương ứng để getCollection/addDocument/updateDocument
 * vẫn hoạt động với code cũ dùng tên collection dạng string.
 */
const REPO_MAP = {
  [COLLECTIONS.USERS]:    userRepository,
  [COLLECTIONS.GROUPS]:   groupRepository,
  [COLLECTIONS.MEETINGS]: meetingRepository,
  [COLLECTIONS.REVIEWS]:  reviewRepository,
};

const mockDb = {
  // ── Generic CRUD (dùng bởi các màn hình cũ) ──────────────────────────────

  async getCollection(colName) {
    const repo = REPO_MAP[colName];
    if (repo?.getAll) return repo.getAll();
    console.warn(`[mockDb.getCollection] Không có repository cho "${colName}"`);
    return [];
  },

  async addDocument(colName, data) {
    const repo = REPO_MAP[colName];
    if (repo?.create) return repo.create(data);
    console.warn(`[mockDb.addDocument] Không có repository cho "${colName}"`);
    return data;
  },

  async updateDocument(colName, docId, fields) {
    const repo = REPO_MAP[colName];
    if (repo?.update) return repo.update(docId, fields);
    console.warn(`[mockDb.updateDocument] Không có repository cho "${colName}"`);
  },

  // ── User helpers ──────────────────────────────────────────────────────────

  getUserById: (uid) => userRepository.getById(uid),
  savePushTokenForUser: (uid, token) => userRepository.savePushToken(uid, token),

  // ── Chat ──────────────────────────────────────────────────────────────────

  subscribeToChat: (groupId, cb) => messageRepository.subscribeToGroup(groupId, cb),
  sendMessage: (groupId, senderId, senderName, text, fileUrl, fileType) =>
    messageRepository.send(groupId, senderId, senderName, text, fileUrl, fileType),

  // ── Storage ───────────────────────────────────────────────────────────────

  uploadFile: (storagePath, localUri) => messageRepository.uploadFile(storagePath, localUri),
};

export { app, auth, db, storage, mockAuth, mockDb };
export const isUsingMock = false;
