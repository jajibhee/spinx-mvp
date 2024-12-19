import { Availability } from '@/types';

export const defaultAvailability: Availability = {
  weekdays: {
    monday: { available: false },
    tuesday: { available: false },
    wednesday: { available: false },
    thursday: { available: false },
    friday: { available: false },
    saturday: { available: false },
    sunday: { available: false }
  },
  preferredTimes: 'flexible',
  notes: ''
}; 