// src/services/api.js
import api from '@/config/axios';

export class BaseService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async getAll(params = {}) {
    try {
      const response = await api.get(this.endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getById(id) {
    try {
      const response = await api.get(`${this.endpoint}${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async create(data) {
    try {
      const response = await api.post(this.endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(id, data) {
    try {
      // Asegurarse de que el ID sea un número
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
      console.log(`Enviando PUT request regular a ${this.endpoint}${numericId}/`);
      
      const response = await api.put(`${this.endpoint}${numericId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error en update:', error);
      throw this.handleError(error);
    }
  }

  async delete(id) {
    try {
      // Asegurarse de que el ID sea un número
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
      await api.delete(`${this.endpoint}${numericId}/`);
      return true;
    } catch (error) {
      console.error('Error en delete:', error);
      throw this.handleError(error);
    }
  }

  async search(query) {
    try {
      const response = await api.get(this.endpoint, {
        params: { search: query },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      throw {
        status: error.response.status,
        message:
          error.response.data.detail ||
          error.response.data.message ||
          this.getErrorMessage(error.response.status),
        errors: error.response.data,
      };
    } else if (error.request) {
      throw {
        status: 503,
        message:
          'No se pudo conectar con el servidor. Por favor, verifica tu conexión.',
      };
    } else {
      throw {
        status: 500,
        message: 'Error al procesar la solicitud.',
      };
    }
  }

  getErrorMessage(status) {
    const errorMessages = {
      400: 'Datos inválidos. Por favor, verifica la información.',
      401: 'No autorizado. Por favor, inicia sesión nuevamente.',
      403: 'No tienes permiso para realizar esta acción.',
      404: 'El recurso solicitado no existe.',
      422: 'No se pudo procesar la solicitud. Verifica los datos.',
      429: 'Demasiadas solicitudes. Por favor, espera un momento.',
      500: 'Error interno del servidor.',
      503: 'Servicio no disponible temporalmente.',
    };
    return errorMessages[status] || 'Ha ocurrido un error inesperado.';
  }
}

// Clase extendida para MsPref que incluye la funcionalidad de importación
export class MsPrefService extends BaseService {
  constructor() {
    super('pandora/mspref/');
  }

  async importExcel(file) {
    try {
      const formData = new FormData();
      // OJO: usamos 'file' para que coincida con la vista Django
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

// Exportación de servicios básicos de pandora
export const zonasService = new BaseService('pandora/zonas/');
export const ciudadesService = new BaseService('pandora/ciudades/');
export const tipoClienteService = new BaseService('pandora/tipocliente/');
export const clientesService = new BaseService('pandora/clientes/');
export const pandoraService = new BaseService('pandora/pandora/');
export const categoriasService = new BaseService('pandora/categorias/');
export const especialidadesService = new BaseService('pandora/especialidades/');
export const marcaService = new BaseService('pandora/marca/');
export const procedenciaService = new BaseService('pandora/procedencia/');
export const tipoContratacionService = new BaseService('pandora/tipocontratacion/');
export const unidadesService = new BaseService('pandora/unidades/');
export const empresasClcService = new BaseService('pandora/empresasclc/');
export const preciosSieService = new BaseService('pandora/preciossie/');
export const proveedoresService = new BaseService('pandora/proveedores/');
export const costosPandoraService = new BaseService('pandora/costospandora/');
export const vendedoresService = new BaseService('pandora/vendedores/');
export const contactosService = new BaseService('pandora/contactos/');
export const procesosAuditadosService = new BaseService('pandora/procesosauditados/');

// Para el módulo MsPref
export const msprefService = new MsPrefService();

// Clase para manejar servicios con archivos
export class ProductosOfertadosService extends BaseService {
  constructor() {
    super('products/productosofertados/');
  }

  async create(data) {
    try {
      // Verificamos si hay imágenes para enviar
      const hasImages = data.imagenes_referencia && data.imagenes_referencia.length > 0;
      
      if (hasImages) {
        // Preparamos un FormData para enviar con archivos
        const formData = new FormData();
        
        // Agregamos todos los campos de texto al FormData
        Object.keys(data).forEach(key => {
          if (key !== 'imagenes_referencia') {
            formData.append(key, data[key]);
          }
        });
        
        // Agregamos cada imagen al FormData con el MISMO nombre para todas
        // Esto crea una lista de archivos con la misma clave
        let newImages = 0;
        data.imagenes_referencia.forEach((file) => {
          if (file instanceof File) {
            formData.append('uploaded_images', file);
            newImages++;
          }
        });
        
        console.log(`Enviando ${newImages} imágenes nuevas`);
        
        // Enviamos con el content-type correcto para archivos
        const response = await api.post(this.endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return response.data;
      } else {
        // Si no hay imágenes, usamos el método normal
        return super.create(data);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  async update(id, data) {
    try {
      // Preparamos siempre un FormData para mantener consistencia
      const formData = new FormData();
      
      // Agregamos todos los campos de texto al FormData
      Object.keys(data).forEach(key => {
        if (key !== 'imagenes_referencia' && key !== 'documentos') {
          formData.append(key, data[key]);
        }
      });
      
      // Verificamos si hay imágenes para enviar
      const hasImages = data.imagenes_referencia && data.imagenes_referencia.length > 0;
      
      if (hasImages) {
        // Agregamos cada imagen nueva al FormData con el MISMO nombre
        let newImages = 0;
        let existingImages = 0;
        
        data.imagenes_referencia.forEach((file) => {
          if (file instanceof File) {
            formData.append('uploaded_images', file);
            newImages++;
          } else if (file.id) {
            existingImages++;
            // Si necesitamos pasar imágenes existentes, lo haríamos aquí
          }
        });
        
        console.log(`Actualizando con ${newImages} imágenes nuevas y ${existingImages} existentes`);
      }
      
      // Enviamos con el content-type correcto para archivos
      const response = await api.put(`${this.endpoint}${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  async uploadImages(id, files) {
    try {
      const formData = new FormData();
      
      // Agregamos cada archivo al FormData con la clave 'imagenes'
      // Nota: Esta clave debe coincidir con request.FILES.getlist('imagenes') en el backend
      files.forEach(file => {
        formData.append('imagenes', file);
      });
      
      console.log(`Enviando ${files.length} imágenes al endpoint upload_images`);
      
      const response = await api.post(`${this.endpoint}${id}/upload_images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("Error en uploadImages:", error);
      throw this.handleError(error);
    }
  }
  
  async uploadDocuments(id, files, titles, types, descriptions) {
    try {
      const formData = new FormData();
      
      // Agregamos cada documento y sus metadatos al FormData
      files.forEach((file, index) => {
        formData.append('uploaded_documents', file);
        
        if (titles && titles[index]) {
          formData.append('document_titles', titles[index]);
        }
        
        if (types && types[index]) {
          formData.append('document_types', types[index]);
        }
        
        if (descriptions && descriptions[index]) {
          formData.append('document_descriptions', descriptions[index]);
        }
      });
      
      console.log(`Enviando ${files.length} documentos al endpoint upload_documents`);
      
      const response = await api.post(`${this.endpoint}${id}/upload_documents/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("Error en uploadDocuments:", error);
      throw this.handleError(error);
    }
  }
  
  async deleteImage(id, imageId) {
    try {
      const response = await api.delete(`${this.endpoint}${id}/delete_image/`, {
        data: { imagen_id: imageId }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  async deleteDocument(id, documentId) {
    try {
      const response = await api.delete(`${this.endpoint}${id}/delete_document/`, {
        data: { documento_id: documentId }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

// Clase para manejar productos disponibles con archivos
export class ProductosDisponiblesService extends BaseService {
  constructor() {
    super('products/productosdisponibles/');
  }

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
  
  async updateWithFormData(id, formData) {
    try {
      // Asegurarse de que el ID sea un número
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
      console.log(`Enviando PUT request a ${this.endpoint}${numericId}/`);
      
      const response = await api.put(`${this.endpoint}${numericId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error en updateWithFormData:', error);
      throw this.handleError(error);
    }
  }
}

// Servicios para módulo de productos
export const productosOfertadosService = new ProductosOfertadosService();
export const productosDisponiblesService = new ProductosDisponiblesService();