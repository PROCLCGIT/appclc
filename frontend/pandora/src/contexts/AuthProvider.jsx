// src/contexts/AuthProvider.jsx
import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import useAuth from '@/hooks/auth/useAuth';

// Crear contexto de autenticación
const AuthContext = createContext(null);

/**
 * Proveedor de autenticación que encapsula la lógica de autenticación
 * y la expone a través de un contexto React
 */
export function AuthProvider({ children }) {
  // Utilizar el hook de autenticación
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook para acceder al contexto de autenticación desde cualquier componente
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  return context;
}

export default AuthProvider;
