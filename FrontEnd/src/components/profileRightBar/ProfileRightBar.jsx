import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import './profileRightBar.scss';
import Online from '../online/Online';
import { fetchGetDataWithAuth, fetchPostDataWithAuth, fetchDeleteDataWithAuth } from 'client/client';

const ProfileRightBar = ({ user }) => { // Khai báo component ProfileRightBar với props là user
  const [friends, setFriends] = useState([]); // Khai báo state friends để lưu danh sách bạn bè
  const [fStatus, setFStatus] = useState(null); // Khai báo state fStatus để lưu trạng thái theo dõi
  const [isOwnProfile, setIsOwnProfile] = useState(false); // Khai báo state isOwnProfile để kiểm tra xem đây có phải là trang cá nhân của người dùng hay không

  useEffect(() => { // Hook để thực hiện tác vụ khi component được render
  }, [user]); // Chạy lại khi user thay đổi

  useEffect(() => { // Hook để lấy danh sách bạn bè
    const fetchFriends = async () => { // Hàm bất đồng bộ để lấy danh sách bạn bè
      if (user && isOwnProfile) { // Kiểm tra nếu có user và đây là trang cá nhân của chính mình
        try {
          const response = await fetchGetDataWithAuth(`/users/mutual-friends`); // Gọi API để lấy danh sách bạn bè chung
          const friendData = response.data; // Lưu dữ liệu bạn bè vào biến friendData
          setFriends(Array.isArray(friendData) ? friendData : []); // Cập nhật state friends với dữ liệu bạn bè
        } catch (error) {
          console.error('Error fetching friends:', error); // Ghi log lỗi nếu có
        }
      }
    };
    fetchFriends(); // Gọi hàm fetchFriends
  }, [user, isOwnProfile]); // Chạy lại khi user hoặc isOwnProfile thay đổi

  useEffect(() => { // Hook để kiểm tra trạng thái trang cá nhân
    const checkProfileStatus = async () => { // Hàm bất đồng bộ để kiểm tra trạng thái
      if (user) { // Kiểm tra nếu có user
        try {
          const currentUser = await fetchGetDataWithAuth('/auth/profile'); // Gọi API để lấy thông tin người dùng hiện tại
          setIsOwnProfile(currentUser.data.userId === user.id); // Kiểm tra nếu đây là trang cá nhân của chính mình

          if (currentUser.data.userId !== user.id) { // Nếu không phải trang cá nhân của chính mình
            const response = await fetchGetDataWithAuth(`/users/${user.id}/follow-status`); // Gọi API để lấy trạng thái theo dõi
            const status = response.data === 'F' ? 'F' : null; // Nếu trạng thái là 'F', lưu vào status
            setFStatus(status); // Cập nhật trạng thái theo dõi
            console.log('Follow status:', status); // Ghi log trạng thái theo dõi
          }
        } catch (error) {
          console.error('Error checking profile status:', error); // Ghi log lỗi nếu có
        }
      }
    };
    checkProfileStatus(); // Gọi hàm checkProfileStatus
  }, [user]); // Chạy lại khi user thay đổi

  const followHandler = async () => { // Hàm để theo dõi người dùng
    try {
      await fetchPostDataWithAuth(`/users/${user.id}/followers/add`, { method: 'POST' }); // Gọi API để thêm người theo dõi
      setFStatus('F'); // Cập nhật trạng thái theo dõi thành 'F'
    } catch (error) {
      console.error('Error following user:', error); // Ghi log lỗi nếu có
    }
  };

  const unfollowHandler = async () => { // Hàm để hủy theo dõi người dùng
    try {
      const currentUser = await fetchGetDataWithAuth('/auth/profile'); // Gọi API để lấy thông tin người dùng hiện tại
      const currentUserId = currentUser.data.userId; // Lưu ID của người dùng hiện tại

      await fetchDeleteDataWithAuth(`/users/${user.id}/followers/${currentUserId}/delete`, { method: 'DELETE' }); // Gọi API để hủy theo dõi
      setFStatus(null); // Cập nhật trạng thái theo dõi thành null
    } catch (error) {
      console.error('Error unfollowing user:', error); // Ghi log lỗi nếu có
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
        ) : fStatus === null ? ( // Nếu không phải trang cá nhân và trạng thái theo dõi là null
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
