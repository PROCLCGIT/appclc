// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import store from './redux/store';
import App from './App';
import './config/axios';
import './index.css';

// Crear instancia de QueryClient con configuración optimizada
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita refetch automático al cambiar de pestaña
      retry: 1, // Reintenta una vez si falla
      staleTime: 1000 * 60 * 2, // Datos considerados actuales por 2 minutos
      cacheTime: 1000 * 60 * 10, // Mantiene datos en caché por 10 minutos
    },
    mutations: {
      // Configuración global para mutaciones
      retry: 0, // No reintentar mutaciones fallidas
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <App />
      </Provider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>
);