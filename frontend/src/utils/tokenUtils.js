/**
 * Utility functions for token management
 */

// Format token balance with appropriate symbol
export const formatTokenBalance = (amount, type) => {
  if (type === 'acent') {
    return `${amount} Ⓐ`;
  } else {
    return `${amount} Ⓓ`;
  }
};

// Check if user has sufficient balance
export const hasSufficientBalance = (userBalance, requiredAmount, tokenType) => {
  if (tokenType === 'acent') {
    return userBalance.acentBalance >= requiredAmount;
  } else {
    return userBalance.dcentBalance >= requiredAmount;
  }
};

// Get transaction type description
export const getTransactionTypeDescription = (type) => {
  const descriptions = {
    'quiz_pass': 'Passed quiz',
    'vote_cast': 'Cast vote',
    'proposal_creation': 'Created proposal',
    'delegation_given': 'Delegated vote',
    'delegation_received': 'Received delegation',
    'delegation_revoked': 'Revoked delegation',
    'comment_creation': 'Created comment',
    'comment_vote': 'Voted on comment',
    'comment_upvote_received': 'Received upvote on comment',
    'comment_integration': 'Comment integrated',
    'proposal_vote_received': 'Received vote on proposal'
  };
  
  return descriptions[type] || type;
};

// Get token color
export const getTokenColor = (type) => {
  return type === 'acent' ? '#1976d2' : '#f50057';
};
