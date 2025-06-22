const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const Delegation = require('../models/delegation.model');
const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Transaction = require('../models/transaction.model');
const auth = require('../middleware/auth.middleware');

// @route   POST api/delegations/:proposalId
// @desc    Delegate vote for a proposal
// @access  Private
router.post(
  '/:proposalId',
  [
    auth,
    [
      check('delegateeId', 'Delegatee ID is required').not().isEmpty()
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
        return res.status(400).json({ msg: 'Cannot delegate vote for a closed or escalated proposal' });
      }

      const { delegateeId } = req.body;

      // Check if delegatee exists
      const delegatee = await User.findById(delegateeId);
      if (!delegatee) {
        return res.status(404).json({ msg: 'Delegatee not found' });
      }

      // Check if delegatee has passed the quiz
      const hasPassedQuiz = delegatee.passedQuizzes.some(
        quizId => quizId.toString() === proposal.quiz?.toString()
      );

      if (!hasPassedQuiz) {
        return res.status(400).json({ 
          msg: 'Delegatee must have passed the quiz for this proposal' 
        });
      }

      // Check if user has already delegated for this proposal
      const existingDelegation = await Delegation.findOne({
        proposal: req.params.proposalId,
        delegator: req.user.id,
        active: true
      });

      if (existingDelegation) {
        return res.status(400).json({ msg: 'User has already delegated for this proposal' });
      }

      // Check if user has already voted directly
      const user = await User.findById(req.user.id);
      const hasPassedQuiz = user.passedQuizzes.some(
        quizId => quizId.toString() === proposal.quiz?.toString()
      );

      if (hasPassedQuiz) {
        return res.status(400).json({ 
          msg: 'User has passed the quiz and should vote directly instead of delegating' 
        });
      }

      // Create new delegation
      const newDelegation = new Delegation({
        proposal: req.params.proposalId,
        delegator: req.user.id,
        delegatee: delegateeId
      });

      const delegation = await newDelegation.save();

      // Add delegation to user's delegationsGiven
      user.delegationsGiven.push(delegation._id);
      
      // Award 1 Dcent to the delegator
      user.dcentBalance += 1;
      
      await user.save();

      // Add delegation to delegatee's delegationsReceived
      delegatee.delegationsReceived.push(delegation._id);
      await delegatee.save();

      // Record transaction
      const transaction = new Transaction({
        user: req.user.id,
        amount: 1,
        currencyType: 'dcent',
        type: 'delegation_given',
        relatedEntity: delegation._id,
        entityType: 'Delegation',
        description: `Delegated vote to ${delegatee.username} for proposal: ${proposal.title}`
      });

      await transaction.save();

      res.json(delegation);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Proposal or delegatee not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/delegations/:id/revoke
// @desc    Revoke a delegation
// @access  Private
router.put('/:id/revoke', auth, async (req, res) => {
  try {
    const delegation = await Delegation.findById(req.params.id);
    
    if (!delegation) {
      return res.status(404).json({ msg: 'Delegation not found' });
    }

    // Check if user is the delegator
    if (delegation.delegator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to revoke this delegation' });
    }

    // Check if delegation is already inactive
    if (!delegation.active) {
      return res.status(400).json({ msg: 'Delegation is already revoked' });
    }

    // Check if proposal is still active
    const proposal = await Proposal.findById(delegation.proposal);
    if (!proposal || proposal.status !== 'active') {
      return res.status(400).json({ msg: 'Cannot revoke delegation for a closed or escalated proposal' });
    }

    // Revoke delegation
    delegation.active = false;
    delegation.revokedAt = Date.now();
    await delegation.save();

    // Deduct 1 Dcent from user's balance (forfeiting the coin earned from delegation)
    const user = await User.findById(req.user.id);
    if (user.dcentBalance > 0) {
      user.dcentBalance -= 1;
      await user.save();

      // Record transaction
      const transaction = new Transaction({
        user: req.user.id,
        amount: -1,
        currencyType: 'dcent',
        type: 'delegation_revoked',
        relatedEntity: delegation._id,
        entityType: 'Delegation',
        description: `Revoked delegation for proposal: ${proposal.title}`
      });

      await transaction.save();
    }

    res.json({ msg: 'Delegation revoked' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Delegation not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/delegations/given
// @desc    Get all delegations given by the current user
// @access  Private
router.get('/given', auth, async (req, res) => {
  try {
    const delegations = await Delegation.find({ 
      delegator: req.user.id 
    })
      .populate('proposal', 'title content status')
      .populate('delegatee', 'username name')
      .sort({ createdAt: -1 });
    
    res.json(delegations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/delegations/received
// @desc    Get all delegations received by the current user
// @access  Private
router.get('/received', auth, async (req, res) => {
  try {
    const delegations = await Delegation.find({ 
      delegatee: req.user.id,
      active: true
    })
      .populate('proposal', 'title content status')
      .populate('delegator', 'username name')
      .sort({ createdAt: -1 });
    
    res.json(delegations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/delegations/proposal/:proposalId
// @desc    Get all delegations for a proposal
// @access  Public
router.get('/proposal/:proposalId', async (req, res) => {
  try {
    const delegations = await Delegation.find({ 
      proposal: req.params.proposalId,
      active: true
    })
      .populate('delegator', 'username name')
      .populate('delegatee', 'username name');
    
    res.json(delegations);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Proposal not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
