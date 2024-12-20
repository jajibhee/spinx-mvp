import axios from 'axios';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
console.log('API Key loaded:', !!GOOGLE_API_KEY);

export const getCoordinatesFromZip = async (zipCode: string) => {
  try {
    console.log('Fetching coordinates for zip:', zipCode);
    
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&region=us&key=${GOOGLE_API_KEY}`
    );

    console.log('Geocoding response:', response.data);

    if (response.data.status === 'ZERO_RESULTS') {
      throw new Error('No location found for this zip code');
    }

    if (response.data.status !== 'OK') {
      throw new Error(`Geocoding error: ${response.data.status}`);
    }

    if (!response.data.results[0]) {
      throw new Error('Invalid zip code');
    }

    const { lat, lng } = response.data.results[0].geometry.location;
    return { latitude: lat, longitude: lng };
  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response?.status === 403) {
      throw new Error('API key error - please check configuration');
    }
    
    throw new Error(error.message || 'Error geocoding zip code');
  }
}; 