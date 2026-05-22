export const ReviewModel = {
  reviewId: '',
  groupId: '',
  reviewerId: '',
  revieweeId: '',
  rating: 0,
  comment: '',
  timestamp: null
};

export function buildReview(data = {}) {
  return {
    reviewId: data.reviewId || '',
    groupId: data.groupId || '',
    reviewerId: data.reviewerId || '',
    revieweeId: data.revieweeId || '',
    rating: data.rating ?? 0,
    comment: data.comment || '',
    timestamp: data.timestamp || Date.now()
  };
}
