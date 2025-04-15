// src/components/layout/TabsBar.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, Home, Users, User, UserPlus, Contact, FileText, 
  ShoppingCart, Briefcase, Package, FileEdit, ClipboardList 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

// Mapa de íconos por ruta (si se quiere mostrar un ícono específico por cada ruta)
const routeIcons = {
  '/': <Home className="h-4 w-4 mr-2" />,
  '/clientes': <Users className="h-4 w-4 mr-2" />,
  '/vendedores': <User className="h-4 w-4 mr-2" />,
  '/contactos': <Contact className="h-4 w-4 mr-2" />,
  '/vendedores/nuevo': <UserPlus className="h-4 w-4 mr-2" />,
  '/contactos/nuevo': <UserPlus className="h-4 w-4 mr-2" />,
  '/madvance/add-cliente': <UserPlus className="h-4 w-4 mr-2" />,
  '/productosdisponibles': <Package className="h-4 w-4 mr-2" />,
  '/productosofertados': <ShoppingCart className="h-4 w-4 mr-2" />,
  '/enhancedproforma': <FileEdit className="h-4 w-4 mr-2" />,
  '/dashboardproformas': <ClipboardList className="h-4 w-4 mr-2" />,
};

// Mapa de nombres "amigables" para mostrar en las pestañas
const routeNames = {
  '/': 'Inicio',
  '/clientes': 'Clientes',
  '/vendedores': 'Vendedores',
  '/contactos': 'Contactos',
  '/vendedores/nuevo': 'Nuevo Vendedor',
  '/contactos/nuevo': 'Nuevo Contacto',
  '/madvance/add-cliente': 'Nuevo Cliente',
  '/productosdisponibles': 'Productos Disponibles',
  '/productosofertados': 'Productos Ofertados',
  '/dashboardproformas': 'Dashboard Proformas',
  '/proformas-guardadas': 'Mis Proformas',
  '/enhancedproforma': 'Crear Proforma',
};

export default function TabsBar({ tabs, setTabs, maximumTabs = 8 }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Efecto para agregar la pestaña actual si no existe
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Si la ubicación actual no está en las pestañas, agrégala
    if (!tabs.some(tab => tab.path === currentPath)) {
      // Limita el número máximo de pestañas
      const newTabs = [...tabs];
      if (newTabs.length >= maximumTabs) {
        newTabs.shift(); // Elimina la primera pestaña si alcanzamos el máximo
      }
      
      // Asegúrate que el icono sea una cadena de texto identificadora, no un componente JSX
      newTabs.push({
        path: currentPath,
        title: routeNames[currentPath] || 'Nueva Pestaña',
        iconKey: currentPath, // Solo guardamos la clave para el icono
      });
      
      setTabs(newTabs);
    }
  }, [location.pathname, tabs, setTabs, maximumTabs]);
  
  // Cambiar a una pestaña
  const switchToTab = (path) => {
    navigate(path);
  };
  
  // Cerrar una pestaña
  const closeTab = (e, index) => {
    e.stopPropagation(); // Evitar que se active el click de la pestaña
    
    const newTabs = [...tabs];
    const closedTab = newTabs[index];
    newTabs.splice(index, 1);
    
    setTabs(newTabs);
    
    // Si cerramos la pestaña activa, navegar a la pestaña anterior o a la siguiente disponible
    if (closedTab.path === location.pathname) {
      if (newTabs.length > 0) {
        const nextTabIndex = Math.min(index, newTabs.length - 1);
        navigate(newTabs[nextTabIndex].path);
      } else {
        navigate('/'); // Si no hay más pestañas, ir al inicio
      }
    }
  };
  
  // Si no hay pestañas, no mostrar nada
  if (tabs.length === 0) return null;
  
  return (
    <div className="bg-[#f5f7fa] border-b border-[#e0e2e7] px-2 shadow-sm">
      <div className="flex items-center overflow-x-auto no-scrollbar py-1 relative">
        {/* Botón de inicio */}
        <button 
          className={cn(
            "flex items-center justify-center h-8 w-8 rounded-full text-gray-600 transition-colors mr-1.5 flex-shrink-0",
            location.pathname === "/" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200"
          )}
          onClick={() => navigate('/')}
          title="Ir al inicio"
        >
          <Home className="h-4 w-4" />
        </button>
        
        {tabs.map((tab, index) => {
          const isActive = location.pathname === tab.path;
          return (
            <div
              key={`${tab.path}-${index}`}
              className={cn(
                "group flex items-center justify-between min-w-[160px] max-w-[250px] h-10 px-4 py-2 cursor-pointer transition-all border-t border-l border-r relative",
                isActive
                  ? "bg-white text-blue-700 border-blue-200 -mb-px z-10 shadow-[0_-2px_6px_rgba(0,0,0,0.03)]"
                  : "hover:bg-gray-100 text-gray-600 border-transparent hover:border-gray-200"
              )}
              style={{
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                marginLeft: index > 0 ? "-2px" : "0", // Solapar ligeramente las pestañas
              }}
              onClick={() => switchToTab(tab.path)}
            >
              <div className="flex items-center space-x-2 overflow-hidden flex-grow">
                <div className={cn(
                  "flex-shrink-0",
                  isActive ? "text-blue-600" : "text-gray-500"
                )}>
                  {routeIcons[tab.path] || <FileText className="h-4 w-4" />}
                </div>
                <span className={cn(
                  "truncate text-sm font-medium",
                  isActive ? "text-blue-700" : "text-gray-600"
                )}>
                  {tab.title}
                </span>
              </div>
              
              <button
                onClick={(e) => closeTab(e, index)}
                className={cn(
                  "ml-1 h-6 w-6 flex-shrink-0 rounded-full transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-blue-400",
                  isActive
                    ? "text-blue-600 hover:bg-blue-100 hover:text-blue-800"
                    : "text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                )}
                aria-label={`Cerrar pestaña ${tab.title}`}
                title={`Cerrar ${tab.title}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
              
              {/* Indicador de pestaña activa */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </div>
          );
        })}
        
        {/* Botón de nueva pestaña (opcional)
        <button 
          className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-200 text-gray-500 transition-colors ml-1 mt-1"
          onClick={() => navigate('/')}
          title="Ir al inicio"
        >
          <Plus className="h-4 w-4" />
        </button> */}
      </div>
    </div>
  );
}