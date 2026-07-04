import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiUser, FiMail, FiDownload, FiCheck, FiX, FiCalendar, FiStar,
} from 'react-icons/fi';
import { applicationsAPI, jobsAPI } from '../../services/api';
import { STATUS_COLORS, timeAgo } from '../../utils/constants';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'shortlisted', label: 'Shortlist', color: 'btn-primary' },
  { value: 'rejected', label: 'Reject', color: 'btn-danger' },
  { value: 'accepted', label: 'Accept', color: 'bg-green-600 hover:bg-green-700 text-white btn' },
];

const JobApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewModal, setInterviewModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [interviewData, setInterviewData] = useState({ scheduledDate: '', type: 'Technical', format: 'Online', meetingLink: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          jobsAPI.getJob(id),
          applicationsAPI.getJobApplications(id, { limit: 50 }),
        ]);
        setJob(jobRes.data.data);
        setApplications(appsRes.data.data || []);
      } catch {
        toast.error('Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleStatusUpdate = async (appId, status) => {
    try {
      const res = await applicationsAPI.updateStatus(appId, { status });
      setApplications((prev) => prev.map((a) => a._id === appId ? res.data.data : a));
      toast.success(`Application ${status}.`);
      setSelectedApp(null);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleScheduleInterview = async () => {
    if (!interviewData.scheduledDate) return toast.error('Please select a date and time.');
    try {
      await applicationsAPI.scheduleInterview(interviewModal, interviewData);
      setApplications((prev) => prev.map((a) => a._id === interviewModal ? { ...a, status: 'interviewing' } : a));
      toast.success('Interview scheduled!');
      setInterviewModal(null);
    } catch {
      toast.error('Failed to schedule interview.');
    }
  };

  const filtered = statusFilter ? applications.filter((a) => a.status === statusFilter) : applications;

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-3 transition-colors">
          <FiArrowLeft className="w-4 h-4" /> Back to jobs
        </button>
        {job && (
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{job.title}</h1>
            <p className="text-slate-500 text-sm">{applications.length} total applications</p>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', 'pending', 'shortlisted', 'interviewing', 'accepted', 'rejected'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 opacity-70">({s === '' ? applications.length : applications.filter(a=>a.status===s).length})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="card p-4 animate-pulse h-20"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-slate-500">No applications found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <motion.div key={app._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {app.candidate?.avatar ? (
                    <img src={app.candidate.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary-600 font-bold">{app.candidate?.name?.[0]}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{app.candidate?.name}</h3>
                      <p className="text-xs text-slate-500">{app.candidate?.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* AI match score badge */}
                      {app.aiMatchScore > 0 && (
                        <span className={`badge text-xs ${app.aiMatchScore >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600'}`}>
                          <FiStar className="w-3 h-3 mr-1" />{app.aiMatchScore}%
                        </span>
                      )}
                      <span className={`badge ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  {app.candidate?.profile?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {app.candidate.profile.skills.slice(0, 5).map((skill) => (
                        <span key={skill} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">{skill}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-slate-400">Applied {timeAgo(app.createdAt)}</p>

                    <div className="flex items-center gap-1.5">
                      {app.candidate?.profile?.resume && (
                        <a href={app.candidate.profile.resume} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all" title="Download resume">
                          <FiDownload className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => setSelectedApp(app)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all" title="View profile">
                        <FiUser className="w-4 h-4" />
                      </button>
                      {!['accepted', 'rejected'].includes(app.status) && (
                        <>
                          <button onClick={() => handleStatusUpdate(app._id, 'shortlisted')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all" title="Shortlist">
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button onClick={() => setInterviewModal(app._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all" title="Schedule interview">
                            <FiCalendar className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusUpdate(app._id, 'rejected')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Reject">
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Candidate detail modal */}
      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="Candidate Profile" size="lg">
        {selectedApp && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
                {selectedApp.candidate?.avatar ? (
                  <img src={selectedApp.candidate.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary-600">{selectedApp.candidate?.name?.[0]}</span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedApp.candidate?.name}</h2>
                <p className="text-slate-500 text-sm">{selectedApp.candidate?.email}</p>
              </div>
            </div>

            {selectedApp.candidate?.profile?.bio && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Bio</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedApp.candidate.profile.bio}</p>
              </div>
            )}

            {selectedApp.candidate?.profile?.skills?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.candidate.profile.skills.map((s) => (
                    <span key={s} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-sm">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedApp.coverLetter && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Cover Letter</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">{selectedApp.coverLetter}</p>
              </div>
            )}

            {!['accepted', 'rejected'].includes(selectedApp.status) && (
              <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => handleStatusUpdate(selectedApp._id, 'shortlisted')} className="btn-primary flex-1">Shortlist</button>
                <button onClick={() => { setInterviewModal(selectedApp._id); setSelectedApp(null); }} className="btn-secondary flex-1">Schedule Interview</button>
                <button onClick={() => handleStatusUpdate(selectedApp._id, 'rejected')} className="btn-danger flex-1">Reject</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Schedule interview modal */}
      <Modal isOpen={!!interviewModal} onClose={() => setInterviewModal(null)} title="Schedule Interview" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Date & Time *</label>
            <input type="datetime-local" value={interviewData.scheduledDate} onChange={(e) => setInterviewData((p) => ({ ...p, scheduledDate: e.target.value }))} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Interview Type</label>
              <select value={interviewData.type} onChange={(e) => setInterviewData((p) => ({ ...p, type: e.target.value }))} className="input">
                {['Technical', 'HR', 'Behavioral', 'System Design'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Format</label>
              <select value={interviewData.format} onChange={(e) => setInterviewData((p) => ({ ...p, format: e.target.value }))} className="input">
                {['Online', 'On-Site'].map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          {interviewData.format === 'Online' && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Meeting Link</label>
              <input type="url" value={interviewData.meetingLink} onChange={(e) => setInterviewData((p) => ({ ...p, meetingLink: e.target.value }))} placeholder="https://meet.google.com/..." className="input" />
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setInterviewModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleScheduleInterview} className="btn-primary flex-1">Schedule</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobApplications;
