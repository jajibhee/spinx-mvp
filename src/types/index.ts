// types/index.ts
export interface Player {
    id: string;
    name: string;
    displayName: string;
    email: string;
    photoURL: string | null;
    bio: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    sports: Sport[];
    zipCode: string;
    phoneNumber: string;
    availability: Availability;
    distance: string;
    createdAt: string;
    onboardingCompleted: boolean;
  }
  
  export interface Group {
    id: string;
    name: string;
    sport: 'tennis' | 'pickleball';
    memberCount: number;
    location: string;
    lastActive: string;
    members: string[];
    createdBy: string;
    memberDetails?: {
      id: string;
      name: string;
      avatar?: string;
    }[];
    imageUrl?: string;
    description?: string;
    skillLevel?: string;
    tags?: string[];
    schedule?: {
      day: string;
      startTime: string;
      endTime: string;
      recurring: boolean;
    }[];
  }
  
  export interface Court {
    id: string;
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
    id: string;
    date: string;
    location: string;
    players: {
      id: string;
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
  
  export interface Connection {
    id: string;
    players: string[];
    playerDetails: {
      id: string;
      name: string;
      photoURL: string | null;
      email: string;
      phoneNumber?: string;
    }[];
    sport: Sport;
    createdAt: string;
    status: 'active' | 'inactive';
  }
  
  export interface GroupRequest {
    id: string;
    groupId: string;
    groupName: string;
    userId: string;
    userName: string;
    userPhotoURL: string | null;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
  }
  
  export interface Message {
    id: string;
    groupId: string;
    senderId: string;
    senderName: string;
    senderPhotoURL: string | null;
    content: string;
    createdAt: string;
  }