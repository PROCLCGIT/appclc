// src/pages/proformas/components/dashboard/DashboardHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusIcon, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import LanguageSwitcher from '@/components/ui/language-switcher';
import ExportButton from './ExportButton';
import { useTranslation } from 'react-i18next';

/**
 * Encabezado del dashboard con título y acciones
 * Incluye selector de tema claro/oscuro, selector de idioma y botón de exportación
 */
const DashboardHeader = ({ isLoading, isFetching, refetch, dateRange, statusFilters }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-wrap justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle className="mr-1" />
        <LanguageSwitcher className="mr-2" />
        <ExportButton 
          dateRange={dateRange} 
          statusFilters={statusFilters} 
          disabled={isLoading || isFetching}
        />
        <Button 
          variant="outline" 
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          aria-label={t('dashboard.buttons.refresh')}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", {
            "animate-spin": isFetching
          })} aria-hidden="true" />
          {t('dashboard.buttons.refresh')}
        </Button>
        <Link to="/enhancedproforma?new=true">
          <Button aria-label={t('dashboard.buttons.new')}>
            <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('dashboard.buttons.new')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;