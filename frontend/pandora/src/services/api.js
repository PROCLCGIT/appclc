// src/services/api.js

/**
 * Central API services file
 * This file exports all API service instances for use throughout the application
 */

// Import all service instances from the classes directory
import {
  // Base service classes
  BaseService,
  FileService,
  ExportService,
  ActionService,
  
  // Service instances - Products
  productosOfertadosService,
  productosDisponiblesService,
  
  // Service instances - Proformas
  proformasService,
  proformaItemsService,
  proformaConfiguracionService,
  
  // Service instances - Brief
  briefService,
  briefItemsService,
  
  // Service instances - MsPref
  msprefService,
  
  // Service instances - Catalogs
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
} from './classes';

// Re-export all service instances
export {
  // Re-export base classes for extension
  BaseService,
  FileService,
  ExportService,
  ActionService,
  
  // Re-export service instances
  productosOfertadosService,
  productosDisponiblesService,
  proformasService,
  proformaItemsService,
  proformaConfiguracionService,
  briefService,
  briefItemsService,
  msprefService,
  
  // Re-export catalog services
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

// Default export of all services as a bundle
export default {
  // Product services
  productosOfertadosService,
  productosDisponiblesService,
  
  // Proforma services
  proformasService,
  proformaItemsService,
  proformaConfiguracionService,
  
  // Brief services
  briefService,
  briefItemsService,
  
  // MsPref service
  msprefService,
  
  // Catalog services
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