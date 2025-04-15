/**
 * Base service for API endpoints that support custom actions
 * Extends BaseService with action capabilities
 */

import { BaseService } from './BaseService';
import api from '@/config/axios';

export class ActionService extends BaseService {
  /**
   * Performs a custom action on a record
   * @param {number|string} id - The record ID
   * @param {string} action - The action endpoint (e.g., 'approve/')
   * @param {Object} data - The data to send with the action
   * @returns {Promise<Object>} - The response data
   */
  async performAction(id, action, data = {}) {
    try {
      const numericId = this.validateId(id);
      const response = await api.post(`${this.endpoint}${numericId}/${action}/`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  /**
   * Changes the status of a record
   * @param {number|string} id - The record ID
   * @param {string} status - The new status
   * @param {string} [notes=''] - Optional notes about the status change
   * @returns {Promise<Object>} - The updated record
   */
  async changeStatus(id, status, notes = '') {
    return this.performAction(id, 'cambiar_estado', { estado: status, notas: notes });
  }
  
  /**
   * Approves a record
   * @param {number|string} id - The record ID
   * @param {string} [notes=''] - Optional approval notes
   * @returns {Promise<Object>} - The approved record
   */
  async approve(id, notes = '') {
    return this.performAction(id, 'aprobar', { notas: notes });
  }
  
  /**
   * Rejects a record
   * @param {number|string} id - The record ID
   * @param {string} [notes=''] - Optional rejection notes
   * @returns {Promise<Object>} - The rejected record
   */
  async reject(id, notes = '') {
    return this.performAction(id, 'rechazar', { notas: notes });
  }
  
  /**
   * Sends a record (to the next approval step)
   * @param {number|string} id - The record ID
   * @param {string} [notes=''] - Optional notes
   * @returns {Promise<Object>} - The sent record
   */
  async send(id, notes = '') {
    return this.performAction(id, 'enviar', { notas: notes });
  }
  
  /**
   * Duplicates a record
   * @param {number|string} id - The record ID to duplicate
   * @returns {Promise<Object>} - The duplicated record
   */
  async duplicate(id) {
    return this.performAction(id, 'duplicar');
  }
}

export default ActionService;