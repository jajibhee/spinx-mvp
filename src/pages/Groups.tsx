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
  Divider,
  Stack
} from '@mui/material';
import { Group as GroupIcon, Person as PersonIcon } from '@mui/icons-material';
import { Connection, GroupRequest } from '@/types';
import { collection, query, where, orderBy, getDocs, updateDoc, arrayUnion, increment, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Group {
  id: string;
  name: string;
  sport: 'tennis' | 'pickleball';
  memberCount: number;
  location: string;
  lastActive: string;
  members: {
    id: string;
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
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [groupRequests, setGroupRequests] = useState<GroupRequest[]>([]);
  const navigate = useNavigate();

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

  // Add groups fetch
  useEffect(() => {
    if (!currentUser) return;

    const fetchGroups = async () => {
      try {
        const q = query(
          collection(db, 'groups'),
          where('members', 'array-contains', currentUser.uid)
        );

        const snapshot = await getDocs(q);
        setMyGroups(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Group[]);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, [currentUser]);

  // Add group requests fetch
  useEffect(() => {
    if (!currentUser) return;

    const fetchGroupRequests = async () => {
      try {
        const q = query(
          collection(db, 'groupRequests'),
          where('userId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );

        const snapshot = await getDocs(q);
        setGroupRequests(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GroupRequest[]);
      } catch (error) {
        console.error('Error fetching group requests:', error);
      }
    };

    fetchGroupRequests();
  }, [currentUser]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGroupRequest = async (requestId: string, action: 'accept' | 'decline') => {
    if (!currentUser) return;

    try {
      const requestRef = doc(db, 'groupRequests', requestId);
      await updateDoc(requestRef, {
        status: action,
        updatedAt: new Date().toISOString()
      });

      // If accepted, add user to group members
      if (action === 'accept') {
        const request = groupRequests.find(r => r.id === requestId);
        if (request) {
          const groupRef = doc(db, 'groups', request.groupId);
          await updateDoc(groupRef, {
            members: arrayUnion(currentUser.uid),
            memberCount: increment(1)
          });
        }
      }

      // Remove request from list
      setGroupRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error handling group request:', error);
    }
  };

  const renderGroupCard = (group: Group) => (
    <Card key={group.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {group.name || 'Unnamed Group'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {group.location || 'No location set'}
            </Typography>
            <Chip 
              label={group.sport ? group.sport.charAt(0).toUpperCase() + group.sport.slice(1) : 'No sport'}
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`${group.memberCount || 0} members`}
              size="small"
            />
          </Box>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            View Group
          </Button>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Members
          </Typography>
          <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
            {(group.members || []).map(member => (
              <Avatar key={member.id} src={member.avatar}>
                {member.name?.[0]}
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar src={otherPlayerDetails.photoURL || undefined}>
                  {otherPlayerDetails.name[0]}
                </Avatar>
                <Typography variant="subtitle1">
                  {otherPlayerDetails.name}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {otherPlayerDetails.email}
              </Typography>
              {otherPlayerDetails.phoneNumber && (
                <Typography variant="body2" color="text.secondary">
                  {otherPlayerDetails.phoneNumber}
                </Typography>
              )}
              <Chip 
                label={connection.sport.charAt(0).toUpperCase() + connection.sport.slice(1)}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderGroupRequest = (request: GroupRequest) => (
    <Card key={request.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={request.userPhotoURL || undefined}>
              {request.userName[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle1">
                {request.groupName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Request from {request.userName}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleGroupRequest(request.id, 'accept')}
            >
              Accept
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handleGroupRequest(request.id, 'decline')}
            >
              Decline
            </Button>
          </Stack>
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

      {groupRequests.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Group Requests
          </Typography>
          {groupRequests.map(renderGroupRequest)}
        </Box>
      )}
    </Container>
  );
};

export default Groups;