// src/components/layout/SideNav.jsx
// Componente mejorado que integra funcionalidades de SideNav y SidebarNav
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Badge } from "../../components/ui/badge";

export default function SideNav({ isSidebarOpen, navigation }) {
  const [openMenus, setOpenMenus] = useState({});
  const [openSections, setOpenSections] = useState({
    'MAIN': true,
    'PRUEBAS': true,
    'WEB APPS': true,
    'PRODUCTOS': true,
    'ANÁLISIS': true,
    'CONTACTOS': true,
    'CONFIG': true
  });
  const location = useLocation();

  // Toggle para menús individuales
  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  // Toggle para secciones completas
  const toggleSection = (sectionName) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Verificar si alguno de los hijos está activo
  const isChildActive = (children) => {
    if (!children) return false;
    
    return children.some(child => {
      if (child.children) {
        return isChildActive(child.children);
      }
      
      const childPath = child.path.startsWith('/') ? child.path : `/${child.path}`;
      return location.pathname === childPath || location.pathname.startsWith(`${childPath}/`);
    });
  };

  // Agrupar elementos por sección
  const groupedNavigation = navigation.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {});

  // Renderiza un solo item (o un menú con hijos)
  const renderNavItem = (item, level = 0) => {
    if (item.children) {
      // Si es un menú con hijos
      const isActive = isChildActive(item.children);
      const isOpen = openMenus[item.name] || isActive;
      
      return (
        <div key={`nav-${item.name}`} className="mb-1">
          <button
            onClick={() => toggleMenu(item.name)}
            className={`
              w-full flex items-center justify-between px-3 py-2 rounded-lg
              transition-colors duration-200
              ${isActive ? 'bg-purple-50/60 text-purple-700 border-l-2 border-purple-400' : 'text-gray-600 hover:bg-gray-50/70'}
              ${level > 0 ? `ml-${level * 2}` : ''}
            `}
          >
            {/* Nombre + icono + badge */}
            <div className="flex items-center space-x-2">
              {item.icon && <item.icon className="h-5 w-5 text-purple-500" />}
              {isSidebarOpen && (
                <>
                  <span className="text-sm">{item.name}</span>
                  {/* Si tiene badge, se muestra aquí */}
                  {item.badge && (
                    <Badge 
                      variant="outline" 
                      className="ml-1 bg-blue-100 text-blue-600 border-blue-200"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </div>
            
            {/* Flecha de abrir/cerrar */}
            {isSidebarOpen && (
              <svg
                className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
          
          {/* Submenús (hijos) */}
          {isOpen && isSidebarOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) =>
                renderNavItem(child, level + 1)
              )}
            </div>
          )}
        </div>
      );
    }

    // Si es un enlace simple
    return (
      <NavLink
        key={`nav-${item.name}`}
        to={item.path}
        className={({ isActive }) => `
          flex items-center space-x-2 px-3 py-2 rounded-lg
          transition-colors duration-200
          ${isActive ? 'bg-purple-50/60 text-purple-700 border-l-2 border-purple-400' : 'text-gray-600 hover:bg-gray-50/70'}
          ${level > 0 ? `ml-${level * 2}` : ''}
        `}
      >
        {item.icon && <item.icon className="h-5 w-5 text-purple-500" />}
        {isSidebarOpen && (
          <>
            <span className="text-sm">{item.name}</span>
            {item.badge && (
              <Badge 
                variant="outline" 
                className="ml-1 bg-blue-100 text-blue-600 border-blue-200"
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen overflow-y-auto
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        transition-all duration-300
        bg-white border-r border-[#e0e2e7] shadow-[1px_0_3px_rgba(0,0,0,0.02)]
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-[#e0e2e7]">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 flex items-center justify-center">
            <span className="text-purple-600 font-semibold text-2xl">P</span>
          </div>
          {isSidebarOpen && <span className="text-xl font-semibold">Pandora</span>}
        </Link>
      </div>

      {/* Navigation agrupada por secciones */}
      <div className="p-4">
        {Object.entries(groupedNavigation).map(([section, items]) => (
          <div key={section} className="mb-4">
            {/* Encabezado de sección con toggle */}
            {isSidebarOpen && (
              <div 
                className="flex items-center justify-between mb-2 pl-3 cursor-pointer"
                onClick={() => toggleSection(section)}
              >
                <h3 className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                  {section}
                </h3>
                <svg
                  className={`w-3 h-3 transition-transform text-gray-400 ${openSections[section] ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
            
            {/* Items de la sección */}
            {openSections[section] && (
              <div className="space-y-1">
                {items.map((item) => renderNavItem(item))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}