import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import './share.scss';
// import { useNavigate } from 'react-router-dom';
import { fetchGetDataWithAuth, fetchGetDataWithAuthArrayBuffer, fetchPostFileUploadWithAuth } from 'client/client';
import { Buffer } from 'buffer';

const getName = (u) => u.firstName || u.userName;

const Share = () => {
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  // const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetchGetDataWithAuth('/auth/profile');
        setUser(response.data);

        if (response.data?.photoProfile?.profileImage) {
          const imageResponse = await fetchGetDataWithAuthArrayBuffer(response.data.photoProfile.profileImage);
          const buffer = Buffer.from(imageResponse.data, "binary").toString("base64");
          setProfileImage(`data:image/jpeg;base64,${buffer}`);
        }
      } catch (error) {
        console.error('Failed to fetch user profile or profile image:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const removeImage = () => {
    setFile(null);
  };

  const handleShare = async () => {
    const formData = new FormData();

    // Tạo đối tượng JSON với caption và postTypeName
    const postData = {
        caption: description,
        postTypeName: "normal",
    };
    // Đóng gói đối tượng JSON thành Blob với header application/json
    formData.append(
        "post",
        new Blob([JSON.stringify(postData)], { type: "application/json" })
    );

    // Nếu có file, thêm file vào formData
    if (file) {
        formData.append("file", file);
    }

    try {
        await fetchPostFileUploadWithAuth('/posts/add', formData);
        setDescription('');
        setFile(null);
        window.location.reload();
    } catch (error) {
        console.error('Failed to create post:', error);
    }
};




  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          {user && (
            <>
              <img
                src={profileImage || "FrontEnd/src/assets/images/users/avatar-1.png"}
                alt="User_Image"
                className="shareProfileImg"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = "src/assets/images/users/avatar-1.png";
                }}
              />
              <input
                type="text"
                placeholder={`What's on your mind ${getName(user)} ?`}
                className="shareInput"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </>
          )}
        </div>
        <hr className="shareHr" />
        {file && (
          <div className="shareImgContainer">
            <img src={URL.createObjectURL(file)} alt="" className="shareImg" />
            <CloseIcon className="shareCancelImg" onClick={removeImage} />
          </div>
        )}
        <div className="shareBottom">
          <div className="shareOptions">
            <label htmlFor="file" className="shareOption">
              <PermMediaIcon className="shareIcon" style={{ color: '#2e0196f1' }} />
              <span className="shareOptionText">Photo/Video</span>
              <input
                type="file"
                id="file"
                accept=".png,.jpeg,.jpg"
                style={{ display: 'none' }}
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  e.target.value = null;
                }}
              />
            </label>
            <div className="shareOption">
              <button className="shareButton" disabled={!description && !file} onClick={handleShare}>
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
