/**
 * Base service for API endpoints that support exporting data
 * Extends BaseService with export capabilities
 */

import { BaseService } from './BaseService';
import api from '@/config/axios';

export class ExportService extends BaseService {
  /**
   * Exports data in a specific format (PDF, CSV, etc.)
   * @param {number|string} id - The record ID to export
   * @param {string} endpoint - The export endpoint suffix (e.g., 'exportar_pdf/')
   * @param {string} filename - The filename to use for the download
   * @param {Object} params - Optional query parameters
   * @returns {Promise<Blob>} - The exported file as a Blob
   */
  async exportFile(id, endpoint, filename, params = {}) {
    try {
      const numericId = this.validateId(id);
      
      const response = await api.get(`${this.endpoint}${numericId}/${endpoint}`, {
        responseType: 'blob',
        params
      });
      
      // Create a download link for the blob
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  /**
   * Exports data as PDF
   * @param {number|string} id - The record ID to export
   * @param {string} [endpoint='exportar_pdf/'] - The export endpoint
   * @param {string} [filename=null] - Custom filename (defaults to [type]-[id].pdf)
   * @returns {Promise<Blob>} - The PDF file as a Blob
   */
  async exportPdf(id, endpoint = 'exportar_pdf/', filename = null) {
    const documentType = this.endpoint.split('/')[0] || 'document';
    const defaultFilename = `${documentType}-${id}.pdf`;
    return this.exportFile(id, endpoint, filename || defaultFilename);
  }
  
  /**
   * Exports data as CSV
   * @param {number|string} id - The record ID to export
   * @param {string} [endpoint='exportar_csv/'] - The export endpoint
   * @param {string} [filename=null] - Custom filename (defaults to [type]-[id].csv)
   * @returns {Promise<Blob>} - The CSV file as a Blob
   */
  async exportCsv(id, endpoint = 'exportar_csv/', filename = null) {
    const documentType = this.endpoint.split('/')[0] || 'document';
    const defaultFilename = `${documentType}-${id}.csv`;
    return this.exportFile(id, endpoint, filename || defaultFilename);
  }
  
  /**
   * Exports data as Excel
   * @param {number|string} id - The record ID to export
   * @param {string} [endpoint='exportar_excel/'] - The export endpoint
   * @param {string} [filename=null] - Custom filename (defaults to [type]-[id].xlsx)
   * @returns {Promise<Blob>} - The Excel file as a Blob
   */
  async exportExcel(id, endpoint = 'exportar_excel/', filename = null) {
    const documentType = this.endpoint.split('/')[0] || 'document';
    const defaultFilename = `${documentType}-${id}.xlsx`;
    return this.exportFile(id, endpoint, filename || defaultFilename);
  }
}

export default ExportService;