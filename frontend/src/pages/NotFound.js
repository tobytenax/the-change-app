import React from 'react';
import { Box, Typography, Container, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
        <Typography variant="h1" color="primary" sx={{ fontSize: '6rem', fontWeight: 'bold' }}>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" paragraph>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            size="large"
          >
            Return to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;
