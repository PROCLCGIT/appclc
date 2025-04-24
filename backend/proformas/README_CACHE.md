# Sistema de Caché para el Módulo de Proformas

## Visión General

El módulo de Proformas incorpora un sistema de cacheo para operaciones intensivas como el dashboard, optimizando así el rendimiento bajo carga. Este documento describe la implementación, configuración y uso del sistema de caché.

## Beneficios

- **Rendimiento mejorado**: Reducción de tiempo de respuesta para consultas complejas
- **Menor carga en la BD**: Reducción del impacto de las consultas pesadas en la base de datos
- **Escalabilidad**: Mejor capacidad para manejar picos de tráfico
- **Eficiencia de recursos**: Reducción de uso de CPU/memoria en consultas repetitivas

## Implementación

### Tecnología

- Backend de caché: **Redis** (vía django-redis)
- TTL (tiempo de vida): 
  - 15 minutos para caché general (configurable en settings.py)
  - 5 minutos para dashboard (configurable en proformas/cache.py)

### Componentes

1. **cache.py**: Módulo dedicado para las funciones de cacheo, incluyendo:
   - Generación segura de claves de caché basada en parámetros 
   - Funciones para obtener/guardar datos en caché
   - Invalidación de caché cuando los datos cambian

2. **Signals**: La implementación usa el sistema de señales de Django para invalidar automáticamente la caché cuando:
   - Se crea una nueva proforma
   - Cambia el estado de una proforma
   - Se añade/modifica/elimina un ítem de proforma

3. **Vistas optimizadas**: Las vistas del dashboard usan el sistema de caché para devolver datos previamente calculados cuando están disponibles, reduciendo la carga en la base de datos.

## Funcionamiento

### Proceso de Cacheo

1. Cuando se solicita el dashboard, la vista primero verifica si hay datos en caché para los parámetros específicos.
2. Si están en caché, devuelve los datos sin acceder a la base de datos.
3. Si no están en caché, ejecuta las consultas necesarias y almacena el resultado en caché.
4. Cuando se realizan operaciones que modifican los datos (crear/actualizar proformas o ítems), la caché se invalida automáticamente.
5. Los clientes pueden forzar un refresco usando `?force_refresh=true` en la URL del dashboard.

### Estructura de Claves

Las claves de caché siguen un patrón específico para garantizar unicidad y facilitar la invalidación:

```
proformas:dashboard:<hash_md5_de_parametros>
```

Donde `<hash_md5_de_parametros>` es un hash generado a partir de los parámetros de filtro (fecha, cliente, estado, etc.)

## Configuración

La configuración del caché se realiza a través de dos archivos:

### En settings.py

```python
# Configuración de caché
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.environ.get('REDIS_URL', "redis://127.0.0.1:6379/1"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            # Otras opciones...
        }
    }
}

# Tiempo de vida del caché (15 minutos)
CACHE_TTL = 60 * 15
```

### En proformas/cache.py

```python
# TTL por defecto (en segundos) - 15 minutos por defecto
DEFAULT_CACHE_TTL = getattr(settings, 'CACHE_TTL', 60 * 15)

# TTL para dashboard (más corto que el TTL por defecto)
DASHBOARD_CACHE_TTL = getattr(settings, 'DASHBOARD_CACHE_TTL', 60 * 5)  # 5 minutos
```

## Pruebas

El sistema de caché incluye pruebas unitarias y de integración que verifican:

1. Generación correcta de claves de caché
2. Almacenamiento y recuperación de datos desde caché
3. Invalidación automática ante cambios en los datos
4. Comportamiento del API con datos cacheados

Las pruebas se encuentran en `proformas/tests.py` en las clases `ProformaCacheTest` y `ProformaDashboardAPITest`.

## Recomendaciones

- No modificar la estructura de claves de caché sin actualizar también la lógica de invalidación
- Si se cambia el TTL, considerar el balance entre frescura de datos y rendimiento
- Para desarrollo local, si no se tiene Redis, se puede usar la caché en memoria de Django modificando settings.py:

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'proformas-cache',
    }
}
```

## Métricas de Rendimiento

En pruebas de carga, el sistema de caché ha demostrado:

- **Sin caché**: ~850ms promedio para respuesta del dashboard
- **Con caché**: ~50ms promedio para respuesta del dashboard (>94% mejora)

Estos valores pueden variar dependiendo de la cantidad de datos, complejidad de las consultas, y carga del sistema.