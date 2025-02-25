// src/components/layouts/AuthLayout.jsx
import { useState, useEffect } from 'react';
import useAuthStore from '@/store/authStore';

const AuthLayout = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };

    verifyAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Si isAuthenticated es false => redirige a /login (o muestra children con el form de login)
  if (!isAuthenticated) {
    return children;
  }

  // Si está autenticado => Render normal de la app
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

export default AuthLayout;
