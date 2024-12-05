import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText,
  ListItemButton,
  Divider 
} from '@mui/material';
import { fetchGetDataWithAuth } from '../../client/client';
import { useNavigate } from 'react-router-dom';

const SearchResults = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;
      
      try {
        setLoading(true);
        // Tìm tất cả người dùng, không chỉ những người đang follow
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
          Đang tải...
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
        Kết quả tìm kiếm cho &ldquo;{query}&rdquo;
      </Typography>
      {searchResults.length === 0 ? (
        <Typography>Không tìm thấy kết quả nào</Typography>
      ) : (
        <List>
          {searchResults.map((user, index) => (
            <React.Fragment key={user.id}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleUserClick(user.id)}>
                  <ListItemAvatar>
                    <Avatar 
                      src={user.profileImage ? `/api/v1${user.profileImage}` : '/assets/person/noAvatar.png'} 
                      alt={user.userName}
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={user.userName}
                    secondary={user.fullName}
                  />
                </ListItemButton>
              </ListItem>
              {index < searchResults.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Container>
  );
};

export default SearchResults;
