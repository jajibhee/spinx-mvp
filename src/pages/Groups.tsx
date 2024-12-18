import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  AvatarGroup,
  Tabs,
  Tab,
  Chip,
  Button,
  Divider
} from '@mui/material';
import { Group as GroupIcon, Person as PersonIcon } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface PlayHistory {
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

interface Group {
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

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const Groups: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Mock data - replace with actual data from your backend
  const myGroups: Group[] = [
    {
      id: 1,
      name: "Tennis Club DTX",
      sport: "tennis",
      memberCount: 25,
      location: "Dallas Tennis Center",
      lastActive: "2 days ago",
      members: [
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Smith" },
        // Add more members...
      ]
    },
    // Add more groups...
  ];

  const playHistory: PlayHistory[] = [
    {
      id: 1,
      date: "2024-03-15",
      location: "Local Court",
      players: [
        { id: 1, name: "Alex Johnson" },
        { id: 2, name: "Sarah Williams" },
      ],
      sport: "tennis"
    },
    // Add more play history...
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderGroupCard = (group: Group) => (
    <Card key={group.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {group.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {group.location}
            </Typography>
            <Chip 
              label={group.sport.charAt(0).toUpperCase() + group.sport.slice(1)}
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`${group.memberCount} members`}
              size="small"
            />
          </Box>
          <Button variant="outlined" size="small">
            View Group
          </Button>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Members
          </Typography>
          <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
            {group.members.map(member => (
              <Avatar key={member.id} src={member.avatar}>
                {member.name.charAt(0)}
              </Avatar>
            ))}
          </AvatarGroup>
        </Box>
      </CardContent>
    </Card>
  );

  const renderPlayHistoryCard = (history: PlayHistory) => (
    <Card key={history.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {new Date(history.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {history.location}
            </Typography>
            <Chip 
              label={history.sport.charAt(0).toUpperCase() + history.sport.slice(1)}
              size="small"
            />
          </Box>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Played with
          </Typography>
          <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
            {history.players.map(player => (
              <Avatar key={player.id} src={player.avatar}>
                {player.name.charAt(0)}
              </Avatar>
            ))}
          </AvatarGroup>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="sm" sx={{ pt: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
        My Groups
      </Typography>

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<GroupIcon />} label="Groups" />
        <Tab icon={<PersonIcon />} label="Play History" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {myGroups.length > 0 ? (
          myGroups.map(renderGroupCard)
        ) : (
          <Typography variant="body1" color="text.secondary" align="center">
            You haven't joined any groups yet
          </Typography>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {playHistory.length > 0 ? (
          playHistory.map(renderPlayHistoryCard)
        ) : (
          <Typography variant="body1" color="text.secondary" align="center">
            No play history yet
          </Typography>
        )}
      </TabPanel>
    </Container>
  );
};

export default Groups;