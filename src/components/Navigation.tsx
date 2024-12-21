import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { 
  Home as HomeIcon, 
  Group as GroupIcon, 
  SportsBaseball as SportsIcon, 
  Person as PersonIcon 
} from '@mui/icons-material';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        borderTop: 1,
        borderColor: 'divider',
        zIndex: 1000
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={location.pathname}
        onChange={(_, newValue) => navigate(newValue)}
        showLabels
        sx={{
          height: 65,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            py: 1,
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main'
            }
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            '&.Mui-selected': {
              fontSize: '0.75rem'
            }
          }
        }}
      >
        <BottomNavigationAction
          label="Home"
          value="/"
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          label="Groups"
          value="/groups"
          icon={<GroupIcon />}
        />
        <BottomNavigationAction
          label="Courts"
          value="/courts"
          icon={<SportsIcon />}
        />
        <BottomNavigationAction
          label="Profile"
          value="/profile"
          icon={<PersonIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
}