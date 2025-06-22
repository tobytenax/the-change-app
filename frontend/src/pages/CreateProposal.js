import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { createProposal } from '../slices/proposalSlice';
import { formatTokenBalance } from '../utils/tokenUtils';

const CreateProposal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error } = useSelector(state => state.proposal);
  const { acentBalance } = useSelector(state => state.token);
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    scope: 'local',
    location: {
      city: '',
      state: '',
      country: ''
    }
  });
  
  const { title, summary, description, scope, location } = formData;
  
  const onChange = e => {
    if (e.target.name.includes('.')) {
      const [parent, child] = e.target.name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };
  
  const onSubmit = e => {
    e.preventDefault();
    dispatch(createProposal(formData)).then(result => {
      if (!result.error) {
        navigate(`/proposals/${result.payload._id}`);
      }
    });
  };
  
  const hasInsufficientBalance = acentBalance < 5;
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Proposal
        </Typography>
        
        <Typography variant="body1" paragraph>
          Create a new proposal for the community to vote on. This will cost 5 Acents.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            Your balance:
          </Typography>
          <Chip 
            label={formatTokenBalance(acentBalance, 'acent')} 
            color={hasInsufficientBalance ? 'error' : 'primary'} 
            variant="outlined" 
          />
        </Box>
        
        {hasInsufficientBalance && (
          <Alert severity="error" sx={{ mb: 3 }}>
            You need at least 5 Acents to create a proposal. Pass quizzes to earn more Acents.
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {Array.isArray(error) ? error[0].msg : error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Title"
                name="title"
                value={title}
                onChange={onChange}
                disabled={loading || hasInsufficientBalance}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Summary"
                name="summary"
                value={summary}
                onChange={onChange}
                multiline
                rows={2}
                helperText="A brief summary of your proposal (max 200 characters)"
                inputProps={{ maxLength: 200 }}
                disabled={loading || hasInsufficientBalance}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Description"
                name="description"
                value={description}
                onChange={onChange}
                multiline
                rows={6}
                helperText="Detailed description of your proposal"
                disabled={loading || hasInsufficientBalance}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="scope-label">Scope</InputLabel>
                <Select
                  labelId="scope-label"
                  name="scope"
                  value={scope}
                  label="Scope"
                  onChange={onChange}
                  disabled={loading || hasInsufficientBalance}
                >
                  <MenuItem value="local">Local</MenuItem>
                  <MenuItem value="regional">Regional</MenuItem>
                  <MenuItem value="national">National</MenuItem>
                  <MenuItem value="global">Global</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="City"
                name="location.city"
                value={location.city}
                onChange={onChange}
                disabled={loading || hasInsufficientBalance}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State/Province"
                name="location.state"
                value={location.state}
                onChange={onChange}
                disabled={loading || hasInsufficientBalance}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Country"
                name="location.country"
                value={location.country}
                onChange={onChange}
                disabled={loading || hasInsufficientBalance}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Cost: 5 Acents
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || hasInsufficientBalance}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Proposal'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateProposal;
