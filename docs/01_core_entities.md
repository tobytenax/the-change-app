# Core Entities and Their Attributes for the Change App

This document outlines the primary entities within the Change App and their associated attributes.

## 1. User
   - **UserID:** A unique identifier for the user (e.g., public key, unique ID string).
   - **Username:** A display name (optional, could be pseudonymous).
   - **RegistrationDate:** Date and time the user registered.
   - **CoinBalance:** Current number of coins the user possesses (this might be managed primarily by the Blockchain Integration but mirrored or referenced here).
   - **ReputationScore:** (Optional, if we decide to implement a broader reputation system beyond just coins).
   - **AssociatedScopeIDs:** List of GeographicAreaIDs the user is part of (e.g., their neighborhood, city).
   - **QuizPassStatus:** A list of quizzes passed (e.g., `{ProposalID_or_Topic: "passed", Timestamp: "YYYY-MM-DDTHH:MM:SS"}`).

## 2. Proposal
   - **ProposalID:** A unique identifier for the proposal.
   - **ProposerID:** UserID of the user who submitted the proposal.
   - **Title:** The title of the proposal.
   - **Description:** The full text/content of the proposal.
   - **CreationDate:** Date and time the proposal was submitted.
   - **Status:** Current status (e.g., "Active", "Closed_Passed", "Closed_Failed", "Escalated", "Integrated").
   - **CurrentScopeID:** GeographicAreaID representing the current hierarchical level of the proposal.
   - **YesVotesCount:** Number of 'yes' votes received.
   - **NoVotesCount:** Number of 'no' votes received.
   - **DelegatedVoteCount:** Number of votes cast via delegation.
   - **AssociatedQuizID:** Identifier for the competence quiz linked to this proposal.
   - **SubmissionFeePaid:** Boolean indicating if the 5-coin fee was paid.
   - **ProposerEarnings:** Coins earned by the proposer from 'yes' votes.

## 3. Vote
   - **VoteID:** A unique identifier for the vote.
   - **ProposalID:** The proposal this vote is for.
   - **VoterID:** UserID of the user who cast the vote (or the delegatee if delegated).
   - **DelegatorID:** (If applicable) UserID of the user who delegated this vote.
   - **VoteValue:** The actual vote (e.g., "Yes", "No").
   - **CastDate:** Date and time the vote was cast.
   - **IsDelegated:** Boolean indicating if this was a delegated vote.
   - **CoinEarnedByVoter:** Boolean/Amount indicating if the voter earned a coin.

## 4. Delegation
   - **DelegationID:** A unique identifier for the delegation instance.
   - **ProposalID:** The proposal for which the vote is delegated.
   - **DelegatorID:** UserID of the user delegating their vote.
   - **DelegateeID:** UserID of the user to whom the vote is delegated.
   - **DelegationDate:** Date and time of delegation.
   - **Status:** (e.g., "Active", "Revoked", "Fulfilled_VoteCast").
   - **CoinEarnedByDelegator:** Boolean/Amount.
   - **CoinEarnedByDelegatee:** Boolean/Amount (for the extra coin).
   - **RevocationPenaltyApplied:** Boolean (if revoked and coin forfeited).

## 5. Comment
   - **CommentID:** A unique identifier for the comment.
   - **ProposalID:** The proposal this comment is associated with.
   - **CommenterID:** UserID of the user who made the comment.
   - **ParentCommentID:** (If it's a reply to another comment).
   - **Text:** The content of the comment.
   - **CreationDate:** Date and time the comment was posted.
   - **Upvotes:** Count of upvotes.
   - **Downvotes:** Count of downvotes.
   - **SubmissionFeePaid:** Boolean indicating if the 3-coin fee was paid.
   - **RevenueShareEarned:** Coins earned by the commenter from upvotes.
   - **IsIntegrated:** Boolean, true if the proposer integrated this comment.

## 6. CommentVote (Upvote/Downvote on a Comment)
   - **CommentVoteID:** Unique ID for this action.
   - **CommentID:** The comment being voted on.
   - **VoterID:** UserID of the user upvoting/downvoting the comment.
   - **VoteType:** (e.g., "Upvote", "Downvote").
   - **VoteDate:** Date and time.
   - **CoinEarnedByVoter:** Boolean/Amount.

## 7. Quiz
   - **QuizID:** A unique identifier for the quiz.
   - **AssociatedProposalID_or_Topic:** Links quiz to a proposal or broader topic.
   - **Questions:** List of questions (each question could have its own ID, text, options, correct answer).
   - **PassingCriteria:** E.g., percentage of correct answers required.

## 8. QuizAttempt
   - **AttemptID:** Unique ID for this attempt.
   - **QuizID:** The quiz being attempted.
   - **UserID:** The user attempting the quiz.
   - **Answers:** User's submitted answers.
   - **Score:** Achieved score.
   - **Status:** (e.g., "Passed", "Failed").
   - **AttemptDate:** Date and time.
   - **CoinEarnedForPassing:** Boolean/Amount.

## 9. CoinTransaction
   - **TransactionID:** A unique identifier for the coin transaction (could be the blockchain transaction hash/ID).
   - **Timestamp:** Date and time of the transaction.
   - **Type:** (e.g., "ProposalFee", "CommentFee", "VoteReward", "DelegationReward", "CommentUpvoteReward_Commenter", "CommentUpvoteReward_Voter", "QuizPassReward", "DelegationRevokePenalty").
   - **FromAddress_or_UserID:** Blockchain address or UserID initiating the transaction.
   - **ToAddress_or_UserID:** Blockchain address or UserID receiving the transaction.
   - **Amount:** Number of coins.
   - **BlockchainConfirmationStatus:** (e.g., "Pending", "Confirmed", "Failed").
   - **RelatedEntityID:** (e.g., ProposalID, CommentID, VoteID this transaction is related to).
   - **Description:** A brief note about the transaction.

## 10. GeographicArea (Scope)
   - **AreaID:** Unique identifier for this geographic area or scope.
   - **Name:** Descriptive name (e.g., "My Neighborhood", "City of Reno", "Nevada", "USA", "Earth").
   - **Level:** Type or level in the hierarchy (e.g., "Neighborhood", "City", "State", "Country", "Planet").
   - **ParentAreaID:** Identifier of the parent area in the hierarchy (null if it's a top-level scope like "Earth").
   - **DefiningCriteria:** Description or data defining the boundaries (e.g., list of zip codes, geo-polygon, "All users who opt-in").
   - **ActiveProposalCount:** Number of proposals currently active within this area.

## 11. BlockchainIntegration
   - **IntegrationID:** Unique identifier for this blockchain integration configuration (e.g., "MainChain").
   - **BlockchainName:** Name of the connected blockchain (e.g., "Ethereum", "Polygon", "ChangeAppChain").
   - **NetworkType:** (e.g., "Mainnet", "Testnet").
   - **CoinSmartContractAddress:** Address of the token/coin smart contract, if applicable.
   - **GovernanceSmartContractAddress:** Address of any on-chain governance contracts, if applicable.
   - **NodeEndpoint:** URL of the blockchain node the app connects to.
   - **LastSyncedBlock:** The last blockchain block number processed by the app (for tracking on-chain events).
   - **Status:** Current connection and sync status (e.g., "Connected", "Syncing", "Disconnected").
   - **NativeCoinSymbol:** The symbol of the coin used (e.g., "ETH", "MATIC", "CHANGECOIN").