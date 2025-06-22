const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = new Schema({
  proposal: {
    type: Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true
  },
  voter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  voteType: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  },
  delegatedVotes: [{
    type: Schema.Types.ObjectId,
    ref: 'Delegation'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only vote once per proposal
VoteSchema.index({ proposal: 1, voter: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);
