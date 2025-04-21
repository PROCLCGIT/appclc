// src/pages/proformas/hooks/useProductSearchQuery.js

import { useState, useCallback, useEffect } from "react";
import { useProductSearchQuery as useProductSearchBaseQuery } from "@/hooks/queries/useProformasQuery";
import { useErrorHandler } from "./useErrorHandler";
import { useNotifications } from "./useNotifications";

/**
 * Hook optimizado para buscar productos utilizando React Query
 */
export function useProductSearchQuery() {
  const notify = useNotifications();
  const errorHandler = useErrorHandler();

  // Estado local para términos de búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSource, setSearchSource] = useState("all");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [viewType, setViewType] = useState("grid");

  // Aplicar debounce al término de búsqueda para evitar muchas peticiones
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Utilizar el hook de búsqueda de productos de React Query
  const {
    data: searchResults = [],
    isLoading: loadingProducts,
    isError,
    error,
    refetch
  } = useProductSearchBaseQuery(
    { term: debouncedTerm, source: searchSource },
    {
      enabled: debouncedTerm.length >= 2, // Solo buscar con al menos 2 caracteres
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 30, // 30 minutos
    }
  );

  // Reportar errores si ocurren
  useEffect(() => {
    if (isError && error) {
      errorHandler.handleError(error, "buscar productos");
    }
  }, [isError, error, errorHandler]);

  /**
   * Ejecuta una búsqueda de productos
   */
  const searchProducts = useCallback(async (term, source = "all") => {
    if (!term || term.length < 2) {
      notify.warning("Ingrese al menos 2 caracteres para buscar");
      return [];
    }

    try {
      setSearchTerm(term);
      setSearchSource(source);
      
      // La búsqueda real la manejará el debounce y useProductSearchBaseQuery
      // Pero podemos forzar un refetch si es necesario
      await refetch();
      
      return searchResults;
    } catch (error) {
      errorHandler.handleError(error, "buscar productos");
      return [];
    }
  }, [refetch, errorHandler, notify, searchResults]);

  /**
   * Carga los productos iniciales (utilizados como sugerencias)
   */
  const loadInitialProducts = useCallback(async () => {
    try {
      // Usar un término genérico para cargar productos populares o recientes
      await searchProducts("popular", "all");
    } catch (error) {
      console.error("Error al cargar productos iniciales:", error);
      // No mostrar error al usuario para no interferir con la experiencia
    }
  }, [searchProducts]);

  // Devolver las funciones y estado
  return {
    searchTerm,
    setSearchTerm,
    searchSource, 
    setSearchSource,
    viewType,
    setViewType,
    searchResults,
    loadingProducts,
    searchProducts,
    loadInitialProducts
  };
}

export default useProductSearchQuery;
