const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const Proposal = require('../models/proposal.model');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const auth = require('../middleware/auth.middleware');

// @route   POST api/proposals
// @desc    Create a proposal
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty(),
      check('scope', 'Scope is required').isIn(['neighborhood', 'city', 'state', 'region', 'country', 'global'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user has enough Acents
      const user = await User.findById(req.user.id);
      if (user.acentBalance < 5) {
        return res.status(400).json({ msg: 'Insufficient Acent balance. Creating a proposal requires 5 Acents.' });
      }

      const { title, content, scope, location } = req.body;

      // Create new proposal
      const newProposal = new Proposal({
        title,
        content,
        author: req.user.id,
        scope,
        location
      });

      const proposal = await newProposal.save();

      // Deduct Acents from user balance
      user.acentBalance -= 5;
      await user.save();

      // Record transaction
      const transaction = new Transaction({
        user: req.user.id,
        amount: -5,
        currencyType: 'acent',
        type: 'proposal_creation',
        relatedEntity: proposal._id,
        entityType: 'Proposal',
        description: 'Created proposal: ' + title
      });

      await transaction.save();

      res.json(proposal);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/proposals
// @desc    Get all proposals
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { scope, location, status, page = 1, limit = 10 } = req.query;
    const query = {};

    // Filter by scope
    if (scope) {
      query.scope = scope;
    }

    // Filter by location
    if (location) {
      if (location.city) query['location.city'] = location.city;
      if (location.state) query['location.state'] = location.state;
      if (location.country) query['location.country'] = location.country;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const proposals = await Proposal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username name');

    const total = await Proposal.countDocuments(query);

    res.json({
      proposals,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/proposals/:id
// @desc    Get proposal by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('author', 'username name')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username name'
        }
      });

    if (!proposal) {
      return res.status(404).json({ msg: 'Proposal not found' });
    }

    res.json(proposal);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Proposal not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/proposals/:id
// @desc    Update a proposal
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const proposal = await Proposal.findById(req.params.id);

      if (!proposal) {
        return res.status(404).json({ msg: 'Proposal not found' });
      }

      // Check if user is the author
      if (proposal.author.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      // Check if proposal is active
      if (proposal.status !== 'active') {
        return res.status(400).json({ msg: 'Cannot update a closed or escalated proposal' });
      }

      const { title, content } = req.body;

      proposal.title = title;
      proposal.content = content;

      await proposal.save();

      res.json(proposal);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Proposal not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/proposals/:id
// @desc    Delete a proposal
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ msg: 'Proposal not found' });
    }

    // Check if user is the author
    if (proposal.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Check if proposal is active and has no votes
    if (proposal.status !== 'active' || proposal.yesVotes > 0 || proposal.noVotes > 0) {
      return res.status(400).json({ msg: 'Cannot delete a proposal that has votes or is closed/escalated' });
    }

    await proposal.remove();

    // Refund Acents to user
    const user = await User.findById(req.user.id);
    user.acentBalance += 5;
    await user.save();

    // Record transaction
    const transaction = new Transaction({
      user: req.user.id,
      amount: 5,
      currencyType: 'acent',
      type: 'proposal_creation',
      description: 'Refund for deleted proposal: ' + proposal.title
    });

    await transaction.save();

    res.json({ msg: 'Proposal removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Proposal not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/proposals/:id/close
// @desc    Close a proposal
// @access  Private
router.put('/:id/close', auth, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ msg: 'Proposal not found' });
    }

    // Check if user is the author
    if (proposal.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Check if proposal is already closed
    if (proposal.status !== 'active') {
      return res.status(400).json({ msg: 'Proposal is already closed or escalated' });
    }

    proposal.status = 'closed';
    proposal.closedAt = Date.now();

    await proposal.save();

    res.json(proposal);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Proposal not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/proposals/:id/escalate
// @desc    Escalate a proposal to a higher scope
// @access  Private
router.put(
  '/:id/escalate',
  [
    auth,
    [
      check('newScope', 'New scope is required').isIn(['city', 'state', 'region', 'country', 'global'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const proposal = await Proposal.findById(req.params.id);

      if (!proposal) {
        return res.status(404).json({ msg: 'Proposal not found' });
      }

      // Check if user is the author
      if (proposal.author.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      // Check if proposal is active
      if (proposal.status !== 'active') {
        return res.status(400).json({ msg: 'Cannot escalate a closed or already escalated proposal' });
      }

      const { newScope } = req.body;

      // Check if new scope is higher than current scope
      const scopeHierarchy = ['neighborhood', 'city', 'state', 'region', 'country', 'global'];
      const currentScopeIndex = scopeHierarchy.indexOf(proposal.scope);
      const newScopeIndex = scopeHierarchy.indexOf(newScope);

      if (newScopeIndex <= currentScopeIndex) {
        return res.status(400).json({ msg: 'New scope must be higher than current scope' });
      }

      // Close current proposal
      proposal.status = 'escalated';
      await proposal.save();

      // Create new proposal with higher scope
      const escalatedProposal = new Proposal({
        title: proposal.title,
        content: proposal.content,
        author: req.user.id,
        scope: newScope,
        location: proposal.location
      });

      const newProposal = await escalatedProposal.save();

      res.json({
        originalProposal: proposal,
        escalatedProposal: newProposal
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

module.exports = router;
