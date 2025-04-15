// src/services/empresaService.js
import api from '@/config/axios';

// Configuración más optimizada
const TIMEOUT = 8000; // Reducido a 8 segundos
const CACHE_TIME = 12 * 60 * 60 * 1000; // 12 horas en milisegundos (mucho más largo para prevenir rate limits)

// Habilitar logging solo en desarrollo
const DEBUG = false; // Desactivar logging por completo para reducir operaciones

// Cache de respuestas para reducir peticiones
const cache = {
  data: {},
  timestamp: {},
};

// Almacenamiento global para control de rate limiting (se guarda en localStorage)
let globalRateLimitedUntil = localStorage.getItem('sri_rate_limited_until');
if (globalRateLimitedUntil && Number(globalRateLimitedUntil) > Date.now()) {
  console.warn(`🔒 Servicio SRI bloqueado globalmente hasta ${new Date(Number(globalRateLimitedUntil)).toLocaleTimeString()}`);
}

// Variables para el control de rate limiting
let pendingRequests = {};
let isRateLimited = globalRateLimitedUntil && Number(globalRateLimitedUntil) > Date.now();
let rateLimitResetTime = isRateLimited ? Number(globalRateLimitedUntil) : null;
let consecutiveRateLimitErrors = localStorage.getItem('sri_consecutive_errors') || 0;
const RATE_LIMIT_RESET_TIME = 60000; // 60 segundos de espera tras rate limit (mucho más largo)

// Intentar precargar datos desde localStorage si existen
try {
  const savedCache = localStorage.getItem('sri_data_cache');
  if (savedCache) {
    const parsedCache = JSON.parse(savedCache);
    if (parsedCache && typeof parsedCache === 'object') {
      cache.data = parsedCache.data || {};
      cache.timestamp = parsedCache.timestamp || {};
      console.log('📦 Datos SRI precargados desde localStorage');
    }
  }
} catch (e) {
  console.error('Error al cargar caché desde localStorage:', e);
}

/**
 * Obtiene empresas del endpoint específico con manejo de cache y rate limiting
 * @param {string} endpoint - Endpoint a consultar (sri, sercop, etc.)
 * @returns {Promise<Array>} - Array de empresas
 */
/**
 * Función central mejorada que obtiene empresas con caché persistente y super bloqueo contra rate limiting
 */
export const getEmpresas = async (endpoint = "sri") => {
  const cacheKey = `blegal/${endpoint}`;
  const now = Date.now();
  
  // 1. VERIFICAR BLOQUEO GLOBAL (persiste incluso entre recargas de página)
  const globalBlockUntil = localStorage.getItem('sri_rate_limited_until');
  if (globalBlockUntil && Number(globalBlockUntil) > now) {
    console.warn(`🚫 [BLOQUEADO] Servicio bloqueado globalmente hasta ${new Date(Number(globalBlockUntil)).toLocaleTimeString()}`);
    
    // Usar siempre datos en caché cuando el servicio está bloqueado
    if (cache.data[cacheKey]) {
      return cache.data[cacheKey];
    }
    
    // Si no hay caché, informar al usuario con tiempo exacto
    const tiempoRestante = Math.ceil((Number(globalBlockUntil) - now)/1000);
    throw new Error(`Servicio temporalmente no disponible por límite de peticiones. Disponible en ${tiempoRestante} segundos (${new Date(Number(globalBlockUntil)).toLocaleTimeString()}).`);
  }
  
  // 2. VERIFICAR BLOQUEO LOCAL (solo para esta sesión)
  if (isRateLimited && rateLimitResetTime && now < rateLimitResetTime) {
    // Usar siempre datos en caché cuando el servicio está bloqueado localmente
    if (cache.data[cacheKey]) {
      return cache.data[cacheKey];
    }
    
    // Si no hay caché, informar al usuario
    const tiempoRestante = Math.ceil((rateLimitResetTime - now)/1000);
    throw new Error(`Servicio temporalmente no disponible. Inténtelo de nuevo en ${tiempoRestante} segundos.`);
  }
  
  // Resetear bloqueos si ya pasó el tiempo
  if (isRateLimited && (!rateLimitResetTime || now >= rateLimitResetTime)) {
    isRateLimited = false;
    rateLimitResetTime = null;
  }

  // 3. USAR CACHÉ SI ESTÁ DISPONIBLE Y NO EXPIRADA
  if (cache.data[cacheKey] && cache.timestamp[cacheKey] && (now - cache.timestamp[cacheKey] < CACHE_TIME)) {
    return cache.data[cacheKey];
  }

  // 4. EVITAR MÚLTIPLES PETICIONES SIMULTÁNEAS
  if (pendingRequests[cacheKey]) {
    return pendingRequests[cacheKey];
  }

  // 5. REALIZAR PETICIÓN SI ES NECESARIO
  const requestPromise = (async () => {
    try {
      // Verificar token
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        throw new Error("No hay token de autenticación");
      }
      
      // Usar la instancia configurada de axios
      const response = await api.get(`blegal/${endpoint}/`, { 
        timeout: TIMEOUT,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      if (response.status !== 200) {
        throw new Error(`Error al obtener datos: ${response.statusText}`);
      }
      
      // 6. PROCESAR DATOS Y GUARDAR EN CACHÉ
      const responseData = response.data;
      
      // Transformar datos al formato esperado
      let resultData = [];
      if (responseData) {
        if (Array.isArray(responseData)) {
          resultData = responseData;
        } else if (typeof responseData === 'object') {
          if (responseData.results) {
            resultData = responseData.results;
          } else {
            resultData = [responseData];
          }
        }
      }
      
      // Guardar en caché
      cache.data[cacheKey] = resultData;
      cache.timestamp[cacheKey] = Date.now();
      
      // Guardar en localStorage para persistencia
      try {
        localStorage.setItem('sri_data_cache', JSON.stringify(cache));
      } catch (e) {
        console.warn('Error al guardar caché en localStorage:', e);
      }
      
      // Resetear contador de errores tras éxito
      consecutiveRateLimitErrors = 0;
      localStorage.setItem('sri_consecutive_errors', '0');
      
      return resultData;
    } catch (error) {
      // 7. MANEJO AGRESIVO DE RATE LIMITING
      if (error.response && error.response.status === 429) {
        // Incrementar contador de errores y guardarlo
        consecutiveRateLimitErrors = Number(consecutiveRateLimitErrors) + 1;
        localStorage.setItem('sri_consecutive_errors', consecutiveRateLimitErrors.toString());
        
        // Tiempo de bloqueo exponencial MUY agresivo
        const waitTime = consecutiveRateLimitErrors <= 1 
          ? RATE_LIMIT_RESET_TIME 
          : RATE_LIMIT_RESET_TIME * Math.pow(2, Math.min(consecutiveRateLimitErrors - 1, 10)); // Máx ~17 horas
        
        // Establecer bloqueo tanto local como global
        isRateLimited = true;
        rateLimitResetTime = Date.now() + waitTime;
        
        // Guardar bloqueo en localStorage para que persista entre recargas
        localStorage.setItem('sri_rate_limited_until', rateLimitResetTime.toString());
        
        console.warn(`⛔️ [BLOQUEO GLOBAL] Servicio bloqueado por ${waitTime/1000} segundos hasta ${new Date(rateLimitResetTime).toLocaleTimeString()}`);
        
        // Usar datos en caché si existen (sin importar si están expirados)
        if (cache.data[cacheKey]) {
          return cache.data[cacheKey];
        }
        
        throw new Error(`Demasiadas solicitudes. Servicio bloqueado hasta ${new Date(rateLimitResetTime).toLocaleTimeString()}.`);
      }
      
      // 8. MANEJO DE OTROS ERRORES
      if (error.response?.status === 401) {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
      }
      
      throw error;
    } finally {
      // 9. LIMPIAR SOLICITUD PENDIENTE
      setTimeout(() => {
        delete pendingRequests[cacheKey];
      }, 1000); // Delay más largo para prevenir cualquier posibilidad de carreras
    }
  })();
  
  // Almacenar la promesa
  pendingRequests[cacheKey] = requestPromise;
  
  return requestPromise;
};

/**
 * Fuerza una recarga de datos ignorando la caché si está permitido
 * @param {string} endpoint - Endpoint a recargar
 */
export const reloadEmpresas = async (endpoint = "sri") => {
  const now = Date.now();
  
  // NO PERMITIR FORZAR RECARGA SI HAY BLOQUEO GLOBAL
  const globalBlockUntil = localStorage.getItem('sri_rate_limited_until');
  if (globalBlockUntil && Number(globalBlockUntil) > now) {
    console.warn(`🔒 [BLOQUEADO] No se puede forzar recarga, servicio bloqueado globalmente hasta ${new Date(Number(globalBlockUntil)).toLocaleTimeString()}`);
    
    // Siempre usar caché si está disponible
    const cacheKey = `blegal/${endpoint}`;
    if (cache.data[cacheKey]) {
      return cache.data[cacheKey];
    }
    
    // Informar al usuario
    throw new Error(`No se pueden recargar datos. Servicio bloqueado hasta ${new Date(Number(globalBlockUntil)).toLocaleTimeString()}.`);
  }
  
  // PERMITIR RECARGA SI NO HAY BLOQUEO (aún respetando la lógica de rate limiting)
  return getEmpresas(endpoint);
};

/**
 * Crea una nueva empresa en el endpoint seleccionado
 * @param {Object} empresa - Datos de la empresa a crear
 * @param {string} endpoint - Endpoint donde crear (sri, sercop, etc.)
 * @returns {Promise<Object>} - Datos de la empresa creada
 */
export const createEmpresa = async (empresa, endpoint = "sri") => {
  const now = Date.now();
  
  // VERIFICAR BLOQUEO GLOBAL ANTES DE PERMITIR CREACIÓN
  const globalBlockUntil = localStorage.getItem('sri_rate_limited_until');
  if (globalBlockUntil && Number(globalBlockUntil) > now) {
    console.warn(`🔒 [BLOQUEADO] No se puede crear registro, servicio bloqueado hasta ${new Date(Number(globalBlockUntil)).toLocaleTimeString()}`);
    throw new Error(`No se pueden crear registros. Servicio bloqueado hasta ${new Date(Number(globalBlockUntil)).toLocaleTimeString()}.`);
  }
  
  try {
    const token = localStorage.getItem('auth-token');
    
    if (!token) {
      throw new Error("No hay token de autenticación");
    }
    
    const response = await api.post(`blegal/${endpoint}/`, empresa, { 
      timeout: TIMEOUT,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    
    // Aceptar tanto 201 (Created) como 200 (OK)
    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Error al crear la empresa. Status: ${response.status}`);
    }
    
    // Añadir el nuevo registro al caché existente en lugar de invalidarlo
    const cacheKey = `blegal/${endpoint}`;
    
    // Procesar resultados y actualizar caché
    let createdData = response.data;
    if (!Array.isArray(createdData)) {
      createdData = [createdData];
    }
    
    // Si hay caché existente, añadir el nuevo registro al principio
    if (cache.data[cacheKey] && Array.isArray(cache.data[cacheKey])) {
      cache.data[cacheKey] = [...createdData, ...cache.data[cacheKey]];
    } else {
      cache.data[cacheKey] = createdData;
    }
    
    // Actualizar timestamp de la caché
    cache.timestamp[cacheKey] = Date.now();
    
    // Guardar en localStorage
    try {
      localStorage.setItem('sri_data_cache', JSON.stringify(cache));
    } catch (e) {
      console.warn('Error al guardar caché en localStorage:', e);
    }
    
    return response.data;
  } catch (error) {
    // MANEJAR RATE LIMITING TAMBIÉN EN CREACIÓN
    if (error.response && error.response.status === 429) {
      // Incrementar contador de errores y guardarlo
      consecutiveRateLimitErrors = Number(consecutiveRateLimitErrors) + 1;
      localStorage.setItem('sri_consecutive_errors', consecutiveRateLimitErrors.toString());
      
      // Bloqueo agresivo
      const waitTime = RATE_LIMIT_RESET_TIME * Math.pow(2, Math.min(consecutiveRateLimitErrors - 1, 8));
      
      // Establecer bloqueo global
      const blockUntil = Date.now() + waitTime;
      localStorage.setItem('sri_rate_limited_until', blockUntil.toString());
      
      console.warn(`⛔️ [BLOQUEO GLOBAL] Servicio bloqueado por ${waitTime/1000} segundos hasta ${new Date(blockUntil).toLocaleTimeString()}`);
      
      throw new Error(`Demasiadas solicitudes. No se pudo crear registro. Servicio bloqueado hasta ${new Date(blockUntil).toLocaleTimeString()}.`);
    }
    
    // Otros errores
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
    }
    
    throw error;
  }
};
  