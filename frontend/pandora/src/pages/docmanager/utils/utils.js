/**
 * Utilidades para optimización de rendimiento y accesibilidad
 * para el módulo DocManager (GestorDocumental)
 */

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