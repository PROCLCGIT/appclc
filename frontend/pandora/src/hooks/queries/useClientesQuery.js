/**
 * Hook para gestionar consultas y mutaciones de clientes con React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/config/axios';
import { useErrorHandler } from '@/pages/proformas/hooks/useErrorHandler';

// Keys para las consultas de React Query
export const clienteKeys = {
  all: ['clientes'],
  lists: () => [...clienteKeys.all, 'list'],
  list: (filters) => [...clienteKeys.lists(), filters],
  details: () => [...clienteKeys.all, 'detail'],
  detail: (id) => [...clienteKeys.details(), id],
};

/**
 * Hook principal para gestionar clientes
 */
export function useClientesQuery(options = {}) {
  const queryClient = useQueryClient();
  const errorHandler = useErrorHandler();
  
  // Obtener parámetros de opciones
  const { 
    filters = {}, 
    enabled = true, 
    staleTime = 1000 * 60 * 5, // 5 minutos
    keepPreviousData = true,
    showErrors = true,
  } = options;

  // Query para obtener lista de clientes
  const clientesQuery = useQuery({
    queryKey: clienteKeys.list(filters),
    queryFn: async () => {
      try {
        const response = await api.get('/clientes/', { params: filters });
        return response.data;
      } catch (error) {
        if (showErrors) {
          errorHandler.handleError(error, 'obtener lista de clientes');
        }
        throw error;
      }
    },
    enabled,
    staleTime,
    keepPreviousData,
    onError: (error) => {
      if (showErrors) {
        errorHandler.handleError(error, 'obtener lista de clientes');
      }
    }
  });

  // Mutación para crear nuevo cliente
  const createMutation = useMutation({
    mutationFn: async (nuevoCliente) => {
      try {
        const response = await api.post('/clientes/', nuevoCliente);
        return response.data;
      } catch (error) {
        if (showErrors) {
          errorHandler.handleError(error, 'crear cliente');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidar consultas para refrescar automáticamente
      queryClient.invalidateQueries(clienteKeys.lists());
    }
  });

  // Mutación para actualizar un cliente existente
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        const response = await api.put(`/clientes/${id}/`, data);
        return response.data;
      } catch (error) {
        if (showErrors) {
          errorHandler.handleError(error, 'actualizar cliente');
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidar consultas de lista y detalle
      queryClient.invalidateQueries(clienteKeys.list(filters));
      queryClient.invalidateQueries(clienteKeys.detail(variables.id));
    }
  });

  // Mutación para eliminar un cliente
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      try {
        const response = await api.delete(`/clientes/${id}/`);
        return response.data;
      } catch (error) {
        if (showErrors) {
          errorHandler.handleError(error, 'eliminar cliente');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidar consultas de lista
      queryClient.invalidateQueries(clienteKeys.lists());
    }
  });

  // Buscar clientes
  const searchClientes = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }
    
    try {
      // Realizar búsqueda con React Query
      const data = await queryClient.fetchQuery({
        queryKey: clienteKeys.list({ search: searchTerm }),
        queryFn: async () => {
          const response = await api.get('/clientes/', { 
            params: { search: searchTerm, limit: 20 } 
          });
          return response.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
      });
      
      return data?.results || data || [];
    } catch (error) {
      if (showErrors) {
        errorHandler.handleError(error, 'buscar clientes');
      }
      return [];
    }
  };

  return {
    // Datos y estado de la consulta
    clientes: clientesQuery.data?.results || clientesQuery.data || [],
    isLoading: clientesQuery.isLoading,
    isFetching: clientesQuery.isFetching,
    isError: clientesQuery.isError,
    error: clientesQuery.error,
    refetch: clientesQuery.refetch,
    
    // Funciones de mutación
    createCliente: createMutation.mutateAsync,
    updateCliente: updateMutation.mutateAsync,
    deleteCliente: deleteMutation.mutateAsync,
    searchClientes,
    
    // Estado de las mutaciones
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
}

/**
 * Hook para obtener detalles de un cliente específico
 */
export function useClienteDetailQuery(id, options = {}) {
  const errorHandler = useErrorHandler();
  
  const { 
    enabled = Boolean(id),
    staleTime = 1000 * 60 * 5, // 5 minutos
    showErrors = true,
  } = options;

  return useQuery({
    queryKey: clienteKeys.detail(id),
    queryFn: async () => {
      try {
        const response = await api.get(`/clientes/${id}/`);
        return response.data;
      } catch (error) {
        if (showErrors) {
          errorHandler.handleError(error, `obtener detalle de cliente #${id}`);
        }
        throw error;
      }
    },
    enabled,
    staleTime,
    onError: (error) => {
      if (showErrors) {
        errorHandler.handleError(error, `obtener detalle de cliente #${id}`);
      }
    }
  });
}

export default useClientesQuery;
