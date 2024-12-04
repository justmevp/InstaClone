import React from "react";
import "./home.scss";

import Feed from "components/feed/Feed";
import Rightbar from "components/rightbar/Rightbar";


// import { Navigate } from "react-router-dom";

const Home = () => {
  if (localStorage.getItem("token") != null) {
    return (
      <div className="home">
        <div className="homeContainer">
          <Feed />
          <Rightbar/>
        </div>
      </div>
    );
  }

  
};

export default Home;
