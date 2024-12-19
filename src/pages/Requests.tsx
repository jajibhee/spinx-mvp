import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp, addDoc } from 'firebase/firestore';

interface PlayRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  receiverId: string;
  receiverName: string;
  receiverEmail: string;
  receiverPhone?: string;
  sport: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
  message: string;
  contactShared?: boolean;
}

const Requests: React.FC = () => {
  const { currentUser } = useAuth();
  const [receivedRequests, setReceivedRequests] = useState<PlayRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<PlayRequest[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    fetchRequests();
  }, [currentUser]);

  const fetchRequests = async () => {
    try {
      const receivedQuery = query(
        collection(db, 'playRequests'),
        where('receiverId', '==', currentUser?.uid),
        where('status', '==', 'pending')
      );

      const sentQuery = query(
        collection(db, 'playRequests'),
        where('senderId', '==', currentUser?.uid)
      );

      const [receivedSnapshot, sentSnapshot] = await Promise.all([
        getDocs(receivedQuery),
        getDocs(sentQuery)
      ]);

      setReceivedRequests(
        receivedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as PlayRequest))
      );

      setSentRequests(
        sentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as PlayRequest))
      );
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests');
    }
  };

  const handleRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const requestRef = doc(db, 'playRequests', requestId);
      const request = receivedRequests.find(req => req.id === requestId);
      
      if (!request || !currentUser) return;

      await updateDoc(requestRef, {
        status: action,
        respondedAt: Timestamp.now(),
        contactShared: action === 'accept' ? true : false,
        receiverName: currentUser.displayName || 'Anonymous',
        receiverEmail: currentUser.email || '',
        receiverPhone: currentUser.phoneNumber || ''
      });

      if (action === 'accept') {
        // Create notification for sender
        await addDoc(collection(db, 'notifications'), {
          userId: request.senderId,
          type: 'request_accepted',
          title: 'Play Request Accepted!',
          message: `${currentUser.displayName || 'Someone'} accepted your request to play ${request.sport}`,
          read: false,
          createdAt: Timestamp.now(),
          requestId: request.id
        });
      }

      // Remove the request from the list
      setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
      
      setSuccess(
        action === 'accept' 
          ? 'Request accepted! You can now see each other\'s contact information.'
          : 'Request declined'
      );

      fetchRequests();
    } catch (err) {
      console.error('Error updating request:', err);
      setError(`Failed to ${action} request`);
    }
  };

  const renderContactInfo = (request: PlayRequest, type: 'received' | 'sent') => {
    if (request.status !== 'accepted' || !request.contactShared) return null;

    const contactInfo = type === 'received' ? {
      name: request.senderName,
      email: request.senderEmail,
      phone: request.senderPhone
    } : {
      name: request.receiverName,
      email: request.receiverEmail,
      phone: request.receiverPhone
    };

    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          Contact Information
        </Typography>
        <Typography variant="body2">
          {contactInfo.name}
        </Typography>
        <Typography variant="body2">
          Email: {contactInfo.email}
        </Typography>
        {contactInfo.phone && (
          <Typography variant="body2">
            Phone: {contactInfo.phone}
          </Typography>
        )}
      </Box>
    );
  };

  const renderRequest = (request: PlayRequest, type: 'received' | 'sent') => (
    <Card key={request.id}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Avatar>{request.senderName[0]}</Avatar>
            <Box>
              <Typography variant="h6">
                {type === 'received' ? request.senderName : 'You'} wants to play {request.sport}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(request.createdAt.toDate()).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {request.message}
              </Typography>
              {renderContactInfo(request, type)}
            </Box>
          </Box>
          {type === 'received' && request.status === 'pending' && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleRequest(request.id, 'accept')}
              >
                Accept
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRequest(request.id, 'decline')}
              >
                Decline
              </Button>
            </Stack>
          )}
          {type === 'sent' && (
            <Chip 
              label={request.status.charAt(0).toUpperCase() + request.status.slice(1)} 
              color={
                request.status === 'accepted' ? 'success' : 
                request.status === 'declined' ? 'error' : 
                'default'
              }
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
        Play Requests
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Received Requests
        </Typography>
        <Stack spacing={2}>
          {receivedRequests.length === 0 ? (
            <Typography color="text.secondary">No pending requests</Typography>
          ) : (
            receivedRequests.map(request => renderRequest(request, 'received'))
          )}
        </Stack>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box>
        <Typography variant="h6" gutterBottom>
          Sent Requests
        </Typography>
        <Stack spacing={2}>
          {sentRequests.length === 0 ? (
            <Typography color="text.secondary">No sent requests</Typography>
          ) : (
            sentRequests.map(request => renderRequest(request, 'sent'))
          )}
        </Stack>
      </Box>
    </Container>
  );
};

export default Requests; 