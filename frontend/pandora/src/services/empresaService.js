// src/services/empresaService.js
import api from '@/config/axios';

// Establecer timeout más largo para permitir depuración
const TIMEOUT = 30000; // 30 segundos

// Habilitar logging extensivo para depuración
const DEBUG = true;
export const getEmpresas = async (endpoint = "sri") => {
    if (DEBUG) console.log(`🔍 OBTENER: Buscando empresas en endpoint: blegal/${endpoint}/`);
    
    try {
      // Verificar token para debug
      const token = localStorage.getItem('auth-token');
      if (DEBUG) console.log(`🔑 Token disponible: ${!!token}`);
      
      if (!token) {
        console.warn("⚠️ No hay token de autenticación disponible");
        throw new Error("No hay token de autenticación");
      }
      
      // Usar la instancia configurada de axios con timeout más largo
      if (DEBUG) console.log(`📡 Enviando petición GET a: blegal/${endpoint}/`);
      
      const response = await api.get(`blegal/${endpoint}/`, { 
        timeout: TIMEOUT,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      if (DEBUG) console.log(`✅ Respuesta recibida. Status: ${response.status}`);
      
      if (response.status !== 200) {
        console.error(`❌ Error de respuesta: ${response.status}`);
        throw new Error(`Error al obtener datos: ${response.statusText}`);
      }
      
      // Procesamiento de datos
      const responseData = response.data;
      
      if (DEBUG) {
        console.log(`📊 Tipo de datos: ${typeof responseData}`);
        console.log(`📊 Es array?: ${Array.isArray(responseData)}`);
        console.log(`📊 Contenido:`, responseData);
      }
      
      // Convertir a formato adecuado
      if (responseData && !Array.isArray(responseData) && typeof responseData === 'object') {
        // Si tiene un campo 'results', ese es el array
        if (responseData.results) {
          if (DEBUG) console.log('📦 Usando campo results como array de datos');
          return responseData.results;
        }
        
        // Si es un objeto individual, convertirlo a array
        if (DEBUG) console.log('📦 Convirtiendo objeto a array:', [responseData]);
        return [responseData];
      }
      
      // Si no hay datos, devolver array vacío
      if (!responseData) {
        if (DEBUG) console.log('🔵 Sin datos, devolviendo array vacío');
        return [];
      }
      
      return responseData;
    } catch (error) {
      // Error detallado con emojis para mejor visibilidad en la consola
      console.error('❌ ERROR AL OBTENER EMPRESAS:', error);
      
      // Mejorar el manejo de errores con más detalles
      if (error.response) {
        // Error con respuesta del servidor
        console.error('🔥 Detalles de respuesta del servidor:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Manejar específicamente errores de autenticación o autorización
        if (error.response.status === 401) {
          console.error('🔒 ERROR DE AUTENTICACIÓN: Token inválido o expirado');
          // Limpiar el token para forzar relogin
          localStorage.removeItem('auth-token');
          localStorage.removeItem('refresh-token');
        } else if (error.response.status === 403) {
          console.error('⛔ ERROR DE AUTORIZACIÓN: No tiene permisos para acceder a este recurso');
        } else if (error.response.status === 404) {
          console.error(`🔍 ENDPOINT NO ENCONTRADO: blegal/${endpoint}/`);
        } else if (error.response.status === 500) {
          console.error(`💥 ERROR DEL SERVIDOR: ${error.response.statusText}`);
        }
      } else if (error.request) {
        // Error sin respuesta del servidor (problemas de red)
        console.error('📡 NO SE RECIBIÓ RESPUESTA DEL SERVIDOR:', error.request);
      } else {
        // Error durante la configuración de la solicitud
        console.error('⚙️ ERROR DE CONFIGURACIÓN:', error.message);
      }
      
      // Re-lanzar el error para que se maneje en los componentes
      throw error;
    }
  };
  
  // Función para crear una nueva empresa en el endpoint seleccionado
  export const createEmpresa = async (empresa, endpoint = "sri") => {
    if (DEBUG) console.log(`🔧 CREAR: Nueva empresa en blegal/${endpoint}/`, empresa);
    
    try {
      // Verificar token para debug
      const token = localStorage.getItem('auth-token');
      if (DEBUG) console.log(`🔑 Token disponible: ${!!token}`);
      
      if (!token) {
        console.warn("⚠️ No hay token de autenticación disponible");
        throw new Error("No hay token de autenticación");
      }
      
      // Enviar datos a la API
      if (DEBUG) console.log(`📡 Enviando petición POST a: blegal/${endpoint}/`);
      
      const response = await api.post(`blegal/${endpoint}/`, empresa, { 
        timeout: TIMEOUT,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });
      
      if (DEBUG) console.log(`✅ Respuesta recibida. Status: ${response.status}`);
      
      // Aceptar tanto 201 (Created) como 200 (OK)
      if (response.status !== 201 && response.status !== 200) {
        console.error(`❌ Error de respuesta: ${response.status}`);
        throw new Error(`Error al crear la empresa. Status: ${response.status}`);
      }
      
      if (DEBUG) console.log('📦 Datos del nuevo registro creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ERROR AL CREAR EMPRESA:', error);
      
      if (error.response) {
        console.error('🔥 Detalles de respuesta del servidor:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // Manejar específicamente errores de validación (campos incorrectos)
        if (error.response.status === 400) {
          console.error('🔍 ERROR DE VALIDACIÓN:', error.response.data);
        } else if (error.response.status === 401) {
          console.error('🔒 ERROR DE AUTENTICACIÓN: Token inválido o expirado');
        }
      } else if (error.request) {
        console.error('📡 NO SE RECIBIÓ RESPUESTA DEL SERVIDOR:', error.request);
      } else {
        console.error('⚙️ ERROR DE CONFIGURACIÓN:', error.message);
      }
      
      // Lanzamos el error para que se maneje en el componente
      throw error;
    }
  };
  