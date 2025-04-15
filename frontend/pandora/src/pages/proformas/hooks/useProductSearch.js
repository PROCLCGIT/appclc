// src/pages/proformas/hooks/useProductSearch.js

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Hook personalizado para búsqueda y gestión de productos
 * @param {Object} proformasService - Instancia del servicio de proformas para llamadas API
 */
export const useProductSearch = (proformasService) => {
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSource, setSearchSource] = useState("ofertados"); // Por defecto buscar en productos ofertados
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [viewType, setViewType] = useState("grid"); // o "list"
  
  // Referencias para evitar peticiones duplicadas
  const initialLoadDone = useRef(false);
  const timeoutRef = useRef(null);
  const lastSearch = useRef({ term: '', source: '' });
  
  // Referencias para rate limiting
  const rateLimitBackoff = useRef({
    isRateLimited: false,
    retryAfter: 0,
    count: 0
  });
  
  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Transforma datos de productos a un formato estándar
   * @param {Object} producto - Datos del producto desde el API
   * @returns {Object} Datos transformados
   */
  const transformProductData = (product) => {
    if (!product) return null;
    
    // Determinar el tipo de fuente y aplicar etiquetas visuales
    let sourceType = product.source || 'personalizado';
    let sourceLabel = '';
    
    if (sourceType === 'ofertados') {
      sourceLabel = 'Producto Ofertado';
    } else if (sourceType === 'disponibles') {
      sourceLabel = 'Producto Disponible';
    } else if (sourceType === 'inventario') {
      sourceLabel = 'Inventario';
    }
    
    // Extraer el ID real para cada tipo de producto
    let realId;
    if (product.id && typeof product.id === 'string') {
      // El backend puede devolver IDs en formato "of-123" o "disp-456"
      const parts = product.id.split('-');
      if (parts.length > 1) {
        realId = parseInt(parts[1], 10);
      } else {
        realId = product.id;
      }
    } else {
      realId = product.id;
    }
    
    return {
      id: product.id, // ID formateado que devuelve el backend
      realId: realId, // ID numérico extraído
      code: product.code || '',
      description: product.description || '',
      source: sourceType,
      sourceLabel: sourceLabel,
      price: parseFloat(product.price || 0),
      unit: product.unit || 'Unidad',
      stock: product.stock || 'Disponible',
      // Reconstruimos un objeto "original" con los datos necesarios para el backend
      original: {
        id: realId,
        tipo: sourceType,
        codigo: product.code || '',
        descripcion: product.description || '',
        precio: parseFloat(product.price || 0),
        unidad: product.unit || 'Unidad'
      }
    };
  };

  /**
   * Búsqueda de productos con rate limiting
   * @param {string} term - Término de búsqueda
   * @param {string} source - Fuente de productos (ofertados, disponibles, etc)
   * @returns {Promise<Array>} Lista de productos encontrados
   */
  const searchProducts = async (term, source = searchSource) => {
    // Cancelar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce más largo para evitar múltiples peticiones
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        // Prevenir búsquedas duplicadas
        if (lastSearch.current.term === term && lastSearch.current.source === source) {
          console.log(`Omitiendo búsqueda duplicada: "${term}" en fuente "${source}"`);
          resolve(searchResults);
          return;
        }
        
        // Actualizar referencia
        lastSearch.current = { term, source };
        
        setLoadingProducts(true);
        try {
          // Validar servicio
          if (!proformasService || typeof proformasService.searchProducts !== 'function') {
            throw new Error('Servicio de proformas no disponible');
          }
          
          const searchQuery = (!term || term.length < 2) ? "" : term;
          console.log(`Buscando "${searchQuery}" en fuente: ${source}`);
          
          // Si estamos en estado de rate limiting, verificar si ya podemos intentar de nuevo
          if (rateLimitBackoff.current.isRateLimited) {
            const now = Date.now();
            if (now < rateLimitBackoff.current.retryAfter) {
              const waitSeconds = Math.ceil((rateLimitBackoff.current.retryAfter - now) / 1000);
              console.log(`Rate limiting activo, esperar ${waitSeconds} segundos más`);
              
              // Mostrar toast solo si el tiempo de espera es significativo
              if (waitSeconds > 5) {
                toast.warning(`Demasiadas búsquedas, espera ${waitSeconds} segundos`);
              }
              
              setLoadingProducts(false);
              resolve([]);
              return;
            } else {
              // Ya pasó el tiempo de rate limiting, reiniciar
              console.log("Período de rate limiting finalizado, reiniciando");
              rateLimitBackoff.current.isRateLimited = false;
            }
          }
          
          // Realizar la búsqueda
          const response = await proformasService.searchProducts(searchQuery, source);
          
          // Procesar resultados
          if (Array.isArray(response)) {
            const results = response.map(transformProductData);
            setSearchResults(results);
            setShowSearchResults(true);
            
            // Resetear contador de rate limit después de una búsqueda exitosa
            rateLimitBackoff.current.count = 0;
            
            setLoadingProducts(false);
            resolve(results);
          } else {
            throw new Error('Formato de respuesta no válido');
          }
        } catch (error) {
          console.error("Error al buscar productos:", error);
          
          // Incrementar contador de rate limit y posiblemente activar backoff
          rateLimitBackoff.current.count++;
          
          if (rateLimitBackoff.current.count > 5) {
            // Activar rate limiting por 30 segundos + 5 segundos por cada intento fallido adicional
            const backoffTime = 30000 + ((rateLimitBackoff.current.count - 5) * 5000);
            rateLimitBackoff.current.isRateLimited = true;
            rateLimitBackoff.current.retryAfter = Date.now() + backoffTime;
            
            console.log(`Activando rate limiting por ${backoffTime/1000} segundos`);
            toast.error("Demasiadas búsquedas, intenta de nuevo más tarde");
          }
          
          setLoadingProducts(false);
          resolve([]);
        }
      }, 300); // 300ms de debounce
    });
  };

  /**
   * Carga productos iniciales bajo demanda
   * Esta función está diseñada para ser llamada manualmente, no durante la inicialización
   */
  const loadInitialProducts = async () => {
    try {
      // Verificar si ya hemos cargado productos iniciales
      if (initialLoadDone.current) {
        console.log("Carga inicial ya realizada anteriormente");
        return;
      }
      
      // Si estamos en estado de rate limiting, no intentar la carga
      if (rateLimitBackoff.current.isRateLimited) {
        console.log("No se intentará carga inicial mientras estemos en estado de rate limit");
        toast.warning("Espera un momento antes de cargar productos");
        return;
      }
      
      console.log("Cargando productos iniciales (ofertados) bajo demanda");
      
      // Usar una versión sin debounce para la carga inicial
      try {
        setLoadingProducts(true);
        // Esperar un poco para asegurar que no estamos haciendo demasiadas peticiones
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Usar directamente el servicio para evitar debounce y duplicar peticiones
        const response = await proformasService.searchProducts("", "ofertados");
        
        if (Array.isArray(response)) {
          const results = response.map(transformProductData).slice(0, 5);
          setSearchResults(results);
          console.log(`Cargados ${results.length} productos iniciales`);
          
          // Marcar como completado solo si tuvimos éxito
          initialLoadDone.current = true;
        }
      } catch (innerError) {
        console.error("Error en carga inicial de productos:", innerError);
        
        // Verificar si es un error de rate limiting e incrementar contador
        rateLimitBackoff.current.count++;
        
        // Notificar si es un error específico de conexión o authorización
        if (innerError.message.includes('conexión') || innerError.message.includes('autorización')) {
          toast.error("Error de conexión al cargar productos");
        }
      } finally {
        setLoadingProducts(false);
      }
    } catch (error) {
      console.error("Error general en loadInitialProducts:", error);
    }
  };

  // Método alias de buscarProductos para mantener compatibilidad con código existente
  const buscarProductos = searchProducts;

  return {
    searchTerm,
    setSearchTerm,
    searchSource,
    setSearchSource,
    searchResults,
    setSearchResults,
    showSearchResults,
    setShowSearchResults,
    loadingProducts,
    viewType,
    setViewType,
    searchProducts,
    buscarProductos, // Incluir el alias
    loadInitialProducts
  };
};

export default useProductSearch;
