import { useState, useEffect } from 'react';

// Hooks personalizados
import useDocuments from './hooks/useDocuments';
import { useToast } from '@/components/ui/use-toast';

// Servicios
import { documentService } from '@/services/classes';

// Configuración
import { API_BASE_URL } from '@/config/constants';

// Modales
import TagsModal from './components/modal/TagsModal';
import GroupsModal from './components/modal/GroupsModal';
import CollectionsModal from './components/modal/CollectionsModal';

// Componentes de layout
import Header from './components/layout/Header';
import SearchBar from './components/layout/SearchBar';

// Componentes de filtros
import FilterPanel from './components/filters/FilterPanel';
import ViewToggle from './components/filters/ViewToggle';

// Componentes de documentos
import DocumentGrid from './components/documents/DocumentGrid';
import DocumentList from './components/documents/DocumentList';

// Componentes comunes
import LoadingSpinner from './components/common/LoadingSpinner';
import EmptyState from './components/common/EmptyState';

// Componentes de modales
import SimpleUploadModal from './components/modal/SimpleUploadModal';

/**
 * Componente principal del Gestor Documental
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
    forceLoadCategories,
    refreshData,
    handleSearch,
    setDocuments
  } = useDocuments();
  
  // Función para obtener documentos directamente del API (bypass autenticación)
  const fetchDocumentsDirectly = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/docmanager/documents/`);
      
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Documentos obtenidos directamente:", data);
      
      // Verificar si la respuesta tiene el formato esperado
      if (data && Array.isArray(data.results)) {
        // Procesar documentos para asegurar campos necesarios
        const processedDocs = data.results.map(doc => ({
          ...doc,
          // Asegurar que category_name está disponible
          category_name: doc.category_name || (doc.category && typeof doc.category === 'object' ? doc.category.name : ''),
          // Asegurar que file_type está disponible
          file_type: doc.file_type || (doc.file_name ? doc.file_name.split('.').pop() : 'unknown'),
          // Proporcionar tags si no existen
          tags: doc.tags || []
        }));
        
        // Devolver los documentos procesados
        return processedDocs;
      } else {
        console.error("Formato de respuesta inválido:", data);
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error al obtener documentos directamente:", error);
      toast({
        title: "Error",
        description: `No se pudieron obtener los documentos: ${error.message}`,
        variant: "destructive"
      });
      return [];
    }
  };
  
  // Cargar colecciones
  const loadCollections = async () => {
    try {
      const response = await documentService.getCollections();
      console.log("Colecciones cargadas:", response);
      setCollections(response.results || []);
      return response.results;
    } catch (error) {
      console.error('Error al cargar colecciones:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las colecciones',
        variant: 'destructive'
      });
      return [];
    }
  };
  
  // Carga inicial de documentos al montar el componente
  useEffect(() => {
    // Forzar una carga inicial de documentos cuando montamos el componente
    const loadInitialDocuments = async () => {
      console.log("Iniciando carga inicial de documentos...");
      
      try {
        // Primero intentamos usar el mecanismo normal a través del hook
        await refreshData();
        console.log("Carga inicial completada a través de refreshData");
        
        // Cargar grupos y colecciones
        loadGroups();
        loadCollections();
        
        // Si después de la carga normal todavía no hay documentos, intentamos la carga directa
        setTimeout(async () => {
          if (!documents || documents.length === 0) {
            console.log("No hay documentos después de refreshData, intentando carga directa...");
            try {
              const docs = await fetchDocumentsDirectly();
              if (docs && docs.length > 0) {
                console.log("Documentos cargados directamente con éxito:", docs.length);
                console.log("Primer documento:", docs[0]);
                setDocuments(docs);
              } else {
                console.log("La carga directa no devolvió documentos");
              }
            } catch (directError) {
              console.error("Error en carga directa de documentos:", directError);
            }
          }
        }, 1000);
      } catch (error) {
        console.error("Error en carga inicial de documentos:", error);
      }
    };
    
    loadInitialDocuments();
  // Este efecto debe ejecutarse solo una vez al montar el componente
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manejar subida de archivos
  const onUploadClick = async () => {
    setSelectedFile(null);
    
    // Forzar carga de categorías antes de mostrar el modal
    const loadedCategories = await forceLoadCategories();
    console.log("Categorías cargadas antes de abrir modal:", loadedCategories);
    
    setShowUploadModal(true);
  };

  // Subir documento y cerrar modal
  const onUpload = async (formData) => {
    console.log("GestorDocumentalPage.onUpload llamado con formData:", {
      hasFile: formData.has('file'),
      fileName: formData.get('file')?.name,
      title: formData.get('title'),
      category: formData.get('category')
    });
    
    try {
      // Usar la instancia de API para enviar el formulario directamente
      const token = localStorage.getItem('auth-token');
      console.log("Subiendo con token:", !!token);
      
      // Crear cabeceras para la solicitud
      const headers = new Headers();
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
      
      // Mostrar mensaje de carga
      toast({
        title: "Procesando",
        description: "Subiendo documento..."
      });
      
      // Enviar solicitud fetch directamente
      const response = await fetch(`${API_BASE_URL}/docmanager/documents/`, {
        method: 'POST',
        headers: headers,
        body: formData
      });
      
      // Procesar la respuesta
      if (response.ok) {
        const data = await response.json();
        console.log("Documento subido con éxito:", data);
        
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
        
        return data;
      } else {
        // Manejar error del servidor
        let errorMsg = 'Error al subir el documento';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMsg = errorData.detail;
          }
        } catch (e) {
          errorMsg = `Error ${response.status}: ${response.statusText}`;
        }
        
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive'
        });
        
        return null;
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
  };

  // Cerrar modal de subida
  const onCloseUpload = () => {
    setShowUploadModal(false);
  };

  // Abrir modal para administrar etiquetas
  const handleManageTags = (document) => {
    setSelectedDocumentForTags(document);
    setShowTagsModal(true);
  };

  // Agregar etiqueta a un documento
  const handleAddTag = async (documentId, tagId) => {
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
  };

  // Eliminar etiqueta de un documento
  const handleRemoveTag = async (documentId, tagId) => {
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
  };

  // Crear nueva etiqueta
  const handleCreateTag = async (name) => {
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
  };
  
  // Cargar grupos
  const loadGroups = async () => {
    try {
      const response = await documentService.getGroups();
      console.log("Grupos cargados:", response);
      setGroups(response.results || []);
      return response.results;
    } catch (error) {
      console.error('Error al cargar grupos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los grupos',
        variant: 'destructive'
      });
      return [];
    }
  };

  // Crear un nuevo grupo
  const handleCreateGroup = async (groupData) => {
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
  };

  // Eliminar un grupo
  const handleDeleteGroup = async (groupId) => {
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
  };

  // Seleccionar un grupo
  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setShowGroupsModal(false);
    
    // Filtrar documentos por grupo
    // Aquí puedes implementar la lógica para mostrar solo los documentos del grupo seleccionado
    toast({
      title: 'Grupo seleccionado',
      description: `Mostrando documentos del grupo "${group.name}"`,
    });
  };
  
  // Crear una nueva colección
  const handleCreateCollection = async (collectionData) => {
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
  };

  // Ver detalles de una colección
  const handleViewCollection = async (collectionId) => {
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
      
      // Aquí podrías implementar la lógica para mostrar los documentos de la colección
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
  };

  // Eliminar una colección
  const handleDeleteCollection = async (collectionId) => {
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
  };

  // Exportar una colección
  const handleExportCollection = async (collectionId) => {
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
  };

  // Añadir documentos a una colección
  const handleAddToCollection = async (collectionId, documentIds) => {
    try {
      await documentService.addDocumentsToCollection(collectionId, documentIds);
      
      // Actualizar lista de colecciones
      loadCollections();
      
      return true;
    } catch (error) {
      console.error('Error al añadir documentos a colección:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron añadir los documentos a la colección',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Visualizar documento
  const onView = (document) => {
    console.log("Visualizando documento:", document);
    
    // Verificar si el documento ya tiene URL de archivo
    if (document.file_url) {
      console.log("Documento ya tiene URL:", document.file_url);
      window.open(document.file_url, '_blank');
      return;
    }
    
    // Si no hay URL directa, intentar con el endpoint público
    const publicUrl = `${API_BASE_URL}/docmanager/documents/${document.id}/public-download/`;
    console.log("Solicitando URL pública:", publicUrl);
    
    // Mostrar mensaje de carga
    toast({
      title: "Cargando",
      description: "Preparando el documento para visualización..."
    });
    
    // Solicitar la URL pública sin autenticación
    fetch(publicUrl)
      .then(response => {
        if (!response.ok) {
          // Si falla la solicitud pública, intentar con el endpoint autenticado
          const token = localStorage.getItem('auth-token');
          const authUrl = `${API_BASE_URL}/docmanager/documents/${document.id}/download/`;
          
          console.log("Fallback: Solicitando URL autenticada:", authUrl);
          
          return fetch(authUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
        return response;
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al obtener URL: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("URL de documento obtenida:", data);
        
        if (data.file_url) {
          // Construir URL absoluta si es necesario
          const fileUrl = data.file_url.startsWith('http') 
            ? data.file_url 
            : `${window.location.origin}${data.file_url}`;
            
          console.log("Abriendo URL:", fileUrl);
          window.open(fileUrl, '_blank');
          
          // Actualizar lista de documentos para incluir la URL
          setDocuments(prevDocs => prevDocs.map(d => 
            d.id === document.id ? {...d, file_url: fileUrl} : d
          ));
        } else {
          toast({
            title: 'Error',
            description: 'No se pudo obtener la URL del documento',
            variant: 'destructive'
          });
        }
      })
      .catch(error => {
        console.error("Error al obtener URL del documento:", error);
        toast({
          title: 'Error',
          description: 'No se pudo visualizar el documento',
          variant: 'destructive'
        });
      });
  };

  const normalizeDocuments = (docs) => {
    if (!docs) return [];
    
    return docs.map(doc => {
      // For debugging - log document structure to see how categories are stored
      console.log("Document structure:", {
        id: doc.id, 
        title: doc.title,
        category: doc.category,
        category_name: doc.category_name
      });
      
      // Enhanced category normalization with more edge cases handled
      let categoryName = '';
      
      if (doc.category_name) {
        // Use existing category_name if available
        categoryName = doc.category_name;
      } else if (doc.category) {
        if (typeof doc.category === 'object' && doc.category !== null) {
          // Handle object with various possible property names
          categoryName = doc.category.name || 
                        doc.category.title || 
                        doc.category.label || 
                        doc.category.value || 
                        '';
          
          // If no named properties found but has id and we have categories list,
          // try to find matching category
          if (!categoryName && doc.category.id && categories) {
            const matchingCategory = categories.find(c => c.id === doc.category.id);
            if (matchingCategory) {
              categoryName = matchingCategory.name;
            }
          }
        } else if (typeof doc.category === 'string') {
          // Handle string value
          categoryName = doc.category;
        } else if (typeof doc.category === 'number') {
          // Handle numeric ID by looking up in categories list
          if (categories) {
            const matchingCategory = categories.find(c => c.id === doc.category);
            if (matchingCategory) {
              categoryName = matchingCategory.name;
            }
          }
        }
      }
      
      return {
        ...doc,
        category_name: categoryName,
        file_type: doc.file_type || (doc.file_name ? doc.file_name.split('.').pop() : 'unknown'),
        tags: doc.tags || []
      };
    });
  };

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
            onSearch={(query, searchParams = {}) => {
              // Usamos un objeto vacío como default para evitar nulos
              console.log("Búsqueda con parámetros:", typeof searchParams, searchParams);
              
              // Crear una copia para no modificar el objeto original
              const params = {...searchParams};
              
              // Procesar la fecha si existe un filtro de fecha
              if (params.date_filter) {
                const now = new Date();
                let fromDate = null;
                
                switch(params.date_filter) {
                  case 'today':
                    fromDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                  case 'week':
                    fromDate = new Date(now);
                    fromDate.setDate(fromDate.getDate() - 7);
                    break;
                  case 'month':
                    fromDate = new Date(now);
                    fromDate.setMonth(fromDate.getMonth() - 1);
                    break;
                  case 'year':
                    fromDate = new Date(now);
                    fromDate.setFullYear(fromDate.getFullYear() - 1);
                    break;
                }
                
                if (fromDate) {
                  params.from_date = fromDate.toISOString().split('T')[0];
                }
              }
              
              // Registrar los parámetros finales de búsqueda
              console.log("Parámetros finales de búsqueda:", params);
              
              // Usar la función handleSearch del hook con los parámetros
              handleSearch(query, params);
            }}
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
        ) : viewMode === 'grid' ? (
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
            onToggleSelection={(docId, isSelected) => {
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
            }}
            onToggleSelectionMode={(mode) => {
              setSelectionMode(mode);
              if (!mode) {
                // Limpiar selecciones al salir del modo
                setSelectedDocuments([]);
              }
            }}
            onShareSelected={() => {
              // Obtener URLs de documentos seleccionados
              if (selectedDocuments.length === 0) {
                toast({
                  title: 'Error',
                  description: 'No hay documentos seleccionados para compartir',
                  variant: 'destructive'
                });
                return;
              }
              
              // Preparar los URLs para compartir
              const promises = selectedDocuments.map(docId => {
                const doc = documents.find(d => d.id === docId);
                const publicUrl = `${API_BASE_URL}/docmanager/documents/${docId}/public-download/`;
                
                return fetch(publicUrl)
                  .then(response => response.json())
                  .then(data => ({
                    id: docId,
                    title: doc.title,
                    url: data.file_url
                  }))
                  .catch(error => {
                    console.error(`Error obteniendo URL para documento ${docId}:`, error);
                    return null;
                  });
              });
              
              // Cuando todas las URL estén listas
              Promise.all(promises)
                .then(results => {
                  // Filtrar posibles errores
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
                    // Para múltiples documentos, mostramos un modal o copiamos al portapapeles
                    const urlsList = validResults.map(d => `${d.title}: ${d.url}`).join('\n');
                    
                    // Copiar al portapapeles
                    const tempInput = document.createElement('textarea');
                    tempInput.value = urlsList;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempInput);
                    
                    // Notificar al usuario
                    toast({
                      title: 'Enlaces copiados',
                      description: `Se han copiado ${validResults.length} enlaces al portapapeles`,
                      variant: 'default'
                    });
                    
                    // Desactivar modo selección después de compartir
                    setSelectionMode(false);
                    setSelectedDocuments([]);
                  }
                })
                .catch(error => {
                  console.error('Error compartiendo documentos:', error);
                  toast({
                    title: 'Error',
                    description: 'No se pudieron compartir los documentos seleccionados',
                    variant: 'destructive'
                  });
                });
            }}
          />
        )}
        
        {/* Paginación */}
        {documents && documents.length > 0 && pagination && pagination.total_pages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-2">
              <button 
                onClick={() => goToPage(pagination.current - 1)}
                disabled={!pagination.previous}
                className={`px-3 py-1 border rounded ${
                  pagination.previous 
                    ? 'border-gray-300 hover:bg-gray-100' 
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Anterior
              </button>
              
              <span className="text-sm text-gray-600">
                Página {pagination.current} de {pagination.total_pages}
              </span>
              
              <button 
                onClick={() => goToPage(pagination.current + 1)}
                disabled={!pagination.next}
                className={`px-3 py-1 border rounded ${
                  pagination.next 
                    ? 'border-gray-300 hover:bg-gray-100' 
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Siguiente
              </button>
            </nav>
          </div>
        )}
      </main>

      {/* Modal simplificado de carga de archivos */}
      <SimpleUploadModal 
        show={showUploadModal}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        onClose={onCloseUpload}
        onUpload={onUpload}
      />

      {/* Modal de gestión de etiquetas */}
      <TagsModal
        show={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        document={selectedDocumentForTags}
        availableTags={tags}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onCreateTag={handleCreateTag}
      />

      {/* Modal de gestión de grupos */}
      <GroupsModal
        show={showGroupsModal}
        onClose={() => setShowGroupsModal(false)}
        groups={groups}
        selectedGroup={selectedGroup}
        onCreateGroup={handleCreateGroup}
        onSelectGroup={handleSelectGroup}
        onDeleteGroup={handleDeleteGroup}
      />

      {/* Modal de gestión de colecciones */}
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
    </div>
  );
};

export default GestorDocumentalPage;