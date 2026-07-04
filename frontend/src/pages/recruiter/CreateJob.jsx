import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiPlus, FiX, FiArrowLeft } from 'react-icons/fi';
import { jobsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { JOB_TYPES, EXPERIENCE_LEVELS, SKILLS_LIST } from '../../utils/constants';
import { useSelector } from 'react-redux';

const CreateJob = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState([]);
  const [newReq, setNewReq] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { jobType: 'Full-time', experienceLevel: 'Mid' },
  });

  if (!user?.company) {
    return (
      <div className="text-center py-16 card max-w-md mx-auto">
        <p className="text-slate-500 mb-4">You need to set up a company profile before posting jobs.</p>
        <button onClick={() => navigate('/recruiter/company')} className="btn-primary">Set Up Company</button>
      </div>
    );
  }

  const addRequirement = () => {
    const req = newReq.trim();
    if (req && !requirements.includes(req)) {
      setRequirements((p) => [...p, req]);
      setNewReq('');
    }
  };

  const removeRequirement = (req) => setRequirements((p) => p.filter((r) => r !== req));

  const onSubmit = async (data) => {
    if (requirements.length === 0) {
      toast.error('Please add at least one requirement/skill.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...data,
        requirements,
        salary: {
          min: data.salaryMin ? parseInt(data.salaryMin) : undefined,
          max: data.salaryMax ? parseInt(data.salaryMax) : undefined,
          currency: 'USD',
        },
      };
      delete payload.salaryMin;
      delete payload.salaryMax;
      await jobsAPI.createJob(payload);
      toast.success('Job posted successfully!');
      navigate('/recruiter/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Post a New Job</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Job Details</h2>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Job Title *</label>
            <input {...register('title', { required: 'Title is required' })} placeholder="e.g. Senior React Developer" className="input" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Job Type *</label>
              <select {...register('jobType')} className="input">
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Experience Level *</label>
              <select {...register('experienceLevel')} className="input">
                {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Location *</label>
            <input {...register('location', { required: 'Location is required' })} placeholder="e.g. San Francisco, CA or Remote" className="input" />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Min Salary (USD)</label>
              <input {...register('salaryMin')} type="number" placeholder="e.g. 80000" className="input" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Max Salary (USD)</label>
              <input {...register('salaryMax')} type="number" placeholder="e.g. 120000" className="input" />
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Job Description *</h2>
          <textarea
            {...register('description', { required: 'Description is required', minLength: { value: 50, message: 'Description too short (min 50 chars)' } })}
            rows={8}
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            className="input resize-none"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </motion.div>

        {/* Requirements / Skills */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Requirements & Skills *</h2>

          <div className="flex flex-wrap gap-2 mb-3">
            {requirements.map((req) => (
              <span key={req} className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium">
                {req}
                <button type="button" onClick={() => removeRequirement(req)} className="text-primary-400 hover:text-primary-700">
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              list="req-list"
              value={newReq}
              onChange={(e) => setNewReq(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequirement(); } }}
              placeholder="Add skill or requirement..."
              className="input flex-1 text-sm"
            />
            <datalist id="req-list">
              {SKILLS_LIST.map((s) => <option key={s} value={s} />)}
            </datalist>
            <button type="button" onClick={addRequirement} className="btn-primary px-4">
              <FiPlus className="w-4 h-4" />
            </button>
          </div>
          {requirements.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">Add at least one requirement</p>
          )}
        </motion.div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary px-8">
            {loading ? 'Publishing...' : 'Publish Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;
