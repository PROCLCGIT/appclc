// src/pages/proformas/components/dashboard/DateRangeSelector.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronDownIcon, AlertCircle } from 'lucide-react';
import { format, isAfter, isBefore, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { addMonths, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Componente para seleccionar un rango de fechas con presets
 * Incluye validación de fechas y accesibilidad WCAG
 */
const DateRangeSelector = ({ dateRange, setDateRange, onValidationChange }) => {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [error, setError] = useState(null);

  // Validar el rango de fechas
  useEffect(() => {
    // Solo validar si ambas fechas están establecidas
    if (dateRange.startDate && dateRange.endDate) {
      if (isAfter(dateRange.startDate, dateRange.endDate) && !isSameDay(dateRange.startDate, dateRange.endDate)) {
        setError('La fecha de inicio no puede ser posterior a la fecha final');
        if (onValidationChange) {
          onValidationChange(false, 'La fecha de inicio no puede ser posterior a la fecha final');
        }
      } else {
        setError(null);
        if (onValidationChange) {
          onValidationChange(true);
        }
      }
    } else {
      setError(null);
      if (onValidationChange) {
        onValidationChange(true);
      }
    }
  }, [dateRange.startDate, dateRange.endDate, onValidationChange]);

  // Presets de rangos de fechas
  const handlePresetClick = (preset) => {
    const now = new Date();
    
    switch (preset) {
      case 'este-mes':
        setDateRange({
          startDate: startOfMonth(now),
          endDate: endOfMonth(now)
        });
        break;
      case 'mes-anterior':
        const lastMonth = subMonths(now, 1);
        setDateRange({
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth)
        });
        break;
      case 'ultimos-3-meses':
        setDateRange({
          startDate: startOfMonth(subMonths(now, 2)),
          endDate: endOfMonth(now)
        });
        break;
      case 'ultimos-6-meses':
        setDateRange({
          startDate: startOfMonth(subMonths(now, 5)),
          endDate: endOfMonth(now)
        });
        break;
      case 'todo':
        setDateRange({
          startDate: null,
          endDate: null
        });
        break;
      default:
        break;
    }
  };

  return (
    <div role="group" aria-labelledby="date-range-label">
      <div className="flex flex-wrap items-center space-x-4 mb-2">
        <span id="date-range-label" className="text-sm font-medium">Período:</span>
        
        {/* Selector de Fecha Inicio */}
        <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-9 px-4"
              aria-label="Seleccionar fecha inicial"
              aria-haspopup="dialog"
              aria-expanded={isStartOpen}
            >
              {dateRange.startDate ? (
                format(dateRange.startDate, 'dd/MM/yyyy')
              ) : (
                <span>Fecha inicial</span>
              )}
              <CalendarIcon className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateRange.startDate}
              onSelect={(date) => {
                setDateRange(prev => ({ ...prev, startDate: date }));
                // Use a timeout to prevent state update from causing rerenders
                setTimeout(() => setIsStartOpen(false), 0);
              }}
              initialFocus
              locale={es}
              disabled={(date) => dateRange.endDate ? isAfter(date, dateRange.endDate) : false}
            />
          </PopoverContent>
        </Popover>
        
        <span aria-hidden="true">a</span>
        
        {/* Selector de Fecha Fin */}
        <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-9 px-4"
              aria-label="Seleccionar fecha final"
              aria-haspopup="dialog"
              aria-expanded={isEndOpen}
            >
              {dateRange.endDate ? (
                format(dateRange.endDate, 'dd/MM/yyyy')
              ) : (
                <span>Fecha final</span>
              )}
              <CalendarIcon className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateRange.endDate}
              onSelect={(date) => {
                setDateRange(prev => ({ ...prev, endDate: date }));
                // Use a timeout to prevent state update from causing rerenders
                setTimeout(() => setIsEndOpen(false), 0);
              }}
              disabled={(date) => dateRange.startDate ? isBefore(date, dateRange.startDate) : false}
              initialFocus
              locale={es}
            />
          </PopoverContent>
        </Popover>
        
        {/* Presets de rangos */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="h-9" 
              aria-label="Seleccionar período predefinido"
              aria-haspopup="dialog"
            >
              Presets
              <ChevronDownIcon className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="flex flex-col space-y-1" role="menu">
              <Button 
                variant="ghost"
                className="justify-start text-left"
                onClick={() => handlePresetClick('este-mes')}
                role="menuitem"
              >
                Este mes
              </Button>
              <Button 
                variant="ghost"
                className="justify-start text-left"
                onClick={() => handlePresetClick('mes-anterior')}
                role="menuitem"
              >
                Mes anterior
              </Button>
              <Button 
                variant="ghost"
                className="justify-start text-left"
                onClick={() => handlePresetClick('ultimos-3-meses')}
                role="menuitem"
              >
                Últimos 3 meses
              </Button>
              <Button 
                variant="ghost"
                className="justify-start text-left"
                onClick={() => handlePresetClick('ultimos-6-meses')}
                role="menuitem"
              >
                Últimos 6 meses
              </Button>
              <Button 
                variant="ghost"
                className="justify-start text-left"
                onClick={() => handlePresetClick('todo')}
                role="menuitem"
              >
                Todo el tiempo
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Mensaje de error */}
      {error && (
        <Alert variant="destructive" className="mb-2 py-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DateRangeSelector;