// src/pages/proformas/components/dashboard/CustomTooltip.jsx
import React, { useMemo } from 'react';
import { formatCurrency, formatNumber } from '../../utils/formatUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { THEME_COLORS } from '../../utils/constants';
import { useTranslation } from 'react-i18next';

/**
 * Tooltip personalizado para los gráficos
 * Soporta tema claro y oscuro e internacionalización
 * Optimizado con React.memo y useMemo para evitar rerenderizaciones innecesarias
 */
const CustomTooltip = ({ active, payload, label }) => {
  const { t } = useTranslation();
  
  // Obtener el tema actual
  const { isDark } = useTheme();
  
  // Seleccionar colores del tema según el modo - memoizado
  const themeColors = useMemo(() => 
    isDark ? THEME_COLORS.dark : THEME_COLORS.light, 
    [isDark]
  );
  
  // Memoizar el contenido del tooltip para evitar recreación en cada renderizado
  const tooltipContent = useMemo(() => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div 
        className={`${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'} p-3 border rounded shadow-md`}
        style={{ 
          borderColor: themeColors.tooltipBorder,
          backgroundColor: themeColors.tooltipBackground
        }}
      >
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => {
          // Traducir nombres de propiedades
          const translatedName = entry.name === 'Monto' 
            ? t('dashboard.charts.yAxisAmount').replace('($)', '') 
            : entry.name;
            
          // Formatear valor según tipo
          const formattedValue = entry.name === 'Monto' 
            ? formatCurrency(entry.value) 
            : formatNumber(entry.value);
            
          return (
            <p key={`item-${index}`} style={{ color: entry.color || (isDark ? '#f3f4f6' : '#333') }}>
              {translatedName}: {formattedValue}
            </p>
          );
        })}
      </div>
    );
  }, [active, payload, label, isDark, themeColors, t]);
  
  return tooltipContent;
};

// Envolver el componente con React.memo para evitar renderizaciones innecesarias
export default React.memo(CustomTooltip);