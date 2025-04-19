import React, { useState, useEffect } from 'react';
import { Upload, X, FileText, AlertCircle, Tag, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/config/constants';
import { documentService } from '@/services/classes';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Esquema de validación usando Zod
const uploadFormSchema = z.object({
  title: z.string()
    .min(1, 'El título es obligatorio')
    .max(255, 'El título no puede tener más de 255 caracteres'),
  description: z.string().optional(),
  category: z.string().min(1, 'Debe seleccionar una categoría'),
  group: z.string().optional(),
  selectedTags: z.array(z.number()).optional().default([])
});

/**
 * Componente modal mejorado para subir documentos
 * Implementa React Hook Form con validación Zod
 */
const SimpleUploadModal = ({
  show,
  selectedFile,
  setSelectedFile,
  onClose,
  onUpload,
  getAvailableGroups,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  
  // Estados para creación de nuevas entidades
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [addingGroup, setAddingGroup] = useState(false);
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#4F46E5');
  const [addingTag, setAddingTag] = useState(false);

  // Inicializar React Hook Form
  const { 
    control, 
    handleSubmit, 
    reset, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      group: '',
      selectedTags: []
    }
  });

  // Observar valores del formulario para acceso más fácil
  const watchSelectedTags = watch('selectedTags');
  const watchCategory = watch('category');

  // Cargar categorías, grupos y etiquetas desde el backend
  useEffect(() => {
    if (show) {
      const loadResources = async () => {
        setLoadingResources(true);
        
        try {
          // Cargar recursos en paralelo para mejorar rendimiento
          const [categoriesData, groupsData, tagsData] = await Promise.all([
            loadCategories(),
            loadGroups(),
            loadTags()
          ]);
          
          setCategories(categoriesData);
          setGroups(groupsData);
          setTags(tagsData);
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

  // Función para cargar categorías
  const loadCategories = async () => {
    try {
      console.log("Cargando categorías...");
      const token = localStorage.getItem('auth-token');
      const categoriesUrl = `${API_BASE_URL}/docmanager/categories/`;
      
      const response = await fetch(categoriesUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al cargar categorías: ${response.status}`);
      }
      
      const categoriesData = await response.json();
      console.log("Categorías cargadas:", categoriesData);
      
      return categoriesData.results || [];
    } catch (catError) {
      console.error("Error específico al cargar categorías:", catError);
      return [];
    }
  };

  // Función para cargar grupos
  const loadGroups = async () => {
    try {
      console.log("Cargando grupos...");
      
      // Intentar usar la función de respaldo primero si está disponible
      if (typeof getAvailableGroups === 'function') {
        try {
          const backupGroups = await getAvailableGroups();
          if (backupGroups && backupGroups.length > 0) {
            console.log("Grupos obtenidos con éxito desde el componente padre:", backupGroups);
            return backupGroups;
          }
        } catch (backupError) {
          console.warn("No se pudieron obtener grupos desde el componente padre:", backupError);
        }
      }
      
      // Si no hay respaldo o falló, usar fetch directo
      const token = localStorage.getItem('auth-token');
      const groupsUrl = `${API_BASE_URL}/docmanager/groups/`;
      
      const response = await fetch(groupsUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al cargar grupos: ${response.status}`);
      }
      
      const responseText = await response.text();
      const groupsData = JSON.parse(responseText);
      
      if (groupsData && groupsData.results && Array.isArray(groupsData.results)) {
        return groupsData.results;
      } else if (Array.isArray(groupsData)) {
        return groupsData;
      }
      
      return [];
    } catch (groupError) {
      console.error("Error al cargar grupos:", groupError);
      return [];
    }
  };

  // Función para cargar etiquetas
  const loadTags = async () => {
    try {
      console.log("Cargando etiquetas...");
      const token = localStorage.getItem('auth-token');
      const tagsUrl = `${API_BASE_URL}/docmanager/tags/`;
      
      const response = await fetch(tagsUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al cargar etiquetas: ${response.status}`);
      }
      
      const tagsData = await response.json();
      console.log("Etiquetas cargadas:", tagsData);
      
      return tagsData.results || [];
    } catch (tagError) {
      console.error("Error al cargar etiquetas:", tagError);
      return [];
    }
  };

  // Actualizar título cuando se selecciona un archivo
  useEffect(() => {
    if (selectedFile) {
      setValue('title', selectedFile.name.split('.')[0]);
    }
  }, [selectedFile, setValue]);

  // Limpiar estado cuando se cierra el modal
  useEffect(() => {
    if (!show) {
      reset({
        title: '',
        description: '',
        category: '',
        group: '',
        selectedTags: []
      });
      setSelectedFile(null);
      setIsLoading(false);
      
      // Resetear estados de creación de nuevas entidades
      setShowNewCategoryInput(false);
      setNewCategoryName('');
      setShowNewGroupInput(false);
      setNewGroupName('');
      setShowNewTagInput(false);
      setNewTagName('');
      setNewTagColor('#4F46E5');
    }
  }, [show, setSelectedFile, reset]);

  // Si no se muestra el modal, no renderizar
  if (!show) return null;

  // Manejar cambio de categoría
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    
    if (value === 'new_category') {
      setShowNewCategoryInput(true);
      return;
    }
    
    setValue('category', value);
  };

  // Manejar cambio de grupo
  const handleGroupChange = (e) => {
    const value = e.target.value;
    
    if (value === 'new_group') {
      setShowNewGroupInput(true);
      return;
    }
    
    setValue('group', value);
  };
  
  // Manejar cambios en etiquetas seleccionadas
  const handleTagToggle = (tagId) => {
    const currentTags = watchSelectedTags || [];
    
    if (currentTags.includes(tagId)) {
      // Quitar etiqueta si ya está seleccionada
      setValue('selectedTags', currentTags.filter(id => id !== tagId));
    } else {
      // Añadir etiqueta si no está seleccionada
      setValue('selectedTags', [...currentTags, tagId]);
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

  // Manejar envío del formulario
  const onSubmitForm = async (data) => {
    console.log("Iniciando onSubmitForm con datos:", data);
    
    // Validaciones adicionales
    if (!selectedFile) {
      toast({ 
        title: "Archivo requerido", 
        description: "Por favor, selecciona un archivo para subir.", 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);

    try {
      // Preparar el FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', data.title.trim());
      
      if (data.description && data.description.trim() !== '') {
        formData.append('description', data.description.trim());
      }
      
      formData.append('category', data.category);
      
      // Añadir grupo si está seleccionado
      if (data.group) {
        formData.append('group', data.group);
      }
      
      // Añadir etiquetas si hay seleccionadas
      if (data.selectedTags && data.selectedTags.length > 0) {
        data.selectedTags.forEach(tagId => {
          formData.append('tags', tagId);
        });
      }
      
      // Verificar el FormData para debugging
      console.log("FormData preparado:", {
        file: selectedFile.name,
        title: data.title.trim(),
        description: data.description?.trim() || "(sin descripción)",
        category: data.category,
        group: data.group || "Sin grupo",
        tags: data.selectedTags
      });
      
      toast({ 
        title: "Subiendo documento", 
        description: `Subiendo "${data.title.trim()}"... Por favor, espera.` 
      });

      // Llamar a la función onUpload proporcionada por el componente padre
      const result = await onUpload(formData);
      
      if (result) {
        console.log("Subida exitosa");
        toast({ 
          title: "Documento subido", 
          description: `"${data.title.trim()}" se ha subido correctamente.` 
        });
      }
    } catch (error) {
      console.error("Error al subir documento:", error);
      toast({ 
        title: "Error al subir", 
        description: error.message || "Ocurrió un error al subir el documento. Por favor, inténtalo de nuevo.",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nueva categoría
  const createNewCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría no puede estar vacío",
        variant: "destructive"
      });
      return;
    }
    
    setAddingCategory(true);
    try {
      const token = localStorage.getItem('auth-token');
      const categoryUrl = `${API_BASE_URL}/docmanager/categories/`;
      
      const response = await fetch(categoryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          name: newCategoryName.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear categoría: ${response.status}`);
      }
      
      const newCategory = await response.json();
      
      // Actualizar la lista de categorías
      setCategories(prev => [...prev, newCategory]);
      
      // Seleccionar la nueva categoría
      setValue('category', newCategory.id.toString());
      
      // Limpiar y ocultar el formulario de creación
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      
      toast({
        title: "Éxito",
        description: `Categoría "${newCategory.name}" creada correctamente`,
      });
    } catch (error) {
      console.error("Error al crear categoría:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la categoría",
        variant: "destructive"
      });
    } finally {
      setAddingCategory(false);
    }
  };

  // Crear nuevo grupo
  const createNewGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del grupo no puede estar vacío",
        variant: "destructive"
      });
      return;
    }
    
    setAddingGroup(true);
    try {
      const token = localStorage.getItem('auth-token');
      const groupUrl = `${API_BASE_URL}/docmanager/groups/`;
      
      const response = await fetch(groupUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
          is_public: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear grupo: ${response.status}`);
      }
      
      const newGroup = await response.json();
      
      // Actualizar la lista de grupos
      setGroups(prev => [...prev, newGroup]);
      
      // Seleccionar el nuevo grupo
      setValue('group', newGroup.id.toString());
      
      // Limpiar y ocultar el formulario de creación
      setNewGroupName('');
      setShowNewGroupInput(false);
      
      toast({
        title: "Éxito",
        description: `Grupo "${newGroup.name}" creado correctamente`,
      });
    } catch (error) {
      console.error("Error al crear grupo:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el grupo",
        variant: "destructive"
      });
    } finally {
      setAddingGroup(false);
    }
  };

  // Crear nueva etiqueta
  const createNewTag = async () => {
    if (!newTagName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la etiqueta no puede estar vacío",
        variant: "destructive"
      });
      return;
    }
    
    setAddingTag(true);
    try {
      const token = localStorage.getItem('auth-token');
      const tagUrl = `${API_BASE_URL}/docmanager/tags/`;
      
      const response = await fetch(tagUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color_code: newTagColor
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear etiqueta: ${response.status}`);
      }
      
      const newTag = await response.json();
      
      // Actualizar la lista de etiquetas
      setTags(prev => [...prev, newTag]);
      
      // Seleccionar la nueva etiqueta
      const currentTags = watchSelectedTags || [];
      setValue('selectedTags', [...currentTags, newTag.id]);
      
      // Limpiar y ocultar el formulario de creación
      setNewTagName('');
      setNewTagColor('#4F46E5');
      setShowNewTagInput(false);
      
      toast({
        title: "Éxito",
        description: `Etiqueta "${newTag.name}" creada correctamente`,
      });
    } catch (error) {
      console.error("Error al crear etiqueta:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la etiqueta",
        variant: "destructive"
      });
    } finally {
      setAddingTag(false);
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
            aria-label="Cerrar"
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
            aria-label="Área para arrastrar y soltar archivos"
            role="button"
            tabIndex={0}
          >
            <Upload className="mx-auto text-gray-400 mb-4" size={36} />
            <p className="text-gray-500">Haz clic para seleccionar un archivo o arrastra y suelta aquí</p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              aria-label="Selector de archivo"
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
              aria-label="Eliminar archivo seleccionado"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Formulario con React Hook Form */}
        {selectedFile && (
          <form onSubmit={handleSubmit(onSubmitForm)} className="mt-4 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <input
                    id="title"
                    type="text"
                    className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    disabled={isLoading}
                    aria-invalid={errors.title ? "true" : "false"}
                    {...field}
                  />
                )}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    id="description"
                    rows="3"
                    className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    disabled={isLoading}
                    {...field}
                  />
                )}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              
              {!showNewCategoryInput ? (
                <>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <select
                          id="category"
                          className={`w-full border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          disabled={isLoading || loadingResources}
                          aria-invalid={errors.category ? "true" : "false"}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            handleCategoryChange(e);
                          }}
                        >
                          <option value="">Seleccione una categoría</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                          <option value="new_category">+ Crear nueva categoría</option>
                        </select>
                      )}
                    />
                  </div>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                  {loadingResources && (
                    <div className="mt-1 text-sm flex items-center text-blue-600">
                      <span className="animate-pulse">Cargando categorías...</span>
                    </div>
                  )}
                  {!loadingResources && categories.length === 0 && (
                    <div className="mt-1 text-sm flex flex-col space-y-1">
                      <div className="flex items-center text-amber-600">
                        <AlertCircle size={14} className="mr-1"/> 
                        No hay categorías disponibles. Puedes crear una nueva.
                      </div>
                      <div className="text-gray-500 text-xs italic">
                        Si persiste el problema, podría haber dificultades para conectar con el servidor.
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nombre de la nueva categoría"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={addingCategory}
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={createNewCategory}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                      disabled={addingCategory || !newCategoryName.trim()}
                    >
                      {addingCategory ? "Creando..." : "Guardar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewCategoryName('');
                        setShowNewCategoryInput(false);
                      }}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                      disabled={addingCategory}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Selector de grupo */}
            <div>
              <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
                Grupo <span className="text-gray-400">(opcional)</span>
              </label>

              {!showNewGroupInput ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users size={16} className="text-gray-400" />
                  </div>
                  <Controller
                    name="group"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="group"
                        className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading || loadingResources}
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e);
                          handleGroupChange(e);
                        }}
                      >
                        <option value="">Sin grupo</option>
                        {groups.map(group => (
                          <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                        <option value="new_group">+ Crear nuevo grupo</option>
                      </select>
                    )}
                  />
                  {loadingResources && (
                    <div className="mt-1 text-sm flex items-center text-blue-600">
                      <span className="animate-pulse">Cargando grupos...</span>
                    </div>
                  )}
                  {!loadingResources && groups.length === 0 && (
                    <div className="mt-1 text-sm flex flex-col space-y-1">
                      <div className="flex items-center text-amber-600">
                        <AlertCircle size={14} className="mr-1"/> 
                        No hay grupos disponibles. Puedes crear uno nuevo.
                      </div>
                      <div className="text-gray-500 text-xs italic">
                        Si persiste el problema, podría haber dificultades para conectar con el servidor.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Nombre del nuevo grupo"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={addingGroup}
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={createNewGroup}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                      disabled={addingGroup || !newGroupName.trim()}
                    >
                      {addingGroup ? "Creando..." : "Guardar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewGroupName('');
                        setShowNewGroupInput(false);
                      }}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                      disabled={addingGroup}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Selector de etiquetas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas <span className="text-gray-400">(opcional)</span>
              </label>
              {!showNewTagInput ? (
                <>
                  {loadingResources ? (
                    <div className="flex items-center text-sm text-blue-600">
                      <span className="animate-pulse">Cargando etiquetas...</span>
                    </div>
                  ) : tags.length === 0 ? (
                    <div className="text-sm border border-gray-200 rounded-md p-3 bg-gray-50 space-y-2">
                      <div className="flex items-center text-amber-600">
                        <AlertCircle size={14} className="mr-1"/> 
                        No hay etiquetas disponibles.
                      </div>
                      <div className="text-gray-500 text-xs italic">
                        Si persiste el problema, podría haber dificultades para conectar con el servidor.
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewTagInput(true)}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300 hover:bg-green-200"
                        disabled={isLoading}
                      >
                        <span className="mr-1">+</span>
                        Crear nueva etiqueta
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 border border-gray-200 rounded-md p-3 bg-gray-50">
                      {tags.map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleTagToggle(tag.id)}
                          className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                            watchSelectedTags?.includes(tag.id)
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                          }`}
                          style={{
                            backgroundColor: watchSelectedTags?.includes(tag.id) ? tag.color_code + '33' : '',
                            borderColor: watchSelectedTags?.includes(tag.id) ? tag.color_code : '',
                            color: watchSelectedTags?.includes(tag.id) ? tag.color_code : ''
                          }}
                          disabled={isLoading}
                        >
                          <Tag size={12} className="mr-1" />
                          {tag.name}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowNewTagInput(true)}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300 hover:bg-green-200"
                        disabled={isLoading}
                      >
                        <span className="mr-1">+</span>
                        Crear nueva etiqueta
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Nombre de la nueva etiqueta"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={addingTag}
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <label htmlFor="tagColor" className="text-sm text-gray-700">Color:</label>
                      <input
                        type="color"
                        id="tagColor"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                        disabled={addingTag}
                      />
                      <div 
                        className="ml-2 h-6 px-2 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: newTagColor + '33',
                          borderColor: newTagColor,
                          color: newTagColor,
                          border: '1px solid'
                        }}
                      >
                        Vista previa
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={createNewTag}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                      disabled={addingTag || !newTagName.trim()}
                    >
                      {addingTag ? "Creando..." : "Guardar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewTagName('');
                        setNewTagColor('#4F46E5');
                        setShowNewTagInput(false);
                      }}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                      disabled={addingTag}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

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
                type="submit"
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
          </form>
        )}
      </div>
    </div>
  );
};

export default SimpleUploadModal;