import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (params, { rejectWithValue }) => {
  try {
    const res = await jobsAPI.getJobs(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch jobs');
  }
});

export const fetchJob = createAsyncThunk('jobs/fetchJob', async (id, { rejectWithValue }) => {
  try {
    const res = await jobsAPI.getJob(id);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Job not found');
  }
});

export const createJob = createAsyncThunk('jobs/createJob', async (data, { rejectWithValue }) => {
  try {
    const res = await jobsAPI.createJob(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create job');
  }
});

export const updateJob = createAsyncThunk('jobs/updateJob', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await jobsAPI.updateJob(id, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update job');
  }
});

export const deleteJob = createAsyncThunk('jobs/deleteJob', async (id, { rejectWithValue }) => {
  try {
    await jobsAPI.deleteJob(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete job');
  }
});

export const toggleJobStatus = createAsyncThunk('jobs/toggleStatus', async (id, { rejectWithValue }) => {
  try {
    const res = await jobsAPI.toggleStatus(id);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    currentJob: null,
    pagination: null,
    loading: false,
    error: null,
    filters: {},
  },
  reducers: {
    setFilters: (state, action) => { state.filters = action.payload; },
    clearCurrentJob: (state) => { state.currentJob = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchJob.pending, (state) => { state.loading = true; })
      .addCase(fetchJob.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
        toast.success('Job created successfully!');
      })
      .addCase(createJob.rejected, (state, action) => {
        toast.error(action.payload);
      })

      .addCase(updateJob.fulfilled, (state, action) => {
        const idx = state.jobs.findIndex((j) => j._id === action.payload._id);
        if (idx !== -1) state.jobs[idx] = action.payload;
        state.currentJob = action.payload;
        toast.success('Job updated successfully!');
      })
      .addCase(updateJob.rejected, (state, action) => {
        toast.error(action.payload);
      })

      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((j) => j._id !== action.payload);
        toast.success('Job deleted successfully!');
      })
      .addCase(deleteJob.rejected, (state, action) => {
        toast.error(action.payload);
      })

      .addCase(toggleJobStatus.fulfilled, (state, action) => {
        const idx = state.jobs.findIndex((j) => j._id === action.payload._id);
        if (idx !== -1) state.jobs[idx] = action.payload;
        toast.success(`Job ${action.payload.status === 'open' ? 'opened' : 'closed'}!`);
      });
  },
});

export const { setFilters, clearCurrentJob } = jobsSlice.actions;
export default jobsSlice.reducer;
