import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sport } from '@/types';
import { db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { AvailabilityEditor } from '@/components/AvailabilityEditor';
import { defaultAvailability } from '@/utils/defaults';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState({
    displayName: currentUser?.displayName || '',
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    sports: [] as Sport[],
    zipCode: '',
    bio: '',
    phoneNumber: currentUser?.phoneNumber || '',
    availability: defaultAvailability
  });

  const handleSportToggle = (sport: Sport) => {
    setProfile(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!profile.displayName || !profile.zipCode || profile.sports.length === 0) {
      setError('Please fill in all required fields and select at least one sport');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...profile,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        createdAt: new Date().toISOString(),
        onboardingCompleted: true
      });

      navigate('/');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Complete Your Profile
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Help us match you with the right players and groups
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Display Name"
                required
                value={profile.displayName}
                onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                disabled={loading}
              />

              <FormControl required>
                <InputLabel>Skill Level</InputLabel>
                <Select
                  value={profile.level}
                  label="Skill Level"
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    level: e.target.value as typeof profile.level 
                  }))}
                  disabled={loading}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Sports (select at least one)
                </Typography>
                <Stack direction="row" spacing={1}>
                  {(['tennis', 'pickleball'] as const).map((sport) => (
                    <Chip
                      key={sport}
                      label={sport.charAt(0).toUpperCase() + sport.slice(1)}
                      onClick={() => handleSportToggle(sport)}
                      color={profile.sports.includes(sport) ? 'primary' : 'default'}
                      variant={profile.sports.includes(sport) ? 'filled' : 'outlined'}
                      disabled={loading}
                    />
                  ))}
                </Stack>
              </Box>

              <TextField
                label="Zip Code"
                required
                value={profile.zipCode}
                onChange={(e) => setProfile(prev => ({ ...prev, zipCode: e.target.value }))}
                disabled={loading}
              />

              <TextField
                label="Phone Number"
                value={profile.phoneNumber}
                onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                disabled={loading}
              />

              <TextField
                label="Bio"
                multiline
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                disabled={loading}
                placeholder="Tell us a bit about yourself..."
              />

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  When are you available to play?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This helps us match you with players who share similar schedules
                </Typography>
                <AvailabilityEditor
                  value={profile.availability}
                  onChange={(newAvailability) => 
                    setProfile(prev => ({ ...prev, availability: newAvailability }))
                  }
                  disabled={loading}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 4 }}
              >
                Complete Profile
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Onboarding; 