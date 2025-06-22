import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getProposals } from '../slices/proposalSlice';
import { getTokenBalance } from '../slices/tokenSlice';
import { formatTokenBalance } from '../utils/tokenUtils';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { proposals, loading: proposalLoading } = useSelector(state => state.proposal);
  const { acentBalance, dcentBalance, loading: tokenLoading } = useSelector(state => state.token);
  
  const [localProposals, setLocalProposals] = useState([]);
  
  useEffect(() => {
    dispatch(getProposals({ limit: 5 }));
    
    if (isAuthenticated) {
      dispatch(getTokenBalance());
    }
  }, [dispatch, isAuthenticated]);
  
  useEffect(() => {
    if (proposals && proposals.length > 0) {
      setLocalProposals(proposals.slice(0, 5));
    }
  }, [proposals]);
  
  const renderWelcomeSection = () => (
    <Paper elevation={3} sx={{ p: 4, mb: 4, bgcolor: 'primary.light', color: 'white' }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Change App
      </Typography>
      <Typography variant="body1" paragraph>
        The Change App is a digital platform merging characteristics of an online forum with mechanisms for direct democracy.
        Participate in proposals, demonstrate your competence through quizzes, and earn tokens for your contributions.
      </Typography>
      {!isAuthenticated && (
        <Box sx={{ mt: 2 }}>
          <Button 
            component={Link} 
            to="/register" 
            variant="contained" 
            color="secondary" 
            sx={{ mr: 2 }}
          >
            Sign Up
          </Button>
          <Button 
            component={Link} 
            to="/login" 
            variant="outlined" 
            sx={{ color: 'white', borderColor: 'white' }}
          >
            Sign In
          </Button>
        </Box>
      )}
    </Paper>
  );
  
  const renderUserDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Your Balance
          </Typography>
          {tokenLoading ? (
            <CircularProgress size={24} />
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {formatTokenBalance(acentBalance, 'acent')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Acents - earned through competence
              </Typography>
              
              <Typography variant="h4" color="secondary" sx={{ mt: 2 }}>
                {formatTokenBalance(dcentBalance, 'dcent')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dcents - earned through delegation
              </Typography>
            </Box>
          )}
          <Button 
            component={Link} 
            to="/profile" 
            variant="outlined" 
            sx={{ mt: 2 }}
          >
            View Profile
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Button 
                component={Link} 
                to="/create-proposal" 
                variant="contained" 
                fullWidth
              >
                Create Proposal
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button 
                component={Link} 
                to="/proposals" 
                variant="outlined" 
                fullWidth
              >
                Browse Proposals
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button 
                component={Link} 
                to="/onboarding" 
                variant="outlined" 
                fullWidth
              >
                Tutorial
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
  
  const renderRecentProposals = () => (
    <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Recent Proposals
      </Typography>
      {proposalLoading ? (
        <CircularProgress />
      ) : localProposals.length > 0 ? (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {localProposals.map(proposal => (
            <Grid item xs={12} sm={6} md={4} key={proposal._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" noWrap>
                    {proposal.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {new Date(proposal.createdAt).toLocaleDateString()}
                  </Typography>
                  <Chip 
                    label={proposal.scope} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {proposal.summary.substring(0, 100)}...
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/proposals/${proposal._id}`}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">No proposals found</Alert>
      )}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button 
          component={Link} 
          to="/proposals" 
          variant="contained"
        >
          View All Proposals
        </Button>
      </Box>
    </Paper>
  );
  
  return (
    <Container maxWidth="lg">
      {renderWelcomeSection()}
      
      {isAuthenticated && renderUserDashboard()}
      
      {renderRecentProposals()}
    </Container>
  );
};

export default Dashboard;
