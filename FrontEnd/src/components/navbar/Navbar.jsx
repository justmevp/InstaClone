import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Box,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import './navbar.scss';

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  return (
    <Box sx={{ flexGrow: 1 }} className="custom-navbar">
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            InstaClone
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={toggleSearch}>
              <SearchIcon />
            </IconButton>

            <IconButton onClick={handleNotificationClick}>
              <NotificationsIcon />
            </IconButton>

            <IconButton onClick={goToProfile}>
              <PersonIcon />
            </IconButton>
          </Box>
        </Toolbar>

        {/* Search Overlay */}
        {showSearch && (
          <Box className="search-overlay">
            <Box className="search-container">
              <InputBase
                placeholder="Search..."
                fullWidth
                sx={{ ml: 2 }}
              />
              <IconButton onClick={toggleSearch}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Notifications Popover */}
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box sx={{ width: 300, maxHeight: 400 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Notifications</Typography>
              <IconButton size="small" onClick={handleNotificationClose}>
                <CloseIcon />
              </IconButton>
            </Box>
            <List sx={{ p: 0 }}>
              <ListItem button>
                <ListItemAvatar>
                  <Avatar />
                </ListItemAvatar>
                <ListItemText
                  primary="John Doe liked your post"
                  secondary="2 hours ago"
                />
              </ListItem>
              <ListItem button>
                <ListItemAvatar>
                  <Avatar />
                </ListItemAvatar>
                <ListItemText
                  primary="Jane Smith started following you"
                  secondary="1 day ago"
                />
              </ListItem>
            </List>
          </Box>
        </Popover>
      </AppBar>
    </Box>
  );
};

export default Navbar;
