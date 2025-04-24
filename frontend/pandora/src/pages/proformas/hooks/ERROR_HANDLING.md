# Estrategia de Manejo de Errores

Este documento describe las mejores prácticas para el manejo de errores en las consultas a la API y en los componentes React.

## Principios Clave

1. **Degradación Elegante**: Los errores no deben interrumpir la experiencia del usuario. La aplicación debe seguir funcionando incluso cuando ocurren errores.

2. **Notificaciones Claras**: Los usuarios deben ser informados de los errores de manera clara y útil.

3. **Manejo Centralizado**: Utilizar un sistema centralizado para manejar los errores de manera consistente.

4. **Clasificación de Errores**: Categorizar los errores para aplicar estrategias específicas a cada tipo.

5. **Estrategia de Reintentos**: Implementar reintentos automáticos para errores temporales.

## Tipos de Errores

- **network**: Problemas de conectividad de red
- **rateLimit**: Demasiadas solicitudes al servidor
- **timeout**: Tiempo de espera agotado
- **validation**: Errores de validación de datos
- **unauthorized**: Sesión expirada o no autenticado
- **forbidden**: Sin permisos para la acción
- **notFound**: El recurso no existe
- **server**: Errores internos del servidor (500)
- **cors**: Errores de seguridad en solicitudes cruzadas
- **memory**: Problemas de memoria
- **aborted**: Operaciones canceladas

## Implementación con React Query

### En Servicios API

```javascript
async searchProducts(term) {
  try {
    // Validar parámetros
    if (!term || term.trim().length === 0) {
      return []; // Devolver array vacío si no hay término
    }
    
    const response = await api.get('/endpoint', {
      params: { term },
      timeout: 15000, // Timeout razonable
    });
    
    return response.data || [];
  } catch (error) {
    // Manejar específicamente errores de servidor
    if (error.response?.status === 500) {
      console.error('Error 500:', error.message);
      return []; // Devolver array vacío en vez de propagar el error
    }
    
    throw this.handleError(error);
  }
}
```

### En Hooks de Query

```javascript
export function useDataQuery(params, options = {}) {
  const errorHandler = useErrorHandler();
  const notify = useNotifications();
  
  return useQuery({
    queryKey: ['data', params],
    queryFn: async () => {
      try {
        const results = await dataService.getData(params);
        return results;
      } catch (error) {
        const errorType = errorHandler.classifyError(error);
        
        // Manejar tipos específicos
        if (errorType === 'server') {
          notify.warning('Problema temporal', {
            description: 'Mostrando datos limitados.'
          });
          return []; // Fallback
        }
        
        // Delegar manejo de otros errores
        errorHandler.handleError(error, 'obtener datos');
        throw error;
      }
    },
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10000),
    onError: () => {
      // Manejo secundario (rara vez necesario)
    }
  });
}
```

### En Componentes de UI

```jsx
function ProductList({ searchTerm }) {
  const { 
    data: products, 
    isLoading, 
    isError, 
    error,
    hasResults,
    noResults
  } = useProductSearchQuery({ term: searchTerm });
  
  if (isLoading) return <Skeleton />;
  
  // Manejo específico para errores
  if (isError) {
    return (
      <ErrorState 
        message="No pudimos cargar los productos" 
        error={error}
        actionLabel="Reintentar"
        onAction={() => refetch()}
      />
    );
  }
  
  // Caso sin resultados
  if (noResults) {
    return <EmptyState message="No se encontraron productos" />;
  }
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## Pruebas

Siempre prueba los siguientes escenarios:

1. Respuesta exitosa
2. Error de red (sin conexión)
3. Error del servidor (500)
4. Timeout
5. Errores de validación
6. Inconsistencias en los datos devueltos

## Referencias

- [React Query Error Handling](https://tanstack.com/query/latest/docs/react/guides/error-handling)
- [Axios Error Handling](https://axios-http.com/docs/handling_errors)
- [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)