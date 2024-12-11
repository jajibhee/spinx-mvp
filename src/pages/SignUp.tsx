
// src/pages/SignupPage.tsx
import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button,
  Divider,
  Paper
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export const SignUp: React.FC = () => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle signup logic
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3
      }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Join SpinX
          </Typography>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            sx={{ mt: 2, mb: 3 }}
          >
            Sign up with Google
          </Button>

          <Divider sx={{ my: 3 }}>or</Divider>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              required
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
          </Box>

          <Typography align="center" variant="body2">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'inherit' }}>
              Sign in
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};
