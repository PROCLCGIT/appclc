import { useState, useEffect, useCallback } from 'react';
import { documentService } from '@/services/classes';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook personalizado para manejar la lógica de documentos
 */
const useDocuments = () => {
  // Obtener la función toast del contexto
  const { toast } = useToast();
  
  // Estados
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFile, setSelectedFile] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    current: 1,
    total_pages: 1
  });
  
  // Cargar datos iniciales (documentos, categorías, etiquetas)
  const fetchData = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      // Construir los parámetros de consulta
      const params = {
        search: searchQuery,
        ordering: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`,
        page: page
      };
      
      // Añadir filtro de categoría si no es 'all'
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      let documentsResponse;
      try {
        // Obtener documentos filtrados del backend
        documentsResponse = await documentService.getDocuments(params);
        console.log("Respuesta de documentos:", documentsResponse);
        
        // Verificar que tenemos resultados válidos
        if (documentsResponse && Array.isArray(documentsResponse.results)) {
          // Filtrar cualquier documento inválido
          const validDocuments = documentsResponse.results.filter(doc => 
            doc && typeof doc === 'object' && doc.id && doc.title
          );
          
          // Añadir campos faltantes si es necesario (por compatibilidad)
          const processedDocs = validDocuments.map(doc => {
            // Procesamiento especial para la categoría
            let categoryName = '';
            if (doc.category_name) {
              categoryName = doc.category_name;
            } else if (doc.category) {
              if (typeof doc.category === 'object' && doc.category !== null) {
                categoryName = doc.category.name || 'Categoría sin nombre';
              } else if (typeof doc.category === 'string') {
                categoryName = doc.category;
              } else if (typeof doc.category === 'number') {
                // Si solo tenemos el ID, intentar encontrar el nombre en la lista de categorías
                const categoryObj = categories.find(c => c.id === doc.category);
                categoryName = categoryObj ? categoryObj.name : `Categoría ${doc.category}`;
              }
            }
            
            return {
              ...doc,
              // Asegurar que category_name está disponible
              category_name: categoryName || 'Sin categoría',
              // Normalizar el objeto categoría si existe
              category: typeof doc.category === 'object' ? 
                { ...doc.category, name: doc.category?.name || categoryName } : 
                { id: typeof doc.category === 'number' ? doc.category : 0, name: categoryName },
              // Asegurar que file_type está disponible
              file_type: doc.file_type || (doc.file_name ? doc.file_name.split('.').pop() : 'unknown'),
              // Proporcionar tags si no existen
              tags: doc.tags || []
            };
          });
          
          setDocuments(processedDocs);
          console.log("Documentos procesados y actualizados:", processedDocs);
        } else {
          console.error("Error: La respuesta no tiene el formato esperado", documentsResponse);
          toast({
            title: 'Error en formato',
            description: 'La respuesta del servidor no tiene el formato esperado',
            variant: 'destructive'
          });
          
          // Establecer un array vacío para evitar errores
          setDocuments([]);
          
          // Asegurar que tenemos una estructura válida para paginación
          documentsResponse = { count: 0, next: null, previous: null };
        }
      } catch (innerError) {
        console.error("Error al procesar respuesta de documentos:", innerError);
        toast({
          title: 'Error',
          description: 'Error al procesar documentos',
          variant: 'destructive'
        });
        setDocuments([]);
        
        // Asegurar que tenemos una estructura válida para paginación
        documentsResponse = { count: 0, next: null, previous: null };
      }
      
      // Actualizar la información de paginación
      setPagination({
        count: documentsResponse?.count || 0,
        next: documentsResponse?.next || null,
        previous: documentsResponse?.previous || null,
        current: documentsResponse?.current_page || page,
        total_pages: documentsResponse?.total_pages || 1
      });
      
      // Cargar categorías y etiquetas solo si no están cargadas
      if (categories.length === 0) {
        console.log("Cargando categorías...");
        const categoriesResponse = await documentService.getCategories();
        console.log("Respuesta del servidor para categorías:", categoriesResponse);
        setCategories(categoriesResponse.results || []);
        console.log("Categorías después de establecerlas:", categoriesResponse.results || []);
      }
      if (tags.length === 0) {
        console.log("Cargando etiquetas...");
        const tagsResponse = await documentService.getTags();
        console.log("Respuesta del servidor para etiquetas:", tagsResponse);
        setTags(tagsResponse.results || []);
        console.log("Etiquetas después de establecerlas:", tagsResponse.results || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos. Por favor, inténtelo de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, sortBy, sortOrder]);

  // Estado para controlar cuándo se está realizando una búsqueda
  const [isSearching, setIsSearching] = useState(false);
  
  // Efecto para cargar datos cuando cambian los filtros o la página
  useEffect(() => {
    fetchData(pagination.current);
  }, [fetchData, pagination.current]);
  
  // Manejador de búsqueda directa (para button click o Enter)
  const handleSearch = async (query, additionalParams = {}) => {
    console.log("handleSearch iniciado con query:", query, "y params:", typeof additionalParams, additionalParams);
    setIsSearching(true);
    
    try {
      // Construir parámetros básicos para la búsqueda
      const params = {
        search: query || '', // Garantizar que search nunca sea undefined
        ordering: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`,
        page: 1 // Siempre volvemos a la primera página al buscar
      };
      
      // Aplicar filtro de categoría si no es 'all'
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      // Garantizar que additionalParams sea un objeto
      const safeParams = (additionalParams && typeof additionalParams === 'object') 
        ? additionalParams 
        : {};
      
      console.log("Parámetros adicionales seguros:", safeParams);
      
      // Manejar el parámetro q (query) de forma especial si existe
      if (safeParams.q && !query) {
        params.search = safeParams.q;
        console.log("Usando 'q' como término de búsqueda:", params.search);
      }
      
      // Para cada parámetro adicional, verificamos si tiene un valor válido
      Object.entries(safeParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Evitamos sobrescribir search, ordering y page que ya están configurados
          if (!['search', 'q', 'ordering', 'page'].includes(key)) {
            params[key] = value;
          }
        }
      });
      
      // Log detallado de los parámetros finales para depuración
      console.log("Ejecutando búsqueda con parámetros finales:", JSON.stringify(params, null, 2));
      
      // Mostrar indicador de búsqueda activa para el usuario
      toast({
        title: 'Buscando...',
        description: params.search ? `Buscando: "${params.search}"` : 'Cargando documentos',
        variant: 'default',
        duration: 1500
      });
      
      // Ejecutar la búsqueda
      const response = await documentService.getDocuments(params);
      
      // Procesar los resultados
      if (response && response.results) {
        // Actualizar la lista de documentos
        setDocuments(response.results);
        
        // Actualizar información de paginación
        setPagination({
          count: response.count || 0,
          next: response.next || null,
          previous: response.previous || null,
          current: response.current_page || 1,
          total_pages: response.total_pages || 1
        });
        
        // Log para seguimiento de resultados
        console.log(`Búsqueda completada: ${response.results.length} resultados de ${response.count} total`);
        
        // Mostrar notificación de resultados
        if (params.search) {
          toast({
            title: 'Búsqueda completada',
            description: `Se encontraron ${response.results.length} resultados para "${params.search}"`,
            variant: response.results.length > 0 ? 'default' : 'destructive',
            duration: 3000
          });
        }
      }
    } catch (error) {
      console.error("Error en búsqueda:", error);
      toast({
        title: 'Error',
        description: 'No se pudo completar la búsqueda',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Cambiar a una página específica
  const goToPage = (page) => {
    if (page !== pagination.current && page > 0 && page <= pagination.total_pages) {
        setPagination(prev => ({
          ...prev,
          current: page
        }));
    }
  };

  // Recargar datos (útil después de crear/eliminar)
  const refreshData = useCallback(() => {
    console.log("Forzando recarga de todos los datos");
    // Reiniciar todos los estados para forzar recarga completa
    setCategories([]);
    setTags([]);
    setDocuments([]);
    setPagination({
      count: 0,
      next: null,
      previous: null,
      current: 1,
      total_pages: 1
    });
    // Forzar timeout para asegurar que la UI se actualice
    setTimeout(() => {
      try {
        fetchData(1);
        console.log("Datos recargados exitosamente");
      } catch (error) {
        console.error("Error al recargar datos:", error);
        toast({
          title: 'Error al recargar',
          description: 'No se pudieron recargar los datos. Por favor, refresque la página.',
          variant: 'destructive'
        });
      }
    }, 500);
  }, [fetchData, toast]);
  
  // Forzar carga de categorías (aunque ya estén cargadas)
  const forceLoadCategories = async () => {
    try {
      console.log("Forzando carga de categorías...");
      const categoriesResponse = await documentService.getCategories();
      console.log("Respuesta forzada de categorías:", categoriesResponse);
      if (categoriesResponse && categoriesResponse.results) {
        setCategories(categoriesResponse.results);
        return categoriesResponse.results;
      } else {
        console.warn("La respuesta de categorías no tiene el formato esperado", categoriesResponse);
        return [];
      }
    } catch (error) {
      console.error("Error al forzar carga de categorías:", error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las categorías.',
        variant: 'destructive'
      });
      return [];
    }
  }

  // Manejar subida de archivos
  const handleUpload = async (customFormData = null) => {
    console.log("useDocuments.handleUpload llamado con:", { 
      tieneCustomFormData: !!customFormData, 
      tieneSelectedFile: !!selectedFile 
    });
    
    if (!selectedFile && !customFormData) {
        console.log("Error: No hay archivo seleccionado ni formData personalizado");
        toast({ title: 'Error', description: 'No se ha seleccionado ningún archivo.', variant: 'destructive' });
        return null;
    }

    setIsLoading(true);
    
    try {
      let formData;
      
      if (customFormData) {
        formData = customFormData;
        console.log("Usando formData personalizado con:", {
          file: formData.get('file')?.name,
          title: formData.get('title'),
          category: formData.get('category')
        });
      } else {
        formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', selectedFile.name.split('.')[0]);
        console.log("Creando nuevo formData con:", {
          file: selectedFile.name,
          title: selectedFile.name.split('.')[0]
        });
      }
      
      console.log("Llamando a documentService.createDocument...");
      
      try {
        const newDocument = await documentService.createDocument(formData);
        console.log("Documento creado exitosamente:", newDocument);
        
        refreshData();
        setSelectedFile(null);
        
        toast({
          title: 'Éxito',
          description: 'Documento subido correctamente',
        });
        
        return newDocument;
      } catch (createError) {
        console.error("Error en documentService.createDocument:", createError);
        throw createError;
      }
    } catch (error) {
      console.error('Error al subir documento:', error);
      
      // Intentar extraer un mensaje de error más específico
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
          
          Object.keys(serverErrors).forEach(field => {
            if (Array.isArray(serverErrors[field])) {
              errorMessages.push(`${field}: ${serverErrors[field].join(', ')}`);
            } else if (typeof serverErrors[field] === 'string') {
              errorMessages.push(`${field}: ${serverErrors[field]}`);
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
  };

  // Manejar descarga de archivos
  const handleDownload = async (document) => {
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
  };

  // Manejar eliminación de documentos
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      setIsLoading(true);
      
      try {
        await documentService.deleteDocument(id);
        fetchData(pagination.current);
        
        toast({
          title: 'Éxito',
          description: 'Documento eliminado correctamente',
        });
        
        return true;
      } catch (error) {
        console.error('Error al eliminar documento:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el documento. Por favor, inténtelo de nuevo.',
          variant: 'destructive'
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    }
    return false;
  };

  // Manejar favoritos
  const handleToggleFavorite = async (id) => {
    try {
      const result = await documentService.toggleFavorite(id);
      
      setDocuments(prevDocs => prevDocs.map(doc => 
        doc.id === id ? { ...doc, is_favorite: result.is_favorite } : doc
      ));
      
      toast({
        title: 'Éxito',
        description: result.is_favorite ? 'Añadido a favoritos' : 'Eliminado de favoritos',
      });
    } catch (error) {
      console.error('Error al cambiar estado de favorito:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de favorito.',
        variant: 'destructive'
      });
    }
  };

  // Función para crear una nueva categoría
  const createCategory = async (name) => {
    try {
      const newCategory = await documentService.createCategory({ name });
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
  };

  // Función para crear una nueva etiqueta
  const createTag = async (name) => {
    try {
      const newTag = await documentService.createTag({ name });
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
  };

  return {
    documents,
    categories,
    tags,
    isLoading,
    isSearching,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedFile,
    setSelectedFile,
    pagination,
    goToPage,
    handleUpload,
    handleDownload,
    handleDelete,
    handleToggleFavorite,
    createCategory,
    createTag,
    refreshData,
    forceLoadCategories,
    handleSearch,    // Exponemos la función de búsqueda
    setDocuments     // Exponemos la función setDocuments para permitir actualizaciones directas
  };
};

export default useDocuments;