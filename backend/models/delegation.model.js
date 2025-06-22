const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DelegationSchema = new Schema({
  proposal: {
    type: Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true
  },
  delegator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  delegatee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  revokedAt: {
    type: Date
  }
});

// Ensure a user can only delegate once per proposal
DelegationSchema.index({ proposal: 1, delegator: 1, active: 1 }, { unique: true });

module.exports = mongoose.model('Delegation', DelegationSchema);
