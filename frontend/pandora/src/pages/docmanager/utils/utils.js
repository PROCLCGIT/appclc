/**
 * Utilidades para optimización de rendimiento y accesibilidad
 * para el módulo DocManager (GestorDocumental)
 */

import { API_BASE_URL } from '@/config/constants';

/**
 * Implementación del patrón debounce para retrasar la ejecución de funciones
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} - Función con debounce
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };
  
  /**
   * Implementación del patrón throttle para limitar la frecuencia de ejecución de funciones
   * @param {Function} func - Función a ejecutar
   * @param {number} limit - Límite de tiempo en ms
   * @returns {Function} - Función con throttle
   */
  export const throttle = (func, limit = 300) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  };
  
  /**
   * Formatear tamaño de archivo a formato legible
   * @param {number} bytes - Tamaño en bytes
   * @param {number} decimals - Número de decimales
   * @returns {string} - Tamaño formateado
   */
  export const formatFileSize = (bytes, decimals = 1) => {
    if (!bytes || typeof bytes !== 'number') return 'Desconocido';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let size = bytes;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(decimals)} ${units[unitIndex]}`;
  };
  
  /**
   * Formatear fecha relativa
   * @param {string} dateString - Fecha en formato string
   * @returns {string} - Fecha formateada
   */
  export const formatRelativeDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.round(diffMs / 1000);
      const diffMin = Math.round(diffSec / 60);
      const diffHour = Math.round(diffMin / 60);
      const diffDays = Math.round(diffHour / 24);
      
      if (diffSec < 60) return 'hace unos segundos';
      if (diffMin < 60) return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
      if (diffHour < 24) return `hace ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
      if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
      
      // Para fechas más antiguas, usar formato normal
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };
  
  /**
   * Generar un ID único para uso en componentes
   * @param {string} prefix - Prefijo para el ID
   * @returns {string} - ID único
   */
  export const generateUniqueId = (prefix = 'doc') => {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
  };
  
  /**
   * Extraer extensión de archivo del nombre
   * @param {string} fileName - Nombre del archivo
   * @returns {string} - Extensión del archivo
   */
  export const getFileExtension = (fileName) => {
    if (!fileName) return '';
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  };
  
  /**
   * Determinar el tipo MIME basado en la extensión del archivo
   * @param {string} fileName - Nombre del archivo
   * @returns {string} - Tipo MIME
   */
  export const getMimeType = (fileName) => {
    const extension = getFileExtension(fileName);
    
    const mimeTypes = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      txt: 'text/plain',
      csv: 'text/csv',
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      json: 'application/json',
      xml: 'application/xml',
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      mp3: 'audio/mpeg',
      mp4: 'video/mp4',
      wav: 'audio/wav',
      avi: 'video/avi',
      mov: 'video/quicktime',
      // Añadir más según necesidad
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  };
  
  /**
   * Determinar tipo de documento basado en la extensión
   * @param {string} fileName - Nombre del archivo
   * @returns {object} - Objeto con categoría y tipo de archivo
   */
  export const getFileTypeInfo = (fileName) => {
    const extension = getFileExtension(fileName);
    
    // Extensiones por tipo
    const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
    const spreadsheetTypes = ['xls', 'xlsx', 'csv', 'ods'];
    const presentationTypes = ['ppt', 'pptx', 'odp'];
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'tiff'];
    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
    const audioTypes = ['mp3', 'wav', 'ogg', 'flac', 'aac'];
    const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
    const codeTypes = ['html', 'css', 'js', 'json', 'xml', 'py', 'java', 'c', 'cpp', 'php'];
    
    let category = 'otro';
    let icon = 'file';
    
    if (documentTypes.includes(extension)) {
      category = 'documento';
      icon = 'file-text';
    } else if (spreadsheetTypes.includes(extension)) {
      category = 'hoja-de-cálculo';
      icon = 'file-spreadsheet';
    } else if (presentationTypes.includes(extension)) {
      category = 'presentación';
      icon = 'file-presentation';
    } else if (imageTypes.includes(extension)) {
      category = 'imagen';
      icon = 'file-image';
    } else if (videoTypes.includes(extension)) {
      category = 'video';
      icon = 'file-video';
    } else if (audioTypes.includes(extension)) {
      category = 'audio';
      icon = 'file-audio';
    } else if (archiveTypes.includes(extension)) {
      category = 'archivo-comprimido';
      icon = 'file-archive';
    } else if (codeTypes.includes(extension)) {
      category = 'código';
      icon = 'file-code';
    }
    
    return {
      category,
      extension,
      icon
    };
  };
  
  /**
   * Función para normalizar texto para búsqueda
   * @param {string} text - Texto a normalizar
   * @returns {string} - Texto normalizado
   */
  export const normalizeText = (text) => {
    if (!text) return '';
    
    return text
      .normalize('NFD')               // Normalizar acentos
      .replace(/[\u0300-\u036f]/g, '') // Quitar diacríticos
      .toLowerCase()                  // Convertir a minúsculas
      .trim();                        // Quitar espacios al inicio y final
  };
  
  /**
   * Truncar texto para mostrar en UI
   * @param {string} text - Texto a truncar
   * @param {number} length - Longitud máxima
   * @returns {string} - Texto truncado
   */
  export const truncateText = (text, length = 50) => {
    if (!text) return '';
    if (text.length <= length) return text;
    
    return `${text.substring(0, length)}...`;
  };
  
  /**
   * Añadir atributos de accesibilidad a elementos
   * @param {Object} options - Opciones de accesibilidad
   * @returns {Object} - Propiedades de accesibilidad para el elemento
   */
  export const a11yProps = (options = {}) => {
    const {
      id,
      label,
      description,
      isDisabled = false,
      isRequired = false,
      role,
      tabIndex
    } = options;
    
    const props = {};
    
    if (id) props.id = id;
    if (label) props['aria-label'] = label;
    if (description) props['aria-describedby'] = description;
    if (isDisabled) props['aria-disabled'] = 'true';
    if (isRequired) props['aria-required'] = 'true';
    if (role) props.role = role;
    if (tabIndex !== undefined) props.tabIndex = tabIndex;
    
    return props;
  };
  
  /**
   * Validar que un archivo cumple con restricciones
   * @param {File} file - Archivo a validar
   * @param {Object} options - Opciones de validación
   * @returns {Object} - Objeto con resultado y mensaje
   */
  export const validateFile = (file, options = {}) => {
    const {
      maxSize = 10485760, // 10MB por defecto
      allowedTypes = null,
      allowedExtensions = null
    } = options;
    
    if (!file) {
      return {
        valid: false,
        message: 'No se ha seleccionado ningún archivo'
      };
    }
    
    // Validar tamaño
    if (file.size > maxSize) {
      return {
        valid: false,
        message: `El archivo excede el tamaño máximo de ${formatFileSize(maxSize, 0)}`
      };
    }
    
    // Validar tipo MIME
    if (allowedTypes && allowedTypes.length > 0) {
      const validType = allowedTypes.some(type => {
        return file.type === type || file.type.startsWith(`${type}/`);
      });
      
      if (!validType) {
        return {
          valid: false,
          message: `Tipo de archivo no permitido. Se permiten: ${allowedTypes.join(', ')}`
        };
      }
    }
    
    // Validar extensión
    if (allowedExtensions && allowedExtensions.length > 0) {
      const extension = getFileExtension(file.name);
      const validExtension = allowedExtensions.includes(extension);
      
      if (!validExtension) {
        return {
          valid: false,
          message: `Extensión no permitida. Se permiten: ${allowedExtensions.join(', ')}`
        };
      }
    }
    
    return {
      valid: true,
      message: 'Archivo válido'
    };
  };
  
  /**
   * Detectar si el dispositivo es móvil
   * @returns {boolean} - true si es dispositivo móvil
   */
  export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  
  /**
   * Manejar descarga de archivos
   * @param {string} url - URL del archivo
   * @param {string} filename - Nombre para guardar el archivo
   */
  export const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'documento');
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  /**
   * Convertir blob a base64
   * @param {Blob} blob - Blob a convertir
   * @returns {Promise<string>} - String base64
   */
  export const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  /**
   * Convertir base64 a blob
   * @param {string} base64 - String base64
   * @param {string} mimeType - Tipo MIME
   * @returns {Blob} - Blob generado
   */
  export const base64ToBlob = (base64, mimeType) => {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeType });
  };
  
  /**
   * Habilitar/Deshabilitar el desplazamiento del body
   * @param {boolean} enable - true para habilitar, false para deshabilitar
   */
  export const toggleBodyScroll = (enable) => {
    if (enable) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    } else {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  };

  /**
   * FUNCIONES PARA GESTIÓN DIRECTA DE DOCUMENTOS
   * Estas funciones permiten cargar documentos directamente desde la API
   * sin depender del servicio o hook problemático
   */

  /**
   * Función para obtener el token de autenticación
   * @returns {string|null} - Token de autenticación o null si no está disponible
   */
  export const getAuthToken = () => {
    return localStorage.getItem('auth-token');
  };

  /**
   * Cargar documentos directamente desde la API
   * @param {Object} params - Parámetros de consulta (página, búsqueda, etc.)
   * @returns {Promise<Object>} - Resultado de la consulta
   */
  export const fetchDocuments = async (params = {}) => {
    // Estructura por defecto para respuestas vacías
    const emptyResult = {
      results: [],
      count: 0,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1
    };
    
    // Asegurarse de que params sea un objeto válido
    const validParams = params && typeof params === 'object' ? params : {};
    
    try {
      // Usar caché para reducir solicitudes (solo si no es búsqueda)
      if (!validParams.search) {
        try {
          const cacheKey = `docmanager_docs_${JSON.stringify(validParams)}`;
          const cachedData = localStorage.getItem(cacheKey);
          if (cachedData) {
            const { timestamp, data } = JSON.parse(cachedData);
            // Solo usar caché si es reciente (menos de 2 minutos)
            if (Date.now() - timestamp < 120000) {
              console.log('Usando documentos desde caché local');
              return data;
            }
          }
        } catch (cacheError) {
          console.warn('Error al acceder a la caché de documentos:', cacheError);
        }
      }
      
      // Preparar parámetros de consulta
      const queryParams = new URLSearchParams();
      // Desactivar caché del navegador añadiendo un timestamp
      queryParams.append('_t', Date.now());
      
      // Añadir todos los parámetros válidos
      Object.entries(validParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      // Construir URL
      const url = `${API_BASE_URL}/docmanager/documents/?${queryParams.toString()}`;
      console.log("Consultando documentos en:", url);
      
      // Obtener token de autenticación
      const token = getAuthToken();
      
      // Configurar opciones de fetch
      const options = { 
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        // Asegurar que no use caché
        cache: 'no-store'
      };
      
      // Usar fetchWithRetry para manejar errores 429
      const response = await fetchWithRetry(url, options, 2, 1000);
      
      // Manejar errores de respuesta
      if (!response.ok) {
        console.error(`Error HTTP: ${response.status} ${response.statusText}`);
        return emptyResult;
      }
      
      // Procesar respuesta
      const data = await response.json();
      console.log('Documentos cargados:', data.results?.length || 0, 'documentos');
      
      // Verificar formato de respuesta y normalizar
      if (!data || !data.results) {
        console.warn('Respuesta sin resultados válidos');
        return emptyResult;
      }
      
      // Convertir response.results a array si no lo es
      if (data.results && !Array.isArray(data.results)) {
        console.warn('data.results no es un array, convirtiendo...');
        data.results = [];
      }
      
      // Guardar en caché si no es una búsqueda específica
      if (!validParams.search) {
        try {
          const cacheKey = `docmanager_docs_${JSON.stringify(validParams)}`;
          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data
          }));
        } catch (cacheError) {
          console.warn('Error al guardar documentos en caché:', cacheError);
        }
      }
      
      return data;
    } catch (error) {
      // Manejar cualquier error y devolver estructura vacía
      console.error('Error al cargar documentos:', error);
      return emptyResult;
    }
  };

  /**
   * Cargar categorías directamente desde la API
   * @returns {Promise<Object>} - Resultado de la consulta
   */
  /**
   * Función de ayuda para implementar retrasos
   * @param {number} ms - Milisegundos a esperar
   * @returns {Promise} - Promesa que se resuelve después del tiempo indicado
   */
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Función para obtener datos con reintentos en caso de error 429
   * @param {string} url - URL a solicitar
   * @param {Object} options - Opciones de fetch
   * @param {number} maxRetries - Número máximo de reintentos
   * @param {number} initialBackoff - Tiempo inicial de espera en ms
   * @returns {Promise<Response>} - Respuesta de fetch
   */
  const fetchWithRetry = async (url, options, maxRetries = 2, initialBackoff = 1000) => {
    let retries = 0;
    let backoff = initialBackoff;
    
    while (retries <= maxRetries) {
      try {
        const response = await fetch(url, options);
        
        // Si la respuesta es 429 (Too Many Requests) y todavía podemos reintentar
        if (response.status === 429 && retries < maxRetries) {
          console.warn(`Solicitud limitada (429). Reintentando en ${backoff}ms... (Intento ${retries + 1}/${maxRetries})`);
          await delay(backoff);
          retries++;
          backoff *= 2; // Backoff exponencial
          continue;
        }
        
        return response;
      } catch (error) {
        if (retries >= maxRetries) throw error;
        
        console.warn(`Error en fetch: ${error.message}. Reintentando en ${backoff}ms... (Intento ${retries + 1}/${maxRetries})`);
        await delay(backoff);
        retries++;
        backoff *= 2; // Backoff exponencial
      }
    }
    
    throw new Error(`No se pudo completar la solicitud después de ${maxRetries} intentos`);
  };
  
  export const fetchCategories = async () => {
    // Estructura por defecto para respuestas vacías
    const emptyResult = {
      results: [],
      count: 0
    };
    
    try {
      // Intentar usar datos de caché local primero (para reducir solicitudes)
      try {
        const cachedData = localStorage.getItem('docmanager_categories_cache');
        if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);
          // Solo usar caché si es reciente (menos de 30 minutos)
          if (Date.now() - timestamp < 1800000) {
            console.log('Usando datos de categorías desde caché local');
            return data;
          }
        }
      } catch (cacheError) {
        console.warn('Error al acceder a la caché local:', cacheError);
      }
      
      // Construir URL
      const url = `${API_BASE_URL}/docmanager/categories/`;
      console.log("Consultando categorías en:", url);
      
      // Configurar opciones de fetch
      const options = { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {})
        }
      };
      
      // Ejecutar fetch simple
      const response = await fetch(url, options);
      
      // Manejar errores de respuesta
      if (!response.ok) {
        console.error(`Error HTTP al cargar categorías: ${response.status} ${response.statusText}`);
        return emptyResult;
      }
      
      // Procesar respuesta
      const data = await response.json();
      console.log('Categorías cargadas correctamente:', data.results?.length || 0, 'categorías');
      
      // Guardar en caché local
      try {
        localStorage.setItem('docmanager_categories_cache', JSON.stringify({
          timestamp: Date.now(),
          data
        }));
      } catch (cacheError) {
        console.warn('Error al guardar categorías en caché:', cacheError);
      }
      
      return data && data.results ? data : emptyResult;
    } catch (error) {
      console.error('Error general al cargar categorías:', error);
      return emptyResult;
    }
  };

  /**
   * Cargar etiquetas directamente desde la API
   * @returns {Promise<Object>} - Resultado de la consulta
   */
  export const fetchTags = async () => {
    // Estructura por defecto para respuestas vacías
    const emptyResult = {
      results: [],
      count: 0
    };
    
    try {
      // Construir URL
      const url = `${API_BASE_URL}/docmanager/tags/`;
      console.log("Consultando etiquetas en:", url);
      
      // Configurar opciones de fetch
      const options = { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {})
        }
      };
      
      // Ejecutar fetch simple
      const response = await fetch(url, options);
      
      // Manejar errores de respuesta
      if (!response.ok) {
        console.error(`Error HTTP al cargar etiquetas: ${response.status} ${response.statusText}`);
        return emptyResult;
      }
      
      // Procesar respuesta
      const data = await response.json();
      console.log('Etiquetas cargadas correctamente:', data.results?.length || 0, 'etiquetas');
      
      return data && data.results ? data : emptyResult;
    } catch (error) {
      console.error('Error general al cargar etiquetas:', error);
      return emptyResult;
    }
  };

  /**
   * Subir un documento directamente a la API
   * @param {FormData} formData - Datos del documento
   * @returns {Promise<Object>} - Documento creado
   */
  export const uploadDocument = async (formData) => {
    try {
      const url = `${API_BASE_URL}/docmanager/documents/`;
      const token = getAuthToken();
      
      const headers = {
        // No incluir Content-Type para que el navegador establezca el boundary correcto
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Error al subir documento: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Documento subido directamente:', data);
      
      return data;
    } catch (error) {
      console.error('Error en uploadDocument:', error);
      throw error;
    }
  };

  /**
   * Eliminar un documento directamente
   * @param {number|string} documentId - ID del documento
   * @returns {Promise<Object>} - Resultado de la operación
   */
  export const deleteDocument = async (documentId) => {
    try {
      // Intentar soft delete primero
      const url = `${API_BASE_URL}/docmanager/documents/${documentId}/soft_delete/`;
      const token = getAuthToken();
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      // Si falla el soft delete, intentar hard delete
      const hardDeleteUrl = `${API_BASE_URL}/docmanager/documents/${documentId}/`;
      const hardDeleteResponse = await fetch(hardDeleteUrl, {
        method: 'DELETE',
        headers
      });
      
      if (!hardDeleteResponse.ok) {
        throw new Error(`Error al eliminar documento: ${hardDeleteResponse.status} ${hardDeleteResponse.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error en deleteDocument:', error);
      throw error;
    }
  };

  /**
   * Cambiar el estado de favorito de un documento
   * @param {number|string} documentId - ID del documento
   * @returns {Promise<Object>} - Resultado de la operación
   */
  export const toggleFavoriteDocument = async (documentId) => {
    try {
      const url = `${API_BASE_URL}/docmanager/documents/${documentId}/toggle_favorite/`;
      const token = getAuthToken();
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error al cambiar favorito: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en toggleFavoriteDocument:', error);
      throw error;
    }
  };

  /**
   * Obtener URL de descarga de un documento
   * @param {number|string} documentId - ID del documento
   * @returns {Promise<Object>} - URL de descarga
   */
  export const getDocumentDownloadUrl = async (documentId) => {
    try {
      const url = `${API_BASE_URL}/docmanager/documents/${documentId}/download/`;
      const token = getAuthToken();
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener URL de descarga: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getDocumentDownloadUrl:', error);
      // Intentar obtener URL pública como fallback
      try {
        const publicUrl = `${API_BASE_URL}/docmanager/documents/${documentId}/public-download/`;
        const publicResponse = await fetch(publicUrl);
        
        if (publicResponse.ok) {
          return await publicResponse.json();
        }
        
        throw error;
      } catch (publicError) {
        console.error('Error al obtener URL pública:', publicError);
        throw error;
      }
    }
  };

  /**
   * Normalizar documentos para mostrar en la interfaz
   * @param {Array} documents - Lista de documentos
   * @param {Array} categories - Lista de categorías disponibles
   * @returns {Array} - Lista de documentos normalizados
   */
  export const normalizeDocumentsData = (documents, categories = []) => {
    if (!documents) return [];
    if (!Array.isArray(documents)) return [];
    
    return documents.map(doc => {
      // Verificar que el documento es un objeto válido
      if (!doc || typeof doc !== 'object') {
        return null;
      }
      
      // Procesar categoría
      let categoryName = '';
      let categoryObj = null;
      
      if (doc.category_name) {
        categoryName = doc.category_name;
      } else if (doc.category) {
        if (typeof doc.category === 'object' && doc.category !== null) {
          categoryName = doc.category.name || doc.category.label || '';
          categoryObj = doc.category;
        } else if (typeof doc.category === 'string') {
          categoryName = doc.category;
        } else if (typeof doc.category === 'number') {
          const matchingCategory = categories.find(c => c.id === doc.category);
          if (matchingCategory) {
            categoryName = matchingCategory.name;
            categoryObj = matchingCategory;
          } else {
            categoryName = `Categoría ${doc.category}`;
          }
        }
      }
      
      // Determinar tipo de archivo
      let fileType = 'unknown';
      if (doc.file_type) {
        fileType = doc.file_type.toLowerCase();
      } else if (doc.file_name) {
        const parts = doc.file_name.split('.');
        if (parts.length > 1) {
          fileType = parts.pop().toLowerCase();
        }
      } else if (doc.file) {
        try {
          const url = new URL(doc.file);
          const pathParts = url.pathname.split('.');
          if (pathParts.length > 1) {
            fileType = pathParts.pop().toLowerCase();
          }
        } catch (e) {
          console.warn("No se pudo extraer el tipo de archivo de la URL:", doc.file);
        }
      }
      
      // Asegurar que las etiquetas sean un array
      const tags = Array.isArray(doc.tags) ? doc.tags : [];
      
      // Construir documento normalizado
      return {
        ...doc,
        id: doc.id || generateUniqueId(),
        title: doc.title || 'Documento sin título',
        description: doc.description || '',
        category_name: categoryName || 'Sin categoría',
        category: categoryObj || { id: 0, name: 'Sin categoría' },
        file_type: fileType,
        file_size: doc.file_size || 0,
        tags: tags,
        created_at: doc.created_at || new Date().toISOString(),
        updated_at: doc.updated_at || new Date().toISOString(),
        file_url: doc.file_url || doc.file || ''
      };
    }).filter(Boolean); // Eliminar null o undefined
  };