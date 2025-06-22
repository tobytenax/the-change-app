import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { Box, Container, Alert, Snackbar } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import { loadUser } from '../../slices/authSlice';
import { removeAlert } from '../../slices/alertSlice';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const { alerts } = useSelector(state => state.alert);
  
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);
  
  const handleCloseAlert = (id) => {
    dispatch(removeAlert(id));
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children || <Outlet />}
      </Container>
      <Footer />
      
      {alerts.map(alert => (
        <Snackbar 
          key={alert.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => handleCloseAlert(alert.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => handleCloseAlert(alert.id)} 
            severity={alert.type} 
            sx={{ width: '100%' }}
          >
            {alert.msg}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};

export default Layout;
