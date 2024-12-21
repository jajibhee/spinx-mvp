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
  Stack,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  SportsScore as LevelIcon,
  AccessTime as TimeIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { Sport, Availability } from '@/types';
import { AvailabilityEditor } from '@/components/AvailabilityEditor';
import { defaultAvailability } from '@/utils/defaults';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

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

const styles = {
  container: {
    pb: 8,
    pt: 2,
    px: { xs: 2, sm: 3 },
    maxWidth: '600px'
  },
  card: {
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'visible',
    '& .MuiCardContent-root': {
      p: 3
    }
  },
  header: {
    position: 'relative',
    textAlign: 'center',
    pt: 3,
    pb: 3,
    px: 3
  },
  avatarWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    mx: 'auto',
    mb: 3,
    mt: 2
  },
  avatar: {
    width: '100%',
    height: '100%',
    border: 3,
    borderColor: 'primary.main'
  },
  cameraButton: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    backgroundColor: 'background.paper',
    boxShadow: 1,
    '&:hover': {
      backgroundColor: 'background.paper',
    }
  },
  editButton: {
    position: 'absolute',
    top: 16,
    right: 16
  },
  section: {
    p: 3,
    '&:not(:last-child)': {
      borderBottom: 1,
      borderColor: 'divider'
    }
  },
  sectionTitle: {
    fontWeight: 600,
    mb: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    color: 'primary.main'
  },
  infoList: {
    '& .MuiListItem-root': {
      px: 0,
      py: 1.5
    },
    '& .MuiListItemIcon-root': {
      minWidth: 40,
      color: 'primary.main'
    }
  },
  sportsChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
    mt: 1
  },
  actionButton: {
    borderRadius: 6,
    textTransform: 'none'
  },
  sportsChip: {
    textTransform: 'capitalize',
    '&.MuiChip-filled': {
      backgroundColor: 'primary.main',
      color: 'white',
      '&:hover': {
        backgroundColor: 'primary.dark',
      }
    }
  }
} as const;

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
    <Container maxWidth="sm" sx={styles.container}>
      <Card sx={styles.card}>
        <CardContent>
          <Box sx={styles.header}>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Profile
            </Typography>
            {!isEditing ? (
              <Button
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                disabled={loading}
                variant="outlined"
                size="small"
                sx={styles.actionButton}
              >
                Edit Profile
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                  variant="contained"
                  size="small"
                  sx={styles.actionButton}
                >
                  Save
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  variant="outlined"
                  size="small"
                  color="error"
                  sx={styles.actionButton}
                >
                  Cancel
                </Button>
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

          <Box sx={styles.avatarWrapper}>
            <Avatar
              src={profile.photoURL || undefined}
              sx={styles.avatar}
            />
            {isEditing && (
              <IconButton
                sx={styles.cameraButton}
                component="label"
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handlePhotoUpload}
                />
                <CameraIcon />
              </IconButton>
            )}
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
                    sx={styles.sportsChip}
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
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;