/**
 * Utilidades para manejar clientes y conversión de datos
 */

/**
 * Normaliza los IDs de un cliente para asegurar que todos los campos
 * que representen IDs sean numéricos para compatibilidad con la API.
 * 
 * @param {Object} cliente - Objeto cliente con datos posiblemente en string
 * @returns {Object} Cliente con IDs convertidos a tipo numérico
 */
export const normalizarIDsCliente = (cliente) => {
  if (!cliente) return null;
  
  return {
    ...cliente,
    // ID principal
    id: cliente.id ? Number(cliente.id) : null,
    // IDs de referencias
    zona: cliente.zona ? Number(cliente.zona) : null,
    ciudad: cliente.ciudad ? Number(cliente.ciudad) : null,
    tipo_cliente: cliente.tipo_cliente ? Number(cliente.tipo_cliente) : null,
  };
};

/**
 * Normaliza un array de clientes para asegurar que todos los IDs sean numéricos
 * 
 * @param {Array} clientes - Array de objetos cliente
 * @returns {Array} Array de clientes con IDs normalizados
 */
export const normalizarArrayClientes = (clientes) => {
  if (!Array.isArray(clientes)) return [];
  
  return clientes.map(cliente => normalizarIDsCliente(cliente));
};

/**
 * Formatea un cliente para ser usado en la UI (por ejemplo, en formularios)
 * 
 * @param {Object} cliente - Objeto cliente 
 * @returns {Object} Cliente formateado para UI
 */
export const formatearClienteParaUI = (cliente) => {
  const clienteNormalizado = normalizarIDsCliente(cliente);
  
  if (!clienteNormalizado) return null;
  
  return {
    id: clienteNormalizado.id,
    name: clienteNormalizado.nombre || "Cliente sin nombre",
    attention: clienteNormalizado.persona_contacto || "",
    email: clienteNormalizado.email || "",
    phone: clienteNormalizado.telefono || "",
    address: clienteNormalizado.direccion || "",
    ruc: clienteNormalizado.ruc || "",
    // Incluir IDs relacionados normalizados para operaciones futuras
    zona: clienteNormalizado.zona,
    ciudad: clienteNormalizado.ciudad,
    tipo_cliente: clienteNormalizado.tipo_cliente
  };
};

/**
 * Verifica si un cliente tiene todos los campos obligatorios
 * 
 * @param {Object} cliente - Objeto cliente a validar
 * @returns {boolean} Verdadero si el cliente es válido
 */
export const validarCliente = (cliente) => {
  if (!cliente) return false;
  
  // Verificar campos obligatorios
  return Boolean(
    cliente.nombre && 
    cliente.ruc &&
    cliente.zona &&
    cliente.ciudad &&
    cliente.tipo_cliente
  );
};

/**
 * Extraer mensaje de error estándar de una respuesta de error
 * 
 * @param {Error} error - Objeto de error (normalmente de axios)
 * @returns {string} Mensaje de error formateado
 */
export const extraerMensajeError = (error) => {
  if (!error) return "Error desconocido";
  
  // Extraer detalles específicos del error
  if (error.response?.data) {
    const errorData = error.response.data;
    
    if (typeof errorData === 'string') {
      return errorData;
    } else if (errorData.detail) {
      return errorData.detail;
    } else if (errorData.message) {
      return errorData.message;
    } else if (typeof errorData === 'object') {
      // Formatear errores por campo
      let mensajeError = "";
      
      Object.entries(errorData).forEach(([campo, mensaje]) => {
        const mensajeFormateado = Array.isArray(mensaje) ? mensaje.join(', ') : mensaje;
        mensajeError += `${campo}: ${mensajeFormateado}\n`;
      });
      
      return mensajeError.trim() || "Error en datos del cliente";
    }
  }
  
  // Caso base: usar mensaje genérico del error
  return error.message || "Error al procesar datos del cliente";
};