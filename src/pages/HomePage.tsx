import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  ButtonGroup,
  Card,
  CardContent,
  Avatar,
  Chip,
  Snackbar,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { ViewType, SportFilter, Player, Group, Sport } from '@/types';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp, getDoc, orderBy, limit, startAfter } from 'firebase/firestore';
import { NotificationBadge } from '@/components/NotificationBadge';
import { PlayRequestDialog } from '@/components/PlayRequestDialog';
import { PlayerAvailabilityDisplay } from '@/components/PlayerAvailabilityDisplay';

const ITEMS_PER_PAGE = 5;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // console.log('Mock Data:', { NEARBY_PLAYERS, NEARBY_GROUPS });
  const [view, setView] = useState<ViewType>(() => {
    const savedView = localStorage.getItem('homePageView');
    return (savedView as ViewType) || 'players';
  });
  const [selectedSport, setSelectedSport] = useState<SportFilter>(() => {
    const savedSport = localStorage.getItem('selectedSport');
    return (savedSport as SportFilter) || 'all';
  });
  const [pendingConnections, setPendingConnections] = useState<number[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: ''
  });
  const [playRequests, setPlayRequests] = useState<{[key: string]: string}>({});
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!currentUser) return;
      
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists() || !userDoc.data().onboardingCompleted) {
        navigate('/onboarding');
      }
    };

    checkOnboarding();
  }, [currentUser, navigate]);

  const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: ViewType | null) => {
    if (newView !== null) {
      setView(newView);
      localStorage.setItem('homePageView', newView);
    }
  };

  const handleSportChange = (sport: SportFilter) => {
    setSelectedSport(sport);
    localStorage.setItem('selectedSport', sport);
  };

  const handleConnect = (playerId: number) => {
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: 'Please sign in to send play requests'
      });
      return;
    }
    setSelectedPlayerId(playerId);
    setDialogOpen(true);
  };

  const handleSendRequest = async (message: string) => {
    if (!currentUser || !selectedPlayerId) return;

    try {
      setSendingRequest(true);
      setPendingConnections(prev => [...prev, selectedPlayerId]);
      
      await addDoc(collection(db, 'playRequests'), {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous',
        senderEmail: currentUser.email,
        senderPhone: currentUser.phoneNumber || '',
        receiverId: selectedPlayerId,
        status: 'pending',
        sport: selectedSport === 'all' ? 'tennis' : selectedSport,
        createdAt: Timestamp.now(),
        message,
        contactShared: false
      });

      setSnackbar({
        open: true,
        message: 'Play request sent! You\'ll be notified when they respond.'
      });
    } catch (error) {
      console.error('Error sending play request:', error);
      setPendingConnections(prev => prev.filter(id => id !== selectedPlayerId));
      setSnackbar({
        open: true,
        message: 'Failed to send play request'
      });
    } finally {
      setSendingRequest(false);
      setDialogOpen(false);
      setSelectedPlayerId(null);
    }
  };

  // Check existing play requests
  useEffect(() => {
    if (!currentUser) return;

    const fetchPlayRequests = async () => {
      // Sent requests
      const sentQuery = query(
        collection(db, 'playRequests'),
        where('senderId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );

      // Received requests
      const receivedQuery = query(
        collection(db, 'playRequests'),
        where('receiverId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );

      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery)
      ]);

      const requests: {[key: string]: string} = {};
      sentSnapshot.docs.forEach(doc => {
        requests[doc.data().receiverId] = 'sent';
      });
      receivedSnapshot.docs.forEach(doc => {
        requests[doc.data().senderId] = 'received';
      });

      setPlayRequests(requests);
      setPendingConnections(
        sentSnapshot.docs.map(doc => doc.data().receiverId)
      );
    };

    fetchPlayRequests();
  }, [currentUser]);

  const getConnectButtonText = (playerId: number) => {
    const requestStatus = playRequests[playerId];
    if (requestStatus === 'sent') return 'Request Sent';
    if (requestStatus === 'received') return 'Respond to Request';
    return 'Send Play Request';
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
    handleMenuClose();
  };

  const renderPlayerCard = (player: Player) => (
    <Card key={player.id}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48 }}>
            {player.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">{player.name}</Typography>
              <Button 
                variant="contained" 
                color="primary"
                size="small"
                onClick={() => 
                  playRequests[player.id] === 'received' 
                    ? navigate(`/requests`) 
                    : handleConnect(player.id)
                }
                disabled={playRequests[player.id] === 'sent'}
              >
                {getConnectButtonText(player.id)}
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary">
              {player.level} • {player.distance}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {player.sports.map(sport => (
                <Chip 
                  key={sport} 
                  label={sport} 
                  size="small" 
                  variant="outlined"
                />
              ))}
            </Box>
            {player.availability && (
              <PlayerAvailabilityDisplay availability={player.availability} />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderGroupCard = (group: Group) => (
    <Card key={group.id}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">{group.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {group.sport.charAt(0).toUpperCase() + group.sport.slice(1)} • {group.location}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {group.memberCount} members
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            View Group
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Move fetchData outside of useEffect
  const fetchData = async (loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
      }
      setError('');

      if (view === 'players') {
        const playersRef = collection(db, 'players');
        let q = selectedSport === 'all' 
          ? query(playersRef, orderBy('name'), limit(ITEMS_PER_PAGE))
          : query(playersRef, 
              where('sports', 'array-contains', selectedSport),
              orderBy('name'),
              limit(ITEMS_PER_PAGE)
            );

        // If loading more, start after the last document
        if (loadMore && lastDoc) {
          q = selectedSport === 'all'
            ? query(playersRef, orderBy('name'), startAfter(lastDoc), limit(ITEMS_PER_PAGE))
            : query(playersRef,
                where('sports', 'array-contains', selectedSport),
                orderBy('name'),
                startAfter(lastDoc),
                limit(ITEMS_PER_PAGE)
              );
        }

        const snapshot = await getDocs(q);
        const fetchedPlayers = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: parseInt(doc.id)
        })) as Player[];

        setPlayers(prev => loadMore ? [...prev, ...fetchedPlayers] : fetchedPlayers);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
      } else {
        // Similar logic for groups
        const groupsRef = collection(db, 'groups');
        let q = selectedSport === 'all'
          ? query(groupsRef, orderBy('name'), limit(ITEMS_PER_PAGE))
          : query(groupsRef,
              where('sport', '==', selectedSport),
              orderBy('name'),
              limit(ITEMS_PER_PAGE)
            );

        if (loadMore && lastDoc) {
          q = selectedSport === 'all'
            ? query(groupsRef, orderBy('name'), startAfter(lastDoc), limit(ITEMS_PER_PAGE))
            : query(groupsRef,
                where('sport', '==', selectedSport),
                orderBy('name'),
                startAfter(lastDoc),
                limit(ITEMS_PER_PAGE)
              );
        }

        const snapshot = await getDocs(q);
        const fetchedGroups = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: parseInt(doc.id)
        })) as Group[];

        setGroups(prev => loadMore ? [...prev, ...fetchedGroups] : fetchedGroups);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Keep the useEffect
  useEffect(() => {
    setLastDoc(null);
    setHasMore(true);
    fetchData();
  }, [view, selectedSport]);

  return (
    <Container maxWidth="sm" sx={{ pb: 8, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Near Me
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/create-group')}>
            Create Group
          </Button>
          <NotificationBadge />
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleProfile}>My Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
          </Menu>
        </Box>
      </Box>

      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={handleViewChange}
        fullWidth
        sx={{ mb: 2 }}
      >
        <ToggleButton value="players">Players</ToggleButton>
        <ToggleButton value="communities">Communities</ToggleButton>
      </ToggleButtonGroup>

      <ButtonGroup variant="outlined" sx={{ mb: 3, display: 'flex', gap: 1 }}>
        {(['all', 'tennis', 'pickleball'] as const).map((sport) => (
          <Button
            key={sport}
            variant={selectedSport === sport ? 'contained' : 'outlined'}
            onClick={() => handleSportChange(sport)}
          >
            {sport.charAt(0).toUpperCase() + sport.slice(1)}
          </Button>
        ))}
      </ButtonGroup>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !players.length && !groups.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {view === 'players'
              ? players.map(renderPlayerCard)
              : groups.map(renderGroupCard)
            }
          </Box>

          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => fetchData(true)}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Loading...' : 'Show More'}
              </Button>
            </Box>
          )}

          {!loading && ((view === 'players' && players.length === 0) || 
            (view === 'communities' && groups.length === 0)) && (
            <Typography color="text.secondary" align="center">
              No {view} found for the selected sport
            </Typography>
          )}
        </>
      )}

      <PlayRequestDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedPlayerId(null);
        }}
        onSubmit={handleSendRequest}
        sport={selectedSport === 'all' ? 'tennis' : selectedSport}
        loading={sendingRequest}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HomePage;