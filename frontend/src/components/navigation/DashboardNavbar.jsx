import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiMenu, FiSun, FiMoon, FiBell } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { useEffect } from 'react';
import { fetchNotifications } from '../../redux/slices/notificationsSlice';

const DashboardNavbar = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const getTitle = () => {
    if (!user) return 'Dashboard';
    return {
      candidate: 'Candidate Portal',
      recruiter: 'Recruiter Portal',
      admin: 'Admin Panel',
    }[user.role] || 'Dashboard';
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          aria-label="Open menu"
        >
          <FiMenu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">
          {getTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Link
          to={user ? `/${user.role}/dashboard` : '/'}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          aria-label="Notifications"
        >
          <FiBell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          aria-label="Toggle theme"
        >
          {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>

        {/* Avatar */}
        {user && (
          <div className="flex items-center gap-2 ml-1">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-600">{user.name[0]}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardNavbar;
