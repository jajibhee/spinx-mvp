import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogContent, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon, Share as ShareIcon, AddBox as AddBoxIcon } from '@mui/icons-material';

const PWAPrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Show prompt if not installed
    const shouldShow = !standalone && !localStorage.getItem('pwaPromptDismissed');
    setIsOpen(shouldShow);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('pwaPromptDismissed', 'true');
    setIsOpen(false);
  };

  if (isStandalone) return null;

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleDismiss}
      PaperProps={{
        sx: { 
          borderRadius: 2,
          maxWidth: 'sm',
          m: 2
        }
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        <IconButton
          onClick={handleDismiss}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" gutterBottom>
          Install SpinPlay App
        </Typography>

        {isIOS ? (
          <Box>
            <Typography paragraph>
              Install SpinPlay on your iPhone:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ShareIcon />
              <Typography>
                1. Tap the Share button
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddBoxIcon />
              <Typography>
                2. Tap 'Add to Home Screen'
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography paragraph>
              Install SpinPlay on your device:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddBoxIcon />
              <Typography>
                Tap 'Install' when prompted or use menu to 'Add to Home Screen'
              </Typography>
            </Box>
          </Box>
        )}

        <Button 
          fullWidth 
          variant="contained" 
          onClick={handleDismiss}
          sx={{ mt: 3 }}
        >
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PWAPrompt; 