import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get all proposals
export const getProposals = createAsyncThunk(
  'proposal/getProposals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { scope, location, status, page = 1, limit = 10 } = params;
      let url = `/api/proposals?page=${page}&limit=${limit}`;
      
      if (scope) url += `&scope=${scope}`;
      if (status) url += `&status=${status}`;
      if (location) {
        if (location.city) url += `&location.city=${location.city}`;
        if (location.state) url += `&location.state=${location.state}`;
        if (location.country) url += `&location.country=${location.country}`;
      }
      
      const res = await axios.get(url);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

// Get proposal by ID
export const getProposalById = createAsyncThunk(
  'proposal/getProposalById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/proposals/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

// Create proposal
export const createProposal = createAsyncThunk(
  'proposal/createProposal',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/proposals', formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || err.response.data.errors);
    }
  }
);

// Update proposal
export const updateProposal = createAsyncThunk(
  'proposal/updateProposal',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/proposals/${id}`, formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || err.response.data.errors);
    }
  }
);

// Close proposal
export const closeProposal = createAsyncThunk(
  'proposal/closeProposal',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/proposals/${id}/close`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

// Escalate proposal
export const escalateProposal = createAsyncThunk(
  'proposal/escalateProposal',
  async ({ id, newScope }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/proposals/${id}/escalate`, { newScope });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || err.response.data.errors);
    }
  }
);

const initialState = {
  proposals: [],
  proposal: null,
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1
};

const proposalSlice = createSlice({
  name: 'proposal',
  initialState,
  reducers: {
    clearProposal: (state) => {
      state.proposal = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProposals.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProposals.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals = action.payload.proposals;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProposalById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProposalById.fulfilled, (state, action) => {
        state.loading = false;
        state.proposal = action.payload;
      })
      .addCase(getProposalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals = [action.payload, ...state.proposals];
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.proposal = action.payload;
        state.proposals = state.proposals.map(proposal =>
          proposal._id === action.payload._id ? action.payload : proposal
        );
      })
      .addCase(updateProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(closeProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(closeProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.proposal = action.payload;
        state.proposals = state.proposals.map(proposal =>
          proposal._id === action.payload._id ? action.payload : proposal
        );
      })
      .addCase(closeProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(escalateProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(escalateProposal.fulfilled, (state, action) => {
        state.loading = false;
        // Update original proposal
        state.proposals = state.proposals.map(proposal =>
          proposal._id === action.payload.originalProposal._id 
            ? action.payload.originalProposal 
            : proposal
        );
        // Add escalated proposal
        state.proposals = [action.payload.escalatedProposal, ...state.proposals];
      })
      .addCase(escalateProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearProposal, clearError } = proposalSlice.actions;

export default proposalSlice.reducer;
