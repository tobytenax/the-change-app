/**
 * Utility functions for quiz management
 */

// Calculate score from quiz answers
export const calculateQuizScore = (questions, answers) => {
  let correctAnswers = 0;
  
  answers.forEach(answer => {
    const question = questions[answer.questionIndex];
    if (question && question.options[answer.selectedOption]?.isCorrect) {
      correctAnswers++;
    }
  });

  return Math.round((correctAnswers / questions.length) * 100);
};

// Check if user has passed a specific quiz
export const hasPassedQuiz = (passedQuizzes, quizId) => {
  return passedQuizzes.some(quiz => quiz._id === quizId);
};

// Format quiz questions for display
export const formatQuizQuestion = (question, index) => {
  return {
    id: index,
    questionText: question.questionText,
    options: question.options.map((option, i) => ({
      id: i,
      text: option.optionText
    })),
    explanation: question.explanation
  };
};

// Validate quiz data
export const validateQuizData = (quiz) => {
  const errors = [];
  
  if (!quiz.title) {
    errors.push('Quiz title is required');
  }
  
  if (!quiz.description) {
    errors.push('Quiz description is required');
  }
  
  if (!quiz.questions || quiz.questions.length === 0) {
    errors.push('At least one question is required');
  } else {
    quiz.questions.forEach((question, index) => {
      if (!question.questionText) {
        errors.push(`Question ${index + 1} text is required`);
      }
      
      if (!question.options || question.options.length < 2) {
        errors.push(`Question ${index + 1} must have at least two options`);
      }
      
      const hasCorrectAnswer = question.options?.some(option => option.isCorrect);
      if (!hasCorrectAnswer) {
        errors.push(`Question ${index + 1} must have at least one correct answer`);
      }
    });
  }
  
  return errors;
};
