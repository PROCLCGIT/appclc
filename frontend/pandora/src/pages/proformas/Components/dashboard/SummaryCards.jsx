// src/pages/proformas/components/dashboard/SummaryCards.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatUtils';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/contexts/ThemeContext';
import { ESTADO_COLORS } from '../../utils/constants';

/**
 * Componente que muestra las tarjetas de resumen con métricas principales
 * Incluye indicadores de carga, soporte para accesibilidad y tema
 */
const SummaryCards = ({ dashboardData, summaryData: propsSummaryData, isLoading, className = "" }) => {
  // Si no hay datos y no está cargando, no renderizamos nada
  if (!dashboardData && !propsSummaryData && !isLoading) return null;

  // Obtener el tema actual
  const { isDark } = useTheme();

  // Usar summaryData si se proporciona, o calcular de dashboardData
  let summaryData;
  
  if (propsSummaryData) {
    // Usar datos ya procesados (preferido)
    summaryData = propsSummaryData;
  } else if (dashboardData) {
    // Calcular a partir de datos crudos (compatibilidad con versiones anteriores)
    const totalProformas = dashboardData.totalStats?.totalProformas || dashboardData.total_proformas || 0;
    const proformasAprobadas = dashboardData.totalStats?.proformasAprobadas || dashboardData.por_estado?.aprobada?.count || 0;
    const montoTotal = dashboardData.totalStats?.montoTotal || dashboardData.total_monto || 0;
    const tasaConversion = dashboardData.totalStats?.tasaConversion || 
      (totalProformas > 0 ? (proformasAprobadas / totalProformas) * 100 : 0);
    const promedioProforma = totalProformas > 0 ? montoTotal / totalProformas : 0;
    
    summaryData = {
      totalProformas,
      proformasAprobadas,
      montoTotal,
      promedioProforma,
      tasaConversion
    };
  } else {
    // Valores por defecto para el estado de carga
    summaryData = {
      totalProformas: 0,
      proformasAprobadas: 0,
      montoTotal: 0,
      promedioProforma: 0,
      tasaConversion: 0
    };
  }

  // Componente de carga para mostrar dentro de las tarjetas
  const LoadingCardContent = () => (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
  );

  return (
    <div 
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 ${className}`} 
      role="region" 
      aria-label="Resumen de métricas de proformas"
    >
      {/* Tarjeta: Total Proformas */}
      <Card className="transition-all duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Proformas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingCardContent />
          ) : (
            <>
              <div className="text-3xl font-bold" aria-label={`Total de proformas: ${summaryData.totalProformas}`}>
                {formatNumber(summaryData.totalProformas)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                En el período seleccionado
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Tarjeta: Proformas Aprobadas */}
      <Card className="transition-all duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Proformas Aprobadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingCardContent />
          ) : (
            <>
              <div 
                className="text-3xl font-bold" 
                style={{ color: ESTADO_COLORS.aprobada }}
                aria-label={`Proformas aprobadas: ${summaryData.proformasAprobadas}`}
              >
                {formatNumber(summaryData.proformasAprobadas)}
              </div>
              <p 
                className="text-xs text-muted-foreground mt-1" 
                aria-label={`Tasa de aprobación: ${formatPercent(summaryData.tasaConversion/100, { normalizeToPercent: true })}`}
              >
                Tasa de aprobación: {formatPercent(summaryData.tasaConversion/100, { normalizeToPercent: true })}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Tarjeta: Monto Total */}
      <Card className="transition-all duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monto Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingCardContent />
          ) : (
            <>
              <div 
                className="text-3xl font-bold" 
                style={{ color: ESTADO_COLORS.enviada }}
                aria-label={`Monto total: ${formatCurrency(summaryData.montoTotal)}`}
              >
                {formatCurrency(summaryData.montoTotal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Valor total de proformas
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Tarjeta: Promedio por Proforma */}
      <Card className="transition-all duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Promedio por Proforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingCardContent />
          ) : (
            <>
              <div 
                className="text-3xl font-bold"
                aria-label={`Promedio por proforma: ${formatCurrency(summaryData.promedioProforma)}`}
              >
                {formatCurrency(summaryData.promedioProforma)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Valor promedio
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;