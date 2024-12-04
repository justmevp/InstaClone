import React, { useEffect, useState } from "react";
import "./friends.scss";
import { useNavigate } from "react-router-dom";
import { fetchGetDataArrayBuffer } from "client/client";
import { Buffer } from "buffer";

const Friends = ({ user }) => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const response = await fetchGetDataArrayBuffer(user.photos.profileImage);
        
        // Convert ArrayBuffer thành base64
        const base64Image = `data:image/jpeg;base64,${Buffer.from(response.data).toString("base64")}`;
        setProfileImage(base64Image);
      } catch (error) {
        console.error("Error loading profile image:", error);
        setProfileImage();
      }
    };

    loadImage();
  }, [user.photos.profileImage]);

  return (
    <div>
      <button
        className="sidebarFriend"
        onClick={() => navigate(`/profile/${user.id}`)}
      >
        <img
          src={profileImage}
          alt="User_Image"
          className="sidebarFriendImg"
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = "/assets/profileCover/DefaultProfile.jpg";
          }}
        />
        <span className="sidebarFriendName">
          {user.firstName || user.userName}
        </span>
      </button>
    </div>
  );
};

export default Friends;
