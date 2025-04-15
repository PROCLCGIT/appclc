import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from './useDebounce';

/**
 * A hook for handling asynchronous searches with built-in debouncing,
 * loading states, and error handling.
 * 
 * @param {Function} searchFunction - Async function that takes a search term and returns results
 * @param {Object} options - Configuration options
 * @param {number} options.debounceTime - Debounce delay in milliseconds
 * @param {string} options.initialSearchTerm - Initial search term
 * @param {any} options.initialResults - Initial results
 * @param {number} options.minChars - Minimum characters required to trigger search
 * @returns {Object} Search state and handlers
 */
export function useAsyncSearch(
  searchFunction,
  {
    debounceTime = 500,
    initialSearchTerm = '',
    initialResults = [],
    minChars = 2
  } = {}
) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [results, setResults] = useState(initialResults);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Create debounced search function
  const debouncedSearch = useDebouncedCallback(
    async (term) => {
      // Don't search if term is too short
      if (term.trim().length < minChars) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        const searchResults = await searchFunction(term);
        setResults(searchResults);
        setHasSearched(true);
      } catch (err) {
        setError(err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    debounceTime,
    [searchFunction, minChars]
  );
  
  // Execute search when term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setResults([]);
      setIsLoading(false);
      return;
    }
    
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);
  
  // Handler for input changes
  const handleSearchChange = useCallback((e) => {
    const newTerm = typeof e === 'string' ? e : e.target.value;
    setSearchTerm(newTerm);
  }, []);
  
  // Force a search immediately
  const search = useCallback((term = searchTerm) => {
    setSearchTerm(term);
    debouncedSearch.flush?.(term) || debouncedSearch(term);
  }, [searchTerm, debouncedSearch]);
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setHasSearched(false);
  }, []);
  
  return {
    searchTerm,
    results,
    isLoading,
    error,
    hasSearched,
    handleSearchChange,
    setSearchTerm,
    search,
    clearSearch
  };
}

export default useAsyncSearch;