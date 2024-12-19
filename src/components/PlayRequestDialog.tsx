import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material';

interface PlayRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  sport: string;
  loading?: boolean;
}

export const PlayRequestDialog: React.FC<PlayRequestDialogProps> = ({
  open,
  onClose,
  onSubmit,
  sport,
  loading = false
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    onSubmit(message || `Would you like to play ${sport}?`);
    setMessage('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Send Play Request</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Write a message to your potential playing partner. Keep it friendly and include any relevant details!
          </Typography>
        </Box>
        <TextField
          autoFocus
          multiline
          rows={3}
          fullWidth
          label="Message"
          placeholder={`Would you like to play ${sport}?`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Send Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 