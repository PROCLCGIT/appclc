// src/pages/proformas/hooks/useEnhancedProformaQuery.js

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createEmptyProforma } from "../utils/proformaUtils";
import { toast } from "sonner";

// Importar los hooks de React Query
import { 
  useProformasQuery, 
  useProformaDetailQuery,
  proformaKeys 
} from "@/hooks/queries/useProformasQuery";

/**
 * Hook mejorado para gestionar proformas con React Query
 * Reemplaza al hook anterior combinando gestión de estado local con caché gestionada por React Query
 */
export default function useEnhancedProformaQuery() {
  const queryClient = useQueryClient();
  
  // Estado para controlar qué proformas están abiertas en pestañas y cuál está activa
  const [proformas, setProformas] = useState(() => {
    const emptyProforma = createEmptyProforma();
    emptyProforma.items = [];
    return [emptyProforma];
  });
  
  // ID de la pestaña/proforma activa
  const [activeProformaId, setActiveProformaId] = useState(proformas[0].id);
  
  // Bandera para controlar si queremos cargar proformas existentes al iniciar
  const [loadExisting, setLoadExisting] = useState(false);
  
  // Estado para el modo de previsualización
  const [previewMode, setPreviewMode] = useState(false);

  // Consulta para obtener la lista de proformas con React Query
  const { 
    proformas: savedProformas,
    isLoading: loadingSavedProformas,
    isFetching: fetchingSavedProformas,
    refetch: refetchSavedProformas,
    createProforma,
    updateProforma: updateSavedProforma,
    changeProformaState,
    duplicateProforma,
  } = useProformasQuery({
    enabled: loadExisting, // Solo cargar cuando loadExisting es true
    showToasts: false, // Gestionamos nuestros propios toasts
  });

  // Obtener la proforma activa
  const activeProforma = proformas.find((p) => p.id === activeProformaId) || proformas[0];
  
  // Extraer savedId si existe para consultar detalles
  const activeSavedId = activeProforma?.savedId;

  // Consulta para obtener detalles de la proforma activa (si es una proforma guardada)
  const {
    data: activeProformaDetails,
    isLoading: loadingActiveDetails,
    isFetching: fetchingActiveDetails,
    refetch: refetchActiveDetails,
  } = useProformaDetailQuery(activeSavedId, {
    enabled: Boolean(activeSavedId),  // Solo consulta cuando hay un savedId
    staleTime: 1000 * 60 * 5,  // 5 minutos
  });

  // Actualizar los detalles de la proforma activa cuando cambian los datos
  useEffect(() => {
    if (activeProformaDetails && activeSavedId) {
      // Transformar el formato de API a formato interno
      const formattedDetails = transformApiToInternalFormat(activeProformaDetails);
      
      // Actualizar la proforma activa con los nuevos detalles manteniendo el id local
      setProformas(prev => {
        return prev.map(p => {
          if (p.id === activeProformaId) {
            return {
              ...formattedDetails,
              id: p.id, // Mantener el ID local
            };
          }
          return p;
        });
      });
    }
  }, [activeProformaDetails, activeProformaId, activeSavedId]);

  /**
   * Transforma los datos de la API al formato interno de proformas
   */
  const transformApiToInternalFormat = useCallback((apiProforma) => {
    if (!apiProforma) return null;
    
    // Extraer datos de cliente
    let clientData = null;
    if (apiProforma.cliente_detail) {
      clientData = {
        id: apiProforma.cliente_detail.id,
        name: apiProforma.cliente_detail.nombre || "",
        attention: apiProforma.atencion_a || "",
        email: apiProforma.cliente_detail.email || "",
        phone: apiProforma.cliente_detail.telefono || "",
        address: apiProforma.cliente_detail.direccion || "",
        ruc: apiProforma.cliente_detail.ruc || ""
      };
    } else if (apiProforma.cliente && typeof apiProforma.cliente === 'object') {
      clientData = {
        id: apiProforma.cliente.id,
        name: apiProforma.cliente.nombre || "",
        attention: apiProforma.atencion_a || "",
        email: apiProforma.cliente.email || "",
        phone: apiProforma.cliente.telefono || "",
        address: apiProforma.cliente.direccion || "",
        ruc: apiProforma.cliente.ruc || ""
      };
    }
    
    // Formatear los ítems
    const formattedItems = Array.isArray(apiProforma.items) ? apiProforma.items.map(item => {
      return {
        id: item.id || Date.now() + Math.random(),
        savedId: item.id,
        code: item.codigo || "",
        description: item.descripcion || "Item sin descripción",
        unit: item.unidad || "Unidad",
        quantity: parseFloat(item.cantidad) || 0,
        unitPrice: parseFloat(item.precio_unitario) || 0,
        discount: parseFloat(item.porcentaje_descuento) || 0,
        total: parseFloat(item.total) || 0,
        source: item.tipo_item || 'personalizado',
        productId: item.producto_ofertado?.id || item.producto_disponible?.id || null,
        original: item.producto_ofertado || item.producto_disponible || null
      };
    }) : [];
    
    // Formatear la proforma completa
    return {
      savedId: apiProforma.id,
      quote: {
        number: apiProforma.numero || `PRO-${new Date().getFullYear()}-XXXX`,
        name: apiProforma.nombre || "",
        date: new Date(apiProforma.fecha_emision || Date.now()),
        expiryDate: new Date(apiProforma.fecha_vencimiento || (Date.now() + 30*24*60*60*1000)),
        paymentTerms: apiProforma.condiciones_pago || "50% anticipo, 50% contra entrega",
        deliveryTime: apiProforma.tiempo_entrega || "5 días hábiles",
        subtotal: typeof apiProforma.subtotal === 'number' ? apiProforma.subtotal.toString() : apiProforma.subtotal || "0",
        tax: typeof apiProforma.impuesto === 'number' ? apiProforma.impuesto.toString() : apiProforma.impuesto || "0",
        total: typeof apiProforma.total === 'number' ? apiProforma.total.toString() : apiProforma.total || "0",
        taxRate: apiProforma.porcentaje_impuesto || 12,
        notes: apiProforma.notes || apiProforma.notas || ""
      },
      client: clientData,
      items: formattedItems,
      estado: apiProforma.estado || 'borrador',
      previewMode: false
    };
  }, []);

  /**
   * Transforma de formato interno a formato de API para operaciones de guardado/actualización
   */
  const transformInternalToApiFormat = useCallback((internalProforma) => {
    if (!internalProforma) return null;
    
    const { quote, client, items } = internalProforma;
    
    // Crear objeto base para API
    const apiProforma = {
      numero: quote?.number,
      nombre: quote?.name,
      fecha_emision: quote?.date instanceof Date ? quote.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      fecha_vencimiento: quote?.expiryDate instanceof Date ? quote.expiryDate.toISOString().split('T')[0] : new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0],
      condiciones_pago: quote?.paymentTerms || "50% anticipo, 50% contra entrega",
      tiempo_entrega: quote?.deliveryTime || "5 días hábiles",
      porcentaje_impuesto: parseFloat(quote?.taxRate) || 12,
      notas: quote?.notes || "",
      
      // Datos del cliente
      cliente: client?.id || null,
      atencion_a: client?.attention || "",
      
      // Montos (opcionales, se calculan en backend)
      subtotal: parseFloat(quote?.subtotal) || 0,
      impuesto: parseFloat(quote?.tax) || 0,
      total: parseFloat(quote?.total) || 0,
    };
    
    // Si hay savedId, incluirlo para actualizaciones
    if (internalProforma.savedId) {
      apiProforma.id = internalProforma.savedId;
    }
    
    return apiProforma;
  }, []);

  /**
   * Función para cargar proformas guardadas y actualizar el estado local
   */
  const loadSavedProformas = async (options = {}) => {
    try {
      // Opciones de configuración
      const { 
        showToasts = true, 
        itemsLimit = 10,
        forceRefresh = false 
      } = options;
      
      // Mostrar toast de carga solo si se especifica
      let loadToast;
      if (showToasts) {
        setTimeout(() => {
          loadToast = toast.loading("Cargando proformas guardadas...", { id: "loading-proformas" });
        }, 300);
      }
      
      // Forzar un refetch si se solicita una actualización
      if (forceRefresh) {
        await queryClient.invalidateQueries({ queryKey: proformaKeys.lists() });
      }
      
      // Ejecutar la consulta de proformas guardadas
      const result = await refetchSavedProformas();
      const loadedProformas = result.data;
      
      // Verificar si hay datos válidos
      if (!Array.isArray(loadedProformas) || loadedProformas.length === 0) {
        if (showToasts) {
          toast.dismiss("loading-proformas");
          toast.info("No hay proformas guardadas en la base de datos");
        }
        
        // Crear proforma vacía como fallback
        const emptyProforma = createEmptyProforma();
        emptyProforma.items = [];
        setProformas([emptyProforma]);
        setActiveProformaId(emptyProforma.id);
        return [emptyProforma];
      }
      
      // Transformar las proformas al formato interno
      const formattedProformas = loadedProformas.map(proforma => {
        // Validar que la proforma sea un objeto válido
        if (!proforma || typeof proforma !== 'object' || !proforma.id) {
          return null;
        }
        
        // Transformar al formato interno
        const formatted = transformApiToInternalFormat(proforma);
        
        // Añadir un ID local único para la gestión en UI
        formatted.id = Date.now() + Math.random();
        
        return formatted;
      }).filter(Boolean);
      
      // Si no tenemos proformas válidas después del filtrado, crear una vacía
      if (formattedProformas.length === 0) {
        if (showToasts) {
          toast.dismiss("loading-proformas");
          toast.info("No se encontraron proformas válidas. Creando una nueva.");
        }
        
        const emptyProforma = createEmptyProforma();
        emptyProforma.items = [];
        setProformas([emptyProforma]);
        setActiveProformaId(emptyProforma.id);
        return [emptyProforma];
      }
      
      // Limitamos a las primeras N proformas para rendimiento
      const limitedProformas = formattedProformas.slice(0, itemsLimit);
      
      // Actualizar el estado
      setProformas(limitedProformas);
      setActiveProformaId(limitedProformas[0].id);
      
      // Mostrar confirmación
      if (showToasts) {
        toast.dismiss("loading-proformas");
        toast.success(`${limitedProformas.length} proformas cargadas correctamente`);
      }
      
      return limitedProformas;
    } catch (error) {
      console.error("Error al cargar proformas guardadas:", error);
      
      if (options?.showToasts !== false) {
        toast.error("Error al cargar proformas", {
          description: "Se creará una proforma nueva para continuar trabajando"
        });
      }
      
      // Crear proforma vacía como fallback
      const emptyProforma = createEmptyProforma();
      emptyProforma.items = [];
      setProformas([emptyProforma]);
      setActiveProformaId(emptyProforma.id);
      
      return [emptyProforma];
    }
  };

  /**
   * Carga una proforma específica por ID
   */
  const loadProforma = async (id, options = {}) => {
    try {
      const { 
        showToasts = true,
        silent = false,
        forceRefresh = false 
      } = options;
      
      // Validar ID
      if (!id) {
        console.error("ID de proforma no válida o no proporcionada", id);
        return null;
      }
      
      let loadToastId = null;
      if (showToasts && !silent) {
        loadToastId = `loading-proforma-${id}`;
        setTimeout(() => {
          toast.loading(`Cargando proforma #${id}...`, { id: loadToastId });
        }, 400);
      }
      
      try {
        // Asegurar que el query client tenga la data actualizada
        if (forceRefresh) {
          await queryClient.invalidateQueries({ queryKey: proformaKeys.detail(id) });
        }
        
        // Consultar la proforma específica usando React Query
        const data = await queryClient.fetchQuery({
          queryKey: proformaKeys.detail(id),
          queryFn: async () => {
            // Función para obtener la proforma desde la API
            const { ProformaService } = await import('@/services/classes/ProformaService');
            const service = new ProformaService();
            return service.getById(id);
          },
          staleTime: forceRefresh ? 0 : 1000 * 60 * 5, // 5 minutos de caché a menos que se fuerce refresh
        });
        
        if (!data || !data.id) {
          if (showToasts && !silent) {
            toast.dismiss(loadToastId);
            toast.error("La proforma no existe o no tiene datos válidos");
          }
          return null;
        }
        
        // Transformar al formato interno
        const formattedProforma = transformApiToInternalFormat(data);
        
        // Añadir ID local único para la UI
        const localId = Date.now() + Math.random();
        formattedProforma.id = localId;
        
        // Cerrar toast de carga y mostrar confirmación
        if (showToasts && !silent) {
          toast.dismiss(loadToastId);
          toast.success("Proforma cargada con éxito");
        }
        
        // Añadir la proforma cargada al estado local y activarla
        setProformas(prev => {
          // Verificar si ya existe una proforma con el mismo savedId
          const existingIndex = prev.findIndex(p => p.savedId === data.id);
          
          if (existingIndex >= 0) {
            // Si ya existe, actualizar
            const updatedProformas = [...prev];
            updatedProformas[existingIndex] = {
              ...formattedProforma,
              id: prev[existingIndex].id // Mantener el ID local para evitar cambios en UI
            };
            return updatedProformas;
          } else {
            // Si no existe, añadir como nueva
            return [...prev, formattedProforma];
          }
        });
        
        // Activar la proforma cargada
        setActiveProformaId(localId);
        
        return formattedProforma;
      } catch (error) {
        // Manejar error específico
        console.error(`Error al cargar la proforma ${id}:`, error);
        
        if (showToasts && !silent) {
          toast.dismiss(loadToastId);
          
          const status = error?.response?.status || error?.status || 'unknown';
          if (status === 404) {
            toast.error("La proforma solicitada no existe o fue eliminada");
          } else if (status === 429) {
            toast.warning("El servidor está procesando demasiadas solicitudes");
          } else {
            toast.error("No se pudo cargar la proforma", {
              description: error.message
            });
          }
        }
        
        return null;
      }
    } catch (error) {
      console.error("Error general al cargar proforma:", error);
      return null;
    }
  };

  /**
   * Actualiza los datos de una proforma en el estado local
   */
  const updateProformaLocal = useCallback((id, updates) => {
    if (!id || !updates) return;
    
    setProformas(prev => {
      // Buscar la proforma a actualizar
      const index = prev.findIndex(p => p.id === id);
      if (index === -1) return prev;
      
      // Crear copia del array y de la proforma a actualizar
      const newProformas = [...prev];
      const updatedProforma = { ...newProformas[index], ...updates };
      
      // Actualizar la proforma en el array
      newProformas[index] = updatedProforma;
      
      return newProformas;
    });
  }, []);

  /**
   * Guarda o actualiza una proforma en el backend
   */
  const saveProforma = async (proforma, options = {}) => {
    try {
      const { showToasts = true } = options;
      
      // Convertir al formato esperado por la API
      const apiData = transformInternalToApiFormat(proforma);
      
      let result;
      if (proforma.savedId) {
        // Actualizar proforma existente
        result = await updateSavedProforma({ 
          id: proforma.savedId, 
          data: apiData 
        });
      } else {
        // Crear nueva proforma
        result = await createProforma(apiData);
      }
      
      // Actualizar con los datos recibidos del servidor
      if (result && result.id) {
        // Transformar la respuesta al formato interno
        const savedProforma = transformApiToInternalFormat(result);
        
        // Actualizar el estado local
        setProformas(prev => {
          return prev.map(p => {
            if (p.id === proforma.id) {
              // Actualizar la proforma manteniendo el ID local
              return {
                ...savedProforma,
                id: p.id
              };
            }
            return p;
          });
        });
        
        // Mostrar confirmación
        if (showToasts) {
          toast.success(proforma.savedId ? "Proforma actualizada con éxito" : "Proforma guardada con éxito");
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error al guardar proforma:", error);
      
      if (options.showToasts !== false) {
        toast.error("Error al guardar la proforma", {
          description: error.message
        });
      }
      
      throw error;
    }
  };

  /**
   * Crea una nueva proforma en el estado local
   */
  const addNewProforma = useCallback(() => {
    // Crear nueva proforma con ID único
    const newProforma = createEmptyProforma();
    newProforma.items = [];
    
    // Actualizar estado
    setProformas(prev => {
      // Si solo hay una proforma vacía, reemplazarla
      if (prev.length === 1 && !prev[0].savedId && prev[0].items.length === 0) {
        return [newProforma];
      } else {
        return [...prev, newProforma];
      }
    });
    
    // Activar la nueva proforma
    setActiveProformaId(newProforma.id);
    
    return newProforma;
  }, []);

  /**
   * Cierra (elimina) una proforma del estado local
   */
  const closeProforma = useCallback((id) => {
    if (!id) return;
    
    // No permitir cerrar si solo queda una proforma
    setProformas(prev => {
      if (prev.length <= 1) return prev;
      
      const filtered = prev.filter(p => p.id !== id);
      
      // Si se cerró la activa, activar la primera
      if (id === activeProformaId && filtered.length > 0) {
        setActiveProformaId(filtered[0].id);
      }
      
      return filtered;
    });
  }, [activeProformaId]);

  // Referencia para trackear si el efecto de carga ya se ha ejecutado
  const didLoadExistingRun = useRef(false);

  /**
   * Efecto para cargar proformas cuando cambia loadExisting
   */
  useEffect(() => {
    console.log("useEffect loadExisting", loadExisting, didLoadExistingRun.current);
    if (loadExisting && !didLoadExistingRun.current) {
      didLoadExistingRun.current = true;
      loadSavedProformas({ showToasts: true })
        .finally(() => {
          // Una vez cargado, reseteamos loadExisting
          console.log("Reseteando loadExisting");
          // Usar setTimeout para evitar actualizaciones de estado durante renders
          if (typeof setLoadExisting === 'function') {
            setTimeout(() => setLoadExisting(false), 0);
          }
        });
    }
    
    // No necesitamos limpiar en este caso ya que queremos preservar el valor
    // entre montajes/desmontajes del componente
  }, [loadExisting, loadSavedProformas, setLoadExisting]);

  /**
   * Genera una URL para exportar proformas en el formato especificado
   * 
   * @param {string} format - Formato de exportación ('excel', 'excel_detalle', 'csv', 'pdf', 'estadisticas')
   * @param {Object} params - Parámetros adicionales de filtrado
   * @param {number} id - ID de la proforma (requerido solo para formatos que operan sobre una proforma)
   * @returns {string} URL para la exportación
   */
  const getExportUrl = useCallback((format, params = {}, id = null) => {
    // Obtener la URL base del API
    const { ProformaService } = require('@/services/classes/ProformaService');
    const service = new ProformaService();
    const baseUrl = service.getBaseUrl();
    
    // Para formatos que requieren ID específico
    if (format === 'excel_detalle' || format === 'csv' || format === 'pdf') {
      if (!id) {
        throw new Error(`El formato ${format} requiere un ID de proforma`);
      }
      return `${baseUrl}/${id}/${format === 'excel_detalle' ? 'exportar_excel_detalle' : 
                              format === 'csv' ? 'exportar_csv' : 'exportar_pdf'}`;
    }
    
    // Para formatos generales (sin ID específico)
    let endpoint = '';
    switch (format) {
      case 'excel':
        endpoint = 'exportar_excel';
        break;
      case 'estadisticas':
        endpoint = 'reporte_estadisticas';
        break;
      case 'dashboard':
        endpoint = 'dashboard';
        break;
      default:
        throw new Error(`Formato de exportación no válido: ${format}`);
    }
    
    // Construir URL con parámetros
    const url = new URL(`${baseUrl}/${endpoint}/`, window.location.origin);
    
    // Añadir parámetros de filtrado
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });
    }
    
    return url.toString();
  }, []);
  
  /**
   * Descarga un archivo de exportación en el formato especificado
   * 
   * @param {string} format - Formato de exportación
   * @param {Object} params - Parámetros adicionales de filtrado
   * @param {number} id - ID de la proforma (para formatos que lo requieren)
   * @returns {Promise<boolean>} - Promise que se resuelve cuando la descarga comienza
   */
  const downloadExport = useCallback(async (format, params = {}, id = null) => {
    try {
      // Determinar si es una exportación que requiere ID
      const requiresId = ['excel_detalle', 'csv', 'pdf'].includes(format);
      
      // Verificar que se proporcione ID cuando es necesario
      if (requiresId && !id) {
        if (activeProformaId && activeProforma?.savedId) {
          id = activeProforma.savedId;
        } else {
          throw new Error(`El formato ${format} requiere una proforma guardada`);
        }
      }
      
      // Obtener la URL de exportación
      const exportUrl = getExportUrl(format, params, id);
      
      // Iniciar la descarga
      const { ProformaService } = require('@/services/classes/ProformaService');
      const service = new ProformaService();
      
      // Si es PDF y se quiere mostrar en lugar de descargar
      if (format === 'pdf' && params?.inline === true) {
        window.open(exportUrl, '_blank');
        return true;
      }
      
      // Solicitar el archivo para descarga
      await service.downloadFile(exportUrl);
      
      return true;
    } catch (error) {
      console.error(`Error al descargar exportación en formato ${format}:`, error);
      // Reenviar el error para que se maneje en la interfaz
      throw error;
    }
  }, [getExportUrl, activeProformaId, activeProforma]);

  // Devolver todas las funciones y estados necesarios
  return {
    // Estado
    proformas,
    activeProforma,
    activeProformaId,
    previewMode,
    loading: loadingSavedProformas || loadingActiveDetails,
    isFetching: fetchingSavedProformas || fetchingActiveDetails,
    loadExisting,
    
    // Funciones de control de estado local
    setActiveProformaId,
    setPreviewMode,
    setLoadExisting,
    updateProformaLocal,
    addNewProforma,
    closeProforma,
    
    // Funciones que interactúan con el backend
    loadSavedProformas,
    loadProforma,
    saveProforma,
    duplicateProforma,
    changeProformaState,
    
    // Funciones de exportación
    getExportUrl,
    downloadExport,
    
    // Función para obtener datos del dashboard
    getDashboardData: async (startDate, endDate, additionalParams = {}) => {
      try {
        const { ProformaService } = await import('@/services/classes/ProformaService');
        const service = new ProformaService();
        return service.getDashboard(startDate, endDate, additionalParams);
      } catch (error) {
        console.error('Error al obtener datos del dashboard:', error);
        throw error;
      }
    },
    
    // Transformadores de formato
    transformApiToInternalFormat,
    transformInternalToApiFormat
  };
}
