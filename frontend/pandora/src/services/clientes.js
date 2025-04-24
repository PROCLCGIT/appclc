import { useState } from 'react';
import { clientesService } from './classes/CatalogService';
import api from '@/config/axios';
import { API_BASE_URL } from '@/config/constants';
import { toast } from 'sonner';

// Lista de endpoints de clientes para intentar en orden
const CLIENT_ENDPOINTS = [
  'core/clientes/',
  'pandora/clientes/',
  'madvance/clientes/',
  'clientes/'
];

// Hook personalizado para gestionar clientes
export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todos los clientes - versión mejorada
  const getClientes = async (params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Obteniendo clientes con parámetros:', params);

      // Configuración optimizada para la solicitud
      const config = {
        _highPriority: true,
        _bypassCache: true,
        timeout: 15000 // 15 segundos
      };
      
      // Intento con el servicio de catálogo usando el API oficial
      const response = await clientesService.getAll(params, config);
      
      // Procesamos la respuesta para manejar diferentes estructuras potenciales
      const clientesArray = Array.isArray(response) ? response : 
                         (response?.results ? response.results : []);
      
      console.log('Clientes obtenidos:', clientesArray.length);
      
      // Guardamos en el estado y devolvemos el resultado
      setClientes(clientesArray);
      return clientesArray;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      
      // Intentar obtener clientes directamente de otros endpoints como fallback
      try {
        console.log('Intentando obtener clientes de endpoints alternativos...');
        
        // Intentar cada endpoint en secuencia hasta que uno funcione
        for (const endpoint of CLIENT_ENDPOINTS) {
          try {
            console.log(`Intentando obtener clientes de ${endpoint}`);
            const response = await api.get(endpoint, { 
              params,
              timeout: 15000 
            });
            
            const clientesArray = Array.isArray(response.data) ? response.data : 
                               (response.data?.results ? response.data.results : []);
            
            console.log(`✅ Éxito obteniendo ${clientesArray.length} clientes de ${endpoint}`);
            
            // Guardar en el estado y devolver el resultado
            setClientes(clientesArray);
            return clientesArray;
          } catch (endpointError) {
            console.warn(`Error al obtener clientes de ${endpoint}:`, endpointError.message);
          }
        }
        
        // Si llega aquí, ningún endpoint funcionó
        throw new Error('No se pudo obtener clientes de ningún endpoint');
      } catch (fallbackError) {
        console.error('Error en todos los endpoints:', fallbackError);
        
        // Manejo de error específico para dar información útil
        const errorMessage = error.response?.data?.detail || 
                          error.response?.statusText || 
                          error.message || 
                          'Error desconocido al cargar clientes';
        
        setError({
          message: errorMessage,
          originalError: error
        });
        
        // Devolver array vacío en caso de error
        setClientes([]);
        return [];
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener un cliente por ID - versión mejorada
  const getClienteById = async (id) => {
    if (!id) {
      console.error('ID de cliente no proporcionado');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Obteniendo cliente con ID ${id}`);
      const response = await clientesService.getById(id);
      return response;
    } catch (error) {
      console.error(`Error al obtener cliente con ID ${id}:`, error);
      
      // Intentar endpoints alternativos
      try {
        for (const endpoint of CLIENT_ENDPOINTS) {
          try {
            console.log(`Intentando obtener cliente #${id} de ${endpoint}`);
            const response = await api.get(`${endpoint}${id}/`);
            console.log(`✅ Éxito obteniendo cliente #${id} de ${endpoint}`);
            return response.data;
          } catch (endpointError) {
            console.warn(`Error al obtener cliente #${id} de ${endpoint}:`, endpointError.message);
          }
        }
        throw new Error(`No se pudo obtener el cliente #${id} de ningún endpoint`);
      } catch (fallbackError) {
        setError(fallbackError);
        throw fallbackError;
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Crear un nuevo cliente - implementación mejorada
  const createCliente = async (clienteData) => {
    if (!clienteData) {
      throw new Error('No se proporcionaron datos de cliente');
    }
    
    setIsLoading(true);
    setError(null);
    
    // Asegurar que los IDs numéricos estén en formato correcto
    const formattedData = {
      ...clienteData,
      tipo_cliente: clienteData.tipo_cliente ? Number(clienteData.tipo_cliente) : null,
      zona: clienteData.zona ? Number(clienteData.zona) : null,
      ciudad: clienteData.ciudad ? Number(clienteData.ciudad) : null,
    };
    
    console.log('Datos de cliente a crear:', formattedData);
    
    try {
      // Intentar crear cliente con el servicio oficial primero
      const response = await clientesService.create(formattedData);
      console.log('✅ Cliente creado exitosamente:', response);
      toast.success('Cliente creado exitosamente');
      return response;
    } catch (error) {
      console.error('❌ Error al crear cliente con servicio oficial:', error);
      
      // Intentar endpoints alternativos
      try {
        console.log('Intentando endpoints alternativos para crear cliente...');
        
        // Configuración específica para operaciones de escritura
        const config = {
          timeout: 30000, // 30 segundos para operaciones de escritura
          headers: {
            'Content-Type': 'application/json'
          }
        };
        
        for (const endpoint of CLIENT_ENDPOINTS) {
          try {
            console.log(`Intentando crear cliente en ${endpoint}`);
            const response = await api.post(endpoint, formattedData, config);
            console.log(`✅ Cliente creado exitosamente en ${endpoint}:`, response.data);
            toast.success('Cliente creado exitosamente');
            return response.data;
          } catch (endpointError) {
            console.warn(`Error al crear cliente en ${endpoint}:`, endpointError.message);
            console.log('Detalles del error:', endpointError.response?.data || endpointError);
          }
        }
        
        // Si llega aquí, ningún endpoint funcionó
        throw new Error('No se pudo crear el cliente en ningún endpoint');
      } catch (fallbackError) {
        console.error('❌ Error en todos los intentos al crear cliente:', fallbackError);
        
        // Extraer mensaje de error más específico si es posible
        let errorMessage = 'No se pudo crear el cliente';
        
        if (error.response?.data) {
          const errorData = error.response.data;
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        }
        
        setError(new Error(errorMessage));
        toast.error(errorMessage);
        throw fallbackError;
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Actualizar un cliente existente
  const updateCliente = async (id, clienteData) => {
    if (!id || !clienteData) {
      throw new Error('ID de cliente o datos no proporcionados');
    }
    
    setIsLoading(true);
    setError(null);
    
    // Asegurar que los IDs numéricos estén en formato correcto
    const formattedData = {
      ...clienteData,
      tipo_cliente: clienteData.tipo_cliente ? Number(clienteData.tipo_cliente) : null,
      zona: clienteData.zona ? Number(clienteData.zona) : null,
      ciudad: clienteData.ciudad ? Number(clienteData.ciudad) : null,
    };
    
    try {
      // Intentar actualizar con el servicio oficial
      const response = await clientesService.update(id, formattedData);
      console.log(`✅ Cliente #${id} actualizado exitosamente:`, response);
      toast.success('Cliente actualizado exitosamente');
      return response;
    } catch (error) {
      console.error(`❌ Error al actualizar cliente #${id}:`, error);
      
      // Intentar endpoints alternativos
      try {
        for (const endpoint of CLIENT_ENDPOINTS) {
          try {
            console.log(`Intentando actualizar cliente #${id} en ${endpoint}`);
            const response = await api.put(`${endpoint}${id}/`, formattedData);
            console.log(`✅ Cliente #${id} actualizado exitosamente en ${endpoint}`);
            toast.success('Cliente actualizado exitosamente');
            return response.data;
          } catch (endpointError) {
            console.warn(`Error al actualizar cliente #${id} en ${endpoint}:`, endpointError.message);
          }
        }
        throw new Error(`No se pudo actualizar el cliente #${id} en ningún endpoint`);
      } catch (fallbackError) {
        setError(fallbackError);
        toast.error('No se pudo actualizar el cliente');
        throw fallbackError;
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Eliminar un cliente
  const deleteCliente = async (id) => {
    if (!id) {
      throw new Error('ID de cliente no proporcionado');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Intentar eliminar con el servicio oficial
      await clientesService.delete(id);
      console.log(`✅ Cliente #${id} eliminado exitosamente`);
      toast.success('Cliente eliminado exitosamente');
      return true;
    } catch (error) {
      console.error(`❌ Error al eliminar cliente #${id}:`, error);
      
      // Intentar endpoints alternativos
      try {
        for (const endpoint of CLIENT_ENDPOINTS) {
          try {
            console.log(`Intentando eliminar cliente #${id} en ${endpoint}`);
            await api.delete(`${endpoint}${id}/`);
            console.log(`✅ Cliente #${id} eliminado exitosamente en ${endpoint}`);
            toast.success('Cliente eliminado exitosamente');
            return true;
          } catch (endpointError) {
            console.warn(`Error al eliminar cliente #${id} en ${endpoint}:`, endpointError.message);
          }
        }
        throw new Error(`No se pudo eliminar el cliente #${id} en ningún endpoint`);
      } catch (fallbackError) {
        setError(fallbackError);
        toast.error('No se pudo eliminar el cliente');
        throw fallbackError;
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Buscar clientes
  const searchClientes = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      console.log('Término de búsqueda demasiado corto, no se realizará la búsqueda');
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Buscando clientes con término: "${searchTerm}"`);
      
      // Primero intentar con el servicio oficial
      const response = await clientesService.getAll({ search: searchTerm });
      
      const clientesArray = Array.isArray(response) ? response : 
                         (response?.results ? response.results : []);
      
      console.log(`✅ Se encontraron ${clientesArray.length} clientes para búsqueda "${searchTerm}"`);
      return clientesArray;
    } catch (error) {
      console.error(`Error al buscar clientes con término "${searchTerm}":`, error);
      
      // Intentar endpoints alternativos
      try {
        for (const endpoint of CLIENT_ENDPOINTS) {
          try {
            console.log(`Intentando buscar clientes en ${endpoint} con término "${searchTerm}"`);
            const response = await api.get(endpoint, { 
              params: { search: searchTerm },
              timeout: 15000
            });
            
            const clientesArray = Array.isArray(response.data) ? response.data : 
                               (response.data?.results ? response.data.results : []);
            
            console.log(`✅ Se encontraron ${clientesArray.length} clientes en ${endpoint} para búsqueda "${searchTerm}"`);
            return clientesArray;
          } catch (endpointError) {
            console.warn(`Error al buscar clientes en ${endpoint}:`, endpointError.message);
          }
        }
        
        // Si no encontramos nada, devolver array vacío
        console.log(`⚠️ No se encontraron clientes para búsqueda "${searchTerm}" en ningún endpoint`);
        return [];
      } catch (fallbackError) {
        console.error('Error en todos los endpoints durante búsqueda:', fallbackError);
        return [];
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clientes,
    isLoading,
    error,
    getClientes,
    getClienteById,
    createCliente,     // Nuevo método para crear clientes
    updateCliente,     // Nuevo método para actualizar clientes
    deleteCliente,     // Nuevo método para eliminar clientes
    searchClientes     // Nuevo método para buscar clientes
  };
};

// Funciones individuales para uso sin estado local
// Estas funciones se pueden usar directamente sin el hook

/**
 * Crear un nuevo cliente (función independiente)
 * @param {Object} clienteData - Datos del cliente a crear
 * @returns {Promise<Object>} - Cliente creado
 */
export async function createCliente(clienteData) {
  if (!clienteData) {
    throw new Error('No se proporcionaron datos de cliente');
  }
  
  // Asegurar que los IDs numéricos estén en formato correcto
  const formattedData = {
    ...clienteData,
    tipo_cliente: clienteData.tipo_cliente ? Number(clienteData.tipo_cliente) : null,
    zona: clienteData.zona ? Number(clienteData.zona) : null,
    ciudad: clienteData.ciudad ? Number(clienteData.ciudad) : null,
  };
  
  console.log('Datos de cliente a crear (función independiente):', formattedData);
  
  try {
    // Intentar crear cliente con el servicio oficial primero
    const response = await clientesService.create(formattedData);
    console.log('✅ Cliente creado exitosamente:', response);
    toast.success('Cliente creado exitosamente');
    return response;
  } catch (error) {
    console.error('❌ Error al crear cliente con servicio oficial:', error);
    
    // Intentar endpoints alternativos
    const config = {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    for (const endpoint of CLIENT_ENDPOINTS) {
      try {
        console.log(`Intentando crear cliente en ${endpoint}`);
        const response = await api.post(endpoint, formattedData, config);
        console.log(`✅ Cliente creado exitosamente en ${endpoint}:`, response.data);
        toast.success('Cliente creado exitosamente');
        return response.data;
      } catch (endpointError) {
        console.warn(`Error al crear cliente en ${endpoint}:`, endpointError.message);
        console.log('Detalles del error:', endpointError.response?.data || endpointError);
      }
    }
    
    // Si llega aquí, ningún endpoint funcionó
    let errorMessage = 'No se pudo crear el cliente';
    
    if (error.response?.data) {
      const errorData = error.response.data;
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    }
    
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
}

export default useClientes;