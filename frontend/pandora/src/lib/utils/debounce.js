/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {boolean} immediate - Whether to invoke the function immediately instead of waiting
 * @returns {Function} The debounced function
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const context = this;
    
    // Save this for later
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    // Should we invoke immediately?
    const callNow = immediate && !timeout;
    
    // Clear existing timeout
    clearTimeout(timeout);
    
    // Set new timeout
    timeout = setTimeout(later, wait);
    
    // If immediate execution is required, invoke now
    if (callNow) func.apply(context, args);
  };
}

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per every specified wait period.
 * 
 * @param {Function} func - The function to throttle
 * @param {number} wait - The number of milliseconds to throttle invocations to
 * @returns {Function} The throttled function
 */
export function throttle(func, wait = 300) {
  let waiting = false;
  let lastArgs = null;
  let lastThis = null;
  
  return function executedFunction(...args) {
    // Save context
    const context = this;
    
    // If we're waiting, store the latest arguments
    if (waiting) {
      lastArgs = args;
      lastThis = this;
      return;
    }
    
    // Not waiting, so execute function
    func.apply(context, args);
    
    // Now we're waiting
    waiting = true;
    
    // Set timeout for end of wait period
    setTimeout(() => {
      waiting = false;
      
      // If there were calls during wait, execute with latest args
      if (lastArgs) {
        func.apply(lastThis, lastArgs);
        lastArgs = null;
        lastThis = null;
      }
    }, wait);
  };
}

/**
 * Wraps a given promise with a debounce mechanism to prevent multiple executions
 * 
 * @param {Function} promiseFactory - Function that returns a promise
 * @param {number} wait - Debounce wait time in ms
 * @returns {Function} Debounced promise factory
 */
export function debouncePromise(promiseFactory, wait = 300) {
  let timeout;
  let pendingPromise = null;
  
  return function(...args) {
    // If there's an existing pendingPromise, return it
    if (pendingPromise) {
      return pendingPromise;
    }
    
    // Create a new promise
    const promise = new Promise((resolve, reject) => {
      const debouncedFunction = () => {
        pendingPromise = null;
        try {
          resolve(promiseFactory.apply(this, args));
        } catch (err) {
          reject(err);
        }
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(debouncedFunction, wait);
    });
    
    pendingPromise = promise;
    return promise;
  };
}