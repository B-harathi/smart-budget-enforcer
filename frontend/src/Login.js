 
/**
 * Login Component for Smart Budget Enforcer
 * Person Y Guide: This handles user authentication (login and registration)
 * Person X: This is the login screen where users enter their credentials
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Container,
  Alert,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

import { loginUser, registerUser } from './api';

const Login = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState(0); // 0 = Login, 1 = Register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Person Y: Form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'finance_manager',
  });

  // Person Y: Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
  };

  // Person Y: Handle input changes for login form
  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  // Person Y: Handle input changes for register form
  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  // Person Y: Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginUser(loginForm);
      
      if (response.success) {
        onLoginSuccess(response.user);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Person Y: Handle registration submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Person Y: Validate password confirmation
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = registerForm;
      const response = await registerUser(registerData);
      
      if (response.success) {
        onLoginSuccess(response.user);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            maxWidth: 500,
            mx: 'auto',
            overflow: 'visible',
            position: 'relative',
          }}
        >
          {/* Person Y: Header with icon and title */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
              py: 3,
              borderRadius: '12px 12px 0 0',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <AccountBalanceIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Smart Budget Enforcer
            </Typography>
            <Typography variant="subtitle1">
              AI-powered budget monitoring for your business
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Person Y: Tabs for Login/Register */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>

            {/* Person Y: Error message */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Person Y: Login Form */}
            {activeTab === 0 && (
              <Box component="form" onSubmit={handleLoginSubmit} noValidate>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Login to Dashboard'
                  )}
                </Button>

                <Typography variant="body2" color="text.secondary" align="center">
                  Don't have an account? Click the Register tab above.
                </Typography>
              </Box>
            )}

            {/* Person Y: Registration Form */}
            {activeTab === 1 && (
              <Box component="form" onSubmit={handleRegisterSubmit} noValidate>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={registerForm.name}
                  onChange={handleRegisterChange}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <Typography variant="body2" color="text.secondary" align="center">
                  Already have an account? Click the Login tab above.
                </Typography>
              </Box>
            )}
          </CardContent>

          {/* Person Y: Demo credentials hint */}
          <Box
            sx={{
              backgroundColor: '#f8f9fa',
              padding: 2,
              borderRadius: '0 0 12px 12px',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              💡 Demo Tip: Register with any email to get started immediately
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;