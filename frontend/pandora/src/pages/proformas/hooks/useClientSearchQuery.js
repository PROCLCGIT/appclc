// src/pages/proformas/hooks/useClientSearchQuery.js

import { useState, useEffect, useCallback, useRef } from "react";
import { useClientesQuery } from "@/hooks/queries/useClientesQuery";
import { useNotifications } from "./useNotifications";
import { useErrorHandler } from "./useErrorHandler";

/**
 * Hook optimizado para búsqueda de clientes utilizando React Query
 */
export default function useClientSearchQuery() {
  const notify = useNotifications();
  const errorHandler = useErrorHandler();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  // Referencia para cancelar búsquedas pendientes
  const searchCounter = useRef(0);
  
  // Utilizar el hook de React Query para clientes
  const {
    // Usamos solo searchClientes del hook, no necesitamos los otros valores
    searchClientes,
  } = useClientesQuery({
    enabled: false, // No cargar automáticamente todos los clientes
    showErrors: false, // Manejaremos los errores aquí
  });

  // IMPORTANTE: Definir performSearch ANTES de los useEffect que lo utilizan
  // Función para realizar la búsqueda
  const performSearch = useCallback(
    async (term) => {
      if (!term || term.length < 2) {
        return;
      }

      setLoadingClientes(true);
      const currentSearch = ++searchCounter.current;

      try {
        const results = await searchClientes(term);
        
        // Solo actualizar si esta es la búsqueda más reciente
        if (currentSearch === searchCounter.current) {
          setClientes(results || []);
        }
      } catch (error) {
        if (currentSearch === searchCounter.current) {
          errorHandler.handleError(error, 'buscar clientes');
          notify.error("Error al buscar clientes");
          setClientes([]);
        }
      } finally {
        if (currentSearch === searchCounter.current) {
          setLoadingClientes(false);
          setIsSearching(false);
        }
      }
    },
    [searchClientes, errorHandler, notify]
  );

  // Efecto para el debounce de la búsqueda
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm && searchTerm.length >= 2) {
        setDebouncedSearchTerm(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Efecto para ejecutar la búsqueda cuando cambia el término de búsqueda con debounce
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, performSearch]);

  // Función para iniciar una búsqueda manual
  const searchCliente = useCallback(
    async (term) => {
      if (!term || term.length < 2) {
        notify.warning("Ingrese al menos 2 caracteres para buscar");
        return [];
      }

      setSearchTerm(term);
      setIsSearching(true);
      
      try {
        setLoadingClientes(true);
        // Usamos timestamp para seguimiento de la petición (no usado como variable)
        const results = await searchClientes(term);
        setClientes(results || []);
        return results || [];
      } catch (error) {
        errorHandler.handleError(error, 'buscar clientes');
        setClientes([]);
        return [];
      } finally {
        setLoadingClientes(false);
        setIsSearching(false);
      }
    },
    [searchClientes, notify, errorHandler]
  );

  // Cargar clientes iniciales (por ejemplo, los más recientes)
  const loadClientes = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoadingClientes(true);
        console.log('Iniciando carga de clientes... forceRefresh:', forceRefresh);
        
        // Si es una recarga forzada, invalidamos la caché de React Query
        if (forceRefresh) {
          console.log('Forzando recarga de clientes (bypass cache)');
          try {
            // Importar de forma dinámica para evitar dependencias circulares
            try {
              // Importar y usar QueryClient directamente sin usar useQueryClient hook
              const { QueryClient } = await import('@tanstack/react-query');
              const { clienteKeys } = await import('@/hooks/queries/useClientesQuery');
              
              // Crear instancia directa del cliente
              const queryClient = new QueryClient();
              
              // Invalidar todas las consultas de clientes
              await queryClient.invalidateQueries({ queryKey: clienteKeys.lists() });
              console.log('Cache de clientes invalidada correctamente');
            } catch (queryError) {
              console.error('Error al invalidar caché de React Query:', queryError);
            }
          } catch (importError) {
            console.error('Error al importar módulos de React Query:', importError);
            // Continuar con el resto del código aunque falle la invalidación de caché
          }
        }
        
        // Acceder al API una sola vez
        const apiModule = await import('@/config/axios');
        const api = apiModule.default;
        
        // Crear un array con todas las rutas posibles a intentar
        // Sin incluir /api/ ya que la instancia de axios ya tiene ese prefijo
        const endpoints = [
          'core/clientes/',
          'clientes/',
          'madvance/clientes/',
          'pandora/clientes/'
        ];
        
        console.log('🔍 Probando diferentes endpoints para clientes con baseURL:', api.defaults.baseURL);
        
        // Configuración de solicitud unificada
        const requestConfig = {
          params: { limit: 100, ordering: '-created_at' },
          _bypassCache: forceRefresh, // Solo bypass si es recarga forzada
          _highPriority: true,
          timeout: 10000 // 10 segundos para evitar esperas largas
        };
        
        let successfulResponse = null;
        let lastError = null;
        
        // Intentar cada endpoint secuencialmente hasta encontrar uno que funcione
        for (const endpoint of endpoints) {
          try {
            console.log(`🔍 Intentando cargar clientes desde: ${endpoint}`);
            const response = await api.get(endpoint, requestConfig);
            
            // Validar la respuesta
            const data = response?.data;
            const results = data?.results || data || [];
            
            if (Array.isArray(results) && results.length > 0) {
              console.log(`✅ Éxito con ${endpoint}: ${results.length} clientes cargados`);
              successfulResponse = {
                endpoint,
                results
              };
              break; // Salir del bucle al encontrar un endpoint funcional
            } else {
              console.warn(`⚠️ Endpoint ${endpoint} respondió, pero sin datos válidos:`, results);
            }
          } catch (endpointError) {
            lastError = endpointError;
            console.warn(`❌ Error con ${endpoint}:`, endpointError.message);
          }
        }
        
        // Si encontramos un endpoint que funcionó, usamos esos datos
        if (successfulResponse) {
          console.log(`Usando datos de ${successfulResponse.endpoint}`, successfulResponse.results);
          setClientes(successfulResponse.results);
          return successfulResponse.results;
        }
        
        // Si llegamos aquí, ningún endpoint funcionó. Intentamos llamar a searchClientes como último recurso
        try {
          console.log('Ningún endpoint directo funcionó. Intentando searchClientes como último recurso...');
          const searchResults = await searchClientes("");
          
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            console.log('✅ searchClientes exitoso:', searchResults.length, 'resultados');
            setClientes(searchResults);
            return searchResults;
          } else {
            console.error('searchClientes tampoco devolvió resultados válidos');
            throw new Error('No se pudieron obtener clientes de ninguna fuente');
          }
        } catch (searchError) {
          console.error('Error en último intento con searchClientes:', searchError);
          
          // Reintentamos si es el primer intento y no es un refresco forzado
          if (!forceRefresh) {
            console.log('Reintentando con forceRefresh...');
            return loadClientes(true);
          }
          
          throw lastError || searchError;
        }
      } catch (error) {
        console.error('Error al cargar clientes:', error);
        errorHandler.handleError(error, 'cargar clientes');
        // Establecer un array vacío para evitar errores de renderizado
        setClientes([]);
        return [];
      } finally {
        setLoadingClientes(false);
      }
    },
    [searchClientes, errorHandler]
  );

  // Función para verificar la autenticación y conexión
  const checkAuthAndConnection = useCallback(async () => {
    try {
      console.log('🔍 Verificando autenticación y conexión...');
      
      // Obtenemos la instancia de API
      const { default: api } = await import('@/config/axios');
      
      // 1. Verificar si hay token en localStorage
      const token = localStorage.getItem('auth-token');
      console.log('Token en localStorage:', token ? `${token.substring(0, 10)}... (${token.length} chars)` : 'No hay token');
      
      // 2. Verificar conexión general con un endpoint sencillo que sabemos que existe
      try {
        const testResponse = await api.get('auth/users/', {
          _bypassCache: true,
          _highPriority: true,
          timeout: 5000
        });
        console.log('✅ Conexión básica exitosa:', testResponse.status, testResponse.data);
      } catch (connError) {
        console.error('❌ Error en conexión básica:', connError.message);
        // Intentar con otro endpoint como fallback
        try {
          const altResponse = await api.get('admin/', {
            _bypassCache: true,
            _highPriority: true,
            timeout: 5000
          });
          console.log('✅ Conexión alternativa exitosa:', altResponse.status);
        } catch (altError) {
          console.error('❌ Error en conexión alternativa:', altError.message);
        }
      }
      
      // 3. Probar endpoints específicos para clientes con diferentes rutas
      const routesToTry = [
        'core/clientes/',
        'clientes/',
        'madvance/clientes/',
        'pandora/clientes/'
      ];
      
      for (const route of routesToTry) {
        try {
          console.log(`🔍 Probando ruta ${route}...`);
          const response = await api.get(route, { 
            params: { limit: 5 },
            _bypassCache: true,
            _highPriority: true,
            timeout: 5000
          });
          console.log(`✅ Éxito en ruta ${route}:`, response.status, response.data);
          
          // Análisis de respuesta
          if (response.data) {
            if (Array.isArray(response.data)) {
              console.log(`  📊 Respuesta es un array con ${response.data.length} elementos`);
            } else if (response.data.results && Array.isArray(response.data.results)) {
              console.log(`  📊 Respuesta tiene array 'results' con ${response.data.results.length} elementos`);
            } else {
              console.log(`  📊 Respuesta es un objeto:`, Object.keys(response.data));
            }
          }
        } catch (routeError) {
          console.error(`❌ Error en ruta ${route}:`, routeError.message);
        }
      }
      
    } catch (error) {
      console.error('Error en verificación de autenticación:', error);
    }
  }, []);

  // Efecto para cargar clientes iniciales
  useEffect(() => {
    // Cargar clientes inmediatamente al montar el componente
    console.log('Iniciando carga de clientes iniciales...');
    
    // Primero realizamos una verificación para diagnosticar problemas
    checkAuthAndConnection()
      .then(() => {
        // Luego intentamos cargar los clientes
        return loadClientes(true);
      })
      .catch(err => {
        console.error('Error al cargar clientes iniciales:', err);
      });
  }, [checkAuthAndConnection, loadClientes]); // Incluir las dependencias correctas

  return {
    clientes,
    loadingClientes,
    isSearching,
    searchTerm,
    setSearchTerm,
    searchCliente,
    loadClientes,
  };
}