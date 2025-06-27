 
/**
 * Smart Budget Enforcer - Main React App
 * Person Y Guide: This is the main app component that handles routing
 * Person X: This is like the main page that decides which screen to show
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';

// Import components
import Login from './Login';
import Dashboard from './Dashboard';
import Upload from './Upload';
import ExpenseTracker from './ExpenseTracker';
import Alerts from './Alerts';
import Navbar from './Navbar';

// Import API functions
import { getCurrentUser, isAuthenticated } from './api';

// Person Y: Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    // Person Y: Custom component styles
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Person Y: Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Person Y: Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <div>Loading...</div>
        </Box>
      );
    }

    return isAuthenticated() ? children : <Navigate to="/login" replace />;
  };

  // Person Y: Handle successful login
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  // Person Y: Handle logout
  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <div>Loading Smart Budget Enforcer...</div>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Person Y: Show navbar only when authenticated */}
          {isAuthenticated() && <Navbar user={user} onLogout={handleLogout} />}
          
          {/* Person Y: Main content area */}
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              {/* Person Y: Public route - Login */}
              <Route
                path="/login"
                element={
                  isAuthenticated() ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Login onLoginSuccess={handleLoginSuccess} />
                  )
                }
              />

              {/* Person Y: Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/expenses"
                element={
                  <ProtectedRoute>
                    <ExpenseTracker />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <Alerts />
                  </ProtectedRoute>
                }
              />

              {/* Person Y: Default redirect */}
              <Route
                path="/"
                element={
                  <Navigate
                    to={isAuthenticated() ? "/dashboard" : "/login"}
                    replace
                  />
                }
              />

              {/* Person Y: 404 fallback */}
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      minHeight="60vh"
                      flexDirection="column"
                    >
                      <h2>404 - Page Not Found</h2>
                      <p>The page you're looking for doesn't exist.</p>
                    </Box>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Box>
        </Box>

        {/* Person Y: Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '8px',
            },
            success: {
              iconTheme: {
                primary: '#4caf50',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f44336',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;