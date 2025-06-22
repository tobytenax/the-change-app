import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BallotIcon from '@mui/icons-material/Ballot';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import TokenIcon from '@mui/icons-material/Token';
import { logout } from '../../slices/authSlice';
import { getTokenBalance } from '../../slices/tokenSlice';
import { formatTokenBalance } from '../../utils/tokenUtils';

const Navbar = () => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { acentBalance, dcentBalance } = useSelector(state => state.token);
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getTokenBalance());
    }
  }, [isAuthenticated, dispatch]);
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    handleCloseUserMenu();
  };
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { name: 'Proposals', path: '/proposals', icon: <BallotIcon /> }
  ];
  
  const authItems = [
    { name: 'Create Proposal', path: '/create-proposal', icon: <AddCircleIcon /> },
    { name: 'Profile', path: '/profile', icon: <AccountCircleIcon /> },
    { name: 'Help', path: '/onboarding', icon: <HelpIcon /> }
  ];
  
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Change App
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem button key={item.name} component={Link} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
        {isAuthenticated && (
          <>
            <Divider />
            {authItems.map((item) => (
              <ListItem button key={item.name} component={Link} to={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItem>
            ))}
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
  
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile menu icon */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Logo */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            CHANGE APP
          </Typography>
          
          {/* Desktop navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  component={Link}
                  to={item.path}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                  startIcon={item.icon}
                >
                  {item.name}
                </Button>
              ))}
            </Box>
          )}
          
          {/* Token balances for authenticated users */}
          {isAuthenticated && !isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Badge
                badgeContent={formatTokenBalance(acentBalance, 'acent')}
                color="secondary"
                sx={{ mr: 2 }}
              >
                <TokenIcon color="action" />
              </Badge>
              <Badge
                badgeContent={formatTokenBalance(dcentBalance, 'dcent')}
                color="error"
              >
                <TokenIcon color="action" />
              </Badge>
            </Box>
          )}
          
          {/* User menu */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user?.name} src={user?.avatar}>
                      {user?.name?.charAt(0)}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {authItems.map((item) => (
                    <MenuItem 
                      key={item.name} 
                      onClick={handleCloseUserMenu}
                      component={Link}
                      to={item.path}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {item.icon}
                        <Typography sx={{ ml: 1 }}>{item.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                  <MenuItem onClick={handleLogout}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LogoutIcon />
                      <Typography sx={{ ml: 1 }}>Logout</Typography>
                    </Box>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <Button
                  component={Link}
                  to="/login"
                  color="inherit"
                  sx={{ mr: 1 }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  color="secondary"
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
