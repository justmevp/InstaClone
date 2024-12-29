// Import các components từ Material-UI
import { Box, IconButton, Popover, InputBase, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useContext, useEffect } from 'react';
import { DarkModeContext } from '../../../../components/context/darkModeContext';
import { useNavigate } from 'react-router-dom';
import { fetchGetDataWithAuth, fetchGetDataWithAuthArrayBuffer } from '../../../../client/client';

// Import các components con
import Profile from './Profile';
import './HeaderContent.scss';

// Component chính cho phần header
const HeaderContent = () => {
  // Kiểm tra kích thước màn hình có phải mobile không
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  
  // Các state quản lý trạng thái
  const [showSearch, setShowSearch] = useState(false); // Hiển thị/ẩn ô tìm kiếm
  const [anchorEl, setAnchorEl] = useState(null); // Vị trí hiển thị popover thông báo
  const [searchQuery, setSearchQuery] = useState(''); // Từ khóa tìm kiếm
  const [searchResults, setSearchResults] = useState([]); // Kết quả tìm kiếm
  const [profileImages, setProfileImages] = useState({}); // Lưu trữ ảnh đại diện
  
  const navigate = useNavigate();
  const { darkMode } = useContext(DarkModeContext); // Lấy trạng thái dark mode

  // Effect xử lý tìm kiếm người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim()) {
        try {
          // Gọi API tìm kiếm người dùng
          const response = await fetchGetDataWithAuth(`/search?query=${encodeURIComponent(searchQuery)}&followedOnly=true`);
          setSearchResults(response.data || []);
        } catch (error) {
          console.error('Error searching users:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };

    // Debounce để tránh gọi API quá nhiều
    const delayDebounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Effect tải ảnh đại diện cho kết quả tìm kiếm
  useEffect(() => {
    const loadProfileImages = async () => {
      for (const user of searchResults) {
        try {
          // Tải ảnh đại diện và chuyển đổi thành URL
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

  // Xử lý khi người dùng nhập từ khóa tìm kiếm
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  // Xử lý khi người dùng nhấn Enter trong ô tìm kiếm
  const handleSearchKeyDown = async (event) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Xử lý khi click vào một người dùng trong kết quả tìm kiếm
  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Xử lý hiển thị/ẩn popover thông báo
  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  // Bật/tắt ô tìm kiếm
  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  return (
    <>
      {/* Thanh công cụ chính */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
        <IconButton onClick={toggleSearch} sx={{ color: 'text.primary' }}>
          <SearchIcon />
        </IconButton>

        <IconButton onClick={handleNotificationClick} sx={{ color: 'text.primary' }}>
          <NotificationsIcon />
        </IconButton>

        <Profile />
      </Box>

      {/* Overlay tìm kiếm */}
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
          {/* Ô nhập tìm kiếm */}
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

          {/* Danh sách kết quả tìm kiếm */}
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
                        src={profileImages[user.id]}
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

      {/* Popover thông báo */}
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
              Thông báo
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
                    John Doe thích bài viết của bạn
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>
                    2 giờ trước
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
                    Jane Smith bắt đầu theo dõi bạn
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>
                    1 ngày trước
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
