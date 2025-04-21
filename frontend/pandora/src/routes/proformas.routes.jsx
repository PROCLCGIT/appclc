// src/routes/proformas.routes.jsx

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// Importación diferida (lazy) para mejor rendimiento
const DashboardProformasWithQuery = lazy(() => import('../pages/proformas/DashboardProformasWithQuery'));
// Versión original con múltiples hooks
const EnhancedProformaWithQuery = lazy(() => import('../pages/proformas/EnhancedProformaWithQuery'));
// Nueva versión optimizada con React Query centralizado
const OptimizedProformaView = lazy(() => import('../pages/proformas/OptimizedProformaView'));
const ProformasGuardadas = lazy(() => import('../pages/proformas/ProformasGuardadas'));

// Variable para alternar entre versiones (para testing y migración gradual)
const USE_OPTIMIZED_VERSION = true; // Cambiar a false para usar la versión anterior

// Rutas para el módulo de proformas
const proformasRoutes = [
  {
    path: "",
    element: <Navigate to="dashboard" replace />
  },
  {
    path: "dashboard",
    element: <DashboardProformasWithQuery />,
    meta: {
      title: "Dashboard de Proformas",
      description: "Visualización y análisis de proformas"
    }
  },
  {
    path: "nueva",
    element: USE_OPTIMIZED_VERSION ? <OptimizedProformaView /> : <EnhancedProformaWithQuery />,
    meta: {
      title: "Nueva Proforma",
      description: "Crear una nueva proforma"
    }
  },
  {
    path: "editar",
    element: USE_OPTIMIZED_VERSION ? <OptimizedProformaView /> : <EnhancedProformaWithQuery />,
    meta: {
      title: "Editar Proforma",
      description: "Editar una proforma existente"
    }
  },
  {
    path: "optimizada",
    element: <OptimizedProformaView />,
    meta: {
      title: "Proforma Optimizada",
      description: "Vista optimizada de proformas con React Query"
    }
  },
  {
    path: "guardadas",
    element: <ProformasGuardadas />,
    meta: {
      title: "Proformas Guardadas",
      description: "Listado de proformas guardadas"
    }
  }
];

export default proformasRoutes;
