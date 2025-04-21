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
      
      console.log('ProformaService.getAll: Transformando datos de respuesta');
      
      // Transformar los datos antes de devolverlos
      if (response?.results && Array.isArray(response.results)) {
        console.log(`Transformando ${response.results.length} proformas del paginador`);
        response.results = response.results.map(proforma => this.transformProforma(proforma));
        return response;
      } else if (Array.isArray(response)) {
        console.log(`Transformando ${response.length} proformas del array`);
        return response.map(proforma => this.transformProforma(proforma));
      }
      
      return response;
    } catch (error) {
      console.error("Error en getAll proformas:", error);
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
      console.error('ProformaService.transformProforma: Datos de proforma inválidos:', proforma);
      return proforma;
    }
    
    try {
      // Log detallado para depuración
      console.log(`TRANSFORMACIÓN DE PROFORMA #${proforma.id || 'N/A'}: 
        - Nombre original: "${proforma.nombre || 'VACÍO'}"
        - Tipo de nombre: ${typeof proforma.nombre}
        - Número: "${proforma.numero || 'N/A'}"
        - Cliente: ${typeof proforma.cliente === 'object' ? 'objeto' : typeof proforma.cliente}
        - Cliente_detail: ${proforma.cliente_detail ? 'presente' : 'ausente'}`);
      
      // Asegurarse de que es una copia para no modificar el original
      const transformed = { ...proforma };
      
      // Asegurar que nombre tenga un valor
      if (!transformed.nombre || transformed.nombre === '') {
        console.log(`  - Nombre vacío, asignando valor predeterminado`);
        if (transformed.quote && transformed.quote.nombre) {
          console.log(`  - Usando nombre del quote: "${transformed.quote.nombre}"`);
          transformed.nombre = transformed.quote.nombre;
        } else if (transformed.descripcion) {
          console.log(`  - Usando descripción: "${transformed.descripcion}"`);
          transformed.nombre = transformed.descripcion;
        } else {
          const nombrePredeterminado = `Proforma #${transformed.numero || transformed.id}`;
          console.log(`  - Usando nombre predeterminado: "${nombrePredeterminado}"`);
          transformed.nombre = nombrePredeterminado;
        }
      } else {
        console.log(`  - Preservando nombre original: "${transformed.nombre}"`);
      }
      
      // Crear o actualizar el campo 'client' que espera el frontend
      let clientData = null;
      
      // Primero, verificar si tenemos cliente_detail (que viene del backend)
      if (transformed.cliente_detail) {
        console.log('  - Usando cliente_detail del backend');
        clientData = {
          id: transformed.cliente_detail.id,
          name: transformed.cliente_detail.nombre || "",
          attention: transformed.atencion_a || "",
          email: transformed.cliente_detail.email || "",
          phone: transformed.cliente_detail.telefono || "",
          address: transformed.cliente_detail.direccion || "",
          ruc: transformed.cliente_detail.ruc || ""
        };
        console.log('  - Cliente mapeado desde cliente_detail:', clientData);
      }
      // Si no hay cliente_detail pero sí hay cliente como objeto
      else if (transformed.cliente && typeof transformed.cliente === 'object' && transformed.cliente.id) {
        console.log('  - Cliente encontrado como objeto:', transformed.cliente);
        clientData = {
          id: transformed.cliente.id,
          name: transformed.cliente.nombre || "",
          attention: transformed.atencion_a || "",
          email: transformed.cliente.email || "",
          phone: transformed.cliente.telefono || "",
          address: transformed.cliente.direccion || "",
          ruc: transformed.cliente.ruc || ""
        };
        console.log('  - Cliente mapeado desde cliente objeto:', clientData);
      }
      // Si cliente es solo un ID, intentamos completar la información
      else if (transformed.cliente && (typeof transformed.cliente === 'string' || typeof transformed.cliente === 'number')) {
        const clienteId = transformed.cliente;
        console.log(`  - Cliente es solo un ID (${clienteId}), creando objeto completo`);
        
        clientData = {
          id: clienteId || 'unknown',
          name: 'Cliente sin detalles',
          attention: transformed.atencion_a || "",
          email: "",
          phone: "",
          address: "",
          ruc: ""
        };
        
        // Intentar extraer datos del quote o cliente_nombre
        if (transformed.quote) {
          if (transformed.quote.cliente_nombre) {
            console.log(`  - Usando nombre del cliente del quote: "${transformed.quote.cliente_nombre}"`);
            clientData.name = transformed.quote.cliente_nombre;
          } else if (transformed.quote.cliente && transformed.quote.cliente.nombre) {
            console.log(`  - Usando nombre del cliente.nombre del quote: "${transformed.quote.cliente.nombre}"`);
            clientData.name = transformed.quote.cliente.nombre;
          }
          
          if (transformed.quote.cliente_ruc) {
            clientData.ruc = transformed.quote.cliente_ruc;
          } else if (transformed.quote.cliente && transformed.quote.cliente.ruc) {
            clientData.ruc = transformed.quote.cliente.ruc;
          }
        }
        
        // Si tenemos cliente_nombre, usarlo
        if (transformed.cliente_nombre) {
          console.log(`  - Usando cliente_nombre directo: "${transformed.cliente_nombre}"`);
          clientData.name = transformed.cliente_nombre;
        }
        
        console.log('  - Cliente creado a partir del ID:', clientData);
      }
      
      // Asignar el clientData al campo 'client' que espera el frontend
      if (clientData) {
        transformed.client = clientData;
        console.log('  - Campo client creado para compatibilidad con frontend:', transformed.client);
      } else {
        console.log('  - No se pudo crear cliente, utilizando objeto vacío');
        transformed.client = {
          id: null,
          name: "Cliente no especificado",
          attention: transformed.atencion_a || "",
          email: "",
          phone: "",
          address: "",
          ruc: ""
        };
      }
      
      // También preservamos el objeto cliente original para compatibilidad
      transformed.cliente = transformed.cliente || (clientData ? { 
        id: clientData.id,
        nombre: clientData.name,
        email: clientData.email,
        telefono: clientData.phone,
        direccion: clientData.address,
        ruc: clientData.ruc
      } : null);
      
      // Log final para ver resultado
      console.log(`  - Resultado: nombre="${transformed.nombre}", client=${typeof transformed.client === 'object' ? 
        `{id:${transformed.client.id}, name:${transformed.client.name}}` : transformed.client}`);
      
      return transformed;
    } catch (error) {
      console.error('Error al transformar proforma:', error);
      // Devolver el objeto original en caso de error
      return proforma;
    }
  }
  
  /**
   * Searches for products to include in a proforma
   * @param {string} term - The search term
   * @param {string} [source='all'] - The source of products to search
   * @returns {Promise<Array>} - Matching products
   */
  async searchProducts(term, source = 'all') {
    try {
      console.log(`ProformaService.searchProducts: Buscando "${term}" en fuente "${source}"`);
      const response = await api.get('proformas/buscar-productos/', {
        params: { term, source }
      });
      console.log('ProformaService.searchProducts: Respuesta recibida:', response.data);
      return response.data;
    } catch (error) {
      console.error('ProformaService.searchProducts: Error:', error);
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
   * @returns {Promise<Object>} - Dashboard metrics
   */
  async getDashboard(startDate, endDate) {
    try {
      const response = await api.get('proformas/dashboard/', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  /**
   * Alias for getDashboard for compatibility with existing code
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} - Dashboard metrics
   */
  async obtenerDashboard(startDate, endDate) {
    return this.getDashboard(startDate, endDate);
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