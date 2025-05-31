import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  element: JSX.Element;
}

export function PrivateRoute({ element }: PrivateRouteProps) {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return element;
}
