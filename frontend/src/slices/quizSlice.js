import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get quiz for a proposal
export const getQuiz = createAsyncThunk(
  'quiz/getQuiz',
  async (proposalId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/quizzes/${proposalId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

// Create quiz
export const createQuiz = createAsyncThunk(
  'quiz/createQuiz',
  async ({ proposalId, formData }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/quizzes/${proposalId}`, formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || err.response.data.errors);
    }
  }
);

// Submit quiz attempt
export const submitQuizAttempt = createAsyncThunk(
  'quiz/submitQuizAttempt',
  async ({ proposalId, answers }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/quizzes/${proposalId}/attempt`, { answers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

// Get user's quiz attempts
export const getUserQuizAttempts = createAsyncThunk(
  'quiz/getUserQuizAttempts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/quizzes/user/attempts');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

const initialState = {
  quiz: null,
  quizResult: null,
  passedQuizzes: [],
  loading: false,
  error: null
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    clearQuiz: (state) => {
      state.quiz = null;
      state.quizResult = null;
    },
    clearQuizResult: (state) => {
      state.quizResult = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getQuiz.pending, (state) => {
        state.loading = true;
      })
      .addCase(getQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quiz = action.payload;
      })
      .addCase(getQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quiz = action.payload;
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitQuizAttempt.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitQuizAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.quizResult = action.payload;
        if (action.payload.passed) {
          state.passedQuizzes.push(state.quiz._id);
        }
      })
      .addCase(submitQuizAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserQuizAttempts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserQuizAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.passedQuizzes = action.payload.passedQuizzes;
      })
      .addCase(getUserQuizAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearQuiz, clearQuizResult, clearError } = quizSlice.actions;

export default quizSlice.reducer;
