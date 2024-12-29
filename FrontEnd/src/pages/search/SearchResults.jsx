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
  Divider,
  Button,
  Paper
} from '@mui/material';
import { fetchGetDataWithAuth } from '../../client/client';
import { useNavigate } from 'react-router-dom';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArticleIcon from '@mui/icons-material/Article';
import PhotoIcon from '@mui/icons-material/Photo';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import StoreIcon from '@mui/icons-material/Store';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import './SearchResults.scss';

const SearchResults = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('people'); // Default filter
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
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

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
      {/* Left Sidebar */}
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

      {/* Main Content */}
      <Box className="search-results-container">
        <Paper className="search-results" elevation={0}>
          <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
            People
          </Typography>
          {searchResults.length === 0 ? (
            <Typography sx={{ p: 2 }}>Cant find any user</Typography>
          ) : (
            <List>
              {searchResults.map((user, index) => (
                <React.Fragment key={user.id}>
                  <ListItem 
                    className="user-item"
                    secondaryAction={
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
                      >
                        Follow
                      </Button>
                    }
                  >
                    <ListItemButton onClick={() => handleUserClick(user.id)}>
                      <ListItemAvatar>
                        <Avatar 
                          src={user.profileImage ? `/api/v1${user.profileImage}` : '/assets/person/noAvatar.png'} 
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
                              {user.location || 'Lives in Hồ Chí Minh city'}
                            </Typography>
                            <Typography variant="body2">
                              {user.mutualFriends || '2'} mutual friends
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < searchResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default SearchResults;
