import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { applicationsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export const fetchMyApplications = createAsyncThunk(
  'applications/fetchMy',
  async (params, { rejectWithValue }) => {
    try {
      const res = await applicationsAPI.getMyApplications(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const applyToJob = createAsyncThunk(
  'applications/apply',
  async ({ jobId, formData }, { rejectWithValue }) => {
    try {
      const res = await applicationsAPI.apply(jobId, formData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Application failed');
    }
  }
);

export const withdrawApplication = createAsyncThunk(
  'applications/withdraw',
  async (id, { rejectWithValue }) => {
    try {
      await applicationsAPI.withdraw(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState: {
    applications: [],
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyApplications.pending, (state) => { state.loading = true; })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(applyToJob.fulfilled, (state, action) => {
        state.applications.unshift(action.payload);
        toast.success('Application submitted successfully!');
      })
      .addCase(applyToJob.rejected, (state, action) => {
        toast.error(action.payload);
      })

      .addCase(withdrawApplication.fulfilled, (state, action) => {
        state.applications = state.applications.filter((a) => a._id !== action.payload);
        toast.success('Application withdrawn.');
      })
      .addCase(withdrawApplication.rejected, (state, action) => {
        toast.error(action.payload);
      });
  },
});

export default applicationsSlice.reducer;
