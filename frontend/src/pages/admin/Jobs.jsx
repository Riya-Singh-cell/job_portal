import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiEye } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { STATUS_COLORS, timeAgo, formatSalary } from '../../utils/constants';
import toast from 'react-hot-toast';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getJobs({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        limit: 20,
      });
      setJobs(res.data.data || []);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(fetchJobs, 300);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Manage Jobs</h1>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9 text-sm py-2"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input text-sm py-2 w-36"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {['Job', 'Company', 'Recruiter', 'Applications', 'Salary', 'Status', 'Posted'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="skeleton h-4 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No jobs found.</td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="min-w-0 max-w-[200px]">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{job.title}</p>
                        <p className="text-xs text-slate-400">{job.jobType} · {job.experienceLevel}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {job.company?.logo && (
                          <img src={job.company.logo} alt="" className="w-6 h-6 rounded object-cover" />
                        )}
                        <span className="text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                          {job.company?.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{job.recruiter?.name || '—'}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{job.applicationsCount}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{formatSalary(job.salary)}</td>
                    <td className="py-3 px-4">
                      <span className={`badge text-xs ${STATUS_COLORS[job.status]}`}>{job.status}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{timeAgo(job.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500">{pagination.totalItems} jobs total</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={!pagination.hasPrevPage} className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40">Previous</button>
              <span className="text-xs text-slate-500 flex items-center px-2">{page} / {pagination.totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage} className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobs;
