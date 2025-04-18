import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select'; // Para etiquetas normales si no se quieren crear
import { Upload, X, FileText, Tag, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Componente modal para subir documentos
 * @param {Object} props
 * @param {boolean} props.show - Mostrar/ocultar modal
 * @param {Object} props.selectedFile - Archivo seleccionado
 * @param {Function} props.setSelectedFile - Función para establecer archivo seleccionado
 * @param {Function} props.onClose - Función para cerrar modal
 * @param {Function} props.onUpload - Función para subir archivo (modificada para recibir datos procesados)
 * @param {Array} props.categories - Lista de categorías disponibles
 * @param {Array} props.availableTags - Lista de etiquetas disponibles
 * @param {Function} props.createCategory - Función para crear nueva categoría
 * @param {Function} props.createTag - Función para crear nueva etiqueta
 */
const UploadModal = ({
  show,
  selectedFile,
  setSelectedFile,
  onClose,
  onUpload, // Espera recibir el FormData final
  categories = [],
  availableTags = [],
  createCategory, // Prop para crear categoría
  createTag,      // Prop para crear etiqueta
}) => {
  const { toast } = useToast();
  const [documentData, setDocumentData] = useState({
    title: '',
    description: '',
  });
  const [selectedCategoryOption, setSelectedCategoryOption] = useState(null);
  const [selectedTagOptions, setSelectedTagOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryInputValue, setCategoryInputValue] = useState('');
  const [tagInputValue, setTagInputValue] = useState('');

  console.log("Categories received:", categories);
  console.log("Tags received:", availableTags);

  // Limpiar estado cuando se cierra el modal
  useEffect(() => {
    if (!show) {
        setDocumentData({ title: '', description: '' });
        setSelectedCategoryOption(null);
        setSelectedTagOptions([]);
        setCategoryInputValue('');
        setTagInputValue('');
        setSelectedFile(null); // Limpiar archivo también al cerrar
        setIsLoading(false);
    }
  }, [show, setSelectedFile]);

  // Actualizar título cuando se selecciona un archivo
  useEffect(() => {
    if (selectedFile) {
      setDocumentData(prev => ({
        ...prev,
        title: selectedFile.name.split('.')[0]
      }));
    }
  }, [selectedFile]);

  // Si no se muestra el modal, no renderizar
  if (!show) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDocumentData({
      ...documentData,
      [name]: value
    });
  };

  // Preparar opciones para los selects
  const categoryOptions = Array.isArray(categories) 
    ? categories.map(cat => ({ value: cat.id, label: cat.name }))
    : [];
    
  const tagOptions = Array.isArray(availableTags)
    ? availableTags.map(tag => ({ value: tag.id, label: tag.name }))
    : [];

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
    // Validaciones previas
    if (!selectedFile) {
      toast({ title: "Archivo requerido", description: "Por favor, selecciona un archivo para subir.", variant: "destructive" });
      return;
    }
    
    if (!documentData.title || documentData.title.trim() === '') {
      toast({ title: "Título requerido", description: "Por favor, proporciona un título para el documento.", variant: "destructive" });
      return;
    }
    
    if (!selectedCategoryOption) {
      toast({ title: "Categoría requerida", description: "Por favor, selecciona o crea una categoría.", variant: "destructive" });
      return;
    }

    // Inicio del proceso de carga
    setIsLoading(true);

    try {
      // 1. Procesar la categoría
      let categoryId = null;
      
      // Verificar si es una categoría nueva o existente
      if (selectedCategoryOption.__isNew__) {
        // Es una categoría nueva que debemos crear
        toast({ 
          title: "Creando categoría", 
          description: `Creando nueva categoría: ${selectedCategoryOption.label}` 
        });
        
        try {
          const newCategory = await createCategory({ name: selectedCategoryOption.label });
          if (newCategory && newCategory.id) {
            categoryId = newCategory.id;
            toast({ 
              title: "Categoría creada", 
              description: `Categoría "${selectedCategoryOption.label}" creada correctamente.` 
            });
          } else {
            throw new Error("No se pudo crear la categoría. La respuesta del servidor no incluyó un ID.");
          }
        } catch (error) {
          console.error("Error al crear categoría:", error);
          toast({ 
            title: "Error al crear categoría", 
            description: error.message || "No se pudo crear la categoría. Por favor, inténtalo de nuevo.",
            variant: "destructive" 
          });
          setIsLoading(false);
          return;
        }
      } else {
        // Es una categoría existente
        categoryId = selectedCategoryOption.value;
      }
      
      if (!categoryId) {
        toast({ 
          title: "Error con categoría", 
          description: "No se pudo obtener o crear la categoría seleccionada.",
          variant: "destructive" 
        });
        setIsLoading(false);
        return;
      }

      // 2. Procesar las etiquetas
      const tagIds = [];
      const newTagsToCreate = selectedTagOptions.filter(tag => tag.__isNew__);
      
      // Primero procesamos las etiquetas existentes
      selectedTagOptions
        .filter(tag => !tag.__isNew__)
        .forEach(tag => tagIds.push(tag.value));
      
      // Si hay etiquetas nuevas para crear
      if (newTagsToCreate.length > 0) {
        toast({ 
          title: "Creando etiquetas", 
          description: `Creando ${newTagsToCreate.length} nueva${newTagsToCreate.length > 1 ? 's' : ''} etiqueta${newTagsToCreate.length > 1 ? 's' : ''}...` 
        });
        
        // Luego intentamos crear las nuevas etiquetas
        for (const tagOption of newTagsToCreate) {
          try {
            const newTag = await createTag({ name: tagOption.label });
            if (newTag && newTag.id) {
              tagIds.push(newTag.id);
              console.log(`Etiqueta "${tagOption.label}" creada con ID: ${newTag.id}`);
            } else {
              console.warn(`No se pudo crear la etiqueta: ${tagOption.label} - Respuesta inválida`);
            }
          } catch (error) {
            console.warn(`Error al crear la etiqueta ${tagOption.label}:`, error);
            // Mostramos notificación pero continuamos con las demás
            toast({ 
              title: "Error en etiqueta", 
              description: `No se pudo crear la etiqueta "${tagOption.label}"`,
              variant: "destructive" 
            });
          }
        }
      }

      // 3. Preparar el FormData con todos los datos recopilados
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', documentData.title.trim());
      
      if (documentData.description && documentData.description.trim() !== '') {
        formData.append('description', documentData.description.trim());
      }
      
      formData.append('category', categoryId);
      
      // Añadir todas las etiquetas al formData
      if (tagIds.length > 0) {
        tagIds.forEach(tagId => {
          console.log("Añadiendo tag ID:", tagId);
          formData.append('tags', tagId);
        });
      }

      // Log para verificar que el formData está completo
      console.log("FormData preparado:", {
        file: selectedFile.name,
        title: documentData.title.trim(),
        description: documentData.description?.trim() || "(sin descripción)",
        category: categoryId,
        tags: tagIds
      });

      // 4. Mostrar mensaje de subida
      toast({ 
        title: "Subiendo documento", 
        description: `Subiendo "${documentData.title.trim()}"... Por favor, espera.` 
      });

      // 5. Llamar a la función onUpload proporcionada por GestorDocumentalPage
      try {
        const result = await onUpload(formData);

        // 6. Manejar el resultado
        if (result) {
          toast({ 
            title: "Documento subido", 
            description: `"${documentData.title.trim()}" se ha subido correctamente.` 
          });
          // El hook useDocuments ya hace refresh de datos
          // Se cierra el modal desde GestorDocumentalPage cuando result es true
        }
      } catch (uploadError) {
        console.error("Error durante la subida del documento:", uploadError);
        toast({ 
          title: "Error al subir", 
          description: uploadError.message || "Ocurrió un error al subir el documento. Por favor, inténtalo de nuevo.",
          variant: "destructive" 
        });
        // No cerramos el modal para permitir correcciones
      }

    } catch (error) {
      // Error general no controlado
      console.error("Error en handleSubmit de UploadModal:", error);
      toast({ 
        title: "Error inesperado", 
        description: "Ocurrió un error al procesar la subida. Por favor, inténtalo de nuevo.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      {/* <div className="fixed inset-0 bg-black opacity-50 transition" onClick={onClose}></div> */}
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full z-10 transform transition-all p-6 m-4">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Subir un nuevo documento</h3>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
                disabled={isLoading}
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
              <CreatableSelect
                id="category"
                isClearable
                isDisabled={isLoading}
                isLoading={isLoading}
                onChange={setSelectedCategoryOption}
                options={categoryOptions}
                value={selectedCategoryOption}
                inputValue={categoryInputValue}
                onInputChange={(value) => setCategoryInputValue(value)}
                placeholder="Selecciona o crea una categoría..."
                formatCreateLabel={(inputValue) => `Crear categoría "${inputValue}"`}
                noOptionsMessage={() => "Sin categorías. Escribe para crear una nueva."}
                styles={{
                    control: (base) => ({ ...base, borderColor: '#D1D5DB' }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
                classNamePrefix="react-select"
              />
              {categoryOptions.length === 0 && (
                <div className="mt-1 text-sm flex items-center text-amber-600">
                  <AlertCircle size={14} className="mr-1"/> 
                  No hay categorías existentes. Escribe el nombre de una nueva.
                  <button 
                    type="button"
                    className="ml-2 text-blue-600 underline text-xs"
                    onClick={async () => {
                      console.log("Debug - Categories props:", categories);
                      console.log("Debug - CategoryOptions:", categoryOptions);
                      
                      if (typeof createCategory === 'function') {
                        // Probar creación manual de categoría
                        try {
                          const newCategory = await createCategory({ name: "Categoría de prueba" });
                          console.log("Categoría creada:", newCategory);
                          toast({ 
                            title: "Categoría creada", 
                            description: `Se creó la categoría de prueba con ID: ${newCategory?.id || 'desconocido'}` 
                          });
                        } catch (error) {
                          console.error("Error al crear categoría:", error);
                          toast({ 
                            title: "Error", 
                            description: `No se pudo crear la categoría: ${error.message}`,
                            variant: "destructive" 
                          });
                        }
                      }
                    }}
                  >
                    Crear categoría de prueba
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Etiquetas
              </label>
              <CreatableSelect
                id="tags"
                isMulti
                isClearable
                isDisabled={isLoading}
                isLoading={isLoading}
                onChange={setSelectedTagOptions}
                options={tagOptions}
                value={selectedTagOptions}
                inputValue={tagInputValue}
                onInputChange={(value) => setTagInputValue(value)}
                placeholder="Selecciona o crea etiquetas..."
                formatCreateLabel={(inputValue) => `Crear etiqueta "${inputValue}"`}
                noOptionsMessage={() => "Sin etiquetas. Escribe para crear una nueva."}
                styles={{
                  control: (base) => ({ ...base, borderColor: '#D1D5DB' }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#EBF5FF', // Azul claro para destacar las seleccionadas
                    borderRadius: '4px',
                  }),
                }}
                classNamePrefix="react-select"
              />
              {tagOptions.length === 0 && (
                <div className="mt-1 text-sm flex items-center text-amber-600">
                  <AlertCircle size={14} className="mr-1"/> 
                  No hay etiquetas existentes. Escribe para crear nuevas.
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
            disabled={!selectedFile || isLoading}
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

export default UploadModal;