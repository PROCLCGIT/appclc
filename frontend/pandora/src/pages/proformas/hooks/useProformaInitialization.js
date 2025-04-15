// src/pages/proformas/hooks/useProformaInitialization.js

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Hook para manejar la inicialización y carga de proformas
 * Segregando la lógica de inicialización y carga para mayor claridad
 */
// Importamos el servicio de proformas para usarlo directamente si es necesario 
import { proformasService } from "@/services/api";

export const useProformaInitialization = ({
  isNewProforma,
  setLoadExisting,
  addNewProforma,
  loadProforma,
  loadClientes,
  loadInitialProducts
}) => {
  const isInitialLoadDone = useRef(false);
  const [initializing, setInitializing] = useState(true);

  // Manejar la inicialización basada en parámetros de URL
  useEffect(() => {
    // Evitamos que se ejecute más de una vez
    if (isInitialLoadDone.current) {
      console.log("Ya se realizó la carga inicial, ignorando");
      return;
    }
    
    isInitialLoadDone.current = true;
    console.log("Ejecutando efecto de URL params. isNewProforma:", isNewProforma);
    
    // Crear una función async para ejecutar todo de forma secuencial
    const initializeData = async () => {
      try {
        // Solo cargar clientes por ahora, evitamos cargar productos para prevenir rate limit
        console.log("Cargando datos de clientes...");
        await loadClientes();
        
        // NO cargamos productos iniciales durante la inicialización para evitar rate limit
        // Los productos se cargarán bajo demanda cuando el usuario seleccione una fuente
        console.log("Omitiendo carga automática de productos para evitar rate limit");
        
        // Verificar si hay un ID de proforma específico en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const proformaId = urlParams.get('id');
        
        if (proformaId) {
          // Si hay un ID específico en la URL, cargar esa proforma
          console.log(`Encontrado ID de proforma específico en URL: ${proformaId}`);
          try {
            // Cargar inmediatamente sin esperar carga de otras proformas
            const result = await loadSpecificProforma(proformaId);
            if (result) {
              console.log(`Proforma ${proformaId} cargada correctamente desde URL`);
            } else {
              console.error(`No se pudo cargar la proforma ${proformaId} desde URL`);
              // Si falla, caemos al comportamiento predeterminado (mostrar todas)
              if (!isNewProforma) {
                await loadExistingProformas();
              } else {
                addNewProforma();
              }
            }
          } catch (idError) {
            console.error(`Error al cargar proforma por ID ${proformaId}:`, idError);
            // Si falla, caemos al comportamiento predeterminado (mostrar todas)
            if (!isNewProforma) {
              await loadExistingProformas();
            } else {
              addNewProforma();
            }
          }
        } else if (isNewProforma) {
          // Si es una nueva proforma, no cargamos datos existentes
          setLoadExisting(false);
          
          // Creamos una nueva proforma solo una vez
          console.log("Creando nueva proforma porque new=true");
          addNewProforma();
        } else {
          // Si no es nueva, cargamos proformas existentes
          await loadExistingProformas();
        }
      } catch (error) {
        console.error("Error en la inicialización:", error);
      } finally {
        setInitializing(false);
      }
    };
    
    // Función auxiliar para cargar proformas existentes con manejo robusto
    const loadExistingProformas = async () => {
      console.log("Cargando proformas existentes directamente...");
      
      // Marcamos que queremos cargar las existentes (para mantener la lógica del estado)
      setLoadExisting(true);
      
      // IMPORTANTE: Implementación interna para cargar proformas guardadas
      try {
        // Esperar 500ms para dar tiempo a que react actualice los estados
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log("Iniciando carga de proformas en estado borrador...");
        
        // Intentar cargar listado de proformas
        const response = await proformasService.getAll({ 
          estado: 'borrador',
          limit: 5, 
          ordering: '-fecha_emision' 
        });
        
        const proformasData = response.results || response || [];
        
        // Verificar si tenemos proformas para cargar
        if (proformasData && proformasData.length > 0) {
          console.log(`Encontradas ${proformasData.length} proformas, cargando la primera...`);
          
          // Cargar la primera proforma encontrada
          const firstProforma = proformasData[0];
          if (firstProforma && firstProforma.id) {
            const result = await loadProforma(firstProforma.id);
            if (result) {
              console.log(`Proforma ${firstProforma.id} cargada exitosamente`);
              return [result]; // Devolver arreglo con una proforma para mantener consistencia
            }
          }
        }
        
        // Si llegamos aquí, no se pudieron cargar proformas o hubo algún error
        console.log("No se encontraron proformas guardadas o no se pudieron cargar, creando una nueva");
        addNewProforma();
        return [];
      } catch (innerError) {
        console.error("Error al cargar proformas guardadas durante inicialización:", innerError);
        console.log("Creando proforma nueva como fallback por error");
        addNewProforma();
        return [];
      }
    };
    
    // Ejecutar inicialización
    initializeData();
    
  // Eliminamos las dependencias para que este efecto se ejecute solo una vez
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantener registro de la última carga para evitar problemas de rate limiting
  const lastProformaLoadTime = useRef(0);
  
  /**
   * Carga una proforma específica por su ID con manejo robusto de errores y rate limiting
   */
  const loadSpecificProforma = async (proformaId) => {
    if (!proformaId) {
      console.error("ID de proforma no proporcionado");
      return null;
    }
    
    // Verificar si es una ID demo y rechazarla
    const isDemoId = proformaId?.toString().startsWith('demo-');
    if (isDemoId) {
      console.log("Las proformas de demostración están deshabilitadas");
      toast.info("Las proformas de demostración están deshabilitadas. Cargando desde la base de datos.");
      return null;
    }
    
    // Variable para rastrear el intento actual
    let attemptCount = 0;
    const maxAttempts = 5; // Incrementado a 5 para dar más oportunidades con rate limiting
    
    // Función interna para realizar el intento con backoff exponencial
    const attemptLoad = async () => {
      attemptCount++;
      
      // Comprobar si no ha pasado suficiente tiempo desde la última carga
      const now = Date.now();
      const timeSinceLastLoad = now - lastProformaLoadTime.current;
      const minTimeBetweenLoads = 5000 * Math.pow(2, attemptCount - 1); // Backoff exponencial más agresivo
      
      if (timeSinceLastLoad < minTimeBetweenLoads) {
        const waitTime = minTimeBetweenLoads - timeSinceLastLoad;
        console.log(`Esperando ${Math.ceil(waitTime/1000)}s para evitar rate limiting (intento ${attemptCount})...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      let loadingToast;
      let toastTimeout;
      
      try {
        // Mostrar toast de carga si tarda más de 700ms (aumentado para reducir notificaciones)
        toastTimeout = setTimeout(() => {
          loadingToast = toast.loading(`Cargando proforma desde la base de datos (intento ${attemptCount}/${maxAttempts})...`);
        }, 700);
        
        console.log(`Cargando proforma específica con ID: ${proformaId} (intento ${attemptCount}/${maxAttempts})`);
        
        // Añadir opciones para mejorar el manejo de errores
        const loadOptions = {
          _disableRetry: attemptCount > 1, // Deshabilitar retry automático en el segundo intento
          timeout: 15000 // 15 segundos de timeout
        };
        
        // Intentar usar una versión mejorada de loadProforma si está disponible
        const loadedProforma = await loadProforma(proformaId, loadOptions);
        
        // Registrar momento de la última carga exitosa
        lastProformaLoadTime.current = Date.now();
        
        // Limpiar toast timeout si la respuesta fue rápida
        if (toastTimeout) {
          clearTimeout(toastTimeout);
          toastTimeout = null;
        }
        
        if (loadedProforma) {
          toast.success("Proforma cargada correctamente desde la base de datos");
          return loadedProforma;
        } else {
          throw new Error("La proforma cargada no contiene datos válidos");
        }
      } catch (error) {
        // Limpiar timeout si existe
        if (toastTimeout) {
          clearTimeout(toastTimeout);
          toastTimeout = null;
        }
        
        console.error(`Error al cargar la proforma (intento ${attemptCount}):`, error);
        
        // Determinar el tipo de error para un manejo más específico
        const isRateLimitError = error.status === 429 || (error.response && error.response.status === 429);
        const isNotFoundError = error.status === 404 || (error.response && error.response.status === 404);
        const isTimeoutError = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
        const isNetworkError = error.message?.includes('Network Error') || !error.response;
        
        // Manejo específico según tipo de error
        if (isNotFoundError) {
          toast.error("La proforma solicitada no existe o fue eliminada");
          return null; // No reintentar si no existe
        } else if ((isRateLimitError || isTimeoutError || isNetworkError) && attemptCount < maxAttempts) {
          // Para errores recuperables, reintentar con backoff
          const waitTime = 5000 * Math.pow(2, attemptCount - 1);
          
          toast.warning(`Reintentando en ${Math.ceil(waitTime/1000)} segundos...`, {
            description: isRateLimitError ? "Demasiadas peticiones al servidor" :
                        isTimeoutError ? "La solicitud tardó demasiado tiempo" :
                        "Error de conexión con el servidor"
          });
          
          // Esperar y reintentar
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return await attemptLoad(); // Recursión para reintentar
        } else {
          // Para otros errores o después de agotar reintentos
          let errorMessage = "No se pudo cargar la proforma";
          
          if (error.response?.data?.detail) {
            errorMessage += `: ${error.response.data.detail}`;
          } else if (error.message) {
            errorMessage += ` (${error.message})`;
          }
          
          toast.error(errorMessage);
          return null;
        }
      } finally {
        if (loadingToast) {
          toast.dismiss(loadingToast);
        }
      }
    };
    
    // Iniciar el primer intento
    return await attemptLoad();
  };

  return {
    initializing,
    loadSpecificProforma
  };
};

export default useProformaInitialization;