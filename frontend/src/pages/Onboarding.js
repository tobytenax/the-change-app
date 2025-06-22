import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider
} from '@mui/material';
import TokenIcon from '@mui/icons-material/Token';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import QuizIcon from '@mui/icons-material/Quiz';
import CommentIcon from '@mui/icons-material/Comment';
import GroupIcon from '@mui/icons-material/Group';

const Onboarding = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleReset = () => {
    setActiveStep(0);
  };
  
  const steps = [
    {
      label: 'Welcome to the Change App',
      description: `The Change App is a digital platform merging characteristics of an online forum with mechanisms for direct democracy. 
                   It empowers communities to make decisions collectively while ensuring that those decisions are informed by competence.`,
      content: (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Key Features
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TokenIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">Dual-Currency System</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <QuizIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">Competence Verification</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HowToVoteIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">Direct Democracy</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GroupIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">Delegation System</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )
    },
    {
      label: 'Understanding the Dual-Currency System',
      description: `The Change App uses two types of tokens: Acents and Dcents.`,
      content: (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Acents (Ⓐ)
                </Typography>
                <Typography variant="body2" paragraph>
                  Earned through demonstrating competence:
                </Typography>
                <ul>
                  <li>Passing quizzes</li>
                  <li>Making competent comments</li>
                  <li>Having your comments integrated</li>
                </ul>
                <Typography variant="body2" paragraph>
                  Used for:
                </Typography>
                <ul>
                  <li>Creating proposals (5 Acents)</li>
                  <li>Making competent comments (free)</li>
                </ul>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" color="secondary" gutterBottom>
                  Dcents (Ⓓ)
                </Typography>
                <Typography variant="body2" paragraph>
                  Earned through delegation and participation:
                </Typography>
                <ul>
                  <li>Delegating your vote</li>
                  <li>Receiving delegated votes</li>
                  <li>Voting on comments</li>
                  <li>Receiving upvotes on comments</li>
                </ul>
                <Typography variant="body2" paragraph>
                  Used for:
                </Typography>
                <ul>
                  <li>Making non-competent comments (3 Dcents)</li>
                  <li>Internal platform activities</li>
                </ul>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1">
              The "alchemical space" is the comment section, where Dcents can be converted to Acents when non-competent comments receive enough upvotes to be integrated into proposals.
            </Typography>
          </CardContent>
        </Card>
      )
    },
    {
      label: 'Competence Verification through Quizzes',
      description: `To vote directly on proposals, you must demonstrate competence by passing a quiz related to the proposal topic.`,
      content: (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="body1" paragraph>
              Each proposal has an associated quiz that tests your knowledge on the topic. Passing the quiz:
            </Typography>
            <ul>
              <li>Allows you to vote directly on the proposal</li>
              <li>Earns you 1 Acent</li>
              <li>Enables you to make competent comments (free)</li>
              <li>Gives your vote more weight in the system</li>
            </ul>
            <Typography variant="body1" paragraph>
              If you don't pass the quiz, you can:
            </Typography>
            <ul>
              <li>Delegate your vote to someone who has passed (earning 1 Dcent)</li>
              <li>Make non-competent comments (costs 3 Dcents)</li>
              <li>Retake the quiz after learning more about the topic</li>
            </ul>
            <Typography variant="body2" color="text.secondary">
              This system ensures that decisions are made by those who understand the issues, while still allowing everyone to participate.
            </Typography>
          </CardContent>
        </Card>
      )
    },
    {
      label: 'Voting and Delegation',
      description: `The Change App offers two ways to participate in voting: direct voting and delegation.`,
      content: (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Direct Voting
            </Typography>
            <Typography variant="body1" paragraph>
              If you pass the competence quiz:
            </Typography>
            <ul>
              <li>You can vote directly (Yes/No) on proposals</li>
              <li>You earn 1 Acent for voting</li>
              <li>You earn additional Acents for each delegated vote you represent</li>
            </ul>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Delegation
            </Typography>
            <Typography variant="body1" paragraph>
              If you don't pass the quiz:
            </Typography>
            <ul>
              <li>You can delegate your vote to a user who has passed the quiz</li>
              <li>You earn 1 Dcent for delegating</li>
              <li>The delegatee earns 1 Acent when they vote with your delegation</li>
            </ul>
            <Typography variant="body1" paragraph>
              Delegation Rules:
            </Typography>
            <ul>
              <li>You can revoke delegation anytime (forfeit the Dcent earned)</li>
              <li>If you later pass the quiz and vote yourself, you regain the Dcent plus earn an Acent</li>
              <li>Redelegation to another user is restricted financially for one year</li>
            </ul>
          </CardContent>
        </Card>
      )
    },
    {
      label: 'The Comment System and Integration',
      description: `Comments are the "alchemical space" where Dcents can be transformed into Acents through community recognition.`,
      content: (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Competent Comments
            </Typography>
            <Typography variant="body1" paragraph>
              If you've passed the quiz:
            </Typography>
            <ul>
              <li>You can make competent comments for free</li>
              <li>Your comments are marked as "Competent"</li>
              <li>You earn 1 Acent for each upvote on your comment</li>
            </ul>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Non-Competent Comments
            </Typography>
            <Typography variant="body1" paragraph>
              If you haven't passed the quiz:
            </Typography>
            <ul>
              <li>You can make non-competent comments for 3 Dcents</li>
              <li>You earn 1 Dcent for each upvote on your comment</li>
              <li>If your comment receives enough upvotes, it can be integrated</li>
            </ul>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Comment Integration
            </Typography>
            <Typography variant="body1" paragraph>
              Integration happens in two ways:
            </Typography>
            <ul>
              <li>Manual: The proposal author can integrate any comment</li>
              <li>Automatic: Comments with upvotes exceeding 50% of the proposal's votes are automatically integrated</li>
            </ul>
            <Typography variant="body1">
              When a non-competent comment is integrated, the Dcents earned from upvotes are converted to Acents, rewarding valuable contributions regardless of quiz status.
            </Typography>
          </CardContent>
        </Card>
      )
    },
    {
      label: 'Getting Started',
      description: `Now that you understand how the Change App works, here's how to get started:`,
      content: (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="body1" paragraph>
              1. Create an account or sign in
            </Typography>
            <Typography variant="body1" paragraph>
              2. Browse proposals on the dashboard
            </Typography>
            <Typography variant="body1" paragraph>
              3. Take quizzes to demonstrate competence
            </Typography>
            <Typography variant="body1" paragraph>
              4. Vote on proposals or delegate your vote
            </Typography>
            <Typography variant="body1" paragraph>
              5. Comment on proposals to contribute to the discussion
            </Typography>
            <Typography variant="body1" paragraph>
              6. Create your own proposals (costs 5 Acents)
            </Typography>
            <Typography variant="body1" paragraph>
              7. Track your tokens and activity in your profile
            </Typography>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/')}
              >
                Start Exploring
              </Button>
            </Box>
          </CardContent>
        </Card>
      )
    }
  ];
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Change App Tutorial
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the Change App! This tutorial will guide you through the key features and how to use the platform.
        </Typography>
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="h6">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Typography>{step.description}</Typography>
                {step.content}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {index === steps.length - 1 ? 'Finish' : 'Continue'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tutorial completed!
            </Typography>
            <Typography paragraph>
              You're now ready to use the Change App. Start exploring proposals, taking quizzes, and participating in direct democracy.
            </Typography>
            <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
              Restart Tutorial
            </Button>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')} 
              sx={{ mt: 1, mr: 1 }}
            >
              Go to Dashboard
            </Button>
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default Onboarding;
