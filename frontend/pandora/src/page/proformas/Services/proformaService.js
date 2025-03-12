// src/page/proformas/Services/proformaService.js
import api from "@/config/axios";

/**
 * Obtiene productos disponibles del inventario
 * @returns {Promise<Array>} Lista de productos
 */
export const getProducts = async () => {
  try {
    // Obtener productos del backend
    // En una implementación real, esto podría ser:
    // const response = await api.get('/api/products');
    // return response.data;
    
    // Datos mock para desarrollo
    return [
      { id: "PROD-001", name: "Laptop Dell XPS 15", unit: "unit", price: 1899.99, stock: 10 },
      { id: "PROD-002", name: "Monitor Ultrawide LG", unit: "unit", price: 499.99, stock: 15 },
      { id: "PROD-003", name: "Teclado mecánico Logitech", unit: "unit", price: 129.99, stock: 30 },
      { id: "PROD-004", name: "Mouse inalámbrico", unit: "unit", price: 49.99, stock: 50 },
      { id: "PROD-005", name: "Auriculares Bluetooth", unit: "unit", price: 89.99, stock: 25 },
      { id: "SERV-001", name: "Soporte técnico (hora)", unit: "hour", price: 45.00, stock: null },
      { id: "SERV-002", name: "Instalación de software", unit: "service", price: 60.00, stock: null },
      { id: "PACK-001", name: "Kit de oficina completo", unit: "kit", price: 2499.99, stock: 5 },
    ];
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
};

/**
 * Guarda una proforma en el backend
 * @param {Object} proforma - Datos de la proforma
 * @returns {Promise<Object>} Proforma guardada
 */
export const saveProforma = async (proforma) => {
  try {
    // En una implementación real, esto enviaría los datos al backend
    // const response = await api.post('/api/proformas', proforma);
    // return response.data;
    
    // Mock: simular guardado exitoso
    console.log("Proforma guardada:", proforma);
    return {
      ...proforma,
      id: `saved-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
  } catch (error) {
    console.error("Error al guardar proforma:", error);
    throw error;
  }
};

/**
 * Genera un PDF de la proforma
 * @param {Object} proforma - Datos de la proforma
 * @returns {Promise<Blob>} PDF generado
 */
export const generateProformaPDF = async (proforma) => {
  try {
    // En una implementación real, esto solicitaría al backend generar un PDF
    // const response = await api.post('/api/proformas/pdf', proforma, { responseType: 'blob' });
    // return response.data;
    
    // Mock para desarrollo
    console.log("Generando PDF para proforma:", proforma);
    return new Blob(["PDF simulado"], { type: 'application/pdf' });
  } catch (error) {
    console.error("Error al generar PDF:", error);
    throw error;
  }
};

/**
 * Busca proformas existentes según criterios
 * @param {Object} criteria - Criterios de búsqueda
 * @returns {Promise<Array>} Lista de proformas que coinciden
 */
export const searchProformas = async (criteria = {}) => {
  try {
    // Implementación real:
    // const response = await api.get('/api/proformas', { params: criteria });
    // return response.data;
    
    // Mock para desarrollo
    return [
      {
        id: 'PRO-20250309-0001',
        client: { name: 'Empresa ABC, S.A.' },
        date: '2025-03-01',
        total: 2499.99,
        status: 'active'
      },
      {
        id: 'PRO-20250309-0002',
        client: { name: 'Consultores XYZ' },
        date: '2025-03-05',
        total: 1299.99,
        status: 'expired'
      }
    ];
  } catch (error) {
    console.error("Error al buscar proformas:", error);
    throw error;
  }
};