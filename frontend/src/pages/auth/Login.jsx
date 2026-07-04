import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { FiBriefcase, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { login } from '../../redux/slices/authSlice';
import { useState } from 'react';

const Login = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    dispatch(login(data));
  };

  return (
    <div className="card p-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3">
          <FiBriefcase className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h1>
        <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
            Email address
          </label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
              })}
              type="email"
              placeholder="you@example.com"
              className="input pl-10"
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              {...register('password', { required: 'Password is required' })}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="input pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center py-3"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </span>
          ) : 'Sign In'}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-500">
        <p className="font-medium mb-1 text-slate-700 dark:text-slate-300">Demo credentials:</p>
        <p>Candidate: alex@candidate.com / candidate123</p>
        <p>Recruiter: sarah@techcorp.com / recruiter123</p>
        <p>Admin: admin@jobportal.com / admin123</p>
      </div>

      <p className="text-center text-sm text-slate-500 mt-5">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 font-medium hover:underline">
          Sign up for free
        </Link>
      </p>
    </div>
  );
};

export default Login;
