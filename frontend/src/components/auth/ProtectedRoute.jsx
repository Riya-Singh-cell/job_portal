import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && roles && !roles.includes(user.role)) {
    const redirectPath = {
      admin: '/admin/dashboard',
      recruiter: '/recruiter/dashboard',
      candidate: '/candidate/dashboard',
    }[user.role] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
