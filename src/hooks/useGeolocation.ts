import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  error?: string;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ 
        latitude: 32.7767, // Dallas coordinates as fallback
        longitude: -96.7970,
        error: 'Geolocation is not supported'
      });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        setLocation({
          latitude: 32.7767, // Dallas coordinates as fallback
          longitude: -96.7970,
          error: error.message
        });
        setLoading(false);
      }
    );
  }, []);

  return { location, loading };
}; 