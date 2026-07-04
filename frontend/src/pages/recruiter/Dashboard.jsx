import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBriefcase, FiUsers, FiTrendingUp, FiPlusCircle, FiEye, FiHome,
} from 'react-icons/fi';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  FunnelChart, Funnel, LabelList, Cell,
} from 'recharts';
import { jobsAPI, applicationsAPI } from '../../services/api';
import { adminAPI } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import { StatCardSkeleton } from '../../components/ui/Skeleton';
import { useSelector } from 'react-redux';
import { STATUS_COLORS, timeAgo } from '../../utils/constants';

const FUNNEL_COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

const RecruiterDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, analyticsRes] = await Promise.all([
          jobsAPI.getMyJobs({ limit: 5 }),
          user?._id ? adminAPI.getRecruiterAnalytics(user._id) : null,
        ]);
        setMyJobs(jobsRes.data.data || []);
        if (analyticsRes) setStats(analyticsRes.data.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const funnelData = stats
    ? [
        { name: 'Applied', value: stats.totalApplications, fill: FUNNEL_COLORS[0] },
        { name: 'Shortlisted', value: stats.hiringFunnel?.shortlisted || 0, fill: FUNNEL_COLORS[1] },
        { name: 'Interviewing', value: stats.hiringFunnel?.interviewing || 0, fill: FUNNEL_COLORS[2] },
        { name: 'Accepted', value: stats.hiringFunnel?.accepted || 0, fill: FUNNEL_COLORS[3] },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-gradient-to-r from-primary-600 to-purple-600 text-white"
      >
        <h1 className="text-xl font-bold mb-1">Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-primary-100 text-sm">
          {!user?.company
            ? '⚠️ Set up your company profile to start posting jobs.'
            : `You have ${stats?.openJobs || 0} active job listings.`}
        </p>
        {!user?.company && (
          <Link to="/recruiter/company" className="mt-3 inline-block bg-white text-primary-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors">
            Set Up Company →
          </Link>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Jobs" value={stats?.totalJobs || 0} icon={FiBriefcase} color="primary" />
            <StatCard title="Open Jobs" value={stats?.openJobs || 0} icon={FiTrendingUp} color="green" />
            <StatCard title="Total Applicants" value={stats?.totalApplications || 0} icon={FiUsers} color="amber" />
            <StatCard title="Hired" value={stats?.hiringFunnel?.accepted || 0} icon={FiTrendingUp} color="blue" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Hiring Funnel</h2>
          {funnelData.length > 0 && funnelData[0].value > 0 ? (
            <div className="space-y-2">
              {funnelData.map((item, i) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{item.value}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: funnelData[0].value > 0 ? `${(item.value / funnelData[0].value) * 100}%` : '0%',
                        backgroundColor: item.fill,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
              No application data yet
            </div>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent Jobs</h2>
            <Link to="/recruiter/jobs" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : myJobs.length === 0 ? (
            <div className="text-center py-8">
              <FiBriefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-3">No jobs posted yet.</p>
              <Link to="/recruiter/jobs/create" className="btn-primary text-sm">
                <FiPlusCircle className="w-4 h-4" /> Post a Job
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {myJobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/recruiter/jobs/${job._id}/applications`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{job.title}</p>
                    <p className="text-xs text-slate-500">{job.applicationsCount} applications • {timeAgo(job.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${job.status === 'open' ? STATUS_COLORS.open : STATUS_COLORS.closed}`}>
                      {job.status}
                    </span>
                    <FiEye className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Post a Job', to: '/recruiter/jobs/create', icon: FiPlusCircle, color: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' },
            { label: 'View All Jobs', to: '/recruiter/jobs', icon: FiBriefcase, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
            { label: 'Company Profile', to: '/recruiter/company', icon: FiHome, color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
            { label: 'Browse Talent', to: '/jobs', icon: FiTrendingUp, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:opacity-80 transition-opacity text-center`}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
