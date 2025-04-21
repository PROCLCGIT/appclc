// src/components/auth/Login.jsx
import { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthProvider';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authError, isAuthLoading, clearAuthError } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // Recuperar la ruta de redirección si existe
  const from = location.state?.from || '/';

  useEffect(() => {
    // Limpiar errores anteriores al montar/desmontar
    clearAuthError();
    
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar errores previos
    clearAuthError();
    
    // Validaciones básicas de formulario
    if (!formData.username.trim()) {
      // No usamos el estado global para errores de validación local
      return;
    }
    
    if (!formData.password) {
      return;
    }
    
    // Añadir log para depuración
    console.log('Intentando login con:', { username: formData.username.trim() });
    
    // Intentar login - el hook useAuth se encarga de la redirección
    login({
      username: formData.username.trim(),
      password: formData.password
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div 
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
        style={{
          opacity: 1,
          transform: 'translateY(0px)',
          transition: 'opacity 300ms, transform 300ms'
        }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Bienvenido a AppCLC
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {authError && (
            <div 
              className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-4"
              style={{
                opacity: 1,
                height: 'auto',
                transition: 'opacity 200ms, height 200ms'
              }}
            >
              {authError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nombre de usuario
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="pl-10 block w-full rounded-lg border border-gray-300 
                           focus:ring-2 focus:ring-blue-600 focus:border-transparent py-2"
                  placeholder="Tu nombre de usuario"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="pl-10 pr-10 block w-full rounded-lg border border-gray-300 
                           focus:ring-2 focus:ring-blue-600 focus:border-transparent py-2"
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthLoading}
            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg
                     shadow-sm text-sm font-medium text-white 
                     ${isAuthLoading 
                       ? 'bg-blue-400 cursor-not-allowed' 
                       : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
                     transition duration-200`}
            style={{
              transform: isAuthLoading ? 'scale(1)' : 'scale(1)',
              transition: 'transform 200ms'
            }}
          >
            {isAuthLoading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;