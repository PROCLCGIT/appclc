import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Calendar, FileText, Sliders, Tag, FileType } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';

/**
 * Componente de barra de búsqueda mejorado
 * @param {Object} props
 * @param {string} props.searchQuery - Query de búsqueda actual
 * @param {Function} props.setSearchQuery - Función para actualizar la query
 * @param {Function} props.onSearch - Callback opcional cuando se realiza la búsqueda
 * @param {boolean} props.loading - Indica si se está cargando la búsqueda
 * @param {Array} props.categories - Lista de categorías disponibles
 * @param {string} props.selectedCategory - Categoría seleccionada
 * @param {Function} props.setSelectedCategory - Función para cambiar categoría
 * @param {Array} props.fileTypes - Lista de tipos de archivo disponibles
 */
const SearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  onSearch,
  loading = false,
  categories = [],
  selectedCategory,
  setSelectedCategory,
  fileTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png']
}) => {
  // Estado local para el input
  const [inputValue, setInputValue] = useState(searchQuery);
  // Estado para el avanzado
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Estados para filtros avanzados
  const [selectedFileType, setSelectedFileType] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  // Usamos debounce para mejorar la experiencia de usuario
  const debouncedValue = useDebounce(inputValue, 300);
  // Referencia para la detección de clics fuera del panel avanzado
  const advancedPanelRef = useRef(null);
  
  // Actualizar inputValue cuando cambia searchQuery (por ejemplo, al resetear)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);
  
  // Efecto para propagar el valor debounceado
  useEffect(() => {
    // Solo actualizamos si el valor ha cambiado realmente
    if (debouncedValue !== searchQuery) {
      console.log("Actualizando búsqueda con valor debounceado:", debouncedValue);
      setSearchQuery(debouncedValue);
      
      if (onSearch && debouncedValue) {
        // Pasamos parámetros mínimos pero explícitos para búsqueda debounceada
        onSearch(debouncedValue, { q: debouncedValue });
      } else if (onSearch && debouncedValue === '') {
        // Si se borró la búsqueda, enviamos una búsqueda vacía explícita
        console.log("Limpiando búsqueda por debounce");
        onSearch('', { q: '' });
      }
    }
  }, [debouncedValue, setSearchQuery, onSearch, searchQuery]);
  
  // Manejar click fuera del panel
  useEffect(() => {
    function handleClickOutside(event) {
      if (advancedPanelRef.current && !advancedPanelRef.current.contains(event.target)) {
        setShowAdvanced(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Manejar la tecla Enter para búsqueda inmediata
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(inputValue);
      if (onSearch) {
        // Cuando el usuario presiona Enter, pasamos un objeto mínimo de parámetros
        onSearch(inputValue, { q: inputValue });
      }
    }
  };
  
  // Limpiar la búsqueda
  const handleClear = () => {
    setInputValue('');
    setSearchQuery('');
    if (onSearch) {
      // Asegurarnos de pasar un objeto vacío como segundo parámetro
      onSearch('', {});
    }
  };
  
  // Ejecutar búsqueda avanzada con todos los filtros
  const handleAdvancedSearch = () => {
    console.log("Ejecutando búsqueda avanzada");
    
    // Incluir los filtros avanzados como parámetros adicionales
    // Esta implementación debe coordinarse con el backend
    const searchParams = {
      q: inputValue,
      category: selectedCategory !== 'all' ? selectedCategory : null,
      file_type: selectedFileType || null,
      date_filter: selectedDateFilter || null,
      tags: selectedTags.length > 0 ? selectedTags.join(',') : null
    };
    
    console.log("Parámetros de búsqueda avanzada:", searchParams);
    
    // Filtrar parámetros vacíos para construir la URL de consulta si fuera necesario
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams)
        .filter(([_, value]) => value !== null && value !== '')
    );
    
    console.log("Parámetros filtrados:", filteredParams);
    
    // Pasar tanto la consulta como los parámetros adicionales al callback
    if (onSearch) {
      // Asegurarnos de que siempre pasamos un objeto, incluso si está vacío
      onSearch(inputValue, filteredParams || {});
    } else {
      console.warn("No se proporcionó un callback onSearch");
    }
    
    setShowAdvanced(false);
  };
  
  // Resetear todos los filtros
  const resetAllFilters = () => {
    setInputValue('');
    setSelectedFileType('');
    setSelectedDateFilter('');
    setSelectedTags([]);
    if (setSelectedCategory) {
      setSelectedCategory('all');
    }
  };
  
  return (
    <div className="relative flex-1">
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por título, descripción, tipo de archivo..."
          className="w-full p-3 pl-12 pr-20 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${loading ? 'text-indigo-500 animate-pulse' : 'text-gray-400'}`} size={20} />
        
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <button 
              className="text-gray-400 hover:text-gray-600 p-1"
              onClick={handleClear}
              title="Limpiar búsqueda"
            >
              <X size={18} />
            </button>
          )}
          
          <button 
            className={`p-1 rounded-full ${showAdvanced ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
            title="Opciones de búsqueda avanzada"
          >
            <Sliders size={18} />
          </button>
        </div>
      </div>
      
      {/* Panel de búsqueda avanzada */}
      {showAdvanced && (
        <div 
          ref={advancedPanelRef}
          className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10"
        >
          <h3 className="text-sm font-medium text-gray-700 mb-3">Búsqueda avanzada</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Búsqueda por texto */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Por texto</label>
              <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500">
                <div className="p-2 bg-gray-50">
                  <FileText size={16} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Contenido específico..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="p-2 w-full focus:outline-none"
                />
              </div>
            </div>
            
            {/* Filtro por fecha */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Por fecha</label>
              <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500">
                <div className="p-2 bg-gray-50">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <select 
                  className="p-2 w-full focus:outline-none"
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                >
                  <option value="">Cualquier fecha</option>
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="year">Este año</option>
                  <option value="custom">Rango personalizado</option>
                </select>
              </div>
            </div>
            
            {/* Categorías */}
            {categories.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Por categoría</label>
                <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500">
                  <div className="p-2 bg-gray-50">
                    <Filter size={16} className="text-gray-400" />
                  </div>
                  <select 
                    className="p-2 w-full focus:outline-none"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {/* Tipos de archivo */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Por tipo de archivo</label>
              <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500">
                <div className="p-2 bg-gray-50">
                  <FileType size={16} className="text-gray-400" />
                </div>
                <select 
                  className="p-2 w-full focus:outline-none"
                  value={selectedFileType}
                  onChange={(e) => setSelectedFileType(e.target.value)}
                >
                  <option value="">Todos los tipos</option>
                  {fileTypes.map(type => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Etiquetas populares */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">Etiquetas populares</label>
            <div className="flex flex-wrap gap-2">
              {['Importante', 'Contrato', 'Factura', 'Reporte', 'Proyecto'].map((tag) => (
                <span 
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag) 
                        : [...prev, tag]
                    );
                  }}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs cursor-pointer ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <Tag size={12} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <button 
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={() => {
                resetAllFilters();
                setShowAdvanced(false);
              }}
            >
              Restablecer
            </button>
            
            <button 
              className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
              onClick={handleAdvancedSearch}
            >
              Buscar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;