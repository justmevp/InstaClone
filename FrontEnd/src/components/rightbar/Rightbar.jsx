import React from "react";
import "./rightbar.scss";
import ProfileRightBar from "../profileRightBar/ProfileRightBar";

const Rightbar = ({ profile, user }) => {
  // Chỉ hiển thị Rightbar khi profile là true
  if (!profile) return null;

  return (
    <div className="rightbar">
      <div className="rightbarWrapper">
        <ProfileRightBar user={user} />
      </div>
    </div>
  );
};

export default Rightbar;
