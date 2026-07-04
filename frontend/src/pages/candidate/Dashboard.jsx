import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiFileText, FiCheckCircle, FiTrendingUp, FiStar, FiCalendar, FiBriefcase,
} from 'react-icons/fi';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { userAPI } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import { StatCardSkeleton } from '../../components/ui/Skeleton';
import { useSelector } from 'react-redux';
import { STATUS_COLORS, timeAgo } from '../../utils/constants';

const COLORS = ['#f59e0b', '#6366f1', '#10b981', '#ef4444', '#3b82f6'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CandidateDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await userAPI.getCandidateDashboard();
        setData(res.data.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const monthlyData = data?.monthlyApplications?.map((m) => ({
    name: MONTHS_SHORT[m._id.month - 1],
    applications: m.count,
  })) || [];

  const statusData = Object.entries(data?.statusBreakdown || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-gradient-to-r from-primary-600 to-purple-600 text-white"
      >
        <h1 className="text-xl font-bold mb-1">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-primary-100 text-sm">
          {!user?.isVerified && '⚠️ Please verify your email for full access. '}
          You have {data?.stats?.interviewsScheduled || 0} interview{data?.stats?.interviewsScheduled !== 1 ? 's' : ''} scheduled.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Applications" value={data?.stats?.totalApplications || 0} icon={FiFileText} color="primary" />
            <StatCard title="Success Rate" value={`${data?.stats?.successRate || 0}%`} icon={FiTrendingUp} color="green" />
            <StatCard title="Resume Score" value={`${data?.stats?.resumeScore || 0}/100`} icon={FiStar} color="amber" />
            <StatCard title="Interviews" value={data?.stats?.interviewsScheduled || 0} icon={FiCalendar} color="purple" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly applications bar chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Applications Over Time</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              Apply to jobs to see your activity
            </div>
          )}
        </div>

        {/* Status pie chart */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Application Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No applications yet</div>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent Applications</h2>
          <Link to="/candidate/applications" className="text-sm text-primary-600 hover:underline">View all</Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.recentApplications?.length > 0 ? (
          <div className="space-y-2">
            {data.recentApplications.map((app) => (
              <div key={app._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {app.job?.company?.logo ? (
                  <img src={app.job.company.logo} alt={app.job?.company?.name} className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <FiBriefcase className="text-primary-600 w-4 h-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{app.job?.title}</p>
                  <p className="text-xs text-slate-500 truncate">{app.job?.company?.name} • {timeAgo(app.createdAt)}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[app.status] || STATUS_COLORS.pending} text-xs`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <FiBriefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No applications yet. <Link to="/jobs" className="text-primary-600 hover:underline">Browse jobs</Link></p>
          </div>
        )}
      </div>

      {/* Resume Score Card */}
      {data && (
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Profile Completeness</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#6366f1" strokeWidth="3"
                  strokeDasharray={`${data.stats.resumeScore} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary-600">
                {data.stats.resumeScore}
              </span>
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {data.stats.resumeScore < 50 ? 'Needs improvement' : data.stats.resumeScore < 80 ? 'Good profile' : 'Excellent profile!'}
              </p>
              <p className="text-sm text-slate-500">
                {data.stats.resumeScore < 100 ? 'Complete your profile to improve visibility.' : 'Your profile is 100% complete!'}
              </p>
              {data.stats.resumeScore < 100 && (
                <Link to="/candidate/profile" className="text-xs text-primary-600 hover:underline">
                  Complete profile →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
