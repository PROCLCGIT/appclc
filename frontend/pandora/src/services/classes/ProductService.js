/**
 * Services for product-related API endpoints
 */

import { BaseService } from './BaseService';
import { FileService } from './FileService';
import api from '@/config/axios';

export class ProductoOfertadoService extends FileService {
  constructor() {
    super('products/productosofertados/');
  }

  /**
   * Creates a new product with optional images
   * @param {Object} data - The product data
   * @returns {Promise<Object>} - The created product
   */
  async create(data) {
    return this.createWithFiles(data, 'imagenes_referencia', ['documentos']);
  }
  
  /**
   * Updates a product with optional images
   * @param {number|string} id - The product ID
   * @param {Object} data - The updated product data
   * @returns {Promise<Object>} - The updated product
   */
  async update(id, data) {
    return this.updateWithFiles(id, data, 'uploaded_images', ['documentos']);
  }
  
  /**
   * Uploads images to a product
   * @param {number|string} id - The product ID
   * @param {File[]} files - The image files to upload
   * @returns {Promise<Object>} - The updated product with images
   */
  async uploadImages(id, files) {
    return this.uploadFiles(id, files, 'upload_images', 'imagenes');
  }
  
  /**
   * Uploads documents to a product
   * @param {number|string} id - The product ID
   * @param {File[]} files - The document files to upload
   * @param {string[]} titles - Document titles
   * @param {string[]} types - Document types
   * @param {string[]} descriptions - Document descriptions
   * @returns {Promise<Object>} - The updated product with documents
   */
  async uploadDocuments(id, files, titles, types, descriptions) {
    return this.uploadFiles(id, files, 'upload_documents', 'uploaded_documents', {
      'document_titles': titles,
      'document_types': types,
      'document_descriptions': descriptions
    });
  }
  
  /**
   * Deletes an image from a product
   * @param {number|string} id - The product ID
   * @param {number|string} imageId - The image ID to delete
   * @returns {Promise<Object>} - The result of the operation
   */
  async deleteImage(id, imageId) {
    return this.deleteFile(id, imageId, 'delete_image', 'imagen_id');
  }
  
  /**
   * Deletes a document from a product
   * @param {number|string} id - The product ID
   * @param {number|string} documentId - The document ID to delete
   * @returns {Promise<Object>} - The result of the operation
   */
  async deleteDocument(id, documentId) {
    return this.deleteFile(id, documentId, 'delete_document', 'documento_id');
  }
}

export class ProductoDisponibleService extends FileService {
  constructor() {
    super('products/productosdisponibles/');
  }
  
  /**
   * Creates a new product with FormData (for files)
   * @param {FormData} formData - The FormData with product data and files
   * @returns {Promise<Object>} - The created product
   */
  async createWithFormData(formData) {
    try {
      const response = await api.post(this.endpoint, formData, {
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
   * Updates a product with FormData (for files)
   * @param {number|string} id - The product ID
   * @param {FormData} formData - The FormData with product data and files
   * @returns {Promise<Object>} - The updated product
   */
  async updateWithFormData(id, formData) {
    try {
      const numericId = this.validateId(id);
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
}

export default {
  ProductoOfertadoService,
  ProductoDisponibleService
};