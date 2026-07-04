import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiClock, FiBriefcase, FiBookmark, FiDollarSign, FiUsers } from 'react-icons/fi';
import { formatSalary, timeAgo, STATUS_COLORS } from '../../utils/constants';
import { savedJobsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const JobCard = ({ job, onSaveToggle }) => {
  const [saved, setSaved] = React.useState(job.isSaved || false);
  const [savingLoading, setSavingLoading] = React.useState(false);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSavingLoading(true);
    try {
      const res = await savedJobsAPI.toggle(job._id);
      setSaved(res.data.data.saved);
      toast.success(res.data.data.saved ? 'Job saved!' : 'Job removed from saved');
      onSaveToggle?.();
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Please log in to save jobs.');
      } else {
        toast.error('Failed to save job.');
      }
    } finally {
      setSavingLoading(false);
    }
  };

  const jobTypeBadge = {
    'Full-time': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Part-time': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Contract': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Internship': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Remote': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  }[job.jobType] || 'bg-slate-100 text-slate-700';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="card p-5 hover:shadow-md transition-all duration-300 group relative"
    >
      <Link to={`/jobs/${job._id}`} className="block">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {job.company?.logo ? (
              <img
                src={job.company.logo}
                alt={job.company?.name}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-100 dark:border-slate-700"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <FiBriefcase className="text-primary-600 w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors">
                {job.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{job.company?.name}</p>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSaveToggle}
            disabled={savingLoading}
            className={`p-2 rounded-lg transition-all flex-shrink-0 ${
              saved
                ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30'
                : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            }`}
            aria-label={saved ? 'Unsave job' : 'Save job'}
          >
            <FiBookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`badge ${jobTypeBadge}`}>{job.jobType}</span>
          <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {job.experienceLevel}
          </span>
          {job.status === 'closed' && (
            <span className="badge bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Closed</span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400 mb-3">
          <span className="flex items-center gap-1.5">
            <FiMapPin className="w-3.5 h-3.5" />
            {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <FiDollarSign className="w-3.5 h-3.5" />
            {formatSalary(job.salary)}
          </span>
          {job.applicationsCount > 0 && (
            <span className="flex items-center gap-1.5">
              <FiUsers className="w-3.5 h-3.5" />
              {job.applicationsCount} applied
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-50 dark:border-slate-700/50">
          <span className="flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            {timeAgo(job.createdAt)}
          </span>
          <span className="text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View details →
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default JobCard;
