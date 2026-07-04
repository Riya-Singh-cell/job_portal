import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { FiBriefcase, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { register as registerUser } from '../../redux/slices/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('candidate');

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  const onSubmit = (data) => {
    dispatch(registerUser({ ...data, role: selectedRole }));
  };

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3">
          <FiBriefcase className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create an account</h1>
        <p className="text-slate-500 text-sm mt-1">Start your journey today</p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { value: 'candidate', label: '👤 Job Seeker', desc: 'Find your dream job' },
          { value: 'recruiter', label: '🏢 Recruiter', desc: 'Hire top talent' },
        ].map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => setSelectedRole(role.value)}
            className={`p-3 rounded-xl border-2 text-left transition-all ${
              selectedRole === role.value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{role.label}</div>
            <div className="text-xs text-slate-500">{role.desc}</div>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Full Name</label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
              type="text"
              placeholder="John Doe"
              className="input pl-10"
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Email address</label>
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
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
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

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account...
            </span>
          ) : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
