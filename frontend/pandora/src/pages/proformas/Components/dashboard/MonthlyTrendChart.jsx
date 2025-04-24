// src/pages/proformas/components/dashboard/MonthlyTrendChart.jsx
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
  Legend
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { THEME_COLORS, ESTADO_COLORS } from '../../utils/constants';
import CustomTooltip from './CustomTooltip';

/**
 * Componente para mostrar la tendencia mensual de proformas
 * Incluye indicador de carga, soporte para accesibilidad y tema
 */
const MonthlyTrendChart = ({ data, isError, isLoading, className = "" }) => {
  // Obtener el tema actual
  const { isDark } = useTheme();
  
  // Seleccionar colores del tema según el modo
  const themeColors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  
  return (
    <Card className={`mb-8 ${className}`}>
      <CardHeader>
        <CardTitle>Tendencia de Proformas por Mes</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" aria-hidden="true" />
            <p role="status" aria-live="polite">Cargando datos de tendencia mensual...</p>
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
              aria-label="Gráfico de tendencia mensual de proformas"
              style={{ fontFamily: 'inherit' }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={themeColors.gridColor}
              />
              <XAxis 
                dataKey="mes" 
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  return `${month}/${year.slice(2)}`;
                }}
                aria-label="Meses"
                stroke={isDark ? '#f3f4f6' : '#333333'}
                tick={{ fill: isDark ? '#f3f4f6' : '#333333' }}
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                aria-label="Cantidad de proformas"
                stroke={isDark ? '#f3f4f6' : '#333333'}
                tick={{ fill: isDark ? '#f3f4f6' : '#333333' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tickFormatter={(value) => `${value.toLocaleString()}`} 
                aria-label="Monto total en dólares"
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
              <Legend 
                formatter={(value) => (
                  <span style={{ color: isDark ? '#f3f4f6' : '#333333' }}>{value}</span>
                )}
              />
              <Bar 
                yAxisId="left"
                dataKey="cantidad" 
                name="Cantidad" 
                fill={ESTADO_COLORS.enviada} 
                radius={[4, 4, 0, 0]}
                aria-label="Cantidad de proformas por mes"
              />
              <Bar 
                yAxisId="right"
                dataKey="monto" 
                name="Monto" 
                fill={ESTADO_COLORS.aprobada} 
                radius={[4, 4, 0, 0]}
                aria-label="Monto total por mes"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyTrendChart;