import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchPostData } from "client/client"; // Sử dụng hàm fetchPostData để gọi API đăng nhập
import "../login.scss";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("token");
    if (isLoggedIn) {
      navigate("/");
      window.location.reload();
    }
  }, []);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = () => {
    return password.length >= 6 && password.length <= 15;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "" });

    if (!validateEmail()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "Invalid email format",
      }));
      return;
    }

    if (!validatePassword()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: "Password must be at least 6 characters",
      }));
      return;
    }

    fetchPostData("/auth/token", { email, password })
      .then((response) => {
        const { token } = response.data;
        setLoginError("");
        localStorage.setItem("token", token);
        navigate("/");
        window.location.reload();
      })
      .catch((error) => {
        console.error("Login error:", error);
        setLoginError("An error occurred during login");
      });
  };

  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo">FaceBook</h3>
          <span className="loginDesc">
            Connect with friends and the world around you on Facebook.
          </span>
        </div>
        <div className="loginRight">
          <div className="loginBox">
            <form className="bottomBox" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                className="loginInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <div className="alert alert-danger">{errors.email}</div>}
              <input
                type="password"
                placeholder="Password"
                className="loginInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <div className="alert alert-danger">{errors.password}</div>}
              {loginError && <div className="alert alert-danger">{loginError}</div>}
              <button type="submit" className="loginButton">Sign In</button>
              <Link to="/register">
                <button className="loginRegisterButton">Create a New Account</button>
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
