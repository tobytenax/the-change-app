const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const Quiz = require('../models/quiz.model');
const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Transaction = require('../models/transaction.model');
const auth = require('../middleware/auth.middleware');

// @route   POST api/quizzes/:proposalId
// @desc    Create a quiz for a proposal
// @access  Private
router.post(
  '/:proposalId',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('questions', 'At least one question is required').isArray({ min: 1 }),
      check('questions.*.questionText', 'Question text is required').not().isEmpty(),
      check('questions.*.options', 'At least two options are required').isArray({ min: 2 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const proposal = await Proposal.findById(req.params.proposalId);
      
      if (!proposal) {
        return res.status(404).json({ msg: 'Proposal not found' });
      }

      // Check if user is the author of the proposal
      if (proposal.author.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized to create quiz for this proposal' });
      }

      // Check if a quiz already exists for this proposal
      const existingQuiz = await Quiz.findOne({ proposal: req.params.proposalId });
      if (existingQuiz) {
        return res.status(400).json({ msg: 'A quiz already exists for this proposal' });
      }

      const { title, description, questions, passingScore } = req.body;

      // Validate that each question has at least one correct answer
      for (const question of questions) {
        const hasCorrectAnswer = question.options.some(option => option.isCorrect);
        if (!hasCorrectAnswer) {
          return res.status(400).json({ 
            msg: `Question "${question.questionText}" must have at least one correct answer` 
          });
        }
      }

      // Create new quiz
      const newQuiz = new Quiz({
        proposal: req.params.proposalId,
        title,
        description,
        questions,
        passingScore: passingScore || 70
      });

      const quiz = await newQuiz.save();

      res.json(quiz);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Proposal not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/quizzes/:proposalId
// @desc    Get quiz for a proposal
// @access  Public
router.get('/:proposalId', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ proposal: req.params.proposalId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found for this proposal' });
    }

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/quizzes/:proposalId/attempt
// @desc    Submit a quiz attempt
// @access  Private
router.post(
  '/:proposalId/attempt',
  [
    auth,
    [
      check('answers', 'Answers are required').isArray({ min: 1 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const quiz = await Quiz.findOne({ proposal: req.params.proposalId });
      
      if (!quiz) {
        return res.status(404).json({ msg: 'Quiz not found for this proposal' });
      }

      const { answers } = req.body;

      // Calculate score
      let correctAnswers = 0;
      
      answers.forEach(answer => {
        const question = quiz.questions[answer.questionIndex];
        if (question && question.options[answer.selectedOption]?.isCorrect) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / quiz.questions.length) * 100);
      const passed = score >= quiz.passingScore;

      // If passed, update user's passed quizzes
      if (passed) {
        const user = await User.findById(req.user.id);
        
        // Check if user has already passed this quiz
        const alreadyPassed = user.passedQuizzes.some(
          passedQuiz => passedQuiz.toString() === quiz._id.toString()
        );

        if (!alreadyPassed) {
          user.passedQuizzes.push(quiz._id);
          
          // Award 1 Acent for passing the quiz
          user.acentBalance += 1;
          
          await user.save();

          // Record transaction
          const transaction = new Transaction({
            user: req.user.id,
            amount: 1,
            currencyType: 'acent',
            type: 'quiz_pass',
            relatedEntity: quiz._id,
            entityType: 'Quiz',
            description: `Passed quiz for proposal: ${quiz.title}`
          });

          await transaction.save();
        }
      }

      res.json({
        score,
        passed,
        correctAnswers,
        totalQuestions: quiz.questions.length
      });
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Quiz not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/quizzes/:id
// @desc    Update a quiz
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('questions', 'At least one question is required').isArray({ min: 1 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const quiz = await Quiz.findById(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({ msg: 'Quiz not found' });
      }

      const proposal = await Proposal.findById(quiz.proposal);
      
      // Check if user is the author of the proposal
      if (proposal.author.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized to update this quiz' });
      }

      const { title, description, questions, passingScore } = req.body;

      // Validate that each question has at least one correct answer
      for (const question of questions) {
        const hasCorrectAnswer = question.options.some(option => option.isCorrect);
        if (!hasCorrectAnswer) {
          return res.status(400).json({ 
            msg: `Question "${question.questionText}" must have at least one correct answer` 
          });
        }
      }

      // Update quiz
      quiz.title = title;
      quiz.description = description;
      quiz.questions = questions;
      if (passingScore) quiz.passingScore = passingScore;

      await quiz.save();

      res.json(quiz);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Quiz not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/quizzes/user/attempts
// @desc    Get all quiz attempts for the current user
// @access  Private
router.get('/user/attempts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('passedQuizzes');
    
    res.json({
      passedQuizzes: user.passedQuizzes
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
