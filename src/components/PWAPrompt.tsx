import React, { useState, useEffect } from 'react';
import { Alert, Button, Snackbar } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

const PWAPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if user is on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Only show for mobile users who haven't dismissed or installed
    if (isMobile && !localStorage.getItem('pwaPromptDismissed')) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  return (
    <Snackbar 
      open={showPrompt} 
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        severity="info"
        action={
          <>
            <Button
              color="primary"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleInstall}
              sx={{ mr: 1 }}
            >
              Install
            </Button>
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleDismiss}
            >
              Dismiss
            </Button>
          </>
        }
      >
        Install SpinPlay for a better experience
      </Alert>
    </Snackbar>
  );
};

export default PWAPrompt; 