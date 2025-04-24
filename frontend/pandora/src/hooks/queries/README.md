# Query Hooks

This directory contains React Query hooks for data fetching and management.

## Patterns and Best Practices

### Single Return Pattern
All hooks in this directory follow the single return pattern, which improves readability and maintainability by:

- Making the flow of logic easier to follow
- Simplifying debugging and code maintenance
- Making it easier to add logging or additional processing before returning

Example:
```javascript
export function useDataQuery(id, options = {}) {
  // Setup
  const queryClient = useQueryClient();
  const errorHandler = useErrorHandler();
  
  // Destructure options with defaults
  const { 
    enabled = Boolean(id),
    staleTime = 1000 * 60 * 5,
  } = options;

  // Execute the query
  const queryResult = useQuery({
    queryKey: ['data', id],
    queryFn: () => fetchData(id),
    enabled,
    staleTime,
    onError: (error) => {
      errorHandler.handleError(error);
    }
  });
  
  // Single return point
  return queryResult;
}
```

### Query Keys
- Use consistent patterns for query keys
- Structure them hierarchically for efficient invalidation
- Export key builders for reuse across the application

### Error Handling
- Centralized error handling through useErrorHandler
- Consistent error messages with context
- Proper error notification through toast messages

### Optimizations
- Appropriate staleTime settings based on data freshness requirements
- Enabled/disabled queries based on input validity
- Configurable refetch intervals

## Available Hooks

- **useProformasQuery** - Manages a list of proformas with filtering
- **useProformaDetailQuery** - Fetches a single proforma by ID
- **useProformaDashboardQuery** - Gets dashboard metrics with date filtering
- **useProductSearchQuery** - Searches for products to include in proformas
- **useProformaConfigQuery** - Manages proforma configuration settings

## Usage Example

```javascript
import { useProformaDetailQuery } from '@/hooks/queries/useProformasQuery';

function ProformaDetails({ id }) {
  const { 
    data: proforma, 
    isLoading, 
    isError, 
    error 
  } = useProformaDetailQuery(id);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h1>{proforma.nombre}</h1>
      {/* Rest of the component */}
    </div>
  );
}
```