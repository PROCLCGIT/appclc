// src/pages/proformas/components/dashboard/AmountChart.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { THEME_COLORS } from '../../utils/constants';
import CustomTooltip from './CustomTooltip';

/**
 * Componente para mostrar el gráfico de montos por estado
 * Incluye indicador de carga, soporte para accesibilidad y tema
 */
const AmountChart = ({ data, isError, isLoading, className = "" }) => {
  // Obtener el tema actual
  const { isDark } = useTheme();
  
  // Seleccionar colores del tema según el modo
  const themeColors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Montos por Estado</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" aria-hidden="true" />
            <p role="status" aria-live="polite">Cargando datos del gráfico...</p>
          </div>
        ) : isError ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-red-500" role="alert">Error al cargar los datos</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p>No hay datos disponibles</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data}
              aria-label="Gráfico de barras de montos por estado de proformas"
              style={{ fontFamily: 'inherit' }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={themeColors.gridColor}
              />
              <XAxis 
                dataKey="estado" 
                aria-label="Estados de proformas"
                stroke={isDark ? '#f3f4f6' : '#333333'}
                tick={{ fill: isDark ? '#f3f4f6' : '#333333' }}
              />
              <YAxis 
                tickFormatter={(value) => `${value.toLocaleString()}`} 
                aria-label="Monto en dólares"
                stroke={isDark ? '#f3f4f6' : '#333333'}
                tick={{ fill: isDark ? '#f3f4f6' : '#333333' }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                contentStyle={{ 
                  backgroundColor: themeColors.tooltipBackground,
                  borderColor: themeColors.tooltipBorder,
                  color: themeColors.textColor
                }}
              />
              <Bar 
                dataKey="monto" 
                name="Monto" 
                radius={[4, 4, 0, 0]}
                aria-label="Montos por estado"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    aria-label={`${entry.estado}: $${entry.monto.toLocaleString()}`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default AmountChart;