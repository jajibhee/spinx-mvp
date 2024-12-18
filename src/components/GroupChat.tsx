import React, { useState } from 'react';
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

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
}

interface GroupChatProps {
  groupId: string;
}

const GroupChat: React.FC<GroupChatProps> = ({ groupId }) => {
  const [message, setMessage] = useState('');
  
  // Mock data - replace with actual messages from your backend
  const messages: Message[] = [
    {
      id: '1',
      senderId: '1',
      senderName: 'John Doe',
      content: 'Hey everyone! Whos up for a game this Saturday?',
      timestamp: '2024-03-16T10:30:00Z'
    },
    {
      id: '2',
      senderId: '2',
      senderName: 'Jane Smith',
      content: 'Im in! The usual time?',
      timestamp: '2024-03-16T10:31:00Z'
    },
    // Add more messages...
  ];

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      // Add your message sending logic here
      // await sendMessage(groupId, message);
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
      {/* Messages List */}
      <List sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column-reverse'
      }}>
        {messages.map((msg, index) => (
          <React.Fragment key={msg.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar src={msg.senderAvatar}>
                  {msg.senderName.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography component="span" variant="subtitle2">
                      {msg.senderName}
                    </Typography>
                    <Typography component="span" variant="caption" color="text.secondary">
                      {formatTime(msg.timestamp)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                    sx={{ whiteSpace: 'pre-wrap' }}
                  >
                    {msg.content}
                  </Typography>
                }
              />
            </ListItem>
            {index < messages.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>

      {/* Message Input */}
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