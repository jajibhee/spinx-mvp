import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  Button,
  Divider,
  AvatarGroup,
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Stack,
  TextField
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, query, where, getDocs, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Group, GroupRequest } from '@/types';
import GroupChat from '@/components/GroupChat';
import { useAuth } from '@/contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel">
    {value === index && <Box sx={styles.tabContent}>{children}</Box>}
  </div>
);

interface UserDetails {
  id: string;
  displayName: string;
  photoURL: string | null;
}

const styles = {
  container: {
    pb: 8,
    pt: 2,
    px: { xs: 2, sm: 3 },
    maxWidth: '600px'
  },
  header: {
    position: 'relative',
    mb: 4,
    pb: 3,
    textAlign: 'center'
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0
  },
  avatar: {
    width: 120,
    height: 120,
    mx: 'auto',
    mb: 2,
    border: 3,
    borderColor: 'primary.main'
  },
  chipGroup: {
    display: 'flex',
    gap: 1,
    justifyContent: 'center',
    flexWrap: 'wrap',
    mb: 2
  },
  tabs: {
    borderBottom: 1,
    borderColor: 'divider',
    mb: 3,
    '& .MuiTab-root': {
      textTransform: 'none',
      minHeight: 48,
      fontSize: '0.95rem',
      fontWeight: 500
    }
  },
  infoCard: {
    mb: 3,
    '& .MuiCardContent-root': {
      p: 3
    }
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 2,
    color: 'text.secondary'
  },
  memberList: {
    '& .MuiListItem-root': {
      px: 0,
      py: 1.5
    }
  },
  chatContainer: {
    height: { xs: 'calc(100vh - 200px)', sm: '500px' },
    display: 'flex',
    flexDirection: 'column'
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  messageInput: {
    p: 2,
    borderTop: 1,
    borderColor: 'divider',
    backgroundColor: 'background.paper'
  },
  message: {
    maxWidth: '80%',
    p: 2,
    borderRadius: 2,
    alignSelf: (isMine: boolean) => isMine ? 'flex-end' : 'flex-start',
    backgroundColor: (isMine: boolean) => isMine ? 'primary.main' : 'background.paper',
    color: (isMine: boolean) => isMine ? 'white' : 'text.primary',
    boxShadow: 1
  },
  requestCard: {
    mb: 2,
    '& .MuiCardContent-root': {
      p: 2
    }
  },
  aboutSection: {
    '& p': {
      color: 'text.secondary',
      lineHeight: 1.6
    }
  },
  locationBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 3,
    p: 2,
    bgcolor: 'background.default',
    borderRadius: 1,
    '& .MuiSvgIcon-root': {
      color: 'primary.main'
    }
  },
  tagsSection: {
    mt: 4,
    '& .MuiChip-root': {
      m: 0.5
    }
  },
  memberSection: {
    '& .MuiListItem-root': {
      borderRadius: 1,
      mb: 1,
      '&:hover': {
        bgcolor: 'background.default'
      }
    }
  },
  memberCount: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 3,
    color: 'text.secondary',
    '& .MuiSvgIcon-root': {
      color: 'primary.main'
    }
  },
  scheduleSection: {
    '& .MuiBox-root': {
      p: 2,
      mb: 2,
      bgcolor: 'background.default',
      borderRadius: 1,
      '&:hover': {
        bgcolor: 'action.hover'
      }
    }
  },
  tabContent: {
    px: { xs: 2, sm: 3 },
    py: 3
  }
} as const;

const GroupDetails: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [memberDetails, setMemberDetails] = useState<UserDetails[]>([]);
  const [pendingRequests, setPendingRequests] = useState<GroupRequest[]>([]);
  const [requestSent, setRequestSent] = useState(false);

  const [tabValue, setTabValue] = useState(0);

  const isAdmin = group?.createdBy === currentUser?.uid;
  const isMember = group?.members?.includes(currentUser?.uid || '');

  useEffect(() => {
    if (isAdmin || isMember) {
      setTabValue(3);
    }
  }, [group, currentUser, isAdmin, isMember]);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;
      
      try {
        setLoading(true);
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        
        if (groupDoc.exists()) {
          setGroup({
            id: groupDoc.id,
            ...groupDoc.data()
          } as Group);
        } else {
          setError('Group not found');
        }
      } catch (err) {
        console.error('Error fetching group:', err);
        setError('Failed to load group');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    if (!group?.members) return;

    const fetchMemberDetails = async () => {
      try {
        const userDocs = await Promise.all(
          group.members.map(id => getDoc(doc(db, 'users', id)))
        );

        setMemberDetails(userDocs.map(doc => ({
          id: doc.id,
          displayName: doc.data()?.displayName || 'Unknown User',
          photoURL: doc.data()?.photoURL
        })));
      } catch (error) {
        console.error('Error fetching member details:', error);
      }
    };

    fetchMemberDetails();
  }, [group?.members]);

  useEffect(() => {
    if (!groupId) return;

    const fetchPendingRequests = async () => {
      try {
        const q = query(
          collection(db, 'groupRequests'),
          where('groupId', '==', groupId),
          where('status', '==', 'pending')
        );

        const snapshot = await getDocs(q);
        setPendingRequests(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GroupRequest[]);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchPendingRequests();
  }, [groupId]);

  useEffect(() => {
    if (!currentUser || !groupId) return;

    const checkExistingRequest = async () => {
      const q = query(
        collection(db, 'groupRequests'),
        where('groupId', '==', groupId),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      setRequestSent(!snapshot.empty);
    };

    checkExistingRequest();
  }, [groupId, currentUser]);

  const handleJoin = async () => {
    if (!currentUser || !group || requestSent) return;
    
    try {
      await addDoc(collection(db, 'groupRequests'), {
        groupId: group.id,
        groupName: group.name,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userPhotoURL: currentUser.photoURL,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      
      setRequestSent(true);
    } catch (error) {
      console.error('Failed to send join request:', error);
    }
  };

  const handleRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const requestRef = doc(db, 'groupRequests', requestId);
      await updateDoc(requestRef, { status: action });

      if (action === 'accept' && group) {
        const request = pendingRequests.find(r => r.id === requestId);
        if (request) {
          const groupRef = doc(db, 'groups', group.id);
          await updateDoc(groupRef, {
            members: arrayUnion(request.userId),
            memberCount: increment(1)
          });
        }
      }

      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error handling request:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!group) return <div>Group not found</div>;

  return (
    <Container maxWidth="sm" sx={styles.container}>
      <Paper sx={styles.infoCard}>
        <Box sx={styles.header}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={styles.backButton}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" gutterBottom align="center">
            {group.name}
          </Typography>
          <Box sx={styles.chipGroup}>
            <Chip label={group.sport} />
            <Chip label={group.skillLevel} variant="outlined" />
          </Box>
          {!isMember && (
            <Button
              variant="contained"
              onClick={handleJoin}
              fullWidth
              disabled={requestSent}
            >
              {requestSent ? 'Request Sent' : 'Request to Join'}
            </Button>
          )}
        </Box>

        <Tabs
          value={tabValue}
          onChange={(_e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={styles.tabs}
        >
          <Tab label="About" />
          <Tab label="Members" />
          {group.schedule && <Tab label="Schedule" />}
          {isMember && <Tab label="Chat" />}
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={styles.aboutSection}>
            <Typography variant="body1" paragraph>
              {group.description}
            </Typography>

            <Box sx={styles.locationBox}>
              <LocationIcon />
              <Typography variant="body2">
                {group.location}
              </Typography>
            </Box>

            {group.tags && (
              <Box sx={styles.tagsSection}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -0.5 }}>
                  {group.tags.map(tag => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={styles.memberSection}>
            <Box sx={styles.memberCount}>
              <GroupIcon />
              <Typography variant="subtitle1">
                {group.memberCount || 0} members
              </Typography>
            </Box>

            <List>
              {memberDetails.map(member => (
                <ListItem 
                  key={member.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2
                  }}
                >
                  <Avatar 
                    src={member.photoURL || undefined}
                    sx={{ 
                      width: 40, 
                      height: 40,
                      border: 1,
                      borderColor: 'divider'
                    }}
                  >
                    {member.displayName[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">
                      {member.displayName}
                    </Typography>
                    {member.id === group.createdBy && (
                      <Chip 
                        label="Admin" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>

          {isAdmin && pendingRequests.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Pending Requests
              </Typography>
              <List>
                {pendingRequests.map(request => (
                  <ListItem
                    key={request.id}
                    sx={{
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      mb: 1,
                      p: 2
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={request.userPhotoURL || undefined}>
                        {request.userName[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={request.userName}
                      secondary="Wants to join"
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleRequest(request.id, 'accept')}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleRequest(request.id, 'decline')}
                      >
                        Decline
                      </Button>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </TabPanel>

        {group.schedule && (
          <TabPanel value={tabValue} index={2}>
            <Box sx={styles.scheduleSection}>
              {group.schedule.map((slot, index) => (
                <Box key={index}>
                  <Typography variant="subtitle2" color="primary">
                    {slot.day}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {slot.startTime} - {slot.endTime}
                    <Chip
                      label={slot.recurring ? 'Weekly' : 'One-time'}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
              ))}
            </Box>
          </TabPanel>
        )}

        {isMember && (
          <TabPanel value={tabValue} index={3}>
            <Box sx={styles.chatContainer}>
              <GroupChat groupId={groupId ?? ''} />
            </Box>
          </TabPanel>
        )}
      </Paper>
    </Container>
  );
};

export default GroupDetails; 