/**
 * Navbar Component for Smart Budget Enforcer
 * Person Y Guide: This is the main navigation bar with user menu
 * Person X: This is the top bar that helps you navigate between pages
 */

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
  Chip,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Dashboard as DashboardIcon,
  CloudUpload as CloudUploadIcon,
  Receipt as ReceiptIcon,
  Warning as WarningIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

import { logoutUser } from './api';

const Navbar = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Person Y: Handle user menu
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Person Y: Handle logout
  const handleLogout = () => {
    logoutUser();
    onLogout();
    handleClose();
    navigate('/login');
  };

  // Person Y: Check if current route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Person Y: Get user initials for avatar
  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Toolbar>
        {/* Person Y: Logo and Title */}
        <Box display="flex" alignItems="center" gap={1} mr={3}>
          <AccountBalanceIcon sx={{ fontSize: 32 }} />
          <Typography variant="h6" component="div" fontWeight="bold">
            Smart Budget Enforcer
          </Typography>
        </Box>

        {/* Person Y: Navigation Links */}
        <Box display="flex" gap={1} flexGrow={1}>
          <Button
            color="inherit"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{
              backgroundColor: isActiveRoute('/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Dashboard
          </Button>

          <Button
            color="inherit"
            startIcon={<CloudUploadIcon />}
            onClick={() => navigate('/upload')}
            sx={{
              backgroundColor: isActiveRoute('/upload') ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Upload
          </Button>

          <Button
            color="inherit"
            startIcon={<ReceiptIcon />}
            onClick={() => navigate('/expenses')}
            sx={{
              backgroundColor: isActiveRoute('/expenses') ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Expenses
          </Button>

          <Button
            color="inherit"
            startIcon={
              <Badge badgeContent={0} color="error">
                <WarningIcon />
              </Badge>
            }
            onClick={() => navigate('/alerts')}
            sx={{
              backgroundColor: isActiveRoute('/alerts') ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Alerts
          </Button>
        </Box>

        {/* Person Y: User Profile Section */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Person Y: User role chip */}
          <Chip
            label={user?.role?.replace('_', ' ') || 'User'}
            size="small"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              display: { xs: 'none', sm: 'flex' },
            }}
          />

          {/* Person Y: User name (hidden on mobile) */}
          <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
            {user?.name || 'User'}
          </Typography>

          {/* Person Y: User Avatar and Menu */}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: 'rgba(255,255,255,0.2)',
                fontSize: '14px',
              }}
            >
              {user?.name ? getUserInitials(user.name) : <AccountCircleIcon />}
            </Avatar>
          </IconButton>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose} disabled>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email || 'user@example.com'}
                </Typography>
              </Box>
            </MenuItem>
            
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;