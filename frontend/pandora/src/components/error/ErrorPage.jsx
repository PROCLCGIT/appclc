// src/components/error/ErrorPage.jsx
import { useRouteError, Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 text-center">
        <div className="mb-8">
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {error.status === 404 ? 'Página no encontrada' : 'Ocurrió un error'}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {error.status === 404
            ? 'Lo sentimos, la página que buscas no existe.'
            : 'Lo sentimos, ha ocurrido un error inesperado.'}
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {error.statusText || error.message}
          </p>

          <Link to="/">
            <Button className="inline-flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;