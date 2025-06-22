const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Transaction = require('../models/transaction.model');
const auth = require('../middleware/auth.middleware');

// @route   POST api/comments/:proposalId
// @desc    Create a comment on a proposal
// @access  Private
router.post(
  '/:proposalId',
  [
    auth,
    [
      check('content', 'Content is required').not().isEmpty()
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

      // Check if proposal is active
      if (proposal.status !== 'active') {
        return res.status(400).json({ msg: 'Cannot comment on a closed or escalated proposal' });
      }

      const { content } = req.body;
      const user = await User.findById(req.user.id);

      // Check if user has passed the quiz for this proposal
      const hasPassedQuiz = user.passedQuizzes.some(
        quizId => quizId.toString() === proposal.quiz?.toString()
      );

      // If user hasn't passed the quiz, they need to spend 3 Dcents
      if (!hasPassedQuiz && user.dcentBalance < 3) {
        return res.status(400).json({ 
          msg: 'Insufficient Dcent balance. Non-competent comments require 3 Dcents.' 
        });
      }

      // Create new comment
      const newComment = new Comment({
        proposal: req.params.proposalId,
        author: req.user.id,
        content,
        isCompetent: hasPassedQuiz
      });

      const comment = await newComment.save();

      // Add comment to proposal
      proposal.comments.push(comment._id);
      await proposal.save();

      // If non-competent comment, deduct 3 Dcents
      if (!hasPassedQuiz) {
        user.dcentBalance -= 3;
        await user.save();

        // Record transaction
        const transaction = new Transaction({
          user: req.user.id,
          amount: -3,
          currencyType: 'dcent',
          type: 'comment_creation',
          relatedEntity: comment._id,
          entityType: 'Comment',
          description: `Created non-competent comment on proposal: ${proposal.title}`
        });

        await transaction.save();
      }

      res.json(comment);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Proposal not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/comments/:proposalId
// @desc    Get all comments for a proposal
// @access  Public
router.get('/:proposalId', async (req, res) => {
  try {
    const comments = await Comment.find({ proposal: req.params.proposalId })
      .populate('author', 'username name')
      .sort({ upvotes: -1, createdAt: -1 });
    
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Proposal not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/comments/:id/vote
// @desc    Vote on a comment
// @access  Private
router.put(
  '/:id/vote',
  [
    auth,
    [
      check('voteType', 'Vote type must be up or down').isIn(['up', 'down'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comment = await Comment.findById(req.params.id);
      
      if (!comment) {
        return res.status(404).json({ msg: 'Comment not found' });
      }

      const proposal = await Proposal.findById(comment.proposal);
      
      // Check if proposal is active
      if (proposal.status !== 'active') {
        return res.status(400).json({ msg: 'Cannot vote on comments for a closed or escalated proposal' });
      }

      const { voteType } = req.body;

      // Check if user has already voted on this comment
      const alreadyVoted = comment.voters.some(
        vote => vote.user.toString() === req.user.id
      );

      if (alreadyVoted) {
        return res.status(400).json({ msg: 'User has already voted on this comment' });
      }

      // Add vote
      comment.voters.push({
        user: req.user.id,
        voteType
      });

      // Update vote count
      if (voteType === 'up') {
        comment.upvotes += 1;
      } else {
        comment.downvotes += 1;
      }

      await comment.save();

      // Award 1 Dcent to the voter
      const user = await User.findById(req.user.id);
      user.dcentBalance += 1;
      await user.save();

      // Record transaction for voter
      const voterTransaction = new Transaction({
        user: req.user.id,
        amount: 1,
        currencyType: 'dcent',
        type: 'comment_vote',
        relatedEntity: comment._id,
        entityType: 'Comment',
        description: `Voted ${voteType} on comment for proposal: ${proposal.title}`
      });

      await voterTransaction.save();

      // If upvote, award 1 Dcent to comment author
      if (voteType === 'up') {
        const commentAuthor = await User.findById(comment.author);
        commentAuthor.dcentBalance += 1;
        await commentAuthor.save();

        // Record transaction for comment author
        const authorTransaction = new Transaction({
          user: comment.author,
          amount: 1,
          currencyType: 'dcent',
          type: 'comment_upvote_received',
          relatedEntity: comment._id,
          entityType: 'Comment',
          description: `Received upvote on comment for proposal: ${proposal.title}`
        });

        await authorTransaction.save();
      }

      // Check if comment should be auto-integrated
      const totalVotes = comment.upvotes + comment.downvotes;
      const upvotePercentage = (comment.upvotes / totalVotes) * 100;
      
      if (totalVotes >= 10 && upvotePercentage >= 50 && !comment.isIntegrated) {
        // Auto-integrate comment
        comment.isIntegrated = true;
        comment.integratedAt = Date.now();
        await comment.save();

        // Add to proposal's integrated comments
        proposal.integratedComments.push(comment._id);
        await proposal.save();

        // If non-competent comment, convert Dcents to Acents for author
        if (!comment.isCompetent) {
          const commentAuthor = await User.findById(comment.author);
          commentAuthor.acentBalance += 1;
          await commentAuthor.save();

          // Record transaction for comment author
          const integrationTransaction = new Transaction({
            user: comment.author,
            amount: 1,
            currencyType: 'acent',
            type: 'comment_integration',
            relatedEntity: comment._id,
            entityType: 'Comment',
            description: `Comment integrated into proposal: ${proposal.title}`
          });

          await integrationTransaction.save();
        }
      }

      res.json(comment);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Comment not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/comments/:id/integrate
// @desc    Manually integrate a comment
// @access  Private
router.put('/:id/integrate', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    const proposal = await Proposal.findById(comment.proposal);
    
    // Check if user is the proposal author
    if (proposal.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Only the proposal author can manually integrate comments' });
    }

    // Check if proposal is active
    if (proposal.status !== 'active') {
      return res.status(400).json({ msg: 'Cannot integrate comments for a closed or escalated proposal' });
    }

    // Check if comment is already integrated
    if (comment.isIntegrated) {
      return res.status(400).json({ msg: 'Comment is already integrated' });
    }

    // Integrate comment
    comment.isIntegrated = true;
    comment.integratedAt = Date.now();
    await comment.save();

    // Add to proposal's integrated comments
    proposal.integratedComments.push(comment._id);
    await proposal.save();

    // If non-competent comment, convert Dcents to Acents for author
    if (!comment.isCompetent) {
      const commentAuthor = await User.findById(comment.author);
      commentAuthor.acentBalance += 1;
      await commentAuthor.save();

      // Record transaction for comment author
      const transaction = new Transaction({
        user: comment.author,
        amount: 1,
        currencyType: 'acent',
        type: 'comment_integration',
        relatedEntity: comment._id,
        entityType: 'Comment',
        description: `Comment manually integrated into proposal: ${proposal.title}`
      });

      await transaction.save();
    }

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/comments/user/history
// @desc    Get comment history for the current user
// @access  Private
router.get('/user/history', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ author: req.user.id })
      .populate('proposal', 'title content status')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
