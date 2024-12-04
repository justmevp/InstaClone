import React, { useState, useEffect } from "react";
import "./online.scss";
import { useNavigate } from "react-router-dom";
import { fetchGetDataArrayBuffer } from "client/client";
import { Buffer } from "buffer";

const Online = ({ user }) => {
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  // Hàm xử lý sự kiện click và bàn phím
  const handleClick = () => {
    navigate(`/profile/${user.id}`);
  };

  useEffect(() => {
    const loadImage = async () => {
      try {
        const response = await fetchGetDataArrayBuffer(user.photos.profileImage);
        const base64Image = `data:image/jpeg;base64,${Buffer.from(response.data).toString("base64")}`;
        
        setProfileImage(base64Image);
      } catch (error) {
        console.error("Error loading profile image:", error);
        setProfileImage("InstaClone/src/main/resources/DefaultProfile/defaultprofile.png"); // Ảnh mặc định khi gặp lỗi
      }
    };

    if (user?.photos?.profileImage) {
      loadImage();
    } else {
      console.log("No profile image found. Using default."); // Log khi không có ảnh profile
      setProfileImage("InstaClone/src/main/resources/DefaultProfile/defaultprofile.png"); // Ảnh mặc định nếu không có ảnh
    }
  }, [user?.photos?.profileImage]);

  return (
    <div
      className="profileRightBarFollowing"
      onClick={handleClick}
      role="button"
      tabIndex="0"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      {/* Hiển thị ảnh đại diện */}
      <img
        src={profileImage || "/assets/profileCover/DefaultProfile.jpg"} // Nếu không có profileImage thì hiển thị ảnh mặc định
        alt="Profile"
        className="profileRightBarFollowingImg"
      />
      <span className="profileRightBarFollowingName">
        {user?.firstName || user?.userName}
      </span>
    </div>
  );
};

export default Online;
