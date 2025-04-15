import { useState } from 'react';
import { contactosService } from './classes/CatalogService';
import axios from 'axios';
import { API_BASE_URL } from '@/config/constants';

// Hook personalizado para gestionar contactos
export const useContactos = () => {
  const [contactos, setContactos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todos los contactos - versión simplificada
  const getContactos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Obteniendo contactos de forma simplificada');
      
      // Usamos una sola fuente de datos confiable - el servicio de catálogo
      const response = await contactosService.getAll({}, {
        _highPriority: true,
        _bypassCache: true
      });
      
      // Procesamos la respuesta para manejar diferentes estructuras potenciales
      const contactosArray = Array.isArray(response) ? response : 
                         (response && response.results ? response.results : []);
      
      console.log('Contactos obtenidos:', contactosArray.length);
      
      // Guardamos en el estado y devolvemos el resultado
      setContactos(contactosArray);
      return contactosArray;
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      
      // Manejo de error específico para dar información útil
      const errorMessage = error.response?.data?.detail || 
                          error.response?.statusText || 
                          error.message || 
                          'Error desconocido al cargar contactos';
      
      setError({
        message: errorMessage,
        originalError: error
      });
      
      // Devolver array vacío en caso de error
      setContactos([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener un contacto por ID
  const getContactoById = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await contactosService.getById(id);
      return response;
    } catch (error) {
      setError(error);
      console.error(`Error al obtener contacto con ID ${id}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    contactos,
    isLoading,
    error,
    getContactos,
    getContactoById
  };
};

export default useContactos; 