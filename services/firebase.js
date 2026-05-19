import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CẤU HÌNH FIREBASE CỦA BẠN (Thay thế bằng cấu hình thực tế từ Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDIEBU4NMBgXGDehLF7WZfcwcqehCMDzUI",
  authDomain: "studybuddy-8a2fc.firebaseapp.com",
  projectId: "studybuddy-8a2fc",
  storageBucket: "studybuddy-8a2fc.firebasestorage.app",
  messagingSenderId: "964068658871",
  appId: "1:964068658871:web:05c80592e110c18d710732",
  measurementId: "G-KSV6YZ6F0F"
};

let app, auth, db;
let isUsingMock = false;

// Kiểm tra xem cấu hình có hợp lệ không
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Cấu hình Auth duy trì phiên đăng nhập bằng AsyncStorage
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    
    db = getFirestore(app);
    console.log("🔥 Đã kết nối thành công với Firebase thực tế.");
  } catch (error) {
    console.error("Lỗi khi kết nối Firebase:", error);
    isUsingMock = true;
  }
} else {
  console.log("⚠️ Cảnh báo: Đang sử dụng Mock Database để chạy demo (Chưa cấu hình Firebase API Key).");
  isUsingMock = true;
}

// ==========================================
// MOCK DATABASE & AUTHENTICATION FOR DEMO
// ==========================================
class MockAuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    // Gửi trạng thái hiện tại ngay lập tức
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  async signInWithEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password) {
          reject(new Error("Email và mật khẩu không được trống."));
          return;
        }
        
        const mockUser = {
          uid: "mock_user_" + email.replace(/[^a-zA-Z0-9]/g, ""),
          name: email.split('@')[0].toUpperCase(),
          email: email,
          courses: ["CS101", "MATH201"],
          schedule: {
            "Monday": ["morning"],
            "Wednesday": ["afternoon"],
            "Friday": ["morning", "afternoon"]
          },
          location: {
            latitude: 21.0056,
            longitude: 105.8433
          }
        };
        
        this.currentUser = mockUser;
        this.notifyListeners();
        resolve({ user: mockUser });
      }, 1000);
    });
  }

  async createUserWithEmailAndPassword(email, password, name = "Sinh Viên Mới") {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password) {
          reject(new Error("Email và mật khẩu không được trống."));
          return;
        }
        
        const mockUser = {
          uid: "mock_user_" + Date.now(),
          name: name,
          email: email,
          courses: [],
          schedule: {
            "Monday": [], "Tuesday": [], "Wednesday": [], 
            "Thursday": [], "Friday": [], "Saturday": [], "Sunday": []
          },
          location: null
        };
        
        this.currentUser = mockUser;
        this.notifyListeners();
        resolve({ user: mockUser });
      }, 1200);
    });
  }

  async signOut() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = null;
        this.notifyListeners();
        resolve();
      }, 800);
    });
  }
}

class MockFirestoreService {
  constructor() {
    // Tạo sẵn một số sinh viên mẫu khác để làm Match Buddy
    this.store = {
      users: [
        {
          uid: "sv_hung",
          name: "Lê Quốc Hùng",
          email: "hung.lq@student.edu.vn",
          avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop",
          courses: ["CS101", "MATH201"],
          schedule: {
            "Monday": ["morning"],
            "Wednesday": ["afternoon"],
            "Friday": ["morning"]
          },
          location: {
            latitude: 21.0062, // Khoảng cách ~100m tại Bách Khoa HN
            longitude: 105.8430
          },
          rating: 4.9,
          ratingCount: 8
        },
        {
          uid: "sv_linh",
          name: "Trần Mai Linh",
          email: "linh.tm@student.edu.vn",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop",
          courses: ["MATH201", "PHY102"],
          schedule: {
            "Tuesday": ["afternoon"],
            "Wednesday": ["afternoon"],
            "Friday": ["afternoon"]
          },
          location: {
            latitude: 21.0085, // Khoảng cách ~400m
            longitude: 105.8455
          },
          rating: 4.7,
          ratingCount: 12
        },
        {
          uid: "sv_dat",
          name: "Phạm Tiến Đạt",
          email: "dat.pt@student.edu.vn",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop",
          courses: ["CS101", "PHY102"],
          schedule: {
            "Monday": ["afternoon"],
            "Wednesday": ["morning"],
            "Friday": ["afternoon"]
          },
          location: {
            latitude: 21.0120, // Khoảng cách ~800m
            longitude: 105.8402
          },
          rating: 4.5,
          ratingCount: 5
        }
      ],
      study_groups: [
        {
          groupId: "group_math201",
          name: "Nhóm Ôn Tập Giải Tích 2",
          courseId: "MATH201",
          members: ["sv_hung", "sv_linh"],
          lastMessage: {
            text: "Chào mọi người, tuần này ôn tập chương 4 nhé!",
            senderName: "Lê Quốc Hùng",
            timestamp: Date.now() - 3600000
          }
        }
      ],
      messages: {
        "group_math201": [
          {
            messageId: "m1",
            senderId: "sv_hung",
            senderName: "Lê Quốc Hùng",
            text: "Chào mọi người, tuần này ôn tập chương 4 nhé!",
            timestamp: Date.now() - 3600000
          },
          {
            messageId: "m2",
            senderId: "sv_linh",
            senderName: "Trần Mai Linh",
            text: "Ok cậu, tớ đã tải lên đề cương ôn tập dạng PDF trong mục tài liệu rồi đó.",
            timestamp: Date.now() - 1800000
          }
        ]
      },
      meetings: [
        {
          meetingId: "meet_1",
          groupId: "group_math201",
          title: "Họp nhóm chương 4 - Tích phân bội",
          description: "Offline tại Phòng tự học Thư viện Tạ Quang Bửu. Nhớ mang theo tài liệu giảng đường.",
          dateTime: Date.now() + 86400000, // Ngày mai
          locationName: "Thư viện Tạ Quang Bửu - HUST",
          coordinates: {
            latitude: 21.0056,
            longitude: 105.8433
          },
          createdById: "sv_hung"
        }
      ],
      peer_reviews: []
    };
    this.chatListeners = {};
  }

  async getCollection(colName) {
    return this.store[colName] || [];
  }

  async addDocument(colName, docData) {
    const id = "doc_" + Date.now();
    const newDoc = { id, ...docData };
    if (!this.store[colName]) {
      this.store[colName] = [];
    }
    this.store[colName].push(newDoc);
    return newDoc;
  }

  async updateDocument(colName, docId, updateData) {
    if (this.store[colName]) {
      this.store[colName] = this.store[colName].map(item => {
        const idField = colName === 'users' ? 'uid' : colName === 'study_groups' ? 'groupId' : 'id';
        if (item[idField] === docId) {
          return { ...item, ...updateData };
        }
        return item;
      });
    }
  }

  // Giả lập Real-time Chat Listener
  subscribeToChat(groupId, callback) {
    if (!this.chatListeners[groupId]) {
      this.chatListeners[groupId] = [];
    }
    this.chatListeners[groupId].push(callback);

    // Trả về dữ liệu ban đầu
    const initialMessages = this.store.messages[groupId] || [];
    callback(initialMessages);

    // Trả về hàm Unsubscribe
    return () => {
      this.chatListeners[groupId] = this.chatListeners[groupId].filter(l => l !== callback);
    };
  }

  async sendMessage(groupId, senderId, senderName, text, fileUrl = null, fileType = 'text') {
    const newMessage = {
      messageId: "msg_" + Date.now(),
      senderId,
      senderName,
      text,
      fileUrl,
      fileType,
      timestamp: Date.now()
    };

    if (!this.store.messages[groupId]) {
      this.store.messages[groupId] = [];
    }
    this.store.messages[groupId].push(newMessage);

    // Cập nhật tin nhắn cuối cùng của nhóm
    this.updateDocument('study_groups', groupId, {
      lastMessage: {
        text: fileType === 'text' ? text : `[Chia sẻ ${fileType.toUpperCase()}]`,
        senderName,
        timestamp: Date.now()
      }
    });

    // Kích hoạt các Subscriber
    if (this.chatListeners[groupId]) {
      this.chatListeners[groupId].forEach(callback => callback(this.store.messages[groupId]));
    }

    return newMessage;
  }
}

const mockAuth = new MockAuthService();
const mockDb = new MockFirestoreService();

export { app, auth, db, isUsingMock, mockAuth, mockDb };
