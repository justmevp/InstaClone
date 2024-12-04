import React, { useEffect, useState } from "react"; 
import "./profile.scss"; 
import Feed from "../../components/feed/Feed"; 
import { useParams } from "react-router-dom";
import { fetchGetDataWithAuth, fetchGetDataArrayBuffer } from "client/client"; 
import { Buffer } from 'buffer'; 
import Rightbar from "components/rightbar/Rightbar"; 

// Hàm lấy tên đầy đủ người dùng, ưu tiên hiển thị name, nếu không có sẽ lấy userName, nếu cả hai không có thì trả về "Unknown User"
const getFullName = (u) => {
  return u.name || u.userName || "Unknown User";
};

const Profile = () => {
  let { userId } = useParams(); // Lấy userId từ URL thông qua useParams
  const [profileUser, setProfileUser] = useState(null); // Khởi tạo state lưu thông tin người dùng
  const [profileImage, setProfileImage] = useState(null); // Khởi tạo state lưu ảnh đại diện người dùng
  const [coverImage, setCoverImage] = useState(null); // Khởi tạo state lưu ảnh bìa người dùng

  // Sử dụng useEffect để gọi API lấy dữ liệu người dùng khi userId thay đổi
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Gọi API lấy thông tin người dùng
        const userInfo = await fetchGetDataWithAuth(`/auth/users/${userId}`);
        setProfileUser(userInfo.data); // Lưu dữ liệu người dùng vào state

        // Kiểm tra và lấy ảnh đại diện nếu có
        if (userInfo.data.photoProfile?.profileImage) {
          const imageBuffer = await fetchGetDataArrayBuffer(userInfo.data.photoProfile.profileImage); // Gọi API lấy ảnh đại diện
          const buffer = Buffer.from(imageBuffer.data, "binary").toString("base64"); // Chuyển ảnh thành base64
          setProfileImage(`data:image/jpeg;base64,${buffer}`); // Lưu ảnh đại diện vào state
        }

        // Kiểm tra và lấy ảnh bìa nếu có
        if (userInfo.data.coverPhoto?.coverImage) {
          const imageBuffer2 = await fetchGetDataArrayBuffer(userInfo.data.coverPhoto.coverImage); // Gọi API lấy ảnh bìa
          const buffer2 = Buffer.from(imageBuffer2.data, "binary").toString("base64"); // Chuyển ảnh bìa thành base64
          setCoverImage(`data:image/jpeg;base64,${buffer2}`); // Lưu ảnh bìa vào state
        }

      } catch (error) {
        console.error("Error fetching profile:", error); // In lỗi ra console nếu có lỗi khi fetch dữ liệu
      }
    };

    fetchUserProfile(); // Gọi hàm fetchUserProfile để lấy dữ liệu người dùng
  }, [userId]); // useEffect sẽ chạy lại khi userId thay đổi

  // Nếu dữ liệu người dùng chưa tải xong, hiển thị thông báo Loading
  if (!profileUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile">
      <div className="profileWrapper">
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              <img
                src={coverImage} // Gán ảnh bìa vào src của thẻ img
                alt=""
                className="profileCoverImg"
              />
              <img
                src={profileImage} // Gán ảnh đại diện vào src của thẻ img
                alt="User_Image"
                className="profileUserImg"
                onError={({ currentTarget }) => { // Xử lý lỗi khi ảnh không tải được
                  currentTarget.onerror = null; // Ngăn lặp vô hạn khi xảy ra lỗi
                  currentTarget.src = ""; // Gán đường dẫn rỗng nếu không tải được ảnh
                }}
              />
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">{getFullName(profileUser)}</h4> {/* Hiển thị tên đầy đủ của người dùng */}
              <span className="profileInfoDesc">Hi Friends!</span> {/* Hiển thị một đoạn mô tả */}
            </div>
          </div>
          <div className="profileRightBottom">
            <Feed /> {/* Component Feed để hiển thị bài đăng */}
            <Rightbar profile user={profileUser} /> {/* Component Rightbar với thông tin người dùng */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; // Export component Profile
