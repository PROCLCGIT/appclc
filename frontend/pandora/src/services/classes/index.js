/**
 * Central export file for all API services
 */

// Base services
export { BaseService } from './BaseService';
export { FileService } from './FileService';
export { ExportService } from './ExportService';
export { ActionService } from './ActionService';

// Product services
import ProductService from './ProductService';
export const ProductoOfertadoService = ProductService.ProductoOfertadoService;
export const ProductoDisponibleService = ProductService.ProductoDisponibleService;
export const productosOfertadosService = new ProductoOfertadoService();
export const productosDisponiblesService = new ProductoDisponibleService();

// Proforma services
import ProformaServiceModule from './ProformaService';
export const ProformaService = ProformaServiceModule.ProformaService;
export const ProformaItemService = ProformaServiceModule.ProformaItemService;
export const ProformaConfigurationService = ProformaServiceModule.ProformaConfigurationService;
export const proformasService = new ProformaService();
export const proformaItemsService = new ProformaItemService();
export const proformaConfiguracionService = new ProformaConfigurationService();

// Brief services
import BriefServiceModule from './BriefService';
export const BriefService = BriefServiceModule.BriefService;
export const BriefItemService = BriefServiceModule.BriefItemService;
export const briefService = new BriefService();
export const briefItemsService = new BriefItemService();

// Catalog services (re-export all of them)
export * from './CatalogService';

// Class for mspref with import functionality (custom implementation)
import { BaseService } from './BaseService';
import api from '@/config/axios';

export class MsPrefService extends BaseService {
  constructor() {
    super('pandora/mspref/');
  }

  /**
   * Imports data from an Excel file
   * @param {File} file - The Excel file to import
   * @returns {Promise<Object>} - Import results
   */
  async importExcel(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`${this.endpoint}import/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

// Export MsPref service instance
export const msprefService = new MsPrefService();