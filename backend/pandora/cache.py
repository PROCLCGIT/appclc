"""
Módulo de utilidades de caché para toda la aplicación.
Proporciona funciones y decoradores para manejo de caché con Redis.
"""
from django.core.cache import cache
from django.conf import settings
from functools import wraps
import hashlib
import json

def generate_cache_key(prefix, *args, **kwargs):
    """
    Genera una clave de caché única basada en los argumentos.
    
    Args:
        prefix: Prefijo para identificar el tipo de dato en caché
        *args, **kwargs: Argumentos para generar la clave única
    
    Returns:
        String: Clave única para el caché
    """
    key_parts = [prefix]
    
    # Añadir args como strings
    for arg in args:
        if arg is not None:
            key_parts.append(str(arg))
    
    # Añadir kwargs ordenados
    sorted_kwargs = sorted(kwargs.items())
    for k, v in sorted_kwargs:
        if v is not None:
            key_parts.append(f"{k}={v}")
    
    # Crear un hash para claves largas
    if len(":".join(key_parts)) > 200:
        serialized = json.dumps(key_parts, sort_keys=True)
        hashed = hashlib.md5(serialized.encode()).hexdigest()
        return f"{prefix}:{hashed}"
    
    return ":".join(key_parts)

def cache_result(timeout=None, prefix=None, should_cache_fn=None):
    """
    Decorador para cachear el resultado de una función o método.
    
    Args:
        timeout: Tiempo de vida del caché en segundos (None usa el valor por defecto)
        prefix: Prefijo para la clave de caché (si no se especifica, usa el nombre de la función)
        should_cache_fn: Función opcional que determina si se debe cachear (recibe los mismos args y kwargs)
    
    Returns:
        El decorador para la función
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Determinar si debemos saltarnos el caché
            if should_cache_fn and not should_cache_fn(*args, **kwargs):
                return func(*args, **kwargs)
            
            # Preparar clave del caché
            cache_prefix = prefix if prefix else func.__name__
            key = generate_cache_key(cache_prefix, *args, **kwargs)
            
            # Intentar obtener del caché
            cached_result = cache.get(key)
            if cached_result is not None:
                return cached_result
            
            # Calcular resultado
            result = func(*args, **kwargs)
            
            # Cachear resultado si no es None
            if result is not None:
                actual_timeout = timeout if timeout is not None else getattr(
                    settings, 'CACHE_TTL', 60 * 15
                )
                cache.set(key, result, actual_timeout)
            
            return result
        return wrapper
    return decorator

def invalidate_cache(prefix, *args, **kwargs):
    """
    Invalida una clave específica del caché.
    
    Args:
        prefix: Prefijo de la clave
        *args, **kwargs: Argumentos para generar la clave
    """
    key = generate_cache_key(prefix, *args, **kwargs)
    cache.delete(key)

def invalidate_cache_pattern(pattern):
    """
    Invalida todas las claves que coincidan con un patrón.
    Requiere que CACHE BACKEND sea django_redis.
    
    Args:
        pattern: Patrón para las claves (ej: "productos:*")
    """
    from django_redis import get_redis_connection
    client = get_redis_connection("default")
    
    cursor = 0
    while True:
        cursor, keys = client.scan(cursor, match=pattern, count=100)
        if keys:
            client.delete(*keys)
        if cursor == 0:
            break
