// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('userToken');
  
  // If there's no token, redirect to the login page
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // If there's a token, render the children (protected content)
  return children;
};

export default ProtectedRoute;
