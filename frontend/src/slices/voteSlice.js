import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Cast a vote
export const castVote = createAsyncThunk(
  'vote/castVote',
  async ({ proposalId, voteType }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/votes/${proposalId}`, { voteType });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

// Get votes for a proposal
export const getVotes = createAsyncThunk(
  'vote/getVotes',
  async (proposalId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/votes/${proposalId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

// Get user's voting history
export const getUserVotingHistory = createAsyncThunk(
  'vote/getUserVotingHistory',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/votes/user/history');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

const initialState = {
  votes: [],
  userVotes: [],
  loading: false,
  error: null,
  voteSuccess: false
};

const voteSlice = createSlice({
  name: 'vote',
  initialState,
  reducers: {
    clearVoteSuccess: (state) => {
      state.voteSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(castVote.pending, (state) => {
        state.loading = true;
      })
      .addCase(castVote.fulfilled, (state, action) => {
        state.loading = false;
        state.voteSuccess = true;
        state.userVotes.push(action.payload.vote);
      })
      .addCase(castVote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getVotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVotes.fulfilled, (state, action) => {
        state.loading = false;
        state.votes = action.payload;
      })
      .addCase(getVotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserVotingHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserVotingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.userVotes = action.payload;
      })
      .addCase(getUserVotingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearVoteSuccess, clearError } = voteSlice.actions;

export default voteSlice.reducer;
