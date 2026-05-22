import {
  collection, doc, addDoc, getDocs,
  updateDoc, setDoc, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from '../models/CollectionNames';
import { buildGroup } from '../models/GroupModel';

/**
 * Repository thao tác với collection `groups`.
 */
class GroupRepository {
  /** Lấy tất cả groups */
  async getAll() {
    const snap = await getDocs(collection(db, COLLECTIONS.GROUPS));
    return snap.docs.map(d => buildGroup({ groupId: d.id, ...d.data() }));
  }

  /** Lấy các groups mà user là thành viên */
  async getByMember(uid) {
    const all = await this.getAll();
    return all.filter(g => g.members.includes(uid));
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
}

export const groupRepository = new GroupRepository();
