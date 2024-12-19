import { Player, Group, Availability } from '@/types';

const playerAvailability: Availability = {
  weekdays: {
    monday: { 
      available: true,
      timeRanges: [{ start: '18:00', end: '21:00' }]
    },
    tuesday: { available: false },
    wednesday: { 
      available: true,
      timeRanges: [{ start: '18:00', end: '21:00' }]
    },
    thursday: { available: false },
    friday: { 
      available: true,
      timeRanges: [{ start: '18:00', end: '21:00' }]
    },
    saturday: { 
      available: true,
      timeRanges: [{ start: '09:00', end: '17:00' }]
    },
    sunday: { 
      available: true,
      timeRanges: [{ start: '09:00', end: '17:00' }]
    }
  },
  preferredTimes: 'evening',
  notes: 'Available most evenings after work and flexible on weekends'
};

export const NEARBY_PLAYERS: Player[] = [
  {
    id: 'user1',
    name: 'Jaji Bhee',
    displayName: 'Jaji Bhee',
    email: 'jaji@example.com',
    photoURL: null,
    bio: 'Tennis enthusiast',
    level: 'Intermediate',
    sports: ['tennis', 'pickleball'],
    zipCode: '75001',
    phoneNumber: '',
    distance: '0.5 miles',
    createdAt: new Date().toISOString(),
    onboardingCompleted: true,
    availability: {
      ...playerAvailability,
      preferredTimes: 'evening'
    }
  },
  {
    id: 'user2',
    name: 'Dami Baba',
    displayName: 'Dami Baba',
    email: 'dami@example.com',
    photoURL: null,
    bio: 'Early bird player',
    level: 'Intermediate',
    sports: ['tennis', 'pickleball'],
    zipCode: '75002',
    phoneNumber: '',
    distance: '0.5 miles',
    createdAt: new Date().toISOString(),
    onboardingCompleted: true,
    availability: {
      ...playerAvailability,
      preferredTimes: 'morning',
      notes: 'Early bird, prefer morning games before work'
    }
  }
  // Add more mock players as needed
];

export const NEARBY_GROUPS: Group[] = [
  {
    id: 'group1',
    name: 'Tennis Club',
    sport: 'tennis',
    location: 'Local Court',
    members: [{ id: 'user1', name: 'John Doe' }],
    memberCount: 25,
    lastActive: new Date().toISOString()
  },
  {
    id: 'group2',
    name: 'Tennis Tribe DTX',
    sport: 'tennis',
    location: 'Local Court',
    members: [{ id: 'user2', name: 'Jane Doe' }],
    memberCount: 10,
    lastActive: new Date().toISOString()
  }
  // Add more mock groups as needed
]; 