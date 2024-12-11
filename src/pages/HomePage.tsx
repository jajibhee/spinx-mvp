
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  ButtonGroup,
  Card,
  CardContent,
  Avatar,
  Chip
} from '@mui/material';
import { ViewType, SportFilter, Player, Group, Sport } from '@/types';
import { NEARBY_PLAYERS, NEARBY_GROUPS } from '@/data/mockData';

const HomePage: React.FC = () => {
  console.log('Mock Data:', { NEARBY_PLAYERS, NEARBY_GROUPS });
  const [view, setView] = useState<ViewType>('players');
  const [selectedSport, setSelectedSport] = useState<SportFilter>('all');

  const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: ViewType | null) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleSportChange = (sport: SportFilter) => {
    setSelectedSport(sport);
  };

  const renderPlayerCard = (player: Player) => (
    <Card key={player.id}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ width: 48, height: 48 }}>
              {player.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{player.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {player.level} • {player.distance}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                {player.sports.map(sport => (
                  <Chip 
                    key={sport} 
                    label={sport} 
                    size="small" 
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Box>
          <Button variant="contained" color="primary">
            Connect
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderGroupCard = (group: Group) => (
    <Card key={group.id}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">{group.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {group.type.charAt(0).toUpperCase() + group.type.slice(1)} • {group.location}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {group.members} members
            </Typography>
          </Box>
          <Button variant="contained" color="primary">
            Join
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="sm" sx={{ pb: 8, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Near Me
        </Typography>
        <Button variant="contained" color="primary">
          Create Group
        </Button>
      </Box>

      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={handleViewChange}
        fullWidth
        sx={{ mb: 2 }}
      >
        <ToggleButton value="players">Players</ToggleButton>
        <ToggleButton value="communities">Communities</ToggleButton>
      </ToggleButtonGroup>

      <ButtonGroup variant="outlined" sx={{ mb: 3, display: 'flex', gap: 1 }}>
        {(['all', 'tennis', 'pickleball'] as const).map((sport) => (
          <Button
            key={sport}
            variant={selectedSport === sport ? 'contained' : 'outlined'}
            onClick={() => handleSportChange(sport)}
          >
            {sport.charAt(0).toUpperCase() + sport.slice(1)}
          </Button>
        ))}
      </ButtonGroup>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {view === 'players'
          ? NEARBY_PLAYERS
              .filter(player => 
                selectedSport === 'all' || 
                player.sports.includes(selectedSport as Sport)
              )
              .map(renderPlayerCard)
          : NEARBY_GROUPS
              .filter(group => 
                selectedSport === 'all' || 
                group.type === selectedSport
              )
              .map(renderGroupCard)
        }
      </Box>
    </Container>
  );
};

export default HomePage;