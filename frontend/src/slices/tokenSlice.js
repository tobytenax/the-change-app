import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get token balance
export const getTokenBalance = createAsyncThunk(
  'token/getTokenBalance',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/tokens/balance');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

// Get transaction history
export const getTransactionHistory = createAsyncThunk(
  'token/getTransactionHistory',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/tokens/transactions');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

// Get token leaderboard
export const getTokenLeaderboard = createAsyncThunk(
  'token/getTokenLeaderboard',
  async ({ type = 'acent', limit = 10 }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/tokens/leaderboard?type=${type}&limit=${limit}`);
      return { type, users: res.data };
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

const initialState = {
  acentBalance: 0,
  dcentBalance: 0,
  transactions: [],
  leaderboard: {
    acent: [],
    dcent: []
  },
  loading: false,
  error: null
};

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTokenBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTokenBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.acentBalance = action.payload.acentBalance;
        state.dcentBalance = action.payload.dcentBalance;
      })
      .addCase(getTokenBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTransactionHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTransactionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(getTransactionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTokenLeaderboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTokenLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard[action.payload.type] = action.payload.users;
      })
      .addCase(getTokenLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = tokenSlice.actions;

export default tokenSlice.reducer;
