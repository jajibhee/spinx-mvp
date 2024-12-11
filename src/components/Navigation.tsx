import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home as HomeIcon, Group as GroupIcon, Place as PlaceIcon, Person as PersonIcon } from '@mui/icons-material';

export default function Navigation() {
    const navigate = useNavigate();
    const [value, setValue] = React.useState<number>(0);
  
    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
      switch (newValue) {
        case 0:
          navigate('/');
          break;
        case 1:
          navigate('/groups');
          break;
        case 2:
          navigate('/courts');
          break;
        case 3:
          navigate('/profile');
          break;
        default:
          navigate('/');
      }
    };
  
    return (
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation value={value} onChange={handleChange} showLabels>
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Groups" icon={<GroupIcon />} />
          <BottomNavigationAction label="Courts" icon={<PlaceIcon />} />
          <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
        </BottomNavigation>
      </Paper>
    );
  };