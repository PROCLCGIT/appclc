/**
 * Service for Proforma-related API endpoints
 * Combines multiple service capabilities
 */

import { BaseService } from './BaseService';
import { ExportService } from './ExportService';
import { ActionService } from './ActionService';
import api from '@/config/axios';

export class ProformaService extends ActionService {
  constructor() {
    super('proformas/proformas/');
    // Create exportService as a composition rather than inheritance
    this.exportService = new ExportService(this.endpoint);
    
    // Enlazar el método transformProforma para mantener el contexto this
    this.transformProforma = this.transformProforma.bind(this);
  }
  
  /**
   * Sobrescribe el método getAll para incluir transformación de datos
   * @param {Object} params - Query parameters for filtering results
   * @param {Object} options - Additional options for the request
   * @returns {Promise<Array>} - The response data array
   */
  async getAll(params = {}, options = {}) {
    try {
      // Usar la implementación original desde BaseService
      const response = await super.getAll(params, options);
      
      // Transformar los datos antes de devolverlos
      if (response?.results && Array.isArray(response.results)) {
        response.results = response.results.map(proforma => this.transformProforma(proforma));
        return response;
      } else if (Array.isArray(response)) {
        return response.map(proforma => this.transformProforma(proforma));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Transforma una proforma para asegurar que tiene la estructura correcta
   * @param {Object} proforma - La proforma a transformar
   * @returns {Object} - La proforma transformada
   */
  transformProforma(proforma) {
    // Verificar si tenemos datos válidos
    if (!proforma || typeof proforma !== 'object') {
      return proforma;
    }
    
    try {
      // Asegurarse de que es una copia para no modificar el original
      const transformed = { ...proforma };
      
      // Normalizar campos individuales
      this.normalizeProformaNombre(transformed);
      this.normalizeProformaCliente(transformed);
      
      return transformed;
    } catch (error) {
      // Devolver el objeto original en caso de error
      return proforma;
    }
  }
  
  /**
   * Normaliza el campo 'nombre' de la proforma
   * @param {Object} proforma - La proforma a normalizar (modificada in-place)
   * @private
   */
  normalizeProformaNombre(proforma) {
    // Si ya tiene un nombre válido, no hacer nada
    if (proforma.nombre && proforma.nombre !== '') {
      return;
    }
    
    // Buscar el nombre en diferentes fuentes
    if (proforma.quote?.nombre) {
      proforma.nombre = proforma.quote.nombre;
    } else if (proforma.descripcion) {
      proforma.nombre = proforma.descripcion;
    } else {
      // Último recurso: generar nombre basado en número o ID
      proforma.nombre = `Proforma #${proforma.numero || proforma.id}`;
    }
  }
  
  /**
   * Normaliza los datos del cliente en la proforma
   * @param {Object} proforma - La proforma a normalizar (modificada in-place)
   * @private
   */
  normalizeProformaCliente(proforma) {
    // Intentar extraer datos del cliente de diferentes fuentes
    const clientData = this.extractClientData(proforma);
    
    // Asignar el cliente normalizado al formato esperado por el frontend
    proforma.client = clientData;
    
    // Preservar el objeto cliente original para compatibilidad
    if (!proforma.cliente) {
      proforma.cliente = this.convertToLegacyClientFormat(clientData);
    }
  }
  
  /**
   * Extrae información del cliente de diferentes fuentes en la proforma
   * @param {Object} proforma - La proforma de donde extraer datos
   * @returns {Object} - Datos del cliente normalizados
   * @private
   */
  extractClientData(proforma) {
    // Caso 1: Tenemos cliente_detail (formato backend detallado)
    if (proforma.cliente_detail) {
      return {
        id: proforma.cliente_detail.id,
        name: proforma.cliente_detail.nombre || "",
        attention: proforma.atencion_a || "",
        email: proforma.cliente_detail.email || "",
        phone: proforma.cliente_detail.telefono || "",
        address: proforma.cliente_detail.direccion || "",
        ruc: proforma.cliente_detail.ruc || ""
      };
    }
    
    // Caso 2: Cliente como objeto completo
    if (proforma.cliente && typeof proforma.cliente === 'object' && proforma.cliente.id) {
      return {
        id: proforma.cliente.id,
        name: proforma.cliente.nombre || "",
        attention: proforma.atencion_a || "",
        email: proforma.cliente.email || "",
        phone: proforma.cliente.telefono || "",
        address: proforma.cliente.direccion || "",
        ruc: proforma.cliente.ruc || ""
      };
    }
    
    // Caso 3: Cliente como ID, tenemos que construir un objeto parcial
    if (proforma.cliente && (typeof proforma.cliente === 'string' || typeof proforma.cliente === 'number')) {
      return this.buildPartialClientData(proforma);
    }
    
    // Caso 4: No hay datos de cliente, crear uno predeterminado
    return {
      id: null,
      name: "Cliente no especificado",
      attention: proforma.atencion_a || "",
      email: "",
      phone: "",
      address: "",
      ruc: ""
    };
  }
  
  /**
   * Construye datos parciales del cliente cuando solo tenemos un ID
   * @param {Object} proforma - La proforma con información parcial
   * @returns {Object} - Datos del cliente parcialmente completados
   * @private
   */
  buildPartialClientData(proforma) {
    const clientData = {
      id: proforma.cliente || 'unknown',
      name: 'Cliente sin detalles',
      attention: proforma.atencion_a || "",
      email: "",
      phone: "",
      address: "",
      ruc: ""
    };
    
    // Intentar extraer datos del quote
    if (proforma.quote) {
      // Buscar nombre del cliente
      if (proforma.quote.cliente_nombre) {
        clientData.name = proforma.quote.cliente_nombre;
      } else if (proforma.quote.cliente?.nombre) {
        clientData.name = proforma.quote.cliente.nombre;
      }
      
      // Buscar RUC del cliente
      if (proforma.quote.cliente_ruc) {
        clientData.ruc = proforma.quote.cliente_ruc;
      } else if (proforma.quote.cliente?.ruc) {
        clientData.ruc = proforma.quote.cliente.ruc;
      }
    }
    
    // Preferir cliente_nombre si está disponible
    if (proforma.cliente_nombre) {
      clientData.name = proforma.cliente_nombre;
    }
    
    return clientData;
  }
  
  /**
   * Convierte el formato de cliente del frontend al formato legacy
   * @param {Object} clientData - Datos del cliente en formato frontend
   * @returns {Object} - Datos en formato legacy para compatibilidad
   * @private
   */
  convertToLegacyClientFormat(clientData) {
    if (!clientData || !clientData.id) {
      return null;
    }
    
    return {
      id: clientData.id,
      nombre: clientData.name,
      email: clientData.email,
      telefono: clientData.phone,
      direccion: clientData.address,
      ruc: clientData.ruc
    };
  }
  
  /**
   * Searches for products to include in a proforma
   * @param {string} term - The search term
   * @param {string} [source='all'] - The source of products to search
   * @returns {Promise<Array>} - Matching products
   */
  async searchProducts(term, source = 'all') {
    try {
      // Validar parámetros antes de hacer la petición
      if (!term || term.trim().length === 0) {
        return []; // Devolver array vacío si no hay término de búsqueda
      }
      
      // Establecer un timeout más corto para búsquedas de productos
      const response = await api.get('proformas/buscar-productos/', {
        params: { term, source },
        timeout: 15000, // 15 segundos max para búsquedas
        _highPriority: true, // Marcar como alta prioridad para evitar cancelación
        _disableRetry: false // Permitir reintentos automáticos
      });
      
      // Validar la respuesta antes de devolverla
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('searchProducts: Respuesta no es un array:', response.data);
        return []; // Devolver array vacío como fallback
      }
      
      return response.data;
    } catch (error) {
      // Manejar específicamente el error de servidor (500)
      if (error.response && error.response.status === 500) {
        console.error('Error 500 en búsqueda de productos:', error.message);
        // Devolver array vacío en lugar de propagar el error
        // para evitar que la interfaz se rompa por errores del servidor
        return [];
      }
      
      throw this.handleError(error);
    }
  }
  
  /**
   * Alias para searchProducts - mantiene compatibilidad con código existente
   * @param {string} term - El término de búsqueda
   * @param {string} [source='all'] - La fuente de productos a buscar
   * @returns {Promise<Array>} - Productos coincidentes
   */
  async buscarProductos(term, source = 'all') {
    return this.searchProducts(term, source);
  }
  
  /**
   * Retrieves current proforma configuration
   * @returns {Promise<Object>} - The configuration data
   */
  async getConfiguration() {
    try {
      const response = await api.get('proformas/configuracion-actual/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  /**
   * Retrieves dashboard metrics for proformas
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @param {Object} additionalParams - Additional filter parameters
   * @returns {Promise<Object>} - Dashboard metrics
   */
  async getDashboard(startDate, endDate, additionalParams = {}) {
    try {
      const params = {
        ...additionalParams
      };
      
      // Solo añadir los parámetros si tienen valores válidos
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      // Realizar la petición
      const response = await api.get(`${this.endpoint}dashboard/`, {
        params
      });
      
      // Transformar los datos para mejor compatibilidad con el frontend
      const responseData = response.data;
      
      // Asegurar que tenemos la estructura esperada para totalStats
      if (!responseData.totalStats && responseData.total_proformas !== undefined) {
        responseData.totalStats = {
          totalProformas: responseData.total_proformas || 0,
          proformasAprobadas: responseData.por_estado?.aprobada?.count || 0,
          tasaConversion: responseData.total_proformas ? 
            Math.round((responseData.por_estado?.aprobada?.count || 0) / responseData.total_proformas * 100) : 0,
          montoTotal: responseData.total_monto || 0
        };
      }
      
      return responseData;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  /**
   * Alias for getDashboard for compatibility with existing code
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @param {Object} additionalParams - Additional filter parameters
   * @returns {Promise<Object>} - Dashboard metrics
   */
  async obtenerDashboard(startDate, endDate, additionalParams = {}) {
    return this.getDashboard(startDate, endDate, additionalParams);
  }
  
  /**
   * Exports a proforma as CSV
   * @param {number|string} id - The proforma ID
   * @returns {Promise<Blob>} - The CSV file
   */
  async exportCsv(id) {
    return this.exportService.exportCsv(id);
  }
  
  /**
   * Exports a proforma as PDF
   * @param {number|string} id - The proforma ID
   * @returns {Promise<Blob>} - The PDF file
   */
  async exportPdf(id) {
    return this.exportService.exportPdf(id);
  }
  
  /**
   * Exports a proforma as Excel (detailed format)
   * @param {number|string} id - The proforma ID
   * @returns {Promise<Blob>} - The Excel file
   */
  async exportExcelDetail(id) {
    try {
      const response = await api.get(`${this.endpoint}${id}/exportar_excel_detalle/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  /**
   * Exports proformas list as Excel with optional filters
   * @param {Object} params - Filter parameters (estado, cliente_id, fecha_inicio, fecha_fin)
   * @returns {Promise<Blob>} - The Excel file
   */
  async exportExcelList(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}exportar_excel/`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  /**
   * Exports statistical report as Excel with optional filters
   * @param {Object} params - Filter parameters (estado, cliente_id, fecha_inicio, fecha_fin, vendedor_id, incluir_ventas)
   * @returns {Promise<Blob>} - The Excel file containing statistical report
   */
  async exportStatisticalReport(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}reporte_estadisticas/`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  /**
   * Downloads a file from a URL
   * @param {string} url - The URL to download from
   * @returns {Promise<boolean>} - A promise that resolves when the download begins
   */
  async downloadFile(url) {
    try {
      // Obtener el token JWT para autenticación
      const token = localStorage.getItem('access_token');
      
      // Configurar headers con autenticación
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Solicitar el archivo con responseType 'blob'
      const response = await api.get(url, {
        headers,
        responseType: 'blob'
      });
      
      // Obtener el nombre del archivo de los headers de respuesta
      let filename = 'download.xlsx';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      // Crear URL para el blob
      const blob = new Blob([response.data], {
        type: response.headers['content-type']
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Crear un link temporal para descargar el archivo
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export class ProformaItemService extends BaseService {
  constructor() {
    super('proformas/items/');
  }
}

export class ProformaConfigurationService extends BaseService {
  constructor() {
    super('proformas/configuracion/');
  }
}

export default {
  ProformaService,
  ProformaItemService,
  ProformaConfigurationService
};