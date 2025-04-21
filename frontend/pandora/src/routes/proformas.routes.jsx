// src/routes/proformas.routes.jsx

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// Importación diferida (lazy) para mejor rendimiento
const DashboardProformasWithQuery = lazy(() => import('../pages/proformas/DashboardProformasWithQuery'));
// Using only one version - the Query-enabled version
const EnhancedProformaWithQuery = lazy(() => import('../pages/proformas/EnhancedProformaWithQuery'));
const ProformasGuardadas = lazy(() => import('../pages/proformas/ProformasGuardadas'));

// Using React Query version by default

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
    element: <EnhancedProformaWithQuery />,
    meta: {
      title: "Nueva Proforma",
      description: "Crear una nueva proforma"
    }
  },
  {
    path: "editar",
    element: <EnhancedProformaWithQuery />,
    meta: {
      title: "Editar Proforma",
      description: "Editar una proforma existente"
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
