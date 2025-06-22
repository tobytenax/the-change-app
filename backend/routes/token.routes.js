const express = require('express');
const router = express.Router();

const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const auth = require('../middleware/auth.middleware');

// @route   GET api/tokens/balance
// @desc    Get token balance for the current user
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      acentBalance: user.acentBalance,
      dcentBalance: user.dcentBalance
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tokens/transactions
// @desc    Get transaction history for the current user
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('relatedEntity')
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tokens/leaderboard
// @desc    Get token leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'acent', limit = 10 } = req.query;
    
    const sortField = type === 'acent' ? 'acentBalance' : 'dcentBalance';
    
    const users = await User.find()
      .select('username name acentBalance dcentBalance')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
