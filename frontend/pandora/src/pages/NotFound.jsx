// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        
        <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-2">
          Página no encontrada
        </h2>
        
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        <Link to="/">
          <Button className="inline-flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;