// src/App.jsx
import { RouterProvider } from 'react-router-dom';
import routes from './routes/routes';
import { ToastProvider } from './components/ui/use-toast';
import { Toaster } from './components/ui/toaster';
import { ErrorBoundary } from 'react-error-boundary';

// Create a fallback component for errors
const ErrorFallback = ({ error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <div className="max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-700 mb-4">{error.message}</p>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => window.location.href = '/login'}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ToastProvider>
        <RouterProvider router={routes} />
        <Toaster />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;