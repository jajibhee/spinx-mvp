import React from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  TextField,
  Stack,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Availability } from '@/types';

interface AvailabilityEditorProps {
  value: Availability;
  onChange: (value: Availability) => void;
  disabled?: boolean;
}

type WeekDay = keyof Availability['weekdays'];

export const AvailabilityEditor: React.FC<AvailabilityEditorProps> = ({
  value,
  onChange,
  disabled
}) => {
  const days: WeekDay[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  ];

  const handleDayToggle = (day: WeekDay) => {
    onChange({
      ...value,
      weekdays: {
        ...value.weekdays,
        [day]: {
          ...value.weekdays[day],
          available: !value.weekdays[day].available
        }
      }
    });
  };

  const addTimeRange = (day: WeekDay) => {
    onChange({
      ...value,
      weekdays: {
        ...value.weekdays,
        [day]: {
          ...value.weekdays[day],
          timeRanges: [...(value.weekdays[day].timeRanges || []), { start: '09:00', end: '17:00' }]
        }
      }
    });
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Weekly Availability
      </Typography>

      <Stack spacing={2}>
        {days.map((day) => (
          <Box key={day}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={value.weekdays[day].available}
                  onChange={() => handleDayToggle(day)}
                  disabled={disabled}
                />
              }
              label={day.charAt(0).toUpperCase() + day.slice(1)}
            />
            
            {value.weekdays[day].available && (
              <Stack spacing={1} sx={{ ml: 4 }}>
                {value.weekdays[day].timeRanges?.map((range, index: number) => (
                  <Stack key={index} direction="row" spacing={1} alignItems="center">
                    <TextField
                      type="time"
                      value={range.start}
                      onChange={(e) => {
                        const newRanges = [...(value.weekdays[day].timeRanges || [])];
                        newRanges[index] = { ...range, start: e.target.value };
                        onChange({
                          ...value,
                          weekdays: {
                            ...value.weekdays,
                            [day]: { ...value.weekdays[day], timeRanges: newRanges }
                          }
                        });
                      }}
                      disabled={disabled}
                      size="small"
                    />
                    <Typography>to</Typography>
                    <TextField
                      type="time"
                      value={range.end}
                      onChange={(e) => {
                        const newRanges = [...(value.weekdays[day].timeRanges || [])];
                        newRanges[index] = { ...range, end: e.target.value };
                        onChange({
                          ...value,
                          weekdays: {
                            ...value.weekdays,
                            [day]: { ...value.weekdays[day], timeRanges: newRanges }
                          }
                        });
                      }}
                      disabled={disabled}
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        const newRanges = value.weekdays[day].timeRanges?.filter((_: any, i: number) => i !== index);
                        onChange({
                          ...value,
                          weekdays: {
                            ...value.weekdays,
                            [day]: { ...value.weekdays[day], timeRanges: newRanges }
                          }
                        });
                      }}
                      disabled={disabled}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                ))}
                <IconButton
                  size="small"
                  onClick={() => addTimeRange(day)}
                  disabled={disabled}
                >
                  <AddIcon />
                </IconButton>
              </Stack>
            )}
          </Box>
        ))}

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Preferred Times
          </Typography>
          <Select
            value={value.preferredTimes}
            onChange={(e) => onChange({ ...value, preferredTimes: e.target.value as Availability['preferredTimes'] })}
            disabled={disabled}
            fullWidth
          >
            <MenuItem value="morning">Morning</MenuItem>
            <MenuItem value="afternoon">Afternoon</MenuItem>
            <MenuItem value="evening">Evening</MenuItem>
            <MenuItem value="flexible">Flexible</MenuItem>
          </Select>
        </Box>

        <TextField
          label="Additional Notes"
          multiline
          rows={2}
          value={value.notes}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          disabled={disabled}
          placeholder="E.g., Prefer weekday evenings, available for morning matches on weekends..."
        />
      </Stack>
    </Box>
  );
}; 