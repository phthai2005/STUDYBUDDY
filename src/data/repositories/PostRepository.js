import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

export const postRepository = {
  async getAll() {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ postId: d.id, ...d.data() }));
  },

  async create(data) {
    const ref = await addDoc(collection(db, "posts"), {
      ...data,
      createdAt: Timestamp.now(),
      comments: [],
    });
    return {
      postId: ref.id,
      ...data,
      comments: [],
      createdAt: Timestamp.now(),
    };
  },

  async addComment(postId, comment) {
    const postRef = doc(db, "posts", postId);
    // Note: for this demo we just fetch and update array, in real prod we use arrayUnion
    // But since we want to keep it simple and just do updateDoc
    const { getDoc } = require("firebase/firestore");
    const snap = await getDoc(postRef);
    if (snap.exists()) {
      const data = snap.data();
      const newComments = [
        ...(data.comments || []),
        { ...comment, createdAt: Date.now() },
      ];
      await updateDoc(postRef, { comments: newComments });
      return newComments;
    }
    return [];
  },
};
