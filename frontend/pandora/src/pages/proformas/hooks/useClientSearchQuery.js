// src/pages/proformas/hooks/useClientSearch.js

import { useState, useEffect } from 'react';
import { clientesService } from '@/services/api';
import { mockClientes } from '@/services/mockData';
import { toast } from 'sonner';

/**
 * Hook personalizado para gestionar búsqueda y carga de clientes
 */
export default function useClientSearch() {
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Cargar clientes al iniciar
  useEffect(() => {
    loadClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  /**
   * Carga la lista completa de clientes desde la API
   */
  const loadClientes = async () => {
    setLoadingClientes(true);
    console.log("Iniciando carga de clientes desde el servidor...");
    
    try {
      // Intentar cargar desde la API
      console.log("Realizando petición a clientesService.getAll()...");
      const response = await clientesService.getAll();
      
      // Procesar los resultados
      if (response && (response.results || Array.isArray(response))) {
        // Obtener los resultados, pueden venir en .results o directamente como array
        const clientesData = response.results || response;
        
        if (clientesData.length > 0) {
          console.log(`Éxito: Se cargaron ${clientesData.length} clientes desde la API`);
          
          // Normalizar los IDs de los clientes antes de guardarlos en el estado
          const clientesNormalizados = clientesData.map(cliente => {
            return {
              ...cliente,
              // Asegurar que los IDs relacionados sean numéricos
              id: typeof cliente.id === 'string' ? Number(cliente.id) : cliente.id,
              zona: cliente.zona ? Number(cliente.zona) : cliente.zona,
              ciudad: cliente.ciudad ? Number(cliente.ciudad) : cliente.ciudad,
              tipo_cliente: cliente.tipo_cliente ? Number(cliente.tipo_cliente) : cliente.tipo_cliente,
            };
          });
          
          console.log(`Clientes normalizados con IDs numéricos: ${clientesNormalizados.length}`);
          setClientes(clientesNormalizados);
        } else {
          console.warn("Advertencia: La API devolvió 0 clientes");
          toast.warning("No hay clientes disponibles. Por favor, agregue clientes desde el panel de administración.");
          
          // Si no hay clientes, usar datos de ejemplo pero asegurar que tengan IDs numéricos
          const mockClientesNormalizados = mockClientes.map(cliente => ({
            ...cliente,
            id: typeof cliente.id === 'string' ? Number(cliente.id) : cliente.id,
            zona: cliente.zona ? Number(cliente.zona) : cliente.zona,
            ciudad: cliente.ciudad ? Number(cliente.ciudad) : cliente.ciudad,
            tipo_cliente: cliente.tipo_cliente ? Number(cliente.tipo_cliente) : cliente.tipo_cliente,
          }));
          
          setClientes(mockClientesNormalizados);
        }
      } else {
        // Manejar respuesta inválida
        console.error("Error: Formato de respuesta inesperado:", response);
        toast.error("Error al cargar clientes: formato inesperado");
        
        // Si la respuesta es inválida, usar datos de ejemplo pero normalizar IDs
        const mockClientesNormalizados = mockClientes.map(cliente => ({
          ...cliente,
          id: typeof cliente.id === 'string' ? Number(cliente.id) : cliente.id,
          zona: cliente.zona ? Number(cliente.zona) : cliente.zona,
          ciudad: cliente.ciudad ? Number(cliente.ciudad) : cliente.ciudad,
          tipo_cliente: cliente.tipo_cliente ? Number(cliente.tipo_cliente) : cliente.tipo_cliente,
        }));
        
        setClientes(mockClientesNormalizados);
      }
    } catch (error) {
      // Manejar errores
      console.error("Error al cargar clientes:", error);
      const errorDetails = error.response || error.message || JSON.stringify(error);
      console.error("Detalles:", errorDetails);
      
      // Mensaje de error más descriptivo
      const errorMessage = error.message ? error.message : 
                          (error.response?.data?.detail || 'Error de conexión');
      toast.error(`Error al cargar clientes: ${errorMessage}`);
      
      // En caso de error, usar datos de ejemplo pero normalizar IDs
      console.log("Usando clientes de ejemplo como respaldo por error");
      const mockClientesNormalizados = mockClientes.map(cliente => ({
        ...cliente,
        id: typeof cliente.id === 'string' ? Number(cliente.id) : cliente.id,
        zona: cliente.zona ? Number(cliente.zona) : cliente.zona,
        ciudad: cliente.ciudad ? Number(cliente.ciudad) : cliente.ciudad,
        tipo_cliente: cliente.tipo_cliente ? Number(cliente.tipo_cliente) : cliente.tipo_cliente,
      }));
      
      setClientes(mockClientesNormalizados);
    } finally {
      // Finalizar la carga
      setLoadingClientes(false);
    }
  };
  
  /**
   * Busca clientes por nombre, RUC o información de contacto
   */
  const searchClientes = (term) => {
    setSearchTerm(term);
    
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const termLower = term.toLowerCase();
    
    // Filtrar clientes que coincidan con el término de búsqueda
    const results = clientes.filter(cliente => {
      return (
        (cliente.nombre && cliente.nombre.toLowerCase().includes(termLower)) ||
        (cliente.ruc && cliente.ruc.toLowerCase().includes(termLower)) ||
        (cliente.email && cliente.email.toLowerCase().includes(termLower)) ||
        (cliente.telefono && cliente.telefono.toLowerCase().includes(termLower))
      );
    });
    
    setSearchResults(results);
  };
  
  /**
   * Obtiene un cliente por su ID
   */
  const getClienteById = async (id) => {
    try {
      // Asegurar que el ID sea numérico para la petición a la API
      const clienteId = typeof id === 'string' ? Number(id) : id;
      
      const cliente = await clientesService.getById(clienteId);
      
      // Asegurar que los IDs relacionados sean numéricos al obtener el cliente
      if (cliente) {
        return {
          ...cliente,
          // Convertir IDs relacionados a números
          zona: cliente.zona ? Number(cliente.zona) : cliente.zona,
          ciudad: cliente.ciudad ? Number(cliente.ciudad) : cliente.ciudad,
          tipo_cliente: cliente.tipo_cliente ? Number(cliente.tipo_cliente) : cliente.tipo_cliente,
        };
      }
      
      return cliente;
    } catch (error) {
      console.error(`Error al obtener cliente con ID ${id}:`, error);
      
      // Generar un mensaje de error más descriptivo
      let errorMessage = "No se pudo obtener la información del cliente";
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = `El cliente con ID ${id} no existe o fue eliminado`;
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast.error(errorMessage);
      return null;
    }
  };
  
  return {
    clientes,
    loadingClientes,
    searchTerm,
    searchResults,
    loadClientes,
    searchClientes,
    getClienteById,
  };
};
