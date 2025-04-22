// src/routes/proformas.routes.jsx
import { Navigate } from 'react-router-dom';

// We're defining routes as a simple configuration object without lazy imports
// to avoid circular dependencies during HMR
const proformasRoutes = [
  {
    path: "",
    element: <Navigate to="dashboard" replace />
  },
  {
    path: "dashboard",
    elementPath: '../pages/proformas/DashboardProformas',
    meta: {
      title: "Dashboard de Proformas",
      description: "Visualización y análisis de proformas"
    }
  },
  {
    path: "nueva",
    elementPath: '../pages/proformas/OptimizedProformaView',
    meta: {
      title: "Nueva Proforma",
      description: "Crear una nueva proforma"
    }
  },
  {
    path: "editar",
    elementPath: '../pages/proformas/OptimizedProformaView',
    meta: {
      title: "Editar Proforma",
      description: "Editar una proforma existente"
    }
  },
  {
    path: "optimizada",
    elementPath: '../pages/proformas/OptimizedProformaView',
    meta: {
      title: "Proforma Optimizada",
      description: "Vista optimizada de proformas con React Query"
    }
  },
  {
    path: "guardadas",
    elementPath: '../pages/proformas/ProformasGuardadas',
    meta: {
      title: "Proformas Guardadas",
      description: "Listado de proformas guardadas"
    }
  }
];

export default proformasRoutes;