import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <Link to="/login" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back to login
      </Link>

      {sent ? (
        <div className="text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Check your inbox</h2>
          <p className="text-slate-500 text-sm">
            We sent a password reset link to <strong>{email}</strong>
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Forgot password?</h1>
          <p className="text-slate-500 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input pl-10"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
