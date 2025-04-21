// Servicio para gestionar proformas
import { api } from './api';

const basePath = '/proformas/proformas/';

const proformasService = {
  api,
  basePath,

  // Obtener todas las proformas con opción de filtrado
  async getAll(options = {}) {
    try {
      const response = await this.api.get(this.basePath, { params: options });
      
      // Transformar los datos antes de devolverlos
      let results = [];
      
      if (response.data?.results && Array.isArray(response.data.results)) {
        results = response.data.results.map(this.transformProforma);
        response.data.results = results;
        return response.data;
      } else if (Array.isArray(response.data)) {
        results = response.data.map(this.transformProforma);
        return results;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error en getAll proformas:", error);
      throw error;
    }
  },

  // Método para transformar la estructura de datos
  transformProforma(proforma) {
    // Crear copia para no modificar el original
    const transformed = { ...proforma };
    
    // No modificar el nombre original de la proforma
    // Solo asignar un valor por defecto si no existe
    if (!transformed.nombre) {
      transformed.nombre = `Proforma #${transformed.numero || transformed.id}`;
    }
    
    // Asegurar que cliente sea un objeto con nombre
    if (!transformed.cliente || typeof transformed.cliente !== 'object') {
      const clienteId = transformed.cliente;
      transformed.cliente = { 
        id: clienteId || 'unknown',
        nombre: 'Seleccionar cliente' 
      };
      
      // Intentar extraer datos del quote
      if (transformed.quote) {
        if (transformed.quote.cliente_nombre) {
          transformed.cliente.nombre = transformed.quote.cliente_nombre;
        } else if (transformed.quote.cliente && transformed.quote.cliente.nombre) {
          transformed.cliente.nombre = transformed.quote.cliente.nombre;
        }
        
        if (transformed.quote.cliente_ruc) {
          transformed.cliente.ruc = transformed.quote.cliente_ruc;
        } else if (transformed.quote.cliente && transformed.quote.cliente.ruc) {
          transformed.cliente.ruc = transformed.quote.cliente.ruc;
        }
      }
    } else if (!transformed.cliente.nombre) {
      transformed.cliente.nombre = 'Cliente sin detalles';
      
      // Intentar extraer de quote
      if (transformed.quote) {
        if (transformed.quote.cliente_nombre) {
          transformed.cliente.nombre = transformed.quote.cliente_nombre;
        } else if (transformed.quote.cliente && transformed.quote.cliente.nombre) {
          transformed.cliente.nombre = transformed.quote.cliente.nombre;
        }
      }
    }
    
    return transformed;
  },
  
  // Obtener una proforma por ID
  async getById(id) {
    try {
      const response = await this.api.get(`${this.basePath}${id}/`);
      return this.transformProforma(response.data);
    } catch (error) {
      console.error(`Error al obtener proforma #${id}:`, error);
      throw error;
    }
  },

  // Otros métodos del servicio
  async duplicar(id) {
    try {
      const response = await this.api.post(`${this.basePath}${id}/duplicar/`);
      return response.data;
    } catch (error) {
      console.error(`Error al duplicar proforma #${id}:`, error);
      throw error;
    }
  },

  async cambiarEstado(id, estado) {
    try {
      const response = await this.api.post(`${this.basePath}${id}/cambiar_estado/`, { estado });
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar estado de proforma #${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene la configuración general para proformas
   * @returns {Promise<Object>} Configuración de proformas
   */
  async obtenerConfiguracion() {
    try {
      const response = await this.api.get(`${this.basePath}configuracion/`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener configuración de proformas:", error);
      throw error;
    }
  },

  /**
   * Guarda la configuración general para proformas
   * @param {Object} config Objeto con la configuración a guardar
   * @returns {Promise<Object>} Configuración guardada
   */
  async guardarConfiguracion(config) {
    try {
      const response = await this.api.post(`${this.basePath}configuracion/`, config);
      return response.data;
    } catch (error) {
      console.error("Error al guardar configuración de proformas:", error);
      throw error;
    }
  }
};

export { proformasService }; 