import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Tag as TagIcon } from 'lucide-react';

/**
 * Modal para gestionar etiquetas de un documento
 * @param {Object} props
 * @param {boolean} props.show - Controla la visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Object} props.document - Documento al que agregar etiquetas
 * @param {Array} props.availableTags - Lista de etiquetas disponibles
 * @param {Function} props.onAddTag - Función para agregar etiqueta al documento
 * @param {Function} props.onRemoveTag - Función para eliminar etiqueta del documento
 * @param {Function} props.onCreateTag - Función para crear nueva etiqueta
 */
const TagsModal = ({
  show,
  onClose,
  document,
  availableTags = [],
  onAddTag,
  onRemoveTag,
  onCreateTag
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [documentTags, setDocumentTags] = useState([]);
  
  // Cuando cambia el documento, actualizar las etiquetas
  useEffect(() => {
    if (document && document.tags) {
      setDocumentTags(document.tags);
    } else {
      setDocumentTags([]);
    }
  }, [document]);
  
  // Filtrar etiquetas disponibles según término de búsqueda
  const filteredTags = searchTerm
    ? availableTags.filter(tag => 
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !documentTags.some(docTag => docTag.id === tag.id))
    : availableTags.filter(tag => !documentTags.some(docTag => docTag.id === tag.id));

  // Manejar creación de nueva etiqueta
  const handleCreateTag = async () => {
    if (!newTagName.trim() || typeof onCreateTag !== 'function') return;
    
    try {
      const createdTag = await onCreateTag(newTagName.trim());
      if (createdTag) {
        // Añadir la etiqueta al documento
        handleAddTag(createdTag);
        setNewTagName(''); // Limpiar el campo
      }
    } catch (error) {
      console.error('Error al crear etiqueta:', error);
    }
  };
  
  // Manejar adición de etiqueta existente
  const handleAddTag = async (tag) => {
    if (typeof onAddTag !== 'function') {
      console.error('onAddTag no está definido o no es una función');
      return;
    }
    
    try {
      await onAddTag(document.id, tag.id);
      // Actualizar localmente
      setDocumentTags(prev => [...prev, tag]);
    } catch (error) {
      console.error('Error al añadir etiqueta:', error);
    }
  };
  
  // Manejar eliminación de etiqueta
  const handleRemoveTag = async (tagId) => {
    if (typeof onRemoveTag !== 'function') {
      console.error('onRemoveTag no está definido o no es una función');
      return;
    }
    
    try {
      await onRemoveTag(document.id, tagId);
      // Actualizar localmente
      setDocumentTags(prev => prev.filter(tag => tag.id !== tagId));
    } catch (error) {
      console.error('Error al eliminar etiqueta:', error);
    }
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <TagIcon className="mr-2" size={18} />
            Administrar Etiquetas
          </h2>
          <button 
            className="text-gray-400 hover:text-gray-600" 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Cuerpo */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {/* Nombre del documento */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-900">Documento:</h3>
            <p className="text-gray-700">{document?.title}</p>
          </div>
          
          {/* Etiquetas actuales */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Etiquetas actuales:</h3>
            {documentTags.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Este documento no tiene etiquetas</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {documentTags.map(tag => (
                  <span 
                    key={tag.id} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                  >
                    <TagIcon size={14} className="mr-1" />
                    {tag.name}
                    <button 
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
                      onClick={() => handleRemoveTag(tag.id)}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Añadir nueva etiqueta */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Crear nueva etiqueta:</h3>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Nombre de la etiqueta"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
              />
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          
          {/* Buscar etiquetas existentes */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Añadir etiqueta existente:</h3>
            <div className="relative mb-4">
              <input
                type="text"
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Buscar etiquetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            {/* Lista de etiquetas disponibles */}
            <div className="max-h-60 overflow-y-auto">
              {filteredTags.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No hay etiquetas disponibles{searchTerm ? ` para "${searchTerm}"` : ''}</p>
              ) : (
                <div className="space-y-2">
                  {filteredTags.map(tag => (
                    <div 
                      key={tag.id} 
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md cursor-pointer"
                      onClick={() => handleAddTag(tag)}
                    >
                      <span className="flex items-center">
                        <TagIcon size={16} className="mr-2 text-gray-600" />
                        {tag.name}
                      </span>
                      <Plus size={16} className="text-gray-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Pie */}
        <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagsModal;