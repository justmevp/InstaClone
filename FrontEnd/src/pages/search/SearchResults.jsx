import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Box,
  Container, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText,
  ListItemButton,
  Button,
  Paper
} from '@mui/material';
import { fetchGetDataWithAuth, fetchPostDataWithAuth, fetchDeleteDataWithAuth } from '../../client/client'; // Nhập các hàm để gọi API với xác thực
import { useNavigate } from 'react-router-dom';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArticleIcon from '@mui/icons-material/Article';
import PhotoIcon from '@mui/icons-material/Photo';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import StoreIcon from '@mui/icons-material/Store';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import './SearchResults.scss';

// Thành phần SearchResults để hiển thị kết quả tìm kiếm
const SearchResults = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('people');
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q');

  const filters = [
    { id: 'all', label: 'All', icon: <PeopleAltIcon /> },
    { id: 'posts', label: 'Posts', icon: <ArticleIcon /> },
    { id: 'people', label: 'People', icon: <PeopleAltIcon /> },
    { id: 'photos', label: 'Photos', icon: <PhotoIcon /> },
    { id: 'videos', label: 'Videos', icon: <VideoLibraryIcon /> },
    { id: 'marketplace', label: 'Pages', icon: <StoreIcon /> },
    { id: 'groups', label: 'Groups', icon: <GroupsIcon /> },
    { id: 'places', label: 'Places', icon: <LocationOnIcon /> },
  ];

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;

      try {
        setLoading(true);
        const response = await fetchGetDataWithAuth(`/search?query=${encodeURIComponent(query)}&followedOnly=false`);
        const resultsWithFollowStatus = await Promise.all(response.data.map(async (user) => {
          const followStatusResponse = await fetchGetDataWithAuth(`/users/${user.id}/follow-status`); // Gọi API để kiểm tra trạng thái theo dõi
          return { ...user, isFollowed: followStatusResponse.data === 'F' }; // Cập nhật trạng thái theo dõi
        }));
        setSearchResults(resultsWithFollowStatus);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const followHandler = async (userId) => {
    try {
      await fetchPostDataWithAuth(`/users/${userId}/followers/add`, { method: 'POST' });
      console.log(`Đã theo dõi người dùng có ID: ${userId}`);
      // Cập nhật lại danh sách người dùng sau khi theo dõi
      setSearchResults((prevResults) => 
        prevResults.map(user => 
          user.id === userId ? { ...user, isFollowed: true } : user
        )
      );
    } catch (error) {
      console.error('Lỗi khi theo dõi người dùng:', error);
    }
  };

  const unfollowHandler = async (userId) => {
    try {
      const currentUser = await fetchGetDataWithAuth('/auth/profile');
      const currentUserId = currentUser.data.userId;
      await fetchDeleteDataWithAuth(`/users/${userId}/followers/${currentUserId}/delete`, { method: 'DELETE' });
      console.log(`Đã hủy theo dõi người dùng có ID: ${userId}`);
      // Cập nhật lại danh sách người dùng sau khi hủy theo dõi
      setSearchResults((prevResults) => 
        prevResults.map(user => 
          user.id === userId ? { ...user, isFollowed: false } : user
        )
      );
    } catch (error) {
      console.error('Lỗi khi hủy theo dõi người dùng:', error);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <Box className="search-page">
      <Paper className="search-filters" elevation={0}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
          Search Results
        </Typography>
        <List>
          {filters.map((filter) => (
            <ListItem 
              key={filter.id} 
              disablePadding
              className={activeFilter === filter.id ? 'active' : ''}
              onClick={() => setActiveFilter(filter.id)}
            >
              <ListItemButton>
                <ListItemAvatar>
                  {filter.icon}
                </ListItemAvatar>
                <ListItemText primary={filter.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Box className="search-results-container">
        <Paper className="search-results" elevation={0}>
          <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
            People
          </Typography>
          {searchResults.length === 0 ? (
            <Typography sx={{ p: 2 }}>Không tìm thấy người dùng nào</Typography>
          ) : (
            <List>
              {searchResults.map((user) => (
                <ListItem 
                  key={user.id}
                  secondaryAction={
                    user.isFollowed ? (
                      <Button 
                        variant="contained"
                        disableElevation
                        sx={{
                          backgroundColor: '#0095f6 !important',
                          color: '#fff !important',
                          '&:hover': {
                            backgroundColor: '#ae2727 !important'
                          },
                          textTransform: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          padding: '6px 16px',
                          minWidth: '80px'
                        }}
                        onClick={() => unfollowHandler(user.id)} // Gọi hàm hủy theo dõi khi nhấn nút
                      >
                        Unfollow
                      </Button>
                    ) : (
                      <Button 
                        variant="contained"
                        disableElevation
                        sx={{
                          backgroundColor: '#0095f6 !important',
                          color: '#fff !important',
                          '&:hover': {
                            backgroundColor: '#1877f2 !important'
                          },
                          textTransform: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          padding: '6px 16px',
                          minWidth: '80px'
                        }}
                        onClick={() => followHandler(user.id)} // Gọi hàm theo dõi khi nhấn nút
                      >
                        Follow
                      </Button>
                    )
                  }
                >
                  <ListItemButton onClick={() => handleUserClick(user.id)}>
                    <ListItemAvatar>
                      <Avatar 
                        src={user.photoProfileDTO.profileImage ? `/api/v1${user.photoProfileDTO.profileImage}` : 'D:/InstaClone Spring project/InstaClone/InstaClone/src/main/resources/DefaultProfile/defaultprofile.png'} 
                        alt={user.userName}
                      />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Typography variant="subtitle1">
                          {user.userName}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {user.location || 'Sống tại Hồ Chí Minh'}
                          </Typography>
                          <Typography variant="body2">
                            {user.mutualFriends || '2'} bạn chung
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default SearchResults; // Xuất component SearchResults