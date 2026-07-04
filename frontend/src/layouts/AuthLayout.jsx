import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    const redirectPath = {
      admin: '/admin/dashboard',
      recruiter: '/recruiter/dashboard',
      candidate: '/candidate/dashboard',
    }[user.role] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Outlet />
      </motion.div>
    </div>
  );
};

export default AuthLayout;
