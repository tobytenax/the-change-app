import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TokenIcon from '@mui/icons-material/Token';
import HistoryIcon from '@mui/icons-material/History';
import QuizIcon from '@mui/icons-material/Quiz';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CommentIcon from '@mui/icons-material/Comment';
import { getTokenBalance, getTransactionHistory } from '../slices/tokenSlice';
import { getUserVotingHistory } from '../slices/voteSlice';
import { getUserQuizAttempts } from '../slices/quizSlice';
import { getUserCommentHistory } from '../slices/commentSlice';
import { formatTokenBalance, getTransactionTypeDescription } from '../utils/tokenUtils';

const Profile = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  
  const { user } = useSelector(state => state.auth);
  const { acentBalance, dcentBalance, transactions, loading: tokenLoading } = useSelector(state => state.token);
  const { userVotes, loading: voteLoading } = useSelector(state => state.vote);
  const { passedQuizzes, loading: quizLoading } = useSelector(state => state.quiz);
  const { userComments, loading: commentLoading } = useSelector(state => state.comment);
  
  useEffect(() => {
    dispatch(getTokenBalance());
    dispatch(getTransactionHistory());
    dispatch(getUserVotingHistory());
    dispatch(getUserQuizAttempts());
    dispatch(getUserCommentHistory());
  }, [dispatch]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const renderUserInfo = () => (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={2}>
            <Avatar
              sx={{ width: 80, height: 80, mx: 'auto' }}
            >
              {user?.name?.charAt(0) || <AccountCircleIcon fontSize="large" />}
            </Avatar>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {user?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              @{user?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.location?.city}, {user?.location?.state} {user?.location?.country}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-end' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TokenIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary">
                  {formatTokenBalance(acentBalance, 'acent')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TokenIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="secondary">
                  {formatTokenBalance(dcentBalance, 'dcent')}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  const renderTransactions = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Transaction History
      </Typography>
      
      {tokenLoading ? (
        <CircularProgress />
      ) : transactions && transactions.length > 0 ? (
        <List>
          {transactions.map(transaction => (
            <ListItem key={transaction._id} divider>
              <ListItemIcon>
                <TokenIcon color={transaction.tokenType === 'acent' ? 'primary' : 'secondary'} />
              </ListItemIcon>
              <ListItemText
                primary={getTransactionTypeDescription(transaction.type)}
                secondary={new Date(transaction.createdAt).toLocaleString()}
              />
              <Typography variant="body1" color={transaction.amount > 0 ? 'success.main' : 'error.main'}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount} {transaction.tokenType === 'acent' ? 'Ⓐ' : 'Ⓓ'}
              </Typography>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No transactions found.
        </Typography>
      )}
    </Box>
  );
  
  const renderVotingHistory = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Voting History
      </Typography>
      
      {voteLoading ? (
        <CircularProgress />
      ) : userVotes && userVotes.length > 0 ? (
        <List>
          {userVotes.map(vote => (
            <ListItem key={vote._id} divider>
              <ListItemIcon>
                <HowToVoteIcon color={vote.voteType === 'yes' ? 'success' : 'error'} />
              </ListItemIcon>
              <ListItemText
                primary={vote.proposal?.title || 'Unknown Proposal'}
                secondary={new Date(vote.createdAt).toLocaleString()}
              />
              <Chip 
                label={vote.voteType.toUpperCase()} 
                color={vote.voteType === 'yes' ? 'success' : 'error'} 
                size="small" 
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No voting history found.
        </Typography>
      )}
    </Box>
  );
  
  const renderQuizHistory = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Quiz History
      </Typography>
      
      {quizLoading ? (
        <CircularProgress />
      ) : passedQuizzes && passedQuizzes.length > 0 ? (
        <List>
          {passedQuizzes.map(quiz => (
            <ListItem key={quiz._id} divider>
              <ListItemIcon>
                <QuizIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={quiz.title || 'Quiz for ' + (quiz.proposal?.title || 'Unknown Proposal')}
                secondary={new Date(quiz.passedAt).toLocaleString()}
              />
              <Chip 
                label="PASSED" 
                color="success" 
                size="small" 
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No passed quizzes found.
        </Typography>
      )}
    </Box>
  );
  
  const renderCommentHistory = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Comment History
      </Typography>
      
      {commentLoading ? (
        <CircularProgress />
      ) : userComments && userComments.length > 0 ? (
        <List>
          {userComments.map(comment => (
            <ListItem key={comment._id} divider>
              <ListItemIcon>
                <CommentIcon color={comment.isIntegrated ? 'success' : 'primary'} />
              </ListItemIcon>
              <ListItemText
                primary={comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : '')}
                secondary={`${comment.proposal?.title || 'Unknown Proposal'} - ${new Date(comment.createdAt).toLocaleString()}`}
              />
              <Box>
                {comment.isCompetent && (
                  <Chip 
                    label="Competent" 
                    color="primary" 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                )}
                {comment.isIntegrated && (
                  <Chip 
                    label="Integrated" 
                    color="success" 
                    size="small" 
                  />
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No comments found.
        </Typography>
      )}
    </Box>
  );
  
  return (
    <Container maxWidth="lg">
      {renderUserInfo()}
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          <Tab icon={<TokenIcon />} label="Transactions" />
          <Tab icon={<HowToVoteIcon />} label="Voting" />
          <Tab icon={<QuizIcon />} label="Quizzes" />
          <Tab icon={<CommentIcon />} label="Comments" />
        </Tabs>
        
        <Divider sx={{ mb: 3 }} />
        
        {tabValue === 0 && renderTransactions()}
        {tabValue === 1 && renderVotingHistory()}
        {tabValue === 2 && renderQuizHistory()}
        {tabValue === 3 && renderCommentHistory()}
      </Paper>
    </Container>
  );
};

export default Profile;
