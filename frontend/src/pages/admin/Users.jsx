import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiShield, FiUserX } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { STATUS_COLORS, timeAgo } from '../../utils/constants';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState(null); // { userId, newStatus }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 20,
      });
      setUsers(res.data.data || []);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleStatusChange = async () => {
    if (!confirmModal) return;
    try {
      await adminAPI.updateUserStatus(confirmModal.userId, confirmModal.newStatus);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === confirmModal.userId ? { ...u, status: confirmModal.newStatus } : u
        )
      );
      toast.success(`User ${confirmModal.newStatus}.`);
    } catch {
      toast.error('Failed to update user status.');
    } finally {
      setConfirmModal(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Manage Users</h1>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9 text-sm py-2"
          />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="input text-sm py-2 w-36">
          <option value="">All Roles</option>
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input text-sm py-2 w-36">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {['User', 'Role', 'Status', 'Verified', 'Joined', 'Actions'].map((h) => (
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
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="skeleton h-4 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-primary-600">{user.name?.[0]}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-slate-600 dark:text-slate-400">{user.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge text-xs ${STATUS_COLORS[user.status]}`}>{user.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium ${user.isVerified ? 'text-green-600' : 'text-amber-500'}`}>
                        {user.isVerified ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{timeAgo(user.createdAt)}</td>
                    <td className="py-3 px-4">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() =>
                            setConfirmModal({
                              userId: user._id,
                              userName: user.name,
                              newStatus: user.status === 'active' ? 'suspended' : 'active',
                            })
                          }
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                            user.status === 'active'
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                        >
                          {user.status === 'active' ? (
                            <><FiUserX className="w-3.5 h-3.5" /> Suspend</>
                          ) : (
                            <><FiShield className="w-3.5 h-3.5" /> Activate</>
                          )}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              {pagination.totalItems} users total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!pagination.hasPrevPage}
                className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500 flex items-center px-2">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal?.newStatus === 'suspended' ? 'Suspend User' : 'Activate User'}
        size="sm"
      >
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-5">
          Are you sure you want to{' '}
          <strong>{confirmModal?.newStatus === 'suspended' ? 'suspend' : 'activate'}</strong>{' '}
          <strong>{confirmModal?.userName}</strong>?
          {confirmModal?.newStatus === 'suspended' &&
            ' They will no longer be able to access their account.'}
        </p>
        <div className="flex gap-3">
          <button onClick={() => setConfirmModal(null)} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleStatusChange}
            className={`flex-1 btn ${
              confirmModal?.newStatus === 'suspended'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {confirmModal?.newStatus === 'suspended' ? 'Suspend' : 'Activate'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;
