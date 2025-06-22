import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { getQuiz, submitQuizAttempt, clearQuizResult } from '../slices/quizSlice';
import { calculateQuizScore } from '../utils/quizUtils';

const Quiz = () => {
  const { proposalId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { quiz, quizResult, loading } = useSelector(state => state.quiz);
  const { proposal } = useSelector(state => state.proposal);
  
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [completed, setCompleted] = useState(false);
  
  useEffect(() => {
    if (proposalId) {
      dispatch(getQuiz(proposalId));
    }
    
    // Clear any previous quiz results
    return () => {
      dispatch(clearQuizResult());
    };
  }, [dispatch, proposalId]);
  
  useEffect(() => {
    if (quiz && quiz.questions) {
      // Initialize answers array
      setAnswers(Array(quiz.questions.length).fill(null));
    }
  }, [quiz]);
  
  const handleAnswerChange = (questionIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = {
      questionIndex,
      selectedOption: optionIndex
    };
    setAnswers(newAnswers);
  };
  
  const handleNext = () => {
    if (activeStep < quiz.questions.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      setCompleted(true);
    }
  };
  
  const handleBack = () => {
    setActiveStep(Math.max(activeStep - 1, 0));
  };
  
  const handleSubmit = () => {
    // Filter out any null answers
    const validAnswers = answers.filter(answer => answer !== null);
    dispatch(submitQuizAttempt({ proposalId, answers: validAnswers }));
  };
  
  const handleRetake = () => {
    dispatch(clearQuizResult());
    setActiveStep(0);
    setAnswers(Array(quiz?.questions?.length || 0).fill(null));
    setCompleted(false);
  };
  
  const handleViewProposal = () => {
    navigate(`/proposals/${proposalId}`);
  };
  
  const renderQuestion = (question, index) => {
    if (index !== activeStep) return null;
    
    return (
      <Box key={index} sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Question {index + 1}: {question.questionText}
        </Typography>
        
        <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
          <RadioGroup
            value={answers[index]?.selectedOption ?? ''}
            onChange={(e) => handleAnswerChange(index, parseInt(e.target.value))}
          >
            {question.options.map((option, optionIndex) => (
              <FormControlLabel
                key={optionIndex}
                value={optionIndex}
                control={<Radio />}
                label={option.optionText}
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>
    );
  };
  
  const renderQuizContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!quiz) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          Quiz not found for this proposal.
        </Alert>
      );
    }
    
    if (quizResult) {
      return (
        <Box sx={{ mt: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom align="center">
                Quiz Results
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                flexDirection: 'column',
                my: 3
              }}>
                <Typography variant="h3" color={quizResult.passed ? 'success.main' : 'error.main'}>
                  {quizResult.score}%
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {quizResult.passed ? 'You passed!' : 'You did not pass.'}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" paragraph>
                {quizResult.passed 
                  ? 'Congratulations! You have demonstrated competence on this topic. You can now vote directly on the proposal and earn Acents.'
                  : 'You did not pass the quiz. You can delegate your vote to earn Dcents, or retake the quiz to try again.'}
              </Typography>
              
              {quizResult.passed && (
                <Typography variant="body2" color="success.main">
                  You earned 1 Acent for passing this quiz!
                </Typography>
              )}
            </CardContent>
          </Card>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleRetake}
            >
              Retake Quiz
            </Button>
            <Button 
              variant="contained" 
              onClick={handleViewProposal}
            >
              Return to Proposal
            </Button>
          </Box>
        </Box>
      );
    }
    
    return (
      <>
        <Stepper activeStep={activeStep} sx={{ mt: 4 }}>
          {quiz.questions.map((_, index) => (
            <Step key={index}>
              <StepLabel></StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {quiz.questions.map((question, index) => renderQuestion(question, index))}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          {!completed ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={answers[activeStep] === null}
            >
              {activeStep === quiz.questions.length - 1 ? 'Review' : 'Next'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={answers.some(a => a === null)}
            >
              Submit Quiz
            </Button>
          )}
        </Box>
        
        {completed && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Answers
            </Typography>
            <Typography variant="body2" paragraph>
              Please review your answers before submitting. You can go back to change any answers if needed.
            </Typography>
          </Box>
        )}
      </>
    );
  };
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {quiz?.title || 'Competence Quiz'}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {quiz?.description || 'This quiz will test your knowledge on the proposal topic. You must pass to vote directly.'}
        </Typography>
        
        {renderQuizContent()}
      </Paper>
    </Container>
  );
};

export default Quiz;
