import ApiService from './api.service';

/**
 * Servicio para manejar operaciones relacionadas con documentos
 */
class DocumentService {
  /**
   * Constructor
   */
  constructor() {
    this.api = new ApiService();
    this.baseUrl = '/docmanager';
  }

  /**
   * Obtener lista de documentos con filtros y paginación
   * @param {Object} params - Parámetros de filtrado y paginación
   * @returns {Promise<Object>} - Respuesta con lista de documentos y metadatos
   */
  async getDocuments(params = {}) {
    return this.api.get(`${this.baseUrl}/documents/`, params);
  }

  /**
   * Obtener un documento por su ID
   * @param {number} id - ID del documento
   * @returns {Promise<Object>} - Documento
   */
  async getDocument(id) {
    return this.api.get(`${this.baseUrl}/documents/${id}/`);
  }

  /**
   * Crear un nuevo documento
   * @param {FormData} formData - Datos del documento y archivo
   * @returns {Promise<Object>} - Documento creado
   */
  async createDocument(formData) {
    return this.api.uploadFile(`${this.baseUrl}/documents/`, formData);
  }

  /**
   * Actualizar un documento existente
   * @param {number} id - ID del documento
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Documento actualizado
   */
  async updateDocument(id, data) {
    return this.api.patch(`${this.baseUrl}/documents/${id}/`, data);
  }

  /**
   * Eliminar un documento (soft delete)
   * @param {number} id - ID del documento
   * @returns {Promise<Object>} - Respuesta de confirmación
   */
  async deleteDocument(id) {
    try {
      const response = await this.api.post(`${this.baseUrl}/documents/${id}/soft_delete/`);
      return response || { success: true };
    } catch (error) {
      console.error('Error en soft delete:', error);
      // Intentar hard delete como fallback
      try {
        await this.api.delete(`${this.baseUrl}/documents/${id}/`);
        return { success: true };
      } catch (deleteError) {
        console.error('Error en hard delete:', deleteError);
        throw deleteError;
      }
    }
  }

  /**
   * Descargar un documento
   * @param {number} id - ID del documento
   * @returns {Promise<Object>} - URL de descarga
   */
  async downloadDocument(id) {
    return this.api.post(`${this.baseUrl}/documents/${id}/download/`);
  }

  /**
   * Obtener enlace público para un documento
   * @param {number} id - ID del documento
   * @returns {Promise<Object>} - URL pública
   */
  async getPublicLink(id) {
    try {
      return await this.api.get(`${this.baseUrl}/documents/${id}/public-download/`);
    } catch (error) {
      // Intentar generar un enlace público si no existe
      return this.api.post(`${this.baseUrl}/documents/${id}/generate-public-link/`);
    }
  }

  /**
   * Cambiar estado de favorito de un documento
   * @param {number} id - ID del documento
   * @returns {Promise<Object>} - Estado actualizado
   */
  async toggleFavorite(id) {
    return this.api.post(`${this.baseUrl}/documents/${id}/toggle_favorite/`);
  }

  /**
   * Obtener lista de categorías
   * @returns {Promise<Object>} - Lista de categorías
   */
  async getCategories() {
    return this.api.get(`${this.baseUrl}/categories/`);
  }

  /**
   * Crear una nueva categoría
   * @param {Object} data - Datos de la categoría
   * @returns {Promise<Object>} - Categoría creada
   */
  async createCategory(data) {
    return this.api.post(`${this.baseUrl}/categories/`, data);
  }

  /**
   * Obtener lista de etiquetas
   * @returns {Promise<Object>} - Lista de etiquetas
   */
  async getTags() {
    return this.api.get(`${this.baseUrl}/tags/`);
  }

  /**
   * Crear una nueva etiqueta
   * @param {Object} data - Datos de la etiqueta
   * @returns {Promise<Object>} - Etiqueta creada
   */
  async createTag(data) {
    return this.api.post(`${this.baseUrl}/tags/`, data);
  }

  /**
   * Añadir etiquetas a un documento
   * @param {number} documentId - ID del documento
   * @param {Array<number>} tagIds - IDs de las etiquetas
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async addTags(documentId, tagIds) {
    return this.api.post(`${this.baseUrl}/documents/${documentId}/add_tags/`, {
      tag_ids: tagIds
    });
  }

  /**
   * Eliminar una etiqueta de un documento
   * @param {number} documentId - ID del documento
   * @param {number} tagId - ID de la etiqueta
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async removeTag(documentId, tagId) {
    return this.api.post(`${this.baseUrl}/documents/${documentId}/remove_tag/`, {
      tag_id: tagId
    });
  }

  /**
   * Obtener lista de grupos
   * @returns {Promise<Object>} - Lista de grupos
   */
  async getGroups() {
    return this.api.get(`${this.baseUrl}/groups/`);
  }

  /**
   * Crear un nuevo grupo
   * @param {Object} data - Datos del grupo
   * @returns {Promise<Object>} - Grupo creado
   */
  async createGroup(data) {
    return this.api.post(`${this.baseUrl}/groups/`, data);
  }

  /**
   * Obtener un grupo por su ID
   * @param {number} id - ID del grupo
   * @returns {Promise<Object>} - Grupo
   */
  async getGroup(id) {
    return this.api.get(`${this.baseUrl}/groups/${id}/`);
  }

  /**
   * Eliminar un grupo
   * @param {number} id - ID del grupo
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async deleteGroup(id) {
    return this.api.delete(`${this.baseUrl}/groups/${id}/`);
  }

  /**
   * Obtener lista de colecciones
   * @returns {Promise<Object>} - Lista de colecciones
   */
  async getCollections() {
    return this.api.get(`${this.baseUrl}/collections/`);
  }

  /**
   * Crear una nueva colección
   * @param {Object} data - Datos de la colección
   * @returns {Promise<Object>} - Colección creada
   */
  async createCollection(data) {
    return this.api.post(`${this.baseUrl}/collections/`, data);
  }

  /**
   * Obtener una colección por su ID
   * @param {number} id - ID de la colección
   * @returns {Promise<Object>} - Colección
   */
  async getCollection(id) {
    return this.api.get(`${this.baseUrl}/collections/${id}/`);
  }

  /**
   * Obtener documentos de una colección
   * @param {number} id - ID de la colección
   * @returns {Promise<Object>} - Lista de documentos
   */
  async getCollectionDocuments(id) {
    return this.api.get(`${this.baseUrl}/collections/${id}/documents/`);
  }

  /**
   * Eliminar una colección
   * @param {number} id - ID de la colección
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async deleteCollection(id) {
    return this.api.delete(`${this.baseUrl}/collections/${id}/`);
  }

  /**
   * Exportar una colección
   * @param {number} id - ID de la colección
   * @returns {Promise<Object>} - URL de descarga
   */
  async exportCollection(id) {
    return this.api.post(`${this.baseUrl}/collections/${id}/export/`);
  }

  /**
   * Añadir documentos a una colección
   * @param {number} collectionId - ID de la colección
   * @param {Array<number>} documentIds - IDs de los documentos
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async addDocumentsToCollection(collectionId, documentIds) {
    return this.api.post(`${this.baseUrl}/collections/${collectionId}/add_documents/`, {
      document_ids: documentIds
    });
  }

  /**
   * Buscar documentos con términos de búsqueda
   * @param {string} query - Término de búsqueda
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} - Resultados de búsqueda
   */
  async searchDocuments(query, params = {}) {
    return this.api.get(`${this.baseUrl}/documents/search/`, {
      q: query,
      ...params
    });
  }
}

// Exportar una instancia única del servicio
export const documentService = new DocumentService();
export default DocumentService;