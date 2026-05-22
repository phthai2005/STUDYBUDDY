export const UserModel = {
  uid: '',
  name: '',
  email: '',
  school: '',
  major: '',
  avatar: '',
  courses: [],
  schedule: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  },
  location: {
    latitude: null,
    longitude: null
  },
  rating: 0,
  ratingCount: 0,
  createdAt: null,
  updatedAt: null
};

export function buildUser(data = {}) {
  return {
    uid: data.uid || '',
    name: data.name || '',
    email: data.email || '',
    school: data.school || '',
    major: data.major || '',
    avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop',
    courses: data.courses || [],
    schedule: {
      Monday: data.schedule?.Monday || [],
      Tuesday: data.schedule?.Tuesday || [],
      Wednesday: data.schedule?.Wednesday || [],
      Thursday: data.schedule?.Thursday || [],
      Friday: data.schedule?.Friday || [],
      Saturday: data.schedule?.Saturday || [],
      Sunday: data.schedule?.Sunday || []
    },
    location: {
      latitude: data.location?.latitude ?? null,
      longitude: data.location?.longitude ?? null
    },
    rating: data.rating ?? 0,
    ratingCount: data.ratingCount ?? 0,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}
