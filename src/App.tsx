// App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
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
import { Header } from '@/components/Header';
import PWAPrompt from '@/components/PWAPrompt';

const App: React.FC = () => {
  const { currentUser } = useAuth();

  const isAuthenticated = !!currentUser;
  // const isAuthenticated = f;

  // Temporary button to seed database
  const handleSeed = async () => {
    await seedDatabase();
  };

  const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
      <Box sx={{ pb: 7, height: '100vh', overflow: 'auto' }}>
        {!isHomePage && <Header />}
        {children}
        <Navigation />
      </Box>
    );
  };

  return (
    <BrowserRouter>
      <PWAPrompt />
      <Routes>
        {/* Auth Routes - No Navigation */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!isAuthenticated ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/onboarding" element={isAuthenticated ? <Onboarding /> : <Navigate to="/login" />} />

        {/* Protected Routes - With Navigation */}
        <Route path="/" element={isAuthenticated ? <AuthLayout><HomePage /></AuthLayout> : <Navigate to="/login" />} />
        <Route path="/groups" element={isAuthenticated ? <AuthLayout><Groups /></AuthLayout> : <Navigate to="/login" />} />
        <Route path="/courts" element={isAuthenticated ? <AuthLayout><Courts /></AuthLayout> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <AuthLayout><Profile /></AuthLayout> : <Navigate to="/login" />} />
        <Route path="/create-group" element={isAuthenticated ? <AuthLayout><CreateGroup /></AuthLayout> : <Navigate to="/login" />} />
        <Route path="/groups/:groupId" element={isAuthenticated ? <AuthLayout><GroupDetails /></AuthLayout> : <Navigate to="/login" />} />
        <Route path="/requests" element={isAuthenticated ? <AuthLayout><Requests /></AuthLayout> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;