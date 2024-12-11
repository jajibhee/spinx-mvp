// types/index.ts
export interface Player {
    id: number;
    name: string;
    sports: Sport[];
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    distance: string;
  }
  
  export interface Group {
    id: number;
    name: string;
    type: Sport;
    members: number;
    location: string;
  }
  
  export interface Court {
    id: number;
    name: string;
    type: Sport;
    location: string;
    distance: string;
  }
  
  export type Sport = 'tennis' | 'pickleball';
  export type ViewType = 'players' | 'communities';
  export type SportFilter = Sport | 'all';