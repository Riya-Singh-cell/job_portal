import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiPlus, FiX, FiArrowLeft } from 'react-icons/fi';
import { jobsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { JOB_TYPES, EXPERIENCE_LEVELS, SKILLS_LIST } from '../../utils/constants';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [requirements, setRequirements] = useState([]);
  const [newReq, setNewReq] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobsAPI.getJob(id);
        const job = res.data.data;
        reset({
          title: job.title,
          location: job.location,
          jobType: job.jobType,
          experienceLevel: job.experienceLevel,
          description: job.description,
          salaryMin: job.salary?.min || '',
          salaryMax: job.salary?.max || '',
        });
        setRequirements(job.requirements || []);
      } catch {
        toast.error('Failed to load job.');
        navigate('/recruiter/jobs');
      } finally {
        setFetching(false);
      }
    };
    fetchJob();
  }, [id]);

  const addRequirement = () => {
    const req = newReq.trim();
    if (req && !requirements.includes(req)) {
      setRequirements((p) => [...p, req]);
      setNewReq('');
    }
  };

  const onSubmit = async (data) => {
    if (requirements.length === 0) return toast.error('Add at least one requirement.');
    setLoading(true);
    try {
      const payload = {
        ...data,
        requirements,
        salary: { min: parseInt(data.salaryMin) || undefined, max: parseInt(data.salaryMax) || undefined, currency: 'USD' },
      };
      delete payload.salaryMin; delete payload.salaryMax;
      await jobsAPI.updateJob(id, payload);
      toast.success('Job updated!');
      navigate('/recruiter/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="space-y-4">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-16 rounded-xl"/>)}</div>;

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Edit Job</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Job Details</h2>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Job Title *</label>
            <input {...register('title', { required: 'Required' })} className="input" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Job Type</label>
              <select {...register('jobType')} className="input">{JOB_TYPES.map((t)=><option key={t} value={t}>{t}</option>)}</select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Experience Level</label>
              <select {...register('experienceLevel')} className="input">{EXPERIENCE_LEVELS.map((l)=><option key={l} value={l}>{l}</option>)}</select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Location *</label>
            <input {...register('location', { required: 'Required' })} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Min Salary</label>
              <input {...register('salaryMin')} type="number" className="input" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Max Salary</label>
              <input {...register('salaryMax')} type="number" className="input" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Description *</h2>
          <textarea {...register('description', { required: 'Required' })} rows={8} className="input resize-none" />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Requirements & Skills</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {requirements.map((req) => (
              <span key={req} className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium">
                {req}
                <button type="button" onClick={() => setRequirements((p) => p.filter((r) => r !== req))}>
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input list="req-list" value={newReq} onChange={(e) => setNewReq(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequirement(); }}}
              placeholder="Add requirement..." className="input flex-1 text-sm" />
            <datalist id="req-list">{SKILLS_LIST.map((s)=><option key={s} value={s}/>)}</datalist>
            <button type="button" onClick={addRequirement} className="btn-primary px-4"><FiPlus className="w-4 h-4"/></button>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary px-8">{loading ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
