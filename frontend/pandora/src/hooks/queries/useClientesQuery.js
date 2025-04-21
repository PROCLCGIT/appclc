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
        // Intentando primero con la ruta correcta
        try {
          console.log('Intentando obtener clientes de /api/core/clientes/');
          const response = await api.get('/api/core/clientes/', { 
            params: filters,
            _bypassCache: true,
            _highPriority: true
          });
          console.log('✅ Éxito al obtener clientes de /api/core/clientes/', response.data);
          return response.data;
        } catch (apiError) {
          console.warn('❌ Error al obtener clientes de /api/core/clientes/, intentando ruta alternativa:', apiError.message);
          
          // Fallback a la ruta antigua
          const fallbackResponse = await api.get('/madvance/clientes/', { 
            params: filters,
            _bypassCache: true,
            _highPriority: true
          });
          console.log('✅ Éxito al obtener clientes de ruta fallback:', fallbackResponse.data);
          return fallbackResponse.data;
        }
      } catch (error) {
        console.error('❌ Error en ambas rutas al obtener clientes:', error);
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
        const response = await api.post('/madvance/clientes/', nuevoCliente);
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
        const response = await api.put(`/madvance/clientes/${id}/`, data);
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
        const response = await api.delete(`/madvance/clientes/${id}/`);
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
    try {
      // Si el searchTerm está vacío, intentamos obtener todos los clientes (o los más recientes)
      // Solo limitamos la búsqueda a 2 caracteres si no es una cadena vacía
      if (searchTerm !== "" && searchTerm && searchTerm.length < 2) {
        console.log('Búsqueda de clientes: Término muy corto, se requieren al menos 2 caracteres');
        return [];
      }
      
      console.log(`Búsqueda de clientes: Buscando ${searchTerm ? `"${searchTerm}"` : 'todos los clientes'}`);
      
      // Realizar búsqueda con React Query
      const data = await queryClient.fetchQuery({
        queryKey: clienteKeys.list({ search: searchTerm || '' }),
        queryFn: async () => {
          console.log('Realizando llamada a API para buscar clientes...');
          const params = { 
            limit: 100, // Aumentamos el límite para obtener más resultados
            ordering: '-created_at' // Ordenar por creación más reciente
          }; 
          
          // Solo incluir search en los parámetros si no está vacío
          if (searchTerm) {
            params.search = searchTerm;
          }
          
          try {
            // Primero intentamos con la API que parece correcta según la configuración del backend
            console.log('Intentando buscar clientes en /api/core/clientes/');
            const response = await api.get('/api/core/clientes/', { 
              params,
              _bypassCache: true,
              _highPriority: true,
              _disableRetry: false,
              timeout: 15000 // Aumentar timeout a 15 segundos
            });
            console.log('✅ Éxito al buscar clientes en /api/core/clientes/:', response.data);
            return response.data;
          } catch (apiError) {
            console.warn('❌ Error al buscar clientes en /api/core/clientes/:', apiError.message);
            
            // Si falla, intentamos con la ruta original
            console.log('Intentando con la ruta anterior /madvance/clientes/...');
            try {
              const retryResponse = await api.get('/madvance/clientes/', { 
                params,
                _bypassCache: true,
                _highPriority: true,
                timeout: 15000
              });
              console.log('✅ Éxito al buscar clientes en /madvance/clientes/:', retryResponse.data);
              return retryResponse.data;
            } catch (retryError) {
              console.error('❌ Error en la ruta alternativa:', retryError.message);
              
              // Último intento: usar la URL relativa '/clientes/'
              console.log('Intentando con la ruta básica /clientes/...');
              const lastAttemptResponse = await api.get('/clientes/', { params });
              console.log('✅ Éxito al buscar clientes en /clientes/:', lastAttemptResponse.data);
              return lastAttemptResponse.data;
            }
          }
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
      });
      
      const results = data?.results || data || [];
      console.log(`Búsqueda de clientes: Se encontraron ${results.length} resultados`);
      
      // Si recibimos resultados, actualizamos el caché de React Query
      if (results.length > 0) {
        queryClient.setQueryData(
          clienteKeys.list({}), 
          (oldData) => {
            // Si ya hay datos, mantenerlos y agregar/actualizar los nuevos
            if (oldData && (oldData.results || Array.isArray(oldData))) {
              const existingResults = oldData.results || oldData;
              // Combinamos resultados sin duplicar
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
        const response = await api.get(`/madvance/clientes/${id}/`);
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
