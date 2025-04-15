import { useState, useEffect } from 'react';
import { MOCK_DOCUMENTS, MOCK_CATEGORIES } from '../data/mockData';

/**
 * Hook personalizado para manejar la lógica de documentos
 */
const useDocuments = () => {
  // Estados
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Efecto para cargar y filtrar documentos
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulamos un retardo para la carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filtramos documentos por búsqueda y categoría
      let filteredDocs = [...MOCK_DOCUMENTS];
      
      // Aplicar filtro de búsqueda
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredDocs = filteredDocs.filter(doc => 
          doc.title.toLowerCase().includes(query) || 
          (doc.description && doc.description.toLowerCase().includes(query)) ||
          doc.tags.some(tag => tag.name.toLowerCase().includes(query))
        );
      }
      
      // Aplicar filtro de categoría
      if (selectedCategory !== 'all') {
        filteredDocs = filteredDocs.filter(doc => 
          doc.category && doc.category.id.toString() === selectedCategory
        );
      }
      
      // Aplicar ordenamiento
      filteredDocs.sort((a, b) => {
        if (sortBy === 'title') {
          return sortOrder === 'asc' 
            ? a.title.localeCompare(b.title) 
            : b.title.localeCompare(a.title);
        } else if (sortBy === 'file_size') {
          return sortOrder === 'asc' 
            ? a.file_size - b.file_size 
            : b.file_size - a.file_size;
        } else if (sortBy === 'created_at') {
          return sortOrder === 'asc' 
            ? new Date(a.created_at) - new Date(b.created_at) 
            : new Date(b.created_at) - new Date(a.created_at);
        } else { // updated_at por defecto
          return sortOrder === 'asc' 
            ? new Date(a.updated_at) - new Date(b.updated_at) 
            : new Date(b.updated_at) - new Date(a.updated_at);
        }
      });
      
      setDocuments(filteredDocs);
      setCategories(MOCK_CATEGORIES);
      setIsLoading(false);
    };

    fetchData();
  }, [searchQuery, selectedCategory, sortBy, sortOrder]);

  // Manejar subida de archivos (simulada)
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newDoc = {
      id: documents.length > 0 ? Math.max(...documents.map(doc => doc.id)) + 1 : 1,
      title: selectedFile.name.split('.')[0],
      description: "",
      file_type: selectedFile.name.split('.').pop().toLowerCase(),
      file_size: selectedFile.size,
      category: null,
      tags: [],
      is_favorite: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      file_url: "#"
    };
    
    setDocuments([newDoc, ...documents]);
    setSelectedFile(null);
    setIsLoading(false);
    return newDoc;
  };

  // Manejar descarga de archivos (simulada)
  const handleDownload = async (document) => {
    alert(`Descargando: ${document.title}.${document.file_type}`);
  };

  // Manejar eliminación de documentos (simulada)
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setDocuments(documents.filter(doc => doc.id !== id));
      setIsLoading(false);
      return true;
    }
    return false;
  };

  // Manejar favoritos (simulado)
  const handleToggleFavorite = async (id) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, is_favorite: !doc.is_favorite } : doc
    ));
  };

  return {
    documents,
    categories,
    isLoading,
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
    handleUpload,
    handleDownload,
    handleDelete,
    handleToggleFavorite
  };
};

export default useDocuments;