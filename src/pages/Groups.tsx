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
  Alert,
  CircularProgress,
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

const styles = {
  container: {
    pb: 8, 
    pt: 7,
    px: { xs: 2, sm: 3 },
    maxWidth: '600px'
  },
  header: {
    mb: 3,
    position: 'sticky',
    top: 56,
    backgroundColor: 'background.default',
    zIndex: 1100,
    py: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: 'primary.main'
  },
  tabs: {
    '& .MuiTab-root': {
      textTransform: 'none',
      minHeight: 48,
      fontSize: '0.95rem',
      fontWeight: 500
    }
  },
  card: {
    mb: 2,
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    '&:hover': {
      transform: 'translateY(-2px)',
      transition: 'transform 0.2s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
    }
  },
  cardContent: {
    p: 2.5,
    '&:last-child': { pb: 2.5 }
  },
  groupInfo: {
    display: 'flex',
    gap: 2,
    alignItems: 'flex-start'
  },
  groupAvatar: {
    width: 56,
    height: 56,
    bgcolor: 'primary.main'
  },
  groupDetails: {
    flex: 1
  },
  groupName: {
    fontWeight: 600,
    fontSize: '1.1rem',
    mb: 0.5
  },
  groupMeta: {
    color: 'text.secondary',
    fontSize: '0.9rem',
    mb: 1
  },
  chipGroup: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap',
    mt: 1
  },
  memberSection: {
    mt: 2,
    pt: 2,
    borderTop: 1,
    borderColor: 'divider'
  },
  actionButton: {
    borderRadius: 6,
    textTransform: 'none',
    px: 2
  },
  emptyState: {
    textAlign: 'center',
    py: 6,
    px: 2
  },
  connectionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 2
  }
} as const;

const Groups: React.FC = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
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
        setLoading(true);
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
      } finally {
        setLoading(false);
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
    <Card key={group.id} sx={styles.card}>
      <CardContent sx={styles.cardContent}>
        <Box sx={styles.groupInfo}>
          <Avatar sx={styles.groupAvatar}>
            {group.name[0]}
          </Avatar>
          <Box sx={styles.groupDetails}>
            <Typography sx={styles.groupName}>
              {group.name}
            </Typography>
            <Typography sx={styles.groupMeta}>
              {group.location}
            </Typography>
            <Box sx={styles.chipGroup}>
              <Chip 
                label={group.sport.charAt(0).toUpperCase() + group.sport.slice(1)}
                size="small"
                color="primary"
              />
              <Chip 
                label={`${group.memberCount} members`}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
          <Button 
            variant="outlined"
            size="small"
            sx={styles.actionButton}
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            View
          </Button>
        </Box>

        <Box sx={styles.memberSection}>
          <AvatarGroup 
            max={4} 
            sx={{ 
              justifyContent: 'flex-start',
              '& .MuiAvatar-root': { width: 32, height: 32 }
            }}
          >
            {group.members.map(member => (
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
      <Card key={connection.id} sx={styles.card}>
        <CardContent sx={styles.cardContent}>
          <Box sx={styles.connectionCard}>
            <Avatar src={otherPlayerDetails.photoURL || undefined}>
              {otherPlayerDetails.name[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1">
                {otherPlayerDetails.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {otherPlayerDetails.email}
              </Typography>
              {otherPlayerDetails.phoneNumber && (
                <Typography variant="body2" color="text.secondary">
                  {otherPlayerDetails.phoneNumber}
                </Typography>
              )}
            </Box>
            <Chip 
              label={connection.sport}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={styles.container} disableGutters>
      <Box sx={styles.header}>
        <Typography sx={styles.headerTitle}>
          My Groups
        </Typography>
        
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={styles.tabs}
        >
          <Tab 
            icon={<GroupIcon />} 
            label="Groups" 
            iconPosition="start"
          />
          <Tab 
            icon={<PersonIcon />} 
            label="Connections" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          {myGroups.length > 0 ? (
            myGroups.map(group => (
              <Card key={group.id} sx={styles.card}>
                <CardContent sx={styles.cardContent}>
                  <Box sx={styles.groupInfo}>
                    <Avatar sx={styles.groupAvatar}>
                      {group.name[0]}
                    </Avatar>
                    <Box sx={styles.groupDetails}>
                      <Typography sx={styles.groupName}>
                        {group.name}
                      </Typography>
                      <Typography sx={styles.groupMeta}>
                        {group.location}
                      </Typography>
                      <Box sx={styles.chipGroup}>
                        <Chip 
                          label={group.sport.charAt(0).toUpperCase() + group.sport.slice(1)}
                          size="small"
                          color="primary"
                        />
                        <Chip 
                          label={`${group.memberCount} members`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Button 
                      variant="outlined"
                      size="small"
                      sx={styles.actionButton}
                      onClick={() => navigate(`/groups/${group.id}`)}
                    >
                      View
                    </Button>
                  </Box>

                  <Box sx={styles.memberSection}>
                    <AvatarGroup 
                      max={4} 
                      sx={{ 
                        justifyContent: 'flex-start',
                        '& .MuiAvatar-root': { width: 32, height: 32 }
                      }}
                    >
                      {group.members.map(member => (
                        <Avatar key={member.id} src={member.avatar}>
                          {member.name?.[0]}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Box sx={styles.emptyState}>
              <Typography variant="h6" gutterBottom>
                No Groups Yet
              </Typography>
              <Typography color="text.secondary" paragraph>
                Create or join a group to get started
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/create-group')}
                sx={styles.actionButton}
              >
                Create Group
              </Button>
            </Box>
          )}
        </>
      )}

      {tabValue === 1 && (
        <>
          {connections.length > 0 ? (
            connections.map(renderConnectionCard)
          ) : (
            <Box sx={styles.emptyState}>
              <Typography variant="body1">
                No connections yet. Connect with players to get started!
              </Typography>
            </Box>
          )}
        </>
      )}

      {groupRequests.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Group Requests
          </Typography>
          {groupRequests.map(request => (
            <Card key={request.id} sx={styles.card}>
              <CardContent sx={styles.cardContent}>
                <Box sx={styles.connectionCard}>
                  <Avatar src={request.userPhotoURL || undefined}>
                    {request.userName[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">
                      {request.groupName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Request from {request.userName}
                    </Typography>
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
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Groups;