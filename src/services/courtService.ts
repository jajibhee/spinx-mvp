/// <reference types="@types/google.maps" />

import axios from 'axios';
import { Sport } from '@/types';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const SEARCH_RADIUS = 10000; // 10km or about 6.2 miles
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const REQUESTS_PER_DAY = 950; // Stay under 1000 daily limit

interface CacheItem {
  data: any;
  timestamp: number;
}

const cache: { [key: string]: CacheItem } = {};
let dailyRequests = 0;
let lastReset = Date.now();

interface CourtDetails {
  id: string;
  name: string;
  location: string;
  type: Sport;
  distance: number; // Store actual number for sorting
  distanceText: string; // Formatted distance for display
  rating: number;
  numberOfCourts: number;
  photo?: string;
  url?: string;
  openingHours?: string[];
  phoneNumber?: string;
  isIndoor: boolean;
  isFree: boolean;
  priceInfo?: string;
  placeDetails: any;
}

const determinePriceInfo = (place: google.maps.places.PlaceResult): { isFree: boolean; priceInfo?: string } => {
  const types = place.types || [];
  const name = place.name?.toLowerCase() || '';
  const vicinity = place.vicinity?.toLowerCase() || '';

  // Check if it's likely a free public court
  if (
    types.includes('park') || 
    types.includes('city_hall') ||
    name.includes('public') ||
    name.includes('community') ||
    vicinity.includes('park')
  ) {
    return { isFree: true };
  }

  // Check if it's likely a paid facility
  if (
    types.includes('gym') ||
    types.includes('health') ||
    name.includes('club') ||
    name.includes('fitness') ||
    name.includes('center')
  ) {
    return { 
      isFree: false, 
      priceInfo: 'Membership/Fee Required'
    };
  }

  return { isFree: false, priceInfo: 'Call for rates' };
};

const determineVenueType = (place: google.maps.places.PlaceResult, details: google.maps.places.PlaceResult | null): boolean => {
  const types = details?.types || place.types || [];
  const name = place.name?.toLowerCase() || '';
  const vicinity = place.vicinity?.toLowerCase() || '';

  // Check for indoor indicators
  const indoorKeywords = [
    'gym', 'fitness', 'club', 'center', 'centre', 'indoor',
    'recreation', 'athletic', 'sportsplex', 'complex'
  ];

  // Check for outdoor indicators
  const outdoorKeywords = [
    'park', 'public', 'outdoor', 'municipal', 'playground',
    'recreation area', 'community park'
  ];

  // Check name and vicinity for indoor keywords
  const hasIndoorIndicator = indoorKeywords.some(keyword => 
    name.includes(keyword) || vicinity.includes(keyword)
  );

  // Check name and vicinity for outdoor keywords
  const hasOutdoorIndicator = outdoorKeywords.some(keyword => 
    name.includes(keyword) || vicinity.includes(keyword)
  );

  // If we have both indicators, prefer indoor
  if (hasIndoorIndicator) return true;
  if (hasOutdoorIndicator) return false;

  // Default cases based on types
  if (types.includes('gym') || types.includes('health')) return true;
  if (types.includes('park')) return false;

  // If we can't determine, assume outdoor
  return false;
};

export const searchNearbyCourts = async (
  latitude: number,
  longitude: number,
  sport: 'tennis' | 'pickleball'
) => {
  const cacheKey = `${latitude}-${longitude}-${sport}`;

  // Check cache
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
    return cache[cacheKey].data;
  }

  return new Promise((resolve, reject) => {
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      location: new google.maps.LatLng(latitude, longitude),
      radius: SEARCH_RADIUS,
      keyword: sport === 'tennis' ? 'tennis courts near' : 'pickleball courts near',
      type: 'establishment'
    };

    console.log('Searching for courts with params:', {
      lat: latitude,
      lng: longitude,
      radius: SEARCH_RADIUS,
      sport
    });

    service.nearbySearch(request, async (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const detailedCourts = await Promise.all(results.map(async place => {
          return new Promise<CourtDetails>((resolveDetails) => {
            service.getDetails(
              { placeId: place.place_id!, fields: ['opening_hours', 'formatted_phone_number', 'photos', 'types', 'price_level'] },
              (details) => {
                const isIndoor = determineVenueType(place, details) ?? false;

                const actualDistance = calculateDistance(
                  latitude,
                  longitude,
                  place.geometry?.location?.lat() || 0,
                  place.geometry?.location?.lng() || 0
                );

                const priceInfo = determinePriceInfo(place);

                return resolveDetails({
                  id: place.place_id!,
                  name: place.name!,
                  location: place.vicinity ?? 'Location not available',
                  type: sport,
                  distance: actualDistance.value,
                  distanceText: actualDistance.text,
                  rating: place.rating || 0,
                  numberOfCourts: estimateCourtCount(place),
                  photo: details?.photos?.[0]?.getUrl({ maxWidth: 500 }),
                  url: place.url ?? `https://maps.google.com/maps?q=place_id:${place.place_id}`,
                  openingHours: details?.opening_hours?.weekday_text || [],
                  phoneNumber: details?.formatted_phone_number,
                  isIndoor,
                  ...priceInfo,
                  placeDetails: place
                });
              }
            );
          });
        }));

        // Sort courts by actual distance
        const courts = (await Promise.all(detailedCourts))
          .sort((a, b) => a.distance - b.distance);

        console.log('Processed courts data:', courts);

        // Cache and resolve
        cache[cacheKey] = {
          data: courts,
          timestamp: Date.now()
        };

        resolve(courts);
      } else {
        console.error('Places API Status:', status);
        reject(new Error('Failed to fetch courts'));
      }
    });
  });
};

// Update distance calculation to return both value and text
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return {
    value: d,
    text: `${d.toFixed(1)} miles`
  };
};

const toRad = (value: number) => value * Math.PI / 180;

const estimateCourtCount = (place: any) => {
  // This is a rough estimate based on the size of the place
  // You might want to refine this or get actual data if available
  if (place.types.includes('stadium')) return 8;
  if (place.types.includes('park')) return 4;
  return 2;
}; 