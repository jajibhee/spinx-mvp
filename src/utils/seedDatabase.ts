import { db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Player, Group } from '@/types';

const MOCK_USERS: Player[] = [
  {
    id: 'user1',
    name: 'Alex Thompson',
    displayName: 'Alex Thompson',
    email: 'alex@example.com',
    photoURL: null,
    bio: 'Tennis enthusiast looking for regular partners',
    level: 'Intermediate',
    sports: ['tennis', 'pickleball'],
    zipCode: '75001',
    phoneNumber: '',
    distance: '0.8 miles',
    createdAt: new Date().toISOString(),
    onboardingCompleted: true,
    availability: {
      weekdays: {
        monday: { available: true, timeRanges: [{ start: '18:00', end: '21:00' }] },
        tuesday: { available: false },
        wednesday: { available: true, timeRanges: [{ start: '18:00', end: '21:00' }] },
        thursday: { available: false },
        friday: { available: true, timeRanges: [{ start: '18:00', end: '21:00' }] },
        saturday: { available: true, timeRanges: [{ start: '09:00', end: '17:00' }] },
        sunday: { available: true, timeRanges: [{ start: '09:00', end: '17:00' }] }
      },
      preferredTimes: 'evening',
      notes: 'Available weekday evenings and weekends'
    }
  },
  {
    id: 'user2',
    name: 'Sarah Chen',
    displayName: 'Sarah Chen',
    email: 'sarah@example.com',
    photoURL: null,
    bio: 'Early bird player, looking for morning matches',
    level: 'Advanced',
    sports: ['tennis'],
    zipCode: '75002',
    phoneNumber: '',
    distance: '1.2 miles',
    createdAt: new Date().toISOString(),
    onboardingCompleted: true,
    availability: {
      weekdays: {
        monday: { available: true, timeRanges: [{ start: '06:00', end: '09:00' }] },
        tuesday: { available: true, timeRanges: [{ start: '06:00', end: '09:00' }] },
        wednesday: { available: true, timeRanges: [{ start: '06:00', end: '09:00' }] },
        thursday: { available: true, timeRanges: [{ start: '06:00', end: '09:00' }] },
        friday: { available: true, timeRanges: [{ start: '06:00', end: '09:00' }] },
        saturday: { available: false },
        sunday: { available: false }
      },
      preferredTimes: 'morning',
      notes: 'Early bird player, prefer morning matches'
    }
  },
  // ... add more mock users with similar structure
];

const MOCK_GROUPS: Group[] = [
  {
    id: 'group1',
    name: 'Dallas Tennis Club',
    sport: 'tennis',
    location: 'Fretz Tennis Center',
    members: [
      { id: 'user1', name: 'Alex Thompson' },
      { id: 'user2', name: 'Sarah Chen' }
    ],
    memberCount: 25,
    lastActive: new Date().toISOString()
  },
  {
    id: 'group2',
    name: 'Pickleball Pros',
    sport: 'pickleball',
    location: 'Lifetime Fitness',
    members: [
      { id: 'user1', name: 'Alex Thompson' }
    ],
    memberCount: 15,
    lastActive: new Date().toISOString()
  }
];

export const seedDatabase = async () => {
  try {
    // Seed Users
    const usersPromises = MOCK_USERS.map(user => 
      setDoc(doc(db, 'users', user.id), user)
    );

    // Seed Groups
    const groupsPromises = MOCK_GROUPS.map(group => 
      setDoc(doc(db, 'groups', group.id.toString()), group)
    );

    await Promise.all([...usersPromises, ...groupsPromises]);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}; 