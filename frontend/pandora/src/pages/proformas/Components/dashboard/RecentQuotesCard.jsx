// src/pages/proformas/components/dashboard/RecentQuotesCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileIcon, PlusIcon, RefreshCw, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProformasDashboardTable from '../ProformasDashboardTable';

/**
 * Componente para mostrar las proformas recientes
 * Incluye indicadores de carga y soporte para accesibilidad
 */
const RecentQuotesCard = ({ dashboardData, recentProformas, isError, error, isFetching, isLoading, refetch }) => {
  // Determinar qué proformas mostrar (del objeto dashboardData o del parámetro recentProformas)
  const proformasToShow = recentProformas || dashboardData?.proformasRecientes || dashboardData?.recientes || [];
  const hasProformas = proformasToShow.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Proformas Recientes</CardTitle>
        {!isError && (dashboardData || recentProformas) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            aria-label="Actualizar lista de proformas recientes"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", {
              "animate-spin": isFetching
            })} 
            aria-hidden="true" />
            Actualizar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center" aria-live="polite" aria-busy="true">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" aria-hidden="true" />
            <p className="text-sm font-medium text-muted-foreground">Cargando proformas recientes...</p>
          </div>
        ) : isError ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center" role="alert" aria-live="assertive">
              <XCircle className="mx-auto h-12 w-12 text-red-400" aria-hidden="true" />
              <h3 className="mt-2 text-sm font-semibold text-red-600">Error al cargar los datos</h3>
              <p className="mt-1 text-sm text-red-500">{error?.message || "No se pudieron obtener las proformas recientes"}</p>
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => refetch()}
                  aria-label="Reintentar cargar las proformas"
                >
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        ) : !hasProformas ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <FileIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay proformas</h3>
              <p className="mt-1 text-sm text-gray-500">Crea una nueva proforma para comenzar</p>
              <div className="mt-6">
                <Link to="/enhancedproforma?new=true">
                  <Button aria-label="Crear nueva proforma">
                    <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                    Nueva Proforma
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div role="region" aria-label="Lista de proformas recientes">
            <ProformasDashboardTable 
              proformas={proformasToShow} 
              loading={isFetching}
              onRefresh={() => refetch()}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentQuotesCard;