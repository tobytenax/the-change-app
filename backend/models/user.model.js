const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    city: {
      type: String,
      required: true
    },
    state: String,
    country: {
      type: String,
      required: true
    }
  },
  acentBalance: {
    type: Number,
    default: 1 // Start with 1 Acent
  },
  dcentBalance: {
    type: Number,
    default: 0
  },
  passedQuizzes: [{
    type: Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  delegationsGiven: [{
    type: Schema.Types.ObjectId,
    ref: 'Delegation'
  }],
  delegationsReceived: [{
    type: Schema.Types.ObjectId,
    ref: 'Delegation'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
