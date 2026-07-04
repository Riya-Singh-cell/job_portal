import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiFlag } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { STATUS_COLORS, timeAgo } from '../../utils/constants';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getReports({ status: statusFilter || undefined });
      setReports(res.data.data || []);
    } catch {
      toast.error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [statusFilter]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await adminAPI.updateReportStatus(id, status);
      setReports((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
      toast.success('Report updated.');
    } catch {
      toast.error('Failed to update report.');
    }
  };

  const reportStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Reports</h1>

      {/* Filter */}
      <div className="flex gap-2">
        {['', 'pending', 'reviewed', 'resolved'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === s
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 card">
          <FiFlag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No reports found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 capitalize text-xs">
                      {report.targetType}
                    </span>
                    <span className={`badge text-xs ${reportStatusColors[report.status]}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
                    <strong>Reason:</strong> {report.reason}
                  </p>
                  <p className="text-xs text-slate-400">
                    Reported by {report.reporter?.name || 'Unknown'} · {timeAgo(report.createdAt)}
                  </p>
                </div>

                {report.status !== 'resolved' && (
                  <div className="flex gap-2 flex-shrink-0">
                    {report.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(report._id, 'reviewed')}
                        className="btn-outline text-xs py-1.5 px-3"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusUpdate(report._id, 'resolved')}
                      className="btn text-xs py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
