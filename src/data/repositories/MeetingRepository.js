import {
  collection, addDoc, getDocs,
  query, where, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from '../models/CollectionNames';
import { buildMeeting } from '../models/MeetingModel';

/**
 * Repository thao tác với collection `meetings`.
 */
class MeetingRepository {
  /** Tạo cuộc họp mới, trả về meeting kèm meetingId */
  async create(data) {
    const meeting = buildMeeting(data);
    const { meetingId: _ignored, ...payload } = meeting;
    const ref = await addDoc(collection(db, COLLECTIONS.MEETINGS), {
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return buildMeeting({ meetingId: ref.id, ...payload });
  }

  /** Lấy tất cả meetings của một group */
  async getByGroup(groupId) {
    const q = query(
      collection(db, COLLECTIONS.MEETINGS),
      where('groupId', '==', groupId)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => buildMeeting({ meetingId: d.id, ...d.data() }))
      .sort((a, b) => (a.dateTime || 0) - (b.dateTime || 0));
  }
}

export const meetingRepository = new MeetingRepository();
