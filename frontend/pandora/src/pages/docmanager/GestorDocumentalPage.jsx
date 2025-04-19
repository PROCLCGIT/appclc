import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Hooks personalizados
import { useToast } from '@/components/ui/use-toast';

// Utilidades para cargar documentos directamente
import {
  fetchDocuments,
  fetchCategories,
  fetchTags,
  uploadDocument,
  deleteDocument,
  toggleFavoriteDocument,
  getDocumentDownloadUrl,
  normalizeDocumentsData
} from './utils/utils';

// Servicios
import { documentService } from '@/services/classes';

// Configuración
import { API_BASE_URL } from '@/config/constants';

// Importación de componentes con lazy loading
const TagsModal = lazy(() => import('./components/modal/TagsModal'));
const GroupsModal = lazy(() => import('./components/modal/GroupsModal'));
const CollectionsModal = lazy(() => import('./components/modal/CollectionsModal'));
const SimpleUploadModal = lazy(() => import('./components/modal/SimpleUploadModal'));

// Componentes de layout que se cargan inmediatamente
import Header from './components/layout/Header';
import SearchBar from './components/layout/SearchBar';
import FilterPanel from './components/filters/FilterPanel';
import ViewToggle from './components/filters/ViewToggle';
import LoadingSpinner from './components/common/LoadingSpinner';
import EmptyState from './components/common/EmptyState';

// Componentes de documento (lazy loading)
const DocumentGrid = lazy(() => import('./components/documents/DocumentGrid'));
const DocumentList = lazy(() => import('./components/documents/DocumentList'));

// Fallback para componentes cargados con lazy
const ComponentFallback = () => <div className="p-4 animate-pulse bg-gray-100 rounded-md">Cargando componente...</div>;

// Componente para manejar errores en componentes
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800">
    <h3 className="text-lg font-medium mb-2">Ocurrió un error</h3>
    <p className="mb-3">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
    >
      Reintentar
    </button>
  </div>
);

/**
 * Componente principal del Gestor Documental
 * @returns {JSX.Element} Componente GestorDocumentalPage
 */
// Componente de diagnóstico simplificado
const SimpleDiagnosticComponent = () => {
  const { toast } = useToast();
  const [apiStatus, setApiStatus] = useState("No comprobado");
  const [documentsTest, setDocumentsTest] = useState([]);
  const [error, setError] = useState(null);

  // Función para verificar la API directamente
  const checkApi = async () => {
    try {
      setApiStatus("Verificando...");
      setError(null);
      
      // Usar la constante API_BASE_URL
      const url = `${API_BASE_URL}/docmanager/documents/`;
      console.log("Verificando API en:", url);
      
      // Simplificar la configuración del fetch
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al conectar con API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.results && Array.isArray(data.results)) {
        setDocumentsTest(data.results);
        setApiStatus(`API funcionando - ${data.results.length} documentos recibidos`);
        
        // Mostrar notificación de éxito
        toast({
          title: 'Conexión exitosa',
          description: `Se han recibido ${data.results.length} documentos de la API`,
          variant: 'default'
        });
      } else {
        setApiStatus("Respuesta recibida pero sin documentos");
        setError("La respuesta no contiene un array de documentos en el formato esperado");
        console.warn("Respuesta de API sin documentos:", data);
      }
    } catch (err) {
      console.error("Error al comprobar API:", err);
      setApiStatus("Error");
      setError(err.message);
      
      // Mostrar error
      toast({
        title: 'Error de conexión',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto p-8 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico del Gestor Documental</h1>
      
      <div className="mb-8 space-y-4">
        <div className="p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-medium mb-2">Estado de la API</h2>
          <p className="mb-2">Estado actual: <span className={`font-semibold ${apiStatus === "Error" ? "text-red-600" : apiStatus.includes("funcionando") ? "text-green-600" : "text-amber-600"}`}>{apiStatus}</span></p>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button onClick={checkApi} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Verificar conexión API
          </button>
        </div>
      </div>
      
      {documentsTest.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Documentos recibidos ({documentsTest.length})</h2>
          <div className="overflow-auto max-h-[400px] border rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documentsTest.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.file_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.category_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const GestorDocumentalPage = () => {
  // Estados locales (inicializa vista como lista en lugar de grid)
  const [viewMode, setViewMode] = useState('list');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [selectedDocumentForTags, setSelectedDocumentForTags] = useState(null);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [collections, setCollections] = useState([]);
  const [collectionToView, setCollectionToView] = useState(null);
  const { toast } = useToast();
  
  // Modo de diagnóstico desactivado por defecto
  const [diagnosticMode, setDiagnosticMode] = useState(false);
  
  // Estados para reemplazar el hook useDocuments
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFile, setSelectedFile] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, total_pages: 1, next: null, previous: null });
  
  // Función para cargar documentos con parámetros
  const loadDocuments = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      
      // Preparar parámetros básicos de consulta
      const queryParams = {
        ...params
      };
      
      // Añadir paginación si no se especifica
      if (!queryParams.page) {
        queryParams.page = pagination.current || 1;
      }
      
      // Añadir ordenamiento si no se especifica
      if (!queryParams.ordering) {
        queryParams.ordering = sortOrder === 'desc' ? `-${sortBy}` : sortBy;
      }
      
      // Añadir búsqueda si existe y no se especifica
      if (searchQuery && !queryParams.search) {
        queryParams.search = searchQuery;
      }
      
      // Añadir categoría si está seleccionada y no se especifica
      if (selectedCategory && selectedCategory !== 'all' && !queryParams.category) {
        queryParams.category = selectedCategory;
      }
      
      console.log("Cargando documentos con parámetros:", queryParams);
      
      // Obtener documentos
      const response = await fetchDocuments(queryParams);
      
      // Actualizar estado si hay respuesta
      if (response && response.results) {
        // Actualizar documentos
        setDocuments(response.results);
        
        // Actualizar paginación
        setPagination({
          current: response.current_page || queryParams.page,
          total_pages: response.total_pages || 1,
          next: response.next,
          previous: response.previous,
          count: response.count || response.results.length
        });
        
        console.log(`Documentos cargados: ${response.results.length} resultados`);
      } else {
        console.warn("Respuesta de documentos vacía o inválida");
        setDocuments([]);
      }
      
      return response;
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los documentos',
        variant: 'destructive'
      });
      setDocuments([]);
      return { results: [] };
    } finally {
      setIsLoading(false);
    }
  }, [pagination.current, searchQuery, selectedCategory, sortBy, sortOrder, toast]);
  
  // Función para cargar categorías
  const loadCategories = useCallback(async () => {
    try {
      const response = await fetchCategories();
      setCategories(response.results || []);
      return response.results;
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast({
        title: 'Advertencia',
        description: 'No se pudieron cargar las categorías',
        variant: 'warning'
      });
      return [];
    }
  }, [toast]);
  
  // Función para cargar etiquetas
  const loadTags = useCallback(async () => {
    try {
      const response = await fetchTags();
      setTags(response.results || []);
      return response.results;
    } catch (error) {
      console.error('Error al cargar etiquetas:', error);
      return [];
    }
  }, []);
  
  // Función para navegar a una página específica
  const goToPage = useCallback((pageNumber) => {
    if (pageNumber < 1 || pageNumber > pagination.total_pages) return;
    
    setPagination(prev => ({ ...prev, current: pageNumber }));
    loadDocuments({ page: pageNumber });
  }, [loadDocuments, pagination.total_pages]);
  
  // Función para buscar documentos
  const handleSearch = useCallback((query, additionalParams = {}) => {
    setIsSearching(true);
    setSearchQuery(query);
    
    // Reiniciar a la primera página al buscar
    setPagination(prev => ({ ...prev, current: 1 }));
    
    loadDocuments({ 
      search: query,
      page: 1,
      ...additionalParams
    }).finally(() => {
      setIsSearching(false);
    });
  }, [loadDocuments]);
  
  // Función para refrescar los datos
  const refreshData = useCallback(async () => {
    // Evitar recargas si ya está cargando
    if (isLoading) return false;
    
    try {
      setIsLoading(true);
      
      // Cargar datos secuencialmente
      console.log("Refrescando datos...");
      
      // 1. Cargar categorías
      const categories = await fetchCategories();
      setCategories(categories.results || []);
      
      // 2. Cargar documentos con los parámetros actuales
      const docs = await fetchDocuments({
        page: pagination.current || 1,
        search: searchQuery || '',
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        ordering: sortOrder === 'desc' ? `-${sortBy}` : sortBy
      });
      
      setDocuments(docs.results || []);
      
      return true;
    } catch (error) {
      console.error('Error al refrescar datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar los datos',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, pagination.current, searchQuery, selectedCategory, sortBy, sortOrder, toast]);
  
  // Función para manejar la carga de archivos
  const handleUpload = useCallback(async (formData) => {
    try {
      const result = await uploadDocument(formData);
      
      // Actualizar la lista de documentos
      refreshData();
      
      toast({
        title: 'Éxito',
        description: 'Documento subido correctamente',
        variant: 'default'
      });
      
      return result;
    } catch (error) {
      console.error('Error al subir documento:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo subir el documento',
        variant: 'destructive'
      });
      return null;
    }
  }, [refreshData, toast]);
  
  // Función para eliminar un documento
  const handleDelete = useCallback(async (documentId) => {
    try {
      await deleteDocument(documentId);
      
      // Actualizar la lista después de eliminar
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        title: 'Éxito',
        description: 'Documento eliminado correctamente',
        variant: 'default'
      });
      
      return true;
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el documento',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);
  
  // Función para marcar/desmarcar como favorito
  const handleToggleFavorite = useCallback(async (documentId) => {
    try {
      const result = await toggleFavoriteDocument(documentId);
      
      // Actualizar el documento en la lista
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, is_favorite: !doc.is_favorite }
          : doc
      ));
      
      return result;
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de favorito',
        variant: 'warning'
      });
      return null;
    }
  }, [toast]);
  
  // Función para descargar un documento
  const handleDownload = useCallback(async (documentId, fileName) => {
    try {
      const result = await getDocumentDownloadUrl(documentId);
      
      if (result && result.file_url) {
        // Realizar descarga
        const link = document.createElement('a');
        link.href = result.file_url;
        link.setAttribute('download', fileName || 'documento');
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
      } else {
        throw new Error('No se pudo obtener la URL de descarga');
      }
    } catch (error) {
      console.error('Error al descargar documento:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar el documento',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);
  
  // Función para crear una categoría (sigue usando documentService)
  const createCategory = useCallback(async (data) => {
    try {
      const result = await documentService.createCategory(data);
      
      // Actualizar las categorías locales
      loadCategories();
      
      toast({
        title: 'Éxito',
        description: 'Categoría creada correctamente',
        variant: 'default'
      });
      
      return result;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la categoría',
        variant: 'destructive'
      });
      return null;
    }
  }, [loadCategories, toast]);
  
  // Función para crear una etiqueta (sigue usando documentService)
  const createTag = useCallback(async (data) => {
    try {
      const result = await documentService.createTag(data);
      
      // Actualizar las etiquetas locales
      loadTags();
      
      toast({
        title: 'Éxito',
        description: 'Etiqueta creada correctamente',
        variant: 'default'
      });
      
      return result;
    } catch (error) {
      console.error('Error al crear etiqueta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la etiqueta',
        variant: 'destructive'
      });
      return null;
    }
  }, [loadTags, toast]);
  
  // Función para forzar la carga de categorías
  const forceLoadCategories = useCallback(async () => {
    return await loadCategories();
  }, [loadCategories]);
  
  // Función para administrar etiquetas de un documento
  const handleManageTags = useCallback((doc) => {
    setSelectedDocumentForTags(doc);
    setShowTagsModal(true);
  }, []);
  
  // Función para añadir etiqueta a un documento
  const handleAddTag = useCallback(async (docId, tagId) => {
    try {
      await documentService.addTags(docId, [tagId]);
      
      // Actualizar el estado local de documentos
      setDocuments(prev =>
        prev.map(d =>
          d.id === docId
            ? { ...d, tags: [...(d.tags || []), tags.find(t => t.id === tagId)].filter(Boolean) }
            : d
        )
      );
      
      toast({
        title: 'Etiqueta añadida',
        description: 'La etiqueta se ha añadido correctamente',
        variant: 'default'
      });
      
      return true;
    } catch (error) {
      console.error('Error al añadir etiqueta:', error);
      
      toast({
        title: 'Error',
        description: 'No se pudo añadir la etiqueta',
        variant: 'destructive'
      });
      
      return false;
    }
  }, [setDocuments, tags, toast]);
  
  // Función para eliminar etiqueta de un documento
  const handleRemoveTag = useCallback(async (docId, tagId) => {
    try {
      await documentService.removeTag(docId, tagId);
      
      // Actualizar el estado local de documentos
      setDocuments(prev =>
        prev.map(d =>
          d.id === docId
            ? { ...d, tags: (d.tags || []).filter(t => t.id !== tagId) }
            : d
        )
      );
      
      toast({
        title: 'Etiqueta eliminada',
        description: 'La etiqueta se ha eliminado correctamente',
        variant: 'default'
      });
      
      return true;
    } catch (error) {
      console.error('Error al eliminar etiqueta:', error);
      
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la etiqueta',
        variant: 'destructive'
      });
      
      return false;
    }
  }, [setDocuments, toast]);
  
  // Función para crear nueva etiqueta
  const handleCreateTag = useCallback(async (name) => {
    try {
      // Usar la función del hook o el servicio directamente como respaldo
      const newTag = typeof createTag === 'function' 
        ? await createTag(name)
        : await documentService.createTag({ name });
      
      if (newTag) {
        toast({
          title: 'Etiqueta creada',
          description: `Se ha creado la etiqueta "${name}"`,
          variant: 'default'
        });
      }
      
      return newTag;
    } catch (error) {
      console.error('Error al crear etiqueta:', error);
      
      toast({
        title: 'Error',
        description: 'No se pudo crear la etiqueta',
        variant: 'destructive'
      });
      
      return null;
    }
  }, [createTag, toast]);
  
  // Función para normalizar documentos
  const normalizeDocuments = useCallback((docs) => {
    // Validación rigurosa de entrada
    if (!docs) {
      console.warn("normalizeDocuments: docs es null o undefined");
      return [];
    }
    
    if (!Array.isArray(docs)) {
      console.error("normalizeDocuments: docs no es un array:", typeof docs, docs);
      return [];
    }
    
    console.log(`normalizeDocuments: procesando ${docs.length} documentos`);
    
    // Procesar cada documento
    return docs.map(doc => {
      // Verificar que el documento es un objeto válido
      if (!doc || typeof doc !== 'object') {
        console.error("normalizeDocuments: documento inválido:", doc);
        return null;
      }
      
      // Procesamiento mejorado de categoría
      let categoryName = '';
      let categoryObj = null;
      
      if (doc.category_name) {
        categoryName = doc.category_name;
      } else if (doc.category) {
        if (typeof doc.category === 'object' && doc.category !== null) {
          categoryName = doc.category.name || 
                        doc.category.title || 
                        doc.category.label || 
                        doc.category.value || 
                        '';
          
          categoryObj = doc.category;
          
          if (!categoryName && doc.category.id && categories && categories.length > 0) {
            const matchingCategory = categories.find(c => c.id === doc.category.id);
            if (matchingCategory) {
              categoryName = matchingCategory.name;
              categoryObj = matchingCategory;
            }
          }
        } else if (typeof doc.category === 'string') {
          categoryName = doc.category;
        } else if (typeof doc.category === 'number') {
          if (categories && categories.length > 0) {
            const matchingCategory = categories.find(c => c.id === doc.category);
            if (matchingCategory) {
              categoryName = matchingCategory.name;
              categoryObj = matchingCategory;
            } else {
              categoryName = `Categoría ${doc.category}`;
              categoryObj = { id: doc.category, name: categoryName };
            }
          } else {
            categoryName = `Categoría ${doc.category}`;
            categoryObj = { id: doc.category, name: categoryName };
          }
        }
      }
      
      // Determinar el tipo de archivo
      let fileType = 'unknown';
      if (doc.file_type) {
        fileType = doc.file_type.toLowerCase();
      } else if (doc.file_name) {
        const parts = doc.file_name.split('.');
        if (parts.length > 1) {
          fileType = parts.pop().toLowerCase();
        }
      } else if (doc.file) {
        // Intentar extraer la extensión de la URL del archivo
        try {
          const url = new URL(doc.file);
          const pathParts = url.pathname.split('.');
          if (pathParts.length > 1) {
            fileType = pathParts.pop().toLowerCase();
          }
        } catch (e) {
          console.warn("No se pudo extraer el tipo de archivo de la URL:", doc.file);
        }
      }
      
      // Asegurar que las etiquetas sean un array
      const tags = Array.isArray(doc.tags) ? doc.tags : [];
      
      // Construir documento normalizado
      const normalizedDoc = {
        ...doc,
        id: doc.id || Math.random().toString(36).substr(2, 9), // Asegurar que siempre hay un ID
        title: doc.title || 'Documento sin título',
        description: doc.description || '',
        category_name: categoryName || 'Sin categoría',
        category: categoryObj || { id: 0, name: 'Sin categoría' },
        file_type: fileType,
        file_size: doc.file_size || 0,
        tags: tags,
        created_at: doc.created_at || new Date().toISOString(),
        updated_at: doc.updated_at || new Date().toISOString(),
        file_url: doc.file_url || doc.file || ''
      };
      
      return normalizedDoc;
    }).filter(Boolean); // Eliminar cualquier null o undefined
  }, [categories]);
  
  // Cargar grupos y colecciones
  const loadGroups = useCallback(async () => {
    try {
      // Añadir un tiempo límite para evitar bloqueos
      const response = await Promise.race([
        documentService.getGroups(),
        new Promise((_, reject) => setTimeout(() => 
          reject(new Error('Timeout al cargar grupos')), 8000)
        )
      ]);
      
      console.log("Grupos cargados:", response);
      const groups = response.results || [];
      setGroups(groups);
      return groups;
    } catch (error) {
      console.error('Error al cargar grupos:', error);
      
      // Si el error es por timeout o recursos insuficientes, mostrar mensaje más claro
      const errorMessage = error.message.includes('Timeout') || 
                          error.message.includes('ERR_INSUFFICIENT_RESOURCES') ?
        'No se pudieron cargar los grupos (problemas de recursos). Se usarán datos locales.' :
        'No se pudieron cargar los grupos';
      
      toast({
        title: 'Advertencia',
        description: errorMessage,
        variant: 'warning'
      });
      
      // Usar grupos vacíos como fallback
      return [];
    }
  }, [toast]);

  const loadCollections = useCallback(async () => {
    try {
      // Añadir un tiempo límite para evitar bloqueos
      const response = await Promise.race([
        documentService.getCollections(),
        new Promise((_, reject) => setTimeout(() => 
          reject(new Error('Timeout al cargar colecciones')), 8000)
        )
      ]);
      
      console.log("Colecciones cargadas:", response);
      const collections = response.results || [];
      setCollections(collections);
      return collections;
    } catch (error) {
      console.error('Error al cargar colecciones:', error);
      
      // Si el error es por timeout o recursos insuficientes, mostrar mensaje más claro
      const errorMessage = error.message.includes('Timeout') || 
                          error.message.includes('ERR_INSUFFICIENT_RESOURCES') ?
        'No se pudieron cargar las colecciones (problemas de recursos). Se usarán datos locales.' :
        'No se pudieron cargar las colecciones';
      
      toast({
        title: 'Advertencia',
        description: errorMessage,
        variant: 'warning'
      });
      
      return [];
    }
  }, [toast]);
  
  // Quitamos este efecto porque puede causar loops infinitos
  // La recarga se maneja directamente en el botón

  // Carga inicial de recursos - solo se ejecuta una vez al montar el componente
  useEffect(() => {
    const initialize = async () => {
      // Comenzar carga
      setIsLoading(true);
      
      // Mostrar toast de carga
      toast({
        title: 'Cargando',
        description: 'Inicializando gestor documental...',
        duration: 2000
      });
      
      try {
        // Reiniciar paginación a la primera página
        setPagination(prev => ({ ...prev, current: 1 }));
        
        // 1. Cargar categorías (primero, ya que son necesarias para normalizar documentos)
        console.log("Paso 1: Cargando categorías...");
        const categories = await fetchCategories();
        setCategories(categories.results || []);
        
        // 2. Cargar documentos
        console.log("Paso 2: Cargando documentos...");
        const docs = await fetchDocuments({ page: 1 });
        setDocuments(docs.results || []);
        
        // 3. Cargar etiquetas
        console.log("Paso 3: Cargando etiquetas...");
        const tags = await fetchTags();
        setTags(tags.results || []);
      } catch (error) {
        console.error("Error durante la inicialización:", error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar algunos recursos',
          variant: 'warning'
        });
      } finally {
        // Completar la carga
        setIsLoading(false);
        console.log("Inicialización completada");
      }
    };
    
    // Iniciar la carga de datos
    initialize();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manejar subida de archivos
  const onUploadClick = useCallback(async () => {
    setSelectedFile(null);
    
    // Forzar carga de categorías antes de mostrar el modal
    if (typeof forceLoadCategories === 'function') {
      try {
        await forceLoadCategories();
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    } else {
      // Si la función no está disponible, cargar categorías directamente
      try {
        await loadCategories();
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    }
    
    setShowUploadModal(true);
  }, [setSelectedFile, forceLoadCategories, loadCategories]);

  // Subir documento y cerrar modal
  const onUpload = useCallback(async (formData) => {
    console.log("GestorDocumentalPage.onUpload llamado con formData:", {
      hasFile: formData.has('file'),
      fileName: formData.get('file')?.name,
      title: formData.get('title'),
      category: formData.get('category')
    });
    
    try {
      // Mostrar mensaje de carga
      toast({
        title: "Procesando",
        description: "Subiendo documento..."
      });
      
      // Usar la función handleUpload del hook useDocuments
      const result = await handleUpload(formData);
      
      if (result) {
        // Cerrar modal
        setShowUploadModal(false);
        
        // Mostrar mensaje de éxito
        toast({
          title: "Documento subido",
          description: `El documento "${formData.get('title')}" ha sido subido correctamente.`
        });
        
        // Forzar actualización de documentos
        setTimeout(() => {
          refreshData();
        }, 300);
        
        return result;
      } else {
        throw new Error('No se pudo subir el documento');
      }
    } catch (error) {
      console.error("Error al subir documento en onUpload:", error);
      
      // Mostrar mensaje de error detallado
      toast({
        title: "Error en la subida",
        description: error.message || "Ocurrió un error al subir el documento.",
        variant: "destructive"
      });
      
      return null;
    }
  }, [handleUpload, refreshData, toast]);

  // Cerrar modal de subida
  const onCloseUpload = useCallback(() => {
    setShowUploadModal(false);
  }, []);

  // Agregamos solo un comentario para mantener la estructura del código
  // Las implementaciones de estas funciones ya se hicieron arriba

  // Crear un nuevo grupo
  const handleCreateGroup = useCallback(async (groupData) => {
    try {
      const newGroup = await documentService.createGroup(groupData);
      toast({
        title: 'Grupo creado',
        description: `Se ha creado el grupo "${groupData.name}"`,
        variant: 'default'
      });
      
      // Actualizar lista de grupos
      loadGroups();
      
      return newGroup;
    } catch (error) {
      console.error('Error al crear grupo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el grupo',
        variant: 'destructive'
      });
      throw error;
    }
  }, [loadGroups, toast]);

  // Eliminar un grupo
  const handleDeleteGroup = useCallback(async (groupId) => {
    try {
      await documentService.deleteGroup(groupId);
      toast({
        title: 'Grupo eliminado',
        description: 'El grupo ha sido eliminado correctamente',
        variant: 'default'
      });
      
      // Actualizar lista de grupos
      loadGroups();
      
      // Si el grupo eliminado es el seleccionado, deseleccionarlo
      if (selectedGroup && selectedGroup.id === groupId) {
        setSelectedGroup(null);
      }
      
      return true;
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el grupo',
        variant: 'destructive'
      });
      return false;
    }
  }, [loadGroups, selectedGroup, toast]);

  // Seleccionar un grupo
  const handleSelectGroup = useCallback((group) => {
    setSelectedGroup(group);
    setShowGroupsModal(false);
    
    // Filtrar documentos por grupo
    toast({
      title: 'Grupo seleccionado',
      description: `Mostrando documentos del grupo "${group.name}"`,
    });
    
    // Implementar búsqueda filtrada por grupo
    if (typeof handleSearch === 'function') {
      handleSearch('', { group: group.id });
    } else {
      console.error('handleSearch no está definido');
      toast({
        title: 'Error',
        description: 'No se pudo realizar la búsqueda por grupo',
        variant: 'destructive' 
      });
    }
  }, [handleSearch, toast]);
  
  // Crear una nueva colección
  const handleCreateCollection = useCallback(async (collectionData) => {
    try {
      const newCollection = await documentService.createCollection(collectionData);
      toast({
        title: 'Colección creada',
        description: `Se ha creado la colección "${collectionData.name}"`,
        variant: 'default'
      });
      
      // Actualizar lista de colecciones
      loadCollections();
      
      return newCollection;
    } catch (error) {
      console.error('Error al crear colección:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la colección',
        variant: 'destructive'
      });
      throw error;
    }
  }, [loadCollections, toast]);

  // Ver detalles de una colección
  const handleViewCollection = useCallback(async (collectionId) => {
    try {
      const collection = await documentService.getCollection(collectionId);
      setCollectionToView(collection);
      
      // Obtener documentos de la colección
      const collectionDocs = await documentService.getCollectionDocuments(collectionId);
      
      toast({
        title: 'Colección cargada',
        description: `"${collection.name}" - ${collectionDocs.results.length} documentos`,
        variant: 'default'
      });
      
      // Establecer los documentos de la colección
      if (typeof setDocuments === 'function') {
        setDocuments(collectionDocs.results || []);
      } else {
        console.error('setDocuments no está definido');
        toast({
          title: 'Advertencia',
          description: 'No se pudieron mostrar los documentos de la colección',
          variant: 'warning'
        });
      }
      
      // Cerrar modal
      setShowCollectionsModal(false);
      
      return collection;
    } catch (error) {
      console.error('Error al ver colección:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la colección',
        variant: 'destructive'
      });
      return null;
    }
  }, [setDocuments, toast]);

  // Eliminar una colección
  const handleDeleteCollection = useCallback(async (collectionId) => {
    if (!window.confirm('¿Está seguro que desea eliminar esta colección?')) {
      return false;
    }
    
    try {
      await documentService.deleteCollection(collectionId);
      toast({
        title: 'Colección eliminada',
        description: 'La colección ha sido eliminada correctamente',
        variant: 'default'
      });
      
      // Actualizar lista de colecciones
      loadCollections();
      
      // Si estamos viendo esta colección, recargar todos los documentos
      if (collectionToView && collectionToView.id === collectionId) {
        setCollectionToView(null);
        refreshData();
      }
      
      return true;
    } catch (error) {
      console.error('Error al eliminar colección:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la colección',
        variant: 'destructive'
      });
      return false;
    }
  }, [collectionToView, loadCollections, refreshData, toast]);

  // Exportar una colección
  const handleExportCollection = useCallback(async (collectionId) => {
    try {
      toast({
        title: 'Exportando colección',
        description: 'Preparando archivos para exportación...',
        variant: 'default'
      });
      
      const exportData = await documentService.exportCollection(collectionId);
      
      if (exportData && exportData.download_url) {
        // Abrir la URL de descarga en una nueva pestaña
        window.open(exportData.download_url, '_blank');
        
        toast({
          title: 'Exportación completada',
          description: 'La colección ha sido exportada correctamente',
          variant: 'default'
        });
      } else {
        throw new Error('No se pudo generar la URL de descarga');
      }
      
      return true;
    } catch (error) {
      console.error('Error al exportar colección:', error);
      toast({
        title: 'Error',
        description: 'No se pudo exportar la colección',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  // Añadir documentos a una colección
  const handleAddToCollection = useCallback(async (collectionId, documentIds) => {
    try {
      const result = await documentService.addDocumentsToCollection(collectionId, documentIds);
      
      toast({
        title: 'Documentos añadidos',
        description: `Se han añadido ${documentIds.length} documentos a la colección`,
        variant: 'default'
      });
      
      // Actualizar lista de colecciones
      loadCollections();
      
      // Desactivar modo selección
      setSelectionMode(false);
      setSelectedDocuments([]);
      
      return result;
    } catch (error) {
      console.error('Error al añadir documentos a colección:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron añadir los documentos a la colección',
        variant: 'destructive'
      });
      return false;
    }
  }, [loadCollections, toast]);

  // Visualizar documento
  const onView = useCallback(async (document) => {
    // Verificar si el documento ya tiene URL de archivo
    if (document.file_url) {
      window.open(document.file_url, '_blank');
      return;
    }
    
    // Mostrar mensaje de carga
    toast({
      title: "Cargando",
      description: "Preparando el documento para visualización..."
    });
    
    try {
      // Intentar primero la descarga autenticada
      const token = localStorage.getItem('auth-token');
      const download = await documentService.downloadDocument(document.id);
      
      if (download && download.file_url) {
        // Abrir la URL en nueva pestaña
        window.open(download.file_url, '_blank');
        
        // Actualizar documento en la lista con la URL
        setDocuments(prevDocs => prevDocs.map(d => 
          d.id === document.id ? {...d, file_url: download.file_url} : d
        ));
        
        return;
      }
      
      // Si falla el método autenticado, intentar con el endpoint público
      const publicUrl = `${API_BASE_URL}/docmanager/documents/${document.id}/public-download/`;
      const response = await fetch(publicUrl);
      
      if (!response.ok) {
        throw new Error(`Error al obtener URL pública: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.file_url) {
        // Construir URL absoluta si es necesario
        const fileUrl = data.file_url.startsWith('http') 
          ? data.file_url 
          : `${window.location.origin}${data.file_url}`;
          
        window.open(fileUrl, '_blank');
        
        // Actualizar documento en la lista
        setDocuments(prevDocs => prevDocs.map(d => 
          d.id === document.id ? {...d, file_url: fileUrl} : d
        ));
      } else {
        throw new Error('URL de documento no disponible');
      }
    } catch (error) {
      console.error("Error al obtener URL del documento:", error);
      toast({
        title: 'Error',
        description: 'No se pudo visualizar el documento',
        variant: 'destructive'
      });
    }
  }, [documentService, setDocuments, toast]);

  // Manejar compartir documentos seleccionados
  const handleShareSelected = useCallback(async () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: 'Error',
        description: 'No hay documentos seleccionados para compartir',
        variant: 'destructive'
      });
      return;
    }
    
    // Mostrar mensaje de carga
    toast({
      title: 'Preparando enlaces',
      description: 'Generando enlaces para compartir...',
      variant: 'default'
    });
    
    try {
      // Obtener URLs de documentos seleccionados
      const promises = selectedDocuments.map(docId => {
        const doc = documents.find(d => d.id === docId);
        return documentService.getPublicLink(docId)
          .then(data => ({
            id: docId,
            title: doc.title,
            url: data.file_url || data.public_url
          }))
          .catch(error => {
            console.error(`Error obteniendo URL para documento ${docId}:`, error);
            return null;
          });
      });
      
      // Cuando todas las URL estén listas
      const results = await Promise.all(promises);
      const validResults = results.filter(r => r !== null);
      
      if (validResults.length === 0) {
        throw new Error('No se pudo obtener ninguna URL para compartir');
      }
      
      // Preparar contenido para compartir
      const title = validResults.length === 1 
        ? `Documento: ${validResults[0].title}` 
        : `${validResults.length} documentos compartidos`;
      
      const text = validResults.length === 1 
        ? `Compartiendo el documento: ${validResults[0].title}`
        : `Compartiendo documentos:\n${validResults.map(d => `- ${d.title}`).join('\n')}`;
      
      // Usar Web Share API si está disponible y es un solo documento
      if (navigator.share && validResults.length === 1) {
        navigator.share({
          title,
          text,
          url: validResults[0].url
        })
        .catch(error => console.log('Error compartiendo:', error));
      } else {
        // Para múltiples documentos, copiamos al portapapeles
        const urlsList = validResults.map(d => `${d.title}: ${d.url}`).join('\n');
        
        // Copiar al portapapeles
        await navigator.clipboard.writeText(urlsList);
        
        // Notificar al usuario
        toast({
          title: 'Enlaces copiados',
          description: `Se han copiado ${validResults.length} enlaces al portapapeles`,
          variant: 'default'
        });
      }
      
      // Desactivar modo selección después de compartir
      setSelectionMode(false);
      setSelectedDocuments([]);
    } catch (error) {
      console.error('Error compartiendo documentos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron compartir los documentos seleccionados',
        variant: 'destructive'
      });
    }
  }, [documents, documentService, selectedDocuments, toast]);

  // Manejar toggle de selección (para selección múltiple)
  const handleToggleSelection = useCallback((docId, isSelected) => {
    setSelectedDocuments(prev => {
      // Si recibimos un array, reemplazamos la selección completamente
      if (Array.isArray(docId)) {
        return isSelected ? docId : [];
      }
      
      // Si es un documento individual
      if (isSelected) {
        // Añadir a la selección si no está ya seleccionado
        return prev.includes(docId) ? prev : [...prev, docId];
      } else {
        // Eliminar de la selección
        return prev.filter(id => id !== docId);
      }
    });
  }, []);

  // Manejar toggle de modo selección
  const handleToggleSelectionMode = useCallback((mode) => {
    setSelectionMode(mode);
    if (!mode) {
      // Limpiar selecciones al salir del modo
      setSelectedDocuments([]);
    }
  }, []);

  // Controlar renderizado basado en el modo diagnóstico
  if (diagnosticMode) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="bg-indigo-700 text-white p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold">Gestor Documental - Modo Diagnóstico</h1>
          </div>
        </div>
        
        <main className="container mx-auto px-6 py-8 flex-1">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Herramienta de Diagnóstico</h2>
            <button 
              onClick={() => {
                // Mostrar un mensaje antes de cambiar
                toast({
                  title: 'Cambiando modo',
                  description: 'Activando modo normal y cargando documentos',
                  duration: 2000
                });
                
                // Primero actualizar el estado
                setDiagnosticMode(false);
                
                // Esperar un momento antes de intentar cargar datos
                setTimeout(() => {
                  if (typeof refreshData === 'function') {
                    refreshData();
                  }
                }, 500);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Cambiar a Modo Normal
            </button>
          </div>
          
          {/* Componente de diagnóstico */}
          <SimpleDiagnosticComponent />
        </main>
      </div>
    );
  }

  // Componente Normal
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Cabecera */}
      <Header onUploadClick={onUploadClick} />

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            loading={isLoading || isSearching}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSearch={handleSearch}
          />

          <div className="flex items-center gap-4">
            {/* Panel de Filtros */}
            <FilterPanel 
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
            
            {/* Selector de vista */}
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            
            {/* Botón para gestionar grupos */}
            <button
              onClick={() => setShowGroupsModal(true)}
              className="flex items-center ml-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
              aria-label="Gestionar grupos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Grupos
            </button>
            
            {/* Botón para gestionar colecciones */}
            <button
              onClick={() => setShowCollectionsModal(true)}
              className="flex items-center ml-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
              aria-label="Gestionar colecciones"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              Colecciones
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="container mx-auto px-6 py-8 flex-1">
        
        {isLoading ? (
          <LoadingSpinner />
        ) : documents && documents.length === 0 ? (
          <EmptyState 
            onUploadClick={onUploadClick} 
            refreshData={refreshData} 
          />
        ) : (
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => refreshData()}
          >
            <Suspense fallback={<LoadingSpinner />}>
              {viewMode === 'grid' ? (
                <DocumentGrid 
                  documents={normalizeDocumentsData(documents, categories)} 
                  onToggleFavorite={handleToggleFavorite}
                  onDownload={handleDownload}
                  onView={onView}
                  onDelete={handleDelete}
                  onManageTags={handleManageTags}
                />
              ) : (
                <DocumentList 
                  documents={documents ? normalizeDocumentsData(documents, categories) : []} 
                  onToggleFavorite={handleToggleFavorite}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  onView={onView}
                  onManageTags={handleManageTags}
                  selectionMode={selectionMode}
                  selectedDocuments={selectedDocuments}
                  onToggleSelection={handleToggleSelection}
                  onToggleSelectionMode={handleToggleSelectionMode}
                  onShareSelected={handleShareSelected}
                />
              )}
            </Suspense>
          </ErrorBoundary>
        )}
        
        {/* Paginación */}
        {documents && documents.length > 0 && pagination && pagination.total_pages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-2" aria-label="Paginación">
              <button 
                onClick={() => typeof goToPage === 'function' ? goToPage(pagination.current - 1) : null}
                disabled={!pagination.previous || typeof goToPage !== 'function'}
                className={`px-3 py-1 border rounded ${
                  pagination.previous && typeof goToPage === 'function'
                    ? 'border-gray-300 hover:bg-gray-100' 
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label="Página anterior"
              >
                Anterior
              </button>
              
              <span className="text-sm text-gray-600">
                Página {pagination.current} de {pagination.total_pages}
              </span>
              
              <button 
                onClick={() => typeof goToPage === 'function' ? goToPage(pagination.current + 1) : null}
                disabled={!pagination.next || typeof goToPage !== 'function'}
                className={`px-3 py-1 border rounded ${
                  pagination.next && typeof goToPage === 'function'
                    ? 'border-gray-300 hover:bg-gray-100' 
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label="Página siguiente"
              >
                Siguiente
              </button>
            </nav>
          </div>
        )}
      </main>

      {/* Modales */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<ComponentFallback />}>
          {/* Modal de carga de archivos */}
          {showUploadModal && (
            <SimpleUploadModal 
              show={showUploadModal}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              onClose={onCloseUpload}
              onUpload={onUpload}
              getAvailableGroups={loadGroups}
            />
          )}

          {/* Modal de gestión de etiquetas */}
          {showTagsModal && (
            <TagsModal
              show={showTagsModal}
              onClose={() => setShowTagsModal(false)}
              document={selectedDocumentForTags}
              availableTags={tags}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              onCreateTag={handleCreateTag}
            />
          )}

          {/* Modal de gestión de grupos */}
          {showGroupsModal && (
            <GroupsModal
              show={showGroupsModal}
              onClose={() => setShowGroupsModal(false)}
              groups={groups}
              selectedGroup={selectedGroup}
              onCreateGroup={handleCreateGroup}
              onSelectGroup={handleSelectGroup}
              onDeleteGroup={handleDeleteGroup}
            />
          )}

          {/* Modal de gestión de colecciones */}
          {showCollectionsModal && (
            <CollectionsModal
              show={showCollectionsModal}
              onClose={() => setShowCollectionsModal(false)}
              collections={collections}
              onCreateCollection={handleCreateCollection}
              onViewCollection={handleViewCollection}
              onDeleteCollection={handleDeleteCollection}
              onExportCollection={handleExportCollection}
              selectedDocuments={selectedDocuments}
              onAddToCollection={handleAddToCollection}
            />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default GestorDocumentalPage;