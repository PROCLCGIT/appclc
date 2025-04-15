import { useState } from 'react';
import { clientesService } from './classes/CatalogService';
import axios from 'axios';
import api from '@/config/axios';
import { API_BASE_URL } from '@/config/constants';

// Hook personalizado para gestionar clientes
export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todos los clientes - versión simplificada
  const getClientes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Obteniendo clientes de forma simplificada');

      // Usamos una sola fuente de datos confiable - el servicio de catálogo
      const response = await clientesService.getAll({}, {
        _highPriority: true,
        _bypassCache: true
      });
      
      // Procesamos la respuesta para manejar diferentes estructuras potenciales
      const clientesArray = Array.isArray(response) ? response : 
                         (response && response.results ? response.results : []);
      
      console.log('Clientes obtenidos:', clientesArray.length);
      
      // Guardamos en el estado y devolvemos el resultado
      setClientes(clientesArray);
      return clientesArray;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener un cliente por ID
  const getClienteById = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await clientesService.getById(id);
      return response;
    } catch (error) {
      setError(error);
      console.error(`Error al obtener cliente con ID ${id}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clientes,
    isLoading,
    error,
    getClientes,
    getClienteById
  };
};

export default useClientes; 