export const MeetingModel = {
  meetingId: '',
  groupId: '',
  groupName: '',
  title: '',
  description: '',
  dateTime: '',
  locationName: '',
  coordinates: {
    latitude: null,
    longitude: null
  },
  createdBy: '',
  participants: [],
  createdAt: null,
  updatedAt: null
};

export function buildMeeting(data = {}) {
  return {
    meetingId: data.meetingId || '',
    groupId: data.groupId || '',
    groupName: data.groupName || '',
    title: data.title || '',
    description: data.description || '',
    dateTime: data.dateTime || '',
    locationName: data.locationName || '',
    coordinates: {
      latitude: data.coordinates?.latitude ?? null,
      longitude: data.coordinates?.longitude ?? null
    },
    createdBy: data.createdBy || '',
    participants: data.participants || [],
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}
