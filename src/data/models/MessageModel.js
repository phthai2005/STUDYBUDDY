export const MessageModel = {
  messageId: '',
  groupId: '',
  senderId: '',
  senderName: '',
  text: '',
  fileUrl: null,
  fileType: 'text',
  timestamp: null
};

export function buildMessage(data = {}) {
  return {
    messageId: data.messageId || '',
    groupId: data.groupId || '',
    senderId: data.senderId || '',
    senderName: data.senderName || '',
    text: data.text || '',
    fileUrl: data.fileUrl ?? null,
    fileType: data.fileType || 'text',
    timestamp: data.timestamp || Date.now()
  };
}
