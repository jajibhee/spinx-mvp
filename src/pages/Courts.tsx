import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  ButtonGroup,
  Button,
  Rating,
  IconButton,
  Divider
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Directions as DirectionsIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';

interface Court {
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

const Courts: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<'all' | 'tennis' | 'pickleball'>('all');

  // Mock data - replace with actual data from your backend
  const nearbyCourts: Court[] = [
    {
      id: 1,
      name: "Samuell Grand Tennis Center",
      type: "tennis",
      location: "6200 East Grand Avenue, Dallas, TX 75223",
      distance: "0.8 miles",
      rating: 4.5,
      numberOfCourts: 12,
      isFavorite: true,
      amenities: ["Lights", "Pro Shop", "Restrooms", "Water"]
    },
    {
      id: 2,
      name: "Pickleball Paradise",
      type: "pickleball",
      location: "1234 Main Street, Dallas, TX 75201",
      distance: "1.2 miles",
      rating: 4.0,
      numberOfCourts: 8,
      isFavorite: false,
      amenities: ["Lights", "Restrooms", "Water"]
    },
    // Add more courts...
  ];

  const filteredCourts = selectedSport === 'all' 
    ? nearbyCourts 
    : nearbyCourts.filter(court => court.type === selectedSport);

  const handleDirections = (location: string) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`);
  };

  const renderCourtCard = (court: Court) => (
    <Card key={court.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" gutterBottom>
                {court.name}
              </Typography>
              <IconButton size="small">
                {court.isFavorite ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                {court.distance}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Rating value={court.rating} precision={0.5} size="small" readOnly />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip 
                label={court.type.charAt(0).toUpperCase() + court.type.slice(1)}
                size="small"
              />
              <Chip 
                label={`${court.numberOfCourts} courts`}
                size="small"
              />
              {court.amenities.map((amenity, index) => (
                <Chip 
                  key={index}
                  label={amenity}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                {court.location}
              </Typography>
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => handleDirections(court.location)}
              >
                <DirectionsIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="sm" sx={{ pt: 2, pb: 8 }}>
      <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
        Nearby Courts
      </Typography>

      <ButtonGroup 
        variant="outlined" 
        fullWidth 
        sx={{ mb: 3 }}
      >
        {(['all', 'tennis', 'pickleball'] as const).map((sport) => (
          <Button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            variant={selectedSport === sport ? 'contained' : 'outlined'}
          >
            {sport === 'all' ? 'All Courts' : sport.charAt(0).toUpperCase() + sport.slice(1)}
          </Button>
        ))}
      </ButtonGroup>

      {filteredCourts.length > 0 ? (
        filteredCourts.map(renderCourtCard)
      ) : (
        <Typography variant="body1" color="text.secondary" align="center">
          No courts found nearby
        </Typography>
      )}
    </Container>
  );
};

export default Courts;