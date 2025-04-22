/**
 * Base service class for API requests
 * Provides standardized CRUD operations with consistent error handling
 */

import api from '@/config/axios';

export class BaseService {
  /**
   * Creates a new service instance for the specified API endpoint
   * @param {string} endpoint - The API endpoint path (e.g., 'products/items/')
   */
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  /**
   * Fetches all records with optional filtering
   * @param {Object} params - Query parameters for filtering results
   * @param {Object} options - Additional options for the request
   * @returns {Promise<Array>} - The response data array
   */
  async getAll(params = {}, options = {}) {
    try {
      // Extraer opciones especiales para el control de peticiones
      const {
        _disableRetry,
        _bypassCache,
        _bypassConcurrencyCheck,
        _highPriority,
        timeout = 30000, // Default timeout 30s
        ...restOptions
      } = options;
      
      // Preparar configuración para la petición
      const config = {
        params,
        timeout,
        _disableRetry,
        _bypassCache,
        _bypassConcurrencyCheck,
        _highPriority,
        ...restOptions
      };
      
      const response = await api.get(this.endpoint, config);
      
      // Si la respuesta está cacheada, agregamos bandera para informar al consumidor
      if (response.cached) {
        console.log('BaseService: Usando respuesta cacheada para getAll');
      }
      
      return response.data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetches a single record by ID
   * @param {number|string} id - The record ID
   * @param {Object} options - Additional options for the request
   * @returns {Promise<Object>} - The record data
   */
  async getById(id, options = {}) {
    try {
      // Extraer opciones especiales para el control de peticiones
      const {
        _disableRetry,
        _bypassCache,
        _bypassConcurrencyCheck,
        _highPriority,
        timeout = 30000, // Default timeout 30s
        ...restOptions
      } = options;
      
      // Para obtener un elemento específico por ID, hacemos esta solicitud de alta prioridad por defecto
      // ya que normalmente es en respuesta a una acción directa del usuario
      const config = {
        timeout,
        _disableRetry,
        _bypassCache,
        _bypassConcurrencyCheck,
        _highPriority: _highPriority !== undefined ? _highPriority : true,
        ...restOptions
      };
      
      const response = await api.get(`${this.endpoint}${id}/`, config);
      
      // Si la respuesta está cacheada, agregamos bandera para informar al consumidor
      if (response.cached) {
        console.log('BaseService: Usando respuesta cacheada para getById');
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Creates a new record
   * @param {Object} data - The record data
   * @returns {Promise<Object>} - The created record
   */
  async create(data) {
    try {
      const response = await api.post(this.endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Updates an existing record
   * @param {number|string} id - The record ID
   * @param {Object} data - The updated record data
   * @returns {Promise<Object>} - The updated record
   */
  async update(id, data) {
    try {
      const numericId = this.validateId(id);
      const response = await api.put(`${this.endpoint}${numericId}/`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Deletes a record
   * @param {number|string} id - The record ID
   * @returns {Promise<boolean>} - True if deletion was successful
   */
  async delete(id) {
    try {
      const numericId = this.validateId(id);
      await api.delete(`${this.endpoint}${numericId}/`);
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Searches records by a query string
   * @param {string} query - The search query
   * @returns {Promise<Array>} - Matching records
   */
  async search(query) {
    try {
      const response = await api.get(this.endpoint, {
        params: { search: query },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validates and converts an ID to a numeric format
   * @param {number|string} id - The ID to validate
   * @returns {number} - The validated numeric ID
   * @throws {Error} - If ID is invalid
   */
  validateId(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error(`ID inválido: ${id}`);
    }
    return numericId;
  }

  /**
   * Creates a FormData object from an object
   * @param {Object} data - The data object to convert
   * @param {string[]} excludeKeys - Keys to exclude from FormData
   * @returns {FormData} - The FormData object
   */
  createFormData(data, excludeKeys = []) {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (!excludeKeys.includes(key)) {
        formData.append(key, value);
      }
    });
    
    return formData;
  }

  /**
   * Standardized error handler for API requests
   * @param {Error} error - The error object
   * @returns {Object} - Standardized error object
   */
  handleError(error) {
    // Primero, logueamos el error completo para debug
    console.debug('[BaseService] Error completo:', error);
    
    if (error.response) {
      // Log detallado de la respuesta del servidor
      console.debug('[BaseService] Response error data:', error.response.data);
      console.debug('[BaseService] Response error status:', error.response.status);
      
      // Extraer detalles de errores específicos de campo
      const errorDetails = {};
      if (error.response.data && typeof error.response.data === 'object') {
        Object.entries(error.response.data).forEach(([key, value]) => {
          // Omitir propiedades no relacionadas con errores
          if (key !== 'results' && key !== 'count' && value) {
            errorDetails[key] = value;
          }
        });
      }
      
      // Server responded with an error status code
      return {
        status: error.response.status,
        message:
          error.response.data.detail ||
          error.response.data.message ||
          this.getErrorMessage(error.response.status),
        errors: error.response.data,
        errorDetails: errorDetails, // Añadir detalles de error
        originalError: error // Mantener el error original
      };
    } else if (error.request) {
      // Request was made but no response received
      console.debug('[BaseService] Request error:', error.request);
      
      return {
        status: 503,
        message:
          'No se pudo conectar con el servidor. Por favor, verifica tu conexión.',
        originalError: error
      };
    } else {
      // Error during request setup
      return {
        status: 500,
        message: error.message || 'Error al procesar la solicitud.',
        originalError: error
      };
    }
  }

  /**
   * Returns a human-readable error message for HTTP status codes
   * @param {number} status - The HTTP status code
   * @returns {string} - Human-readable error message
   */
  getErrorMessage(status) {
    const errorMessages = {
      400: 'Datos inválidos. Por favor, verifica la información.',
      401: 'No autorizado. Por favor, inicia sesión nuevamente.',
      403: 'No tienes permiso para realizar esta acción.',
      404: 'El recurso solicitado no existe.',
      422: 'No se pudo procesar la solicitud. Verifica los datos.',
      429: 'Demasiadas solicitudes. Por favor, espera un momento.',
      500: 'Error interno del servidor.',
      503: 'Servicio no disponible temporalmente.',
    };
    return errorMessages[status] || 'Ha ocurrido un error inesperado.';
  }
}

export default BaseService;