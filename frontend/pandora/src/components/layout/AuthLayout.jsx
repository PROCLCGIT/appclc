// src/components/layouts/AuthLayout.jsx
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const AuthLayout = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { checkAuth, isAuthenticated, error, clearError } = useAuthStore();
  const authCheckCompleted = useRef(false);
  const authCheckTimeout = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determinamos si estamos en la página de login
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    console.log('AuthLayout: Verificando autenticación...');
    
    // CASO 1: Estamos en login page
    if (isLoginPage) {
      // Si estamos en login y ya autenticados, ir al dashboard
      if (isAuthenticated) {
        console.log('AuthLayout: Ya autenticado en página de login, redirigiendo a dashboard');
        navigate('/');
        return;
      }
      
      // Si estamos en login y hay errores, limpiarlos
      if (error) {
        clearError();
      }
      
      // En login page simplemente dejamos cargar el componente
      setIsLoading(false);
      return;
    }
    
    // CASO 2: No estamos en login page (estamos en una ruta protegida)
    
    // Si ya estamos autenticados según el estado global, todo bien
    if (isAuthenticated) {
      console.log('AuthLayout: Usuario ya autenticado, permitiendo acceso');
      setIsLoading(false);
      return;
    }
    
    // Si no estamos autenticados, verificar si tenemos tokens
    const token = localStorage.getItem('auth-token');
    const refreshToken = localStorage.getItem('refresh-token');
    
    // Si no hay tokens, directo a login
    if (!token || !refreshToken) {
      console.log('AuthLayout: No hay tokens disponibles, redirigiendo a login');
      navigate('/login');
      setIsLoading(false);
      return;
    }
    
    // Si hay tokens pero no estamos autenticados, intentar verificar con backend
    console.log('AuthLayout: Hay tokens, verificando con backend...');
    
    const verifyAuth = async () => {
      try {
        const isValid = await checkAuth();
        
        if (isValid) {
          console.log('AuthLayout: Token verificado correctamente');
          setIsLoading(false);
        } else {
          console.log('AuthLayout: Token inválido, redirigiendo a login');
          navigate('/login');
        }
      } catch (err) {
        console.error('AuthLayout: Error verificando token', err);
        navigate('/login');
      }
    };
    
    // Solo llamamos a verificar una vez
    if (!authCheckCompleted.current) {
      authCheckCompleted.current = true;
      verifyAuth();
    } else {
      setIsLoading(false);
    }
    
    return () => {
      if (authCheckTimeout.current) {
        clearTimeout(authCheckTimeout.current);
      }
    };
  }, [checkAuth, isAuthenticated, isLoginPage, navigate, error, clearError]);

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
