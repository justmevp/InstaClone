import React, { useEffect, useState, useContext } from "react";
import "./post.scss";
import { IconButton, Dialog, DialogContent } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { fetchGetDataWithAuth, fetchPostDataWithAuth, fetchDeleteDataWithAuth } from 'client/client';
import { useNavigate } from 'react-router-dom';
import LazyImage from '../common/LazyImage';
import Comments from './Comments';
import { DarkModeContext } from '../context/darkModeContext';

// Hàm định dạng thởi gian hiển thị cho bài post
const formatDateTime = (postTime) => {
  // Chuyển đổi thởi gian post thành đối tượng Date
  const date = new Date(postTime);
  const now = new Date();
  // Tính khoảng thởi gian giữa hiện tại và thởi điểm đăng bài
  const diff = now - date;
  // Chuyển đổi thành phút
  const minutes = Math.floor(diff / (1000 * 60));
  // Chuyển đổi thành giờ
  const hours = Math.floor(minutes / 60);
  // Chuyển đổi thành ngày
  const days = Math.floor(hours / 24);

  // Hiển thị theo định dạng phù hợp dựa vào khoảng thởi gian
  if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours < 24) {
    return `${hours} hours ago`;
  } else {
    return `${days} days ago`;
  }
};

const Post = ({ post }) => {
  // Sử dụng context để kiểm tra chế độ tối
  const { darkMode } = useContext(DarkModeContext);
  
  // Khởi tạo các state cho component
  const [profileImage, setProfileImage] = useState('/assets/person/noAvatar.png');
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Hook điều hướng trang
  const navigate = useNavigate();

  useEffect(() => {
    // Hàm lấy thông tin user hiện tại
    const getCurrentUser = async () => {
      try {
        const response = await fetchGetDataWithAuth('/auth/current-user');
        setCurrentUserId(response.data.id);
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    // Hàm tải ảnh đại diện của người dùng
    const loadProfileImage = async () => {
      try {
        // Gọi API lấy thông tin ảnh đại diện
        const response = await fetchGetDataWithAuth('/auth/user/profileImage');
        // Tìm user tương ứng với bài post
        const currentUser = response.data.find((user) => user.userName === post.userName);
        // Nếu có ảnh đại diện thì cập nhật state
        if (currentUser?.photos?.profileImage) {
          setProfileImage(`/api/v1${currentUser.photos.profileImage}`);
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    };

    // Hàm kiểm tra và lấy số lượng reactions
    const loadReactions = async () => {
      try {
        // Lấy số lượng likes
        const reactionsResponse = await fetchGetDataWithAuth(`/posts/${post.id}/reactions`);
        if (reactionsResponse.data) {
          setLikeCount(reactionsResponse.data.length);
        }
        
        // Kiểm tra xem người dùng hiện tại đã like chưa
        const hasLikedResponse = await fetchGetDataWithAuth(`/posts/${post.id}/reactions/check`);
        setIsLiked(hasLikedResponse.data);
      } catch (error) {
        console.error('Error loading reactions:', error);
      }
    };

    loadProfileImage();
    loadReactions();
    loadComments(); // Tải comments khi component được mount
  }, [post.userName, post.id, currentUserId]);

  // Hàm tải danh sách comments của bài post
  const loadComments = async () => {
    try {
      setIsLoadingComments(true);
      // Gọi API lấy danh sách comments
      const response = await fetchGetDataWithAuth(`/posts/${post.id}/comments`);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Xử lý sự kiện click vào profile
  const handleProfileClick = () => {
    if (post.userId) {
      navigate(`/profile/${post.userId}`);
    }
  };

  // Xử lý sự kiện mở dialog comments
  const handleCommentClick = () => {
    setIsCommentsOpen(true);
  };

  // Xử lý thêm comment mới
  const handleAddComment = async (commentText, replyToId = null) => {
    try {
      // Gọi API thêm comment
      const response = await fetchPostDataWithAuth(`/posts/${post.id}/comment/add`, {
        comment: commentText,
        commentRepliedToId: replyToId
      });
      
      if (response.data) {
        // Tải lại danh sách comments sau khi thêm thành công
        loadComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Hàm xử lý khi click vào nút like
  const handleLikeClick = async () => {
    try {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

      if (isLiked) {
        // Nếu đã like thì gọi API unlike
        await fetchDeleteDataWithAuth(`/posts/${post.id}/reactions/delete`);
      } else {
        // Nếu chưa like thì gọi API like
        await fetchPostDataWithAuth(`/posts/${post.id}/reactions/add`, {});
      }
    } catch (error) {
      // Revert optimistic update if error occurs
      console.error('Error handling like:', error);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  return (
    // Container chính của post
    <div className={`post ${darkMode ? 'dark-mode' : ''}`}>
      <div className="postWrapper">
        {/* Phần header của post */}
        <div className="postTop">
          <div className="postTopLeft">
            {/* Nút ảnh đại diện và tên người dùng */}
            <button
              onClick={handleProfileClick}
              className={`profile-button ${darkMode ? 'dark-mode' : ''}`}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              aria-label="View Profile"
            >
              <div className="profileImageContainer">
                <LazyImage
                  src={profileImage}
                  alt="User Profile"
                  className="postProfileImg"
                  style={{
                    objectFit: 'cover',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px'
                  }}
                />
              </div>
              <span className="postUsername">{post.userName}</span>
            </button>
            {/* Hiển thị thởi gian đăng bài */}
            <span className="postDate" title={new Date(post.dateTime).toLocaleString()}>
              {formatDateTime(post.dateTime)}
            </span>
          </div>
          {/* Nút menu thêm tùy chọn */}
          <div className="postTopRight">
            <IconButton className={darkMode ? 'dark-mode' : ''}>
              <MoreVertIcon />
            </IconButton>
          </div>
        </div>

        {/* Phần nội dung của post */}
        <div className="postCenter">
          <span className="postText">{post.caption}</span>
          <div className="postImages">
            {post.photos?.map((photo) => (
              <div 
                key={photo.id} 
                className="postImgContainer"
                style={{
                  width: '100%',
                  marginBottom: '10px'
                }}
              >
                <LazyImage
                  src={`/api/v1${photo.download_link}`}
                  alt={photo.name || 'Post Image'}
                  className="postImg"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '600px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Phần footer của post */}
        <div className="postBottom">
          <div className="postBottomLeft">
            {/* Nút like với animation */}
            <IconButton 
              onClick={handleLikeClick} 
              className={`likeButton ${isLiked ? 'liked' : ''}`}
              style={{ transition: 'transform 0.2s' }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isLiked ? (
                <FavoriteIcon style={{ color: '#ed4956', transition: 'all 0.2s' }} />
              ) : (
                <FavoriteBorderIcon style={{ transition: 'all 0.2s' }} />
              )}
            </IconButton>
            <span className="postLikeCounter">{likeCount} likes</span>
            {/* Nút comment */}
            <div className="postStat">
              <IconButton onClick={handleCommentClick} className={darkMode ? 'dark-mode' : ''}>
                <ChatBubbleOutlineIcon />
              </IconButton>
              <span>{comments.length}</span>
            </div>
          </div>
        </div>

        {/* Dialog hiển thị comments */}
        <Dialog
          open={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          maxWidth="md"
          fullWidth
          className={`comments-dialog ${darkMode ? 'dark-mode' : ''}`}
          PaperProps={{
            className: darkMode ? 'dark-mode' : ''
          }}
        >
          <DialogContent className={darkMode ? 'dark-mode' : ''}>
            <div className={`dialog-content ${darkMode ? 'dark-mode' : ''}`}>
              {post.photos?.length > 0 ? (
                <div className={`post-preview ${darkMode ? 'dark-mode' : ''}`}>
                  <LazyImage
                    src={`/api/v1${post.photos[0].download_link}`}
                    alt={post.photos[0].name || 'Post Image'}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '600px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              ) : (
                <div className={`post-preview text-only ${darkMode ? 'dark-mode' : ''}`}>
                  <div className={`caption-container ${darkMode ? 'dark-mode' : ''}`}>
                    <div className={`post-header ${darkMode ? 'dark-mode' : ''}`}>
                      <div className={`user-info ${darkMode ? 'dark-mode' : ''}`}>
                        <LazyImage
                          src={profileImage}
                          alt="User Profile"
                          className={`postProfileImg ${darkMode ? 'dark-mode' : ''}`}
                          style={{
                            objectFit: 'cover',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px'
                          }}
                        />
                        <span className="postUsername">{post.userName}</span>
                      </div>
                      <span className="postDate">{formatDateTime(post.createdAt)}</span>
                    </div>
                    <p className="caption-text">{post.caption}</p>
                  </div>
                </div>
              )}
              <div className={`comments-section ${darkMode ? 'dark-mode' : ''}`}>
                <div className="post-caption">
                  <div className="caption-header">
                    <LazyImage
                      src={profileImage}
                      alt="User Profile"
                      className="postProfileImg"
                      style={{
                        objectFit: 'cover',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px'
                      }}
                    />
                    <span className="postUsername">{post.userName}</span>
                  </div>
                  <p className="caption-text">{post.caption}</p>
                </div>
                <Comments 
                  comments={comments} 
                  onAddComment={handleAddComment}
                  isLoading={isLoadingComments} 
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Post;
