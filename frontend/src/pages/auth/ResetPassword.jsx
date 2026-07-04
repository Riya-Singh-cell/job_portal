import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Set new password</h1>
      <p className="text-slate-500 text-sm mb-6">Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">New Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="input pl-10"
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-4">
        <Link to="/login" className="text-primary-600 hover:underline">Back to login</Link>
      </p>
    </div>
  );
};

export default ResetPassword;
