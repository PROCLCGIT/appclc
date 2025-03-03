// src/components/error/ErrorBoundary.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      isFallbackVisible: false
    };
  }

  // PropTypes para validación
  static propTypes = {
    children: PropTypes.node.isRequired
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error, isFallbackVisible: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Implementar logging más estructurado
    this.logError(error, errorInfo);
  }

  logError(error, errorInfo) {
    // Información básica de registro
    const errorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.error('Error capturado:', errorLog);
    
    // Aquí podrías implementar un servicio de registro como Sentry o tu propio endpoint
    // Por ejemplo:
    // fetch('/api/log-error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorLog)
    // }).catch(e => console.error('Error al enviar log:', e));
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isFallbackVisible: false
    });
  }

  reload = () => {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-lg w-full shadow-sm">
            <div className="flex items-center space-x-2 text-red-800 mb-3">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Algo salió mal</h2>
            </div>
            
            <p className="text-red-600 text-sm mb-3">
              {this.state.error?.message || 'Ha ocurrido un error inesperado.'}
            </p>
            
            {this.state.errorInfo?.componentStack && (
              <details className="mb-3">
                <summary className="text-xs text-gray-500 cursor-pointer">Detalles técnicos</summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-[150px] p-2 bg-gray-50 rounded">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex space-x-3 mt-4">
              <button
                onClick={this.reload}
                className="inline-flex items-center text-sm px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Recargar página
              </button>
              
              <Link to="/" onClick={this.resetError} className="inline-flex items-center text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                <Home className="h-3.5 w-3.5 mr-1.5" />
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;