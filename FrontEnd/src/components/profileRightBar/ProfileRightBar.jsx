import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import './profileRightBar.scss';
import Online from '../online/Online';
import { fetchGetDataWithAuth, fetchPostDataWithAuth, fetchDeleteDataWithAuth } from 'client/client';

const ProfileRightBar = ({ user }) => {
  const [friends, setFriends] = useState([]);
  const [fStatus, setFStatus] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    console.log('User data in ProfileRightBar:', user); // Log user để kiểm tra xem user có đúng không
  }, [user]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (user && isOwnProfile) { // Thêm điều kiện kiểm tra isOwnProfile
        try {
          const response = await fetchGetDataWithAuth(`/users/mutual-friends`);
          const friendData = response.data;
          setFriends(Array.isArray(friendData) ? friendData : []);
        } catch (error) {
          console.error('Error fetching friends:', error); // Log lỗi nếu có
        }
      }
    };
    fetchFriends();
  }, [user, isOwnProfile]);


  useEffect(() => {
    const checkProfileStatus = async () => {
      if (user) {
        try {
          const currentUser = await fetchGetDataWithAuth('/auth/profile');
          setIsOwnProfile(currentUser.data.userId === user.id); // Kiểm tra nếu là trang cá nhân của chính họ

          if (currentUser.data.userId !== user.id) {
            const response = await fetchGetDataWithAuth(`/users/${user.id}/follow-status`);
            const status = response.data === 'F' ? 'F' : null;
            setFStatus(status);
            console.log('Follow status:', status);
          }
        } catch (error) {
          console.error('Error checking profile status:', error);
        }
      }
    };
    checkProfileStatus();
  }, [user]);

  const followHandler = async () => {
    try {
      await fetchPostDataWithAuth(`/users/${user.id}/followers/add`, { method: 'POST' });
      setFStatus('F');
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const unfollowHandler = async () => {
    try {
      const currentUser = await fetchGetDataWithAuth('/auth/profile');
      const currentUserId = currentUser.data.userId;

      await fetchDeleteDataWithAuth(`/users/${user.id}/followers/${currentUserId}/delete`, { method: 'DELETE' });
      setFStatus(null);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  return (
    <div className="profileRightBar">
      <div className="profileRightBarHeading">
        <span className="profileRightBarTitle">User Information</span>

        {isOwnProfile ? (
          <Link to="/profile/edit" style={{ textDecoration: 'none' }}>
            <span className="editButton">Edit Profile</span>
          </Link>
        ) : fStatus === null ? (
          <span
            className="addFriendButton"
            onClick={followHandler}
            role="button"
            tabIndex="0"
            onKeyDown={(e) => e.key === 'Enter' && followHandler()}
          >
            <PersonAddIcon />
            <span className="addFriendText">Follow</span>
          </span>
        ) : (
          fStatus === 'F' && (
            <span
              className="withdrawFriendButton"
              onClick={unfollowHandler}
              role="button"
              tabIndex="0"
              onKeyDown={(e) => e.key === 'Enter' && unfollowHandler()}
            >
              <CloseIcon />
              <span className="addFriendText">Unfollow</span>
            </span>
          )
        )}
      </div>

      <div className="profileRightBarInfo">
        {user && (
          <>
           <div className="profileRightBarInfoItem">
              <span className="profileRightBarInfoKey">Bio:</span>
              <span className="profileRightBarInfoValue">{user.bio}</span>
            </div>
            <div className="profileRightBarInfoItem">
              <span className="profileRightBarInfoKey">Name:</span>
              <span className="profileRightBarInfoValue">{user.name}</span>
            </div>
            {user.phoneNumber  && (
              <div className="profileRightBarInfoItem">
                <span className="profileRightBarInfoKey">Phone Number:</span>
                <span className="profileRightBarInfoValue">{user.phoneNumber}</span>
              </div>
            )}
            {user.address && (
              <div className="profileRightBarInfoItem">
                <span className="profileRightBarInfoKey">Address:</span>
                <span className="profileRightBarInfoValue">{user.address}</span>
              </div>
            )}
          </>
        )}
      </div>

      {isOwnProfile && ( // Chỉ hiển thị danh sách bạn bè khi là trang cá nhân của chính mình
        <>
          <h4 className="profileRightBarTitle">Friends</h4>
          <div className="profileRightBarFollowings">
            {friends && Array.isArray(friends) && friends.length > 0 ? (
              friends.map((u) => <Online key={u.userId} user={u} />)
            ) : (
              <span>No friends to display</span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileRightBar;
