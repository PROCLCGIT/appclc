// src/pages/proformas/components/dashboard/ExportButton.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon, FileTextIcon, FileSpreadsheetIcon, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/config/axios';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

/**
 * Botón de exportación para el dashboard que soporta múltiples formatos
 * Conecta con endpoints del backend para generar reportes
 * 
 * @param {Object} dateRange - Rango de fechas seleccionado (startDate, endDate)
 * @param {Array} statusFilters - Filtros de estado activos
 * @param {Boolean} disabled - Si el botón debe estar deshabilitado
 */
const ExportButton = ({ dateRange, statusFilters, disabled }) => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  // Preparar parámetros de filtro para la exportación
  const getFilterParams = () => {
    const params = {};
    
    // Añadir fechas en formato ISO
    if (dateRange.startDate) {
      params.start_date = format(dateRange.startDate, 'yyyy-MM-dd');
    }
    
    if (dateRange.endDate) {
      params.end_date = format(dateRange.endDate, 'yyyy-MM-dd');
    }
    
    // Añadir filtros de estado si hay seleccionados
    if (statusFilters && statusFilters.length > 0) {
      params.estado = statusFilters.join(',');
    }
    
    return params;
  };

  // Función para exportar a CSV
  const exportToCsv = async () => {
    try {
      setIsExporting(true);
      setExportFormat('csv');
      
      const params = getFilterParams();
      params.format = 'csv';
      
      const response = await api.get('/proformas/stats-dashboard/', {
        params,
        responseType: 'blob'
      });
      
      // Crear nombre de archivo con fecha actual
      const date = new Date();
      const fileName = `proformas_dashboard_${format(date, 'yyyyMMdd_HHmmss')}.csv`;
      
      // Crear y descargar archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error(t('dashboard.errors.exportFailed'), error);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  // Función para exportar a PDF
  const exportToPdf = async () => {
    try {
      setIsExporting(true);
      setExportFormat('pdf');
      
      const params = getFilterParams();
      
      const response = await api.get('/proformas/dashboard/exportar_pdf/', {
        params,
        responseType: 'blob'
      });
      
      // Crear nombre de archivo con fecha actual
      const date = new Date();
      const fileName = `proformas_dashboard_${format(date, 'yyyyMMdd_HHmmss')}.pdf`;
      
      // Crear y descargar archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error(t('dashboard.errors.exportFailed'), error);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled || isExporting}
          aria-label={t('dashboard.buttons.export')}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
              {t('dashboard.buttons.exporting')}
            </>
          ) : (
            <>
              <DownloadIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('dashboard.buttons.export')}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('dashboard.exportFormats.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={exportToCsv}
          disabled={isExporting}
        >
          <FileSpreadsheetIcon className="h-4 w-4 mr-2" aria-hidden="true" />
          <span>{t('dashboard.exportFormats.csv')}</span>
          {exportFormat === 'csv' && (
            <Loader2 className="h-4 w-4 ml-2 animate-spin" aria-hidden="true" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={exportToPdf}
          disabled={isExporting}
        >
          <FileTextIcon className="h-4 w-4 mr-2" aria-hidden="true" />
          <span>{t('dashboard.exportFormats.pdf')}</span>
          {exportFormat === 'pdf' && (
            <Loader2 className="h-4 w-4 ml-2 animate-spin" aria-hidden="true" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;