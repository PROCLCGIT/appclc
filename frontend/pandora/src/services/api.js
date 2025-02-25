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
      const response = await api.put(`${this.endpoint}${id}/`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(id) {
    try {
      await api.delete(`${this.endpoint}${id}/`);
      return true;
    } catch (error) {
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
export const procesosAuditadosService = new BaseService('pandora/procesosauditados/');

// Para el módulo MsPref
export const msprefService = new MsPrefService();

// Servicios para módulo de productos
export const productosOfertadosService = new BaseService('products/productosofertados/');
export const productosDisponiblesService = new BaseService('products/productosdisponibles/');

