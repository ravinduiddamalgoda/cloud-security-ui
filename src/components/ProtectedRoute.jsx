import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated'); // Check if user is logged in

  return isAuthenticated ? (
    Component
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
