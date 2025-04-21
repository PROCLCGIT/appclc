// src/pages/proformas/hooks/useClientSearchQuery.js

import { useState, useEffect, useCallback, useRef } from "react";
import { useClientesQuery } from "@/hooks/queries/useClientesQuery";
import { useNotifications } from "./useNotifications";
import { useErrorHandler } from "./useErrorHandler";

/**
 * Hook optimizado para búsqueda de clientes utilizando React Query
 */
export default function useClientSearchQuery() {
  const notify = useNotifications();
  const errorHandler = useErrorHandler();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  // Referencia para cancelar búsquedas pendientes
  const searchCounter = useRef(0);
  
  // Utilizar el hook de React Query para clientes
  const {
    clientes: clientesData,
    isLoading: isLoadingQuery,
    searchClientes,
  } = useClientesQuery({
    enabled: false, // No cargar automáticamente todos los clientes
    showErrors: false, // Manejaremos los errores aquí
  });

  // Efecto para el debounce de la búsqueda
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm && searchTerm.length >= 2) {
        setDebouncedSearchTerm(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Efecto para ejecutar la búsqueda cuando cambia el término de búsqueda con debounce
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  // Función para realizar la búsqueda
  const performSearch = useCallback(
    async (term) => {
      if (!term || term.length < 2) {
        return;
      }

      setLoadingClientes(true);
      const currentSearch = ++searchCounter.current;

      try {
        const results = await searchClientes(term);
        
        // Solo actualizar si esta es la búsqueda más reciente
        if (currentSearch === searchCounter.current) {
          setClientes(results || []);
        }
      } catch (error) {
        if (currentSearch === searchCounter.current) {
          errorHandler.handleError(error, 'buscar clientes');
          notify.error("Error al buscar clientes");
          setClientes([]);
        }
      } finally {
        if (currentSearch === searchCounter.current) {
          setLoadingClientes(false);
          setIsSearching(false);
        }
      }
    },
    [searchClientes, errorHandler, notify]
  );

  // Función para iniciar una búsqueda manual
  const searchCliente = useCallback(
    async (term) => {
      if (!term || term.length < 2) {
        notify.warning("Ingrese al menos 2 caracteres para buscar");
        return [];
      }

      setSearchTerm(term);
      setIsSearching(true);
      
      try {
        setLoadingClientes(true);
        const searchCounter = Date.now();
        const results = await searchClientes(term);
        setClientes(results || []);
        return results || [];
      } catch (error) {
        errorHandler.handleError(error, 'buscar clientes');
        setClientes([]);
        return [];
      } finally {
        setLoadingClientes(false);
        setIsSearching(false);
      }
    },
    [searchClientes, notify, errorHandler]
  );

  // Cargar clientes iniciales (por ejemplo, los más recientes)
  const loadClientes = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoadingClientes(true);
        
        const results = await searchClientes(""); // Buscar todos o los más recientes
        setClientes(results || []);
        
        return results;
      } catch (error) {
        errorHandler.handleError(error, 'cargar clientes');
        return [];
      } finally {
        setLoadingClientes(false);
      }
    },
    [searchClientes, errorHandler]
  );

  return {
    clientes,
    loadingClientes,
    isSearching,
    searchTerm,
    setSearchTerm,
    searchCliente,
    loadClientes,
  };
}
