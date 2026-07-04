import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiUser, FiFileText, FiBookmark, FiStar, FiBriefcase,
  FiPlus, FiHome, FiUsers, FiFlag, FiLogOut, FiBriefcase as FiLogo, FiX,
} from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice';

const candidateLinks = [
  { to: '/candidate/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/candidate/profile', label: 'My Profile', icon: FiUser },
  { to: '/candidate/applications', label: 'Applications', icon: FiFileText },
  { to: '/candidate/saved-jobs', label: 'Saved Jobs', icon: FiBookmark },
  { to: '/candidate/recommendations', label: 'AI Matches', icon: FiStar },
];

const recruiterLinks = [
  { to: '/recruiter/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/recruiter/jobs', label: 'My Jobs', icon: FiBriefcase },
  { to: '/recruiter/jobs/create', label: 'Post a Job', icon: FiPlus },
  { to: '/recruiter/company', label: 'Company Profile', icon: FiHome },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/admin/users', label: 'Manage Users', icon: FiUsers },
  { to: '/admin/jobs', label: 'Manage Jobs', icon: FiBriefcase },
  { to: '/admin/reports', label: 'Reports', icon: FiFlag },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const links = {
    candidate: candidateLinks,
    recruiter: recruiterLinks,
    admin: adminLinks,
  }[user?.role] || [];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <FiLogo className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-lg text-gradient">JobPortal</span>
        </div>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <FiX className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* User info */}
      {user && (
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-600">{user.name[0]}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`
            }
          >
            <link.icon className="w-4 h-4 flex-shrink-0" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <FiLogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 z-40">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 z-50 shadow-xl"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
