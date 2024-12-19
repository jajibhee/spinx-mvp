// App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import { Box, Button } from '@mui/material';
import Navigation from '@/components/Navigation';
import HomePage from '@/pages/HomePage';
import Courts from '@/pages/Courts';
import Groups from '@/pages/Groups';
import Profile from '@/pages/Profile';
import { Login } from '@/pages/Login';
import { SignUp } from '@/pages/SignUp';
import { useAuth } from '@/contexts/AuthContext';
import CreateGroup from '@/pages/CreateGroup';
import GroupDetails from '@/pages/GroupDetails';
import Requests from '@/pages/Requests';
import Onboarding from '@/pages/Onboarding';
import { seedDatabase } from '@/utils/seedDatabase';

const App: React.FC = () => {
  const { currentUser } = useAuth();

  const isAuthenticated = !!currentUser;
  // const isAuthenticated = f;

  // Temporary button to seed database
  const handleSeed = async () => {
    await seedDatabase();
  };

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
          <Route 
            path="/create-group" 
            element={isAuthenticated ? <CreateGroup /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/groups/:groupId" 
            element={isAuthenticated ? <GroupDetails /> : <Navigate to="/login" />} 
          />
          <Route path="/requests" element={<Requests />} />
          <Route 
            path="/onboarding" 
            element={isAuthenticated ? <Onboarding /> : <Navigate to="/login" />} 
          />
        </Routes>
        
        {/* Only show navigation when authenticated */}
        {isAuthenticated && <Navigation />}

          <Button onClick={handleSeed}>Seed Database</Button>

      </Box>
    </BrowserRouter>
  );
};

export default App;