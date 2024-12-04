import React, { useState, useEffect } from 'react';
import { Button, TextField, Container } from '@mui/material';
import { fetchPostData } from 'client/client';
import { useNavigate } from 'react-router-dom';
import '../register.scss';

const AuthRegister = () => {
  const [userName, setUserName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', userName: '', confirmPassword: '', name: '' });
  const [registerError, setRegisterError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('token');
    if (isLoggedIn) {
      navigate('/');
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

  const validateUsername = () => {
    return userName.length >= 3 && userName.length <= 20;
  };

  const validateName = () => {
    return name.length > 0; // Kiểm tra nếu `name` không rỗng
  };

  const handleRegister = async () => {
    setErrors({ email: '', password: '', userName: '', confirmPassword: '', name: '' });

    if (!validateUsername()) {
      setErrors((prevErrors) => ({ ...prevErrors, userName: 'Username must be between 3 and 20 characters' }));
      return;
    }

    if (!validateName()) {
      setErrors((prevErrors) => ({ ...prevErrors, name: 'Name cannot be empty' }));
      return;
    }

    if (!validateEmail()) {
      setErrors((prevErrors) => ({ ...prevErrors, email: 'Invalid email format' }));
      return;
    }

    if (!validatePassword()) {
      setErrors((prevErrors) => ({ ...prevErrors, password: 'Password must be at least 6 characters' }));
      return;
    }

    if (password !== confirmPassword) {
      setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: 'Passwords do not match' }));
      return;
    }

    try {
      await fetchPostData('/auth/users/add', { userName, name, email, password });
      setRegisterError('');
      navigate('/login');
      window.location.reload();
    } catch (error) {
      console.error('Register error:', error);
      setRegisterError('An error occurred during registration');
    }
  };

  return (
    <div className="register">
      <div className="registerWrapper">
        <div className="registerLeft">
          <h3 className="registerLogo">FaceBook</h3>
          <span className="registerDesc">Connect with friends and the world around you on Facebook.</span>
        </div>
        <div className="registerRight">
          <div className="registerBox">
            <Container>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={Boolean(errors.name)}
                helperText={errors.name}
              />
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                error={Boolean(errors.userName)}
                helperText={errors.userName}
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email}
              />
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(errors.password)}
                helperText={errors.password}
              />
              <TextField
                label="Confirm Password"
                variant="outlined"
                type="password"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
              />
              {registerError && <div className="alert alert-danger">{registerError}</div>}
              <Button variant="contained" color="primary" fullWidth onClick={handleRegister}>
                Sign Up
              </Button>
              <Button variant="outlined" color="secondary" fullWidth onClick={() => navigate('/login')}>
                Log into Account
              </Button>
            </Container>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRegister;
