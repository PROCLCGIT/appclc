import React, { useState, useEffect } from 'react';
import { Upload, X, FileText, AlertCircle, Tag, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/config/constants';
import { documentService } from '@/services/classes';

/**
 * Componente modal simple para subir documentos
 * Ahora incluye selección de grupos y etiquetas
 */
const SimpleUploadModal = ({
  show,
  selectedFile,
  setSelectedFile,
  onClose,
  onUpload,
}) => {
  const { toast } = useToast();
  const [documentData, setDocumentData] = useState({
    title: '',
    description: '',
    category: '',
    categoryName: '',
    group: '',
    selectedTags: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // Cargar categorías, grupos y etiquetas desde el backend
  useEffect(() => {
    if (show) {
      const loadResources = async () => {
        setLoadingResources(true);
        
        try {
          // Cargar categorías - usar try/catch independiente para cada recurso
          console.log("Iniciando carga de categorías...");
          try {
            const categoriesResponse = await documentService.getCategories();
            console.log("Categorías cargadas:", categoriesResponse);
            setCategories(categoriesResponse.results || []);
          } catch (catError) {
            console.error("Error específico al cargar categorías:", catError);
            // Usar valores por defecto si falla
            setCategories([
              { id: 1, name: 'General' },
              { id: 2, name: 'Documentos' }
            ]);
          }
          
          // Cargar grupos
          console.log("Iniciando carga de grupos...");
          try {
            const groupsResponse = await documentService.getGroups();
            console.log("Grupos cargados:", groupsResponse);
            setGroups(groupsResponse.results || []);
          } catch (groupError) {
            console.error("Error específico al cargar grupos:", groupError);
            // No haremos nada - se mostrará como vacío
          }
          
          // Cargar etiquetas
          console.log("Iniciando carga de etiquetas...");
          try {
            const tagsResponse = await documentService.getTags();
            console.log("Etiquetas cargadas:", tagsResponse);
            setTags(tagsResponse.results || []);
          } catch (tagError) {
            console.error("Error específico al cargar etiquetas:", tagError);
            // Usar valores por defecto si falla
            setTags([
              { id: 1, name: "Importante", color_code: "#FF0000" },
              { id: 2, name: "Urgente", color_code: "#FFA500" },
              { id: 3, name: "Completado", color_code: "#008000" }
            ]);
          }
          
        } catch (error) {
          console.error("Error general al cargar recursos:", error);
          toast({
            title: "Advertencia",
            description: "Algunos recursos pueden no estar disponibles",
            variant: "warning"
          });
        } finally {
          setLoadingResources(false);
        }
      };
      
      loadResources();
    }
  }, [show, toast]);

  // Actualizar título cuando se selecciona un archivo
  useEffect(() => {
    if (selectedFile) {
      setDocumentData(prev => ({
        ...prev,
        title: selectedFile.name.split('.')[0]
      }));
    }
  }, [selectedFile]);

  // Limpiar estado cuando se cierra el modal
  useEffect(() => {
    if (!show) {
      setDocumentData({
        title: '',
        description: '',
        category: '',
        categoryName: '',
        group: '',
        selectedTags: []
      });
      setSelectedFile(null);
      setIsLoading(false);
    }
  }, [show, setSelectedFile]);

  // Si no se muestra el modal, no renderizar
  if (!show) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      // Cuando cambia el select de categoría, también actualizamos el nombre
      const selectedCategory = categories.find(cat => cat.id.toString() === value);
      setDocumentData({
        ...documentData,
        category: value,
        categoryName: selectedCategory ? selectedCategory.name : ''
      });
    } else {
      setDocumentData({
        ...documentData,
        [name]: value
      });
    }
  };
  
  // Manejar cambios en etiquetas seleccionadas
  const handleTagToggle = (tagId) => {
    setDocumentData(prevData => {
      // Comprobar si la etiqueta ya está seleccionada
      if (prevData.selectedTags.includes(tagId)) {
        // Si ya está, la quitamos
        return {
          ...prevData,
          selectedTags: prevData.selectedTags.filter(id => id !== tagId)
        };
      } else {
        // Si no está, la agregamos
        return {
          ...prevData,
          selectedTags: [...prevData.selectedTags, tagId]
        };
      }
    });
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    console.log("Iniciando handleSubmit en SimpleUploadModal");
    console.log("Estado actual:", { selectedFile, documentData, isLoading });
    
    // Validaciones
    if (!selectedFile) {
      console.log("Error: No hay archivo seleccionado");
      toast({ title: "Archivo requerido", description: "Por favor, selecciona un archivo para subir.", variant: "destructive" });
      return;
    }
    
    if (!documentData.title || documentData.title.trim() === '') {
      console.log("Error: Título vacío");
      toast({ title: "Título requerido", description: "Por favor, proporciona un título para el documento.", variant: "destructive" });
      return;
    }
    
    if (!documentData.category) {
      console.log("Error: Categoría no seleccionada");
      toast({ title: "Categoría requerida", description: "Por favor, selecciona una categoría.", variant: "destructive" });
      return;
    }

    console.log("Todas las validaciones pasaron, procediendo con la subida");
    setIsLoading(true);

    try {
      // Preparar el FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', documentData.title.trim());
      
      if (documentData.description && documentData.description.trim() !== '') {
        formData.append('description', documentData.description.trim());
      }
      
      formData.append('category', documentData.category);
      
      // Añadir grupo si está seleccionado
      if (documentData.group) {
        formData.append('group', documentData.group);
      }
      
      // Añadir etiquetas si hay seleccionadas
      if (documentData.selectedTags.length > 0) {
        // Para cada etiqueta seleccionada, agregamos un campo 'tags' al FormData
        documentData.selectedTags.forEach(tagId => {
          formData.append('tags', tagId);
        });
      }
      
      // Verificar el FormData
      console.log("FormData preparado:", {
        file: selectedFile.name,
        title: documentData.title.trim(),
        description: documentData.description?.trim() || "(sin descripción)",
        category: documentData.category,
        group: documentData.group || "Sin grupo",
        tags: documentData.selectedTags
      });
      
      toast({ 
        title: "Subiendo documento", 
        description: `Subiendo "${documentData.title.trim()}"... Por favor, espera.` 
      });

      // Verificar que onUpload es una función
      console.log("onUpload es una función:", typeof onUpload === 'function');
      
      // Llamar a la función onUpload proporcionada por el componente padre
      console.log("Llamando a onUpload...");
      const result = await onUpload(formData);
      console.log("Resultado de onUpload:", result);

      // Manejar el resultado
      if (result) {
        console.log("Subida exitosa");
        toast({ 
          title: "Documento subido", 
          description: `"${documentData.title.trim()}" se ha subido correctamente.` 
        });
      } else {
        console.log("Subida completada pero sin resultado positivo");
      }
    } catch (error) {
      console.error("Error al subir documento:", error);
      toast({ 
        title: "Error al subir", 
        description: error.message || "Ocurrió un error al subir el documento. Por favor, inténtalo de nuevo.",
        variant: "destructive" 
      });
    } finally {
      console.log("Finalizando subida, estableciendo isLoading=false");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full z-10 transform transition-all p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Subir un nuevo documento</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isLoading}
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Selector de archivo */}
        {!selectedFile ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 cursor-pointer transition-colors"
            onClick={() => document.getElementById('file-upload').click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="mx-auto text-gray-400 mb-4" size={36} />
            <p className="text-gray-500">Haz clic para seleccionar un archivo o arrastra y suelta aquí</p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="border rounded-lg p-4 flex justify-between items-center mb-4 bg-gray-50">
            <div className="flex items-center overflow-hidden mr-2">
              <div className="p-3 bg-indigo-100 rounded-lg mr-3 flex-shrink-0">
                <FileText className="text-indigo-600" size={24} />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-medium text-gray-800 truncate" title={selectedFile.name}>{selectedFile.name}</h4>
                <p className="text-gray-500 text-sm">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
              onClick={() => setSelectedFile(null)}
              type="button"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Formulario de metadatos */}
        {selectedFile && (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={documentData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={documentData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={documentData.category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isLoading || loadingResources}
              >
                <option value="">Seleccione una categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <div className="mt-1 text-sm flex items-center text-amber-600">
                  <AlertCircle size={14} className="mr-1"/> 
                  {loadingResources ? "Cargando categorías..." : "No hay categorías disponibles."}
                </div>
              )}
            </div>
            
            {/* Selector de grupo */}
            <div>
              <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
                Grupo <span className="text-gray-400">(opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users size={16} className="text-gray-400" />
                </div>
                <select
                  id="group"
                  name="group"
                  value={documentData.group}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isLoading || loadingResources}
                >
                  <option value="">Sin grupo</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
              {loadingResources && groups.length === 0 && (
                <div className="mt-1 text-sm flex items-center text-blue-600">
                  <span className="animate-pulse">Cargando grupos...</span>
                </div>
              )}
            </div>
            
            {/* Selector de etiquetas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas <span className="text-gray-400">(opcional)</span>
              </label>
              {loadingResources ? (
                <div className="flex items-center text-sm text-blue-600">
                  <span className="animate-pulse">Cargando etiquetas...</span>
                </div>
              ) : tags.length === 0 ? (
                <div className="text-sm text-gray-500 border border-gray-200 rounded-md p-3 bg-gray-50">
                  No hay etiquetas disponibles
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 border border-gray-200 rounded-md p-3 bg-gray-50">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                        documentData.selectedTags.includes(tag.id)
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: documentData.selectedTags.includes(tag.id) ? tag.color_code + '33' : '',
                        borderColor: documentData.selectedTags.includes(tag.id) ? tag.color_code : '',
                        color: documentData.selectedTags.includes(tag.id) ? tag.color_code : ''
                      }}
                      disabled={isLoading}
                    >
                      <Tag size={12} className="mr-1" />
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subiendo...
              </>
            ) : (
              'Subir Documento'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleUploadModal;