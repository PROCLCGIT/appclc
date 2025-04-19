import { BaseService } from './BaseService';
import api from '@/config/axios';
import { API_BASE_URL } from '@/config/constants';

// Crear un mapa para controlar los tiempos entre solicitudes (throttling)
const requestTimestamps = new Map();
const MIN_REQUEST_INTERVAL = 2000; // 2 segundos entre solicitudes del mismo tipo
const BACKOFF_MULTIPLIER = 2; // Multiplicador para backoff exponencial
const MAX_INTERVAL = 30000; // Máximo 30 segundos entre reintentos

// Función para el throttling de solicitudes
const throttleRequest = async (key) => {
  const now = Date.now();
  const lastRequest = requestTimestamps.get(key) || 0;
  const timeSinceLastRequest = now - lastRequest;
  
  // Si la petición es demasiado reciente, esperar
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    // Calcular tiempo de espera con backoff exponencial si hay errores recientes
    const errorCount = localStorage.getItem(`${key}_error_count`) || 0;
    const waitTime = Math.min(
      MIN_REQUEST_INTERVAL * Math.pow(BACKOFF_MULTIPLIER, errorCount),
      MAX_INTERVAL
    );
    
    console.log(`Throttling request to ${key}. Waiting ${waitTime}ms...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Actualizar el timestamp para esta solicitud
  requestTimestamps.set(key, Date.now());
};

/**
 * Servicio para interactuar con la API de gestión documental
 */
class DocumentService extends BaseService {
  constructor() {
    // Quitamos el prefijo /api/v1/ porque ya está en la configuración de axios
    super('/docmanager');
  }

  /**
   * Obtener lista de documentos
   * @param {Object} params - Parámetros de filtrado, búsqueda y ordenamiento
   * @returns {Promise<Object>} - Documentos y metadata de paginación
   */
  async getDocuments(params = {}) {
    try {
      console.log("DocumentService.getDocuments llamado con params:", params);
      
      // Crear clave de caché específica basada en los parámetros
      const cacheKey = `cached_documents_${JSON.stringify(params)}`;
      
      // Verificar si hay datos en caché para estos parámetros específicos
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          console.log("Usando datos de documentos en caché:", parsedData);
          return parsedData;
        } catch (e) {
          console.warn("Error al leer caché de documentos:", e);
        }
      }
      
      // Configurar timeout para evitar bloqueos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("Timeout al obtener documentos - abortando petición");
        controller.abort();
      }, 5000); // 5 segundos timeout
      
      try {
        // Verificar el token para debug
        const token = localStorage.getItem('auth-token');
        console.log("Token disponible para getDocuments:", !!token);
        
        // Crear una URL completa para API
        const apiUrl = `${API_BASE_URL}${this.endpoint}/documents/`;
        console.log("URL de API construida:", apiUrl);
        
        const queryParams = new URLSearchParams();
        
        // Normalizamos los parámetros (importante para búsqueda)
        const normalizedParams = { ...params };
        
        // Si el parámetro search está vacío, lo eliminamos para no hacer búsquedas inútiles
        if (normalizedParams.search === '') {
          delete normalizedParams.search;
        }
        
        // Agregar cada parámetro a la URL
        Object.entries(normalizedParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value);
          }
        });
        
        const urlWithParams = `${apiUrl}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        console.log("Solicitando URL completa:", urlWithParams);
        
        // Usar fetch con timeout
        const fetchResponse = await fetch(urlWithParams, {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        
        // Limpiar timeout ya que la petición completó
        clearTimeout(timeoutId);
        
        console.log("Respuesta de fetch:", fetchResponse.status, fetchResponse.statusText);
        
        if (!fetchResponse.ok) {
          throw new Error(`Error en solicitud API: ${fetchResponse.status} ${fetchResponse.statusText}`);
        }
        
        // Primero verifiquemos si la respuesta es realmente JSON
        const responseText = await fetchResponse.text();
        
        let jsonData;
        try {
          // Intentar parsear la respuesta como JSON
          jsonData = JSON.parse(responseText);
          console.log("Documentos obtenidos y parseados correctamente");
          
          // Guardar datos en caché para uso futuro
          try {
            localStorage.setItem(cacheKey, JSON.stringify(jsonData));
          } catch (e) {
            console.warn("No se pudo guardar documentos en caché:", e);
          }
          
          // Verificar estructura de datos esperada
          if (!jsonData.results) {
            console.warn("Los datos no tienen la estructura esperada");
            
            // Intentar adaptarlos si es posible
            if (Array.isArray(jsonData)) {
              console.log("Adaptando array a estructura esperada");
              return {
                results: jsonData,
                count: jsonData.length,
                next: null,
                previous: null
              };
            }
          }
          
          return jsonData;
        } catch (parseError) {
          console.error("Error al parsear respuesta como JSON:", parseError);
          throw parseError;
        }
      } catch (fetchError) {
        // Limpiar el timeout si hay error
        clearTimeout(timeoutId);
        console.error("Error en fetch de documentos:", fetchError);
        throw fetchError;
      }
    } catch (error) {
      console.error("Error final en getDocuments:", error);
      
      // Si el error es de tipo "aborted" (timeout) o recursos insuficientes, ser más específico
      if (error.name === 'AbortError' || error.message?.includes('ERR_INSUFFICIENT_RESOURCES')) {
        console.warn("Error de timeout o recursos insuficientes. Devolviendo datos por defecto.");
      }
      
      // Simulación de datos como último recurso
      console.warn("Devolviendo datos simulados como último recurso");
      const defaultDocuments = {
        results: [
          { 
            id: 1, 
            title: "Documento de prueba", 
            description: "Este es un documento simulado para pruebas",
            file_name: "test.pdf",
            file_type: "pdf",
            file_size: 1024,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: { id: 1, name: "General" },
            tags: []
          }
        ],
        count: 1,
        next: null,
        previous: null,
        current_page: 1,
        total_pages: 1
      };
      
      // Intentar guardar los datos por defecto en caché también
      try {
        const cacheKey = `cached_documents_${JSON.stringify(params)}`;
        localStorage.setItem(cacheKey, JSON.stringify(defaultDocuments));
      } catch (e) {
        console.warn("No se pudo guardar documentos por defecto en caché:", e);
      }
      
      return defaultDocuments;
    }
  }

  /**
   * Obtener detalles de un documento
   * @param {number} documentId - ID del documento
   * @returns {Promise<Object>} - Datos detallados del documento
   */
  async getDocument(documentId) {
    try {
      const response = await api.get(`${this.endpoint}/documents/${documentId}/`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Crear un nuevo documento
   * @param {FormData} formData - Datos del documento (debe incluir el archivo y metadatos)
   * @returns {Promise<Object>} - Documento creado
   */
  async createDocument(formData) {
    console.log("DocumentService.createDocument llamado");
    
    try {
      // Verificar que formData contenga los campos requeridos
      if (!formData.get('file')) {
        console.error("Error: No se proporcionó archivo");
        throw new Error('El archivo es requerido.');
      }
      
      if (!formData.get('title')) {
        console.error("Error: No se proporcionó título");
        throw new Error('El título es requerido.');
      }
      
      // Loggear lo que estamos enviando al servidor
      console.log("Enviando al servidor:", {
        file: formData.get('file').name,
        title: formData.get('title'),
        description: formData.get('description') || '(sin descripción)',
        category: formData.get('category')
      });
      
      // Verificar token de autenticación
      const token = localStorage.getItem('auth-token');
      console.log("Token de autenticación disponible:", !!token);
      
      // Enviar la solicitud con timeout extendido debido al tamaño potencial del archivo
      const response = await api.post(`${this.endpoint}/documents/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        timeout: 60000, // 60 segundos de timeout para archivos grandes
      });
      
      console.log("Respuesta del servidor:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error en createDocument:", error);
      
      // Si hay error de autenticación, intentar una solución alternativa
      if (error.response?.status === 401) {
        console.warn("Error de autenticación al crear documento");
        throw new Error("No estás autenticado. Por favor, inicia sesión nuevamente.");
      }
      
      // Si es un error de validación del servidor, extraer los detalles
      if (error.response && error.response.data) {
        const serverError = error.response.data;
        console.log("Error del servidor:", serverError);
        
        // Si el error tiene un mensaje detallado
        if (serverError.detail) {
          throw new Error(serverError.detail);
        }
        
        // Si hay errores específicos por campo
        if (typeof serverError === 'object') {
          const errorMessages = [];
          
          // Recopilar mensajes de error por campo
          Object.keys(serverError).forEach(field => {
            if (Array.isArray(serverError[field])) {
              errorMessages.push(`${field}: ${serverError[field].join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${serverError[field]}`);
            }
          });
          
          if (errorMessages.length > 0) {
            throw new Error(`Error de validación: ${errorMessages.join('; ')}`);
          }
        }
      }
      
      // Si es un error de conexión, mostrar mensaje específico
      if (error.code === 'ECONNABORTED') {
        throw new Error('La conexión con el servidor ha tardado demasiado. El archivo podría ser muy grande o la conexión es inestable.');
      }
      
      if (!error.response && error.message) {
        // Error de red o conexión
        throw new Error(`Error de conexión: ${error.message}`);
      }
      
      // Si no podemos extraer un mensaje de error específico, usar el genérico
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Actualizar un documento existente
   * @param {number} documentId - ID del documento
   * @param {FormData|Object} data - Datos actualizados
   * @returns {Promise<Object>} - Documento actualizado
   */
  async updateDocument(documentId, data) {
    try {
      const headers = data instanceof FormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : {};
      
      const response = await api.patch(`${this.endpoint}/documents/${documentId}/`, data, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Eliminar un documento (soft delete)
   * @param {number} documentId - ID del documento a eliminar
   * @returns {Promise<void>}
   */
  async deleteDocument(documentId) {
    try {
      console.log("Eliminando documento con ID:", documentId);
      
      // Usar fetch directamente en lugar de axios
      const token = localStorage.getItem('auth-token');
      const url = `${API_BASE_URL}${this.endpoint}/documents/${documentId}/soft_delete/`;
      
      console.log("URL para eliminación:", url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al eliminar documento: ${response.status} ${response.statusText}`);
      }
      
      console.log("Documento eliminado correctamente");
      return true;
    } catch (error) {
      console.error("Error al eliminar documento:", error);
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Restaurar un documento eliminado
   * @param {number} documentId - ID del documento a restaurar
   * @returns {Promise<void>}
   */
  async restoreDocument(documentId) {
    try {
      await api.post(`${this.endpoint}/documents/${documentId}/restore/`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Marcar/desmarcar documento como favorito
   * @param {number} documentId - ID del documento
   * @returns {Promise<Object>} - Estado actualizado
   */
  async toggleFavorite(documentId) {
    try {
      const response = await api.post(`${this.endpoint}/documents/${documentId}/toggle_favorite/`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Descargar un documento
   * @param {number} documentId - ID del documento
   * @returns {Promise<Object>} - URL y nombre del archivo
   */
  async downloadDocument(documentId) {
    try {
      const response = await api.post(`${this.endpoint}/documents/${documentId}/download/`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener las versiones de un documento
   * @param {number} documentId - ID del documento
   * @returns {Promise<Array>} - Lista de versiones
   */
  async getDocumentVersions(documentId) {
    try {
      const response = await api.get(`${this.endpoint}/documents/${documentId}/versions/`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Agregar una nueva versión a un documento
   * @param {number} documentId - ID del documento
   * @param {FormData} formData - Datos de la nueva versión
   * @returns {Promise<Object>} - Nueva versión creada
   */
  async addDocumentVersion(documentId, formData) {
    try {
      const response = await api.post(`${this.endpoint}/documents/${documentId}/add_version/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener comentarios de un documento
   * @param {number} documentId - ID del documento
   * @returns {Promise<Array>} - Lista de comentarios
   */
  async getDocumentComments(documentId) {
    try {
      const response = await api.get(`${this.endpoint}/documents/${documentId}/comments/`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Agregar un comentario a un documento
   * @param {number} documentId - ID del documento
   * @param {Object} commentData - Datos del comentario
   * @returns {Promise<Object>} - Comentario creado
   */
  async addComment(documentId, commentData) {
    try {
      const response = await api.post(`${this.endpoint}/documents/${documentId}/add_comment/`, commentData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener categorías disponibles
   * @param {Object} params - Parámetros de filtrado, búsqueda y paginación
   * @returns {Promise<Object>} - Categorías y metadata de paginación
   */
  async getCategories(params = {}) {
    try {
      console.log("Solicitando categorías con token:", localStorage.getItem('auth-token'));
      
      // Comprobar si ya tenemos categorías en localStorage como caché 
      const cachedCategories = localStorage.getItem('cached_categories');
      if (cachedCategories) {
        try {
          const parsedCategories = JSON.parse(cachedCategories);
          console.log("Usando categorías cacheadas de localStorage:", parsedCategories);
          return parsedCategories;
        } catch (e) {
          console.warn("Error al leer categorías de caché:", e);
          // Continuar si hay error en la caché
        }
      }
      
      // Aplicar throttling para evitar too many requests
      await throttleRequest('categories');
      
      // Usar fetch directamente en lugar de axios para evitar problemas
      const token = localStorage.getItem('auth-token');
      const url = new URL(`${API_BASE_URL}${this.endpoint}/categories/`);
      
      // Añadir parámetros a la URL si existen
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
          }
        });
      }
      
      // Configurar los headers
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
      
      // Realizar la petición
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Respuesta de categorías:", data);
      
      // Cachear en localStorage para futuras solicitudes
      try {
        localStorage.setItem('cached_categories', JSON.stringify(data));
        // Resetear contador de errores si fue exitoso
        localStorage.setItem('categories_error_count', '0');
      } catch (e) {
        console.warn("No se pudo cachear las categorías:", e);
      }
      
      return data;
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      
      // Incrementar contador de errores para backoff exponencial
      try {
        const currentErrorCount = parseInt(localStorage.getItem('categories_error_count') || '0');
        localStorage.setItem('categories_error_count', String(currentErrorCount + 1));
        
        // Si es error 429 (Too Many Requests), aplicar un retraso adicional
        if (error.message && (error.message.includes('429') || error.message.includes('Too Many Requests'))) {
          console.warn("Detectado Too Many Requests en categorías. Aumentando intervalo entre solicitudes.");
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (e) {
        console.warn("Error al actualizar contador de errores:", e);
      }
      
      // Generar categorías predeterminadas en caso de error
      console.warn("Error al obtener categorías. Usando datos alternativos.");
      const defaultCategories = {
        results: [
          { id: 1, name: "General" },
          { id: 2, name: "Documentos" },
          { id: 3, name: "Contratos" }
        ],
        count: 3,
        next: null,
        previous: null
      };
      
      // Guardar en caché las categorías por defecto
      try {
        localStorage.setItem('cached_categories', JSON.stringify(defaultCategories));
      } catch (e) {
        console.warn("No se pudo cachear las categorías por defecto:", e);
      }
      
      return defaultCategories;
    }
  }

  /**
   * Obtener etiquetas disponibles
   * @param {Object} params - Parámetros de filtrado, búsqueda y paginación
   * @returns {Promise<Object>} - Etiquetas y metadata de paginación
   */
  async getTags(params = {}) {
    try {
      console.log("Solicitando etiquetas con token:", localStorage.getItem('auth-token'));
      
      // Comprobar si ya tenemos etiquetas en localStorage como caché 
      const cachedTags = localStorage.getItem('cached_tags');
      if (cachedTags) {
        try {
          const parsedTags = JSON.parse(cachedTags);
          console.log("Usando etiquetas cacheadas de localStorage:", parsedTags);
          return parsedTags;
        } catch (e) {
          console.warn("Error al leer etiquetas de caché:", e);
          // Continuar si hay error en la caché
        }
      }
      
      // Aplicar throttling para evitar too many requests
      await throttleRequest('tags');
      
      // Usar fetch directamente en lugar de axios para evitar problemas
      const token = localStorage.getItem('auth-token');
      const url = new URL(`${API_BASE_URL}${this.endpoint}/tags/`);
      
      // Añadir parámetros a la URL si existen
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
          }
        });
      }
      
      // Configurar los headers
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
      
      // Realizar la petición
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Respuesta de etiquetas:", data);
      
      // Cachear en localStorage para futuras solicitudes
      try {
        localStorage.setItem('cached_tags', JSON.stringify(data));
        // Resetear contador de errores si fue exitoso
        localStorage.setItem('tags_error_count', '0');
      } catch (e) {
        console.warn("No se pudo cachear las etiquetas:", e);
      }
      
      return data;
    } catch (error) {
      console.error("Error al obtener etiquetas:", error);
      
      // Incrementar contador de errores para backoff exponencial
      try {
        const currentErrorCount = parseInt(localStorage.getItem('tags_error_count') || '0');
        localStorage.setItem('tags_error_count', String(currentErrorCount + 1));
        
        // Si es error 429 (Too Many Requests), aplicar un retraso adicional
        if (error.message && (error.message.includes('429') || error.message.includes('Too Many Requests'))) {
          console.warn("Detectado Too Many Requests en etiquetas. Aumentando intervalo entre solicitudes.");
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (e) {
        console.warn("Error al actualizar contador de errores:", e);
      }
      
      // Generar etiquetas predeterminadas en caso de error
      console.warn("Error al obtener etiquetas. Usando datos alternativos.");
      const defaultTags = {
        results: [
          { id: 1, name: "Importante", color_code: "#FF0000" },
          { id: 2, name: "Urgente", color_code: "#FFA500" },
          { id: 3, name: "Completado", color_code: "#008000" }
        ],
        count: 3,
        next: null,
        previous: null
      };
      
      // Guardar en caché las etiquetas por defecto
      try {
        localStorage.setItem('cached_tags', JSON.stringify(defaultTags));
      } catch (e) {
        console.warn("No se pudo cachear las etiquetas por defecto:", e);
      }
      
      return defaultTags;
    }
  }

  /**
   * Añadir etiquetas a un documento
   * @param {number} documentId - ID del documento
   * @param {Array<number>} tagIds - IDs de las etiquetas a añadir
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async addTags(documentId, tagIds) {
    try {
      const response = await api.post(`${this.endpoint}/documents/${documentId}/add_tags/`, { tags: tagIds });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Eliminar una etiqueta de un documento
   * @param {number} documentId - ID del documento
   * @param {number} tagId - ID de la etiqueta a eliminar
   * @returns {Promise<void>}
   */
  async removeTag(documentId, tagId) {
    try {
      await api.post(`${this.endpoint}/documents/${documentId}/remove_tag/`, { tag_id: tagId });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener tipos de archivo disponibles
   * @returns {Promise<Array>} - Lista de tipos de archivo
   */
  async getFileTypes() {
    try {
      const response = await api.get(`${this.endpoint}/documents/file_types/`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener actividades de un documento
   * @param {number} documentId - ID del documento
   * @returns {Promise<Array>} - Lista de actividades
   */
  async getDocumentActivities(documentId) {
    try {
      const response = await api.get(`${this.endpoint}/documents/${documentId}/activities/`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Crear una nueva categoría
   * @param {Object} data - Datos de la categoría (al menos debe tener 'name')
   * @returns {Promise<Object>} - Categoría creada
   */
  async createCategory(data) {
    try {
      if (!data.name || data.name.trim() === '') {
        throw new Error('El nombre de la categoría es requerido');
      }
      
      // Valores por defecto
      const categoryData = {
        name: data.name.trim(),
        description: data.description || '',
        color_code: data.color_code || '#3B82F6', // Azul por defecto
        parent: data.parent || null,
      };
      
      const response = await api.post(`${this.endpoint}/categories/`, categoryData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.name) {
        // Error específico de nombre duplicado
        throw new Error(`La categoría "${data.name}" ya existe.`);
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Crear una nueva etiqueta
   * @param {Object} data - Datos de la etiqueta (al menos debe tener 'name')
   * @returns {Promise<Object>} - Etiqueta creada
   */
  async createTag(data) {
    try {
      if (!data.name || data.name.trim() === '') {
        throw new Error('El nombre de la etiqueta es requerido');
      }
      
      // Valores por defecto
      const tagData = {
        name: data.name.trim(),
        color_code: data.color_code || '#4F46E5', // Indigo por defecto
      };
      
      const response = await api.post(`${this.endpoint}/tags/`, tagData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.name) {
        // Error específico de nombre duplicado
        throw new Error(`La etiqueta "${data.name}" ya existe.`);
      }
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Obtener grupos de documentos
   * @param {Object} params - Parámetros de filtrado, búsqueda y paginación
   * @returns {Promise<Object>} - Grupos y metadata de paginación
   */
  async getGroups(params = {}) {
    try {
      console.log("Solicitando grupos con token:", localStorage.getItem('auth-token'));
      
      // Comprobar si ya tenemos grupos en localStorage como caché 
      const cachedGroups = localStorage.getItem('cached_groups');
      if (cachedGroups) {
        try {
          const parsedGroups = JSON.parse(cachedGroups);
          console.log("Usando grupos cacheados de localStorage:", parsedGroups);
          return parsedGroups;
        } catch (e) {
          console.warn("Error al leer grupos de caché:", e);
          // Continuar si hay error en la caché
        }
      }
      
      // Aplicar throttling para evitar too many requests
      await throttleRequest('groups');
      
      // Usar API para obtener grupos con un timeout para evitar bloqueos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
      
      try {
        // Usar fetch directamente en lugar de axios para evitar problemas
        const token = localStorage.getItem('auth-token');
        const url = new URL(`${API_BASE_URL}${this.endpoint}/groups/`);
        console.log("URL completa para solicitud de grupos:", url.toString());
        
        // Añadir parámetros a la URL si existen
        if (params) {
          Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
              url.searchParams.append(key, params[key]);
            }
          });
        }
        
        // Configurar los headers
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        if (token) {
          headers.append('Authorization', `Bearer ${token}`);
        }
        
        console.log("Iniciando solicitud fetch para grupos...");
        
        // Realizar la petición con timeout
        const response = await fetch(url, {
          method: 'GET',
          headers: headers,
          signal: controller.signal
        });
        
        // Limpiar el timeout ya que la petición se completó
        clearTimeout(timeoutId);
        
        console.log("Respuesta de grupos recibida:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        // Primero obtenemos el texto de la respuesta para poder diagnosticar problemas
        const responseText = await response.text();
        console.log("Texto de respuesta de grupos (primeros 100 caracteres):", responseText.substring(0, 100));
        
        let data;
        try {
          // Intentar parsear como JSON
          data = JSON.parse(responseText);
          console.log("Respuesta de grupos parseada correctamente:", data);
          
          // Cachear en localStorage para futuras solicitudes
          localStorage.setItem('cached_groups', JSON.stringify(data));
          
          return data;
        } catch (parseError) {
          console.error("Error al parsear respuesta de grupos como JSON:", parseError);
          throw parseError;
        }
      } catch (fetchError) {
        // Limpiar el timeout si hay error
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error("Error al obtener grupos:", error);
      
      // Mostrar información más detallada sobre el error
      if (error.message) {
        console.error("Mensaje de error:", error.message);
      }
      if (error.stack) {
        console.error("Stack de error:", error.stack);
      }
      
      // Incrementar contador de errores para backoff exponencial
      try {
        const currentErrorCount = parseInt(localStorage.getItem('groups_error_count') || '0');
        localStorage.setItem('groups_error_count', String(currentErrorCount + 1));
        
        // Si es error 429 (Too Many Requests), aplicar un retraso adicional
        if (error.message && (error.message.includes('429') || error.message.includes('Too Many Requests'))) {
          console.warn("Detectado Too Many Requests. Aumentando intervalo entre solicitudes.");
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 segundos adicionales
        }
      } catch (e) {
        console.warn("Error al actualizar contador de errores:", e);
      }
      
      // Usar datos alternativos en caso de error
      console.warn("Error al obtener grupos. Usando datos alternativos.");
      
      // Generar algunos grupos predeterminados para que la interfaz funcione
      // esto lo hacemos solo como fallback si el servidor no responde
      const defaultGroups = [
        { id: 101, name: 'Administración', description: 'Generado localmente' },
        { id: 102, name: 'Finanzas', description: 'Generado localmente' },
        { id: 103, name: 'Marketing', description: 'Generado localmente' },
        { id: 104, name: 'Recursos Humanos', description: 'Generado localmente' },
        { id: 105, name: 'Ventas', description: 'Generado localmente' }
      ];
      
      // Estructura con grupos por defecto
      const result = {
        results: defaultGroups,
        count: defaultGroups.length,
        next: null,
        previous: null
      };
      
      // Cachear también los datos por defecto
      try {
        localStorage.setItem('cached_groups', JSON.stringify(result));
      } catch (e) {
        console.warn("No se pudo cachear los grupos por defecto:", e);
      }
      
      return result;
    }
  }
  
  /**
   * Obtener detalles de un grupo
   * @param {number} groupId - ID del grupo
   * @returns {Promise<Object>} - Datos detallados del grupo
   */
  async getGroup(groupId) {
    try {
      const response = await api.get(`${this.endpoint}/groups/${groupId}/`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Crear un nuevo grupo
   * @param {Object} data - Datos del grupo (name, description, etc.)
   * @returns {Promise<Object>} - Grupo creado
   */
  async createGroup(data) {
    try {
      console.log('DocumentService.createGroup - Datos recibidos:', data);
      console.log('DocumentService.createGroup - Endpoint:', `${this.endpoint}/groups/`);
      console.log('DocumentService.createGroup - URL completa:', api.defaults.baseURL + this.endpoint.replace(/^\//, '') + '/groups/');
      
      if (!data.name || data.name.trim() === '') {
        throw new Error('El nombre del grupo es requerido');
      }
      
      // Agregar token manualmente para pruebas
      const token = localStorage.getItem('auth-token');
      console.log('Token disponible:', !!token);
      
      // Mostrar todos los datos que se enviarán
      const dataToSend = {
        name: data.name.trim(),
        description: data.description || '',
        color_code: data.color_code || '#3B82F6',
        icon: data.icon || 'folder',
        is_public: data.is_public !== undefined ? data.is_public : false
      };
      
      console.log('Datos que se enviarán al servidor:', dataToSend);
      
      const response = await api.post(`${this.endpoint}/groups/`, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      console.log('Respuesta de createGroup:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error completo en createGroup:', error);
      console.error('Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      
      if (error.response && error.response.status === 400 && error.response.data.name) {
        // Error específico de nombre duplicado
        throw new Error(`El grupo "${data.name}" ya existe.`);
      }
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Actualizar un grupo
   * @param {number} groupId - ID del grupo
   * @param {Object} data - Datos actualizados del grupo
   * @returns {Promise<Object>} - Grupo actualizado
   */
  async updateGroup(groupId, data) {
    try {
      const response = await api.patch(`${this.endpoint}/groups/${groupId}/`, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Eliminar un grupo
   * @param {number} groupId - ID del grupo a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async deleteGroup(groupId) {
    try {
      await api.delete(`${this.endpoint}/groups/${groupId}/`);
      return true;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Obtener documentos de un grupo
   * @param {number} groupId - ID del grupo
   * @param {Object} params - Parámetros de filtrado, búsqueda y paginación
   * @returns {Promise<Object>} - Documentos del grupo y metadata de paginación
   */
  async getGroupDocuments(groupId, params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/groups/${groupId}/documents/`, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Añadir documento a un grupo
   * @param {number} groupId - ID del grupo
   * @param {number} documentId - ID del documento
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async addDocumentToGroup(groupId, documentId) {
    try {
      const response = await api.post(`${this.endpoint}/groups/${groupId}/add_document/`, { document_id: documentId });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Quitar documento de un grupo
   * @param {number} groupId - ID del grupo
   * @param {number} documentId - ID del documento
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async removeDocumentFromGroup(groupId, documentId) {
    try {
      await api.post(`${this.endpoint}/groups/${groupId}/remove_document/`, { document_id: documentId });
      return true;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Obtener colecciones de documentos
   * @param {Object} params - Parámetros de filtrado, búsqueda y paginación
   * @returns {Promise<Object>} - Colecciones y metadata de paginación
   */
  async getCollections(params = {}) {
    try {
      console.log("Solicitando colecciones...");
      
      // Comprobar si ya tenemos colecciones en localStorage como caché 
      const cachedCollections = localStorage.getItem('cached_collections');
      if (cachedCollections) {
        try {
          const parsedCollections = JSON.parse(cachedCollections);
          console.log("Usando colecciones cacheadas de localStorage:", parsedCollections);
          return parsedCollections;
        } catch (e) {
          console.warn("Error al leer colecciones de caché:", e);
          // Continuar si hay error en la caché
        }
      }
      
      // Usar un timeout para evitar que la app se bloquee
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
      
      try {
        // Intentar obtener con axios pero con timeout
        const response = await Promise.race([
          api.get(`${this.endpoint}/collections/`, { 
            params,
            signal: controller.signal
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout al obtener colecciones')), 5000)
          )
        ]);
        
        // Limpiar el timeout
        clearTimeout(timeoutId);
        
        // Cachear en localStorage
        localStorage.setItem('cached_collections', JSON.stringify(response.data));
        
        return response.data;
      } catch (fetchError) {
        // Limpiar el timeout si hay error
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error("Error al obtener colecciones:", error);
      
      // Datos de fallback
      const defaultCollections = [
        { id: "c101", name: 'Documentos Importantes', description: 'Generado localmente', document_count: 0 },
        { id: "c102", name: 'Archivos Recientes', description: 'Generado localmente', document_count: 0 }
      ];
      
      const result = {
        results: defaultCollections,
        count: defaultCollections.length,
        next: null,
        previous: null
      };
      
      // Cachear los datos por defecto
      try {
        localStorage.setItem('cached_collections', JSON.stringify(result));
      } catch (e) {
        console.warn("No se pudo cachear las colecciones por defecto:", e);
      }
      
      return result;
    }
  }
  
  /**
   * Obtener detalles de una colección
   * @param {string} collectionId - ID de la colección (UUID)
   * @returns {Promise<Object>} - Datos detallados de la colección
   */
  async getCollection(collectionId) {
    try {
      const response = await api.get(`${this.endpoint}/collections/${collectionId}/`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Crear una nueva colección
   * @param {Object} data - Datos de la colección
   * @returns {Promise<Object>} - Colección creada
   */
  async createCollection(data) {
    try {
      console.log('DocumentService.createCollection - Datos recibidos:', data);
      console.log('DocumentService.createCollection - Endpoint:', `${this.endpoint}/collections/`);
      console.log('DocumentService.createCollection - URL completa:', api.defaults.baseURL + this.endpoint.replace(/^\//, '') + '/collections/');
      
      if (!data.name || data.name.trim() === '') {
        throw new Error('El nombre de la colección es requerido');
      }
      
      // Agregar token manualmente para pruebas
      const token = localStorage.getItem('auth-token');
      console.log('Token de colección disponible:', !!token);
      
      // Mostrar todos los datos que se enviarán
      const dataToSend = {
        name: data.name.trim(),
        description: data.description || '',
        color_code: data.color_code || '#8B5CF6',
        icon: data.icon || 'collection',
        is_public: data.is_public !== undefined ? data.is_public : false,
        include_annotations: data.include_annotations !== undefined ? data.include_annotations : true,
        include_comments: data.include_comments !== undefined ? data.include_comments : false
      };
      
      console.log('Datos de colección que se enviarán al servidor:', dataToSend);
      
      const response = await api.post(`${this.endpoint}/collections/`, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      console.log('Respuesta de createCollection:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error completo en createCollection:', error);
      console.error('Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      
      if (error.response && error.response.status === 400 && error.response.data.name) {
        // Error específico de nombre duplicado
        throw new Error(`La colección "${data.name}" ya existe.`);
      }
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Actualizar una colección
   * @param {string} collectionId - ID de la colección (UUID)
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>} - Colección actualizada
   */
  async updateCollection(collectionId, data) {
    try {
      const response = await api.patch(`${this.endpoint}/collections/${collectionId}/`, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Eliminar una colección
   * @param {string} collectionId - ID de la colección a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async deleteCollection(collectionId) {
    try {
      await api.delete(`${this.endpoint}/collections/${collectionId}/`);
      return true;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Obtener documentos de una colección
   * @param {string} collectionId - ID de la colección
   * @param {Object} params - Parámetros de filtrado, búsqueda y paginación
   * @returns {Promise<Object>} - Documentos de la colección con metadata
   */
  async getCollectionDocuments(collectionId, params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/collections/${collectionId}/documents/`, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Añadir documentos a una colección
   * @param {string} collectionId - ID de la colección
   * @param {Array<number>} documentIds - IDs de los documentos a añadir
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async addDocumentsToCollection(collectionId, documentIds) {
    try {
      const response = await api.post(`${this.endpoint}/collections/${collectionId}/add_documents/`, { 
        document_ids: documentIds 
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Quitar un documento de una colección
   * @param {string} collectionId - ID de la colección
   * @param {number} documentId - ID del documento
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async removeDocumentFromCollection(collectionId, documentId) {
    try {
      await api.post(`${this.endpoint}/collections/${collectionId}/remove_document/`, { 
        document_id: documentId 
      });
      return true;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Reordenar documentos en una colección
   * @param {string} collectionId - ID de la colección
   * @param {Array<Object>} documentOrders - Lista de objetos {document_id, order}
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async reorderCollectionDocuments(collectionId, documentOrders) {
    try {
      const response = await api.post(`${this.endpoint}/collections/${collectionId}/reorder/`, { 
        documents: documentOrders 
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Obtener un enlace para compartir una colección
   * @param {string} collectionId - ID de la colección
   * @param {Object} options - Opciones de compartición (expiración, etc.)
   * @returns {Promise<Object>} - Datos del enlace de compartición
   */
  async getCollectionShareLink(collectionId, options = {}) {
    try {
      const response = await api.post(`${this.endpoint}/collections/${collectionId}/share/`, options);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Exportar una colección a ZIP
   * @param {string} collectionId - ID de la colección
   * @param {Object} options - Opciones de exportación (incluir comentarios, etc.)
   * @returns {Promise<Object>} - Datos de la exportación con URL de descarga
   */
  async exportCollection(collectionId, options = {}) {
    try {
      const response = await api.post(`${this.endpoint}/collections/${collectionId}/export/`, options);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}

export default DocumentService;