/**
 * Services for brief-related API endpoints
 */

import { BaseService } from './BaseService';
import { ExportService } from './ExportService';
import api from '@/config/axios';

export class BriefService extends ExportService {
  constructor() {
    super('brief/briefs/');
  }
  
  /**
   * Gets statistics about briefs
   * @returns {Promise<Object>} - Brief statistics
   */
  async getStats() {
    try {
      const response = await api.get(`${this.endpoint}stats/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export class BriefItemService extends BaseService {
  constructor() {
    super('brief/briefitems/');
  }
  
  /**
   * Gets brief items by unit
   * @returns {Promise<Array>} - Brief items grouped by unit
   */
  async getByUnit() {
    try {
      const response = await api.get(`${this.endpoint}por_unidad/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  /**
   * Gets items for a specific brief
   * @param {number|string} briefId - The brief ID
   * @returns {Promise<Array>} - Items belonging to the brief
   */
  async getByBrief(briefId) {
    try {
      const response = await api.get(this.endpoint, {
        params: { id_brief: briefId }
      });
      return response.data.results || response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default {
  BriefService,
  BriefItemService
};