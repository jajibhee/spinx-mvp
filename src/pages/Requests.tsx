import { useState, useEffect } from 'react';
import {
  Container, Typography, Card, CardContent, Box,
  Avatar, Button, Chip, Stack, Alert, CircularProgress,
  Tabs, Tab, Divider
} from '@mui/material';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PlayRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderPhotoURL?: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  sport: 'tennis' | 'pickleball';
  message: string;
  createdAt: Timestamp;
  contactShared: boolean;
}

const styles = {
  header: {
    mb: 3,
    color: 'primary.main',
    fontWeight: 'bold'
  },
  tabs: {
    mb: 3,
    borderBottom: 1,
    borderColor: 'divider'
  },
  requestCard: {
    mb: 2,
    '&:hover': {
      transform: 'translateY(-2px)',
      transition: 'transform 0.2s ease'
    }
  },
  cardContent: {
    p: 2.5,
    '&:last-child': { pb: 2.5 }
  },
  userInfo: {
    display: 'flex',
    gap: 2,
    mb: 2
  },
  actions: {
    display: 'flex',
    gap: 1,
    mt: 2
  }
} as const;

export const Requests = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [receivedRequests, setReceivedRequests] = useState<PlayRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<PlayRequest[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchRequests = async () => {
      try {
        setLoading(true);
        const receivedQuery = query(
          collection(db, 'playRequests'),
          where('receiverId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );

        const sentQuery = query(
          collection(db, 'playRequests'),
          where('senderId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );

        const [receivedSnap, sentSnap] = await Promise.all([
          getDocs(receivedQuery),
          getDocs(sentQuery)
        ]);

        setReceivedRequests(receivedSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PlayRequest[]);

        setSentRequests(sentSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PlayRequest[]);

      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentUser]);

  const handleRequest = async (requestId: string, action: 'accept' | 'decline') => {
    if (!currentUser) return;

    try {
      const requestRef = doc(db, 'playRequests', requestId);
      await updateDoc(requestRef, {
        status: action,
        updatedAt: Timestamp.now()
      });

      // Remove the request from the list
      setReceivedRequests(prev => 
        prev.filter(request => request.id !== requestId)
      );
    } catch (err) {
      console.error('Error handling request:', err);
      setError(`Failed to ${action} request`);
    }
  };

  const renderRequest = (request: PlayRequest, type: 'received' | 'sent') => (
    <Card key={request.id} sx={styles.requestCard}>
      <CardContent sx={styles.cardContent}>
        <Box sx={styles.userInfo}>
          <Avatar 
            src={request.senderPhotoURL} 
            sx={{ width: 48, height: 48 }}
          >
            {request.senderName[0]}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1">
              {type === 'received' ? 'Request from' : 'Request to'} {request.senderName}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip 
                label={request.sport} 
                size="small" 
                color="primary"
              />
              <Chip
                label={new Date(request.createdAt.toDate()).toLocaleDateString()}
                size="small"
                variant="outlined"
              />
            </Stack>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          "{request.message}"
        </Typography>

        {type === 'received' && (
          <Box sx={styles.actions}>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleRequest(request.id, 'accept')}
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleRequest(request.id, 'decline')}
            >
              Decline
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" sx={styles.header}>
        Play Requests
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Tabs 
        value={tabValue} 
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={styles.tabs}
      >
        <Tab label={`Received (${receivedRequests.length})`} />
        <Tab label={`Sent (${sentRequests.length})`} />
      </Tabs>

      {tabValue === 0 && (
        <>
          {receivedRequests.length === 0 ? (
            <Alert severity="info">
              No pending requests received
            </Alert>
          ) : (
            receivedRequests.map(request => renderRequest(request, 'received'))
          )}
        </>
      )}

      {tabValue === 1 && (
        <>
          {sentRequests.length === 0 ? (
            <Alert severity="info">
              No pending requests sent
            </Alert>
          ) : (
            sentRequests.map(request => renderRequest(request, 'sent'))
          )}
        </>
      )}
    </Container>
  );
};

export default Requests; 