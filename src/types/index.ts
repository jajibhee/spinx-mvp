// types/index.ts
export interface Player {
    id: number;
    name: string;
    sports: Sport[];
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    distance: string;
    availability?: Availability;
  }
  
  export interface Group {
    id: number;
    name: string;
    sport: 'tennis' | 'pickleball';
    memberCount: number;
    location: string;
    lastActive: string;
    members: {
      id: number;
      name: string;
      avatar?: string;
    }[];
  }
  
  export interface Court {
    id: number;
    name: string;
    type: 'tennis' | 'pickleball';
    location: string;
    distance: string;
    rating: number;
    numberOfCourts: number;
    isFavorite?: boolean;
    amenities: string[];
  }
  
  export type Sport = 'tennis' | 'pickleball';
  export type ViewType = 'players' | 'communities';
  export type SportFilter = Sport | 'all';
  
  export interface PlayHistory {
    id: number;
    date: string;
    location: string;
    players: {
      id: number;
      name: string;
      avatar?: string;
    }[];
    sport: 'tennis' | 'pickleball';
  }
  
  export interface Availability {
    weekdays: {
      [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: {
        available: boolean;
        timeRanges?: Array<{
          start: string; // "HH:mm" format
          end: string;
        }>;
      };
    };
    preferredTimes: 'morning' | 'afternoon' | 'evening' | 'flexible';
    notes?: string;
  }
  
  export interface UserProfile {
    displayName: string;
    email: string;
    photoURL: string | null;
    bio: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    sports: Sport[];
    zipCode: string;
    phoneNumber: string;
    availability: Availability;
  }
  
  export interface CreateGroupForm {
    name: string;
    description: string;
    sport: Sport | '';
    location: string;
    primaryCourt?: Court | null;
    skillLevel: 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced' | '';
    maxMembers: number;
    tags: string[];
    groupImage?: File | null;
    imageUrl?: string;
    schedule: {
      day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
      startTime: string;
      endTime: string;
      recurring: boolean;
    }[];
  }