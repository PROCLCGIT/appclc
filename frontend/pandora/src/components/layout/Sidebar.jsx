// src/components/layout/SideNav.jsx

import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

export default function SideNav({ isSidebarOpen, navigation }) {
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const isChildActive = (children) => {
    // Verifica si alguna ruta hija coincide con la ruta actual
    return children?.some((child) => child.path === location.pathname);
  };

  // Renderiza un ítem (o un submenú con hijos)
  const renderNavItem = (item, level = 0, keyPrefix = '') => {
    if (item.children) {
      // Menú con hijos
      const isActive = isChildActive(item.children);
      const isOpen = openMenus[item.name];

      return (
        <div key={keyPrefix}>
          <button
            onClick={() => toggleMenu(item.name)}
            className={`
              w-full flex items-center justify-between px-3 py-2 rounded-lg
              transition-colors duration-200
              ${
                isActive
                  ? 'bg-[#EEF1FF] text-[#6942FD]'
                  : 'text-[#6B6C7E] hover:bg-[#f3f4fe]'
              }
              ml-${level * 4}
            `}
          >
            {/* Icono + nombre + badge */}
            <div className="flex items-center space-x-2">
              {/* Icono con color que herede del texto */}
              {item.icon && <item.icon className="h-5 w-5 text-inherit" />}
              {isSidebarOpen && (
                <>
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-[#EFECFF] text-[#6942FD]">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </div>
            {/* Flecha de expandir/cerrar */}
            {isSidebarOpen && (
              <svg
                className={`w-4 h-4 transition-transform ${
                  isOpen ? 'rotate-90' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
          {/* Submenús (hijos) */}
          {isOpen && isSidebarOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child, idx) =>
                renderNavItem(child, level + 1, `${child.name}-${idx}`)
              )}
            </div>
          )}
        </div>
      );
    }

    // Ítem simple (link)
    return (
      <NavLink
        key={keyPrefix}
        to={item.path}
        className={({ isActive }) => `
          flex items-center space-x-2 px-3 py-2 rounded-lg
          transition-colors duration-200
          ${
            isActive
              ? 'bg-[#EEF1FF] text-[#6942FD]'
              : 'text-[#6B6C7E] hover:bg-[#f3f4fe]'
          }
          ml-${level * 4}
        `}
      >
        {item.icon && <item.icon className="h-5 w-5 text-inherit" />}
        {isSidebarOpen && (
          <>
            <span>{item.name}</span>
            {item.badge && (
              <span className="ml-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-[#EFECFF] text-[#6942FD]">
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  // Renderiza todo el menú, con secciones
  let currentSection = null;
  const renderNavigation = () =>
    navigation.map((item, index) => {
      let heading = null;
      if (item.section && item.section !== currentSection) {
        currentSection = item.section;
        heading = (
          <div
            key={`heading-${item.section}-${index}`}
            className="text-xs uppercase text-[#9CA2CC] font-semibold tracking-wider mt-4 mb-2 pl-3"
          >
            {item.section}
          </div>
        );
      }

      return (
        <div key={`${item.name}-${index}`}>
          {heading}
          {renderNavItem(item, 0, `${item.name}-${index}`)}
        </div>
      );
    });

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen overflow-y-auto
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        transition-all duration-300
        bg-white border-r border-[#e6e8f0]
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-[#e6e8f0]">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-[#6942FD] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          {isSidebarOpen && (
            <span className="text-xl font-semibold text-[#2B2B2B]">
              Pandora
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">{renderNavigation()}</nav>
    </aside>
  );
}
