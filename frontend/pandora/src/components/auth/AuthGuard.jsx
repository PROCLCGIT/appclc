// src/components/auth/AuthGuard.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthProvider';
import PropTypes from 'prop-types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Componente de guardia de autenticación para proteger rutas
 * y redireccionar al usuario según su estado de autenticación
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido a renderizar si está autenticado
 * @param {boolean} [props.requireAuth=true] - Si true, redirige a login si no está autenticado
 * @returns {React.ReactNode} El contenido o redirección según corresponda
 */
function AuthGuard({ children, requireAuth = true }) {
  const { isAuthenticated, isAuthLoading } = useAuthContext();
  const location = useLocation();

  // Mostrar loader mientras verifica autenticación
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Casos de redirección:
  
  // 1. Si requiere autenticación pero no está autenticado:
  // Redireccionar a login guardando la ruta actual para volver después
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }
  
  // 2. Si ya está autenticado y accede a una ruta de auth (ej: /login):
  // Redireccionar al dashboard
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // En caso normal, mostrar el contenido
  return children;
}

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
  requireAuth: PropTypes.bool,
};

export default AuthGuard;
