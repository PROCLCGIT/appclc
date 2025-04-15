/**
 * Base service for API endpoints that handle file uploads
 * Extends BaseService with file upload capabilities
 */

import { BaseService } from './BaseService';
import api from '@/config/axios';

export class FileService extends BaseService {
  /**
   * Creates a new record with file upload support
   * @param {Object} data - The record data, may include file arrays
   * @param {string} fileField - The field name for file uploads in FormData
   * @param {string[]} excludeFields - Fields to exclude from FormData
   * @returns {Promise<Object>} - The created record
   */
  async createWithFiles(data, fileField, excludeFields = []) {
    try {
      // Check if there are files to upload
      const hasFiles = data[fileField] && data[fileField].length > 0;
      
      if (hasFiles) {
        // Create FormData for file upload
        const formData = this.createFormData(data, [...excludeFields, fileField]);
        
        // Add files to FormData with the same key for all files
        let fileCount = 0;
        data[fileField].forEach((file) => {
          if (file instanceof File) {
            formData.append(fileField, file);
            fileCount++;
          }
        });
        
        // Send request with multipart/form-data
        const response = await api.post(this.endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return response.data;
      } else {
        // If no files, use regular create method
        return super.create(data);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  /**
   * Updates a record with file upload support
   * @param {number|string} id - The record ID
   * @param {Object} data - The record data, may include file arrays
   * @param {string} fileField - The field name for file uploads in FormData
   * @param {string[]} excludeFields - Fields to exclude from FormData
   * @returns {Promise<Object>} - The updated record
   */
  async updateWithFiles(id, data, fileField, excludeFields = []) {
    try {
      const numericId = this.validateId(id);
      
      // Create FormData for file upload
      const formData = this.createFormData(data, [...excludeFields, fileField]);
      
      // Add files to FormData, only adding File objects
      const hasFiles = data[fileField] && data[fileField].length > 0;
      let fileCount = 0;
      
      if (hasFiles) {
        data[fileField].forEach((file) => {
          if (file instanceof File) {
            formData.append(fileField, file);
            fileCount++;
          }
        });
      }
      
      // Send request with multipart/form-data
      const response = await api.put(`${this.endpoint}${numericId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  /**
   * Uploads files to an existing record
   * @param {number|string} id - The record ID
   * @param {File[]} files - Array of files to upload
   * @param {string} endpoint - The endpoint suffix (e.g., 'upload_images/')
   * @param {string} fieldName - Field name for the files in FormData
   * @param {Object} metadata - Optional metadata to include with files
   * @returns {Promise<Object>} - Server response
   */
  async uploadFiles(id, files, endpoint, fieldName, metadata = {}) {
    try {
      const numericId = this.validateId(id);
      const formData = new FormData();
      
      // Add each file to FormData
      files.forEach((file, index) => {
        formData.append(fieldName, file);
        
        // Add metadata if provided
        Object.entries(metadata).forEach(([key, values]) => {
          if (values && values[index]) {
            formData.append(`${key}`, values[index]);
          }
        });
      });
      
      // Send request with multipart/form-data
      const response = await api.post(`${this.endpoint}${numericId}/${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  /**
   * Deletes a file from a record
   * @param {number|string} id - The record ID
   * @param {number|string} fileId - The file ID to delete
   * @param {string} endpoint - The endpoint suffix (e.g., 'delete_image/')
   * @param {string} fileIdField - Field name for the file ID in the request body
   * @returns {Promise<Object>} - Server response
   */
  async deleteFile(id, fileId, endpoint, fileIdField) {
    try {
      const numericId = this.validateId(id);
      const response = await api.delete(`${this.endpoint}${numericId}/${endpoint}`, {
        data: { [fileIdField]: fileId }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default FileService;