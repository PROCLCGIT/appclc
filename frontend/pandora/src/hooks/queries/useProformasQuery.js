/**
 * Hook centralizado para gestionar consultas y mutaciones de Proformas con React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProformaService } from '@/services/classes/ProformaService';
import { useNotifications } from '@/pages/proformas/hooks/useNotifications';
import { useErrorHandler } from '@/pages/proformas/hooks/useErrorHandler';

// Crear instancia del servicio de proformas
const proformaService = new ProformaService();

// Keys para las consultas de React Query
export const proformaKeys = {
  all: ['proformas'],
  lists: () => [...proformaKeys.all, 'list'],
  list: (filters) => [...proformaKeys.lists(), filters],
  details: () => [...proformaKeys.all, 'detail'],
  detail: (id) => [...proformaKeys.details(), id],
  dashboard: (dateRange) => [...proformaKeys.all, 'dashboard', dateRange],
  config: () => [...proformaKeys.all, 'config'],
};

/**
 * Hook para obtener, crear, actualizar y eliminar proformas
 */
export function useProformasQuery(options = {}) {
  const queryClient = useQueryClient();
  const notify = useNotifications();
  const errorHandler = useErrorHandler();
  
  // Obtener parámetros de opciones
  const { 
    filters = {}, 
    enabled = true, 
    initialData = undefined,
    keepPreviousData = true,
    showToasts = true,
    refetchInterval = false,
  } = options;

  // Query para obtener lista de proformas
  const proformasQuery = useQuery({
    queryKey: proformaKeys.list(filters),
    queryFn: () => proformaService.getAll(filters),
    enabled,
    initialData,
    keepPreviousData,
    refetchInterval,
    onError: (error) => {
      errorHandler.handleError(error, 'obtener lista de proformas');
    }
  });

  // Mutación para crear nueva proforma
  const createMutation = useMutation({
    mutationFn: (newProforma) => proformaService.create(newProforma),
    onSuccess: (data, variables) => {
      // Invalidar consultas para refrescar automáticamente
      queryClient.invalidateQueries(proformaKeys.lists());
      
      if (showToasts) {
        notify.success('Proforma creada con éxito');
      }
    },
    onError: (error, variables) => {
      errorHandler.handleError(error, 'crear proforma');
      
      if (showToasts) {
        notify.error('Error al crear la proforma');
      }
    }
  });

  // Mutación para actualizar una proforma existente
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => proformaService.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidar consultas de lista y detalle
      queryClient.invalidateQueries(proformaKeys.list(filters));
      queryClient.invalidateQueries(proformaKeys.detail(variables.id));
      
      if (showToasts) {
        notify.success('Proforma actualizada con éxito');
      }
    },
    onError: (error, variables) => {
      errorHandler.handleError(error, 'actualizar proforma');
      
      if (showToasts) {
        notify.error('Error al actualizar la proforma');
      }
    }
  });

  // Mutación para eliminar una proforma
  const deleteMutation = useMutation({
    mutationFn: (id) => proformaService.delete(id),
    onSuccess: (data, variables) => {
      // Invalidar consultas
      queryClient.invalidateQueries(proformaKeys.lists());
      
      if (showToasts) {
        notify.success('Proforma eliminada con éxito');
      }
    },
    onError: (error, variables) => {
      errorHandler.handleError(error, 'eliminar proforma');
      
      if (showToasts) {
        notify.error('Error al eliminar la proforma');
      }
    }
  });

  // Mutación para cambiar el estado de una proforma
  const changeStateMutation = useMutation({
    mutationFn: ({ id, estado, notas }) => {
      return proformaService.executeAction(id, 'cambiar_estado', { estado, notas });
    },
    onSuccess: (data, variables) => {
      // Invalidar consultas de lista y detalle
      queryClient.invalidateQueries(proformaKeys.list(filters));
      queryClient.invalidateQueries(proformaKeys.detail(variables.id));
      
      if (showToasts) {
        const message = `Proforma ${variables.estado === 'aprobada' ? 'aprobada' : 
                        variables.estado === 'enviada' ? 'enviada' : 
                        variables.estado === 'rechazada' ? 'rechazada' : 'actualizada'} con éxito`;
        notify.success(message);
      }
    },
    onError: (error, variables) => {
      errorHandler.handleError(error, `cambiar estado de proforma a ${variables.estado}`);
      
      if (showToasts) {
        notify.error(`Error al cambiar el estado de la proforma`);
      }
    }
  });

  // Mutación para duplicar una proforma
  const duplicateMutation = useMutation({
    mutationFn: (id) => proformaService.executeAction(id, 'duplicar'),
    onSuccess: (data, variables) => {
      // Invalidar consultas de lista
      queryClient.invalidateQueries(proformaKeys.lists());
      
      if (showToasts) {
        notify.success('Proforma duplicada con éxito');
      }
    },
    onError: (error, variables) => {
      errorHandler.handleError(error, 'duplicar proforma');
      
      if (showToasts) {
        notify.error('Error al duplicar la proforma');
      }
    }
  });

  return {
    // Datos y estado de la consulta
    proformas: proformasQuery.data,
    isLoading: proformasQuery.isLoading,
    isFetching: proformasQuery.isFetching,
    isError: proformasQuery.isError,
    error: proformasQuery.error,
    refetch: proformasQuery.refetch,
    
    // Funciones de mutación
    createProforma: createMutation.mutateAsync,
    updateProforma: updateMutation.mutateAsync,
    deleteProforma: deleteMutation.mutateAsync,
    changeProformaState: changeStateMutation.mutateAsync,
    duplicateProforma: duplicateMutation.mutateAsync,
    
    // Estado de las mutaciones
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isChangingState: changeStateMutation.isLoading,
    isDuplicating: duplicateMutation.isLoading,
  };
}

/**
 * Hook para obtener una única proforma por ID
 */
export function useProformaDetailQuery(id, options = {}) {
  const queryClient = useQueryClient();
  const errorHandler = useErrorHandler();
  
  const { 
    enabled = Boolean(id),
    initialData,
    staleTime = 1000 * 60 * 5, // 5 minutos
    refetchInterval = false,
  } = options;

  return useQuery({
    queryKey: proformaKeys.detail(id),
    queryFn: () => proformaService.getById(id),
    enabled,
    initialData,
    staleTime,
    refetchInterval,
    onError: (error) => {
      errorHandler.handleError(error, `obtener detalle de proforma #${id}`);
    }
  });
}

/**
 * Hook para obtener los datos del dashboard de proformas
 */
export function useProformaDashboardQuery(dateRange = {}, options = {}) {
  const { startDate, endDate } = dateRange;
  const errorHandler = useErrorHandler();

  const { 
    enabled = true,
    staleTime = 1000 * 60 * 5, // 5 minutos (dashboard puede ser menos reciente)
    refetchInterval = false,
  } = options;

  return useQuery({
    queryKey: proformaKeys.dashboard(dateRange),
    queryFn: () => proformaService.getDashboard(startDate, endDate),
    enabled,
    staleTime,
    refetchInterval,
    onError: (error) => {
      errorHandler.handleError(error, 'obtener datos del dashboard');
    }
  });
}

/**
 * Hook para buscar productos para incluir en proformas
 */
export function useProductSearchQuery(searchParams, options = {}) {
  const errorHandler = useErrorHandler();
  const { term, source } = searchParams || {};
  
  const { 
    enabled = Boolean(term && term.length >= 2),
    staleTime = 1000 * 60 * 5, // 5 minutos
  } = options;

  return useQuery({
    queryKey: ['products', 'search', searchParams],
    queryFn: () => proformaService.searchProducts(term, source),
    enabled,
    staleTime,
    onError: (error) => {
      errorHandler.handleError(error, 'buscar productos');
    }
  });
}

/**
 * Hook para obtener y actualizar la configuración de proformas
 */
export function useProformaConfigQuery(options = {}) {
  const queryClient = useQueryClient();
  const notify = useNotifications();
  const errorHandler = useErrorHandler();
  
  const { 
    enabled = true,
    staleTime = 1000 * 60 * 15, // 15 minutos
    showToasts = true,
  } = options;

  // Query para obtener configuración
  const configQuery = useQuery({
    queryKey: proformaKeys.config(),
    queryFn: () => proformaService.getConfiguration(),
    enabled,
    staleTime,
    onError: (error) => {
      errorHandler.handleError(error, 'obtener configuración de proformas');
    }
  });

  // Mutación para actualizar configuración
  const updateConfigMutation = useMutation({
    mutationFn: (configData) => proformaService.update('configuracion', configData),
    onSuccess: () => {
      // Invalidar consulta de configuración
      queryClient.invalidateQueries(proformaKeys.config());
      
      if (showToasts) {
        notify.success('Configuración actualizada con éxito');
      }
    },
    onError: (error) => {
      errorHandler.handleError(error, 'actualizar configuración');
      
      if (showToasts) {
        notify.error('Error al actualizar la configuración');
      }
    }
  });

  return {
    config: configQuery.data,
    isLoading: configQuery.isLoading,
    isError: configQuery.isError,
    error: configQuery.error,
    updateConfig: updateConfigMutation.mutateAsync,
    isUpdating: updateConfigMutation.isLoading,
  };
}
