import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <h1 className="text-8xl font-black text-gradient mb-4">404</h1>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
        Page not found
      </h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary px-8 py-3">
        Back to Home
      </Link>
    </motion.div>
  </div>
);

export default NotFound;
