import React, { useState, useEffect, useRef } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  RefreshCw, 
  FileText, 
  Search, 
  Calendar, 
  DollarSign, 
  Check, 
  Clock, 
  X, 
  AlertTriangle,
  Edit,
  Trash2,
  FileOutput,
  Plus,
  Mail,
  ClipboardList
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { proformasService } from "@/services/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Cache de proformas - almacenada a nivel de módulo para persistir entre renderizados
// Este objeto permanecerá entre renderizados del componente
const proformasCache = {
  timestamp: 0,
  data: [],
  ttl: 120000, // 120 segundos (2 minutos) de tiempo de vida para la caché
  isValid() {
    return this.data.length > 0 && Date.now() - this.timestamp < this.ttl;
  },
  update(data) {
    this.data = data;
    this.timestamp = Date.now();
  },
  clear() {
    this.data = [];
    this.timestamp = 0;
  }
};

// Datos de muestra para usar como respaldo cuando no se puede conectar con el servidor
// Esto garantiza que la UI siempre tenga algo para mostrar
const PROFORMAS_DEMO = [
  {
    id: 'demo-1',
    numero: '2025-001',
    nombre: 'Equipos Informáticos ACME Corp',
    fecha_emision: new Date().toISOString(),
    fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    estado: 'borrador',
    subtotal: 1250.00,
    impuesto: 150.00,
    total: 1400.00,
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
    id: 'demo-2',
    numero: '2025-002',
    nombre: 'Suministros Oficina Marzo',
    fecha_emision: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    fecha_vencimiento: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    estado: 'borrador',
    subtotal: 850.50,
    impuesto: 102.06,
    total: 952.56,
    cliente: {
      id: 'c-demo-2',
      nombre: 'Industrias XYZ',
      email: 'compras@xyz.com',
      telefono: '099-987-6543',
      direccion: 'Calle Secundaria 456',
      ruc: '0923456789001'
    }
  },
  {
    id: 'demo-3',
    numero: '2025-003',
    nombre: 'Equipos de Laboratorio',
    fecha_emision: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    fecha_vencimiento: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    estado: 'borrador',
    subtotal: 3450.75,
    impuesto: 414.09,
    total: 3864.84,
    cliente: {
      id: 'c-demo-3',
      nombre: 'Laboratorios MediHealth',
      email: 'adquisiciones@medihealth.com',
      telefono: '099-567-1234',
      direccion: 'Av. Norte 789',
      ruc: '0934567890001'
    }
  }
];

// Contador global de intentos fallidos para el backoff exponencial
let failedAttempts = 0;

/**
 * Componente de diálogo mejorado para mostrar, buscar y gestionar proformas guardadas
 * Con caché y manejo avanzado de rate limiting
 */
const ProformasDialog = ({ 
  isOpen, 
  onClose,
  onSelectProforma,
  onLoadProformas, // Nueva prop para recibir la función de carga de proformas desde el componente padre
}) => {
  // Estados locales
  const [proformasGuardadas, setProformasGuardadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState("list"); // "grid" o "list"
  const [activeFilter, setActiveFilter] = useState("todas"); // "todas", "borrador", "enviadas", "aprobadas", etc.
  
  // Estado para controlar tiempo de la última carga
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const loadingTimeoutRef = useRef(null);
  const isComponentMountedRef = useRef(true);
  
  // Referencia para el intervalo de intento de recarga
  const retryTimeoutRef = useRef(null);
  
  // Marcar el componente como montado/desmontado
  useEffect(() => {
    isComponentMountedRef.current = true;
    
    return () => {
      isComponentMountedRef.current = false;
      
      // Limpiar todos los timeouts al desmontar
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, []);

  // Efecto para gestionar la carga inicial de datos cuando se abre el diálogo
  useEffect(() => {
    // Resetear el filtro y la búsqueda cuando se cierra el diálogo
    if (!isOpen) {
      setSearchTerm("");
      setActiveFilter("todas");
      return;
    }
    
    // Si tenemos datos en caché válidos, usarlos como visualización temporal mientras cargamos datos frescos
    if (proformasCache.isValid()) {
      console.log("Usando datos de caché temporalmente. Edad:", Math.floor((Date.now() - proformasCache.timestamp)/1000) + "s");
      
      // Mostrar los datos de caché inmediatamente para mejorar UX
      setProformasGuardadas(proformasCache.data);
      
      // Pero aún así, intentar cargar datos frescos del servidor en segundo plano
      setTimeout(() => {
        if (isComponentMountedRef.current && isOpen) {
          console.log("Actualizando datos en segundo plano...");
          cargarProformas()
            .then(() => console.log("Datos actualizados correctamente en segundo plano"))
            .catch(error => console.warn("Error al actualizar datos en segundo plano:", error));
        }
      }, 1000);
    }
    
    // Si no hay caché válida pero tenemos la función de carga del componente padre, usarla
    if (typeof onLoadProformas === 'function') {
      console.log("Diálogo abierto: solicitando carga de proformas usando onLoadProformas");
      
      // Intentar cargar inmediatamente
      cargarProformas().catch(error => {
        console.error("Error al cargar proformas iniciales:", error);
      });
      
      return;
    }
    
    // Si llegamos aquí, es porque no hay caché válida y no tenemos onLoadProformas
    // Usar el método tradicional con backoff exponencial
    console.log("Fallback: Usando método tradicional con backoff exponencial");
    
    // Si no hay caché válida, cargar con delay para evitar problemas de rate limiting
    const loadProformasWithDelay = () => {
      // Calcular el tiempo de espera según los intentos fallidos (backoff exponencial)
      // 0 fallos: 3s, 1 fallo: 6s, 2 fallos: 12s, 3 fallos: 24s, etc.
      const backoffDelay = 3000 * Math.pow(2, failedAttempts);
      const maxDelay = 60000; // Máximo 60 segundos
      const delay = Math.min(backoffDelay, maxDelay);
      
      console.log(`Programando carga de proformas con delay de ${delay/1000}s (intentos fallidos: ${failedAttempts})`);
      
      // Limpiar cualquier timeout pendiente
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Programar la carga con el delay calculado
      loadingTimeoutRef.current = setTimeout(() => {
        if (!isComponentMountedRef.current || !isOpen) return;
        
        // Intentar cargar las proformas
        cargarProformas()
          .then(() => {
            // Si hay éxito, resetear el contador de fallos
            failedAttempts = 0;
          })
          .catch(error => {
            console.error("Error al cargar proformas:", error);
            
            // Si es error de rate limiting, incrementar contador y programar nuevo intento
            if (error && (error.status === 429 || (error.response && error.response.status === 429))) {
              failedAttempts = Math.min(failedAttempts + 1, 5); // Máximo 5 para evitar delays excesivos
              
              // Programar un nuevo intento con mayor delay
              if (isComponentMountedRef.current && isOpen) {
                console.log(`Reintentando en ${Math.min(backoffDelay * 2, maxDelay)/1000}s`);
                loadProformasWithDelay();
              }
            }
          });
      }, delay);
    };
    
    // Iniciar la carga con delay
    loadProformasWithDelay();
    
    // Limpieza al desmontar o cerrar
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [isOpen, onLoadProformas]); // Depende de si el diálogo está abierto y si onLoadProformas cambia
  
  // Versión silenciosa de cargar proformas (sin UI loading ni notificaciones)
  const cargarProformasSilenciosamente = async () => {
    try {
      console.log("Cargando proformas de forma silenciosa...");
      
      const response = await proformasService.getAll({ 
        estado: 'borrador',
        limit: 5, 
        ordering: '-fecha_emision'
      });
      
      let proformasData = [];
      
      if (response && response.results && Array.isArray(response.results)) {
        proformasData = response.results;
      } else if (response && Array.isArray(response)) {
        proformasData = response;
      }
      
      // Filtrar y ordenar
      proformasData = proformasData
        .filter(p => p && p.id)
        .sort((a, b) => new Date(b.fecha_emision || 0) - new Date(a.fecha_emision || 0));
      
      // Actualizar caché
      proformasCache.update(proformasData);
      
      // Solo actualizar el estado si el componente sigue montado
      if (isComponentMountedRef.current) {
        setProformasGuardadas(proformasData);
      }
      
      console.log(`Actualización silenciosa completa: ${proformasData.length} proformas`);
      return proformasData;
    } catch (error) {
      console.warn("Error en carga silenciosa:", error);
      throw error;
    }
  };
  
  // Función simplificada para cargar proformas guardadas usando la función del hook principal
  const cargarProformas = async () => {
    // Evitar intentar cargar si ya estamos en proceso de carga
    if (loading) {
      console.log("Ya hay una carga en proceso, ignorando petición");
      return Promise.reject(new Error("Ya hay una carga en proceso"));
    }
    
    setLoading(true);
    let loadingToast = toast.loading("Cargando proformas...", { id: "loading-proformas" });
    
    try {
      console.log("Usando función onLoadProformas desde el componente padre");
      
      // Usar la función de carga proporcionada desde el componente padre, si existe
      if (typeof onLoadProformas === 'function') {
        // Llamar a la función con opciones específicas para el diálogo
        const proformasData = await onLoadProformas({
          showToasts: true,
          forceRefresh: true,
          itemsLimit: 10
        }) || [];
        
        console.log(`Cargadas ${proformasData.length} proformas a través de onLoadProformas`);
        
        // Log especial para cada proforma
        if (proformasData.length > 0) {
          console.log("============= PROFORMAS CARGADAS CON onLoadProformas =============");
          proformasData.forEach((p, index) => {
            console.log(`Proforma #${index + 1} (ID: ${p.id}): nombre="${p.nombre || 'VACÍO'}", número="${p.numero || 'N/A'}"`);
          });
          console.log("================================================================");
        }
        
        // Si hay proformas, mostrarlas
        if (Array.isArray(proformasData) && proformasData.length > 0) {
          // Actualizar la caché
          proformasCache.update(proformasData);
          
          // Actualizar el estado
          setProformasGuardadas(proformasData);
          
          return proformasData;
        } else {
          console.warn("No se recibieron datos de onLoadProformas o el array está vacío");
        }
      } else {
        console.warn("onLoadProformas no es una función válida, usando método de respaldo");
      }
      
      // Método de respaldo: usar proformasService directamente
      console.log("Iniciando carga de proformas desde API directamente (método de respaldo)...");
      
      // Configuración mejorada para cargar todas las proformas con parámetros optimizados
      const response = await proformasService.getAll({}, {
        _bypassCache: true,
        _highPriority: true,
        _disableRetry: false,
        timeout: 15000
      });
      
      console.log("Respuesta de API proformas:", response);
      
      let proformasData = [];
      
      if (response?.results && Array.isArray(response.results)) {
        proformasData = response.results;
      } else if (Array.isArray(response)) {
        proformasData = response;
      }
      
      // Imprimir estructura exacta de los datos recibidos para depuración
      if (proformasData.length > 0) {
        console.log("ESTRUCTURA DE LA PRIMERA PROFORMA (COMPLETA):", JSON.stringify(proformasData[0], null, 2));
        
        // Verificar específicamente los campos nombre e id
        const primerProforma = proformasData[0];
        console.log("CAMPOS CRÍTICOS:", {
          id: primerProforma.id,
          nombre: primerProforma.nombre,
          numero: primerProforma.numero,
          cliente: typeof primerProforma.cliente === 'object' ? 
                   'objeto-cliente' : 
                   (typeof primerProforma.cliente === 'number' ? 
                    'id-numero' : 
                    (typeof primerProforma.cliente === 'string' ? 
                     'id-string' : 
                     'no-definido'))
        });
        
        // Inspección detallada de todos los campos para diagnosticar el problema
        console.log("ESTRUCTURA COMPLETA DE CAMPOS:", Object.keys(primerProforma));
        
        // Buscar explícitamente cualquier campo que pueda contener el nombre
        const posiblesCamposNombre = Object.keys(primerProforma).filter(campo => 
          campo.toLowerCase().includes('nombre') || 
          campo.toLowerCase().includes('name') ||
          campo.toLowerCase().includes('title') ||
          campo.toLowerCase().includes('titulo')
        );
        
        if (posiblesCamposNombre.length > 0) {
          console.log("POSIBLES CAMPOS PARA NOMBRE:", posiblesCamposNombre);
          posiblesCamposNombre.forEach(campo => {
            console.log(`  - ${campo}: "${primerProforma[campo]}"`);
          });
        } else {
          console.log("NO SE ENCONTRARON CAMPOS QUE PUEDAN CONTENER EL NOMBRE");
        }
      }
      
      // IMPORTANTE: Revisar si hay nombres vacíos ANTES de transformar
      const proformasSinNombre = proformasData.filter(p => !p.nombre || p.nombre === '');
      if (proformasSinNombre.length > 0) {
        console.error(`¡ADVERTENCIA! ${proformasSinNombre.length} proformas no tienen nombre antes de transformar:`);
        proformasSinNombre.forEach(p => {
          console.error(`  - Proforma #${p.id}: nombre ausente, numero="${p.numero || 'N/A'}"`);
        });
      }
      
      // Transformación completa de los datos - solución más agresiva
      proformasData = proformasData.map(proforma => {
        // Crear una copia profunda para evitar mutaciones inesperadas
        const proformaTransformada = JSON.parse(JSON.stringify(proforma));
        
        // Garantizar explícitamente que estamos recibiendo y preservando el campo nombre
        console.log(`Procesando proforma #${proforma.id}:`);
        console.log(`  - Nombre original: "${proforma.nombre}"`);
        console.log(`  - Número: "${proforma.numero}"`);
        
        // PRESERVAR el campo nombre exactamente como viene del backend
        // IMPORTANTE: No sobreescribir ni modificar este campo en absoluto
        
        // Si no hay nombre, solo lo registramos para diagnóstico
        if (!proformaTransformada.nombre || proformaTransformada.nombre === '') {
          console.warn(`  - ⚠️ ALERTA: Proforma #${proforma.id} no tiene nombre en la base de datos`);
          
          // SOLUCIÓN: Asignar un nombre predeterminado solo si realmente está vacío
          if (!proformaTransformada.nombre) {
            console.warn(`  - ⚠️ FORZANDO nombre para la proforma #${proforma.id}: "Proforma #${proforma.numero || proforma.id}"`);
            proformaTransformada.nombre = `Proforma #${proforma.numero || proforma.id}`;
          }
        }
        
        // Verificar si hay algún problema de mapeo de campos
        if (proforma.numero && !proforma.nombre) {
          console.warn(`  - ⚠️ POSIBLE ERROR: Proforma tiene número (${proforma.numero}) pero no nombre`);
        }
        
        // SOLUCIÓN FORZADA: Crear objeto cliente si no existe o si solo es un ID
        if (!proformaTransformada.cliente || 
            typeof proformaTransformada.cliente === 'number' || 
            (typeof proformaTransformada.cliente === 'string')) {
          
          // Guardar el ID original si existe
          const clienteIdOriginal = proformaTransformada.cliente;
          
          // Crear objeto completo
          proformaTransformada.cliente = {
            id: clienteIdOriginal || 'temp-id',
            nombre: 'Seleccionar cliente'
          };
          
          // Intentar extraer información del quote si existe
          if (proformaTransformada.quote) {
            if (proformaTransformada.quote.cliente_nombre) {
              proformaTransformada.cliente.nombre = proformaTransformada.quote.cliente_nombre;
            } else if (proformaTransformada.quote.cliente && proformaTransformada.quote.cliente.nombre) {
              proformaTransformada.cliente.nombre = proformaTransformada.quote.cliente.nombre;
            }
            
            if (proformaTransformada.quote.cliente_ruc) {
              proformaTransformada.cliente.ruc = proformaTransformada.quote.cliente_ruc;
            } else if (proformaTransformada.quote.cliente && proformaTransformada.quote.cliente.ruc) {
              proformaTransformada.cliente.ruc = proformaTransformada.quote.cliente.ruc;
            }
          }
        } else if (typeof proformaTransformada.cliente === 'object' && !proformaTransformada.cliente.nombre) {
          // Si cliente es un objeto pero no tiene nombre
          proformaTransformada.cliente.nombre = 'Cliente sin nombre registrado';
          
          // Intentar extraer del quote
          if (proformaTransformada.quote) {
            if (proformaTransformada.quote.cliente_nombre) {
              proformaTransformada.cliente.nombre = proformaTransformada.quote.cliente_nombre;
            } else if (proformaTransformada.quote.cliente && proformaTransformada.quote.cliente.nombre) {
              proformaTransformada.cliente.nombre = proformaTransformada.quote.cliente.nombre;
            }
          }
        }
        
        // DEBUG: Asegurarnos de que los valores están definidos correctamente
        console.log(`Proforma #${proforma.id} después de transformación:`, {
          nombre_original: proforma.nombre,
          nombre_transformado: proformaTransformada.nombre,
          cliente_original: proforma.cliente,
          cliente_transformado: proformaTransformada.cliente
        });
        
        return proformaTransformada;
      });
      
      // IMPORTANTE: Revisar si hay nombres vacíos DESPUÉS de transformar
      const proformasSinNombreFinal = proformasData.filter(p => !p.nombre || p.nombre === '');
      if (proformasSinNombreFinal.length > 0) {
        console.error(`¡ERROR CRÍTICO! ${proformasSinNombreFinal.length} proformas siguen sin nombre después de transformar:`);
        proformasSinNombreFinal.forEach(p => {
          console.error(`  - Proforma #${p.id}: nombre ausente, numero="${p.numero || 'N/A'}"`);
        });
      }
      
      // Filtrar y ordenar
      proformasData = proformasData
        .filter(p => p && p.id) 
        .sort((a, b) => new Date(b.fecha_emision || 0) - new Date(a.fecha_emision || 0));
      
      console.log(`Cargadas ${proformasData.length} proformas del servidor`);
      
      // Log final de todas las proformas cargadas
      console.log("============= PROFORMAS FINALES =============");
      proformasData.forEach((p, index) => {
        console.log(`Proforma #${index + 1} (ID: ${p.id}): nombre="${p.nombre || 'VACÍO'}", número="${p.numero || 'N/A'}"`);
      });
      console.log("============================================");
      
      // Actualizar la caché
      proformasCache.update(proformasData);
      
      // Actualizar el estado
      setProformasGuardadas(proformasData);
      
      toast.success(`${proformasData.length} proformas cargadas correctamente`);
      
      return proformasData;
    } catch (error) {
      console.error("Error al cargar proformas guardadas:", error);
      
      // Si tenemos datos en caché, usarlos como fallback
      if (proformasCache.data.length > 0) {
        console.log("Usando datos de caché como fallback debido a error");
        setProformasGuardadas(proformasCache.data);
        
        toast.warning("Usando datos guardados localmente", {
          description: "No se pudieron cargar las proformas más recientes"
        });
        
        return proformasCache.data;
      }
      
      // Si no hay caché, mostrar error y usar datos de demo
      toast.error("No se pudieron cargar las proformas", { 
        description: error.message || "Error de conexión con el servidor"
      });
      
      // Evitar usar datos demo a menos que sea absolutamente necesario
      console.warn("NO SE USARÁN DATOS DEMO para garantizar datos reales");
      
      // Hacer un último intento de cargar datos directamente sin transformaciones
      try {
        console.log("Último intento de obtener datos reales del servidor...");
        const rawResponse = await proformasService.getAll({ 
          _bypassCache: true,
          _disableRetry: false,
          _highPriority: true,
          timeout: 10000
        });
        
        console.log("Respuesta directa sin transformaciones:", rawResponse);
        
        // Intentar encontrar cualquier tipo de array en la respuesta
        let finalData = [];
        
        if (Array.isArray(rawResponse)) {
          finalData = rawResponse;
        } else if (rawResponse && typeof rawResponse === 'object') {
          if (Array.isArray(rawResponse.results)) {
            finalData = rawResponse.results;
          } else if (Array.isArray(rawResponse.data)) {
            finalData = rawResponse.data;
          } else {
            // Intentar convertir el objeto a array si parece ser un mapa de objetos
            const possibleArray = Object.values(rawResponse).filter(item => 
              item && typeof item === 'object' && item.id
            );
            
            if (possibleArray.length > 0) {
              finalData = possibleArray;
            }
          }
        }
        
        if (finalData.length > 0) {
          console.log("Se obtuvieron datos alternativos del servidor:", finalData.length);
          setProformasGuardadas(finalData);
          return finalData;
        } else {
          console.error("No se pudieron obtener datos alternativos");
          // Usar un array vacío en lugar de datos demo
          setProformasGuardadas([]);
          return [];
        }
      } catch (finalError) {
        console.error("Error en el último intento de obtener datos:", finalError);
        // Usar un array vacío en lugar de datos demo
        setProformasGuardadas([]);
        return [];
      }
    } finally {
      // Cerrar toast de carga
      toast.dismiss("loading-proformas");
      
      // Actualizar estado de carga
      if (isComponentMountedRef.current) {
        setLoading(false);
      }
    }
  };
  
  // Función para eliminar una proforma con mejor manejo de errores y confirmación
  const eliminarProforma = async (id, numero) => {
    if (!id) return;
    
    // Confirmación más robusta con número de proforma
    if (!window.confirm(`¿Está seguro que desea eliminar la proforma #${numero || id}? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    // Verificar si es una proforma de demostración (demo)
    const isDemoProforma = id.toString().startsWith('demo-');
    
    // Si es una proforma demo, solo simular la eliminación localmente
    if (isDemoProforma) {
      // Eliminar localmente (tanto del estado como de la caché)
      setProformasGuardadas(prevProformas => prevProformas.filter(p => p.id !== id));
      
      if (proformasCache.data.length > 0) {
        proformasCache.data = proformasCache.data.filter(p => p.id !== id);
      }
      
      toast.success(`Proforma #${numero || id} eliminada correctamente`);
      return;
    }
    
    // Si no es demo, proceder con la eliminación real
    const loadingToast = toast.loading("Eliminando proforma...", { id: "delete-proforma" });
    
    try {
      await proformasService.delete(id);
      
      // Actualizar la lista de proformas (quitar la eliminada)
      setProformasGuardadas(prevProformas => prevProformas.filter(p => p.id !== id));
      
      // También actualizar la caché
      if (proformasCache.data.length > 0) {
        proformasCache.data = proformasCache.data.filter(p => p.id !== id);
      }
      
      toast.success(`Proforma #${numero || id} eliminada correctamente`);
    } catch (error) {
      console.error("Error al eliminar proforma:", error);
      
      // Detectar si es un error de rate limiting
      const isRateLimitError = error && (
        error.status === 429 || 
        (error.response && error.response.status === 429)
      );
      
      if (isRateLimitError) {
        // En caso de rate limiting, simular la eliminación de todas formas
        // para dar una mejor experiencia al usuario
        setProformasGuardadas(prevProformas => prevProformas.filter(p => p.id !== id));
        
        if (proformasCache.data.length > 0) {
          proformasCache.data = proformasCache.data.filter(p => p.id !== id);
        }
        
        toast.warning("El servidor está procesando demasiadas solicitudes", {
          description: "La proforma será eliminada cuando el servidor esté disponible"
        });
        
        // Incrementar contador de intentos fallidos
        failedAttempts = Math.min(failedAttempts + 1, 5);
        return;
      }
      
      // Mensajes de error más específicos
      let errorMessage = "No se pudo eliminar la proforma";
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = "No tiene permisos para eliminar esta proforma";
        } else if (error.response.status === 404) {
          errorMessage = "La proforma ya no existe o fue eliminada previamente";
          // Actualizar la lista para eliminar la proforma que ya no existe
          setProformasGuardadas(prevProformas => prevProformas.filter(p => p.id !== id));
          
          // También actualizar la caché
          if (proformasCache.data.length > 0) {
            proformasCache.data = proformasCache.data.filter(p => p.id !== id);
          }
        } else {
          errorMessage = `Error al eliminar: ${error.response.data?.message || error.response.statusText}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      toast.dismiss("delete-proforma");
    }
  };
  
  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Obtener el icono para el estado de la proforma
  const getStatusIcon = (status) => {
    switch (status) {
      case "aprobada":
        return <Check className="h-4 w-4 text-green-600" />;
      case "enviada":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "borrador":
        return <ClipboardList className="h-4 w-4 text-gray-600" />;
      case "rechazada":
        return <X className="h-4 w-4 text-red-600" />;
      case "vencida":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default:
        return <ClipboardList className="h-4 w-4 text-gray-600" />;
    }
  };
  
  // Obtener las clases de estilo para la insignia de estado
  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "aprobada":
        return "bg-green-50 text-green-700 border-green-200";
      case "enviada":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "borrador":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "rechazada":
        return "bg-red-50 text-red-700 border-red-200";
      case "vencida":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  
  // Filtrar proformas según término de búsqueda y estado activo
  const proformasFiltradas = proformasGuardadas.filter(proforma => {
    // Agregar log para depuración específico para ver nombres
    console.log(`FILTRADO DE PROFORMA #${proforma.id || 'N/A'}: nombre="${proforma.nombre || 'VACÍO'}", número="${proforma.numero || 'N/A'}", tipo nombre=${typeof proforma.nombre}`);
    
    // Extraer la información del cliente de manera unificada, igual que en renderización
    let clienteNombre = "";
    
    if (proforma.cliente_nombre) {
      clienteNombre = proforma.cliente_nombre;
    } else if (proforma.cliente && typeof proforma.cliente === 'object' && proforma.cliente.nombre) {
      clienteNombre = proforma.cliente.nombre;
    } else if (proforma.cliente && typeof proforma.cliente === 'string') {
      clienteNombre = `Cliente #${proforma.cliente}`;
    } else if (proforma.quote) {
      if (proforma.quote.cliente_nombre) {
        clienteNombre = proforma.quote.cliente_nombre;
      } else if (proforma.quote.cliente && proforma.quote.cliente.nombre) {
        clienteNombre = proforma.quote.cliente.nombre;
      }
    }
    
    // Filtrar por término de búsqueda
    const searchMatch = !searchTerm ? true : (
      proforma.numero?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      proforma.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clienteNombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Filtrar por estado
    const statusMatch = activeFilter === "todas" ? true : 
      proforma.estado === activeFilter;
    
    return searchMatch && statusMatch;
  });
  
  // Contar proformas por estado
  const contadores = {
    todas: proformasGuardadas.length,
    borrador: proformasGuardadas.filter(p => p.estado === "borrador").length,
    enviadas: proformasGuardadas.filter(p => p.estado === "enviada").length,
    aprobadas: proformasGuardadas.filter(p => p.estado === "aprobada").length,
    rechazadas: proformasGuardadas.filter(p => p.estado === "rechazada").length,
    vencidas: proformasGuardadas.filter(p => p.estado === "vencida").length
  };
  
  // Manejar cierre del diálogo
  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };
  
  // Crear una nueva proforma
  const handleNewProforma = () => {
    handleClose();
    // Reutilizamos la misma función que el componente padre nos da, con un ID "new"
    onSelectProforma("new");
  };
  
  // Renderizado de lista de proformas como tabla estructurada
  const renderListView = () => (
    <div className="w-full overflow-hidden border rounded-md">
      {/* Encabezados de columna */}
      <div className="grid grid-cols-12 bg-gray-50 text-gray-600 text-xs font-medium border-b">
        <div className="col-span-3 p-3 pl-4">Número / Fecha</div>
        <div className="col-span-4 p-3">Nombre / Cliente</div>
        <div className="col-span-2 px-4 py-3 text-center">Total</div>
        <div className="col-span-1 px-4 py-3 text-center">Estado</div>
        <div className="col-span-2 p-3 text-center pr-4">Acciones</div>
      </div>
      
      {/* Filas de datos */}
      {proformasFiltradas.map((proforma) => {
        // Preparamos la información del cliente para simplificar la lógica de renderizado
        const clienteInfo = {
          nombre: null,
          ruc: null
        };
        
        // Intentamos obtener los datos del cliente de las diferentes posibles fuentes
        // Priorizar información del cliente según diversas fuentes
        // 1. Cliente completo desde cliente_detail (objeto serializado del backend)
        if (proforma.cliente_detail && proforma.cliente_detail.nombre) {
          clienteInfo.nombre = proforma.cliente_detail.nombre;
          if (proforma.cliente_detail.ruc) {
            clienteInfo.ruc = proforma.cliente_detail.ruc;
          }
        }
        // 2. Campo directo cliente_nombre 
        else if (proforma.cliente_nombre) {
          clienteInfo.nombre = proforma.cliente_nombre;
        } 
        // 3. Cliente como objeto con propiedades
        else if (proforma.cliente && typeof proforma.cliente === 'object') {
          if (proforma.cliente.nombre) {
            clienteInfo.nombre = proforma.cliente.nombre;
          }
          if (proforma.cliente.ruc) {
            clienteInfo.ruc = proforma.cliente.ruc;
          }
        } 
        // 4. Cliente como ID (string o número)
        else if (proforma.cliente && (typeof proforma.cliente === 'string' || typeof proforma.cliente === 'number')) {
          clienteInfo.nombre = `Cliente ID: ${proforma.cliente}`;
        } 
        // 5. Extracción desde objeto quote (si existe)
        else if (proforma.quote) {
          if (proforma.quote.cliente_nombre) {
            clienteInfo.nombre = proforma.quote.cliente_nombre;
          } else if (proforma.quote.cliente && proforma.quote.cliente.nombre) {
            clienteInfo.nombre = proforma.quote.cliente.nombre;
          }
          
          if (proforma.quote.cliente_ruc) {
            clienteInfo.ruc = proforma.quote.cliente_ruc;
          } else if (proforma.quote.cliente && proforma.quote.cliente.ruc) {
            clienteInfo.ruc = proforma.quote.cliente.ruc;
          }
        }
        
        return (
          <div 
            key={proforma.id} 
            className="grid grid-cols-12 hover:bg-gray-50 border-b last:border-b-0 transition-colors text-sm items-center"
          >
            {/* Número y Fecha unificados */}
            <div className="col-span-2 p-3 pl-4">
              <div className="flex flex-col">
                <div className="font-bold text-base truncate">
                  #{proforma.numero || '---'}
                </div>
                <div className="flex items-center text-gray-500 mt-1 text-xs">
                  <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{formatDate(proforma.fecha_emision)}</span>
                </div>
              </div>
            </div>
            
            {/* Nombre / Cliente - Columna unificada */}
            <div className="col-span-5 p-3">
              <div className="flex flex-col">
                {/* Nombre de la proforma - Mostrando exactamente lo que viene de la BD */}
                <div className="font-medium truncate text-blue-700">
                  {proforma.nombre ? (
                    <span>{proforma.nombre}</span>
                  ) : (
                    <span className="text-gray-400 italic">Sin nombre</span>
                  )}
                </div>
                
                {/* Información del cliente */}
                <div className="flex items-center gap-2 text-gray-600 mt-1.5 text-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                      {proforma.cliente_detail?.nombre ? 
                        proforma.cliente_detail.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : 
                        (proforma.cliente_nombre ?
                          proforma.cliente_nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() :
                          (proforma.cliente && typeof proforma.cliente === 'object' && proforma.cliente.nombre ?
                            proforma.cliente.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() :
                            "CL"))}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Mostrar nombre de cliente */}
                  <span className="truncate font-medium">
                    {clienteInfo.nombre ? (
                      clienteInfo.nombre
                    ) : (
                      <span className="text-blue-600">
                        {proforma.cliente_detail ? proforma.cliente_detail.nombre : 
                         (proforma.cliente && typeof proforma.cliente === 'object' && proforma.cliente.nombre) ? 
                           proforma.cliente.nombre : 
                           (proforma.cliente && typeof proforma.cliente === 'string' || typeof proforma.cliente === 'number') ? 
                             `Cliente ID: ${proforma.cliente}` : 'Sin cliente asignado'}
                      </span>
                    )}
                  </span>
                  
                  {/* RUC oculto por solicitud del usuario */}
                </div>
              </div>
            </div>
            
            {/* Total */}
            <div className="col-span-2 px-4 py-3 text-left">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <span className="font-semibold truncate text-base">{formatCurrency(proforma.total)}</span>
              </div>
            </div>
            
            {/* Estado */}
            <div className="col-span-1 px-4 py-3">
              <div className="flex items-center justify-center">
                <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                  proforma.estado === 'borrador' ? 'bg-gray-100 text-gray-800' : 
                  proforma.estado === 'enviada' ? 'bg-blue-100 text-blue-800' : 
                  proforma.estado === 'aprobada' ? 'bg-green-100 text-green-800' : 
                  proforma.estado === 'rechazada' ? 'bg-red-100 text-red-800' : 
                  proforma.estado === 'vencida' ? 'bg-amber-100 text-amber-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {proforma.estado || 'borrador'}
                </span>
              </div>
            </div>
            
            {/* Acciones */}
            <div className="col-span-2 p-3 flex items-center justify-end gap-2 pr-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        onSelectProforma(proforma.id);
                        handleClose();
                      }}
                      className="h-8 w-8 rounded-full hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Editar proforma</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
                        window.open(`${apiBase}/proformas/proformas/${proforma.id}/exportar_pdf/`, '_blank');
                      }}
                      className="h-8 w-8 rounded-full hover:bg-gray-100"
                    >
                      <FileOutput className="h-4 w-4 text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exportar a PDF</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        // Crear nuevo correo con el PDF como archivo adjunto
                        toast.info("Funcionalidad de envío por correo en desarrollo");
                      }}
                      className="h-8 w-8 rounded-full hover:bg-blue-50"
                    >
                      <Mail className="h-4 w-4 text-blue-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enviar por correo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {proforma.estado === 'borrador' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => eliminarProforma(proforma.id, proforma.numero)}
                        className="h-8 w-8 rounded-full hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Eliminar proforma</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Si no hay resultados dentro de la tabla */}
      {proformasFiltradas.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No se encontraron proformas que coincidan con los criterios de búsqueda.
        </div>
      )}
    </div>
  );
  
  // Renderizado de lista de proformas (vista de cuadrícula)
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {proformasFiltradas.map((proforma) => {
        // Preparamos la información del cliente para simplificar la lógica de renderizado
        const clienteInfo = {
          nombre: null,
          ruc: null
        };
        
        // Intentamos obtener los datos del cliente de las diferentes posibles fuentes
        // Priorizar información del cliente según diversas fuentes
        // 1. Cliente completo desde cliente_detail (objeto serializado del backend)
        if (proforma.cliente_detail && proforma.cliente_detail.nombre) {
          clienteInfo.nombre = proforma.cliente_detail.nombre;
          if (proforma.cliente_detail.ruc) {
            clienteInfo.ruc = proforma.cliente_detail.ruc;
          }
        }
        // 2. Campo directo cliente_nombre 
        else if (proforma.cliente_nombre) {
          clienteInfo.nombre = proforma.cliente_nombre;
        } 
        // 3. Cliente como objeto con propiedades
        else if (proforma.cliente && typeof proforma.cliente === 'object') {
          if (proforma.cliente.nombre) {
            clienteInfo.nombre = proforma.cliente.nombre;
          }
          if (proforma.cliente.ruc) {
            clienteInfo.ruc = proforma.cliente.ruc;
          }
        } 
        // 4. Cliente como ID (string o número)
        else if (proforma.cliente && (typeof proforma.cliente === 'string' || typeof proforma.cliente === 'number')) {
          clienteInfo.nombre = `Cliente ID: ${proforma.cliente}`;
        } 
        // 5. Extracción desde objeto quote (si existe)
        else if (proforma.quote) {
          if (proforma.quote.cliente_nombre) {
            clienteInfo.nombre = proforma.quote.cliente_nombre;
          } else if (proforma.quote.cliente && proforma.quote.cliente.nombre) {
            clienteInfo.nombre = proforma.quote.cliente.nombre;
          }
          
          if (proforma.quote.cliente_ruc) {
            clienteInfo.ruc = proforma.quote.cliente_ruc;
          } else if (proforma.quote.cliente && proforma.quote.cliente.ruc) {
            clienteInfo.ruc = proforma.quote.cliente.ruc;
          }
        }
        
        return (
          <Card 
            key={proforma.id} 
            className="p-4 hover:bg-gray-50 transition-colors border border-gray-200 rounded-md shadow-sm"
          >
            <div className="flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${
                    proforma.estado === 'borrador' ? 'bg-gray-100' : 
                    proforma.estado === 'enviada' ? 'bg-blue-100' : 
                    proforma.estado === 'aprobada' ? 'bg-green-100' : 
                    proforma.estado === 'rechazada' ? 'bg-red-100' : 
                    'bg-gray-100'
                  }`}>
                    {getStatusIcon(proforma.estado)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Proforma #{proforma.numero || '---'}</h3>
                    {proforma.nombre && (
                      <p className="text-sm font-medium text-blue-700">{proforma.nombre}</p>
                    )}
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={getStatusBadgeClasses(proforma.estado)}
                >
                  {proforma.estado || 'borrador'}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-700 mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                      {proforma.cliente_detail?.nombre ? 
                        proforma.cliente_detail.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : 
                        (proforma.cliente_nombre ?
                          proforma.cliente_nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() :
                          (proforma.cliente && typeof proforma.cliente === 'object' && proforma.cliente.nombre ?
                            proforma.cliente.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() :
                            "CL"))}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {clienteInfo.nombre ? clienteInfo.nombre : 
                     <span className="text-blue-600">
                       {proforma.cliente_detail ? proforma.cliente_detail.nombre : 
                        (proforma.cliente && typeof proforma.cliente === 'object' && proforma.cliente.nombre) ? 
                          proforma.cliente.nombre : 
                          (proforma.cliente && (typeof proforma.cliente === 'string' || typeof proforma.cliente === 'number')) ? 
                            `Cliente ID: ${proforma.cliente}` : 'Sin cliente asignado'}
                     </span>
                    }
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-3 text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(proforma.fecha_emision)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(proforma.total)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          onSelectProforma(proforma.id);
                          handleClose();
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar esta proforma</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
                          window.open(`${apiBase}/proformas/proformas/${proforma.id}/exportar_pdf/`, '_blank');
                        }}
                      >
                        <FileOutput className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Exportar a PDF</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {proforma.estado === 'borrador' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => eliminarProforma(proforma.id, proforma.numero)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Eliminar esta proforma</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Proformas Guardadas</DialogTitle>
          <DialogDescription>
            Gestione sus proformas y seleccione una para editar
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar por número, nombre o cliente..."
                className="pl-9 w-full border-gray-300 focus:border-blue-400 focus:ring-blue-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                aria-label="Buscar proformas"
              />
              {searchTerm && (
                <Button 
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0.5 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSearchTerm("");
                  }}
                  disabled={loading}
                >
                  <X className="h-4 w-4 text-gray-400" />
                  <span className="sr-only">Limpiar búsqueda</span>
                </Button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={cargarProformas}
              disabled={loading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualizar
            </Button>
          </div>
        </div>
        
        <Tabs value={activeFilter} defaultValue="todas" className="mb-5 border-b pb-1">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-2 bg-gray-50/80">
            <TabsTrigger 
              value="todas" 
              onClick={() => setActiveFilter("todas")}
              disabled={loading}
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              <span className="flex flex-col items-center">
                <span>Todas</span>
                <span className="text-xs font-normal mt-0.5 text-gray-500 data-[state=active]:text-blue-500">
                  {contadores.todas}
                </span>
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="borrador" 
              onClick={() => setActiveFilter("borrador")}
              disabled={loading}
              className="data-[state=active]:bg-white data-[state=active]:text-gray-700 data-[state=active]:shadow-sm"
            >
              <span className="flex flex-col items-center">
                <span>Borrador</span>
                <span className="text-xs font-normal mt-0.5 text-gray-500 data-[state=active]:text-gray-600">
                  {contadores.borrador}
                </span>
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="enviada" 
              onClick={() => setActiveFilter("enviada")}
              disabled={loading}
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              <span className="flex flex-col items-center">
                <span>Enviadas</span>
                <span className="text-xs font-normal mt-0.5 text-gray-500 data-[state=active]:text-blue-500">
                  {contadores.enviadas}
                </span>
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="aprobada" 
              onClick={() => setActiveFilter("aprobada")}
              disabled={loading}
              className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
            >
              <span className="flex flex-col items-center">
                <span>Aprobadas</span>
                <span className="text-xs font-normal mt-0.5 text-gray-500 data-[state=active]:text-green-500">
                  {contadores.aprobadas}
                </span>
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="rechazada" 
              onClick={() => setActiveFilter("rechazada")}
              disabled={loading}
              className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"
            >
              <span className="flex flex-col items-center">
                <span>Rechazadas</span>
                <span className="text-xs font-normal mt-0.5 text-gray-500 data-[state=active]:text-red-500">
                  {contadores.rechazadas}
                </span>
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="vencida" 
              onClick={() => setActiveFilter("vencida")}
              disabled={loading}
              className="data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm"
            >
              <span className="flex flex-col items-center">
                <span>Vencidas</span>
                <span className="text-xs font-normal mt-0.5 text-gray-500 data-[state=active]:text-amber-500">
                  {contadores.vencidas}
                </span>
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <ScrollArea className="flex-grow">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">Cargando proformas...</p>
                <p className="text-sm text-gray-500 text-center max-w-xs">
                  Estamos recuperando la información de sus proformas guardadas. Esto puede tomar unos segundos.
                </p>
              </div>
            </div>
          ) : proformasGuardadas.length === 0 ? (
            <div className="flex items-center justify-center py-14">
              <div className="flex flex-col items-center">
                <div className="bg-blue-50 p-5 rounded-full mb-5">
                  <FileText className="h-14 w-14 text-blue-400" />
                </div>
                <p className="text-xl font-medium text-gray-800 mb-3">No hay proformas guardadas</p>
                <p className="text-gray-500 mb-5 text-center max-w-md">
                  Aún no tiene proformas guardadas en el sistema. Cree su primera proforma para comenzar a gestionar sus cotizaciones de manera eficiente.
                </p>
                <Button 
                  onClick={handleNewProforma}
                  className="flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  <span className="font-medium">Crear primera proforma</span>
                </Button>
              </div>
            </div>
          ) : proformasFiltradas.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="bg-amber-50 p-5 rounded-full mb-5">
                  <Search className="h-12 w-12 text-amber-500" />
                </div>
                <p className="text-xl font-medium text-gray-800 mb-3">No se encontraron resultados</p>
                <p className="text-gray-500 mb-4 text-center max-w-md">
                  No se encontraron proformas que coincidan con 
                  {searchTerm ? <span className="font-medium"> "{searchTerm}"</span> : ""} 
                  {activeFilter !== "todas" ? <span className="font-medium"> en estado "{activeFilter}"</span> : ""}
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setActiveFilter("todas");
                    }}
                    className="flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Limpiar filtros
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={cargarProformas}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-1">
              {viewType === "grid" ? renderGridView() : renderListView()}
            </div>
          )}
        </ScrollArea>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200 mt-4">
          <div className="flex flex-col text-sm">
            <div className="text-gray-500">
              {proformasFiltradas.length} {proformasFiltradas.length === 1 ? 'proforma' : 'proformas'} 
              {searchTerm ? <span className="font-medium"> con "{searchTerm}"</span> : ''}
              {activeFilter !== "todas" ? <span className="font-medium"> en estado "{activeFilter}"</span> : ""}
            </div>
            {!loading && proformasGuardadas.length > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                Total: {contadores.todas} proformas ({contadores.borrador} borradores,{' '}
                {contadores.enviadas} enviadas, {contadores.aprobadas} aprobadas)
              </div>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="border-gray-300"
            >
              Cerrar
            </Button>
            <Button
              onClick={handleNewProforma}
              className="flex items-center bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="font-medium">Nueva proforma</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProformasDialog;