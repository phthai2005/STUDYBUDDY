import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  setDoc,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../models/CollectionNames";
import { buildGroup } from "../models/GroupModel";

/**
 * Repository thao tác với collection `groups`.
 */
class GroupRepository {
  /** Lấy tất cả groups */
  async getAll() {
    const snap = await getDocs(collection(db, COLLECTIONS.GROUPS));
    return snap.docs.map((d) => buildGroup({ groupId: d.id, ...d.data() }));
  }

  /** Lấy các groups mà user là thành viên */
  async getByMember(uid) {
    const all = await this.getAll();
    return all.filter((g) => g.members.includes(uid));
  }

  /** Tạo group mới, trả về group kèm groupId */
  async create(data) {
    const payload = buildGroup(data);
    // Bỏ groupId rỗng trước khi lưu — Firestore tự sinh ID
    const { groupId: _ignored, ...rest } = payload;
    const ref = await addDoc(collection(db, COLLECTIONS.GROUPS), {
      ...rest,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return buildGroup({ groupId: ref.id, ...rest });
  }

  /** Cập nhật lastMessage sau khi gửi tin */
  async updateLastMessage(groupId, lastMessage) {
    await updateDoc(doc(db, COLLECTIONS.GROUPS, groupId), {
      lastMessage,
      updatedAt: Timestamp.now(),
    });
  }

  /** Xóa group */
  async deleteGroup(groupId) {
    await deleteDoc(doc(db, COLLECTIONS.GROUPS, groupId));
  }

  /** Rời group */
  async leaveGroup(groupId, userId) {
    const groupRef = doc(db, COLLECTIONS.GROUPS, groupId);
    const { getDoc } = require("firebase/firestore");
    const snap = await getDoc(groupRef);
    if (snap.exists()) {
      const data = snap.data();
      const currentMembers = data.members || [];
      const newMembers = currentMembers.filter((id) => id !== userId);

      if (newMembers.length === 0) {
        // Nếu không còn ai, xóa nhóm luôn
        await this.deleteGroup(groupId);
      } else {
        await updateDoc(groupRef, { members: newMembers });
      }
    }
  }
}

export const groupRepository = new GroupRepository();
