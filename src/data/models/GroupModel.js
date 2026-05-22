export const GroupModel = {
  groupId: '',
  name: '',
  courseId: '',
  members: [],
  lastMessage: {
    text: '',
    senderName: '',
    timestamp: null
  },
  createdAt: null,
  updatedAt: null
};

export function buildGroup(data = {}) {
  return {
    groupId: data.groupId || '',
    name: data.name || '',
    courseId: data.courseId || '',
    members: data.members || [],
    lastMessage: {
      text: data.lastMessage?.text || '',
      senderName: data.lastMessage?.senderName || '',
      timestamp: data.lastMessage?.timestamp || null
    },
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}
