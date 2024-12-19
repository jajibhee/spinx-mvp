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

  return (
    <Box sx={{ mt: 1 }}>
      <Tooltip title={availability.notes || 'No additional notes'}>
        <Chip
          icon={<AccessTimeIcon fontSize="small" />}
          label={
            <Typography noWrap variant="caption">
              {`${availability.preferredTimes} • ${getAvailableDays().join(', ')}`}
            </Typography>
          }
          size="small"
          variant="outlined"
          sx={{ 
            maxWidth: '100%',
            '& .MuiChip-label': {
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }}
        />
      </Tooltip>
    </Box>
  );
}; 