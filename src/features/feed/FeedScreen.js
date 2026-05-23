import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { mockDb } from "../../data/repositories/firebaseRepository";
import { useAuth } from "../auth/AuthContext";

export default function FeedScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [commentText, setCommentText] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await mockDb.getCollection("posts");
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    try {
      const newPost = {
        authorId: user.uid,
        authorName: user.name || "Người dùng",
        content: newPostContent,
      };
      await mockDb.addDocument("posts", newPost);
      setNewPostContent("");
      fetchPosts();
    } catch (e) {
      Alert.alert("Lỗi", "Không thể đăng bài viết");
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    try {
      const comment = {
        authorId: user.uid,
        authorName: user.name || "Người dùng",
        text: commentText,
      };
      await mockDb.addComment(postId, comment);
      setCommentText("");
      setCommentingPostId(null);
      fetchPosts();
    } catch (e) {
      Alert.alert("Lỗi", "Không thể gửi bình luận");
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <Text style={styles.author}>{item.authorName}</Text>
      <Text style={styles.content}>{item.content}</Text>

      <View style={styles.commentsSection}>
        {item.comments && item.comments.length > 0 && (
          <Text style={styles.commentHeader}>
            Bình luận ({item.comments.length}):
          </Text>
        )}
        {item.comments &&
          item.comments.map((c, i) => (
            <View key={i} style={styles.commentItem}>
              <Text style={styles.commentAuthor}>{c.authorName}: </Text>
              <Text style={styles.commentText}>{c.text}</Text>
            </View>
          ))}
      </View>

      {commentingPostId === item.postId ? (
        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Viết bình luận..."
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => handleAddComment(item.postId)}
          >
            <Text style={styles.sendButtonText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.commentButton}
          onPress={() => setCommentingPostId(item.postId)}
        >
          <Text style={styles.commentButtonText}>Bình luận</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Cộng Đồng Học Tập</Text>
        </View>

        <View style={styles.createPostContainer}>
          <TextInput
            style={styles.postInput}
            value={newPostContent}
            onChangeText={setNewPostContent}
            placeholder="Bạn đang tìm sinh viên học cùng môn gì?"
            multiline
          />
          <TouchableOpacity
            style={styles.postButton}
            onPress={handleCreatePost}
          >
            <Text style={styles.postButtonText}>Đăng</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FF9500"
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.postId.toString()}
            renderItem={renderPost}
            contentContainerStyle={styles.listContent}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  header: {
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#DDD",
  },
  title: { fontSize: 20, fontWeight: "bold" },
  createPostContainer: {
    padding: 15,
    backgroundColor: "white",
    marginBottom: 10,
  },
  postInput: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  postButton: {
    backgroundColor: "#FF9500",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  postButtonText: { color: "white", fontWeight: "bold" },
  listContent: { padding: 10 },
  postCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  author: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  content: { fontSize: 14, marginBottom: 15 },
  commentsSection: {
    borderTopWidth: 1,
    borderColor: "#EEE",
    paddingTop: 10,
    marginBottom: 10,
  },
  commentHeader: {
    fontWeight: "600",
    color: "#666",
    marginBottom: 5,
    fontSize: 13,
  },
  commentItem: { flexDirection: "row", marginBottom: 5 },
  commentAuthor: { fontWeight: "bold", fontSize: 13 },
  commentText: { fontSize: 13, flex: 1, color: "#333" },
  commentButton: { marginTop: 10 },
  commentButtonText: { color: "#007AFF", fontWeight: "600" },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonText: { color: "white", fontWeight: "bold" },
});
