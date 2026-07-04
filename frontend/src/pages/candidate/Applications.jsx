import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiBriefcase, FiClock, FiTrash2 } from 'react-icons/fi';
import { fetchMyApplications, withdrawApplication } from '../../redux/slices/applicationsSlice';
import { STATUS_COLORS, timeAgo, formatSalary } from '../../utils/constants';
import Modal from '../../components/ui/Modal';

const statusTabs = ['all', 'pending', 'shortlisted', 'interviewing', 'accepted', 'rejected'];

const CandidateApplications = () => {
  const dispatch = useDispatch();
  const { applications, loading } = useSelector((state) => state.applications);
  const [activeTab, setActiveTab] = useState('all');
  const [confirmWithdraw, setConfirmWithdraw] = useState(null);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  const filtered = activeTab === 'all' ? applications : applications.filter((a) => a.status === activeTab);

  const handleWithdraw = (id) => {
    dispatch(withdrawApplication(id));
    setConfirmWithdraw(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">My Applications</h1>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab !== 'all' && (
              <span className="ml-1.5 text-xs opacity-75">
                ({applications.filter((a) => a.status === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 flex gap-4 animate-pulse">
              <div className="skeleton w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 card">
          <FiBriefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No {activeTab !== 'all' ? activeTab : ''} applications found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4"
            >
              <div className="flex items-start gap-4">
                {app.job?.company?.logo ? (
                  <img src={app.job.company.logo} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <FiBriefcase className="text-primary-600 w-5 h-5" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{app.job?.title}</h3>
                      <p className="text-xs text-slate-500">{app.job?.company?.name} • {app.job?.location}</p>
                    </div>
                    <span className={`badge ${STATUS_COLORS[app.status] || STATUS_COLORS.pending} whitespace-nowrap`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Timeline */}
                  {app.timeline?.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {app.timeline.map((t, i) => (
                        <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full ${i === app.timeline.length - 1 ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                          <span className="text-xs text-slate-400">
                            {t.status} • {new Date(t.date).toLocaleDateString()}
                          </span>
                          {i < app.timeline.length - 1 && <div className="w-4 h-px bg-slate-200 dark:bg-slate-700" />}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      Applied {timeAgo(app.createdAt)}
                    </p>
                    {['pending', 'shortlisted'].includes(app.status) && (
                      <button
                        onClick={() => setConfirmWithdraw(app._id)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                      >
                        <FiTrash2 className="w-3 h-3" /> Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirm withdraw modal */}
      <Modal isOpen={!!confirmWithdraw} onClose={() => setConfirmWithdraw(null)} title="Withdraw Application" size="sm">
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-5">
          Are you sure you want to withdraw this application? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setConfirmWithdraw(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => handleWithdraw(confirmWithdraw)} className="btn-danger flex-1">Withdraw</button>
        </div>
      </Modal>
    </div>
  );
};

export default CandidateApplications;
