// material-ui
import { Box, IconButton, Popover, InputBase, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useContext } from 'react';
import { DarkModeContext } from '../../../../components/context/darkModeContext';

// project import
// import MobileSection from './MobileSection';
import Profile from './Profile';
import './HeaderContent.scss';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [showSearch, setShowSearch] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

 
  const { darkMode } = useContext(DarkModeContext);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

 

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
        <IconButton onClick={toggleSearch} sx={{ color: 'text.primary' }}>
          <SearchIcon />
        </IconButton>

        <IconButton onClick={handleNotificationClick} sx={{ color: 'text.primary' }}>
          <NotificationsIcon />
        </IconButton>

        <Profile />
      </Box>

      {/* Search Overlay */}
      {showSearch && (
        <Box className={`search-overlay ${darkMode ? 'dark' : ''}`}>
          <Box className="search-container">
            <InputBase
              placeholder="Search..."
              fullWidth
              sx={{ 
                ml: 2,
                color: darkMode ? '#fff' : 'inherit',
                '& .MuiInputBase-input::placeholder': {
                  color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)'
                }
              }}
            />
            <IconButton onClick={toggleSearch} sx={{ color: darkMode ? '#fff' : 'inherit' }}>
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
        sx={{
          '& .MuiPopover-paper': {
            backgroundColor: darkMode ? '#1a1a1a' : '#fff',
            color: darkMode ? '#fff' : 'inherit',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
          }
        }}
      >
        <Box sx={{ 
          width: 300, 
          maxHeight: 400,
        }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : '#eee'}`,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: darkMode ? '#1a1a1a' : '#fff',
          }}>
            <Typography variant="h6" sx={{ color: darkMode ? '#fff' : 'inherit' }}>
              Notifications
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleNotificationClose}
              sx={{ 
                color: darkMode ? '#fff' : 'inherit',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <List sx={{ 
            p: 0,
            backgroundColor: darkMode ? '#1a1a1a' : '#fff'
          }}>
            <ListItem 
              button 
              sx={{ 
                '&:hover': { 
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)' 
                }
              }}
            >
              <ListItemAvatar>
                <Avatar />
              </ListItemAvatar>
              <ListItemText 
                primary={
                  <Typography sx={{ color: darkMode ? '#fff' : 'inherit' }}>
                    John Doe liked your post
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>
                    2 hours ago
                  </Typography>
                }
              />
            </ListItem>
            <ListItem 
              button 
              sx={{ 
                '&:hover': { 
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)' 
                }
              }}
            >
              <ListItemAvatar>
                <Avatar />
              </ListItemAvatar>
              <ListItemText 
                primary={
                  <Typography sx={{ color: darkMode ? '#fff' : 'inherit' }}>
                    Jane Smith started following you
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>
                    1 day ago
                  </Typography>
                }
              />
            </ListItem>
          </List>
        </Box>
      </Popover>

      {matchesXs }
    </>
  );
};

export default HeaderContent;
