/**
 * Services for catalog/reference data endpoints
 */

import { BaseService } from './BaseService';
import api from '@/config/axios';

/**
 * Generic factory function to create catalog services
 * @param {string} endpoint - The API endpoint for the catalog
 * @param {string} prefix - The API prefix for the catalog (default: 'core')
 * @returns {BaseService} - A service instance for the catalog
 */
export const createCatalogService = (endpoint, prefix = 'core') => {
  // Usamos la ruta relativa sin 'api/' ya que axios.js ya configura esta base
  return new BaseService(`${prefix}/${endpoint}/`);
};

// Create services for all the catalogs/reference data
// Extender BaseService para zonas con soporte multiples endpoints
class ZonasService extends BaseService {
  constructor() {
    super('core/zonas/'); // Endpoint principal
    // Definimos múltiples endpoints para mayor resistencia
    this.endpoints = [
      'core/zonas/',        // Endpoint principal 
      'pandora/zonas/',     // Endpoint alternativo
      'zonas/',             // Endpoint simple (probablemente no existe)
      'api/core/zonas/',    // Con prefijo api
      'api/pandora/zonas/', // Con prefijo api alternativo
    ];
  }
  
  // Sobreescribir getAll para intentar múltiples endpoints y garantizar autenticación
  async getAll(params = {}, options = {}) {
    // Verificar token
    const token = localStorage.getItem('auth-token');
    if (!token) {
      console.warn('ZonasService: No hay token de autenticación disponible');
    } else if (!api.defaults.headers.common['Authorization']) {
      console.log('ZonasService: Estableciendo token en headers de axios');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Intentar todos los endpoints secuencialmente
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.endpoints[i];
      try {
        console.log(`ZonasService: Intentando cargar zonas desde ${endpoint}`);
        
        // Preparar configuración con headers explícitos para autenticación
        const config = {
          ...options,
          params,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000
        };
        
        const response = await api.get(endpoint, config);
        console.log(`ZonasService: ✅ Zonas cargadas desde ${endpoint}:`, response.data);
        
        // Procesar datos - asegurar IDs numéricos
        let result = response.data;
        if (Array.isArray(result.results)) {
          result.results = result.results.map(item => ({
            ...item,
            id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id
          }));
        } else if (Array.isArray(result)) {
          // Si la respuesta es un array directamente
          result = {
            results: result.map(item => ({
              ...item,
              id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id
            }))
          };
        }
        
        return result;
      } catch (error) {
        console.error(`ZonasService: ❌ Error al cargar zonas desde ${endpoint}:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        // Si es el último endpoint, propagar el error
        if (i === this.endpoints.length - 1) {
          console.error('ZonasService: Todos los endpoints fallaron');
          throw this.handleError(error);
        }
        
        // Continuar con el siguiente endpoint
        console.log('ZonasService: Intentando siguiente endpoint...');
      }
    }
  }
  
  // Sobreescribir create para intentar múltiples endpoints
  async create(data) {
    console.log('ZonasService - Datos a crear:', data);
    
    if (!data.nombre) {
      throw new Error('El nombre de la zona es obligatorio');
    }
    
    // Asegurar que el dato esté en formato correcto
    const processedData = {
      nombre: String(data.nombre).trim(),
      activo: data.activo === undefined ? true : Boolean(data.activo)
    };
    
    // Verificar token
    const token = localStorage.getItem('auth-token');
    if (!token) {
      console.error('ZonasService: No hay token de autenticación disponible');
      throw new Error('No estás autenticado. Inicia sesión para continuar.');
    }
    
    // Intentar todos los endpoints
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.endpoints[i];
      try {
        console.log(`ZonasService: Intentando crear zona en ${endpoint}`);
        
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000
        };
        
        const response = await api.post(endpoint, processedData, config);
        console.log(`ZonasService: ✅ Zona creada en ${endpoint}:`, response.data);
        
        // Asegurar que el ID es numérico
        if (response.data && response.data.id && typeof response.data.id === 'string') {
          response.data.id = parseInt(response.data.id, 10);
        }
        
        return response.data;
      } catch (error) {
        console.error(`ZonasService: ❌ Error al crear zona en ${endpoint}:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        // Si es el último endpoint, propagar el error
        if (i === this.endpoints.length - 1) {
          console.error('ZonasService: Todos los endpoints fallaron');
          throw this.handleError(error);
        }
        
        // Continuar con el siguiente endpoint
        console.log('ZonasService: Intentando siguiente endpoint...');
      }
    }
  }
}

export const zonasService = new ZonasService();
// Extender BaseService para ciudades con soporte para múltiples endpoints
class CiudadesService extends BaseService {
  constructor() {
    super('core/ciudades/'); // Endpoint principal
    // Definimos múltiples endpoints para mayor resistencia
    this.endpoints = [
      'core/ciudades/',        // Endpoint principal 
      'pandora/ciudades/',     // Endpoint alternativo
      'ciudades/',             // Endpoint simple (probablemente no existe)
      'api/core/ciudades/',    // Con prefijo api
      'api/pandora/ciudades/', // Con prefijo api alternativo
    ];
  }
  
  // Sobreescribir getAll para intentar múltiples endpoints
  async getAll(params = {}, options = {}) {
    // Verificar token
    const token = localStorage.getItem('auth-token');
    if (!token) {
      console.warn('CiudadesService: No hay token de autenticación disponible');
    } else if (!api.defaults.headers.common['Authorization']) {
      console.log('CiudadesService: Estableciendo token en headers de axios');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Intentar todos los endpoints secuencialmente
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.endpoints[i];
      try {
        console.log(`CiudadesService: Intentando cargar ciudades desde ${endpoint}`);
        
        // Preparar configuración con headers explícitos para autenticación
        const config = {
          ...options,
          params,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000
        };
        
        const response = await api.get(endpoint, config);
        console.log(`CiudadesService: ✅ Ciudades cargadas desde ${endpoint}:`, response.data);
        
        // Procesar datos - asegurar IDs numéricos
        let result = response.data;
        if (Array.isArray(result.results)) {
          result.results = result.results.map(item => ({
            ...item,
            id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
            zona: typeof item.zona === 'string' ? parseInt(item.zona, 10) : item.zona
          }));
        } else if (Array.isArray(result)) {
          // Si la respuesta es un array directamente
          result = {
            results: result.map(item => ({
              ...item,
              id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
              zona: typeof item.zona === 'string' ? parseInt(item.zona, 10) : item.zona
            }))
          };
        }
        
        return result;
      } catch (error) {
        console.error(`CiudadesService: ❌ Error al cargar ciudades desde ${endpoint}:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        // Si es el último endpoint, propagar el error
        if (i === this.endpoints.length - 1) {
          console.error('CiudadesService: Todos los endpoints fallaron');
          throw this.handleError(error);
        }
        
        // Continuar con el siguiente endpoint
        console.log('CiudadesService: Intentando siguiente endpoint...');
      }
    }
  }
  
  // Sobreescribir método create para validar la zona e intentar múltiples endpoints
  async create(data) {
    console.log('CiudadesService - Datos recibidos:', data);
    
    // Validar que existe zona y es un número
    if (!data.zona) {
      console.error('CiudadesService - Error: zona es requerida para crear una ciudad');
      throw new Error('La zona es requerida para crear una ciudad');
    }
    
    // Asegurar que zona sea un número
    const zonaId = typeof data.zona === 'string' ? parseInt(data.zona, 10) : data.zona;
    
    if (isNaN(zonaId)) {
      console.error('CiudadesService - Error: zona inválida, no es un número:', data.zona);
      throw new Error(`La zona especificada (${data.zona}) no es válida`);
    }
    
    // Crear datos normalizados
    const processedData = {
      nombre: String(data.nombre || '').trim(),
      zona: zonaId,
      activo: data.activo === undefined ? true : Boolean(data.activo)
    };
    
    console.log('CiudadesService - Datos procesados:', processedData);
    
    // Verificar token
    const token = localStorage.getItem('auth-token');
    if (!token) {
      console.error('CiudadesService: No hay token de autenticación disponible');
      throw new Error('No estás autenticado. Inicia sesión para continuar.');
    }
    
    // Intentar todos los endpoints
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.endpoints[i];
      try {
        console.log(`CiudadesService: Intentando crear ciudad en ${endpoint}`);
        
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000
        };
        
        const response = await api.post(endpoint, processedData, config);
        console.log(`CiudadesService: ✅ Ciudad creada en ${endpoint}:`, response.data);
        
        // Asegurar que el ID es numérico
        if (response.data && response.data.id && typeof response.data.id === 'string') {
          response.data.id = parseInt(response.data.id, 10);
        }
        if (response.data && response.data.zona && typeof response.data.zona === 'string') {
          response.data.zona = parseInt(response.data.zona, 10);
        }
        
        return response.data;
      } catch (error) {
        console.error(`CiudadesService: ❌ Error al crear ciudad en ${endpoint}:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        // Si es el último endpoint, propagar el error
        if (i === this.endpoints.length - 1) {
          console.error('CiudadesService: Todos los endpoints fallaron');
          throw this.handleError(error);
        }
        
        // Continuar con el siguiente endpoint
        console.log('CiudadesService: Intentando siguiente endpoint...');
      }
    }
  }
}

export const ciudadesService = new CiudadesService();
// Extender BaseService para tipo cliente con soporte para múltiples endpoints
class TipoClienteService extends BaseService {
  constructor() {
    super('core/tipocliente/'); // Endpoint principal
    // Definimos múltiples endpoints para mayor resistencia
    this.endpoints = [
      'core/tipocliente/',        // Endpoint principal 
      'pandora/tipocliente/',     // Endpoint alternativo
      'tipocliente/',             // Endpoint simple (probablemente no existe)
      'api/core/tipocliente/',    // Con prefijo api
      'api/pandora/tipocliente/', // Con prefijo api alternativo
    ];
  }
  
  // Sobreescribir getAll para intentar múltiples endpoints
  async getAll(params = {}, options = {}) {
    // Verificar token
    const token = localStorage.getItem('auth-token');
    if (!token) {
      console.warn('TipoClienteService: No hay token de autenticación disponible');
    } else if (!api.defaults.headers.common['Authorization']) {
      console.log('TipoClienteService: Estableciendo token en headers de axios');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Intentar todos los endpoints secuencialmente
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.endpoints[i];
      try {
        console.log(`TipoClienteService: Intentando cargar tipos de cliente desde ${endpoint}`);
        
        // Preparar configuración con headers explícitos para autenticación
        const config = {
          ...options,
          params,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000
        };
        
        const response = await api.get(endpoint, config);
        console.log(`TipoClienteService: ✅ Tipos de cliente cargados desde ${endpoint}:`, response.data);
        
        // Procesar datos - asegurar IDs numéricos
        let result = response.data;
        if (Array.isArray(result.results)) {
          result.results = result.results.map(item => ({
            ...item,
            id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id
          }));
        } else if (Array.isArray(result)) {
          // Si la respuesta es un array directamente
          result = {
            results: result.map(item => ({
              ...item,
              id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id
            }))
          };
        }
        
        return result;
      } catch (error) {
        console.error(`TipoClienteService: ❌ Error al cargar tipos de cliente desde ${endpoint}:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        // Si es el último endpoint, propagar el error
        if (i === this.endpoints.length - 1) {
          console.error('TipoClienteService: Todos los endpoints fallaron');
          throw this.handleError(error);
        }
        
        // Continuar con el siguiente endpoint
        console.log('TipoClienteService: Intentando siguiente endpoint...');
      }
    }
  }
  
  // Sobreescribir create para intentar múltiples endpoints
  async create(data) {
    console.log('TipoClienteService - Datos a crear:', data);
    
    if (!data.nombre) {
      throw new Error('El nombre del tipo de cliente es obligatorio');
    }
    
    // Asegurar que el dato esté en formato correcto
    const processedData = {
      nombre: String(data.nombre || '').trim(),
      activo: data.activo === undefined ? true : Boolean(data.activo)
    };
    
    // Verificar token
    const token = localStorage.getItem('auth-token');
    if (!token) {
      console.error('TipoClienteService: No hay token de autenticación disponible');
      throw new Error('No estás autenticado. Inicia sesión para continuar.');
    }
    
    // Intentar todos los endpoints
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.endpoints[i];
      try {
        console.log(`TipoClienteService: Intentando crear tipo de cliente en ${endpoint}`);
        
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000
        };
        
        const response = await api.post(endpoint, processedData, config);
        console.log(`TipoClienteService: ✅ Tipo de cliente creado en ${endpoint}:`, response.data);
        
        // Asegurar que el ID es numérico
        if (response.data && response.data.id && typeof response.data.id === 'string') {
          response.data.id = parseInt(response.data.id, 10);
        }
        
        return response.data;
      } catch (error) {
        console.error(`TipoClienteService: ❌ Error al crear tipo de cliente en ${endpoint}:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        // Si es el último endpoint, propagar el error
        if (i === this.endpoints.length - 1) {
          console.error('TipoClienteService: Todos los endpoints fallaron');
          throw this.handleError(error);
        }
        
        // Continuar con el siguiente endpoint
        console.log('TipoClienteService: Intentando siguiente endpoint...');
      }
    }
  }
}

export const tipoClienteService = new TipoClienteService();
// Extender BaseService para clientes con soporte para múltiples endpoints
class ClientesService extends BaseService {
  constructor() {
    super('core/clientes/'); // Volvemos a usar la ruta relativa correcta
    this.endpoints = [
      'core/clientes/',        // Endpoint principal 
      'pandora/clientes/',     // Endpoint secundario
      'clientes/',             // Endpoint simplificado (probablemente no existe)
      'api/clientes/',         // Incluyendo prefijo api completo por si acaso es necesario
      'api/core/clientes/',    // Incluyendo prefijo api completo por si acaso es necesario
      'api/pandora/clientes/', // Incluyendo prefijo api completo por si acaso es necesario
    ];
  }
  
  // Sobreescribir método create para intentar múltiples endpoints
  async create(data) {
    // Verificar campos obligatorios para evitar errores en el servidor
    const requiredFields = ['nombre', 'ruc', 'razon_social', 'email', 'zona', 'ciudad', 'tipo_cliente', 'direccion'];
    const missingFields = requiredFields.filter(field => !data[field] && data[field] !== 0);
    
    if (missingFields.length > 0) {
      console.error('ClientesService - CAMPOS OBLIGATORIOS FALTANTES:', missingFields);
      throw new Error(`Campos obligatorios faltantes: ${missingFields.join(', ')}`);
    }
    
    // Log detallado para ver los tipos y valores antes de procesamiento
    console.log('ClientesService - Datos ANTES de procesar:', {
      zona: {type: typeof data.zona, value: data.zona},
      ciudad: {type: typeof data.ciudad, value: data.ciudad},
      tipo_cliente: {type: typeof data.tipo_cliente, value: data.tipo_cliente},
      nombre: {type: typeof data.nombre, value: data.nombre},
      ruc: {type: typeof data.ruc, value: data.ruc}
    });
    
    // Asegurar conversión explícita a números enteros para IDs y campos requeridos correctamente formateados
    const processedData = {
      ...data,
      zona: data.zona ? parseInt(data.zona, 10) : null,
      ciudad: data.ciudad ? parseInt(data.ciudad, 10) : null,
      tipo_cliente: data.tipo_cliente ? parseInt(data.tipo_cliente, 10) : null,
      activo: data.activo === undefined ? true : Boolean(data.activo),
      // Asegurar que estos campos son strings
      nombre: String(data.nombre || '').trim(),
      alias: String(data.alias || '').trim(),
      razon_social: String(data.razon_social || '').trim(),
      ruc: String(data.ruc || '').trim(),
      email: String(data.email || '').trim(),
      direccion: String(data.direccion || '').trim(),
      telefono: data.telefono ? String(data.telefono).trim() : '',
    };
    
    // Verificación post-conversión para asegurar que todo es correcto
    console.log('ClientesService - Datos DESPUÉS de procesar:', {
      zona: {type: typeof processedData.zona, value: processedData.zona},
      ciudad: {type: typeof processedData.ciudad, value: processedData.ciudad},
      tipo_cliente: {type: typeof processedData.tipo_cliente, value: processedData.tipo_cliente}
    });
    
    // Mostrar información sobre URLs actuales
    console.log('ClientesService - URLs configuradas:', {
      baseURL: api.defaults.baseURL,
      endpoints: this.endpoints,
      urlsCompletas: this.endpoints.map(endpoint => `${api.defaults.baseURL}${endpoint}`)
    });
    
    // Intentando distintos endpoints con manejo de errores detallado
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.endpoints[i];
      
      try {
        console.log(`ClientesService: Intentando endpoint ${i+1}/${this.endpoints.length}: ${endpoint}`);
        
        const response = await api.post(endpoint, processedData, {
          timeout: 30000, // Aumentar timeout para operaciones de escritura
        });
        
        console.log(`ClientesService: ✅ Éxito con endpoint ${endpoint}:`, response.data);
        return response.data;
      } catch (error) {
        // Log detallado del error para diagnóstico
        console.error(`ClientesService: ❌ Error con endpoint ${endpoint}:`, {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          responseData: error.response?.data,
        });
        
        // Si es el último endpoint, propagar el error con detalles
        if (i === this.endpoints.length - 1) {
          console.error('ClientesService: Todos los endpoints fallaron. Último error:', error);
          
          // Crear un error más descriptivo
          const errorDetail = error.response?.data?.detail || 
                            error.response?.statusText || 
                            error.message || 
                            'Error desconocido';
          
          const enhancedError = new Error(`No se pudo crear el cliente. Razón: ${errorDetail}. 
            Verifique que la API está respondiendo correctamente y que los datos son válidos.`);
          
          throw this.handleError(enhancedError);
        }
        
        // Si no, continuar con el siguiente endpoint
        console.log('Intentando siguiente endpoint...');
      }
    }
  }
}

export const clientesService = new ClientesService();
export const pandoraService = createCatalogService('pandora');
export const categoriasService = createCatalogService('categorias');
export const especialidadesService = createCatalogService('especialidades');
export const marcaService = createCatalogService('marca');
export const procedenciaService = createCatalogService('procedencia');
export const tipoContratacionService = createCatalogService('tipocontratacion');
export const unidadesService = createCatalogService('unidades');
export const empresasClcService = createCatalogService('empresasclc');
export const preciosSieService = createCatalogService('preciossie', 'pandora'); // Usar el prefijo pandora
export const proveedoresService = createCatalogService('proveedores');
export const costosPandoraService = createCatalogService('costospandora');
export const vendedoresService = createCatalogService('vendedores');
export const contactosService = createCatalogService('contactos', 'pandora'); // Usar el prefijo pandora
export const procesosAuditadosService = createCatalogService('procesosauditados');

export default {
  zonasService,
  ciudadesService,
  tipoClienteService,
  clientesService,
  pandoraService,
  categoriasService,
  especialidadesService,
  marcaService,
  procedenciaService,
  tipoContratacionService,
  unidadesService,
  empresasClcService,
  preciosSieService,
  proveedoresService,
  costosPandoraService,
  vendedoresService,
  contactosService,
  procesosAuditadosService
};