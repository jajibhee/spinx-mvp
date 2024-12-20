import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { collection, query, where, orderBy, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types';

interface GroupChatProps {
  groupId: string;
}

const GroupChat: React.FC<GroupChatProps> = ({ groupId }) => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Subscribe to messages
  useEffect(() => {
    if (!groupId) return;

    console.log('Setting up listener...');

    const q = query(
      collection(db, 'messages'),
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );

    // onSnapshot is called immediately and returns an unsubscribe function
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Received message update!');
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      setMessages(newMessages);
    });

    // This cleanup function is only called when component unmounts
    // or when groupId changes
    return () => {
      console.log('Cleaning up listener...');
      unsubscribe();
    };
  }, [groupId]);

  const handleSend = async () => {
    if (!message.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, 'messages'), {
        groupId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous',
        senderPhotoURL: currentUser.photoURL,
        content: message.trim(),
        createdAt: new Date().toISOString()
      });

      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column-reverse'
      }}>
        {messages.map((msg, index) => {
          const isCurrentUser = msg.senderId === currentUser?.uid;

          return (
            <React.Fragment key={msg.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{
                  flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                  '& .MuiListItemAvatar-root': {
                    minWidth: 'auto',
                    marginLeft: isCurrentUser ? 1 : 0,
                    marginRight: isCurrentUser ? 0 : 1
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar src={msg.senderPhotoURL || undefined}>
                    {msg.senderName[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  sx={{
                    textAlign: isCurrentUser ? 'right' : 'left',
                    margin: 0
                  }}
                  primary={
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                      gap: 1
                    }}>
                      <Typography component="span" variant="subtitle2">
                        {isCurrentUser ? 'You' : msg.senderName}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary">
                        {formatTime(msg.createdAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        display: 'inline-block',
                        backgroundColor: isCurrentUser ? 'primary.light' : 'grey.100',
                        color: isCurrentUser ? 'white' : 'inherit',
                        p: 1,
                        borderRadius: 1,
                        maxWidth: '80%',
                        mt: 0.5
                      }}
                    >
                      {msg.content}
                    </Typography>
                  }
                />
              </ListItem>
              {index < messages.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          );
        })}
      </List>

      <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <IconButton 
                onClick={handleSend}
                disabled={!message.trim()}
                color="primary"
              >
                <SendIcon />
              </IconButton>
            )
          }}
        />
      </Box>
    </Paper>
  );
};

export default GroupChat; 