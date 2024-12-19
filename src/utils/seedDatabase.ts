import { db } from '@/config/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Player, Group } from '@/types';

const MOCK_PLAYERS: Player[] = [
  {
    id: 1,
    name: 'Alex Thompson',
    level: 'Intermediate',
    distance: '0.8 miles',
    sports: ['tennis', 'pickleball'],
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
    id: 2,
    name: 'Sarah Chen',
    level: 'Advanced',
    distance: '1.2 miles',
    sports: ['tennis'],
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
  {
    id: 3,
    name: 'Mike Rodriguez',
    level: 'Advanced',
    distance: '2.1 miles',
    sports: ['pickleball'],
    availability: {
      weekdays: {
        monday: { available: false },
        tuesday: { available: true, timeRanges: [{ start: '17:00', end: '20:00' }] },
        wednesday: { available: false },
        thursday: { available: true, timeRanges: [{ start: '17:00', end: '20:00' }] },
        friday: { available: false },
        saturday: { available: true, timeRanges: [{ start: '14:00', end: '18:00' }] },
        sunday: { available: true, timeRanges: [{ start: '14:00', end: '18:00' }] }
      },
      preferredTimes: 'afternoon',
      notes: 'Competitive player looking for challenging matches'
    }
  },
  {
    id: 4,
    name: 'Emma Wilson',
    level: 'Beginner',
    distance: '0.5 miles',
    sports: ['tennis', 'pickleball'],
    availability: {
      weekdays: {
        monday: { available: true, timeRanges: [{ start: '12:00', end: '15:00' }] },
        tuesday: { available: true, timeRanges: [{ start: '12:00', end: '15:00' }] },
        wednesday: { available: true, timeRanges: [{ start: '12:00', end: '15:00' }] },
        thursday: { available: true, timeRanges: [{ start: '12:00', end: '15:00' }] },
        friday: { available: true, timeRanges: [{ start: '12:00', end: '15:00' }] },
        saturday: { available: true, timeRanges: [{ start: '10:00', end: '16:00' }] },
        sunday: { available: true, timeRanges: [{ start: '10:00', end: '16:00' }] }
      },
      preferredTimes: 'afternoon',
      notes: 'New to both sports, looking for patient partners'
    }
  },
  {
    id: 5,
    name: 'David Kim',
    level: 'Intermediate',
    distance: '1.5 miles',
    sports: ['tennis'],
    availability: {
      weekdays: {
        monday: { available: true, timeRanges: [{ start: '19:00', end: '22:00' }] },
        tuesday: { available: true, timeRanges: [{ start: '19:00', end: '22:00' }] },
        wednesday: { available: false },
        thursday: { available: true, timeRanges: [{ start: '19:00', end: '22:00' }] },
        friday: { available: false },
        saturday: { available: true, timeRanges: [{ start: '08:00', end: '12:00' }] },
        sunday: { available: false }
      },
      preferredTimes: 'evening',
      notes: 'Looking for consistent hitting partners'
    }
  },
  {
    id: 6,
    name: 'Lisa Martinez',
    level: 'Advanced',
    distance: '3.0 miles',
    sports: ['pickleball'],
    availability: {
      weekdays: {
        monday: { available: false },
        tuesday: { available: false },
        wednesday: { available: false },
        thursday: { available: false },
        friday: { available: false },
        saturday: { available: true, timeRanges: [{ start: '07:00', end: '14:00' }] },
        sunday: { available: true, timeRanges: [{ start: '07:00', end: '14:00' }] }
      },
      preferredTimes: 'morning',
      notes: 'Weekend warrior, former tennis player'
    }
  },
  {
    id: 7,
    name: 'James Lee',
    level: 'Beginner',
    distance: '0.3 miles',
    sports: ['tennis', 'pickleball'],
    availability: {
      weekdays: {
        monday: { available: true, timeRanges: [{ start: '17:00', end: '19:00' }] },
        tuesday: { available: true, timeRanges: [{ start: '17:00', end: '19:00' }] },
        wednesday: { available: true, timeRanges: [{ start: '17:00', end: '19:00' }] },
        thursday: { available: true, timeRanges: [{ start: '17:00', end: '19:00' }] },
        friday: { available: true, timeRanges: [{ start: '17:00', end: '19:00' }] },
        saturday: { available: true, timeRanges: [{ start: '09:00', end: '18:00' }] },
        sunday: { available: true, timeRanges: [{ start: '09:00', end: '18:00' }] }
      },
      preferredTimes: 'flexible',
      notes: 'Enthusiastic beginner, open to both sports'
    }
  },
  {
    id: 8,
    name: 'Rachel Green',
    level: 'Intermediate',
    distance: '1.7 miles',
    sports: ['tennis'],
    availability: {
      weekdays: {
        monday: { available: true, timeRanges: [{ start: '08:00', end: '11:00' }] },
        tuesday: { available: true, timeRanges: [{ start: '08:00', end: '11:00' }] },
        wednesday: { available: true, timeRanges: [{ start: '08:00', end: '11:00' }] },
        thursday: { available: true, timeRanges: [{ start: '08:00', end: '11:00' }] },
        friday: { available: true, timeRanges: [{ start: '08:00', end: '11:00' }] },
        saturday: { available: false },
        sunday: { available: false }
      },
      preferredTimes: 'morning',
      notes: 'Looking for morning tennis partners'
    }
  },
  {
    id: 9,
    name: 'Tom Parker',
    level: 'Advanced',
    distance: '2.5 miles',
    sports: ['tennis', 'pickleball'],
    availability: {
      weekdays: {
        monday: { available: true, timeRanges: [{ start: '18:00', end: '22:00' }] },
        tuesday: { available: true, timeRanges: [{ start: '18:00', end: '22:00' }] },
        wednesday: { available: true, timeRanges: [{ start: '18:00', end: '22:00' }] },
        thursday: { available: true, timeRanges: [{ start: '18:00', end: '22:00' }] },
        friday: { available: true, timeRanges: [{ start: '18:00', end: '22:00' }] },
        saturday: { available: true, timeRanges: [{ start: '10:00', end: '20:00' }] },
        sunday: { available: true, timeRanges: [{ start: '10:00', end: '20:00' }] }
      },
      preferredTimes: 'evening',
      notes: 'Former college player, love both sports'
    }
  },
  {
    id: 10,
    name: 'Sofia Patel',
    level: 'Intermediate',
    distance: '1.0 miles',
    sports: ['pickleball'],
    availability: {
      weekdays: {
        monday: { available: false },
        tuesday: { available: true, timeRanges: [{ start: '16:00', end: '19:00' }] },
        wednesday: { available: false },
        thursday: { available: true, timeRanges: [{ start: '16:00', end: '19:00' }] },
        friday: { available: false },
        saturday: { available: true, timeRanges: [{ start: '11:00', end: '15:00' }] },
        sunday: { available: true, timeRanges: [{ start: '11:00', end: '15:00' }] }
      },
      preferredTimes: 'afternoon',
      notes: 'Pickleball enthusiast, social player'
    }
  }
];

const MOCK_GROUPS: Group[] = [
  {
    id: 1,
    name: 'Dallas Tennis Club',
    sport: 'tennis',
    location: 'Fretz Tennis Center',
    members: [
      { id: 1, name: 'Alex Thompson' },
      { id: 2, name: 'Sarah Chen' },
      { id: 8, name: 'Rachel Green' }
    ],
    memberCount: 25,
    lastActive: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Pickleball Pros',
    sport: 'pickleball',
    location: 'Lifetime Fitness',
    members: [
      { id: 1, name: 'Alex Thompson' },
      { id: 3, name: 'Mike Rodriguez' },
      { id: 6, name: 'Lisa Martinez' }
    ],
    memberCount: 15,
    lastActive: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Morning Tennis League',
    sport: 'tennis',
    location: 'Samuell Grand Tennis Center',
    members: [
      { id: 2, name: 'Sarah Chen' },
      { id: 8, name: 'Rachel Green' }
    ],
    memberCount: 12,
    lastActive: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Weekend Warriors',
    sport: 'pickleball',
    location: 'Richland College Courts',
    members: [
      { id: 6, name: 'Lisa Martinez' },
      { id: 10, name: 'Sofia Patel' }
    ],
    memberCount: 20,
    lastActive: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Mixed Level Tennis',
    sport: 'tennis',
    location: 'SMU Tennis Complex',
    members: [
      { id: 4, name: 'Emma Wilson' },
      { id: 5, name: 'David Kim' },
      { id: 9, name: 'Tom Parker' }
    ],
    memberCount: 30,
    lastActive: new Date().toISOString()
  }
];

export const seedDatabase = async () => {
  try {
    // Seed Players
    const playersPromises = MOCK_PLAYERS.map(player => 
      setDoc(doc(db, 'players', player.id.toString()), player)
    );

    // Seed Groups
    const groupsPromises = MOCK_GROUPS.map(group => 
      setDoc(doc(db, 'groups', group.id.toString()), group)
    );

    await Promise.all([...playersPromises, ...groupsPromises]);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}; 