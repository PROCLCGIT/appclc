// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext(undefined);

// Valores predeterminados del tema
const defaultTheme = {
  mode: 'light', // 'light' o 'dark'
  colors: {
    // Colores comunes
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#0ea5e9',
    
    // Colores específicos por modo
    light: {
      background: '#ffffff',
      foreground: '#1f2937',
      card: '#ffffff',
      border: '#e5e7eb',
      muted: '#f3f4f6',
      accent: '#f9fafb',
    },
    dark: {
      background: '#1f2937',
      foreground: '#f3f4f6',
      card: '#111827',
      border: '#374151',
      muted: '#374151',
      accent: '#0f172a',
    }
  }
};

/**
 * Provider para el tema global de la aplicación
 * Soporta modo claro y oscuro
 * Se integra con preferencias del sistema
 */
export function ThemeProvider({ children }) {
  // Estado para el modo actual del tema
  const [theme, setTheme] = useState(() => {
    // Intentar recuperar el tema de localStorage si existe
    const savedTheme = localStorage.getItem('pandora-theme');
    if (savedTheme) {
      try {
        return JSON.parse(savedTheme);
      } catch (error) {
        console.error('Error parsing saved theme', error);
      }
    }
    
    // Si no hay tema guardado, usar la preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return { ...defaultTheme, mode: 'dark' };
    }
    
    // Valor predeterminado
    return defaultTheme;
  });
  
  // Efecto para aplicar cambios al DOM cuando el tema cambia
  useEffect(() => {
    // Aplicar la clase al elemento HTML basado en el modo
    if (theme.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Guardar el tema en localStorage
    localStorage.setItem('pandora-theme', JSON.stringify(theme));
  }, [theme]);
  
  // Controlador para cambiar el tema
  const toggleTheme = () => {
    setTheme(prevTheme => ({
      ...prevTheme,
      mode: prevTheme.mode === 'light' ? 'dark' : 'light'
    }));
  };
  
  // Controlador para establecer un tema específico
  const setThemeMode = (mode) => {
    if (mode !== 'light' && mode !== 'dark') return;
    
    setTheme(prevTheme => ({
      ...prevTheme,
      mode
    }));
  };
  
  // Valores a exponer en el contexto
  const contextValue = {
    theme,
    toggleTheme,
    setThemeMode,
    isDark: theme.mode === 'dark',
    isLight: theme.mode === 'light',
    colors: {
      ...theme.colors,
      current: theme.colors[theme.mode]
    }
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para usar el tema en componentes
 * @returns {Object} El objeto de tema
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  
  return context;
}

// Exportar valores predeterminados para uso en otros lugares
export { defaultTheme };