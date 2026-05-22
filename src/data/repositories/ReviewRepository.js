import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from '../models/CollectionNames';
import { buildReview } from '../models/ReviewModel';
import { userRepository } from './UserRepository';

/**
 * Repository thao tác với collection `reviews`.
 * Tự động cập nhật rating của reviewee sau mỗi lần submit.
 */
class ReviewRepository {
  /**
   * Tạo đánh giá mới và cập nhật rating trung bình của người được đánh giá.
   * @returns {Object} review đã lưu kèm reviewId
   */
  async create(data) {
    const review = buildReview(data);
    const { reviewId: _ignored, ...payload } = review;
    const ref = await addDoc(collection(db, COLLECTIONS.REVIEWS), {
      ...payload,
      createdAt: Timestamp.now(),
    });

    // Cập nhật rolling average rating cho reviewee
    await userRepository.updateRating(review.revieweeId, review.rating);

    return buildReview({ reviewId: ref.id, ...payload });
  }

  /** Lấy tất cả reviews của một group */
  async getByGroup(groupId) {
    const q = query(
      collection(db, COLLECTIONS.REVIEWS),
      where('groupId', '==', groupId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => buildReview({ reviewId: d.id, ...d.data() }));
  }

  /** Lấy tất cả reviews mà một user nhận được */
  async getByReviewee(revieweeId) {
    const q = query(
      collection(db, COLLECTIONS.REVIEWS),
      where('revieweeId', '==', revieweeId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => buildReview({ reviewId: d.id, ...d.data() }));
  }
}

export const reviewRepository = new ReviewRepository();
