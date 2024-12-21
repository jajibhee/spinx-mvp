import React from 'react';
import { Box, Typography, Tooltip, Chip } from '@mui/material';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { Availability } from '@/types';

interface PlayerAvailabilityDisplayProps {
  availability: Availability;
}

export const PlayerAvailabilityDisplay: React.FC<PlayerAvailabilityDisplayProps> = ({
  availability
}) => {
  const getAvailableDays = () => {
    return Object.entries(availability.weekdays)
      .filter(([_, value]) => value.available)
      .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));
  };

  const styles = {
    container: {
      mt: 2,
      width: '100%'
    },
    chipGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 1,
      justifyContent: { xs: 'center', sm: 'flex-start' }
    },
    title: {
      textAlign: { xs: 'center', sm: 'left' },
      mb: 1,
      color: 'text.secondary'
    },
    chip: {
      maxWidth: '100%',
      height: 'auto',
      '& .MuiChip-label': {
        whiteSpace: 'normal',
        display: 'block',
        py: 0.5
      }
    }
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="body2" sx={styles.title}>
        Availability
      </Typography>
      <Box sx={styles.chipGroup}>
        <Tooltip title={availability.notes || 'No additional notes'}>
          <Chip
            icon={<AccessTimeIcon fontSize="small" />}
            label={`${availability.preferredTimes} • ${getAvailableDays().join(', ')}`}
            size="small"
            variant="outlined"
            sx={styles.chip}
          />
        </Tooltip>
      </Box>
    </Box>
  );
}; 