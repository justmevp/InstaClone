import React, { useEffect, useState } from "react";
import "./menuLink.scss";
import { fetchGetDataWithAuth } from "client/client"; // Giả sử fetchGetDataWithAuth được định nghĩa trong client.js

const getName = (user) => {
  return user && (user.name || user.userName) ? user.name || user.userName : "User";
};

const MenuLink = ({ Icon, text }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user profile data from /profile endpoint
    const fetchUserProfile = async () => {
      try {
        const response = await fetchGetDataWithAuth("/auth/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    

    fetchUserProfile();
  }, []);

  return (
    <div className="menuLink">
      {Icon}
      <span className="menuLinkText">{text}</span>
      <span className="menuLinkTextName">
        {text === "Logout" && `(${getName(user)})`}
      </span>
    </div>
  );
};

export default MenuLink;
