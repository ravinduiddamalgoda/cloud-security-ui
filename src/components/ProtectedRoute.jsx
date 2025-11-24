import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const token = localStorage.getItem('token');

  // Require both authentication flag and valid token
  return (isAuthenticated && token) ? (
    Component
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
