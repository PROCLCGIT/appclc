import { useState, useEffect, useRef, useCallback } from 'react';
import { throttle } from '../utils/debounce';

/**
 * A hook that throttles a value. The returned value will only update
 * at most once during the specified interval.
 * 
 * @param {any} value - The value to throttle
 * @param {number} limit - The throttle interval in milliseconds
 * @returns {any} The throttled value
 */
export function useThrottle(value, limit = 300) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef(0);
  
  useEffect(() => {
    const now = Date.now();
    
    // If interval has elapsed, update the throttled value
    if (now >= lastUpdated.current + limit) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      // Otherwise, set a timeout to update after interval ends
      const timerId = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, limit - (now - lastUpdated.current));
      
      return () => clearTimeout(timerId);
    }
  }, [value, limit]);
  
  return throttledValue;
}

/**
 * A hook that returns a throttled version of the provided function.
 * 
 * @param {Function} fn - The function to throttle
 * @param {number} limit - The throttle interval in milliseconds
 * @param {Array} deps - Dependencies array for the useCallback hook
 * @returns {Function} The throttled function
 */
export function useThrottledCallback(fn, limit = 300, deps = []) {
  // Use useRef to store the latest callback
  const fnRef = useRef(fn);
  
  // Update the ref each render to avoid stale callbacks
  useEffect(() => {
    fnRef.current = fn;
  });
  
  // Create a memoized throttled callback that updates when dependencies change
  const throttledFn = useCallback(
    throttle((...args) => {
      fnRef.current(...args);
    }, limit),
    [limit, ...deps]
  );
  
  return throttledFn;
}

/**
 * A hook that provides a throttled state value and a setter function.
 * The state will update at most once during the specified interval.
 * 
 * @param {any} initialValue - The initial state value
 * @param {number} limit - The throttle interval in milliseconds
 * @returns {Array} [throttledValue, setThrottledValue, immediateValue]
 */
export function useThrottledState(initialValue, limit = 300) {
  const [immediateValue, setImmediateValue] = useState(initialValue);
  const throttledValue = useThrottle(immediateValue, limit);
  
  return [throttledValue, setImmediateValue, immediateValue];
}

export default useThrottle;