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
    type: 'tennis',
    location: 'Local Court',
    members: 25
  },
  {
    id: 1,
    name: 'Tennis Tribe DTX',
    type: 'tennis',
    location: 'Local Court',
    members: 10
  }
  // Add more mock groups as needed
]; 