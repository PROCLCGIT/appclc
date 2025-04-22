// Versión mejorada
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/config/axios';
import { useErrorHandler } from '@/pages/proformas/hooks/useErrorHandler';

// Configuración centralizada de endpoints de API
export const API_ENDPOINTS = {
  CLIENTES: [
    'pandora/clientes/',
    'core/clientes/',
    'madvance/clientes/',
    'clientes/'
  ]
};

// Intentar cada endpoint en secuencia hasta obtener éxito
const tryEndpoints = async (operation, params = {}, errorHandler = null) => {
  let lastError = null;
  
  for (const endpoint of API_ENDPOINTS.CLIENTES) {
    try {
      console.log(`Intentando ${operation} con: ${endpoint}`);
      let response;
      
      switch(operation) {
        case 'get':
          response = await api.get(endpoint, { params });
          break;
        case 'post':
          response = await api.post(endpoint, params);
          break;
        case 'put':
          const { id, data } = params;
          response = await api.put(`${endpoint}${id}/`, data);
          break;
        case 'delete':
          response = await api.delete(`${endpoint}${params}/`);
          break;
        default:
          throw new Error(`Operación no soportada: ${operation}`);
      }
      
      console.log(`✅ Éxito con ${endpoint}`);
      return response.data;
    } catch (error) {
      console.warn(`❌ Error con ${endpoint}:`, error.message);
      lastError = error;
    }
  }
  
  // Si llegamos aquí, ningún endpoint funcionó
  if (errorHandler) {
    errorHandler.handleError(lastError, `${operation} clientes`);
  }
  throw lastError || new Error(`No se pudo realizar la operación ${operation}`);
};

// Keys para las consultas de React Query
export const clienteKeys = {
  all: ['clientes'],
  lists: () => [...clienteKeys.all, 'list'],
  list: (filters) => [...clienteKeys.lists(), filters],
  details: () => [...clienteKeys.all, 'detail'],
  detail: (id) => [...clienteKeys.details(), id],
};

/**
 * Hook principal para gestionar clientes con manejo unificado de endpoints
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
        return await tryEndpoints('get', filters, showErrors ? errorHandler : null);
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
        return await tryEndpoints('post', nuevoCliente, showErrors ? errorHandler : null);
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
        return await tryEndpoints('put', { id, data }, showErrors ? errorHandler : null);
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
        return await tryEndpoints('delete', id, showErrors ? errorHandler : null);
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
    try {
      // Solo limitamos la búsqueda a 2 caracteres si no es una cadena vacía
      if (searchTerm !== "" && searchTerm && searchTerm.length < 2) {
        console.log('Búsqueda de clientes: Término muy corto, se requieren al menos 2 caracteres');
        return [];
      }
      
      const params = { 
        limit: 100, // Aumentamos el límite para obtener más resultados
        ordering: '-created_at' // Ordenar por creación más reciente
      }; 
      
      // Solo incluir search en los parámetros si no está vacío
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // Realizar búsqueda con React Query usando queryClient.fetchQuery
      const data = await queryClient.fetchQuery({
        queryKey: clienteKeys.list({ search: searchTerm || '' }),
        queryFn: async () => await tryEndpoints('get', params, showErrors ? errorHandler : null),
        staleTime: 1000 * 60 * 5, // 5 minutos
      });
      
      const results = data?.results || data || [];
      
      // Si recibimos resultados, actualizamos el caché de React Query
      if (results.length > 0) {
        queryClient.setQueryData(
          clienteKeys.list({}), 
          (oldData) => {
            // Si ya hay datos, mantenerlos y agregar/actualizar los nuevos
            if (oldData && (oldData.results || Array.isArray(oldData))) {
              const existingResults = oldData.results || oldData;
              const combinedResults = [...results];
              return { results: combinedResults };
            }
            // Si no hay datos previos, simplemente devolvemos los nuevos
            return { results };
          }
        );
      }
      
      return results;
    } catch (error) {
      console.error('Error durante búsqueda de clientes:', error);
      if (showErrors) {
        errorHandler.handleError(error, 'buscar clientes');
      }
      
      // Intentar recuperar datos del caché como último recurso
      try {
        const cachedData = queryClient.getQueryData(clienteKeys.list({}));
        if (cachedData) {
          console.log('Usando datos en caché como fallback');
          const cachedResults = cachedData.results || cachedData || [];
          return cachedResults;
        }
      } catch (cacheError) {
        console.error('Error al recuperar caché:', cacheError);
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
        return await tryEndpoints('get', id, showErrors ? errorHandler : null);
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