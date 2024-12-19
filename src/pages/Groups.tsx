import React, { useState, useEffect } from 'react';
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
import { Connection } from '@/types';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [connections, setConnections] = useState<Connection[]>([]);

  console.log('connections', connections);
  // Fetch connections
  useEffect(() => {
    if (!currentUser) return;

    const fetchConnections = async () => {
      try {
        const q = query(
          collection(db, 'connections'),
          where('players', 'array-contains-any', [currentUser.uid]),
          orderBy('lastPlayedAt', 'desc')
        );

        const snapshot = await getDocs(q);
        setConnections(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Connection[]);
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };

    fetchConnections();
  }, [currentUser]);

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

  const renderConnectionCard = (connection: Connection) => {
    const otherPlayerDetails = connection.playerDetails.find(p => p.id !== currentUser?.uid);
    if (!otherPlayerDetails) return null;

    return (
      <Card key={connection.id} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {otherPlayerDetails.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Last played {new Date(connection.lastPlayedAt).toLocaleDateString()}
              </Typography>
              <Chip 
                label={connection.sport.charAt(0).toUpperCase() + connection.sport.slice(1)}
                size="small"
              />
            </Box>
            <Avatar src={otherPlayerDetails.photoURL || undefined}>
              {otherPlayerDetails.name[0]}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    );
  };

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
        <Tab icon={<PersonIcon />} label="Connections" />
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
        {connections.length > 0 ? (
          connections.map(renderConnectionCard)
        ) : (
          <Typography variant="body1" color="text.secondary" align="center">
            No connections yet. Connect with players to get started!
          </Typography>
        )}
      </TabPanel>
    </Container>
  );
};

export default Groups;