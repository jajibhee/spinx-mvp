// App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import { Box } from '@mui/material';
import Navigation from '@/components/Navigation';
import HomePage from '@/pages/HomePage';
import Courts from '@/pages/Courts';
import Groups from '@/pages/Groups';
import Profile from '@/pages/Profile';
import { Login } from '@/pages/Login';
import { SignUp } from '@/pages/SignUp';

const App: React.FC = () => {
  const isAuthenticated = false;
  return (
    <BrowserRouter>
      <Box sx={{ pb: 7, height: '100vh', overflow: 'auto' }}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!isAuthenticated ? <SignUp /> : <Navigate to="/" />} />

          {/* Protected Routes */}
          <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/groups" element={isAuthenticated ? <Groups /> : <Navigate to="/login" />} />
          <Route path="/courts" element={isAuthenticated ? <Courts /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        </Routes>
        
        {/* Only show navigation when authenticated */}
        {isAuthenticated && <Navigation />}
      </Box>
    </BrowserRouter>
  );
};

export default App;