/**
 * Integration middleware for the alchemical conversion process
 * This handles the conversion of Dcents to Acents when comments are integrated
 */

// Check if a comment should be auto-integrated based on votes
export const shouldAutoIntegrate = (comment, threshold = 50, minVotes = 10) => {
  const totalVotes = comment.upvotes + comment.downvotes;
  
  if (totalVotes < minVotes) {
    return false;
  }
  
  const upvotePercentage = (comment.upvotes / totalVotes) * 100;
  return upvotePercentage >= threshold;
};

// Format integrated comments for display
export const formatIntegratedComments = (comments) => {
  if (!comments || comments.length === 0) {
    return [];
  }
  
  return comments
    .filter(comment => comment.isIntegrated)
    .sort((a, b) => new Date(b.integratedAt) - new Date(a.integratedAt));
};

// Check if user can integrate a comment (proposal author only)
export const canIntegrateComment = (userId, proposal) => {
  return proposal && proposal.author && proposal.author._id === userId;
};

// Calculate potential Acent reward for a comment
export const calculatePotentialReward = (comment, proposal) => {
  // Non-competent comments that get integrated earn 1 Acent
  if (!comment.isCompetent) {
    return 1;
  }
  
  // Competent comments don't earn additional Acents from integration
  return 0;
};
