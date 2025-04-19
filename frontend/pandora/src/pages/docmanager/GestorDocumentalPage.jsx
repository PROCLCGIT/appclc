import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Hooks personalizados
import useDocuments from './hooks/useDocuments';
import { useToast } from '@/components/ui/use-toast';

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
  
  // Obtener datos y funciones del hook de documentos
  const {
    documents = [],
    categories = [],
    tags = [],
    isLoading = false,
    isSearching = false,
    searchQuery = '',
    setSearchQuery = () => console.warn('setSearchQuery no disponible'),
    selectedCategory = 'all',
    setSelectedCategory = () => console.warn('setSelectedCategory no disponible'),
    sortBy = 'updated_at',
    setSortBy = () => console.warn('setSortBy no disponible'),
    sortOrder = 'desc',
    setSortOrder = () => console.warn('setSortOrder no disponible'),
    selectedFile = null,
    setSelectedFile = () => console.warn('setSelectedFile no disponible'),
    pagination = { current: 1, total_pages: 1 },
    goToPage = () => console.warn('goToPage no disponible'),
    handleUpload = () => console.warn('handleUpload no disponible'),
    handleDownload = () => console.warn('handleDownload no disponible'),
    handleDelete = () => console.warn('handleDelete no disponible'),
    handleToggleFavorite = () => console.warn('handleToggleFavorite no disponible'),
    createCategory = () => console.warn('createCategory no disponible'),
    createTag = () => console.warn('createTag no disponible'),
    forceLoadCategories = () => console.warn('forceLoadCategories no disponible'),
    refreshData = () => console.warn('refreshData no disponible'),
    handleSearch = () => console.warn('handleSearch no disponible'),
    setDocuments = () => console.warn('setDocuments no disponible')
  } = useDocuments() || {};
  
  // Función para normalizar documentos
  const normalizeDocuments = useCallback((docs) => {
    if (!docs) return [];
    
    return docs.map(doc => {
      // Procesamiento mejorado de categoría
      let categoryName = '';
      
      if (doc.category_name) {
        categoryName = doc.category_name;
      } else if (doc.category) {
        if (typeof doc.category === 'object' && doc.category !== null) {
          categoryName = doc.category.name || 
                        doc.category.title || 
                        doc.category.label || 
                        doc.category.value || 
                        '';
          
          if (!categoryName && doc.category.id && categories) {
            const matchingCategory = categories.find(c => c.id === doc.category.id);
            if (matchingCategory) {
              categoryName = matchingCategory.name;
            }
          }
        } else if (typeof doc.category === 'string') {
          categoryName = doc.category;
        } else if (typeof doc.category === 'number') {
          const matchingCategory = categories.find(c => c.id === doc.category);
          if (matchingCategory) {
            categoryName = matchingCategory.name;
          }
        }
      }
      
      return {
        ...doc,
        category_name: categoryName || 'Sin categoría',
        file_type: doc.file_type || (doc.file_name ? doc.file_name.split('.').pop() : 'unknown'),
        tags: doc.tags || []
      };
    });
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
  
  // Carga inicial de recursos
  useEffect(() => {
    const initialize = async () => {
      try {
        // Mostrar toast de carga inicial
        toast({
          title: 'Cargando',
          description: 'Inicializando gestor documental...',
          duration: 2000
        });
        
        // Definimos primero las funciones asíncronas por si acaso refreshData no está definido
        const fetchData = async () => {
          if (typeof refreshData === 'function') {
            return refreshData();
          } else {
            console.error('refreshData no está definido');
            return Promise.resolve();
          }
        };
        
        const fetchGroups = async () => {
          if (typeof loadGroups === 'function') {
            return loadGroups();
          } else {
            console.error('loadGroups no está definido');
            return Promise.resolve([]);
          }
        };
        
        const fetchCollections = async () => {
          if (typeof loadCollections === 'function') {
            return loadCollections();
          } else {
            console.error('loadCollections no está definido');
            return Promise.resolve([]);
          }
        };
        
        // Cargar datos en paralelo para mejorar rendimiento
        await Promise.all([
          fetchData(),
          fetchGroups(),
          fetchCollections()
        ]);
        
      } catch (error) {
        console.error('Error en la inicialización:', error);
        toast({
          title: 'Error',
          description: 'No se pudo inicializar correctamente. Algunos recursos pueden no estar disponibles.',
          variant: 'destructive'
        });
      }
    };
    
    initialize();
  }, [refreshData, loadGroups, loadCollections, toast]);

  // Manejar subida de archivos
  const onUploadClick = useCallback(async () => {
    setSelectedFile(null);
    
    // Forzar carga de categorías antes de mostrar el modal
    await forceLoadCategories();
    
    setShowUploadModal(true);
  }, [setSelectedFile, forceLoadCategories]);

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

  // Abrir modal para administrar etiquetas
  const handleManageTags = useCallback((document) => {
    setSelectedDocumentForTags(document);
    setShowTagsModal(true);
  }, []);

  // Agregar etiqueta a un documento
  const handleAddTag = useCallback(async (documentId, tagId) => {
    try {
      await documentService.addTags(documentId, [tagId]);
      toast({
        title: 'Etiqueta añadida',
        description: 'La etiqueta se ha añadido correctamente',
        variant: 'default'
      });
      // Actualizar lista de documentos para reflejar los cambios
      refreshData();
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
  }, [refreshData, toast]);

  // Eliminar etiqueta de un documento
  const handleRemoveTag = useCallback(async (documentId, tagId) => {
    try {
      await documentService.removeTag(documentId, tagId);
      toast({
        title: 'Etiqueta eliminada',
        description: 'La etiqueta se ha eliminado correctamente',
        variant: 'default'
      });
      // Actualizar lista de documentos para reflejar los cambios
      refreshData();
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
  }, [refreshData, toast]);

  // Crear nueva etiqueta
  const handleCreateTag = useCallback(async (name) => {
    try {
      const newTag = await createTag(name);
      toast({
        title: 'Etiqueta creada',
        description: `Se ha creado la etiqueta "${name}"`,
        variant: 'default'
      });
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
                  documents={normalizeDocuments(documents)} 
                  onToggleFavorite={handleToggleFavorite}
                  onDownload={handleDownload}
                  onView={onView}
                  onDelete={handleDelete}
                  onManageTags={handleManageTags}
                />
              ) : (
                <DocumentList 
                  documents={normalizeDocuments(documents)} 
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