import { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from '../utils/debounce';

/**
 * A hook that debounces a value. The returned value will only update
 * after the specified delay has passed without the input value changing.
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - The debounce delay in milliseconds
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    // Set up the timeout to update the debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Clean up the timeout if the value or delay changes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * A hook that returns a debounced version of the provided function.
 * 
 * @param {Function} fn - The function to debounce
 * @param {number} delay - The debounce delay in milliseconds
 * @param {Array} deps - Dependencies array for the useCallback hook
 * @returns {Function} The debounced function
 */
export function useDebouncedCallback(fn, delay = 500, deps = []) {
  // Use useRef to store the latest callback
  const fnRef = useRef(fn);
  
  // Update the ref each render to avoid stale callbacks
  useEffect(() => {
    fnRef.current = fn;
  });
  
  // Create a memoized debounced callback that updates when dependencies change
  const debouncedFn = useCallback(
    debounce((...args) => {
      fnRef.current(...args);
    }, delay),
    [delay, ...deps]
  );
  
  return debouncedFn;
}

/**
 * A hook that provides a debounced state value and a setter function.
 * The state will only update after the specified delay has passed without
 * new updates being made.
 * 
 * @param {any} initialValue - The initial state value
 * @param {number} delay - The debounce delay in milliseconds
 * @returns {Array} [debouncedValue, setDebouncedValue, immediateValue]
 */
export function useDebouncedState(initialValue, delay = 500) {
  const [immediateValue, setImmediateValue] = useState(initialValue);
  const debouncedValue = useDebounce(immediateValue, delay);
  
  return [debouncedValue, setImmediateValue, immediateValue];
}

export default useDebounce;