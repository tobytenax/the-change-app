import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create a comment
export const createComment = createAsyncThunk(
  'comment/createComment',
  async ({ proposalId, content }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/comments/${proposalId}`, { content });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

// Get comments for a proposal
export const getComments = createAsyncThunk(
  'comment/getComments',
  async (proposalId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/comments/${proposalId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

// Vote on a comment
export const voteOnComment = createAsyncThunk(
  'comment/voteOnComment',
  async ({ commentId, voteType }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/comments/${commentId}/vote`, { voteType });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

// Integrate a comment
export const integrateComment = createAsyncThunk(
  'comment/integrateComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/comments/${commentId}/integrate`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

// Get user's comment history
export const getUserCommentHistory = createAsyncThunk(
  'comment/getUserCommentHistory',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/comments/user/history');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

const initialState = {
  comments: [],
  userComments: [],
  loading: false,
  error: null,
  commentSuccess: false,
  voteSuccess: false,
  integrateSuccess: false
};

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    clearCommentSuccess: (state) => {
      state.commentSuccess = false;
    },
    clearVoteSuccess: (state) => {
      state.voteSuccess = false;
    },
    clearIntegrateSuccess: (state) => {
      state.integrateSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments.push(action.payload);
        state.commentSuccess = true;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(getComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(voteOnComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(voteOnComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.map(comment =>
          comment._id === action.payload._id ? action.payload : comment
        );
        state.voteSuccess = true;
      })
      .addCase(voteOnComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(integrateComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(integrateComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.map(comment =>
          comment._id === action.payload._id ? action.payload : comment
        );
        state.integrateSuccess = true;
      })
      .addCase(integrateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserCommentHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserCommentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.userComments = action.payload;
      })
      .addCase(getUserCommentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearCommentSuccess, 
  clearVoteSuccess, 
  clearIntegrateSuccess, 
  clearError 
} = commentSlice.actions;

export default commentSlice.reducer;
