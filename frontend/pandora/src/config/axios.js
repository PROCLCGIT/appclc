// src/config/axios.js
import axios from 'axios';

// Usamos VITE_API_URL desde las variables de entorno si está disponible, pero siempre utilizando /api como prefijo
// para hacer uso del proxy de Vite correctamente
const BASE_URL = import.meta.env.VITE_API_URL || '/api/';
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);

console.log('BASE_URL configurada:', BASE_URL);

// Mensaje importante para desarrollo
console.log('⚠️ IMPORTANTE: Todas las peticiones deben usar esta instancia de axios y rutas relativas sin /api/ adicional');
console.log('✅ CORRECTO:   api.get("core/clientes/")');
console.log('❌ INCORRECTO: api.get("/api/core/clientes/")');
console.log('❌ INCORRECTO: axios.get("http://localhost:8000/api/core/clientes/")');

// Para debug
window._baseApiUrl = BASE_URL; // Exponer para depuración en consola



// Creamos UNA única instancia
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// ============ Interceptores ============

// 1) Interceptor REQUEST: agrega Bearer token, controla concurrencia y maneja caché
api.interceptors.request.use(
  async (config) => {
    // Verificar si podemos usar caché para esta solicitud
    if (config.method === 'get' && !config._bypassCache) {
      const cacheKey = apiCache.createKey(config);
      const cachedResponse = apiCache.get(cacheKey);
      
      if (cachedResponse) {
        console.log(`Usando respuesta cacheada para: ${config.url}`);
        
        // El interceptor debe regresar un objeto compatible con Promise.reject para que 
        // axios piense que la petición falló, pero en realidad regresará un objeto personalizado
        // que será procesado por nuestro interceptor de respuesta
        const customError = new Error("Using cached response");
        customError.__cachedResponse = true;
        customError.cachedData = cachedResponse;
        customError.config = config;
        return Promise.reject(customError);
      }
    }
    
    // Si hay demasiados errores de rate limiting recientes, aumentamos el tiempo entre solicitudes
    const shouldThrottle = consecutiveRateLimitErrors > 2 && 
                           Date.now() - lastRateLimitTime < 60000;
    
    if (shouldThrottle && !config._highPriority) {
      const throttleTime = Math.min(
        baseRetryDelay * consecutiveRateLimitErrors,
        maxDelay
      );
      
      console.log(`Throttling para proteger contra rate limiting. Esperando ${throttleTime/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, throttleTime));
    }
    
    // Control de concurrencia para evitar sobrecarga al servidor
    if (activeRequests >= maxConcurrentRequests && !config._bypassConcurrencyCheck) {
      console.log(`Limitando concurrencia. Esperando... (${activeRequests}/${maxConcurrentRequests} activas)`);
      
      // Esperamos hasta que haya un slot disponible
      await new Promise(resolve => {
        const checkSlot = () => {
          if (activeRequests < maxConcurrentRequests) {
            resolve();
          } else {
            setTimeout(checkSlot, 500);
          }
        };
        checkSlot();
      });
    }
    
    // Incrementar contador de peticiones activas
    activeRequests++;
    
    // Agregar timestamp para monitoreo
    config._requestTime = Date.now();
    
    // Manejo del token de autenticación
    const token = localStorage.getItem('auth-token');
    
    if (token) {
      // Asegurar que el token está formateado correctamente
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token agregado a la petición:', config.url);
    } else {
      console.log('No hay token disponible para:', config.url);
      
      // Ya no redirigimos automáticamente - dejamos que los componentes de React manejen esto
      // Las redirecciones con window.location.href pueden causar problemas
      if (!config.url.includes('/auth/') && !window.location.pathname.includes('/login')) {
        console.log('Petición sin token a URL que requiere autenticación - NO redirigiendo automáticamente');
      }
    }
    return config;
  },
  (error) => {
    // Decrementar contador incluso en error de request
    activeRequests = Math.max(0, activeRequests - 1);
    return Promise.reject(error);
  }
);

// 2) Manejo de Rate Limiting mejorado con backoff exponencial más conservador
const baseRetryDelay = 10000; // Aumentado a 10 segundos para ser aún más conservador
const maxRetries = 8;        // Aumentado a 8 reintentos para ser más persistente
const maxDelay = 120000;     // Aumentado a 120 segundos máximo de espera

// Contador global para registrar errores consecutivos de rate limiting
let consecutiveRateLimitErrors = 0;
let lastRateLimitTime = 0;

// Limitamos el número de peticiones concurrentes
let activeRequests = 0;
const maxConcurrentRequests = 1; // Mantenemos 1 para evitar sobrecargar el servidor

// Objeto para almacenar caché de respuestas por URL
const apiCache = {
  data: new Map(),
  ttl: 300000, // 5 minutos de tiempo de vida
  
  // Obtener una respuesta cacheada
  get(cacheKey) {
    if (!this.data.has(cacheKey)) return null;
    
    const cached = this.data.get(cacheKey);
    if (Date.now() - cached.timestamp > this.ttl) {
      this.data.delete(cacheKey);
      return null;
    }
    
    return cached.response;
  },
  
  // Guardar una respuesta en caché
  set(cacheKey, response) {
    this.data.set(cacheKey, {
      timestamp: Date.now(),
      response: JSON.parse(JSON.stringify(response)) // Copia profunda
    });
  },
  
  // Crear clave de caché para una configuración de request
  createKey(config) {
    const { url, method, params, data } = config;
    return `${method}-${url}-${JSON.stringify(params || {})}-${JSON.stringify(data || {})}`;
  }
};

api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, restablecer el contador de errores de rate limiting
    consecutiveRateLimitErrors = 0;
    
    // Decrementar contador de peticiones activas
    activeRequests = Math.max(0, activeRequests - 1);
    
    // Log para monitoreo de tiempos de respuesta
    if (response.config._requestTime) {
      const duration = Date.now() - response.config._requestTime;
      if (duration > 1000) {
        console.log(`Petición a ${response.config.url} completada en ${duration}ms (lenta)`);
      }
    }
    
    // Almacenar respuesta en caché para GET requests
    if (response.config.method === 'get' && !response.config._bypassCache) {
      const cacheKey = apiCache.createKey(response.config);
      apiCache.set(cacheKey, response.data);
    }
    
    return response;
  },
  async (error) => {
    // Manejo especial para respuestas cacheadas
    if (error.__cachedResponse) {
      console.log('Usando respuesta de caché para:', error.config.url);
      const response = {
        data: error.cachedData,
        config: error.config,
        status: 200,
        statusText: 'OK (cached)',
        headers: {},
        cached: true
      };
      return Promise.resolve(response);
    }
    
    // Decrementar contador de peticiones activas (excepto cuando vamos a reintentar)
    const willRetry = error.response?.status === 429 && 
                     (!error.config._retryCount || error.config._retryCount < maxRetries);
    
    if (!willRetry) {
      activeRequests = Math.max(0, activeRequests - 1);
    }
    
    // Si la solicitud tiene _disableRetry, no intentamos el retry automático
    if (error.config?._disableRetry) {
      console.log('Retry automático desactivado para esta solicitud');
      return Promise.reject(error);
    }

    // Solo manejamos este interceptor para errores 429 (Too Many Requests)
    if (error.response?.status === 429) {
      // Registrar tiempo del último error de rate limiting
      lastRateLimitTime = Date.now();
      
      // Incrementar contador global de errores consecutivos
      consecutiveRateLimitErrors = Math.min(consecutiveRateLimitErrors + 1, 10);
      
      // Si no existe la propiedad retryCount en la configuración, la inicializamos
      if (!error.config._retryCount) {
        error.config._retryCount = 0;
      }

      // Incrementamos el contador de reintentos
      error.config._retryCount += 1;
      
      // Verificar si podemos usar caché como fallback para este error
      if (error.config.method === 'get' && !error.config._bypassCache) {
        const cacheKey = apiCache.createKey(error.config);
        const cachedResponse = apiCache.get(cacheKey);
        
        if (cachedResponse) {
          console.log('Usando caché como fallback para error 429 en:', error.config.url);
          const response = {
            data: cachedResponse,
            config: error.config,
            status: 200,
            statusText: 'OK (cached fallback)',
            headers: {},
            cached: true
          };
          return Promise.resolve(response);
        }
      }
      
      // Si aún no alcanzamos el máximo de reintentos
      if (error.config._retryCount <= maxRetries) {
        // Calculamos un delay con backoff exponencial que también considera
        // el número de errores consecutivos de rate limiting
        // Esto hace que el sistema sea más conservador después de múltiples errores
        const baseMultiplier = Math.pow(2, error.config._retryCount - 1);
        const globalMultiplier = Math.max(1, consecutiveRateLimitErrors * 0.5); // Factor adicional basado en errores globales
        
        const delay = Math.min(
          baseRetryDelay * baseMultiplier * globalMultiplier,
          maxDelay
        );
        
        console.log(
          `Rate limit detectado. Intento ${error.config._retryCount}/${maxRetries}. ` +
          `Errores consecutivos: ${consecutiveRateLimitErrors}. ` +
          `Esperando ${Math.round(delay/1000)}s...`
        );
        
        // Esperamos antes de reintentar
        await new Promise((resolve) => setTimeout(resolve, delay));
        
        // Reintentamos la solicitud con la misma configuración
        return api(error.config);
      }
      
      // Si llegamos al máximo de reintentos, rechazamos con un mensaje claro
      console.log('Máximo de reintentos alcanzado para errores de rate limit');
      error.message = 'Demasiadas solicitudes en poco tiempo. Por favor, espere unos minutos e intente nuevamente.';
    } else if (error.response?.status === 404) {
      // Para errores 404, no tiene sentido reintentar
      console.log('Recurso no encontrado (404):', error.config.url);
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      // Para errores de timeout, incrementar contador de rate limiting también
      // ya que a menudo los timeouts son un síntoma de sobrecarga del servidor
      console.log('Timeout detectado, incrementando contador de rate limiting');
      lastRateLimitTime = Date.now();
      consecutiveRateLimitErrors = Math.min(consecutiveRateLimitErrors + 0.5, 10);
      
      // Verificar si podemos usar caché como fallback para este error
      if (error.config.method === 'get' && !error.config._bypassCache) {
        const cacheKey = apiCache.createKey(error.config);
        const cachedResponse = apiCache.get(cacheKey);
        
        if (cachedResponse) {
          console.log('Usando caché como fallback para timeout en:', error.config.url);
          return Promise.resolve({ 
            data: cachedResponse,
            config: error.config,
            status: 200,
            statusText: 'OK (cached fallback for timeout)',
            headers: {},
            cached: true
          });
        }
      }
    } else {
      // Si no es un error de rate limiting, reducir gradualmente el contador global
      // Esto permite que el sistema se recupere después de un periodo sin errores
      if (Date.now() - lastRateLimitTime > 60000 && consecutiveRateLimitErrors > 0) {
        consecutiveRateLimitErrors = Math.max(0, consecutiveRateLimitErrors - 1);
      }
    }
    
    // Para cualquier otro error, simplemente lo rechazamos
    return Promise.reject(error);
  }
);

// 3) Manejo de 401: si no autorizado, intentamos refrescar el token primero
let isRefreshing = false;
let refreshSubscribers = [];

// Función para añadir callbacks a la lista de subscribers
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Función para notificar a todos los subscribers que el token se ha actualizado
const onTokenRefreshed = (newToken) => {
  refreshSubscribers.map(callback => callback(newToken));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Solo manejamos errores 401 (No autorizado)
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      
      // Evitar bucles infinitos
      if (originalRequest._retry) {
        console.log('Ya intentamos refreshear para esta petición, redirigiendo a login');
        // Limpiamos tokens y redirigimos a login
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        localStorage.removeItem('last-auth-prompt');
        
        // Ya no redirigimos usando window.location.href
        console.log('Token inválido detectado - manejando en componente React');
        return Promise.reject(error);
      }
      
      // Marcamos esta petición para evitar loops
      originalRequest._retry = true;
      
      // Si no estamos ya refresheando
      if (!isRefreshing) {
        isRefreshing = true;
        
        const refreshToken = localStorage.getItem('refresh-token');
        
        if (!refreshToken) {
          console.log('No hay refresh token - manejando en componente React');
          return Promise.reject(error);
        }
        
        try {
          console.log('Intentando refresh token...');
          const response = await api.post('auth/token/refresh/', { refresh: refreshToken });
          const newToken = response.data.access;
          
          // Guardar nuevo token
          localStorage.setItem('auth-token', newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          
          // Notificar a todos los subscribers
          onTokenRefreshed(newToken);
          
          // Reintentar la petición original con el nuevo token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Error al refrescar token:', refreshError);
          
          // Si falla el refresh, limpiamos todo y redirigimos
          localStorage.removeItem('auth-token');
          localStorage.removeItem('refresh-token');
          localStorage.removeItem('last-auth-prompt');
          
          // Ya no redirigimos usando window.location.href
          console.log('Error al refrescar token - manejando en componente React');
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Si ya hay un refresh en progreso, subscribimos esta petición
        return new Promise(resolve => {
          subscribeTokenRefresh(newToken => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }
    }
    
    return Promise.reject(error);
  }
);

// 4) Opción: refreshAuthToken() si quieres que se refresque automáticamente
//    Podrías implementarlo aquí, pero a menudo se maneja desde authStore.

export default api;
