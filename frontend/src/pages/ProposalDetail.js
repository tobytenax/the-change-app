import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getProposalById, closeProposal } from '../slices/proposalSlice';
import { getComments, createComment, voteOnComment, integrateComment } from '../slices/commentSlice';
import { castVote, getVotes } from '../slices/voteSlice';
import { getQuiz } from '../slices/quizSlice';
import { formatTokenBalance } from '../utils/tokenUtils';
import { shouldAutoIntegrate } from '../utils/integrationUtils';

const ProposalDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { proposal, loading: proposalLoading } = useSelector(state => state.proposal);
  const { comments, loading: commentLoading } = useSelector(state => state.comment);
  const { votes, loading: voteLoading } = useSelector(state => state.vote);
  const { quiz, loading: quizLoading } = useSelector(state => state.quiz);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { acentBalance, dcentBalance } = useSelector(state => state.token);
  
  const [commentText, setCommentText] = useState('');
  const [openCloseDialog, setOpenCloseDialog] = useState(false);
  
  useEffect(() => {
    if (id) {
      dispatch(getProposalById(id));
      dispatch(getComments(id));
      dispatch(getVotes(id));
      dispatch(getQuiz(id));
    }
  }, [dispatch, id]);
  
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      dispatch(createComment({ proposalId: id, content: commentText }));
      setCommentText('');
    }
  };
  
  const handleVote = (voteType) => {
    if (isAuthenticated) {
      dispatch(castVote({ proposalId: id, voteType }));
    } else {
      navigate('/login');
    }
  };
  
  const handleCommentVote = (commentId, voteType) => {
    if (isAuthenticated) {
      dispatch(voteOnComment({ commentId, voteType }));
    } else {
      navigate('/login');
    }
  };
  
  const handleIntegrateComment = (commentId) => {
    dispatch(integrateComment(commentId));
  };
  
  const handleCloseProposal = () => {
    dispatch(closeProposal(id));
    setOpenCloseDialog(false);
  };
  
  const isUserProposalAuthor = proposal && user && proposal.author && proposal.author._id === user._id;
  
  const renderProposalHeader = () => (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      {proposalLoading ? (
        <CircularProgress />
      ) : proposal ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {proposal.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={proposal.scope} 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  label={proposal.status} 
                  color={proposal.status === 'open' ? 'success' : 'default'} 
                  variant="outlined" 
                />
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Created: {new Date(proposal.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          
          <Typography variant="body1" paragraph>
            {proposal.summary}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body1" paragraph>
            {proposal.description}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                By: {proposal.author?.name || 'Anonymous'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Location: {proposal.location?.city}, {proposal.location?.country}
              </Typography>
            </Box>
            
            {isUserProposalAuthor && proposal.status === 'open' && (
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => setOpenCloseDialog(true)}
              >
                Close Proposal
              </Button>
            )}
          </Box>
        </>
      ) : (
        <Alert severity="error">Proposal not found</Alert>
      )}
    </Paper>
  );
  
  const renderVotingSection = () => (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Voting
      </Typography>
      
      {proposal && proposal.status === 'closed' ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          This proposal is closed. Voting is no longer available.
        </Alert>
      ) : !isAuthenticated ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please <Link to="/login">sign in</Link> to vote on this proposal.
        </Alert>
      ) : (
        <>
          {quiz && !quiz.userHasPassed && (
            <Alert severity="info" sx={{ mb: 2 }}>
              You need to pass a quiz to vote directly on this proposal.{' '}
              <Link to={`/quiz/${id}`}>Take the quiz</Link> or delegate your vote.
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, my: 3 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<ThumbUpIcon />}
              disabled={voteLoading || !quiz?.userHasPassed || proposal?.status === 'closed'}
              onClick={() => handleVote('yes')}
              sx={{ px: 4, py: 1 }}
            >
              Yes ({proposal?.yesVotes || 0})
            </Button>
            
            <Button
              variant="contained"
              color="error"
              startIcon={<ThumbDownIcon />}
              disabled={voteLoading || !quiz?.userHasPassed || proposal?.status === 'closed'}
              onClick={() => handleVote('no')}
              sx={{ px: 4, py: 1 }}
            >
              No ({proposal?.noVotes || 0})
            </Button>
          </Box>
          
          {!quiz?.userHasPassed && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                component={Link}
                to={`/quiz/${id}`}
              >
                Take Quiz
              </Button>
            </Box>
          )}
        </>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2">
          Total Votes: {(proposal?.yesVotes || 0) + (proposal?.noVotes || 0)}
        </Typography>
        
        {proposal && proposal.status === 'open' && (
          <Button
            variant="text"
            component={Link}
            to={`/quiz/${id}`}
          >
            View Quiz
          </Button>
        )}
      </Box>
    </Paper>
  );
  
  const renderCommentSection = () => (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Comments
      </Typography>
      
      {isAuthenticated && proposal?.status === 'open' && (
        <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Add a comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {quiz?.userHasPassed ? (
                'You will post as a competent user (free)'
              ) : (
                `This will cost 3 Dcents. Your balance: ${formatTokenBalance(dcentBalance, 'dcent')}`
              )}
            </Typography>
            <Button 
              type="submit" 
              variant="contained"
              disabled={!commentText.trim() || (!quiz?.userHasPassed && dcentBalance < 3)}
            >
              Post Comment
            </Button>
          </Box>
        </Box>
      )}
      
      {commentLoading ? (
        <CircularProgress />
      ) : comments && comments.length > 0 ? (
        <List>
          {comments.map(comment => (
            <React.Fragment key={comment._id}>
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  bgcolor: comment.isIntegrated ? 'success.light' : 'inherit',
                  borderRadius: 1
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    {comment.author?.name?.charAt(0) || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography component="span" variant="subtitle1">
                        {comment.author?.name || 'Anonymous'}
                        {comment.isCompetent && (
                          <Chip 
                            label="Competent" 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 1 }}
                          />
                        )}
                        {comment.isIntegrated && (
                          <Chip 
                            label="Integrated" 
                            size="small" 
                            color="success" 
                            icon={<CheckCircleIcon />}
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Typography component="span" variant="body2" color="text.secondary">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body1"
                        color="text.primary"
                        sx={{ display: 'block', my: 1 }}
                      >
                        {comment.content}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleCommentVote(comment._id, 'up')}
                            disabled={!isAuthenticated || proposal?.status === 'closed'}
                          >
                            <ThumbUpIcon fontSize="small" />
                          </IconButton>
                          <Typography component="span" variant="body2" sx={{ mx: 1 }}>
                            {comment.upvotes}
                          </Typography>
                          
                          <IconButton 
                            size="small"
                            onClick={() => handleCommentVote(comment._id, 'down')}
                            disabled={!isAuthenticated || proposal?.status === 'closed'}
                          >
                            <ThumbDownIcon fontSize="small" />
                          </IconButton>
                          <Typography component="span" variant="body2" sx={{ mx: 1 }}>
                            {comment.downvotes}
                          </Typography>
                        </Box>
                        
                        {isUserProposalAuthor && 
                         proposal?.status === 'open' && 
                         !comment.isIntegrated && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleIntegrateComment(comment._id)}
                          >
                            Integrate
                          </Button>
                        )}
                        
                        {!isUserProposalAuthor && 
                         shouldAutoIntegrate(comment) && 
                         !comment.isIntegrated && (
                          <Chip 
                            label="Eligible for auto-integration" 
                            size="small" 
                            color="secondary" 
                          />
                        )}
                      </Box>
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Alert severity="info">No comments yet</Alert>
      )}
    </Paper>
  );
  
  return (
    <Container maxWidth="lg">
      {renderProposalHeader()}
      {renderVotingSection()}
      {renderCommentSection()}
      
      <Dialog
        open={openCloseDialog}
        onClose={() => setOpenCloseDialog(false)}
      >
        <DialogTitle>Close Proposal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to close this proposal? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCloseDialog(false)}>Cancel</Button>
          <Button onClick={handleCloseProposal} color="error">Close Proposal</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProposalDetail;
