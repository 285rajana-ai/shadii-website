// 💎 Shadii.pk Premium Mock Data System
// Used to populate the UI for a "best of the best" look

export const MOCK_USERS = [
  {
    id: '1',
    name: 'Mahnoor Khan',
    age: 24,
    gender: 'Female',
    city: 'Lahore',
    education: 'Masters in Architecture',
    profession: 'Senior Architect',
    bio: 'Looking for a kind soul who values tradition and growth. I love art galleries and deep conversations.',
    isVerified: true,
    isPremium: true,
    isOnline: true,
    photos: [
      'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
    ],
    details: {
      height: '5\'6"',
      cast: 'Arain',
      sect: 'Sunni',
      maritalStatus: 'Never Married',
      motherTongue: 'Punjabi',
    }
  },
  {
    id: '2',
    name: 'Zaryab Ahmed',
    age: 29,
    gender: 'Male',
    city: 'Islamabad',
    education: 'MBA from IBA',
    profession: 'Marketing Director',
    bio: 'Family oriented and career driven. Enjoy hiking in Margalla and travel.',
    isVerified: true,
    isPremium: false,
    isOnline: false,
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    ],
    details: {
      height: '6\'0"',
      cast: 'Sheikh',
      sect: 'Sunni',
      maritalStatus: 'Never Married',
      motherTongue: 'Urdu',
    }
  },
  {
    id: '3',
    name: 'Ayesha Malik',
    age: 27,
    gender: 'Female',
    city: 'Karachi',
    education: 'MBBS, FCPS',
    profession: 'Cardiologist',
    bio: 'Dedicated to my profession and looking for a balanced life partner.',
    isVerified: true,
    isPremium: true,
    isOnline: true,
    photos: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    ],
    details: {
      height: '5\'4"',
      cast: 'Syed',
      sect: 'Shia',
      maritalStatus: 'Never Married',
      motherTongue: 'Urdu',
    }
  },
  {
    id: '4',
    name: 'Hamza Lodhi',
    age: 31,
    gender: 'Male',
    city: 'Faisalabad',
    education: 'BSc Textile Engineering',
    profession: 'Business Owner',
    bio: 'Loves sports, business, and good food. Traditional values with a modern outlook.',
    isVerified: false,
    isPremium: true,
    isOnline: false,
    photos: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600',
    ],
    details: {
      height: '5\'11"',
      cast: 'Rajput',
      sect: 'Sunni',
      maritalStatus: 'Divorced',
      motherTongue: 'Punjabi',
    }
  }
];

export const MOCK_CHATS = [
  {
    id: 'chat1',
    user: MOCK_USERS[0],
    lastMessage: 'Sure, that sounds wonderful!',
    time: '2:30 PM',
    unread: 2,
    online: true,
  },
  {
    id: 'chat2',
    user: MOCK_USERS[2],
    lastMessage: 'Salam, how are you today?',
    time: 'Yesterday',
    unread: 0,
    online: false,
  },
];

export const MOCK_MATCHES = [
  { id: 'm1', user: MOCK_USERS[0], compatibility: '94%' },
  { id: 'm2', user: MOCK_USERS[2], compatibility: '88%' },
  { id: 'm3', user: MOCK_USERS[1], compatibility: '82%' },
];
