import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  Chip,
  InputAdornment,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Autocomplete
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Sport, Court, CreateGroupForm } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
] as const;

// interface CreateGroupForm {
//   name: string;
//   description: string;
//   sport: Sport | '';
//   location: string;
//   primaryCourt?: Court | null;
//   skillLevel: 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced' | '';
//   maxMembers: number;
//   tags: string[];
//   groupImage?: File | null;
//   imageUrl?: string;
//   schedule: {
//     day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
//     startTime: string;
//     endTime: string;
//     recurring: boolean;
//   }[];
// }

const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [nearbyCourts, setNearbyCourts] = useState<Court[]>([]);

  const [formData, setFormData] = useState<CreateGroupForm>({
    name: '',
    description: '',
    sport: '',
    location: '',
    primaryCourt: null,
    skillLevel: '',
    maxMembers: 20,
    tags: [],
    groupImage: null,
    schedule: []
  });

  useEffect(() => {
    if (formData.sport) {
      const fetchCourts = async () => {
        // const courts = await fetchNearbyCourts(formData.sport);
        // setNearbyCourts(courts);
      };
      fetchCourts();
    }
  }, [formData.sport]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sport || !formData.location || !formData.skillLevel) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Add your group creation logic here
      // const groupData = {
      //   ...formData,
      //   createdBy: currentUser.uid,
      //   createdAt: new Date().toISOString(),
      //   members: [currentUser.uid],
      //   active: true
      // };
      // await createGroup(groupData);

      navigate('/groups');
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, groupImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        {
          day: 'Monday',
          startTime: '09:00',
          endTime: '10:00',
          recurring: true
        }
      ]
    }));
  };

  const handleScheduleChange = (index: number, field: keyof CreateGroupForm['schedule'][0], value: any) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleRemoveSchedule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
          Create a Group
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={imagePreview || undefined}
                  sx={{ width: 100, height: 100, cursor: 'pointer' }}
                />
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: -10,
                    right: -10,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <AddPhotoIcon />
                </IconButton>
              </Box>
            </Box>

            <TextField
              label="Group Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />

            <FormControl fullWidth required>
              <InputLabel>Sport</InputLabel>
              <Select
                value={formData.sport}
                label="Sport"
                onChange={(e) => setFormData(prev => ({ ...prev, sport: e.target.value as Sport }))}
              >
                <MenuItem value="tennis">Tennis</MenuItem>
                <MenuItem value="pickleball">Pickleball</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Location"
              required
              fullWidth
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter address or court name"
            />

            <FormControl fullWidth required>
              <InputLabel>Skill Level</InputLabel>
              <Select
                value={formData.skillLevel}
                label="Skill Level"
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  skillLevel: e.target.value as CreateGroupForm['skillLevel']
                }))}
              >
                <MenuItem value="All Levels">All Levels</MenuItem>
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Maximum Members"
              type="number"
              fullWidth
              value={formData.maxMembers}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                maxMembers: Math.max(1, parseInt(e.target.value) || 1)
              }))}
              InputProps={{
                inputProps: { min: 1 }
              }}
            />

            <TextField
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your group, meeting times, rules, etc."
            />

            <Box>
              <TextField
                label="Tags"
                fullWidth
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Press Enter to add tags"
                InputProps={{
                  startAdornment: formData.tags.length > 0 ? (
                    <InputAdornment position="start">
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {formData.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            onDelete={() => handleDeleteTag(tag)}
                          />
                        ))}
                      </Box>
                    </InputAdornment>
                  ) : null
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Add tags like "Weekends", "Morning", "Competitive", etc.
              </Typography>
            </Box>

            <Autocomplete
              options={nearbyCourts}
              getOptionLabel={(court) => court.name}
              value={formData.primaryCourt}
              onChange={(_, newValue) => setFormData(prev => ({ 
                ...prev, 
                primaryCourt: newValue 
              }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Primary Court"
                  placeholder="Select a nearby court"
                />
              )}
              renderOption={(props, court) => (
                <ListItem {...props}>
                  <ListItemText
                    primary={court.name}
                    secondary={`${court.distance} • ${court.type}`}
                  />
                </ListItem>
              )}
            />

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Meeting Schedule</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddSchedule}
                  size="small"
                >
                  Add Time
                </Button>
              </Box>
              
              {formData.schedule.map((schedule, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    mb: 1
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={schedule.day}
                      onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <MenuItem key={day} value={day}>{day}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    type="time"
                    size="small"
                    value={schedule.startTime}
                    onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                  />
                  
                  <TextField
                    type="time"
                    size="small"
                    value={schedule.endTime}
                    onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                  />
                  
                  <Chip
                    label={schedule.recurring ? 'Weekly' : 'One-time'}
                    onClick={() => handleScheduleChange(index, 'recurring', !schedule.recurring)}
                    color={schedule.recurring ? 'primary' : 'default'}
                    size="small"
                  />
                  
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveSchedule(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                Create Group
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateGroup; 