const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const Vote = require('../models/vote.model');
const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Delegation = require('../models/delegation.model');
const Transaction = require('../models/transaction.model');
const auth = require('../middleware/auth.middleware');

// @route   POST api/votes/:proposalId
// @desc    Cast a vote on a proposal
// @access  Private
router.post(
  '/:proposalId',
  [
    auth,
    [
      check('voteType', 'Vote type must be yes or no').isIn(['yes', 'no'])
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
        return res.status(400).json({ msg: 'Cannot vote on a closed or escalated proposal' });
      }

      // Check if user has already voted
      const existingVote = await Vote.findOne({
        proposal: req.params.proposalId,
        voter: req.user.id
      });

      if (existingVote) {
        return res.status(400).json({ msg: 'User has already voted on this proposal' });
      }

      // Check if user has passed the quiz for this proposal
      const user = await User.findById(req.user.id);
      const hasPassedQuiz = user.passedQuizzes.some(
        quizId => quizId.toString() === proposal.quiz?.toString()
      );

      if (!hasPassedQuiz) {
        return res.status(400).json({ 
          msg: 'User must pass the quiz before voting directly. Take the quiz or delegate your vote.' 
        });
      }

      const { voteType } = req.body;

      // Get delegations to this user for this proposal
      const delegations = await Delegation.find({
        proposal: req.params.proposalId,
        delegatee: req.user.id,
        active: true
      });

      // Create new vote
      const newVote = new Vote({
        proposal: req.params.proposalId,
        voter: req.user.id,
        voteType,
        delegatedVotes: delegations.map(delegation => delegation._id)
      });

      const vote = await newVote.save();

      // Update proposal vote count
      if (voteType === 'yes') {
        proposal.yesVotes += 1 + delegations.length;
      } else {
        proposal.noVotes += 1 + delegations.length;
      }

      await proposal.save();

      // Award 1 Acent to the voter
      user.acentBalance += 1;
      
      // Award 1 Dcent for each delegation received
      if (delegations.length > 0) {
        user.dcentBalance += delegations.length;
      }
      
      await user.save();

      // Record transaction for voting
      const voteTransaction = new Transaction({
        user: req.user.id,
        amount: 1,
        currencyType: 'acent',
        type: 'vote_cast',
        relatedEntity: proposal._id,
        entityType: 'Proposal',
        description: `Cast ${voteType} vote on proposal: ${proposal.title}`
      });

      await voteTransaction.save();

      // Record transaction for delegations
      if (delegations.length > 0) {
        const delegationTransaction = new Transaction({
          user: req.user.id,
          amount: delegations.length,
          currencyType: 'dcent',
          type: 'delegation_received',
          relatedEntity: proposal._id,
          entityType: 'Proposal',
          description: `Received ${delegations.length} delegations for voting on proposal: ${proposal.title}`
        });

        await delegationTransaction.save();
      }

      // Award 1 Acent to the proposal author for each yes vote
      if (voteType === 'yes') {
        const proposalAuthor = await User.findById(proposal.author);
        proposalAuthor.acentBalance += 1;
        await proposalAuthor.save();

        // Record transaction for proposal author
        const authorTransaction = new Transaction({
          user: proposal.author,
          amount: 1,
          currencyType: 'acent',
          type: 'proposal_vote_received',
          relatedEntity: proposal._id,
          entityType: 'Proposal',
          description: `Received yes vote on proposal: ${proposal.title}`
        });

        await authorTransaction.save();
      }

      res.json({
        vote,
        delegationCount: delegations.length
      });
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Proposal not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/votes/:proposalId
// @desc    Get all votes for a proposal
// @access  Public
router.get('/:proposalId', async (req, res) => {
  try {
    const votes = await Vote.find({ proposal: req.params.proposalId })
      .populate('voter', 'username name')
      .populate({
        path: 'delegatedVotes',
        populate: {
          path: 'delegator',
          select: 'username name'
        }
      });
    
    res.json(votes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Proposal not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/votes/user/history
// @desc    Get voting history for the current user
// @access  Private
router.get('/user/history', auth, async (req, res) => {
  try {
    const votes = await Vote.find({ voter: req.user.id })
      .populate('proposal', 'title content status')
      .sort({ createdAt: -1 });
    
    res.json(votes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
