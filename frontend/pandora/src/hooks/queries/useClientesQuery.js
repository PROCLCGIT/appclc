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
        // Intentando primero con la ruta correcta (core/clientes/)
        try {
          console.log('Intentando obtener clientes de core/clientes/');
          const response = await api.get('core/clientes/', { 
            params: filters,
            _bypassCache: true,
            _highPriority: true
          });
          console.log('✅ Éxito al obtener clientes de core/clientes/', response.data);
          return response.data;
        } catch (coreError) {
          console.warn('❌ Error al obtener clientes de core/clientes/, intentando rutas alternativas:', coreError.message);
          
          // Fallback a otras rutas en orden de probabilidad
          try {
            console.log('Intentando obtener clientes de pandora/clientes/');
            const response = await api.get('pandora/clientes/', { 
              params: filters,
              _bypassCache: true,
              _highPriority: true
            });
            console.log('✅ Éxito al obtener clientes de pandora/clientes/', response.data);
            return response.data;
          } catch (apiError) {
            console.warn('❌ Error en pandora/clientes/, intentando madvance/clientes/:', apiError.message);
            const fallbackResponse = await api.get('madvance/clientes/', { 
              params: filters,
              _bypassCache: true,
              _highPriority: true
            });
            console.log('✅ Éxito al obtener clientes de madvance/clientes/:', fallbackResponse.data);
            return fallbackResponse.data;
          }
        }
      } catch (error) {
        console.error('❌ Error en todas las rutas al obtener clientes:', error);
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
        // Asegurarnos que los campos están en el formato correcto
        const clienteFormateado = {
          ...nuevoCliente,
          // Asegurarnos que los IDs son numéricos si se pasan como string
          tipo_cliente: nuevoCliente.tipo_cliente ? Number(nuevoCliente.tipo_cliente) : nuevoCliente.tipo_cliente,
          zona: nuevoCliente.zona ? Number(nuevoCliente.zona) : nuevoCliente.zona,
          ciudad: nuevoCliente.ciudad ? Number(nuevoCliente.ciudad) : nuevoCliente.ciudad,
        };
        
        console.log('Datos del cliente a crear:', clienteFormateado);
        
        // Configuración personalizada para aumentar el timeout para creación
        const config = {
          timeout: 30000, // 30 segundos
          headers: {
            'Content-Type': 'application/json',
          }
        };
        
        try {
          // Intentar primero con el endpoint core de forma directa
          console.log('Intentando crear cliente en core/clientes/');
          const response = await api.post('core/clientes/', clienteFormateado, config);
          console.log('✅ Cliente creado exitosamente en core/clientes/:', response.data);
          return response.data;
        } catch (coreError) {
          console.warn('Error al crear cliente en core/clientes/:', coreError.message);
          console.log('Detalles del error:', coreError.response?.data || coreError);
          
          // Intentar con pandora endpoint
          try {
            console.log('Intentando crear cliente en pandora/clientes/');
            const apiResponse = await api.post('pandora/clientes/', clienteFormateado, config);
            console.log('✅ Cliente creado exitosamente en pandora/clientes/:', apiResponse.data);
            return apiResponse.data;
          } catch (apiError) {
            console.warn('Error al crear cliente en pandora/clientes/:', apiError.message);
            console.log('Detalles del error:', apiError.response?.data || apiError);
            
            // Último intento con madvance endpoint
            console.log('Intentando crear cliente en madvance/clientes/');
            const madvanceResponse = await api.post('madvance/clientes/', clienteFormateado, config);
            console.log('✅ Cliente creado exitosamente en madvance/clientes/:', madvanceResponse.data);
            return madvanceResponse.data;
          }
        }
      } catch (error) {
        console.error('❌ Error en todos los intentos al crear cliente:', error);
        
        // Verificar si tenemos datos específicos del error del servidor
        const errorData = error.response?.data;
        console.error('Datos del error:', errorData);
        
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
        try {
          // Intentar primero con endpoint core
          const response = await api.put(`core/clientes/${id}/`, data);
          console.log(`✅ Cliente #${id} actualizado exitosamente en core/clientes/`);
          return response.data;
        } catch (coreError) {
          console.warn(`Error al actualizar cliente en core/clientes/${id}/`, coreError.message);
          
          // Intentar con pandora endpoint
          try {
            const apiResponse = await api.put(`pandora/clientes/${id}/`, data);
            console.log(`✅ Cliente #${id} actualizado exitosamente en pandora/clientes/`);
            return apiResponse.data;
          } catch (apiError) {
            console.warn(`Error al actualizar cliente en pandora/clientes/${id}/`, apiError.message);
            
            // Último intento con madvance endpoint
            const madvanceResponse = await api.put(`madvance/clientes/${id}/`, data);
            console.log(`✅ Cliente #${id} actualizado exitosamente en madvance/clientes/`);
            return madvanceResponse.data;
          }
        }
      } catch (error) {
        console.error(`❌ Error en todos los intentos al actualizar cliente #${id}:`, error);
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
        try {
          // Intentar primero con endpoint core
          const response = await api.delete(`core/clientes/${id}/`);
          console.log(`✅ Cliente #${id} eliminado exitosamente en core/clientes/`);
          return response.data;
        } catch (coreError) {
          console.warn(`Error al eliminar cliente en core/clientes/${id}/`, coreError.message);
          
          // Intentar con pandora endpoint
          try {
            const apiResponse = await api.delete(`pandora/clientes/${id}/`);
            console.log(`✅ Cliente #${id} eliminado exitosamente en pandora/clientes/`);
            return apiResponse.data;
          } catch (apiError) {
            console.warn(`Error al eliminar cliente en pandora/clientes/${id}/`, apiError.message);
            
            // Último intento con madvance endpoint
            const madvanceResponse = await api.delete(`madvance/clientes/${id}/`);
            console.log(`✅ Cliente #${id} eliminado exitosamente en madvance/clientes/`);
            return madvanceResponse.data;
          }
        }
      } catch (error) {
        console.error(`❌ Error en todos los intentos al eliminar cliente #${id}:`, error);
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
            // Primero intentamos con la API correcta (core/clientes/)
            console.log('Intentando buscar clientes en core/clientes/');
            const response = await api.get('core/clientes/', { 
              params,
              _bypassCache: true,
              _highPriority: true,
              _disableRetry: false,
              timeout: 15000 // Aumentar timeout a 15 segundos
            });
            console.log('✅ Éxito al buscar clientes en core/clientes/:', response.data);
            return response.data;
          } catch (coreError) {
            console.warn('❌ Error al buscar clientes en core/clientes/:', coreError.message);
            
            // Si falla, intentamos con rutas alternativas
            console.log('Intentando con la ruta pandora/clientes/...');
            try {
              const apiResponse = await api.get('pandora/clientes/', { 
                params,
                _bypassCache: true,
                _highPriority: true,
                timeout: 15000
              });
              console.log('✅ Éxito al buscar clientes en pandora/clientes/:', apiResponse.data);
              return apiResponse.data;
            } catch (apiError) {
              console.warn('❌ Error en pandora/clientes/:', apiError.message);
              
              // Intentar con madvance/clientes/
              try {
                const madvanceResponse = await api.get('madvance/clientes/', { 
                  params,
                  _bypassCache: true,
                  _highPriority: true,
                  timeout: 15000
                });
                console.log('✅ Éxito al buscar clientes en madvance/clientes/:', madvanceResponse.data);
                return madvanceResponse.data;
              } catch (madvanceError) {
                console.error('❌ Error en madvance/clientes/:', madvanceError.message);
                
                // Último intento: usar la URL relativa 'clientes/'
                console.log('Intentando con la ruta básica clientes/...');
                const lastAttemptResponse = await api.get('clientes/', { params });
                console.log('✅ Éxito al buscar clientes en /clientes/:', lastAttemptResponse.data);
                return lastAttemptResponse.data;
              }
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
        // Intentar primero con endpoint core
        try {
          const response = await api.get(`core/clientes/${id}/`);
          console.log(`✅ Detalle de cliente #${id} obtenido exitosamente de core/clientes/`);
          return response.data;
        } catch (coreError) {
          console.warn(`Error al obtener cliente de core/clientes/${id}/`, coreError.message);
          
          // Intentar con pandora endpoint
          try {
            const apiResponse = await api.get(`pandora/clientes/${id}/`);
            console.log(`✅ Detalle de cliente #${id} obtenido exitosamente de pandora/clientes/`);
            return apiResponse.data;
          } catch (apiError) {
            console.warn(`Error al obtener cliente de pandora/clientes/${id}/`, apiError.message);
            
            // Último intento con madvance endpoint
            const madvanceResponse = await api.get(`madvance/clientes/${id}/`);
            console.log(`✅ Detalle de cliente #${id} obtenido exitosamente de madvance/clientes/`);
            return madvanceResponse.data;
          }
        }
      } catch (error) {
        console.error(`❌ Error en todos los intentos al obtener detalle de cliente #${id}:`, error);
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
