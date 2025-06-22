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
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from 'react-router-dom';
import { getProposals } from '../slices/proposalSlice';

const Proposals = () => {
  const dispatch = useDispatch();
  const { proposals, loading, totalPages, currentPage } = useSelector(state => state.proposal);
  
  const [filters, setFilters] = useState({
    scope: '',
    status: '',
    searchTerm: '',
    page: 1
  });
  
  useEffect(() => {
    dispatch(getProposals({
      scope: filters.scope,
      status: filters.status,
      page: filters.page
    }));
  }, [dispatch, filters.scope, filters.status, filters.page]);
  
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1 // Reset to first page when filters change
    });
  };
  
  const handlePageChange = (event, value) => {
    setFilters({
      ...filters,
      page: value
    });
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    // In a real implementation, we would add search functionality
    // For now, we'll just filter client-side
  };
  
  const filteredProposals = proposals.filter(proposal => 
    proposal.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    proposal.summary.toLowerCase().includes(filters.searchTerm.toLowerCase())
  );
  
  const renderFilters = () => (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Filter Proposals
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id="scope-label">Scope</InputLabel>
            <Select
              labelId="scope-label"
              id="scope"
              name="scope"
              value={filters.scope}
              label="Scope"
              onChange={handleFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="local">Local</MenuItem>
              <MenuItem value="regional">Regional</MenuItem>
              <MenuItem value="national">National</MenuItem>
              <MenuItem value="global">Global</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={filters.status}
              label="Status"
              onChange={handleFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              name="searchTerm"
              label="Search"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </Grid>
      </Grid>
    </Paper>
  );
  
  const renderProposalList = () => (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Proposals
        </Typography>
        <Button
          component={Link}
          to="/create-proposal"
          variant="contained"
        >
          Create Proposal
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredProposals.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {filteredProposals.map(proposal => (
              <Grid item xs={12} key={proposal._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" component="div">
                          {proposal.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2 }}>
                          <Chip 
                            label={proposal.scope} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={proposal.status} 
                            size="small" 
                            color={proposal.status === 'open' ? 'success' : 'default'} 
                            variant="outlined" 
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(proposal.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {proposal.summary}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          By: {proposal.author?.name || 'Anonymous'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Location: {proposal.location?.city}, {proposal.location?.country}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Votes: {proposal.yesVotes + proposal.noVotes}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Comments: {proposal.commentCount || 0}
                        </Typography>
                      </Box>
                    </Box>
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
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={currentPage} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        </>
      ) : (
        <Alert severity="info">No proposals found matching your criteria</Alert>
      )}
    </Paper>
  );
  
  return (
    <Container maxWidth="lg">
      {renderFilters()}
      {renderProposalList()}
    </Container>
  );
};

export default Proposals;
