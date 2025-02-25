// src/components/error/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // Aquí podrías enviar el error a un servicio de registro de errores
    console.error('Error capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-lg w-full">
            <div className="flex items-center space-x-2 text-red-800 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Algo salió mal</h2>
            </div>
            <p className="text-red-600 text-sm mb-2">
              {this.state.error?.message || 'Ha ocurrido un error inesperado.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-red-700 hover:text-red-800 underline"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;