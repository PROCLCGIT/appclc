// src/components/auth/Login.jsx
import { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { login, error, isAuthenticated, loading, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    console.log('Login component mounted');
    
    // Limpiar errores anteriores
    clearError();
    
    // NO borramos tokens aquí - eso puede causar ciclos infinitos
    // Al no borrar automáticamente los tokens, permitimos que AuthLayout
    // decida si son válidos o no
    
    return () => {
      console.log('Login component unmounting');
      clearError();
    };
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar errores previos
    clearError();
    
    // Validar campos
    if (!formData.username.trim()) {
      console.log('Error: Nombre de usuario vacío');
      useAuthStore.setState({ error: 'Por favor ingrese su nombre de usuario' });
      return;
    }
    
    if (!formData.password) {
      console.log('Error: Contraseña vacía');
      useAuthStore.setState({ error: 'Por favor ingrese su contraseña' });
      return;
    }
    
    console.log('Intentando iniciar sesión...');
    
    try {
      // Intentar login
      console.log('Login.jsx: Iniciando proceso de login...');
      const success = await login({
        username: formData.username.trim(),
        password: formData.password
      });

      console.log('Login.jsx: Resultado del login:', { success });

      if (success) {
        console.log('Login.jsx: Login exitoso, redirigiendo...');
        // Esperamos un momento para que los tokens se guarden correctamente
        setTimeout(() => {
          navigate('/');
        }, 300);
      } else {
        console.log('Login.jsx: Login fallido');
        // El error ya debe estar en el estado global (authStore)
      }
    } catch (error) {
      console.error('Error inesperado durante el login:', error);
      useAuthStore.setState({ 
        error: 'Ocurrió un error inesperado. Por favor intente nuevamente.'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ... header content ... */}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
              {error}
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
            disabled={loading}
            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg
                     shadow-sm text-sm font-medium text-white 
                     ${loading 
                       ? 'bg-blue-400 cursor-not-allowed' 
                       : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
                     transition duration-200`}
          >
            {loading ? (
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