import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  Button,
  Divider,
  AvatarGroup,
  Grid,
  Tab,
  Tabs,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondary
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Chat as ChatIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Group } from '@/types';
import GroupChat from '@/components/GroupChat';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel">
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const GroupDetails: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [joinStatus, setJoinStatus] = useState<'none' | 'pending' | 'member'>('none');

  // Mock data - replace with actual data fetching
  const group = {
    id: 1,
    name: "Tennis Club DTX",
    sport: "tennis",
    description: "Weekly tennis meetups for intermediate players in Dallas area.",
    location: "Dallas Tennis Center",
    memberCount: 25,
    maxMembers: 30,
    skillLevel: "Intermediate",
    schedule: [
      { day: "Monday", time: "7:00 PM - 9:00 PM", recurring: true },
      { day: "Saturday", time: "9:00 AM - 11:00 AM", recurring: true }
    ],
    members: [
      { id: 1, name: "John Doe", role: "Admin", avatar: null },
      { id: 2, name: "Jane Smith", role: "Member", avatar: null },
      // Add more members...
    ],
    tags: ["Competitive", "Weekly Meetups", "Social"],
    imageUrl: null
  };

  const handleJoin = async () => {
    try {
      // Add your join request logic here
      // await sendJoinRequest(groupId);
      setJoinStatus('pending');
    } catch (error) {
      console.error('Failed to send join request:', error);
    }
  };

  const renderJoinButton = () => {
    switch (joinStatus) {
      case 'pending':
        return (
          <Button
            variant="outlined"
            disabled
            startIcon={<LockIcon />}
            fullWidth
          >
            Request Pending
          </Button>
        );
      case 'member':
        return (
          <Button
            variant="contained"
            startIcon={<ChatIcon />}
            fullWidth
          >
            Open Chat
          </Button>
        );
      default:
        return (
          <Button
            variant="contained"
            onClick={handleJoin}
            fullWidth
          >
            Request to Join
          </Button>
        );
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={group.imageUrl || undefined}
            sx={{ width: 100, height: 100, mb: 2 }}
          >
            {group.name.charAt(0)}
          </Avatar>
          <Typography variant="h5" gutterBottom align="center">
            {group.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={group.sport} />
            <Chip label={group.skillLevel} variant="outlined" />
          </Box>
          {renderJoinButton()}
        </Box>

        {joinStatus === 'pending' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Your request to join is pending approval from the group admin.
          </Alert>
        )}

        <Tabs
          value={tabValue}
          onChange={(_e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="About" />
          <Tab label="Members" />
          <Tab label="Schedule" />
          {joinStatus === 'member' && <Tab label="Chat" />}
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" paragraph>
            {group.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationIcon color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {group.location}
            </Typography>
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
            Tags
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {group.tags.map(tag => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {group.members.map(member => (
              <ListItem key={member.id}>
                <ListItemAvatar>
                  <Avatar src={member.avatar || undefined}>
                    {member.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.name}
                  secondary={member.role}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {group.schedule.map((slot, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                {slot.day}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {slot.time} • {slot.recurring ? 'Weekly' : 'One-time'}
              </Typography>
            </Box>
          ))}
        </TabPanel>

              <GroupChat groupId={groupId!} />

        {/* {joinStatus === 'member' && (
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ height: '60vh' }}>
              <GroupChat groupId={groupId!} />
            </Box>
          </TabPanel>
        )} */}

       

      </Paper>
    </Container>
  );
};

export default GroupDetails; 