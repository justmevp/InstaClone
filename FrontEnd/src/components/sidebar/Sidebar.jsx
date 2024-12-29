import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import GroupsIcon from '@mui/icons-material/Groups';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';

import './sidebar.scss';
import MenuLink from '../menuLink/MenuLink';
import Friends from '../friends/Friends';
import { DarkModeContext } from 'components/context/darkModeContext';
import { fetchGetDataWithAuth } from 'client/client';
import Logout from "pages/authentication/Logout";

const Sidebar = () => {
  const { dispatch } = useContext(DarkModeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [friends, setFriends] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchGetDataWithAuth('/users/mutual-friends');
        const data = await response.data;
        setFriends(data || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (location.pathname === '/search') {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [location.pathname]);

  if (!showSidebar) {
    return null;
  }

  return (
    <div className="sidebar">
      <div className="sidebarWrapper">
        {/* Feed Link */}
        <span
          role="button"
          tabIndex={0}
          onClick={() => navigate('/')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate('/');
          }}
        >
          <MenuLink Icon={<RssFeedIcon />} text="Feed" />
        </span>

        {/* Groups Link */}
        <span
          role="button"
          tabIndex={0}
          onClick={() => navigate('/groups')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate('/groups');
          }}
        >
          <MenuLink Icon={<GroupsIcon />} text="Groups" />
        </span>

        {/* Friends Link */}
        <span
          role="button"
          tabIndex={0}
          onClick={() =>  navigate(`/profile`)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate(`/profile`);
          }}
        >
          <MenuLink Icon={<PeopleAltIcon />} text="Friends" />
        </span>

        {/* Dark Mode Toggle */}
        <span
          role="button"
          tabIndex={0}
          onClick={() => dispatch({ type: "TOGGLE" })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') dispatch({ type: "TOGGLE" });
          }}
        >
          <MenuLink Icon={<Brightness4Icon />} text="Dark Mode" />
        </span>

        {/* Logout Button */}
        <span
          role="button"
          tabIndex={0}
          onClick={() => {
            Logout();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') Logout();
          }}
        >
          <MenuLink Icon={<ExitToAppOutlinedIcon />} text="Logout" />
        </span>

        <hr className="sidebarHr" />

        {/* Friends List */}
        {friends && (
          <ul className="sidebarFriendList">
            {friends.map((u) => (
              <Friends key={u.userId} user={u} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
