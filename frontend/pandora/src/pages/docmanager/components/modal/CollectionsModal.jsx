import React, { useState, useEffect } from 'react';
import { Archive, Check, FolderPlus, Grid, List, Package, PlusCircle, X, Download, Printer, Share2, FileArchive } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

/**
 * Modal para gestionar colecciones de documentos
 * @param {Object} props
 * @param {boolean} props.show - Controla la visibilidad del modal
 * @param {function} props.onClose - Función para cerrar el modal
 * @param {Array} props.collections - Lista de colecciones disponibles
 * @param {function} props.onCreateCollection - Función para crear una nueva colección
 * @param {function} props.onViewCollection - Función para ver detalles de una colección
 * @param {function} props.onDeleteCollection - Función para eliminar una colección
 * @param {function} props.onExportCollection - Función para exportar una colección
 * @param {Array} props.selectedDocuments - Documentos seleccionados para añadir a una colección
 * @param {function} props.onAddToCollection - Función para añadir documentos a una colección
 * @returns {JSX.Element}
 */
const CollectionsModal = ({
  show,
  onClose,
  collections = [],
  onCreateCollection,
  onViewCollection,
  onDeleteCollection,
  onExportCollection,
  selectedDocuments = [],
  onAddToCollection
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Filtrar colecciones por nombre
  const filteredCollections = collections.filter(collection => 
    collection.name.toLowerCase().includes(filter.toLowerCase())
  );

  // Crear una nueva colección
  const handleCreateCollection = async (e) => {
    e.preventDefault();
    
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la colección es obligatorio",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const collection = await onCreateCollection({
        name: newName.trim(),
        description: newDescription.trim(),
        color_code: color
      });
      
      // Si se proporcionaron documentos seleccionados, añadirlos a la colección
      if (selectedDocuments.length > 0 && collection) {
        await onAddToCollection(collection.id, selectedDocuments);
        toast({
          title: "Documentos añadidos",
          description: `${selectedDocuments.length} documentos añadidos a la colección "${collection.name}"`,
          variant: "default"
        });
      }
      
      // Limpiar formulario
      setNewName('');
      setNewDescription('');
      setColor('#8B5CF6');
      setIsCreating(false);
      
      toast({
        title: "Colección creada",
        description: `La colección "${collection.name}" se ha creado correctamente`,
        variant: "default"
      });
      
    } catch (error) {
      console.error("Error al crear colección:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la colección",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Añadir documentos a una colección existente
  const handleAddToExistingCollection = async (collectionId) => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "Sin documentos",
        description: "No hay documentos seleccionados para añadir",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await onAddToCollection(collectionId, selectedDocuments);
      
      // Obtener nombre de la colección
      const collection = collections.find(c => c.id === collectionId);
      const collectionName = collection ? collection.name : "la colección";
      
      toast({
        title: "Documentos añadidos",
        description: `${selectedDocuments.length} documentos añadidos a ${collectionName}`,
        variant: "default"
      });
      
      // Cerrar el modal
      onClose();
    } catch (error) {
      console.error("Error al añadir documentos:", error);
      toast({
        title: "Error",
        description: "No se pudieron añadir los documentos a la colección",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Si el modal no está visible, no renderizar nada
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedDocuments.length > 0 
                ? `Añadir ${selectedDocuments.length} documento${selectedDocuments.length > 1 ? 's' : ''} a colección` 
                : "Colecciones de documentos"}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Vista de cuadrícula"
              >
                <Grid size={16} />
              </button>
              <button
                className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('list')}
                title="Vista de lista"
              >
                <List size={16} />
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Barra de búsqueda y acciones */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Buscar colecciones..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                isCreating 
                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300" 
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              {isCreating ? (
                <>
                  <X size={16} className="mr-1.5" />
                  Cancelar
                </>
              ) : (
                <>
                  <PlusCircle size={16} className="mr-1.5" />
                  Nueva colección
                </>
              )}
            </button>
          </div>

          {/* Formulario para crear nueva colección */}
          {isCreating && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Crear nueva colección</h3>
              <form onSubmit={handleCreateCollection}>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label htmlFor="collectionName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre*
                    </label>
                    <input
                      type="text"
                      id="collectionName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Nombre de la colección"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="collectionDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      id="collectionDescription"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Descripción opcional"
                      rows="2"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="collectionColor" className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        id="collectionColor"
                        className="h-8 w-12 border border-gray-300 rounded"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                      />
                      <span className="ml-2 text-sm text-gray-500">{color}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-2"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    disabled={isLoading || !newName.trim()}
                  >
                    {isLoading ? "Guardando..." : "Guardar colección"}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Lista de colecciones */}
          {filteredCollections.length === 0 ? (
            <div className="text-center py-12">
              <FileArchive className="h-16 w-16 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No hay colecciones disponibles</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter ? 
                  `No se encontraron colecciones con "${filter}"` : 
                  "Crea una nueva colección para organizar tus documentos"
                }
              </p>
              {!isCreating && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear colección
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Instrucción si hay documentos seleccionados */}
              {selectedDocuments.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-800 text-sm">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium">Selecciona una colección para añadir los documentos o crea una nueva.</p>
                      <p className="mt-1">Tienes {selectedDocuments.length} documento{selectedDocuments.length > 1 ? 's' : ''} seleccionado{selectedDocuments.length > 1 ? 's' : ''} para añadir.</p>
                    </div>
                  </div>
                </div>
              )}
            
              {/* Grid o lista de colecciones */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-2'}>
                {filteredCollections.map(collection => (
                  viewMode === 'grid' ? (
                    <div 
                      key={collection.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div 
                        className="h-2.5"
                        style={{ backgroundColor: collection.color_code || '#8B5CF6' }}
                      ></div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-base font-medium text-gray-900 line-clamp-1">{collection.name}</h3>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 text-xs rounded-full">
                            {collection.document_count || 0} docs
                          </span>
                        </div>
                        {collection.description && (
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{collection.description}</p>
                        )}
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => onViewCollection(collection.id)}
                              className="p-1.5 text-gray-500 hover:text-purple-600 transition-colors"
                              title="Ver colección"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onExportCollection(collection.id)}
                              className="p-1.5 text-gray-500 hover:text-green-600 transition-colors"
                              title="Exportar colección"
                            >
                              <Download size={20} />
                            </button>
                            <button
                              onClick={() => onDeleteCollection(collection.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                              title="Eliminar colección"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          {selectedDocuments.length > 0 && (
                            <button
                              onClick={() => handleAddToExistingCollection(collection.id)}
                              className="flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200 transition-colors"
                            >
                              <PlusCircle size={14} className="mr-1" />
                              Añadir aquí
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      key={collection.id}
                      className="flex items-center justify-between border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-4 h-10 rounded mr-3"
                          style={{ backgroundColor: collection.color_code || '#8B5CF6' }}
                        ></div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{collection.name}</h3>
                          {collection.description && (
                            <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">{collection.description}</p>
                          )}
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Archive className="h-3.5 w-3.5 mr-1" />
                            <span>{collection.document_count || 0} documentos</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => onViewCollection(collection.id)}
                            className="p-1.5 text-gray-500 hover:text-purple-600 transition-colors"
                            title="Ver colección"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onExportCollection(collection.id)}
                            className="p-1.5 text-gray-500 hover:text-green-600 transition-colors"
                            title="Exportar colección"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteCollection(collection.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                            title="Eliminar colección"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        {selectedDocuments.length > 0 && (
                          <button
                            onClick={() => handleAddToExistingCollection(collection.id)}
                            className="flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200 transition-colors"
                          >
                            <Check size={14} className="mr-1" />
                            Añadir
                          </button>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionsModal;