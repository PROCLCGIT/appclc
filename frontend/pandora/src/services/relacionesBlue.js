import { useState } from 'react';
import axios from 'axios';
import api from '@/config/axios';
import { API_BASE_URL, API_PATHS } from '@/config/constants';

// Configuración para las solicitudes
const axiosConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Hook personalizado para gestionar las relaciones blue
export const useRelacionesBlue = () => {
  const [relaciones, setRelaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // URL base para las API de pandora (probaremos diferentes variantes)
  const baseUrls = [
    // First try with relative paths that will work with axios instance's baseURL
    'pandora/relacionesblue',
    'v1/pandora/relacionesblue',
    'pandora',
    '',
    // Then try with full paths as fallback
    `${API_BASE_URL}/pandora/relacionesblue`,
    `${API_BASE_URL}/pandora`,
    API_BASE_URL
  ];

  // Obtener todas las relaciones - versión simplificada
  const getRelaciones = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Obteniendo relaciones de forma simplificada');
      
      // Usamos una sola ruta confiable para obtener las relaciones
      const endpoint = 'pandora/relacionesblue/';
      const response = await api.get(endpoint, {
        _highPriority: true,
        _bypassCache: true
      });
      
      console.log('RESPUESTA RELACIONESBLUE RAW:', response);
      console.log('RESPUESTA RELACIONESBLUE DATA:', JSON.stringify(response.data, null, 2).slice(0, 500));
      
      // Procesamos la respuesta de forma consistente
      let relacionesArray = [];
      
      if (Array.isArray(response.data)) {
        relacionesArray = response.data;
        console.log('Los datos son un array directamente');
      } else if (response.data && typeof response.data === 'object') {
        console.log('Los datos son un objeto. Claves:', Object.keys(response.data));
        
        // Priorizar campos comunes para datos paginados
        if (response.data.results && Array.isArray(response.data.results)) {
          relacionesArray = response.data.results;
          console.log('Usando results como fuente de datos');
        } else if (response.data.data && Array.isArray(response.data.data)) {
          relacionesArray = response.data.data;
          console.log('Usando data como fuente de datos');
        } else if (response.data.relaciones && Array.isArray(response.data.relaciones)) {
          relacionesArray = response.data.relaciones;
          console.log('Usando relaciones como fuente de datos');
        } else {
          // Último recurso: convertir el objeto a array si tiene valores
          const values = Object.values(response.data);
          if (values.length > 0 && typeof values[0] === 'object') {
            relacionesArray = values;
            console.log('Convirtiendo objeto a array de valores');
          }
        }
      }
      
      // Revisar la estructura para entender el problema
      if (relacionesArray.length > 0) {
        console.log('PRIMERA RELACIÓN ESTRUCTURA:', JSON.stringify(relacionesArray[0], null, 2));
        
        // Verificar específicamente los campos cliente y contacto
        const clienteField = relacionesArray[0].cliente;
        const contactoField = relacionesArray[0].contacto;
        
        console.log('CAMPO CLIENTE:', typeof clienteField, clienteField);
        console.log('CAMPO CONTACTO:', typeof contactoField, contactoField);
        
        // Si son IDs en lugar de objetos, necesitamos convertirlos
        if (typeof clienteField === 'number' || (typeof clienteField === 'string' && !isNaN(clienteField))) {
          console.log('ADVERTENCIA: Los campos cliente/contacto parecen ser IDs, no objetos completos');
        }
      }
      
      console.log('Relaciones obtenidas:', relacionesArray.length);
      
      // Guardamos en el estado y devolvemos el resultado
      setRelaciones(relacionesArray);
      return relacionesArray;
    } catch (error) {
      console.error('Error al obtener relaciones:', error);
      
      // Manejo de error específico para dar información útil
      const errorMessage = error.response?.data?.detail || 
                          error.response?.statusText || 
                          error.message || 
                          'Error desconocido al cargar relaciones';
      
      setError({
        message: errorMessage,
        originalError: error
      });
      
      // Devolver array vacío en caso de error
      setRelaciones([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener relaciones por cliente
  const getRelacionesPorCliente = async (clienteId) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use our configured api instance instead of direct axios to benefit from interceptors and error handling
      const response = await api.get(`pandora${API_PATHS.RELACIONES_BLUE}`, {
        params: { cliente: clienteId },
        _highPriority: true
      });
      // Aseguramos que la respuesta sea un array
      return Array.isArray(response.data) ? response.data : 
             (response.data && response.data.results ? response.data.results : []);
    } catch (error) {
      setError(error);
      console.error('Error al obtener relaciones por cliente:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener relaciones por contacto
  const getRelacionesPorContacto = async (contactoId) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use our configured api instance instead of direct axios to benefit from interceptors and error handling
      const response = await api.get(`pandora${API_PATHS.RELACIONES_BLUE}`, {
        params: { contacto: contactoId },
        _highPriority: true
      });
      // Aseguramos que la respuesta sea un array
      return Array.isArray(response.data) ? response.data : 
             (response.data && response.data.results ? response.data.results : []);
    } catch (error) {
      setError(error);
      console.error('Error al obtener relaciones por contacto:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Crear una nueva relación
  const createRelacion = async (relacionData) => {
    setIsLoading(true);
    setError(null);
    
    // Almacenar errores para diagnóstico
    const errors = [];
    
    // Intenta usando la instancia configurada de axios 
    try {
      console.log('Intentando crear relación con api configurada');
      const endpoint = 'pandora/relacionesblue/';
      console.log('Datos enviados:', relacionData);
      const response = await api.post(endpoint, relacionData);
      console.log('Respuesta con api configurada:', response);
      
      // Actualizar el estado después de crear
      await getRelaciones();
      setIsLoading(false);
      return response.data;
    } catch (apiError) {
      console.warn('Error al usar api configurada para crear:', apiError);
      errors.push({
        method: 'api configurada',
        error: apiError.message,
        response: apiError.response?.data
      });
    }
    
    // Probar con diferentes URLs
    for (const baseUrl of baseUrls) {
      try {
        const fullUrl = `${baseUrl}${API_PATHS.RELACIONES_BLUE}/`;
        console.log('Intentando crear relación en:', fullUrl);
        console.log('Datos enviados:', relacionData);
        
        const response = await axios.post(fullUrl, relacionData, axiosConfig);
        console.log('Respuesta de creación:', response);
        
        // Actualizar el estado después de crear
        await getRelaciones();
        setIsLoading(false);
        return response.data;
      } catch (err) {
        const errorMsg = {
          url: `${baseUrl}${API_PATHS.RELACIONES_BLUE}/`,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message
        };
        console.error('Error al intentar crear en URL:', errorMsg);
        errors.push(errorMsg);
        // Continuamos con la siguiente URL
      }
    }
    
    // Si llegamos aquí, ninguna URL funcionó
    console.error('Todos los intentos de creación fallaron:', errors);
    setError({message: 'No se pudo crear la relación en ningún endpoint', details: errors});
    setIsLoading(false);
    return null;
  };

  // Actualizar una relación existente
  const updateRelacion = async (id, relacionData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use our configured api instance instead of direct axios
      const response = await api.put(`pandora${API_PATHS.RELACIONES_BLUE}/${id}/`, relacionData);
      // Actualizar el estado después de editar
      await getRelaciones();
      return response.data;
    } catch (error) {
      setError(error);
      console.error('Error al actualizar relación:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar una relación
  const deleteRelacion = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use our configured api instance instead of direct axios
      await api.delete(`pandora${API_PATHS.RELACIONES_BLUE}/${id}/`);
      // Actualizar el estado después de eliminar
      await getRelaciones();
      return true;
    } catch (error) {
      setError(error);
      console.error('Error al eliminar relación:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    relaciones,
    isLoading,
    error,
    getRelaciones,
    getRelacionesPorCliente,
    getRelacionesPorContacto,
    createRelacion,
    updateRelacion,
    deleteRelacion
  };
};

// Exportar el hook como predeterminado
export default useRelacionesBlue; 