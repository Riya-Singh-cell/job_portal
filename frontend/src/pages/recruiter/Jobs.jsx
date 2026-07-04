import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit2, FiTrash2, FiCopy, FiEye, FiUsers, FiToggleLeft, FiToggleRight,
} from 'react-icons/fi';
import { STATUS_COLORS, timeAgo, formatSalary } from '../../utils/constants';
import Modal from '../../components/ui/Modal';
import { jobsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const RecruiterJobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const res = await jobsAPI.getMyJobs({ status: statusFilter || undefined, limit: 50 });
      setJobs(res.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyJobs(); }, [statusFilter]);

  const handleDelete = async (id) => {
    try {
      await jobsAPI.deleteJob(id);
      setJobs((prev) => prev.filter((j) => j._id !== id));
      toast.success('Job deleted.');
    } catch {
      toast.error('Failed to delete job.');
    }
    setDeleteConfirm(null);
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await jobsAPI.duplicateJob(id);
      setJobs((prev) => [res.data.data, ...prev]);
      toast.success('Job duplicated.');
    } catch {
      toast.error('Failed to duplicate job.');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await jobsAPI.toggleStatus(id);
      setJobs((prev) => prev.map((j) => j._id === id ? res.data.data : j));
      toast.success(`Job ${res.data.data.status}.`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">My Job Listings</h1>
        <Link to="/recruiter/jobs/create" className="btn-primary gap-2">
          <FiPlus className="w-4 h-4" /> Post a Job
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['', 'open', 'closed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === s
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex gap-4">
              <div className="skeleton h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-slate-500 mb-4">No jobs found.</p>
          <Link to="/recruiter/jobs/create" className="btn-primary">Post your first job</Link>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {jobs.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{job.title}</h3>
                        <p className="text-sm text-slate-500">{job.location} • {job.jobType} • {job.experienceLevel}</p>
                      </div>
                      <span className={`badge ${STATUS_COLORS[job.status]}`}>{job.status}</span>
                    </div>
                    <p className="text-sm text-slate-500">{formatSalary(job.salary)}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><FiUsers className="w-3 h-3" />{job.applicationsCount} applicants</span>
                        <span className="flex items-center gap-1"><FiEye className="w-3 h-3" />{job.views} views</span>
                        <span>Posted {timeAgo(job.createdAt)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/recruiter/jobs/${job._id}/applications`}
                          className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                          title="View applications"
                        >
                          <FiUsers className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/recruiter/jobs/${job._id}/edit`}
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                          title="Edit job"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(job._id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                          title="Duplicate job"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(job._id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                          title={job.status === 'open' ? 'Close job' : 'Reopen job'}
                        >
                          {job.status === 'open' ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(job._id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          title="Delete job"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirm modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Job" size="sm">
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-5">
          This will permanently delete the job listing and all its applications. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default RecruiterJobs;
