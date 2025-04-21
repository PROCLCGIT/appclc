/**
 * Services for catalog/reference data endpoints
 */

import { BaseService } from './BaseService';

/**
 * Generic factory function to create catalog services
 * @param {string} endpoint - The API endpoint for the catalog
 * @returns {BaseService} - A service instance for the catalog
 */
export const createCatalogService = (endpoint) => {
  return new BaseService(`core/${endpoint}/`);
};

// Create services for all the catalogs/reference data
export const zonasService = createCatalogService('zonas');
export const ciudadesService = createCatalogService('ciudades');
export const tipoClienteService = createCatalogService('tipocliente');
export const clientesService = createCatalogService('clientes');
export const pandoraService = createCatalogService('pandora');
export const categoriasService = createCatalogService('categorias');
export const especialidadesService = createCatalogService('especialidades');
export const marcaService = createCatalogService('marca');
export const procedenciaService = createCatalogService('procedencia');
export const tipoContratacionService = createCatalogService('tipocontratacion');
export const unidadesService = createCatalogService('unidades');
export const empresasClcService = createCatalogService('empresasclc');
export const preciosSieService = createCatalogService('preciossie');
export const proveedoresService = createCatalogService('proveedores');
export const costosPandoraService = createCatalogService('costospandora');
export const vendedoresService = createCatalogService('vendedores');
export const contactosService = createCatalogService('contactos');
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