# Utility Libraries and Hooks

This directory contains reusable utility functions and React hooks for common patterns in the application.

## Hooks

### Debounce and Throttle Hooks

Located in `hooks/useDebounce.js` and `hooks/useThrottle.js`.

#### `useDebounce`

Debounces a value. The returned value will only update after the specified delay has passed without the input value changing.

```jsx
import { useDebounce } from '@/lib/hooks';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // This effect will only run when debouncedSearchTerm changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

#### `useDebouncedCallback`

Returns a debounced version of the provided function.

```jsx
import { useDebouncedCallback } from '@/lib/hooks';

function SearchComponent({ onSearch }) {
  const debouncedSearch = useDebouncedCallback(
    (term) => {
      onSearch(term);
    },
    500, // 500ms delay
    [onSearch] // dependencies
  );
  
  return (
    <input
      type="text"
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

#### `useThrottle` and `useThrottledCallback`

Similar to the debounce hooks, but with throttling instead of debouncing.

```jsx
import { useThrottledCallback } from '@/lib/hooks';

function ScrollComponent() {
  const throttledHandleScroll = useThrottledCallback(
    () => {
      // Handle scroll event
      console.log('Scroll position:', window.scrollY);
    },
    200 // 200ms throttle interval
  );
  
  useEffect(() => {
    window.addEventListener('scroll', throttledHandleScroll);
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [throttledHandleScroll]);
  
  return <div>Scroll content</div>;
}
```

### Async Search Hook

Located in `hooks/useAsyncSearch.js`.

#### `useAsyncSearch`

A hook for handling asynchronous searches with built-in debouncing, loading states, and error handling.

```jsx
import { useAsyncSearch } from '@/lib/hooks';
import { searchProducts } from '@/services/api';

function ProductSearch() {
  const { 
    searchTerm, 
    results, 
    isLoading, 
    error, 
    handleSearchChange,
    clearSearch
  } = useAsyncSearch(
    async (term) => {
      const response = await searchProducts(term);
      return response.data;
    },
    {
      debounceTime: 400,
      minChars: 2
    }
  );
  
  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search products..."
      />
      
      {isLoading && <p>Loading...</p>}
      
      {error && <p>Error: {error.message}</p>}
      
      <ul>
        {results.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
      
      <button onClick={clearSearch}>Clear</button>
    </div>
  );
}
```

### Form Handling Hook

Located in `hooks/useDebouncedForm.js`.

#### `useDebouncedForm`

A hook for handling form state with debounced validation and changes.

```jsx
import { useDebouncedForm } from '@/lib/hooks';

function ProductForm({ onSubmit }) {
  const validateProduct = (values) => {
    const errors = {};
    
    if (!values.name) {
      errors.name = 'Name is required';
    }
    
    if (!values.price || values.price <= 0) {
      errors.price = 'Price must be greater than zero';
    }
    
    return errors;
  };
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm
  } = useDebouncedForm(
    { name: '', price: '', description: '' },
    validateProduct,
    onSubmit,
    { debounceTime: 300 }
  );
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.name && errors.name && <span>{errors.name}</span>}
      </div>
      
      <div>
        <label>Price</label>
        <input
          name="price"
          type="number"
          value={values.price}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.price && errors.price && <span>{errors.price}</span>}
      </div>
      
      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      
      <button type="button" onClick={resetForm}>
        Reset
      </button>
    </form>
  );
}
```

## Utility Functions

Located in `utils/debounce.js`.

### `debounce`

Creates a debounced function that delays invoking the provided function until after the specified wait time has elapsed since the last time it was invoked.

```javascript
import { debounce } from '@/lib/utils/debounce';

const debouncedSearch = debounce((searchTerm) => {
  performSearch(searchTerm);
}, 500);

// Usage
debouncedSearch('react'); // Called immediately
debouncedSearch('react hooks'); // Previous call is canceled, this one is delayed
```

### `throttle`

Creates a throttled function that only invokes the provided function at most once per every specified wait period.

```javascript
import { throttle } from '@/lib/utils/debounce';

const throttledScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 200);

// Usage
window.addEventListener('scroll', throttledScroll);
```

### `debouncePromise`

Wraps a given promise with a debounce mechanism to prevent multiple executions.

```javascript
import { debouncePromise } from '@/lib/utils/debounce';

const searchAPI = async (term) => {
  const response = await fetch(`/api/search?q=${term}`);
  return response.json();
};

const debouncedSearchAPI = debouncePromise(searchAPI, 500);

// Usage
debouncedSearchAPI('react').then(results => {
  console.log(results);
});
```

## Best Practices

1. **Consistent Debounce Times**:
   - Use 300-500ms for text inputs
   - Use 100-200ms for sliders or range inputs
   - Use 50-100ms for scroll or resize events with throttle

2. **Error Handling**:
   - Always handle errors in async operations
   - Provide meaningful error messages to users

3. **Loading States**:
   - Show loading indicators for operations that take longer than 300ms
   - Consider using optimistic UI updates for faster perceived performance

4. **Form Validation**:
   - Debounce validation for a better user experience
   - Show validation errors after the user has stopped typing
   - Validate on blur for immediate feedback

5. **Performance**:
   - Use memoization with `React.useMemo` and `React.useCallback`
   - Use `useThrottle` for high-frequency events like scrolling
   - Use `useDebounce` for user input like typing