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
import { ViewType, SportFilter, Player, Group, Sport, Connection } from '@/types';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp, getDoc, orderBy, limit, startAfter } from 'firebase/firestore';
import { NotificationBadge } from '@/components/NotificationBadge';
import { PlayRequestDialog } from '@/components/PlayRequestDialog';
import { PlayerAvailabilityDisplay } from '@/components/PlayerAvailabilityDisplay';
import AddIcon from '@mui/icons-material/Add';

const ITEMS_PER_PAGE = 5;

const styles = {
  container: {
    pb: 8, 
    pt: 7,
    px: { xs: 2, sm: 3 }, // Tighter padding on mobile
    maxWidth: '600px'
  },
  header: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    mb: 3,
    position: 'sticky',
    top: 56,
    backgroundColor: 'background.default',
    zIndex: 1100,
    py: 2
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: 'primary.main'
  },
  headerActions: {
    display: 'flex', 
    gap: 1,
    '& .MuiButton-root': {
      '& .MuiButton-startIcon': {
        marginRight: { xs: 0, sm: 1 }
      },
      '& .MuiButton-endIcon': { 
        margin: { xs: 0, sm: 1 }
      },
      '& span:not(.MuiButton-startIcon):not(.MuiButton-endIcon)': {
        display: { xs: 'none', sm: 'block' }
      }
    }
  },
  toggleGroup: {
    mb: 3,
    '& .MuiToggleButtonGroup-root': {
      width: '100%'
    },
    '& .MuiToggleButton-root': {
      flex: 1,
      py: 1.5,
      color: 'text.secondary',
      textTransform: 'none',
      borderBottom: 2,
      borderColor: 'divider',
      borderRadius: 0,
      '&.Mui-selected': {
        backgroundColor: 'primary.main',
        color: 'white',
        borderBottom: 2,
        borderColor: 'primary.main',
        '&:hover': {
          backgroundColor: 'primary.dark'
        }
      },
      '&:hover': {
        backgroundColor: 'action.hover'
      }
    }
  },
  filterButtons: {
    mb: 3,
    display: 'flex',
    gap: 1,
    flexWrap: { xs: 'wrap', sm: 'nowrap' },
    '& .MuiButton-root': {
      flex: { xs: '1 1 calc(33% - 8px)', sm: 1 },
      minWidth: { xs: 'calc(33% - 8px)', sm: 'auto' }
    }
  },
  playerCard: {
    mb: 2,
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    '&:hover': {
      transform: 'translateY(-2px)',
      transition: 'transform 0.2s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
    }
  },
  cardContent: {
    p: 2.5,
    '&:last-child': { pb: 2.5 }
  },
  playerInfo: {
    display: 'flex', 
    gap: 2,
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: { xs: 'center', sm: 'flex-start' },
    textAlign: { xs: 'center', sm: 'left' }
  },
  playerAvatar: {
    width: 56,
    height: 56,
    border: 2,
    borderColor: 'primary.light'
  },
  playerHeader: {
    display: 'flex', 
    flexDirection: { xs: 'column', sm: 'row' },
    justifyContent: 'space-between', 
    alignItems: { xs: 'center', sm: 'flex-start' },
    gap: { xs: 2, sm: 0 },
    mb: 1,
    width: '100%'
  },
  playerName: {
    fontWeight: 600,
    fontSize: '1.1rem'
  },
  playerMeta: {
    color: 'text.secondary',
    fontSize: '0.9rem',
    mb: 1,
    textAlign: { xs: 'center', sm: 'left' }
  },
  playerChips: {
    mt: 2,
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: 0.8,
    justifyContent: { xs: 'center', sm: 'flex-start' }
  },
  actionButton: {
    borderRadius: 6,
    textTransform: 'none',
    px: 2
  },
  loadMoreButton: {
    display: 'flex', 
    justifyContent: 'center', 
    mt: 4,
    mb: 2
  },
  availabilitySection: {
    mt: 2,
    width: '100%',
    '& .MuiTypography-root': {
      textAlign: { xs: 'center', sm: 'left' }
    },
    '& .MuiChip-root': {
      justifyContent: { xs: 'center', sm: 'flex-start' }
    }
  }
} as const;

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
  const [pendingConnections, setPendingConnections] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: ''
  });
  const [playRequests, setPlayRequests] = useState<{[key: string]: string}>({});
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [connections, setConnections] = useState<Connection[]>([]);

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

  useEffect(() => {
    if (!currentUser) return;

    const fetchConnections = async () => {
      try {
        const q = query(
          collection(db, 'connections'),
          where('players', 'array-contains', currentUser.uid)
        );

        const snapshot = await getDocs(q);
        setConnections(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Connection[]);
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };

    fetchConnections();
  }, [currentUser]);

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

  const handleConnect = (playerId: string) => {
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

  const getConnectButtonText = (playerId: string) => {
    const isConnected = connections.some(conn => 
      conn.players.includes(playerId) && conn.players.includes(currentUser?.uid || '')
    );
    
    if (isConnected) return 'Connected';
    const requestStatus = playRequests[playerId];
    if (requestStatus === 'sent') return 'Request Sent';
    if (requestStatus === 'received') return 'Respond to Request';
    return 'Send Play Request';
  };

  const isConnected = (playerId: string) => {
    return connections.some(conn => 
      conn.players.includes(playerId) && conn.players.includes(currentUser?.uid || '')
    );
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
        const usersRef = collection(db, 'users');
        let q = selectedSport === 'all' 
          ? query(
              usersRef,
              orderBy('name'),
              limit(ITEMS_PER_PAGE)
            )
          : query(
              usersRef,
              where('sports', 'array-contains', selectedSport),
              orderBy('name'),
              limit(ITEMS_PER_PAGE)
            );

        if (loadMore && lastDoc) {
          q = selectedSport === 'all'
            ? query(
                usersRef,
                orderBy('name'),
                startAfter(lastDoc),
                limit(ITEMS_PER_PAGE)
              )
            : query(
                usersRef,
                where('sports', 'array-contains', selectedSport),
                orderBy('name'),
                startAfter(lastDoc),
                limit(ITEMS_PER_PAGE)
              );
        }

        const snapshot = await getDocs(q);
        console.log('All users in DB:', snapshot.docs.map(doc => ({
          id: doc.id,
          onboardingCompleted: doc.data().onboardingCompleted,
          name: doc.data().name,
          ...doc.data()
        })));
        
        const fetchedUsers = snapshot.docs
          .map(doc => ({
            ...doc.data(),
            id: doc.id
          }))
          .filter(user => user.id !== currentUser?.uid) as Player[];

        console.log('Processed users:', fetchedUsers);
        setPlayers(prev => loadMore ? [...prev, ...fetchedUsers] : fetchedUsers);
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
        console.log('Raw group docs:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        const fetchedGroups = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Group[];

        console.log('Processed groups:', fetchedGroups);
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
    <Container sx={styles.container} disableGutters>
      <Box sx={styles.header}>
        <Typography sx={styles.headerTitle}>
          Near Me
        </Typography>
        <Box sx={styles.headerActions}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/create-group')}
            size="small"
            startIcon={<AddIcon />}
            sx={styles.actionButton}
          >
            Create Group
          </Button>
          <NotificationBadge />
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ ml: 0.5 }}
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
        sx={styles.toggleGroup}
      >
        <ToggleButton value="players">Players</ToggleButton>
        <ToggleButton value="communities">Communities</ToggleButton>
      </ToggleButtonGroup>

      <Box sx={styles.filterButtons}>
        {(['all', 'tennis', 'pickleball'] as const).map((sport) => (
          <Button
            key={sport}
            variant={selectedSport === sport ? 'contained' : 'outlined'}
            onClick={() => handleSportChange(sport)}
            sx={styles.actionButton}
          >
            {sport === 'all' ? 'All Sports' : sport.charAt(0).toUpperCase() + sport.slice(1)}
          </Button>
        ))}
      </Box>

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
              ? players.map(player => (
                  <Card key={player.id} sx={styles.playerCard}>
                    <CardContent sx={styles.cardContent}>
                      <Box sx={styles.playerInfo}>
                        <Avatar 
                          src={player.photoURL || undefined}
                          sx={styles.playerAvatar}
                        >
                          {player.name[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={styles.playerHeader}>
                            <Typography sx={styles.playerName}>
                              {player.name}
                            </Typography>
                            <Button 
                              variant="contained" 
                              color="primary"
                              size="small"
                              sx={styles.actionButton}
                              onClick={() => 
                                playRequests[player.id] === 'received' 
                                  ? navigate(`/requests`) 
                                  : handleConnect(player.id)
                              }
                              disabled={
                                playRequests[player.id] === 'sent' || 
                                player.id === currentUser?.uid ||
                                isConnected(player.id)
                              }
                            >
                              {player.id === currentUser?.uid ? 'You' : getConnectButtonText(player.id)}
                            </Button>
                          </Box>

                          <Typography sx={styles.playerMeta}>
                            {player.level} • {player.distance}
                          </Typography>

                          <Box sx={styles.playerChips}>
                            {player.sports.map(sport => (
                              <Chip 
                                key={sport} 
                                label={sport} 
                                size="small" 
                                variant="outlined"
                                sx={{ borderRadius: 1.5 }}
                              />
                            ))}
                          </Box>

                          {player.availability && (
                            <Box sx={styles.availabilitySection}>
                              <PlayerAvailabilityDisplay availability={player.availability} />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              : groups.map(renderGroupCard)
            }
          </Box>

          {hasMore && (
            <Box sx={styles.loadMoreButton}>
              <Button
                variant="outlined"
                onClick={() => fetchData(true)}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
                sx={styles.actionButton}
              >
                {loading ? 'Loading...' : 'Show More'}
              </Button>
            </Box>
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