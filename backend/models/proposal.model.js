const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProposalSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scope: {
    type: String,
    enum: ['neighborhood', 'city', 'state', 'region', 'country', 'global'],
    required: true
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'escalated'],
    default: 'active'
  },
  yesVotes: {
    type: Number,
    default: 0
  },
  noVotes: {
    type: Number,
    default: 0
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  integratedComments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  closedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Proposal', ProposalSchema);
