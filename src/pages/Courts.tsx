import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Card, CardContent, Box,
  Chip, Rating, CircularProgress, ToggleButtonGroup,
  ToggleButton, Alert, TextField, Button, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { searchNearbyCourts } from '@/services/courtService';
import { getCoordinatesFromZip } from '@/utils/geocoding';
import { Court, Sport } from '@/types';
import { DirectionsOutlined as DirectionsIcon, Phone as PhoneIcon, AccessTime as TimeIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

// Update Court type to include missing properties
interface ExtendedCourt extends Court {
  distanceText: string;
  isFree: boolean;
  priceInfo?: string;
  isIndoor: boolean;
  photo?: string;
  phoneNumber?: string;
  rating: number;
  numberOfCourts: number;
  location: string;
  openingHours?: string[];
  url?: string;
}

const DALLAS_COORDS = { latitude: 32.7767, longitude: -96.7970 };

const styles = {
  container: {
    pb: 8,
    pt: 2,
    px: { xs: 2, sm: 3 }
  },
  header: {
    mb: 3,
    color: 'primary.main',
    fontWeight: 'bold'
  },
  searchBox: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 1,
    mb: 3
  },
  searchField: {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      borderRadius: 2
    }
  },
  actionButton: {
    borderRadius: 2,
    textTransform: 'none',
    minWidth: { xs: '100%', sm: 'auto' }
  },
  toggleGroup: {
    mb: 3,
    '& .MuiToggleButton-root': {
      flex: 1,
      py: 1.5,
      textTransform: 'none'
    }
  },
  filterSection: {
    display: 'flex',
    gap: 2,
    mb: 3,
    flexWrap: { xs: 'wrap', sm: 'nowrap' }
  },
  filterControl: {
    flex: 1,
    minWidth: { xs: '100%', sm: 120 }
  },
  courtCard: {
    mb: 2,
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    '&:hover': {
      transform: 'translateY(-2px)',
      transition: 'transform 0.2s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
    }
  },
  courtImage: {
    height: 200,
    mb: 2,
    borderRadius: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  venueChip: {
    position: 'absolute',
    top: 8,
    right: 8
  },
  courtContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  courtInfo: {
    flex: 1
  },
  courtName: {
    fontWeight: 600,
    mb: 0.5
  },
  courtLocation: {
    color: 'text.secondary',
    mb: 1
  },
  phoneNumber: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 1
  },
  chipGroup: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap'
  },
  hoursButton: {
    mt: 2,
    textTransform: 'none',
    color: 'text.secondary'
  },
  hoursList: {
    mt: 1,
    pl: 2
  }
} as const;

const Courts: React.FC = () => {
  const [courts, setCourts] = useState<ExtendedCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSport, setSelectedSport] = useState<Sport>('tennis');
  const [zipCode, setZipCode] = useState('');
  const [currentLocation, setCurrentLocation] = useState(DALLAS_COORDS);
  const [isDefaultLocation, setIsDefaultLocation] = useState(true);
  const [expandedHours, setExpandedHours] = useState<string[]>([]);
  const [venueFilter, setVenueFilter] = useState<'all' | 'indoor' | 'outdoor'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  // Reset filters when changing location or sport
  const resetFilters = () => {
    setVenueFilter('all');
    setPriceFilter('all');
  };

  // Update fetchCourtsForLocation to reset filters
  const fetchCourtsForLocation = async (location: typeof DALLAS_COORDS) => {
    try {
      setLoading(true);
      resetFilters(); // Reset filters when fetching new location
      const nearbyCourts = await searchNearbyCourts(
        location.latitude,
        location.longitude,
        selectedSport
      );
      setCourts(nearbyCourts as ExtendedCourt[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load courts');
    } finally {
      setLoading(false);
    }
  };

  // Update sport change handler
  const handleSportChange = (value: Sport | null) => {
    if (value) {
      setSelectedSport(value);
      resetFilters(); // Reset filters when changing sport
    }
  };

  // Initial load with Dallas courts
  useEffect(() => {
    fetchCourtsForLocation(DALLAS_COORDS);
  }, [selectedSport]);

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode.match(/^\d{5}$/)) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }

    try {
      setLoading(true);
      const coords = await getCoordinatesFromZip(zipCode);
      setCurrentLocation(coords);
      setIsDefaultLocation(false);
      await fetchCourtsForLocation(coords);
    } catch (err) {
      setError('Invalid zip code or error fetching courts');
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCurrentLocation(coords);
        setIsDefaultLocation(false);
        await fetchCourtsForLocation(coords);
      },
      () => {
        setError('Unable to get your location');
      }
    );
  };

  const handleGetDirections = (url: string) => {
    window.open(url, '_blank');
  };

  const toggleHours = (courtId: string) => {
    setExpandedHours(prev => 
      prev.includes(courtId) 
        ? prev.filter(id => id !== courtId)
        : [...prev, courtId]
    );
  };

  const getPriceChipColor = (isFree: boolean, priceInfo?: string) => {
    if (isFree) return 'success';
    if (priceInfo === 'Call for rates') return 'info';
    return 'default';
  };

  const filteredCourts = courts.filter(court => {
    const matchesVenue = 
      venueFilter === 'all' || 
      (venueFilter === 'indoor' && court.isIndoor) ||
      (venueFilter === 'outdoor' && !court.isIndoor);

    const matchesPrice =
      priceFilter === 'all' ||
      (priceFilter === 'free' && court.isFree) ||
      (priceFilter === 'paid' && !court.isFree);

    return matchesVenue && matchesPrice;
  });

  return (
    <Container sx={styles.container}>
      <Typography variant="h5" sx={styles.header}>
        Tennis & Pickleball Courts
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Please Note:
        </Typography>
        <Typography variant="body2">
          • Indoor/Outdoor and pricing information is estimated based on available data
          <br />
          • We recommend calling the venue to confirm court details and availability
          <br />
          • Some facilities may require membership or reservations
        </Typography>
      </Alert>

      {isDefaultLocation && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Currently showing courts in Dallas. Enter your zip code or use your location to see courts near you.
        </Alert>
      )}

      <Box component="form" onSubmit={handleZipSubmit} sx={styles.searchBox}>
        <TextField
          label="Zip Code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Enter zip code"
          size="small"
          sx={styles.searchField}
        />
        <Button 
          type="submit" 
          variant="contained"
          sx={styles.actionButton}
        >
          Search
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleUseCurrentLocation}
          sx={styles.actionButton}
        >
          Use Location
        </Button>
      </Box>

      <ToggleButtonGroup
        value={selectedSport}
        exclusive
        onChange={(_, value) => value && handleSportChange(value)}
        fullWidth
        sx={styles.toggleGroup}
      >
        <ToggleButton value="tennis">Tennis</ToggleButton>
        <ToggleButton value="pickleball">Pickleball</ToggleButton>
      </ToggleButtonGroup>

      <Box sx={styles.filterSection}>
        <FormControl size="small" sx={styles.filterControl}>
          <InputLabel>Venue Type</InputLabel>
          <Select
            value={venueFilter}
            label="Venue Type"
            onChange={(e) => setVenueFilter(e.target.value as typeof venueFilter)}
          >
            <MenuItem value="all">All Venues</MenuItem>
            <MenuItem value="indoor">Indoor Only</MenuItem>
            <MenuItem value="outdoor">Outdoor Only</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={styles.filterControl}>
          <InputLabel>Price</InputLabel>
          <Select
            value={priceFilter}
            label="Price"
            onChange={(e) => setPriceFilter(e.target.value as typeof priceFilter)}
          >
            <MenuItem value="all">All Prices</MenuItem>
            <MenuItem value="free">Free Only</MenuItem>
            <MenuItem value="paid">Paid Only</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        filteredCourts.length === 0 ? (
          <Alert severity="info">
            No courts found matching your filters. Try adjusting your search criteria.
          </Alert>
        ) : (
          filteredCourts.map(court => (
            <Card key={court.id} sx={styles.courtCard}>
              <CardContent>
                {court.photo && (
                  <Box sx={styles.courtImage}>
                    <img 
                      src={court.photo} 
                      alt={court.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <Chip
                      label={court.isIndoor ? 'Indoor' : 'Outdoor'}
                      size="small"
                      color={court.isIndoor ? 'primary' : 'default'}
                      sx={styles.venueChip}
                    />
                  </Box>
                )}
                <Box sx={styles.courtContent}>
                  <Box sx={styles.courtInfo}>
                    <Typography variant="h6" sx={styles.courtName}>
                      {court.name}
                    </Typography>
                    <Typography variant="body2" sx={styles.courtLocation}>
                      {court.location}
                    </Typography>
                    {court.phoneNumber && (
                      <Box sx={styles.phoneNumber}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {court.phoneNumber}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={styles.chipGroup}>
                      <Chip 
                        label={court.distanceText}
                        size="small"
                      />
                      <Chip 
                        label={`${court.numberOfCourts} courts`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip 
                        label={court.isFree ? 'Free' : court.priceInfo}
                        size="small"
                        color={getPriceChipColor(court.isFree, court.priceInfo)}
                        variant={court.isFree ? 'filled' : 'outlined'}
                      />
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<DirectionsIcon />}
                    onClick={() => handleGetDirections(court.url!)}
                    size="small"
                  >
                    Directions
                  </Button>
                </Box>
                {court.openingHours && court.openingHours.length > 0 && (
                  <>
                    <Button
                      size="small"
                      startIcon={<TimeIcon />}
                      endIcon={<ExpandMoreIcon 
                        sx={{ 
                          transform: expandedHours.includes(court.id) ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s'
                        }}
                      />}
                      onClick={() => toggleHours(court.id)}
                      sx={styles.hoursButton}
                    >
                      Opening Hours
                    </Button>
                    {expandedHours.includes(court.id) && (
                      <Box sx={styles.hoursList}>
                        {court.openingHours.map((hours, index) => (
                          <Typography key={index} variant="body2" color="text.secondary">
                            {hours}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )
      )}
    </Container>
  );
};

export default Courts;