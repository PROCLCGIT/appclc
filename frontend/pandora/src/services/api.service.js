import axios from 'axios';
import { API_BASE_URL } from '@/config/constants';

/**
 * Clase base para las solicitudes a la API con manejo centralizado de errores
 * y autenticación a través de tokens.
 */
class ApiService {
  /**
   * Constructor
   * @param {string} baseURL - URL base para las solicitudes
   */
  constructor(baseURL = API_BASE_URL) {
    // Crear instancia de axios con configuración base
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para añadir token de autenticación a las solicitudes
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar errores de respuesta
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Extraer información de error para mejor manejo
        const originalRequest = error.config;
        
        // Si es un error 401 (Unauthorized) y no es un retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Intentar refrescar el token
            const refreshToken = localStorage.getItem('refresh-token');
            
            if (refreshToken) {
              const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                refresh: refreshToken
              });
              
              if (refreshResponse.data.access) {
                // Guardar el nuevo token de acceso
                localStorage.setItem('auth-token', refreshResponse.data.access);
                
                // Actualizar el token en la solicitud original
                originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
                
                // Reintentar la solicitud original
                return this.client(originalRequest);
              }
            }
            
            // Si no hay refresh token o falló la renovación, redirigir al login
            if (typeof window !== 'undefined') {
              // Solo en el cliente, no en SSR
              localStorage.removeItem('auth-token');
              localStorage.removeItem('refresh-token');
              
              // Opcional: redirigir al login
              // window.location.href = '/login';
            }
          } catch (refreshError) {
            console.error('Error al refrescar token:', refreshError);
            return Promise.reject(refreshError);
          }
        }
        
        // Formatear mensaje de error para mejor feedback
        let errorMessage = 'Error en la solicitud';
        
        if (error.response) {
          // El servidor respondió con un código de error
          const { status, data } = error.response;
          
          // Mensajes específicos según status code
          switch (status) {
            case 400:
              errorMessage = 'Solicitud incorrecta';
              break;
            case 401:
              errorMessage = 'No autorizado';
              break;
            case 403:
              errorMessage = 'Acceso prohibido';
              break;
            case 404:
              errorMessage = 'Recurso no encontrado';
              break;
            case 500:
              errorMessage = 'Error interno del servidor';
              break;
            default:
              errorMessage = `Error (${status})`;
          }
          
          // Añadir detalles del mensaje de error si están disponibles
          if (data) {
            if (typeof data === 'string') {
              errorMessage = data;
            } else if (data.detail) {
              errorMessage = data.detail;
            } else if (data.message) {
              errorMessage = data.message;
            } else if (data.error) {
              errorMessage = data.error;
            } else if (typeof data === 'object') {
              // Combinar mensajes de error de campos específicos
              const fieldErrors = [];
              Object.entries(data).forEach(([field, messages]) => {
                if (Array.isArray(messages)) {
                  fieldErrors.push(`${field}: ${messages.join(', ')}`);
                } else if (typeof messages === 'string') {
                  fieldErrors.push(`${field}: ${messages}`);
                }
              });
              
              if (fieldErrors.length > 0) {
                errorMessage = fieldErrors.join('; ');
              }
            }
          }
        } else if (error.request) {
          // La solicitud se realizó pero no se recibió respuesta
          errorMessage = 'No se recibió respuesta del servidor';
        } else {
          // Error al configurar la solicitud
          errorMessage = error.message || 'Error al realizar la solicitud';
        }
        
        // Crear un error enriquecido con más información
        const enhancedError = new Error(errorMessage);
        enhancedError.status = error.response?.status;
        enhancedError.originalError = error;
        enhancedError.data = error.response?.data;
        
        return Promise.reject(enhancedError);
      }
    );
  }

  /**
   * Realizar una solicitud GET
   * @param {string} url - URL relativa
   * @param {Object} params - Parámetros de consulta
   * @param {Object} config - Configuración adicional de axios
   * @returns {Promise} Promesa con la respuesta
   */
  async get(url, params = {}, config = {}) {
    try {
      const response = await this.client.get(url, { 
        params, 
        ...config 
      });
      return response.data;
    } catch (error) {
      console.error(`GET ${url} error:`, error);
      throw error;
    }
  }

  /**
   * Realizar una solicitud POST
   * @param {string} url - URL relativa
   * @param {Object} data - Datos a enviar
   * @param {Object} config - Configuración adicional de axios
   * @returns {Promise} Promesa con la respuesta
   */
  async post(url, data = {}, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`POST ${url} error:`, error);
      throw error;
    }
  }

  /**
   * Realizar una solicitud PUT
   * @param {string} url - URL relativa
   * @param {Object} data - Datos a enviar
   * @param {Object} config - Configuración adicional de axios
   * @returns {Promise} Promesa con la respuesta
   */
  async put(url, data = {}, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`PUT ${url} error:`, error);
      throw error;
    }
  }

  /**
   * Realizar una solicitud PATCH
   * @param {string} url - URL relativa
   * @param {Object} data - Datos a enviar
   * @param {Object} config - Configuración adicional de axios
   * @returns {Promise} Promesa con la respuesta
   */
  async patch(url, data = {}, config = {}) {
    try {
      const response = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`PATCH ${url} error:`, error);
      throw error;
    }
  }

  /**
   * Realizar una solicitud DELETE
   * @param {string} url - URL relativa
   * @param {Object} config - Configuración adicional de axios
   * @returns {Promise} Promesa con la respuesta
   */
  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${url} error:`, error);
      throw error;
    }
  }
  
  /**
   * Realizar una solicitud con FormData (para archivos)
   * @param {string} url - URL relativa
   * @param {FormData} formData - Datos de formulario
   * @param {string} method - Método HTTP (default: POST)
   * @param {Object} config - Configuración adicional de axios
   * @returns {Promise} Promesa con la respuesta
   */
  async uploadFile(url, formData, method = 'POST', config = {}) {
    try {
      const response = await this.client({
        url,
        method,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        ...config
      });
      return response.data;
    } catch (error) {
      console.error(`${method} ${url} (file upload) error:`, error);
      throw error;
    }
  }
}

export default ApiService;