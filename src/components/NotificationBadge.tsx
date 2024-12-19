import React, { useState, useEffect } from 'react';
import { Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const NotificationBadge: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    // Listen for pending requests in real-time
    const q = query(
      collection(db, 'playRequests'),
      where('receiverId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCount(snapshot.docs.length);
    }, (error) => {
      console.error('Error listening to requests:', error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <IconButton color="inherit" onClick={() => navigate('/requests')}>
      <Badge badgeContent={count} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
}; 