import React, { useState, useEffect, useContext } from 'react';
import './comments.scss';
import { Avatar, TextField, Button, IconButton } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SendIcon from '@mui/icons-material/Send';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { fetchGetDataWithAuthArrayBuffer } from '../../client/client';
import { DarkModeContext } from '../context/darkModeContext';

const formatDateTime = (commentTime) => {
  // Chuyển đổi thởi gian post thành đối tượng Date
  const date = new Date(commentTime);
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

const Comments = ({ comments = [], onAddComment }) => {
  const { darkMode } = useContext(DarkModeContext);
  const [profileImages, setProfileImages] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [likedComments, setLikedComments] = useState(new Set());
  const [expandedComments, setExpandedComments] = useState(new Set());

  useEffect(() => {
    const loadProfileImages = async () => {
      for (const comment of comments) {
        if (comment.profilePhoto && !profileImages[comment.username]) {
          try {
            const response = await fetchGetDataWithAuthArrayBuffer(comment.profilePhoto.profileImage);
            const blob = new Blob([response.data]);
            const imageUrl = URL.createObjectURL(blob);
            setProfileImages(prev => ({
              ...prev,
              [comment.username]: imageUrl
            }));
          } catch (error) {
            console.error('Error loading profile image:', error);
          }
        }
      }
    };

    loadProfileImages();
  }, [comments]);

  const handleReply = (commentId) => {
    console.log('Replying to comment:', commentId);
    setActiveReplyId(activeReplyId === commentId ? null : commentId);
  };

  const handleSubmitReply = async (e, commentId) => {
    e.preventDefault();
    const replyText = e.target.elements.replyText.value.trim();
    if (replyText) {
      await onAddComment(replyText, commentId);
      e.target.elements.replyText.value = '';
      setActiveReplyId(null);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      await onAddComment(newComment);
      setNewComment('');
    }
  };

  const toggleLike = (commentId) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const toggleReplies = (commentId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const getReplies = (commentId, includeNested = false) => {
    // Nếu includeNested = true, lấy tất cả replies (trực tiếp và nested)
    if (includeNested) {
      const result = [];
      const queue = [commentId];
      
      while (queue.length > 0) {
        const currentId = queue.pop();
        const directReplies = comments.filter(comment => comment.commentRepliedToId === currentId);
        
        result.push(...directReplies);
        queue.push(...directReplies.map(reply => reply.id));
      }
      
      return result;
    }
    
    // Nếu không, chỉ lấy replies trực tiếp
    return comments.filter(comment => comment.commentRepliedToId === commentId);
  };

  const sortReplies = (replies) => {
    return [...replies].sort((a, b) => a.id - b.id);
  };

  const renderReplies = (commentId, depth = 1) => {
    // Từ depth = 2 trở đi, lấy tất cả nested replies
    const replies = getReplies(commentId, depth >= 2);
    const sortedReplies = sortReplies(replies);
    
    if (!expandedComments.has(commentId)) {
      return null;
    }
    
    return (
      <div className="replies-section">
        {sortedReplies.map(reply => {
          const replyHasReplies = getReplies(reply.id).length > 0;
          // Nếu depth = 1, hiển thị depth-1
          // Nếu depth >= 2, luôn hiển thị depth-2
          const displayDepth = depth === 1 ? 1 : 2;

          return (
            <div key={reply.id} className={`comment-container reply depth-${displayDepth}`}>
              <div className="comment">
                <Avatar 
                  src={profileImages[reply.username] || '/assets/person/noAvatar.png'} 
                  alt={reply.username}
                  sx={{ width: 32, height: 32 }}
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="username">{reply.username}</span>
                  </div>
                  <span className="text">
                    {reply.commentRepliedToId && (
                      <span className="reply-to">
                        @{comments.find(c => c.id === reply.commentRepliedToId)?.username || 'unknown'}{' '}
                      </span>
                    )}
                    {reply.comment}
                  </span>
                  <div className="comment-actions">
                    <span className="time-ago" title={new Date(reply.dateTime).toLocaleString()}>
                      {formatDateTime(reply.dateTime)}
                    </span>
                    <div className="likes">
                      <span>{likedComments.has(reply.id) ? '1' : '0'} likes</span>
                    </div>
                    <button className="reply-btn" onClick={() => handleReply(reply.id)}>
                      Reply
                    </button>
                    <IconButton 
                      size="small" 
                      onClick={() => toggleLike(reply.id)}
                      className="like-button"
                    >
                      {likedComments.has(reply.id) ? (
                        <FavoriteIcon fontSize="small" color="error" />
                      ) : (
                        <FavoriteBorderIcon fontSize="small" />
                      )}
                    </IconButton>
                  </div>
                </div>
              </div>

              {activeReplyId === reply.id && (
                <form className="reply-form" onSubmit={(e) => handleSubmitReply(e, reply.id)}>
                  <TextField
                    fullWidth
                    name="replyText"
                    variant="outlined"
                    placeholder={`Reply to ${reply.username}...`}
                    size="small"
                    autoFocus
                    className={darkMode ? 'dark-mode' : ''}
                  />
                  <div className="reply-actions">
                    <Button 
                      size="small" 
                      onClick={() => setActiveReplyId(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="small"
                    >
                      Reply
                    </Button>
                  </div>
                </form>
              )}

              {/* Chỉ hiển thị nút View replies ở depth 1 */}
              {replyHasReplies && depth === 1 && (
                <div className="view-replies">
                  <Button
                    startIcon={expandedComments.has(reply.id) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    onClick={() => toggleReplies(reply.id)}
                    size="small"
                    className="view-replies-btn"
                  >
                    {expandedComments.has(reply.id) ? 'Hide' : 'View'} {getReplies(reply.id).length} replies
                  </Button>
                </div>
              )}

              {/* Chỉ gọi renderReplies tiếp nếu đang ở depth 1 */}
              {depth === 1 && renderReplies(reply.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderComment = (comment) => {
    const hasReplies = getReplies(comment.id).length > 0;

    return (
      <div className="comment-container">
        <div className="comment">
          <Avatar 
            src={profileImages[comment.username] || '/assets/person/noAvatar.png'} 
            alt={comment.username}
            sx={{ width: 32, height: 32 }}
          />
          <div className="comment-content">
            <div className="comment-header">
              <span className="username">{comment.username}</span>
            </div>
            <span className="text">{comment.comment}</span>
            <div className="comment-actions">
              <span className="time-ago" title={new Date(comment.dateTime).toLocaleString()}>
                {formatDateTime(comment.dateTime)}
              </span>
              <div className="likes">
                <span>{likedComments.has(comment.id) ? '1' : '0'} likes</span>
              </div>
              <button className="reply-btn" onClick={() => handleReply(comment.id)}>
                Reply
              </button>
              <IconButton 
                size="small" 
                onClick={() => toggleLike(comment.id)}
                className="like-button"
              >
                {likedComments.has(comment.id) ? (
                  <FavoriteIcon fontSize="small" color="error" />
                ) : (
                  <FavoriteBorderIcon fontSize="small" />
                )}
              </IconButton>
            </div>
          </div>
        </div>

        {activeReplyId === comment.id && (
          <form className="reply-form" onSubmit={(e) => handleSubmitReply(e, comment.id)}>
            <TextField
              fullWidth
              name="replyText"
              variant="outlined"
              placeholder={`Reply to ${comment.username}...`}
              size="small"
              autoFocus
              className={darkMode ? 'dark-mode' : ''}
            />
            <div className="reply-actions">
              <Button 
                size="small" 
                onClick={() => setActiveReplyId(null)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                size="small"
              >
                Reply
              </Button>
            </div>
          </form>
        )}

        {hasReplies && (
          <div className="view-replies">
            <Button
              startIcon={expandedComments.has(comment.id) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              onClick={() => toggleReplies(comment.id)}
              size="small"
              className="view-replies-btn"
            >
              {expandedComments.has(comment.id) ? 'Hide' : 'View'} {getReplies(comment.id).length} replies
            </Button>
          </div>
        )}

        {renderReplies(comment.id, 1)}
      </div>
    );
  };

  return (
    <div className={`comments-section ${darkMode ? 'dark-mode' : ''}`}>
      <div className="comments-list">
        {comments.filter(comment => !comment.commentRepliedToId).map(comment => renderComment(comment))}
      </div>
      <div className="post-comment-section">
        <form onSubmit={handleSubmitComment} className="comment-form">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            size="small"
            className={darkMode ? 'dark-mode' : ''}
          />
          <IconButton type="submit" disabled={!newComment.trim()}>
            <SendIcon />
          </IconButton>
        </form>
      </div>
    </div>
  );
};

export default Comments;
