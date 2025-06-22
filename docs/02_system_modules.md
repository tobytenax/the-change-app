# System Modules Overview for the Change App

This document provides a high-level overview of the core functional modules within the Change App. It outlines their primary responsibilities and initial architectural considerations, particularly regarding data consistency requirements.

## 1. User Identity & Access Management Module
   - **Responsibilities:**
     - User registration and authentication.
     - Managing user profiles and unique identifiers (UserID, Username).
     - Associating users with relevant Geographic Areas/Scopes.
     - Managing user permissions based on roles or qualifications (e.g., quiz pass status for voting).
   - **Architectural Considerations:**
     - Core user identity data (UserID, hashed credentials, definitive quiz pass status) likely requires a **Strong Consistency** system.
     - Hypercore public keys (from Autobase) could serve as UserIDs or be linked to them.
     - Profile details or less critical preferences might leverage Autobase for P2P sharing if desired.
   - **Key Interactions:** Token System (for linking identity to balances), Quiz System (for qualifications), Voting/Delegation/Proposal/Commenting Systems (for permissions and attributing actions).

## 2. Token System ("Coin Engine")
   - **Responsibilities:**
     - Managing the creation, distribution, and transfer of the Change App's unique "Coin."
     - Maintaining an accurate, immutable, and auditable ledger of all coin transactions and user balances specific to the Change App ecosystem.
     - Processing all coin-related actions: fees for proposals/comments, rewards for voting/delegation/quizzes/comment upvotes, penalties, as defined by the app's rules.
     - Ensuring atomicity of transactions (all parts of a transaction succeed or fail together).
     - Preventing double-spending and ensuring the integrity of the coin supply.
   - **Architectural Considerations:**
     - This module **must** be built on a **Strong Consistency** system, forming the backbone of the Change App's intrinsic economy.
     - This points towards a **custom-designed and implemented Distributed Ledger Technology (DLT), a dedicated private/consortium blockchain, or a highly secure auditable database system** built to purpose for the Change App.
     - The system must ensure transparency appropriate for its governance role while protecting user privacy as needed.
     - **Autobase is not suitable for this core ledger due to its eventual consistency model.**
   - **Key Interactions:** All other modules that involve earning or spending coins. This is the central financial hub of the Change App.

## 3. Proposal Management Module
   - **Responsibilities:**
     - Allowing users to create, submit, and manage proposals (text, metadata).
     - Handling the lifecycle of a proposal (Active, Closed, Escalated, Integrated).
     - Storing proposal content and associating it with its proposer, scope, and quiz.
     - Triggering fee collection (via Token System) for proposal submission.
     - Calculating and triggering proposer rewards based on 'yes' votes (via Token System).
   - **Architectural Considerations:**
     - Proposal text and metadata (description, title) could be well-suited for **Autobase** (append-only logs, P2P distribution).
     - The *authoritative status* of a proposal (e.g., officially "Active" or "Passed") and its definitive vote counts would likely need to be confirmed or mirrored in a **Strong Consistency** system, especially when financial transactions or escalations depend on it.
   - **Key Interactions:** Token System (fees, rewards), Voting System (vote counts), Hierarchical Scaling Module (escalation), Quiz System (linking quizzes), Commenting System (linking comments).

## 4. Quiz Management Module
   - **Responsibilities:**
     - Creating and storing quiz questions and answers, associated with proposals or topics.
     - Presenting quizzes to users.
     - Recording user attempts, scores, and pass/fail status.
     - Triggering coin rewards for passing quizzes (via Token System).
   - **Architectural Considerations:**
     - Quiz content (questions, options) could be stored in **Autobase**.
     - User attempts might also be logged via Autobase.
     - The *official record* of a user's pass/fail status for a specific quiz, which gates their ability to vote, needs to be reliably stored and retrieved, pointing towards a **Strong Consistency** system or a highly reliable part of the User Identity module.
   - **Key Interactions:** User Identity & Access (updating qualifications), Proposal System (linking quizzes to proposals), Token System (rewards), Voting System (checking qualification).

## 5. Voting Mechanism Module
   - **Responsibilities:**
     - Allowing qualified users (quiz passers) to cast votes (pro/con) on proposals.
     - Securely recording votes and preventing duplicate or unauthorized voting.
     - Tallying votes accurately for each proposal.
     - Triggering coin rewards for voters (via Token System).
   - **Architectural Considerations:**
     - Individual vote submissions (as signed attestations) could be written to **Autobase** for transparency and auditability.
     - A **Strong Consistency** component is crucial for:
       - Verifying voter qualification *at the time of voting*.
       - Preventing double-voting definitively.
       - Achieving a final, agreed-upon tally for vote resolution.
       - The official outcome (Passed/Failed) that impacts coin distribution or proposal escalation.
   - **Key Interactions:** User Identity & Access (qualification), Proposal System (linking votes to proposals), Token System (rewards), Delegation System (handling delegated votes).

## 6. Delegation Module
   - **Responsibilities:**
     - Allowing users who haven't passed a quiz to delegate their voting power to a qualified user.
     - Tracking delegation relationships (delegator, delegatee, proposal).
     - Handling revocation of delegations and associated coin penalties/regain paths.
     - Triggering coin payments to delegators and delegatees (via Token System).
     - Enforcing restrictions on redelegation.
   - **Architectural Considerations:**
     - Delegation *intents* or declarations could be logged via **Autobase**.
     - The *active state* of a delegation (who is currently delegated for what) and the enforcement of rules (penalties, cooldowns) need a **Strong Consistency** system to avoid race conditions and ensure fairness.
   - **Key Interactions:** User Identity & Access (qualification of delegatee), Voting System (casting delegated vote), Token System (rewards, penalties), Proposal System.

## 7. Commenting & Interaction Module
   - **Responsibilities:**
     - Allowing users to post comments on proposals.
     - Handling upvoting/downvoting of comments.
     - Triggering fee collection for posting comments (via Token System).
     - Calculating and distributing revenue share to commenters based on upvotes (via Token System).
     - Allowing proposal authors to "integrate" comments, finalizing payouts.
     - Paying users for voting on comments (up or down).
   - **Architectural Considerations:**
     - Comment content and upvote/downvote signals are a good fit for **Autobase** (P2P, append-only).
     - Financial transactions (fees, rewards, revenue share) **must** be processed by the **Token System** (Strong Consistency).
     - The "integration" action by a proposer could be an Autobase event that triggers a final settlement in the Token System.
   - **Key Interactions:** Proposal System (linking comments), Token System (fees, rewards, revenue share), User Identity & Access.

## 8. Hierarchical Scaling Module
   - **Responsibilities:**
     - Defining and managing geographical/organizational scopes (Neighborhood, City, etc.).
     - Presenting proposals within their initial scope.
     - Tracking support levels (vote counts, participation rates) for proposals within each scope.
     - Implementing logic to escalate proposals to the next hierarchical level upon reaching predefined thresholds.
   - **Architectural Considerations:**
     - Definitions of scopes could be managed in a **Strong Consistency** system or as fairly static configuration data.
     - The *decision to escalate* a proposal must be based on definitive vote tallies, thus relying on the **Strong Consistency** aspects of the Voting System and Proposal Management.
     - Announcing a proposal's availability in a new scope could leverage **Autobase** for visibility.
   - **Key Interactions:** Proposal System (status changes), Voting System (vote counts), GeographicArea Entity.

## 9. Custom Ledger/Blockchain Interface Module
   - **Responsibilities:**
     - Acting as the primary interface between the Change App's various modules (Voting, Proposals, Comments, etc.) and the **dedicated Token System ledger/blockchain.**
     - Translating application actions (e.g., "user passed a quiz") into ledger operations (e.g., "credit X coins to UserID Y").
     - Submitting transaction requests to the custom Token System ledger/blockchain.
     - Querying this ledger for balances, transaction statuses, and audit trails.
     - Potentially listening for events or state changes from this custom ledger if it operates asynchronously.
   - **Architectural Considerations:**
     - This module is the bridge to the **Strong Consistency** provided by the bespoke Token System. Its internal workings will be tightly coupled to the design and API of that custom ledger/blockchain.
     - If a new DLT/blockchain is developed, this module would encompass the necessary logic for communication (e.g., transaction signing, node communication protocols).
   - **Key Interactions:** Token System (as its direct operational arm), and indirectly with any module that triggers a coin transaction or relies on coin balance information.