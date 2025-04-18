import React, { useState, useEffect } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/config/constants';

/**
 * Componente modal simple para subir documentos
 * No depende de categorías o etiquetas cargadas desde el backend
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
    categoryName: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Hardcoded categories based on database values
  const staticCategories = [
    { id: 1, name: 'Proformas' },
    { id: 2, name: 'cdcd dc d' }
  ];

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
        categoryName: ''
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
      const selectedCategory = staticCategories.find(cat => cat.id.toString() === value);
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
      
      // Verificar el FormData
      console.log("FormData preparado:", {
        file: selectedFile.name,
        title: documentData.title.trim(),
        description: documentData.description?.trim() || "(sin descripción)",
        category: documentData.category
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
                disabled={isLoading}
              >
                <option value="">Seleccione una categoría</option>
                {staticCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              {staticCategories.length === 0 && (
                <div className="mt-1 text-sm flex items-center text-amber-600">
                  <AlertCircle size={14} className="mr-1"/> 
                  No hay categorías disponibles.
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
            onClick={async () => {
              // Implementación directa y simplificada que evita usar otras funciones
              if (!selectedFile || !documentData.title || !documentData.category) {
                toast({ 
                  title: "Datos incompletos", 
                  description: "Completa todos los campos requeridos", 
                  variant: "destructive" 
                });
                return;
              }
              
              setIsLoading(true);
              
              try {
                // Crear el FormData nosotros mismos
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('title', documentData.title);
                
                if (documentData.description && documentData.description.trim() !== '') {
                  formData.append('description', documentData.description.trim());
                }
                
                formData.append('category', documentData.category);
                
                // Mostrar información en la consola para depuración
                console.log("Subiendo archivo:", selectedFile.name);
                console.log("Título:", documentData.title);
                console.log("Categoría:", documentData.category);
                
                toast({ 
                  title: "Procesando", 
                  description: "Subiendo documento..." 
                });

                // Usar XMLHttpRequest en lugar de fetch para una mejor compatibilidad
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${API_BASE_URL}/docmanager/documents/`);
                
                // Añadir token de autenticación
                const token = localStorage.getItem('auth-token');
                if (token) {
                  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                }
                
                // Escuchar cambios de estado
                xhr.onreadystatechange = function() {
                  if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                      // Éxito
                      toast({
                        title: 'Éxito',
                        description: 'Documento subido correctamente'
                      });
                      
                      // Intentar obtener el resultado para poder llamar a onUpload
                      try {
                        const responseData = JSON.parse(xhr.responseText);
                        console.log("Documento subido con éxito:", responseData);
                        
                        // Cerrar modal inmediatamente para mejor experiencia de usuario
                        setIsLoading(false);
                        onClose();
                        
                        // Esperar un momento y luego llamar a onUpload para actualizar la lista
                        setTimeout(() => {
                          // Si tenemos una función onUpload, llamarla con el resultado
                          if (typeof onUpload === 'function') {
                            console.log("Llamando a onUpload después de subida exitosa");
                            // Crear un nuevo FormData que incluya los datos del documento creado
                            const resultFormData = new FormData();
                            resultFormData.append('file', formData.get('file'));
                            resultFormData.append('title', formData.get('title'));
                            resultFormData.append('category', formData.get('category'));
                            resultFormData.append('document_id', responseData.id || '');
                            onUpload(resultFormData);
                          }
                        }, 300);
                      } catch (e) {
                        console.warn("No se pudo parsear la respuesta:", e);
                        // Cerrar modal incluso si hay error de parseo
                        setTimeout(() => {
                          setIsLoading(false);
                          onClose();
                        }, 2000);
                      }
                    } else {
                      // Error
                      let errorMsg = 'Error al subir el documento';
                      try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.detail) {
                          errorMsg = response.detail;
                        }
                      } catch (e) {
                        errorMsg = `Error ${xhr.status}: ${xhr.statusText}`;
                      }
                      
                      toast({
                        title: 'Error',
                        description: errorMsg,
                        variant: 'destructive'
                      });
                      
                      setIsLoading(false);
                    }
                  }
                };
                
                // Manejar errores de red
                xhr.onerror = function() {
                  toast({
                    title: 'Error de conexión',
                    description: 'No se pudo conectar con el servidor',
                    variant: 'destructive'
                  });
                  setIsLoading(false);
                };
                
                // Enviar la solicitud
                xhr.send(formData);
              } catch (error) {
                console.error("Error al subir:", error);
                toast({
                  title: 'Error',
                  description: error.message || 'Ocurrió un error al procesar la solicitud',
                  variant: 'destructive'
                });
                setIsLoading(false);
              }
            }}
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