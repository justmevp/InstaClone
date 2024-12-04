import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined';
import CloseIcon from '@mui/icons-material/Close';
import React, { useState, useRef, useEffect } from 'react';
import { fetchPutFileUploadWithAuth, fetchGetDataWithAuth  } from 'client/client'; // Giả sử bạn đã có hàm này trong client.js
import './editProfile.scss';

const EditProfile = () => {
  const form = useRef();
  const checkBtn = useRef();

  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [successful, setSuccessful] = useState(false);
  const [message, setMessage] = useState('');

  const removeProfileImage = () => {
    setProfileFile(null);
  };

  const removeCoverImage = () => {
    setCoverFile(null);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchGetDataWithAuth('/auth/profile');
        const data = await response.data;
        console.log("User info", data);
        setName(data.name);
        setUserName(data.username);
        setBio(data.bio);
        setPhoneNumber(data.phone);
        setAddress(data.address);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append(
      'usersDTO',
      new Blob([JSON.stringify({ name: name, userName: userName, bio: bio, phoneNumber: phoneNumber, address: address })], {
        type: 'application/json'
      })
    );

    if (profileFile) {
      formData.append('file', profileFile);
    }
    if (coverFile) {
      formData.append('file2', coverFile);
    }
    try {
      await fetchPutFileUploadWithAuth('/auth/profile/update-profile', formData);
      console.log('Sent Info', formData);
      setMessage('Profile Updated successfully');
      setSuccessful(true);
      setProfileFile(null); // Reset ảnh đại diện sau khi cập nhật
      setCoverFile(null); // Reset ảnh bìa sau khi cập nhật
    } catch (error) {
      const resMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      setMessage(resMessage);
      setSuccessful(false);
      setProfileFile(null);
      setCoverFile(null);
    }
  };

  return (
    <div className="editProfile">
      <div className="editProfileWrapper">
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              <img src={coverFile ? URL.createObjectURL(coverFile) : ''} alt="" className="profileCoverImg" />
              <img
                src={profileFile ? URL.createObjectURL(profileFile) : ''}
                alt="User_Image"
                className="profileUserImg"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = '';
                }}
              />
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">{name}</h4>
              <span className="profileInfoDesc">Hi Friends!</span>
            </div>
          </div>
          <div className="editprofileRightBottom">
            <div className="top">
              <h1>Edit User Profile</h1>
            </div>
            <div className="bottom">
              <div className="left">
                <img src={profileFile ? URL.createObjectURL(profileFile) : ''} alt="" />
              </div>
              <div className="right">
                <form onSubmit={handleRegister} ref={form}>
                  <div className="formInput">
                    <div className="imageInputLine">
                      <div className="imageInputText">Profile Image: </div>
                      {profileFile ? (
                        <CloseIcon className="icon" onClick={removeProfileImage} style={{ color: '#ff605c' }} />
                      ) : (
                        <label htmlFor="profileFile">
                          <DriveFolderUploadOutlinedIcon className="icon" />
                        </label>
                      )}
                      <input
                        type="file"
                        id="profileFile"
                        accept=".png,.jpeg,.jpg"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          setProfileFile(e.target.files[0]);
                          e.target.value = null;
                        }}
                      />
                    </div>
                  </div>

                  <div className="formInput">
                    <div className="imageInputLine">
                      <div className="imageInputText">Cover Image: </div>
                      {coverFile ? (
                        <CloseIcon className="icon" onClick={removeCoverImage} style={{ color: '#ff605c' }} />
                      ) : (
                        <label htmlFor="coverFile">
                          <DriveFolderUploadOutlinedIcon className="icon" />
                        </label>
                      )}
                      <input
                        type="file"
                        id="coverFile"
                        accept=".png,.jpeg,.jpg"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          setCoverFile(e.target.files[0]);
                          e.target.value = null;
                        }}
                      />
                    </div>
                  </div>
                  <div className="formInput">
                  <label htmlFor="bio">Bio</label>
                    <input type="text" placeholder="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
                  </div>
                  <div className="formInput">
                  <label htmlFor="name">Name</label>
                    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="formInput">
                  <label htmlFor="userName">Username</label>
                    <input type="text" placeholder="UserName" value={userName} onChange={(e) => setUserName(e.target.value)} />
                  </div>
                  <div className="formInput">
                  <label htmlFor="phoneNumber">Phone</label>
                    <input type="text" placeholder="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  </div>
                  <div className="formInput">
                  <label htmlFor="address">Address</label>
                    <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>

                  {message && (
                    <div className="form-group">
                      <div className={successful ? 'alert alert-success' : 'alert alert-danger'}>{message}</div>
                    </div>
                  )}

                  <button type="submit" className="updateButton" ref={checkBtn}>
                    Update Profile
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
