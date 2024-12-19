import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Chip,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { Sport, Availability } from '@/types';
import { AvailabilityEditor } from '@/components/AvailabilityEditor';
import { defaultAvailability } from '@/utils/defaults';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string | null;
  bio: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  sports: Sport[];
  zipCode: string;
  phoneNumber: string;
  availability: Availability;
}

const Profile: React.FC = () => {
  const { currentUser, uploadProfilePhoto } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize profile with Google data if available, otherwise use defaults
  const [profile, setProfile] = useState<UserProfile>({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    photoURL: currentUser?.photoURL || null,
    bio: '',
    level: 'Beginner',
    sports: [],
    zipCode: '',
    phoneNumber: currentUser?.phoneNumber || '',
    availability: defaultAvailability
  });

  // Update profile when currentUser changes (e.g., after Google sign-in)
  useEffect(() => {
    if (currentUser) {
      setProfile(prev => ({
        ...prev,
        displayName: currentUser.displayName || prev.displayName,
        email: currentUser.email || prev.email,
        photoURL: currentUser.photoURL || prev.photoURL,
        phoneNumber: currentUser.phoneNumber || prev.phoneNumber
      }));
    }
  }, [currentUser]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        setError('');
        const photoURL = await uploadProfilePhoto(file);
        setProfile(prev => ({ ...prev, photoURL }));
        setSuccess('Profile photo updated successfully!');
      } catch (err) {
        setError('Failed to upload photo');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSportToggle = (sport: Sport) => {
    setProfile(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      // Add your profile update logic here
      // await updateUserProfile(profile);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 2, pb: 8 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Profile
          </Typography>
          {!isEditing ? (
            <IconButton onClick={() => setIsEditing(true)} disabled={loading}>
              <EditIcon />
            </IconButton>
          ) : (
            <Stack direction="row" spacing={1}>
              <IconButton color="primary" onClick={handleSave} disabled={loading}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={() => setIsEditing(false)} disabled={loading}>
                <CancelIcon />
              </IconButton>
            </Stack>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Show a message if profile is incomplete */}
        {!profile.level && !profile.sports.length && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Please complete your profile to help us match you with players and groups.
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Avatar
              src={profile.photoURL || undefined}
              sx={{ width: 100, height: 100 }}
            />
            {isEditing && (
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: -10,
                  right: -10,
                  backgroundColor: 'background.paper'
                }}
                component="label"
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handlePhotoUpload}
                />
                <PhotoCameraIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        <Stack spacing={3}>
          <TextField
            label="Display Name"
            value={profile.displayName}
            onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
            disabled={!isEditing}
            fullWidth
          />

          <TextField
            label="Email"
            value={profile.email}
            disabled
            fullWidth
          />

          <TextField
            label="Phone Number"
            value={profile.phoneNumber}
            onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
            disabled={!isEditing}
            fullWidth
          />

          <TextField
            label="Zip Code"
            value={profile.zipCode}
            onChange={(e) => setProfile(prev => ({ ...prev, zipCode: e.target.value }))}
            disabled={!isEditing}
            fullWidth
          />

          <TextField
            label="Bio"
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            disabled={!isEditing}
            multiline
            rows={3}
            fullWidth
          />

          <FormControl fullWidth disabled={!isEditing}>
            <InputLabel>Skill Level</InputLabel>
            <Select
              value={profile.level}
              label="Skill Level"
              onChange={(e) => setProfile(prev => ({ 
                ...prev, 
                level: e.target.value as UserProfile['level']
              }))}
            >
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Sports
            </Typography>
            <Stack direction="row" spacing={1}>
              {(['tennis', 'pickleball', 'both'] as const).map((sport) => (
                <Chip
                  key={sport}
                  label={sport === 'both' ? 'Both' : sport.charAt(0).toUpperCase() + sport.slice(1)}
                  onClick={() => {
                    if (isEditing) {
                      if (sport === 'both') {
                        setProfile(prev => ({
                          ...prev,
                          sports: ['tennis', 'pickleball']
                        }));
                      } else {
                        handleSportToggle(sport as Sport);
                      }
                    }
                  }}
                  color={
                    sport === 'both' 
                      ? (profile.sports.includes('tennis') && profile.sports.includes('pickleball')) 
                        ? 'primary' 
                        : 'default'
                      : profile.sports.includes(sport) 
                        ? 'primary' 
                        : 'default'
                  }
                  variant={
                    sport === 'both'
                      ? (profile.sports.includes('tennis') && profile.sports.includes('pickleball'))
                        ? 'filled'
                        : 'outlined'
                      : profile.sports.includes(sport)
                        ? 'filled'
                        : 'outlined'
                  }
                  sx={{ textTransform: 'capitalize' }}
                  clickable={isEditing}
                />
              ))}
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />
        
        <Box>
          <Typography variant="h6" gutterBottom>
            Availability
          </Typography>
          <AvailabilityEditor
            value={profile.availability}
            onChange={(newAvailability) => 
              setProfile(prev => ({ ...prev, availability: newAvailability }))
            }
            disabled={!isEditing}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;