import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verify = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="card p-8 text-center">
      {status === 'loading' && (
        <>
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Verifying your email...</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Email Verified!</h1>
          <p className="text-slate-500 text-sm mb-6">Your email has been verified. You can now log in.</p>
          <Link to="/login" className="btn-primary">Go to Login</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Verification Failed</h1>
          <p className="text-slate-500 text-sm mb-6">The verification link is invalid or expired.</p>
          <Link to="/login" className="btn-primary">Back to Login</Link>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;
