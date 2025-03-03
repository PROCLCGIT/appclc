// src/components/error/ErrorPage.jsx
import { useRouteError, Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  // Registrar el error para fines de diagnóstico
  useEffect(() => {
    const errorLog = {
      status: error?.status,
      statusText: error?.statusText,
      message: error?.message,
      stack: error?.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    console.error('Error de ruta capturado:', errorLog);
    
    // Aquí podrías implementar un servicio de registro como Sentry o tu propio endpoint
    // fetch('/api/log-route-error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorLog)
    // }).catch(e => console.error('Error al enviar log:', e));
  }, [error]);

  // Determinar el tipo de error y mensaje apropiado
  const getErrorInfo = () => {
    if (!error) {
      return { title: 'Error inesperado', message: 'Ha ocurrido un error desconocido.' };
    }
    
    switch (error.status) {
      case 404:
        return { 
          title: 'Página no encontrada', 
          message: 'Lo sentimos, la página que buscas no existe o ha sido movida.'
        };
      case 403:
        return { 
          title: 'Acceso denegado', 
          message: 'No tienes permisos para acceder a esta página.'
        };
      case 500:
        return { 
          title: 'Error del servidor', 
          message: 'Ha ocurrido un error en el servidor. Por favor, inténtalo más tarde.'
        };
      default:
        return { 
          title: 'Ocurrió un error', 
          message: 'Lo sentimos, ha ocurrido un error inesperado.'
        };
    }
  };

  const { title, message } = getErrorInfo();
  
  // Función para volver a la página anterior
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 border border-gray-100">
        <div className="mb-6 flex justify-center">
          <div className="bg-yellow-50 p-3 rounded-full">
            <AlertTriangle className="h-14 w-14 text-yellow-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          {title}
        </h1>
        
        <p className="text-gray-600 mb-6 text-center">
          {message}
        </p>

        {(error?.statusText || error?.message) && (
          <div className="bg-gray-50 border border-gray-100 rounded-md p-3 mb-6">
            <p className="text-sm text-gray-600 break-words">
              {error.statusText || error.message}
            </p>
            
            {error?.stack && (
              <details>
                <summary className="text-xs text-gray-500 cursor-pointer mt-2">
                  Detalles técnicos
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-[120px] p-2 bg-gray-100 rounded">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={goBack}
            variant="outline" 
            className="inline-flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver atrás
          </Button>

          <Link to="/">
            <Button className="inline-flex items-center justify-center w-full">
              <Home className="mr-2 h-4 w-4" />
              Ir al inicio
            </Button>
          </Link>
          
          <Button 
            onClick={() => window.location.reload()}
            variant="secondary" 
            className="inline-flex items-center justify-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Recargar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;