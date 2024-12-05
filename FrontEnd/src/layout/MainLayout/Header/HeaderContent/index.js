// material-ui
import { Box, IconButton, Popover, InputBase, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useContext, useEffect } from 'react';
import { DarkModeContext } from '../../../../components/context/darkModeContext';
import { useNavigate } from 'react-router-dom';
import { fetchGetDataWithAuth, fetchGetDataWithAuthArrayBuffer } from '../../../../client/client';

// project import
// import MobileSection from './MobileSection';
import Profile from './Profile';
import './HeaderContent.scss';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [showSearch, setShowSearch] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [profileImages, setProfileImages] = useState({});
  const navigate = useNavigate();
  const { darkMode } = useContext(DarkModeContext);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim()) {
        try {
          console.log('Searching for:', searchQuery);
          const response = await fetchGetDataWithAuth(`/search?query=${encodeURIComponent(searchQuery)}&followedOnly=true`);
          console.log('Search response:', response);
          setSearchResults(response.data || []);
        } catch (error) {
          console.error('Error searching users:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };

    const delayDebounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    const loadProfileImages = async () => {
      for (const user of searchResults) {
       
          try {
            const response = await fetchGetDataWithAuthArrayBuffer(user.photoProfileDTO.profileImage);
            const blob = new Blob([response.data]);
            const imageUrl = URL.createObjectURL(blob);
            setProfileImages(prev => ({
              ...prev,
              [user.id]: imageUrl
            }));  
          } catch (error) {
            console.error('Error loading profile image:', error);
          }
       
      }
    };

    loadProfileImages();
  }, [searchResults]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    console.log('Search input changed:', value);
    setSearchQuery(value);
  };

  const handleSearchKeyDown = async (event) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

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
        <Box 
          className={`search-overlay ${darkMode ? 'dark' : ''}`}
          onClick={(e) => {
            // Chỉ đóng khi click vào overlay
            if (e.target.classList.contains('search-overlay')) {
              toggleSearch();
            }
          }}
        >
          <Box className="search-container">
            <InputBase
              placeholder="Tìm kiếm người dùng..."
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              autoFocus
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

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <Box 
              sx={{ 
                width: '100%',
                maxWidth: 600,
                margin: '0 auto',
                mt: 1,
                backgroundColor: darkMode ? '#1a1a1a' : '#fff',
                borderRadius: 1,
                boxShadow: 3
              }}
            >
              <List>
                {searchResults.map((user) => (
                  <ListItem
                    key={user.id}
                    button
                    onClick={() => handleUserClick(user.id)}
                    sx={{
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={profileImages[user.id] }
                        alt={user.userName}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: darkMode ? '#fff' : 'inherit' }}>
                          {user.userName}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>
                          {user.fullName}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
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
