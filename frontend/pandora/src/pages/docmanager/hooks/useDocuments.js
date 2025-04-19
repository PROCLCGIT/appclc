import { useState, useEffect, useCallback, useMemo } from 'react';
import { documentService } from '@/services/classes';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/config/constants';

/**
 * Hook personalizado para manejar la lógica de documentos
 * @returns {Object} Estado y funciones relacionadas con documentos
 */
const useDocuments = () => {
  // Obtener la función toast del contexto
  const { toast } = useToast();
  
  // Estados para documentos y metadatos
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados para filtros y ordenamiento
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Estados para datos relacionados
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [tagsLoaded, setTagsLoaded] = useState(false);
  
  // Estado para paginación
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    current: 1,
    total_pages: 1
  });
  
  // Cache para evitar recargas innecesarias
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState(0);
  // Tiempo de caché en ms (5 minutos)
  const CACHE_TIME = 5 * 60 * 1000;
  
  // Construir parámetros de consulta - memoizado para evitar recálculos
  const queryParams = useMemo(() => {
    const params = {
      search: searchQuery,
      ordering: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`,
      page: pagination.current
    };
    
    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
    }
    
    return params;
  }, [searchQuery, selectedCategory, sortBy, sortOrder, pagination.current]);
  
  /**
   * Procesa documentos para normalizar sus propiedades
   * @param {Array} docs - Documentos a procesar
   * @returns {Array} Documentos procesados
   */
  const processDocuments = useCallback((docs) => {
    if (!Array.isArray(docs)) return [];
    
    return docs.map(doc => {
      if (!doc || typeof doc !== 'object') return null;
      
      // Procesamiento de categoría
      let categoryName = '';
      let categoryObj = null;
      
      if (doc.category_name) {
        categoryName = doc.category_name;
      } else if (doc.category) {
        if (typeof doc.category === 'object' && doc.category !== null) {
          categoryName = doc.category.name || 'Categoría sin nombre';
          categoryObj = doc.category;
        } else if (typeof doc.category === 'string') {
          categoryName = doc.category;
        } else if (typeof doc.category === 'number') {
          // Buscar en la lista de categorías
          const foundCategory = categories.find(c => c.id === doc.category);
          categoryName = foundCategory ? foundCategory.name : `Categoría ${doc.category}`;
          categoryObj = foundCategory || { id: doc.category, name: categoryName };
        }
      }
      
      // Calcular el tipo de archivo
      const fileType = doc.file_type || 
        (doc.file_name ? doc.file_name.split('.').pop().toLowerCase() : 'unknown');
      
      return {
        ...doc,
        category_name: categoryName || 'Sin categoría',
        category: categoryObj || { 
          id: typeof doc.category === 'number' ? doc.category : 0, 
          name: categoryName 
        },
        file_type: fileType,
        tags: Array.isArray(doc.tags) ? doc.tags : []
      };
    }).filter(Boolean); // Eliminar cualquier documento nulo
  }, [categories]);
  
  /**
   * Cargar categorías
   * @param {boolean} force - Forzar recarga incluso si ya están cargadas
   * @returns {Promise<Array>} Lista de categorías
   */
  const loadCategories = useCallback(async (force = false) => {
    if (categoriesLoaded && !force) {
      return categories;
    }
    
    try {
      console.log("Cargando categorías...");
      
      // Usar timeout para evitar bloqueos
      const result = await Promise.race([
        documentService.getCategories(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout al cargar categorías')), 5000)
        )
      ]);
      
      const categoriesList = result.results || [];
      
      setCategories(categoriesList);
      setCategoriesLoaded(true);
      return categoriesList;
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      
      // Si el error es timeout o recursos insuficientes, mostrar mensaje amigable
      const errorMessage = error.message.includes('Timeout') || 
                           error.message.includes('ERR_INSUFFICIENT_RESOURCES') ?
        'Problemas al cargar categorías. Se usarán valores predeterminados.' :
        'No se pudieron cargar las categorías';
      
      toast({
        title: 'Advertencia',
        description: errorMessage,
        variant: 'warning'
      });
      
      // Datos por defecto
      const defaultCategories = [
        { id: 1, name: "General" },
        { id: 2, name: "Documentos" }
      ];
      
      setCategories(defaultCategories);
      setCategoriesLoaded(true);
      return defaultCategories;
    }
  }, [categoriesLoaded, categories, toast]);
  
  /**
   * Cargar etiquetas
   * @param {boolean} force - Forzar recarga incluso si ya están cargadas
   * @returns {Promise<Array>} Lista de etiquetas
   */
  const loadTags = useCallback(async (force = false) => {
    if (tagsLoaded && !force) {
      return tags;
    }
    
    try {
      console.log("Cargando etiquetas...");
      
      // Usar timeout para evitar bloqueos
      const result = await Promise.race([
        documentService.getTags(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout al cargar etiquetas')), 5000)
        )
      ]);
      
      const tagsList = result.results || [];
      
      setTags(tagsList);
      setTagsLoaded(true);
      return tagsList;
    } catch (error) {
      console.error('Error al cargar etiquetas:', error);
      
      // Si el error es timeout o recursos insuficientes, mostrar mensaje amigable
      const errorMessage = error.message.includes('Timeout') || 
                           error.message.includes('ERR_INSUFFICIENT_RESOURCES') ?
        'Problemas al cargar etiquetas. Se usarán valores predeterminados.' :
        'No se pudieron cargar las etiquetas';
      
      toast({
        title: 'Advertencia',
        description: errorMessage,
        variant: 'warning'
      });
      
      // Datos por defecto
      const defaultTags = [
        { id: 1, name: "Importante", color_code: "#FF0000" },
        { id: 2, name: "Urgente", color_code: "#FFA500" }
      ];
      
      setTags(defaultTags);
      setTagsLoaded(true);
      return defaultTags;
    }
  }, [tagsLoaded, tags, toast]);
  
  /**
   * Cargar documentos con parámetros de consulta
   * @param {Object} params - Parámetros para la consulta
   * @param {boolean} showToast - Mostrar notificación durante la carga
   * @returns {Promise<Object>} Respuesta con documentos y metadatos
   */
  const fetchDocuments = useCallback(async (params, showToast = false) => {
    try {
      if (showToast) {
        toast({
          title: 'Cargando...',
          description: params.search 
            ? `Buscando: "${params.search}"` 
            : 'Cargando documentos',
          duration: 1500
        });
      }
      
      console.log("fetchDocuments: Solicitando documentos con:", params);
      const response = await documentService.getDocuments(params);
      console.log("fetchDocuments: Respuesta recibida:", response);
      
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }
      
      if (!Array.isArray(response.results)) {
        console.error("fetchDocuments: Formato de respuesta inesperado:", response);
        throw new Error('Formato de respuesta inválido - results no es un array');
      }
      
      // Verificar explícitamente los datos recibidos
      if (response.results.length === 0) {
        console.warn("fetchDocuments: Se recibió un array vacío de resultados");
      } else {
        console.log("fetchDocuments: Primer documento recibido:", response.results[0]);
      }
      
      // Procesar documentos para normalizar propiedades
      const processedDocs = processDocuments(response.results);
      console.log("fetchDocuments: Documentos procesados:", processedDocs.length);
      
      // Actualizar el estado con los documentos procesados
      setDocuments(processedDocs);
      
      // Actualizar información de paginación
      const paginationData = {
        count: response.count || 0,
        next: response.next || null,
        previous: response.previous || null,
        current: response.current_page || params.page || 1,
        total_pages: response.total_pages || 1
      };
      
      console.log("fetchDocuments: Actualizando paginación:", paginationData);
      setPagination(paginationData);
      
      // Actualizar timestamp para caché
      setLastFetchTimestamp(Date.now());
      
      // Mostrar toast de éxito para búsquedas
      if (showToast && params.search) {
        toast({
          title: 'Resultados encontrados',
          description: `Se encontraron ${processedDocs.length} documentos`,
          duration: 2000
        });
      }
      
      return {
        documents: processedDocs,
        pagination: paginationData
      };
    } catch (error) {
      console.error('fetchDocuments: Error al cargar documentos:', error);
      
      // Intentar directamente con fetch como respaldo
      try {
        console.log("fetchDocuments: Intento de respaldo con fetch directo");
        const backupUrl = `${API_BASE_URL}/docmanager/documents/?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined)).toString()}`;
        console.log("fetchDocuments: URL de respaldo:", backupUrl);
        
        const backupResponse = await fetch(backupUrl);
        
        if (!backupResponse.ok) {
          throw new Error(`Error en respaldo: ${backupResponse.status}`);
        }
        
        const backupData = await backupResponse.json();
        console.log("fetchDocuments: Datos obtenidos con respaldo:", backupData);
        
        if (backupData && Array.isArray(backupData.results)) {
          // Procesar los documentos del respaldo
          const processedBackupDocs = processDocuments(backupData.results);
          console.log("fetchDocuments: Documentos de respaldo procesados:", processedBackupDocs.length);
          
          // Actualizar estados
          setDocuments(processedBackupDocs);
          setPagination({
            count: backupData.count || 0,
            next: backupData.next || null,
            previous: backupData.previous || null,
            current: backupData.current_page || params.page || 1,
            total_pages: backupData.total_pages || 1
          });
          
          if (showToast) {
            toast({
              title: 'Recuperado con éxito',
              description: `Se recuperaron ${processedBackupDocs.length} documentos con método alternativo`,
              variant: 'default'
            });
          }
          
          return {
            documents: processedBackupDocs,
            pagination: {
              count: backupData.count || 0,
              next: backupData.next || null,
              previous: backupData.previous || null,
              current: backupData.current_page || params.page || 1,
              total_pages: backupData.total_pages || 1
            }
          };
        }
      } catch (backupError) {
        console.error("fetchDocuments: El intento de respaldo también falló:", backupError);
      }
      
      // No mostrar toast en errores si es una carga silenciosa
      if (showToast) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los documentos. Por favor, inténtelo de nuevo.',
          variant: 'destructive'
        });
      }
      
      // Si todo falla, devolvemos un objeto vacío (pero bien formado)
      return { 
        documents: [], 
        pagination: { 
          count: 0, 
          total_pages: 1, 
          current: 1,
          next: null,
          previous: null
        } 
      };
    }
  }, [processDocuments, toast]);
  
  /**
   * Cargar datos iniciales (documentos, categorías, etiquetas)
   * @param {boolean} force - Forzar recarga incluso si la caché está válida
   */
  const fetchData = useCallback(async (force = false) => {
    setIsLoading(true);
    
    try {
      // Comprobar si necesitamos recargar (caché expirada o forzar)
      const now = Date.now();
      const needsRefresh = force || (now - lastFetchTimestamp > CACHE_TIME);
      
      if (needsRefresh) {
        // Cargar datos independientemente para mayor tolerancia a fallos
        try {
          await fetchDocuments(queryParams);
        } catch (docsError) {
          console.error('Error al cargar documentos:', docsError);
        }
        
        try {
          await loadCategories();
        } catch (catError) {
          console.error('Error al cargar categorías:', catError);
        }
        
        try {
          await loadTags();
        } catch (tagsError) {
          console.error('Error al cargar etiquetas:', tagsError);
        }
      }
    } catch (error) {
      console.error('Error general al cargar datos:', error);
      toast({
        title: 'Advertencia',
        description: 'Algunos recursos no pudieron cargarse correctamente. Se usarán datos locales.',
        variant: 'warning'
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchDocuments, loadCategories, loadTags, lastFetchTimestamp, queryParams, toast]);
  
  // Efecto para cargar datos cuando cambian los filtros o la página
  useEffect(() => {
    // Bandera para evitar carreras de condición
    let isMounted = true;
    
    // Control para evitar bucles de actualización
    // Utilizamos una clave de caché basada en los parámetros actuales
    const cacheKey = JSON.stringify(queryParams);
    const lastRunKey = `last_run_${cacheKey}`;
    
    // Si ya ejecutamos este efecto con los mismos parámetros recientemente, no lo repetimos
    if (sessionStorage.getItem(lastRunKey) === 'true') {
      console.log("useDocuments: Evitando ejecución duplicada para:", queryParams);
      return;
    }
    
    // Marcar que estamos ejecutando este efecto para estos parámetros
    sessionStorage.setItem(lastRunKey, 'true');
    
    // Función para cargar datos
    const loadData = async () => {
      if (!isMounted) return;
      
      // Establecer estado de carga
      setIsLoading(true);
      
      try {
        console.log("useDocuments: Iniciando carga de datos con queryParams:", queryParams);
        
        // Variable para verificar si ya cargamos documentos
        let documentsLoaded = false;
        
        // Intentar cargar documentos primero (método principal)
        try {
          console.log("useDocuments: Cargando documentos...");
          const result = await fetchDocuments(queryParams, false); // Cambiado a false para evitar toast
          console.log("useDocuments: Documentos cargados exitosamente:", result.documents?.length || 0);
          
          // Marcamos que los documentos se cargaron exitosamente
          documentsLoaded = true;
          
          if (result.documents?.length === 0) {
            console.warn("useDocuments: No se encontraron documentos en la respuesta");
          }
        } catch (docError) {
          console.error('useDocuments: Falló carga inicial de documentos:', docError);
          
          // Si el método principal falló, intentamos directamente con el servicio
          if (!documentsLoaded) {
            try {
              console.log("useDocuments: Intentando carga directa con DocumentService...");
              const directResponse = await documentService.getDocuments(queryParams);
              
              if (directResponse && directResponse.results) {
                console.log("useDocuments: Carga directa exitosa, procesando documentos:", directResponse.results.length);
                const processedDocs = processDocuments(directResponse.results);
                
                if (isMounted) {
                  setDocuments(processedDocs);
                  
                  // Actualizar información de paginación
                  setPagination({
                    count: directResponse.count || 0,
                    next: directResponse.next || null,
                    previous: directResponse.previous || null,
                    current: directResponse.current_page || queryParams.page || 1,
                    total_pages: directResponse.total_pages || 1
                  });
                  
                  // Marcar como cargado
                  documentsLoaded = true;
                }
              }
            } catch (directError) {
              console.error("useDocuments: El intento directo también falló:", directError);
            }
          }
        }
        
        // Cargar categorías solo si no están cargadas
        if (!categoriesLoaded && isMounted) {
          try {
            await loadCategories();
          } catch (catError) {
            console.error('useDocuments: Falló carga inicial de categorías:', catError);
            // Intento directo como respaldo
            try {
              const cats = await documentService.getCategories();
              if (cats && cats.results && isMounted) {
                setCategories(cats.results);
                setCategoriesLoaded(true);
              }
            } catch (e) {
              console.error("useDocuments: Intento directo de categorías también falló:", e);
            }
          }
        }
        
        // Cargar etiquetas solo si no están cargadas
        if (!tagsLoaded && isMounted) {
          try {
            await loadTags();
          } catch (tagError) {
            console.error('useDocuments: Falló carga inicial de etiquetas:', tagError);
            // Intento directo como respaldo
            try {
              const tags = await documentService.getTags();
              if (tags && tags.results && isMounted) {
                setTags(tags.results);
                setTagsLoaded(true);
              }
            } catch (e) {
              console.error("useDocuments: Intento directo de etiquetas también falló:", e);
            }
          }
        }
      } catch (error) {
        console.error('useDocuments: Error global en loadData:', error);
      } finally {
        // Limpiar estado de carga solo si el componente sigue montado
        if (isMounted) {
          setIsLoading(false);
          
          // Liberar la marca de ejecución después de un tiempo para permitir futuras ejecuciones
          setTimeout(() => {
            sessionStorage.removeItem(lastRunKey);
          }, 2000); // 2 segundos para evitar ejecuciones rápidas sucesivas
        }
      }
    };
    
    // Ejecutar carga de datos
    loadData();
    
    // Limpieza al desmontar
    return () => {
      isMounted = false;
      // También limpiar la marca de ejecución
      sessionStorage.removeItem(lastRunKey);
    };
  }, [/* Solo dependencias que realmente requieren recargar */
    queryParams.search, 
    queryParams.ordering, 
    queryParams.page, 
    queryParams.category
  ]);
  
  /**
   * Manejar búsqueda con parámetros adicionales
   * @param {string} query - Término de búsqueda
   * @param {Object} additionalParams - Parámetros adicionales
   * @returns {Promise<Object>} Resultado de la búsqueda
   */
  const handleSearch = async (query, additionalParams = {}) => {
    console.log("handleSearch iniciado con query:", query, "y params:", additionalParams);
    setIsSearching(true);
    
    try {
      // Construir parámetros completos para la búsqueda
      const params = {
        search: query || additionalParams.q || '',
        ordering: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`,
        page: 1 // Siempre volvemos a la primera página al buscar
      };
      
      // Añadir filtro de categoría si no es 'all'
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      // Añadir parámetros adicionales, excluyendo los que ya están configurados
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '' && 
            !['search', 'q', 'ordering', 'page'].includes(key)) {
          params[key] = value;
        }
      });
      
      console.log("Ejecutando búsqueda con parámetros finales:", JSON.stringify(params, null, 2));
      
      // Ejecutar la búsqueda con notificación
      const result = await fetchDocuments(params, true);
      
      // Mostrar notificación de resultados si es una búsqueda por término
      if (params.search) {
        toast({
          title: 'Búsqueda completada',
          description: `Se encontraron ${result.documents.length} resultados para "${params.search}"`,
          variant: result.documents.length > 0 ? 'default' : 'destructive',
          duration: 3000
        });
      }
      
      return result;
    } finally {
      setIsSearching(false);
    }
  };
  
  /**
   * Cambiar a una página específica de resultados
   * @param {number} page - Número de página
   */
  const goToPage = useCallback((page) => {
    if (page !== pagination.current && page > 0 && page <= pagination.total_pages) {
      setPagination(prev => ({
        ...prev,
        current: page
      }));
    }
  }, [pagination]);
  
  /**
   * Forzar recarga completa de datos
   */
  const refreshData = useCallback(async () => {
    console.log("Forzando recarga de todos los datos");
    
    // Reiniciar estados para forzar recarga completa
    setCategoriesLoaded(false);
    setTagsLoaded(false);
    
    setIsLoading(true);
    
    try {
      const result = await fetchDocuments(queryParams, true);
      await loadCategories(true);
      await loadTags(true);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [fetchDocuments, loadCategories, loadTags, queryParams]);
  
  /**
   * Forzar carga de categorías
   * @returns {Promise<Array>} Lista de categorías
   */
  const forceLoadCategories = useCallback(async () => {
    return loadCategories(true);
  }, [loadCategories]);
  
  /**
   * Manejar subida de documentos
   * @param {FormData} customFormData - Datos del formulario para subir
   * @returns {Promise<Object|null>} Documento creado o null si hay error
   */
  const handleUpload = useCallback(async (customFormData = null) => {
    if (!selectedFile && !customFormData) {
      toast({ 
        title: 'Error', 
        description: 'No se ha seleccionado ningún archivo.', 
        variant: 'destructive' 
      });
      return null;
    }

    setIsLoading(true);
    
    try {
      let formData;
      
      if (customFormData) {
        formData = customFormData;
      } else {
        formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', selectedFile.name.split('.')[0]);
      }
      
      const newDocument = await documentService.createDocument(formData);
      
      await refreshData();
      setSelectedFile(null);
      
      toast({
        title: 'Éxito',
        description: 'Documento subido correctamente',
      });
      
      return newDocument;
    } catch (error) {
      console.error('Error al subir documento:', error);
      
      // Intentar extraer mensaje de error más específico
      let errorMsg = 'No se pudo subir el documento. Verifique los datos e inténtelo de nuevo.';
      
      if (error.message) {
        errorMsg = error.message;
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error.response?.data) {
        // Si hay errores de validación específicos por campo
        try {
          const serverErrors = error.response.data;
          const errorMessages = [];
          
          Object.entries(serverErrors).forEach(([field, message]) => {
            if (Array.isArray(message)) {
              errorMessages.push(`${field}: ${message.join(', ')}`);
            } else if (typeof message === 'string') {
              errorMessages.push(`${field}: ${message}`);
            }
          });
          
          if (errorMessages.length > 0) {
            errorMsg = errorMessages.join('; ');
          }
        } catch (formatError) {
          console.warn("Error al formatear mensaje de error:", formatError);
        }
      }
      
      toast({
        title: 'Error al subir',
        description: errorMsg,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, refreshData, toast]);
  
  /**
   * Manejar descarga de documentos
   * @param {Object} document - Documento a descargar
   */
  const handleDownload = useCallback(async (document) => {
    try {
      const downloadInfo = await documentService.downloadDocument(document.id);
      
      if (downloadInfo.file_url) {
        const link = document.createElement('a');
        link.href = downloadInfo.file_url;
        link.setAttribute('download', downloadInfo.file_name || 'documento');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Descarga iniciada',
          description: `Descargando: ${downloadInfo.file_name}`,
        });
      } else {
        throw new Error('URL de descarga no disponible');
      }
    } catch (error) {
      console.error('Error al descargar documento:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar el documento. Por favor, inténtelo de nuevo.',
        variant: 'destructive'
      });
    }
  }, [toast]);
  
  /**
   * Manejar eliminación de documentos
   * @param {number} id - ID del documento a eliminar
   * @returns {Promise<boolean>} Resultado de la operación
   */
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Eliminar documento de la UI inmediatamente para una respuesta más rápida
      const documentToRemove = documents.find(doc => doc.id === id);
      const documentTitle = documentToRemove ? documentToRemove.title : 'Documento';
      
      // Actualizar la UI eliminando el documento de la lista local
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      // Realizar la eliminación en el servidor
      const deleted = await documentService.deleteDocument(id);
      
      if (!deleted) {
        // Si hay error, revertir la eliminación de la UI
        if (documentToRemove) {
          setDocuments(prev => [...prev, documentToRemove]);
        }
        throw new Error('Error al eliminar documento');
      }
      
      // Mostrar notificación de éxito
      toast({
        title: 'Éxito',
        description: `"${documentTitle}" eliminado correctamente`,
      });
      
      // Actualizar la lista de documentos
      await refreshData();
      
      return true;
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el documento. Por favor, inténtelo de nuevo.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [documents, refreshData, toast]);
  
  /**
   * Manejar cambio de estado favorito
   * @param {number} id - ID del documento a marcar/desmarcar
   * @returns {Promise<boolean>} Resultado de la operación
   */
  const handleToggleFavorite = useCallback(async (id) => {
    try {
      const result = await documentService.toggleFavorite(id);
      
      // Actualizar documento en el estado local
      setDocuments(prevDocs => prevDocs.map(doc => 
        doc.id === id ? { ...doc, is_favorite: result.is_favorite } : doc
      ));
      
      toast({
        title: 'Éxito',
        description: result.is_favorite ? 'Añadido a favoritos' : 'Eliminado de favoritos',
      });
      
      return true;
    } catch (error) {
      console.error('Error al cambiar estado de favorito:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de favorito.',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);
  
  /**
   * Crear una nueva categoría
   * @param {string} name - Nombre de la categoría
   * @returns {Promise<Object|null>} Categoría creada o null si hay error
   */
  const createCategory = useCallback(async (name) => {
    try {
      const newCategory = await documentService.createCategory({ name });
      
      // Actualizar lista de categorías
      setCategories(prev => [...prev, newCategory]);
      
      toast({
        title: 'Éxito',
        description: `Categoría "${name}" creada correctamente.`,
      });
      
      return newCategory;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      toast({
        title: 'Error',
        description: `No se pudo crear la categoría "${name}".`,
        variant: 'destructive'
      });
      return null;
    }
  }, [toast]);
  
  /**
   * Crear una nueva etiqueta
   * @param {string} name - Nombre de la etiqueta
   * @param {string} color_code - Código de color (hex)
   * @returns {Promise<Object|null>} Etiqueta creada o null si hay error
   */
  const createTag = useCallback(async (name, color_code = '#4F46E5') => {
    try {
      const newTag = await documentService.createTag({ name, color_code });
      
      // Actualizar lista de etiquetas
      setTags(prev => [...prev, newTag]);
      
      toast({
        title: 'Éxito',
        description: `Etiqueta "${name}" creada correctamente.`,
      });
      
      return newTag;
    } catch (error) {
      console.error('Error al crear etiqueta:', error);
      toast({
        title: 'Error',
        description: `No se pudo crear la etiqueta "${name}".`,
        variant: 'destructive'
      });
      return null;
    }
  }, [toast]);

  // Retornar todas las variables y funciones que necesita el componente
  return {
    // Estados
    documents,
    categories,
    tags,
    isLoading,
    isSearching,
    searchQuery,
    selectedCategory,
    sortBy,
    sortOrder,
    selectedFile,
    pagination,
    
    // Setters
    setDocuments,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    setSortOrder,
    setSelectedFile,
    
    // Funciones
    goToPage,
    handleUpload,
    handleDownload,
    handleDelete,
    handleToggleFavorite,
    createCategory,
    createTag,
    refreshData,
    forceLoadCategories,
    handleSearch,
    loadCategories,
    loadTags
  };
};

export default useDocuments;