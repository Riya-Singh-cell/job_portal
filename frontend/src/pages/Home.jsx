import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch, FiMapPin, FiBriefcase, FiUsers, FiTrendingUp,
  FiArrowRight, FiCheckCircle, FiStar,
} from 'react-icons/fi';
import { jobsAPI, companiesAPI } from '../services/api';
import JobCard from '../components/ui/JobCard';
import { JobCardSkeleton } from '../components/ui/Skeleton';

const stats = [
  { label: 'Active Jobs', value: '10,000+', icon: FiBriefcase, color: 'text-primary-600' },
  { label: 'Companies', value: '2,500+', icon: FiUsers, color: 'text-green-600' },
  { label: 'Hired Monthly', value: '1,200+', icon: FiTrendingUp, color: 'text-amber-600' },
];

const features = [
  { icon: FiSearch, title: 'Smart Job Search', desc: 'AI-powered search that understands your skills and matches you to the best opportunities.' },
  { icon: FiStar, title: 'Resume Scoring', desc: 'Get instant feedback on your resume quality and tips to improve your match rate.' },
  { icon: FiCheckCircle, title: 'Easy Apply', desc: 'One-click apply with your saved profile. Track all applications in one dashboard.' },
];

const Home = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await jobsAPI.getJobs({ limit: 6, sortBy: 'views', sortOrder: 'desc' });
        setFeaturedJobs(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="pt-16">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 md:py-32 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl -z-10" />

        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs px-3 py-1 mb-6 inline-block">
              🚀 Find Your Dream Job Today
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-6">
              Your Career Starts{' '}
              <span className="text-gradient">Right Here</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
              Connect with top companies, discover tailored opportunities, and land the job that matches your ambitions.
            </p>
          </motion.div>

          {/* Search form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onSubmit={handleSearch}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2 flex-1 px-3 py-2">
              <FiSearch className="text-slate-400 w-5 h-5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Job title or keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 outline-none text-slate-700 dark:text-slate-200 bg-transparent placeholder-slate-400 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 px-3 py-2 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-700">
              <FiMapPin className="text-slate-400 w-5 h-5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Location or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 outline-none text-slate-700 dark:text-slate-200 bg-transparent placeholder-slate-400 text-sm"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-2.5 rounded-xl whitespace-nowrap">
              Search Jobs
            </button>
          </motion.form>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mt-6 text-sm text-slate-500"
          >
            <span>Popular:</span>
            {['React Developer', 'Remote', 'Full Stack', 'Design', 'Python'].map((term) => (
              <button
                key={term}
                onClick={() => navigate(`/jobs?keyword=${term}`)}
                className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all"
              >
                {term}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="container-custom">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ── */}
      <section className="section">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Featured Jobs</h2>
              <p className="text-slate-500 text-sm mt-1">Top opportunities from leading companies</p>
            </div>
            <Link to="/jobs" className="btn-outline text-sm gap-1 py-2">
              View all <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <motion.div key={i} variants={itemVariants}>
                    <JobCardSkeleton />
                  </motion.div>
                ))
              : featuredJobs.map((job) => (
                  <motion.div key={job._id} variants={itemVariants}>
                    <JobCard job={job} />
                  </motion.div>
                ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section bg-slate-50 dark:bg-slate-900/50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Why Choose JobPortal?
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Everything you need to land your next role, all in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 text-center hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section">
        <div className="container-custom">
          <div className="bg-gradient-primary rounded-3xl p-10 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Next Role?</h2>
            <p className="text-primary-100 mb-8 text-lg max-w-lg mx-auto">
              Join thousands of professionals who've already found their dream jobs through JobPortal.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-all"
              >
                Get Started Free
              </Link>
              <Link
                to="/jobs"
                className="border border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
