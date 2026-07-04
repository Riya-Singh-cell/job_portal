import React, { useEffect, useState } from 'react';
import { FiBookmark } from 'react-icons/fi';
import { savedJobsAPI } from '../../services/api';
import JobCard from '../../components/ui/JobCard';
import { JobCardSkeleton } from '../../components/ui/Skeleton';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      const res = await savedJobsAPI.getAll();
      setSavedJobs(res.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSavedJobs(); }, []);

  const jobs = savedJobs.map((sj) => ({ ...sj.job, isSaved: true })).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Saved Jobs</h1>
        <span className="text-sm text-slate-500">{jobs.length} saved</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 card">
          <FiBookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No saved jobs yet. Browse jobs and save the ones you like!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} onSaveToggle={fetchSavedJobs} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
