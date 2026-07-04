import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FiMapPin, FiDollarSign, FiBriefcase, FiClock, FiUsers, FiBookmark,
  FiExternalLink, FiArrowLeft, FiEye,
} from 'react-icons/fi';
import { jobsAPI, applicationsAPI } from '../services/api';
import { formatSalary, timeAgo, STATUS_COLORS } from '../utils/constants';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobsAPI.getJob(id);
        setJob(res.data.data);
        setSaved(res.data.data.isSaved);
      } catch {
        toast.error('Job not found.');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setApplying(true);
    try {
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      if (resumeFile) formData.append('resume', resumeFile);

      await applicationsAPI.apply(id, formData);
      toast.success('Application submitted!');
      setApplyModalOpen(false);
      setJob((prev) => ({ ...prev, hasApplied: true }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 container-custom py-12">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="pt-20 pb-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to jobs
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-start gap-4 mb-5">
                  {job.company?.logo ? (
                    <img src={job.company.logo} alt={job.company?.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-100 dark:border-slate-700" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <FiBriefcase className="text-primary-600 w-7 h-7" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">{job.title}</h1>
                    <p className="text-slate-500">{job.company?.name}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{job.jobType}</span>
                  <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">{job.experienceLevel} Level</span>
                  <span className={`badge ${job.status === 'open' ? STATUS_COLORS.open : STATUS_COLORS.closed}`}>
                    {job.status === 'open' ? 'Actively Hiring' : 'Closed'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <FiMapPin className="w-4 h-4 text-slate-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiDollarSign className="w-4 h-4 text-slate-400" />
                    {formatSalary(job.salary)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiUsers className="w-4 h-4 text-slate-400" />
                    {job.applicationsCount} applied
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiEye className="w-4 h-4 text-slate-400" />
                    {job.views} views
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  Posted {timeAgo(job.createdAt)}
                </p>
              </motion.div>

              {/* Description */}
              <div className="card p-6">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Job Description</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line text-sm">
                  {job.description}
                </p>
              </div>

              {/* Requirements */}
              {job.requirements?.length > 0 && (
                <div className="card p-6">
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Requirements & Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Apply CTA */}
              <div className="card p-5 sticky top-24">
                {job.hasApplied ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">✅</span>
                    </div>
                    <p className="font-semibold text-green-600 mb-1">Applied!</p>
                    <p className="text-sm text-slate-500">You've already applied to this job.</p>
                    <Link to="/candidate/applications" className="btn-outline w-full mt-3 text-sm justify-center">
                      View Applications
                    </Link>
                  </div>
                ) : job.status === 'closed' ? (
                  <div className="text-center">
                    <p className="font-semibold text-red-600 mb-1">Position Closed</p>
                    <p className="text-sm text-slate-500">This job is no longer accepting applications.</p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => user ? setApplyModalOpen(true) : navigate('/login')}
                      className="btn-primary w-full justify-center mb-3"
                    >
                      {user ? 'Apply Now' : 'Sign in to Apply'}
                    </button>
                    <p className="text-center text-xs text-slate-400">Quick apply with your profile</p>
                  </>
                )}
              </div>

              {/* Company Info */}
              {job.company && (
                <div className="card p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 text-sm">About the Company</h3>
                  <div className="flex items-center gap-3 mb-3">
                    {job.company.logo && (
                      <img src={job.company.logo} alt={job.company.name} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{job.company.name}</p>
                      <p className="text-xs text-slate-500">{job.company.industry}</p>
                    </div>
                  </div>
                  {job.company.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-3">
                      {job.company.description}
                    </p>
                  )}
                  <div className="space-y-1.5 text-xs text-slate-500">
                    {job.company.location && (
                      <div className="flex items-center gap-1.5"><FiMapPin className="w-3 h-3" />{job.company.location}</div>
                    )}
                    {job.company.website && (
                      <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary-600 hover:underline">
                        <FiExternalLink className="w-3 h-3" />Visit website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)} title={`Apply to ${job.title}`}>
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Resume (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="input text-sm py-2 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:text-xs file:font-medium hover:file:bg-primary-100 cursor-pointer"
            />
            <p className="text-xs text-slate-400 mt-1">Leave empty to use your profile resume</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Cover Letter
            </label>
            <textarea
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the recruiter why you're a great fit for this role..."
              className="input resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" disabled={applying} className="btn-primary flex-1">
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobDetail;
