import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiBriefcase, FiFileText, FiHome, FiTrendingUp, FiActivity } from 'react-icons/fi';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { adminAPI } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import { StatCardSkeleton } from '../../components/ui/Skeleton';
import { STATUS_COLORS, timeAgo } from '../../utils/constants';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#6366f1', '#10b981', '#ef4444'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminAPI.getDashboard();
        setData(res.data.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const monthlyUsersData = data?.monthlyUsers?.map((m) => ({
    name: MONTHS[m._id.month - 1],
    users: m.count,
  })) || [];

  const monthlyJobsData = data?.monthlyJobs?.map((m) => ({
    name: MONTHS[m._id.month - 1],
    jobs: m.count,
  })) || [];

  const roleData = data?.usersByRole
    ? Object.entries(data.usersByRole).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white"
      >
        <h1 className="text-xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-slate-300 text-sm">System overview and analytics</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Users" value={data?.stats?.totalUsers || 0} icon={FiUsers} color="primary" />
            <StatCard title="Total Jobs" value={data?.stats?.totalJobs || 0} icon={FiBriefcase} color="blue" />
            <StatCard title="Applications" value={data?.stats?.totalApplications || 0} icon={FiFileText} color="amber" />
            <StatCard title="Companies" value={data?.stats?.totalCompanies || 0} icon={FiHome} color="green" />
            <StatCard title="Open Jobs" value={data?.stats?.openJobs || 0} icon={FiActivity} color="purple" />
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyUsersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Users by Role */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Users by Role</h2>
          {roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {roleData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Loading...</div>
          )}
        </div>
      </div>

      {/* Jobs trend */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Jobs Posted Over Time</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyJobsData}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="jobs" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Users */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Recent Registrations</h2>
        {loading ? (
          <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-12 rounded-xl"/>)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">User</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Role</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentUsers?.map((user) => (
                  <tr key={user._id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600">
                          {user.name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-600 dark:text-slate-400">{user.role}</td>
                    <td className="py-2.5 px-3">
                      <span className={`badge text-xs ${STATUS_COLORS[user.status]}`}>{user.status}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-xs">{timeAgo(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
