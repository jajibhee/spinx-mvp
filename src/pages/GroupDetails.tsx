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
  ListItemText
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Chat as ChatIcon,
  Lock as LockIcon
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
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

interface UserDetails {
  id: string;
  displayName: string;
  photoURL: string | null;
}

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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={group.imageUrl}
            sx={{ width: 100, height: 100, mb: 2 }}
          >
            {group.name[0]}
          </Avatar>
          <Typography variant="h5" gutterBottom align="center">
            {group.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
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
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="About" />
          <Tab label="Members" />
          {group.schedule && <Tab label="Schedule" />}
          {isMember && <Tab label="Chat" />}
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" paragraph>
            {group.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationIcon color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {group.location}
            </Typography>
          </Box>

          {group.tags && (
            <>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {group.tags.map(tag => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {group.memberCount || 0} members
          </Typography>
          <List>
            {memberDetails.map(member => (
              <ListItem key={member.id}>
                <ListItemAvatar>
                  <Avatar src={member.photoURL || undefined}>
                    {member.displayName[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={member.displayName} />
              </ListItem>
            ))}
          </List>

          {isAdmin && pendingRequests.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                Pending Requests
              </Typography>
              <List>
                {pendingRequests.map(request => (
                  <ListItem
                    key={request.id}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1 }}>
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
                      </Box>
                    }
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
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </TabPanel>

        {group.schedule && (
          <TabPanel value={tabValue} index={2}>
            {group.schedule.map((slot, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  {slot.day}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {slot.startTime} - {slot.endTime} • {slot.recurring ? 'Weekly' : 'One-time'}
                </Typography>
              </Box>
            ))}
          </TabPanel>
        )}

        {isMember && (
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ height: '60vh' }}>
              <GroupChat groupId={groupId ?? ''} />
            </Box>
          </TabPanel>
        )}
      </Paper>
    </Container>
  );
};

export default GroupDetails; 