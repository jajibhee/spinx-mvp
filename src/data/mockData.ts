import { Player, Group } from '@/types';

export const NEARBY_PLAYERS: Player[] = [
  {
    id: 1,
    name: 'Jaji Bhee',
    level: 'Intermediate',
    distance: '0.5 miles',
    sports: ['tennis', 'pickleball']
  },
  {
    id: 2,
    name: 'Dami Baba',
    level: 'Intermediate',
    distance: '0.5 miles',
    sports: ['tennis', 'pickleball']
  }
  // Add more mock players as needed
];

export const NEARBY_GROUPS: Group[] = [
  {
    id: 1,
    name: 'Tennis Club',
    sport: 'tennis',
    location: 'Local Court',
    members: [{ id: 1, name: 'John Doe' }],
    memberCount: 25,
    lastActive: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Tennis Tribe DTX',
    sport: 'tennis',
    location: 'Local Court',
    members: [{ id: 2, name: 'Jane Doe' }],
    memberCount: 10,
    lastActive: new Date().toISOString()
  }
  // Add more mock groups as needed
]; 