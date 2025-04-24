// src/pages/proformas/components/dashboard/StatusChart.jsx
import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { THEME_COLORS } from '../../utils/constants';
import CustomTooltip from './CustomTooltip';
import { useTranslation } from 'react-i18next';

/**
 * Componente para mostrar el gráfico de estados de proformas
 * Incluye indicador de carga, soporte para accesibilidad y tema
 * Responde al modo oscuro/claro
 * Optimizado con useMemo y useCallback para evitar recálculos innecesarios
 */
const StatusChart = ({ data, isError, isLoading, className = "" }) => {
  const { t } = useTranslation();
  // Obtener el tema actual
  const { isDark } = useTheme();
  
  // Memoizar los colores del tema según el modo
  const themeColors = useMemo(() => isDark ? THEME_COLORS.dark : THEME_COLORS.light, [isDark]);
  
  // Memoizar el label formatter para evitar recrearlo en cada renderizado
  const labelFormatter = useCallback((value) => (
    <span style={{ color: isDark ? '#f3f4f6' : '#333333' }}>{value}</span>
  ), [isDark]);
  
  // Memoizar el estilo del PieChart para evitar recrearlo en cada renderizado
  const pieChartStyle = useMemo(() => ({ fontFamily: 'inherit' }), []);
  
  // Memoizar el estilo del Tooltip para evitar recrearlo en cada renderizado
  const tooltipStyle = useMemo(() => ({ 
    backgroundColor: themeColors.tooltipBackground,
    borderColor: themeColors.tooltipBorder,
    color: themeColors.textColor 
  }), [themeColors]);
  
  // Memoizar el formato de las etiquetas para evitar cálculos repetidos
  const labelFunction = useCallback(({ estado, percent }) => 
    `${estado} ${(percent * 100).toFixed(0)}%`
  , []);
  
  // Memoizar las células del gráfico para evitar recálculos
  const cellElements = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Calcular el total una sola vez
    const total = data.reduce((sum, e) => sum + e.cantidad, 0);
    
    return data.map((entry, index) => (
      <Cell 
        key={`cell-${index}`} 
        fill={entry.color} 
        aria-label={`${entry.estado}: ${entry.cantidad} proformas (${(entry.cantidad / total * 100).toFixed(0)}%)`}
      />
    ));
  }, [data]);
  
  // Memoizar el contenido del gráfico para evitar recálculos
  const chartContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="h-full flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" aria-hidden="true" />
          <p role="status" aria-live="polite">{t('dashboard.charts.loading')}</p>
        </div>
      );
    } 
    
    if (isError) {
      return (
        <div className="h-full flex items-center justify-center">
          <p className="text-red-500" role="alert">{t('dashboard.errors.loadFailed')}</p>
        </div>
      );
    } 
    
    if (!data || data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <p>{t('dashboard.charts.noData')}</p>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart 
          aria-label={t('dashboard.charts.statusTitle')}
          style={pieChartStyle}
        >
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="cantidad"
            nameKey="estado"
            label={labelFunction}
          >
            {cellElements}
          </Pie>
          <Tooltip 
            content={<CustomTooltip />} 
            contentStyle={tooltipStyle}
          />
          <Legend formatter={labelFormatter} />
        </PieChart>
      </ResponsiveContainer>
    );
  }, [isLoading, isError, data, t, pieChartStyle, labelFunction, cellElements, tooltipStyle, labelFormatter]);
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('dashboard.charts.statusTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {chartContent}
      </CardContent>
    </Card>
  );
};

// Usar React.memo para evitar re-renders innecesarios
export default React.memo(StatusChart);