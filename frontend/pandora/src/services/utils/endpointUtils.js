/**
 * endpointUtils.js - Utilidades para manejar endpoints múltiples
 * 
 * Este archivo contiene funciones y constantes para ayudar a administrar
 * múltiples endpoints en diferentes servicios.
 */

import api from '@/config/axios';

// Constantes de endpoints para los diferentes servicios API
export const API_ENDPOINTS = {
  // Entidades principales
  CLIENTES: [
    'core/clientes/',
    'pandora/clientes/',
    'madvance/clientes/',
    'clientes/'
  ],
  
  // Catálogos de referencia
  ZONAS: [
    'core/zonas/',
    'zonas/'
  ],
  CIUDADES: [
    'core/ciudades/',
    'ciudades/'
  ],
  TIPO_CLIENTE: [
    'core/tipocliente/',
    'tipocliente/'
  ]
};

/**
 * Intenta ejecutar una operación en múltiples endpoints hasta que uno tenga éxito
 * 
 * @param {Array<string>} endpoints - Lista de endpoints a intentar
 * @param {Function} operation - Función que ejecuta la operación en un endpoint
 * @param {Object} params - Parámetros para la operación
 * @returns {Promise<any>} - Resultado de la operación exitosa
 * @throws {Error} - Si ningún endpoint tiene éxito
 */
export async function tryMultipleEndpoints(endpoints, operation, params = {}) {
  if (!endpoints || !endpoints.length) {
    throw new Error('No se proporcionaron endpoints');
  }
  
  let lastError = null;
  
  // Intentar cada endpoint en secuencia
  for (const endpoint of endpoints) {
    try {
      console.log(`Intentando operación en ${endpoint}`);
      const result = await operation(endpoint, params);
      console.log(`✅ Éxito con ${endpoint}`);
      return result;
    } catch (error) {
      console.warn(`❌ Error con ${endpoint}:`, error.message);
      lastError = error;
    }
  }
  
  // Si llegamos aquí, ningún endpoint funcionó
  console.error('❌ Todos los endpoints fallaron');
  throw lastError || new Error('Todos los endpoints fallaron');
}

/**
 * Funciones específicas para operaciones CRUD con múltiples endpoints
 */

/**
 * Obtener datos de múltiples endpoints
 * @param {Array<string>} endpoints - Lista de endpoints a intentar
 * @param {Object} params - Parámetros de consulta
 * @returns {Promise<Object>} - Datos obtenidos
 */
export async function getData(endpoints, params = {}) {
  return tryMultipleEndpoints(endpoints, async (endpoint) => {
    const response = await api.get(endpoint, {
      params,
      timeout: 15000
    });
    return response.data;
  });
}

/**
 * Crear un nuevo registro intentando múltiples endpoints
 * @param {Array<string>} endpoints - Lista de endpoints a intentar
 * @param {Object} data - Datos a enviar
 * @returns {Promise<Object>} - Datos del registro creado
 */
export async function createData(endpoints, data) {
  return tryMultipleEndpoints(endpoints, async (endpoint) => {
    // Crear configuración específica para operaciones de escritura
    const config = {
      timeout: 30000, // 30 segundos para operaciones de escritura
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response = await api.post(endpoint, data, config);
    return response.data;
  });
}

/**
 * Actualizar un registro intentando múltiples endpoints
 * @param {Array<string>} endpoints - Lista de endpoints a intentar
 * @param {number|string} id - ID del registro a actualizar
 * @param {Object} data - Datos actualizados
 * @returns {Promise<Object>} - Datos del registro actualizado
 */
export async function updateData(endpoints, id, data) {
  return tryMultipleEndpoints(endpoints, async (endpoint) => {
    const config = {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response = await api.put(`${endpoint}${id}/`, data, config);
    return response.data;
  });
}

/**
 * Eliminar un registro intentando múltiples endpoints
 * @param {Array<string>} endpoints - Lista de endpoints a intentar
 * @param {number|string} id - ID del registro a eliminar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export async function deleteData(endpoints, id) {
  return tryMultipleEndpoints(endpoints, async (endpoint) => {
    const response = await api.delete(`${endpoint}${id}/`);
    return response.data;
  });
}

export default {
  API_ENDPOINTS,
  tryMultipleEndpoints,
  getData,
  createData,
  updateData,
  deleteData
};