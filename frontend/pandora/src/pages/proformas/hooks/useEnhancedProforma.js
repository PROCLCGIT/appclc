// src/hooks/useEnhancedProforma.js

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createEmptyProforma } from "../utils/proformaUtils";
import { proformasService, proformaItemsService } from "@/services/api";
import { toast } from "sonner";

/**
 * Maneja la lógica de múltiples proformas (pestañas) y la proforma activa.
 */
export default function useEnhancedProforma() {
  // Estado inicial: un arreglo con una proforma vacía con items como array vacío
  const emptyProforma = createEmptyProforma();
  // Garantizar que items sea un array vacío y no undefined
  emptyProforma.items = [];
  
  const [proformas, setProformas] = useState([emptyProforma]);

  // Estado para controlar si estamos cargando proformas
  const [loading, setLoading] = useState(false);

  // ID de la pestaña/proforma activa
  const [activeProformaId, setActiveProformaId] = useState(proformas[0].id);

  // Obtiene la proforma activa según el ID
  const activeProforma = proformas.find((p) => p.id === activeProformaId) || proformas[0];

  // Bandera para controlar si queremos cargar proformas existentes al iniciar
  const [loadExisting, setLoadExisting] = useState(false);
  
  // Datos de muestra para usar como respaldo cuando no se puede conectar con el servidor
  const PROFORMAS_DEMO = [
    {
      savedId: 'demo-1',
      numero: '2025-001',
      nombre: 'Equipos Informáticos ACME Corp',
      fecha_emision: new Date().toISOString(),
      fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      estado: 'borrador',
      subtotal: 1250.00,
      impuesto: 150.00,
      total: 1400.00,
      porcentaje_impuesto: 12,
      condiciones_pago: "50% anticipo, 50% contra entrega",
      tiempo_entrega: "10 días hábiles",
      notas: "Precios incluyen IVA. Oferta válida por 15 días.",
      cliente: {
        id: 'c-demo-1',
        nombre: 'ACME Corporation',
        email: 'contacto@acme.com',
        telefono: '099-123-4567',
        direccion: 'Av. Principal 123',
        ruc: '0914567890001'
      }
    },
    {
      savedId: 'demo-2',
      numero: '2025-002',
      nombre: 'Suministros Oficina Marzo',
      fecha_emision: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      fecha_vencimiento: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      estado: 'borrador',
      subtotal: 850.50,
      impuesto: 102.06,
      total: 952.56,
      porcentaje_impuesto: 12,
      condiciones_pago: "Contado",
      tiempo_entrega: "Inmediata",
      notas: "Incluye entrega en sus oficinas.",
      cliente: {
        id: 'c-demo-2',
        nombre: 'Industrias XYZ',
        email: 'compras@xyz.com',
        telefono: '099-987-6543',
        direccion: 'Calle Secundaria 456',
        ruc: '0923456789001'
      }
    }
  ];

  // Caché de proformas para evitar problemas de rate limiting
  // Inicializar datos para caché
  let initialCacheData = {
    data: [],
    timestamp: 0,
    source: 'new'
  };
  
  // Intentar cargar de localStorage de manera segura
  try {
    const savedCache = localStorage.getItem('proformas_cache');
    if (savedCache) {
      const parsed = JSON.parse(savedCache);
      // Verificar que la estructura sea válida y no demasiado antigua
      if (parsed && parsed.timestamp && Array.isArray(parsed.data)) {
        // Si no ha pasado más de 24 horas, usar la caché
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          console.log("Cargando caché de proformas desde localStorage");
          initialCacheData = {
            data: parsed.data,
            timestamp: parsed.timestamp,
            source: 'localStorage'
          };
        } else {
          console.log("Caché en localStorage demasiado antigua, ignorando");
        }
      }
    }
  } catch (e) {
    console.error("Error al cargar caché desde localStorage:", e);
  }
  
  // Crear la referencia con los datos iniciales
  const proformasCacheRef = useRef({
    ...initialCacheData,
    isValid() {
      // Memoria: 5 minutos TTL, localStorage: 24 horas
      const ttl = this.source === 'localStorage' ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000;
      return this.data.length > 0 && Date.now() - this.timestamp < ttl;
    },
    update(data) {
      this.data = data;
      this.timestamp = Date.now();
      this.source = 'memory';
      
      // Guardar en localStorage para persistencia
      try {
        localStorage.setItem('proformas_cache', JSON.stringify({
          data: this.data,
          timestamp: this.timestamp
        }));
      } catch (e) {
        console.error("Error al guardar caché en localStorage:", e);
      }
    }
  });

  // Función para cargar proformas guardadas con manejo mejorado de errores y caché
  const loadSavedProformas = async (options = {}) => {
    try {
      // Configurar opciones
      const {
        forceRefresh = false,
        showToasts = true,
        itemsLimit = 5
      } = options;
      
      setLoading(true);
      console.log("Iniciando carga de proformas guardadas desde el servidor...");
      
      let loadToast;
      if (showToasts) {
        // Mostrar toast con retraso para evitar parpadeos en cargas rápidas
        setTimeout(() => {
          if (loading) {
            loadToast = toast.loading("Cargando proformas guardadas...", { id: "loading-proformas" });
          }
        }, 300);
      }
      
      try {
        // Configuración optimizada para reducir problemas de rate limiting
        const apiOptions = {
          timeout: 40000, // 40 segundos de timeout
          _highPriority: true, // Marcar como alta prioridad
          _bypassCache: forceRefresh, // Usar caché a menos que se pida refresco explícito
          _disableRetry: false // Permitir reintentos automáticos
        };
        
        // 1. Cargar las proformas (sin filtros para simplificar la solicitud)
        console.log("Solicitando lista de proformas...");
        const response = await proformasService.getAll({}, apiOptions);
        
        // Indicar si la respuesta vino de caché
        if (response.__fromCache) {
          console.log("Respuesta de proformasService.getAll obtenida desde caché");
        } else {
          console.log("Respuesta de proformasService.getAll obtenida desde servidor");
        }
        
        // Extraer los resultados (compatibilidad con paginación)
        const savedProformas = response.results || response;
        
        if (!Array.isArray(savedProformas) || savedProformas.length === 0) {
          console.log("No se encontraron proformas guardadas");
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
        
        console.log(`Encontradas ${savedProformas.length} proformas guardadas`);
        
        // 2. Convertir las proformas al formato interno con validación robusta
        const formattedProformas = savedProformas.map(savedProforma => {
          // Validar que la proforma sea un objeto válido
          if (!savedProforma || typeof savedProforma !== 'object' || !savedProforma.id) {
            console.warn("Proforma inválida recibida:", savedProforma);
            return null;
          }
          
          console.log("Procesando proforma:", savedProforma.id, savedProforma.numero);
          
          try {
            // Crear un ID único para la UI (timestamp + random para evitar colisiones)
            const uniqueId = Date.now() + Math.random();
            
            // Formatear con valores por defecto seguros para evitar errores
            return {
              id: uniqueId,
              savedId: savedProforma.id,
              previewMode: false,
              quote: {
                number: savedProforma.numero || `PRO-${new Date().getFullYear()}-XXXX`,
                name: savedProforma.nombre || "",
                date: new Date(savedProforma.fecha_emision || Date.now()),
                expiryDate: new Date(savedProforma.fecha_vencimiento || (Date.now() + 30*24*60*60*1000)),
                paymentTerms: savedProforma.condiciones_pago || "Contado",
                deliveryTime: savedProforma.tiempo_entrega || "Por definir",
                subtotal: typeof savedProforma.subtotal === 'number' ? 
                  savedProforma.subtotal.toString() : (savedProforma.subtotal || "0"),
                tax: typeof savedProforma.impuesto === 'number' ? 
                  savedProforma.impuesto.toString() : (savedProforma.impuesto || "0"),
                total: typeof savedProforma.total === 'number' ? 
                  savedProforma.total.toString() : (savedProforma.total || "0"),
                taxRate: savedProforma.porcentaje_impuesto || 12,
                notes: savedProforma.notas || ""
              },
              client: savedProforma.cliente_detail ? {
                id: savedProforma.cliente_detail.id,
                name: savedProforma.cliente_detail.nombre || "Cliente sin nombre",
                attention: savedProforma.atencion_a || "",
                email: savedProforma.cliente_detail.email || "",
                phone: savedProforma.cliente_detail.telefono || "",
                address: savedProforma.cliente_detail.direccion || "",
                ruc: savedProforma.cliente_detail.ruc || ""
              } : savedProforma.cliente && typeof savedProforma.cliente === 'object' ? {
                id: savedProforma.cliente.id,
                name: savedProforma.cliente.nombre || "Cliente sin nombre",
                attention: savedProforma.atencion_a || "",
                email: savedProforma.cliente.email || "",
                phone: savedProforma.cliente.telefono || "",
                address: savedProforma.cliente.direccion || "",
                ruc: savedProforma.cliente.ruc || ""
              } : null,
              items: [] // Los items se cargarán posteriormente o se inicializarán vacíos
            };
          } catch (formatError) {
            console.error("Error al formatear proforma:", formatError);
            return null;
          }
        }).filter(Boolean); // Filtrar cualquier entrada nula o indefinida
        
        console.log("Proformas válidas formateadas:", formattedProformas.length);
        
        // Si no tenemos proformas válidas después del filtrado, crear una vacía
        if (formattedProformas.length === 0) {
          console.log("No quedaron proformas válidas después del filtrado");
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
        
        // 3. Cargar ítems solo para las primeras N proformas (para reducir carga)
        // Usamos una estrategia secuencial para evitar sobrecarga de solicitudes
        console.log(`Cargando ítems para las primeras ${itemsLimit} proformas...`);
        
        // Limitamos a las primeras N proformas para cargar sus ítems
        const limitedProformas = formattedProformas.slice(0, itemsLimit);
        
        // Carga secuencial usando for ... of en lugar de Promise.all para controlar la concurrencia
        // y reducir la probabilidad de rate limiting
        for (const proforma of limitedProformas) {
          try {
            console.log(`Cargando ítems para proforma ${proforma.savedId}...`);
            
            // Opción para controlar concurrencia y caché
            const itemsOptions = {
              timeout: 30000,
              _bypassCache: forceRefresh,
              _highPriority: false // Prioridad menor para items
            };
            
            const itemsResponse = await proformaItemsService.getAll(
              { proforma: proforma.savedId },
              itemsOptions
            );
            
            const items = itemsResponse.results || itemsResponse || [];
            
            console.log(`Encontrados ${items.length} ítems para proforma ${proforma.savedId}`);
            
            // Transformar y validar cada ítem
            const formattedItems = items
              .map(item => {
                // Validar que el ítem sea un objeto válido
                if (!item || typeof item !== 'object') {
                  console.warn("Item inválido:", item);
                  return null;
                }
                
                try {
                  // Crear ID único local
                  const itemId = Date.now() + Math.random();
                  
                  // Objeto base con propiedades comunes y valores por defecto seguros
                  const formattedItem = {
                    id: itemId,
                    savedId: item.id,
                    code: item.codigo || "",
                    description: item.descripcion || "Item sin descripción",
                    unit: item.unidad || "Unidad",
                    quantity: parseFloat(item.cantidad) || 0,
                    unitPrice: parseFloat(item.precio_unitario) || 0,
                    discount: parseFloat(item.porcentaje_descuento) || 0,
                    total: parseFloat(item.total) || 0,
                    source: 'personalizado' // Valor por defecto
                  };
                  
                  // Añadir información de origen según el tipo de ítem
                  if (item.tipo_item === 'producto_ofertado' && item.producto_ofertado) {
                    formattedItem.source = 'ofertados';
                    formattedItem.productId = item.producto_ofertado.id;
                    formattedItem.original = item.producto_ofertado;
                  } else if (item.tipo_item === 'producto_disponible' && item.producto_disponible) {
                    formattedItem.source = 'disponibles';
                    formattedItem.productId = item.producto_disponible.id;
                    formattedItem.original = item.producto_disponible;
                  }
                  
                  return formattedItem;
                } catch (itemError) {
                  console.error("Error al formatear ítem:", itemError);
                  return null;
                }
              })
              .filter(Boolean); // Filtrar ítems nulos o indefinidos
            
            // Asignar ítems formateados a la proforma
            proforma.items = formattedItems;
            
            // Breve pausa entre solicitudes para reducir la presión sobre el servidor
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (itemsError) {
            console.error(`Error al cargar ítems para proforma ${proforma.savedId}:`, itemsError);
            // Continuar con otras proformas incluso si esta falla
            proforma.items = [];
          }
        }
        
        // Para las proformas más allá del límite, solo inicializamos con items vacíos
        for (let i = itemsLimit; i < formattedProformas.length; i++) {
          formattedProformas[i].items = [];
        }
        
        // 4. Actualizar el estado con las proformas cargadas
        console.log("Proformas con ítems procesadas:", limitedProformas.length);
        
        // Nos quedamos solo con las proformas que tienen ID válido
        const validProformas = formattedProformas.filter(p => p.id && p.savedId);
        
        if (validProformas.length > 0) {
          // Reemplazar todas las proformas en el estado
          setProformas(validProformas);
          
          // Activar la primera proforma
          setActiveProformaId(validProformas[0].id);
          
          console.log(`Cargadas ${validProformas.length} proformas válidas`);
          if (showToasts) {
            toast.dismiss("loading-proformas");
            toast.success(`${validProformas.length} proformas cargadas correctamente`);
          }
          
          return validProformas;
        } else {
          console.log("No quedaron proformas válidas después de todo el proceso");
          if (showToasts) {
            toast.dismiss("loading-proformas");
            toast.info("No se encontraron proformas válidas. Creando una nueva.");
          }
          
          // Crear proforma vacía como fallback
          const emptyProforma = createEmptyProforma();
          emptyProforma.items = [];
          setProformas([emptyProforma]);
          setActiveProformaId(emptyProforma.id);
          
          return [emptyProforma];
        }
      } catch (serverError) {
        console.error("Error al comunicarse con el servidor:", serverError);
        if (showToasts) {
          toast.dismiss("loading-proformas");
        }
        
        // Clasificar el error para decidir qué hacer
        const isRateLimitError = serverError.status === 429 || 
          (serverError.response && serverError.response.status === 429);
          
        const isTimeoutError = serverError.code === 'ECONNABORTED' || 
          serverError.message?.includes('timeout');
          
        const isNetworkError = serverError.message?.includes('Network Error') || 
          !serverError.response;
        
        // Manejar errores recuperables
        if (isRateLimitError || isTimeoutError || isNetworkError) {
          console.log(`Detectado error recuperable: ${isRateLimitError ? 'rateLimit' : (isTimeoutError ? 'timeout' : 'network')}`);
          
          if (showToasts) {
            toast.warning(
              isRateLimitError ? "Servicio temporalmente limitado" : 
              isTimeoutError ? "Tiempo de espera agotado" :
              "Error de conexión",
              { description: "Creando una proforma nueva para continuar trabajando" }
            );
          }
        } else {
          // Para errores no recuperables, simplemente informar
          if (showToasts) {
            toast.error("No se pudieron cargar las proformas desde la base de datos", {
              description: "Se creará una proforma nueva para continuar trabajando"
            });
          }
        }
        
        // En cualquier caso, crear una proforma vacía como fallback
        const emptyProforma = createEmptyProforma();
        emptyProforma.items = [];
        setProformas([emptyProforma]);
        setActiveProformaId(emptyProforma.id);
        
        return [emptyProforma];
      } finally {
        // Asegurarnos de que el toast de carga se cierre
        if (showToasts) {
          setTimeout(() => toast.dismiss("loading-proformas"), 100);
        }
        
        setLoading(false);
      }
    } catch (error) {
      console.error("Error general al cargar proformas guardadas:", error);
      
      if (options?.showToasts !== false) {
        toast.error("Error inesperado al cargar proformas", {
          description: "Se creará una proforma nueva para continuar trabajando"
        });
      }
      
      // Crear una proforma vacía como último recurso
      const emptyProforma = createEmptyProforma();
      emptyProforma.items = [];
      setProformas([emptyProforma]);
      setActiveProformaId(emptyProforma.id);
      
      setLoading(false);
      return [emptyProforma];
    }
  };

  // Cargar proformas guardadas al iniciar (solo si loadExisting es true)
  useEffect(() => {
    // Si no queremos cargar proformas existentes, simplemente retornamos
    // Es decir, cuando entramos desde "Nueva Proforma", no cargamos nada
    if (!loadExisting) {
      return;
    }
    
    // Cargar proformas guardadas
    loadSavedProformas();
  }, [loadExisting]);

  /**
   * Actualiza una proforma en particular dentro del array de proformas
   * Con verificación para evitar actualizaciones innecesarias
   */
  /**
   * Actualiza una proforma en particular dentro del array de proformas
   * Con optimización avanzada para minimizar actualizaciones y render
   */
  const updateProforma = useCallback((id, updates) => {
    // Usamos debounce con cache de operaciones pendientes
    const now = Date.now();
    
    // Inicializar estructuras de control si no existen
    if (!window._proformaUpdateState) {
      window._proformaUpdateState = {
        lastUpdateTime: {}, // Última actualización por ID
        pendingUpdates: {}, // Actualizaciones pendientes por ID
        updateScheduled: {}, // Timeouts programados por ID
        batchFrequency: 300, // ms entre actualizaciones agrupadas
        debounceTime: 100    // ms para ignorar actualizaciones muy rápidas
      };
    }
    
    const state = window._proformaUpdateState;
    
    // Comprobaciones iniciales para reducir operaciones innecesarias
    if (!id) {
      console.error("ID de proforma no proporcionado");
      return;
    }
    
    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
      return; // Evitar actualizaciones vacías
    }
    
    // Control de frecuencia: ignorar actualizaciones muy rápidas
    if (state.lastUpdateTime[id] && (now - state.lastUpdateTime[id] < state.debounceTime)) {
      // En vez de ignorar completamente, acumular para la próxima actualización
      if (!state.pendingUpdates[id]) state.pendingUpdates[id] = {};
      
      // Acumular cambios pendientes
      Object.entries(updates).forEach(([key, value]) => {
        state.pendingUpdates[id][key] = value;
      });
      
      return; // No procesamos ahora, esperamos el próximo ciclo
    }
    
    // Registrar esta llamada como la última actualización
    state.lastUpdateTime[id] = now;
    
    // Combinar con actualizaciones pendientes si existen
    let finalUpdates = { ...updates };
    if (state.pendingUpdates[id]) {
      finalUpdates = { ...state.pendingUpdates[id], ...updates };
      state.pendingUpdates[id] = {}; // Limpiar pendientes
    }
    
    // Limitar logging para reducir ruido en consola
    const keys = Object.keys(finalUpdates);
    if (keys.length <= 3) {
      console.log(`Actualizando proforma #${id}:`, keys.join(', '));
    } else {
      console.log(`Actualizando proforma #${id}: ${keys.length} campos`);
    }
    
    // Procesamiento real con memo
    setProformas((prev) => {
      // Optimización: busqueda rápida de índice y proforma
      let proformaIndex = -1;
      let proformaToUpdate = null;
      
      for (let i = 0; i < prev.length; i++) {
        if (prev[i].id === id) {
          proformaIndex = i;
          proformaToUpdate = prev[i];
          break;
        }
      }
      
      // Si no encontramos la proforma, devolver el array sin cambios
      if (proformaIndex === -1 || !proformaToUpdate) {
        console.error(`No se encontró proforma con ID: ${id} para actualizar`);
        return prev;
      }
      
      // Comparación inteligente para minimizar actualizaciones de estado
      let hasChanges = false;
      let changedKeys = [];
      
      // Función para comparar números con tolerancia
      const compareNumbers = (a, b, tolerance = 0.001) => {
        const numA = parseFloat(a) || 0;
        const numB = parseFloat(b) || 0;
        return Math.abs(numA - numB) <= tolerance;
      };
      
      // Función para comparar arrays de objetos superficialmente
      const areArraysSimilar = (arrA, arrB, sampleSize = 3) => {
        if (!Array.isArray(arrA) || !Array.isArray(arrB)) return false;
        if (arrA.length !== arrB.length) return false;
        if (arrA.length === 0) return true;
        
        // Verificar una muestra de elementos para comparación rápida
        const samplesToCheck = Math.min(sampleSize, arrA.length);
        const positions = arrA.length <= sampleSize 
          ? Array.from({length: arrA.length}, (_, i) => i)
          : [0, Math.floor(arrA.length / 2), arrA.length - 1]; // Principio, medio y final
        
        for (const pos of positions) {
          if (JSON.stringify(arrA[pos]) !== JSON.stringify(arrB[pos])) {
            return false;
          }
        }
        
        return true;
      };
      
      // Analizar cada campo de la actualización
      for (const key in finalUpdates) {
        // Manejo optimizado caso por caso
        switch(key) {
          case 'quote':
            const oldQuote = proformaToUpdate.quote || {};
            const newQuote = finalUpdates.quote || {};
            
            // Comparar solo campos clave para evitar renders innecesarios
            if (
              oldQuote.number !== newQuote.number ||
              oldQuote.name !== newQuote.name ||
              oldQuote.paymentTerms !== newQuote.paymentTerms ||
              oldQuote.deliveryTime !== newQuote.deliveryTime ||
              oldQuote.notes !== newQuote.notes ||
              !compareNumbers(oldQuote.subtotal, newQuote.subtotal) ||
              !compareNumbers(oldQuote.tax, newQuote.tax) ||
              !compareNumbers(oldQuote.total, newQuote.total) ||
              !compareNumbers(oldQuote.taxRate, newQuote.taxRate)
            ) {
              hasChanges = true;
              changedKeys.push('quote');
            }
            break;
            
          case 'items':
            // Optimizar comparación de arrays
            const oldItems = proformaToUpdate.items || [];
            const newItems = finalUpdates.items || [];
            
            if (!areArraysSimilar(oldItems, newItems)) {
              hasChanges = true;
              changedKeys.push('items');
            }
            break;
            
          case 'client':
            // Comparación inteligente para clientes
            const oldClient = proformaToUpdate.client || {};
            const newClient = finalUpdates.client || {};
            
            if (oldClient.id !== newClient.id) {
              // Si cambia el ID del cliente, definitivamente hay un cambio
              hasChanges = true;
              changedKeys.push('client');
            } else if (oldClient.id && newClient.id) {
              // Solo verificar campos importantes si IDs son iguales
              if (
                oldClient.name !== newClient.name ||
                oldClient.attention !== newClient.attention ||
                oldClient.ruc !== newClient.ruc
              ) {
                hasChanges = true;
                changedKeys.push('client');
              }
            } else if (JSON.stringify(oldClient) !== JSON.stringify(newClient)) {
              // Fallback a comparación completa
              hasChanges = true;
              changedKeys.push('client');
            }
            break;
            
          default:
            // Para campos primitivos o desconocidos, comparación directa
            if (typeof finalUpdates[key] === 'object') {
              if (JSON.stringify(proformaToUpdate[key]) !== JSON.stringify(finalUpdates[key])) {
                hasChanges = true;
                changedKeys.push(key);
              }
            } else if (proformaToUpdate[key] !== finalUpdates[key]) {
              hasChanges = true;
              changedKeys.push(key);
            }
        }
      }
      
      // Si no hay cambios reales, evitar actualizar estado
      if (!hasChanges) {
        return prev; // Retornar estado previo sin cambios
      }
      
      // Optimización: solo crear nuevo array si realmente hay cambios
      const newProformas = [...prev];
      
      // Crear copia inmutable con solo los campos que cambiaron
      const updatedProforma = { ...proformaToUpdate };
      
      // Aplicar solo los cambios detectados
      changedKeys.forEach(key => {
        updatedProforma[key] = finalUpdates[key];
      });
      
      // Añadir timestamp de última modificación
      updatedProforma.lastModified = now;
      
      // Reemplazar la proforma en el array  
      newProformas[proformaIndex] = updatedProforma;
      
      return newProformas;
    });
  }, []);

  /**
   * Agrega una nueva proforma y la define como la activa
   * Asegura que la nueva proforma siempre tenga un arreglo de items vacío
   */
  const addNewProforma = () => {
    // Evitamos crear múltiples proformas en sucesión rápida
    const now = Date.now();
    // Usamos una variable interna para almacenar el último tiempo
    if (!window._lastAddProformaTime) window._lastAddProformaTime = 0;
    if (now - window._lastAddProformaTime < 1000) {
      console.log("Ignorando solicitud de nueva proforma (debounce)");
      return;
    }
    window._lastAddProformaTime = now;
    
    // Crear la nueva proforma con ID único
    const newProforma = createEmptyProforma();
    newProforma.items = [];
    
    console.log("Agregando nueva proforma con ID:", newProforma.id);
    
    // Primero actualizamos el estado de proformas
    setProformas((prev) => {
      // Si es la primera carga y solo tenemos la proforma inicial vacía
      if (prev.length === 1 && !prev[0].savedId && prev[0].items.length === 0) {
        console.log("Reemplazando proforma inicial vacía");
        return [newProforma];
      } else {
        console.log("Agregando nueva proforma a las existentes");
        return [...prev, newProforma];
      }
    });
    
    // Luego actualizamos el ID activo, con un pequeño retraso para
    // asegurarnos de que la actualización del estado anterior se haya completado
    const id = newProforma.id;
    setTimeout(() => {
      console.log("Estableciendo proforma activa con ID:", id);
      setActiveProformaId(id);
    }, 100);
    
    return newProforma.id;
  };

  /**
   * Cierra (elimina) una proforma del arreglo.
   * Si es la activa, cambia la activa a otra que quede abierta.
   */
  const closeProforma = (id) => {
    if (proformas.length <= 1) return; // Evita cerrar si solo queda una
    const newList = proformas.filter((p) => p.id !== id);
    setProformas(newList);

    // Si la que se cerró era la activa y todavía hay proformas, activamos la primera
    if (id === activeProformaId && newList.length > 0) {
      setActiveProformaId(newList[0].id);
    }
  };

  /**
   * Carga una proforma específica desde el backend con manejo mejorado de errores, caché y reintentos
   * @param {string|number} id - ID de la proforma a cargar
   * @param {Object} options - Opciones adicionales como timeout o flags de control
   * @returns {Promise<Object|null>} La proforma cargada o null si hubo un error
   */
  const loadProforma = async (id, options = {}) => {
    // Ya no permitimos IDs de demo
    const isDemoId = id?.toString().startsWith('demo-');
    if (isDemoId) {
      console.log("Las proformas de demostración están deshabilitadas. Cargando desde la base de datos.");
      toast.info("Las proformas de demostración están deshabilitadas");
      // Si el usuario intenta cargar una demo, simplemente devolvemos null
      return null;
    }
    
    // Validar ID antes de continuar
    if (!id) {
      console.error("ID de proforma no válida o no proporcionada", id);
      return null;
    }
    
    try {
      setLoading(true);
      
      // Configuraciones adicionales con valores por defecto
      const {
        silent = false,
        showToasts = !silent,
        forceRefresh = false,
        _disableRetry = false,
        timeout = 40000, // 40 segundos por defecto
        _highPriority = true // Alta prioridad para cargas específicas
      } = options;
      
      console.log(`Intentando cargar proforma con ID: ${id} desde la base de datos`, options);
      
      // Toast de carga con retraso para evitar parpadeos en cargas rápidas
      let loadToastTimer;
      if (showToasts) {
        loadToastTimer = setTimeout(() => {
          if (loading) {
            toast.loading(`Cargando proforma #${id}...`, { id: `loading-proforma-${id}` });
          }
        }, 400);
      }
      
      try {
        // Configurar opciones para la petición API
        const apiConfig = {
          timeout,
          _disableRetry,
          _highPriority,
          _bypassCache: forceRefresh,
          ...options
        };
        
        // 1. Cargar proforma principal
        console.log(`Solicitando proforma #${id} al servidor...`);
        const savedProforma = await proformasService.getById(id, apiConfig);
        
        // Indicar si la respuesta vino de caché
        if (savedProforma.__fromCache) {
          console.log(`Proforma #${id} obtenida desde caché`);
        }
        
        console.log("Proforma cargada:", savedProforma);
        
        // Verificar que la proforma existe y tiene datos válidos
        if (!savedProforma || !savedProforma.id) {
          console.error("La proforma cargada no tiene ID o es inválida");
          if (showToasts) {
            toast.error("La proforma no existe o no tiene datos válidos");
          }
          
          // Cerrar toast de carga si existe
          if (loadToastTimer) {
            clearTimeout(loadToastTimer);
            loadToastTimer = null;
          }
          
          // Si está visible, cerrar el toast de carga
          if (showToasts) {
            setTimeout(() => toast.dismiss(`loading-proforma-${id}`), 100);
          }
          
          return null;
        }
        
        // Crear un ID local único (timestamp + random para evitar colisiones)
        const localId = Date.now() + Math.floor(Math.random() * 1000);
        
        // 2. Convertir la proforma guardada al formato interno con validación robusta
        const formattedProforma = {
          id: localId, // ID de UI
          savedId: savedProforma.id, // ID en backend - guardamos el ID original
          previewMode: false,
          quote: {
            number: savedProforma.numero || `PRO-${new Date().getFullYear()}-XXXX`,
            name: savedProforma.nombre || "",
            date: new Date(savedProforma.fecha_emision || Date.now()),
            expiryDate: new Date(savedProforma.fecha_vencimiento || (Date.now() + 30*24*60*60*1000)),
            paymentTerms: savedProforma.condiciones_pago || "50% anticipo, 50% contra entrega",
            deliveryTime: savedProforma.tiempo_entrega || "5 días hábiles",
            subtotal: typeof savedProforma.subtotal === 'number' ? savedProforma.subtotal.toString() : savedProforma.subtotal || "0",
            tax: typeof savedProforma.impuesto === 'number' ? savedProforma.impuesto.toString() : savedProforma.impuesto || "0",
            total: typeof savedProforma.total === 'number' ? savedProforma.total.toString() : savedProforma.total || "0",
            taxRate: savedProforma.porcentaje_impuesto || 12,
            notes: savedProforma.notas || ""
          },
          client: savedProforma.cliente_detail ? {
            id: savedProforma.cliente_detail.id,
            name: savedProforma.cliente_detail.nombre || "",
            attention: savedProforma.atencion_a || "",
            email: savedProforma.cliente_detail.email || "",
            phone: savedProforma.cliente_detail.telefono || "",
            address: savedProforma.cliente_detail.direccion || "",
            ruc: savedProforma.cliente_detail.ruc || ""
          } : savedProforma.cliente && typeof savedProforma.cliente === 'object' ? {
            id: savedProforma.cliente.id,
            name: savedProforma.cliente.nombre || "",
            attention: savedProforma.atencion_a || "",
            email: savedProforma.cliente.email || "",
            phone: savedProforma.cliente.telefono || "",
            address: savedProforma.cliente.direccion || "",
            ruc: savedProforma.cliente.ruc || ""
          } : null,
          items: [] // Los ítems se cargarán a continuación
        };
        
        console.log("Proforma formateada:", formattedProforma);
        
        try {
          // 3. Cargar ítems de la proforma con manejo de errores independiente
          console.log(`Cargando ítems para proforma ${id}...`);
          
          // Configuraciones específicas para la carga de ítems
          const itemsConfig = {
            timeout: 30000,
            _disableRetry,
            _bypassCache: forceRefresh,
            _highPriority: false // Prioridad menor para la carga de ítems secundarios
          };
          
          const itemsResponse = await proformaItemsService.getAll(
            { proforma: savedProforma.id }, 
            itemsConfig
          );
          
          const items = itemsResponse?.results || itemsResponse || [];
          console.log(`Ítems cargados: ${items.length}`);
          
          // 4. Transformar y validar los ítems
          const formattedItems = items
            .map(item => {
              // Validar que el ítem sea un objeto válido
              if (!item || typeof item !== 'object') {
                console.warn("Item inválido encontrado:", item);
                return null;
              }
              
              try {
                // Generar ID único para el ítem
                const itemId = Date.now() + Math.random();
                
                // Objeto base con propiedades comunes y valores por defecto seguros
                const formattedItem = {
                  id: itemId, // ID local
                  savedId: item.id, // ID en backend
                  code: item.codigo || "",
                  description: item.descripcion || "Item sin descripción",
                  unit: item.unidad || "Unidad",
                  quantity: parseFloat(item.cantidad) || 0,
                  unitPrice: parseFloat(item.precio_unitario) || 0,
                  discount: parseFloat(item.porcentaje_descuento) || 0,
                  total: parseFloat(item.total) || 0,
                  source: 'personalizado' // Valor por defecto
                };
                
                // Añadir información de origen según el tipo de ítem
                if (item.tipo_item === 'producto_ofertado' && item.producto_ofertado) {
                  formattedItem.source = 'ofertados';
                  formattedItem.productId = item.producto_ofertado.id;
                  formattedItem.original = item.producto_ofertado;
                } else if (item.tipo_item === 'producto_disponible' && item.producto_disponible) {
                  formattedItem.source = 'disponibles';
                  formattedItem.productId = item.producto_disponible.id;
                  formattedItem.original = item.producto_disponible;
                }
                
                return formattedItem;
              } catch (itemFormatError) {
                console.error("Error al formatear ítem:", itemFormatError);
                return null;
              }
            })
            .filter(Boolean); // Filtrar items nulos o indefinidos
          
          // Asignar ítems a la proforma
          formattedProforma.items = formattedItems;
          
        } catch (itemsError) {
          // Si falla la carga de ítems, al menos cargamos la proforma con ítems vacíos
          console.error("Error al cargar los ítems de la proforma:", itemsError);
          if (showToasts) {
            toast.warning("Se cargó la proforma pero no se pudieron cargar todos los ítems");
          }
          
          // No fallamos toda la operación, continuamos con un array vacío
          formattedProforma.items = [];
        }
        
        console.log("Proforma completa con ítems formateados:", formattedProforma);
        
        // 5. Limpiar timer de toast si existe para evitar que se muestre
        if (loadToastTimer) {
          clearTimeout(loadToastTimer);
          loadToastTimer = null;
        }
        
        // Si el toast de carga está visible, cerrarlo
        if (showToasts) {
          setTimeout(() => toast.dismiss(`loading-proforma-${id}`), 100);
        }
        
        // 6. Añadir la proforma cargada y activarla
        setProformas(prev => {
          // Verificar si ya existe una proforma con el mismo savedId
          const existingIndex = prev.findIndex(p => p.savedId === savedProforma.id);
          
          if (existingIndex >= 0) {
            // Si ya existe, actualizar esa proforma
            console.log(`La proforma con savedId ${savedProforma.id} ya existe, actualizando...`);
            const updatedProformas = [...prev];
            updatedProformas[existingIndex] = formattedProforma;
            return updatedProformas;
          } else {
            // Si no existe, añadir como nueva
            console.log(`Añadiendo nueva proforma con savedId ${savedProforma.id}`);
            return [...prev, formattedProforma];
          }
        });
        
        // Activar la proforma cargada
        setActiveProformaId(formattedProforma.id);
        
        // Mostrar confirmación solo si no se solicitó silencio
        if (showToasts) {
          toast.success("Proforma cargada con éxito");
        }
        
        return formattedProforma;
      } catch (error) {
        // Manejo de errores clasificados con información más detallada
        // Cerrar el timer para el toast de carga si existe
        if (loadToastTimer) {
          clearTimeout(loadToastTimer);
        }
        
        // Si el toast de carga está visible, cerrarlo
        if (showToasts) {
          setTimeout(() => toast.dismiss(`loading-proforma-${id}`), 100);
        }
        
        // Clasificar el tipo de error
        const errorCode = error?.response?.status || error?.status || 'unknown';
        console.error(`Error al cargar la proforma ${id} (${errorCode}):`, error);
        
        // Verificar el tipo de error
        const isRateLimitError = errorCode === 429;
        const isNotFoundError = errorCode === 404;
        const isTimeoutError = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
        const isNetworkError = error.message?.includes('Network Error') || !error.response;
        
        // Solo mostrar toast si no se solicitó silenciar
        if (showToasts) {
          if (isNotFoundError) {
            toast.error("La proforma solicitada no existe o fue eliminada");
          } else if (isRateLimitError) {
            toast.warning("El servidor está procesando demasiadas solicitudes. Intente nuevamente en unos segundos.");
          } else if (isTimeoutError) {
            toast.error("Tiempo de espera agotado al cargar la proforma");
          } else if (isNetworkError) {
            toast.error("Error de conexión al servidor. Verifique su conexión a internet.");
          } else {
            toast.error("No se pudo cargar la proforma");
          }
        }
        
        // Propagar el error para manejo externo
        throw error;
      } finally {
        // Asegurar que se cierra el toast de carga en cualquier caso
        if (loadToastTimer) {
          clearTimeout(loadToastTimer);
        }
        
        if (showToasts) {
          setTimeout(() => toast.dismiss(`loading-proforma-${id}`), 100);
        }
      }
    } catch (error) {
      console.error("Error general al cargar proforma:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Carga una proforma de demostración cuando se solicita un ID con prefijo 'demo-'
   */
  const loadDemoProforma = (demoId) => {
    console.log(`Cargando proforma de demostración: ${demoId}`);
    
    // Buscar la proforma demo solicitada
    const demoProforma = PROFORMAS_DEMO.find(p => p.savedId === demoId);
    if (!demoProforma) {
      console.error(`Proforma demo ${demoId} no encontrada`);
      toast.error("Proforma de demostración no encontrada");
      return null;
    }
    
    // Convertir a formato interno
    const localId = Date.now() + Math.floor(Math.random() * 1000);
    const formattedDemo = {
      id: localId,
      savedId: demoProforma.savedId,
      previewMode: false,
      quote: {
        number: demoProforma.numero,
        name: demoProforma.nombre || "",
        date: new Date(demoProforma.fecha_emision),
        expiryDate: new Date(demoProforma.fecha_vencimiento),
        paymentTerms: demoProforma.condiciones_pago,
        deliveryTime: demoProforma.tiempo_entrega,
        subtotal: demoProforma.subtotal.toString(),
        tax: demoProforma.impuesto.toString(),
        total: demoProforma.total.toString(),
        taxRate: demoProforma.porcentaje_impuesto,
        notes: demoProforma.notas
      },
      client: demoProforma.cliente ? {
        id: demoProforma.cliente.id,
        name: demoProforma.cliente.nombre,
        attention: "",
        email: demoProforma.cliente.email || "",
        phone: demoProforma.cliente.telefono || "",
        address: demoProforma.cliente.direccion || "",
        ruc: demoProforma.cliente.ruc || ""
      } : null,
      items: []
    };
    
    // Agregar ítems de demostración según el ID
    if (demoProforma.savedId === 'demo-1') {
      formattedDemo.items = [
        {
          id: Date.now() + Math.random(),
          savedId: 'item-demo-1',
          code: 'PC-001',
          description: 'Laptop HP Elite i7 16GB RAM',
          unit: 'Unidad',
          quantity: 2,
          unitPrice: 950,
          discount: 0,
          total: 1900,
          source: 'personalizado'
        },
        {
          id: Date.now() + Math.random(),
          savedId: 'item-demo-2',
          code: 'SW-001',
          description: 'Licencia Office 365 (1 año)',
          unit: 'Licencia',
          quantity: 2,
          unitPrice: 99,
          discount: 10,
          total: 178.2,
          source: 'personalizado'
        }
      ];
    } else if (demoProforma.savedId === 'demo-2') {
      formattedDemo.items = [
        {
          id: Date.now() + Math.random(),
          savedId: 'item-demo-3',
          code: 'SUM-001',
          description: 'Resma papel A4 (500 hojas)',
          unit: 'Paquete',
          quantity: 10,
          unitPrice: 4.5,
          discount: 0,
          total: 45,
          source: 'personalizado'
        },
        {
          id: Date.now() + Math.random(),
          savedId: 'item-demo-4',
          code: 'SUM-002',
          description: 'Cartucho tinta HP 664 Negro',
          unit: 'Unidad',
          quantity: 5,
          unitPrice: 18,
          discount: 0,
          total: 90,
          source: 'personalizado'
        }
      ];
    } else if (demoProforma.savedId === 'demo-3') {
      formattedDemo.items = [
        {
          id: Date.now() + Math.random(),
          savedId: 'item-demo-5',
          code: 'LAB-001',
          description: 'Microscopio Digital 2000x',
          unit: 'Unidad',
          quantity: 1,
          unitPrice: 1200,
          discount: 5,
          total: 1140,
          source: 'personalizado'
        },
        {
          id: Date.now() + Math.random(),
          savedId: 'item-demo-6',
          code: 'LAB-002',
          description: 'Kit de tubos de ensayo (pack 50)',
          unit: 'Kit',
          quantity: 3,
          unitPrice: 85,
          discount: 0,
          total: 255,
          source: 'personalizado'
        },
        {
          id: Date.now() + Math.random(),
          savedId: 'item-demo-7',
          code: 'LAB-003',
          description: 'Balanza de precisión digital',
          unit: 'Unidad',
          quantity: 2,
          unitPrice: 350,
          discount: 0,
          total: 700,
          source: 'personalizado'
        }
      ];
    }
    
    // Añadir la proforma demo a la lista y activarla
    setProformas(prev => {
      const existingIndex = prev.findIndex(p => p.savedId === demoProforma.savedId);
      
      if (existingIndex >= 0) {
        const updatedProformas = [...prev];
        updatedProformas[existingIndex] = formattedDemo;
        return updatedProformas;
      } else {
        return [...prev, formattedDemo];
      }
    });
    
    // Activar la proforma
    setActiveProformaId(formattedDemo.id);
    
    // Mostrar notificación para informar al usuario
    toast.info("Cargada versión de demostración", {
      description: "Esta es una proforma de ejemplo para pruebas"
    });
    
    return formattedDemo;
  };

  // Aseguramos que todas las funciones y estados necesarios están siendo exportados
  return {
    proformas,
    activeProforma,
    activeProformaId,
    setActiveProformaId,
    updateProforma,
    addNewProforma,
    closeProforma,
    loadProforma,
    loadSavedProformas, // Exportamos la función para cargar proformas guardadas
    loading,
    // Exportamos también la función para controlar si se cargan proformas existentes
    loadExisting,
    setLoadExisting
  };
}
