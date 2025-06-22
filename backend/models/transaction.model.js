const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currencyType: {
    type: String,
    enum: ['acent', 'dcent'],
    required: true
  },
  type: {
    type: String,
    enum: [
      'quiz_pass',
      'vote_cast',
      'proposal_creation',
      'delegation_given',
      'delegation_received',
      'delegation_revoked',
      'comment_creation',
      'comment_vote',
      'comment_upvote_received',
      'comment_integration',
      'proposal_vote_received'
    ],
    required: true
  },
  relatedEntity: {
    type: Schema.Types.ObjectId,
    refPath: 'entityType'
  },
  entityType: {
    type: String,
    enum: ['Proposal', 'Quiz', 'Vote', 'Delegation', 'Comment']
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
