"""
Módulo de caché para proformas.

Este módulo proporciona funciones para gestionar el cacheo de operaciones
costosas relacionadas con las proformas, especialmente estadísticas de dashboard.
"""
from django.core.cache import cache
from django.conf import settings
import hashlib
import json
import logging

logger = logging.getLogger(__name__)

# Prefijo para las claves de caché relacionadas con proformas
CACHE_PREFIX = 'proformas:'

# Clave específica para el dashboard
DASHBOARD_CACHE_KEY = f'{CACHE_PREFIX}dashboard'

# TTL por defecto (en segundos) - 15 minutos por defecto
DEFAULT_CACHE_TTL = getattr(settings, 'CACHE_TTL', 60 * 15)

# TTL para dashboard (más corto que el TTL por defecto)
DASHBOARD_CACHE_TTL = getattr(settings, 'DASHBOARD_CACHE_TTL', 60 * 5)  # 5 minutos


def get_dashboard_cache_key(request_params):
    """
    Genera una clave de caché única para el dashboard basada en los parámetros de filtro.
    
    Args:
        request_params (dict): Parámetros de la solicitud (filtros)
        
    Returns:
        str: Clave de caché única
    """
    # Ordenar los parámetros para asegurar una clave consistente
    param_string = json.dumps(dict(sorted(request_params.items()))) if request_params else '{}'
    
    # Generar hash para evitar claves muy largas
    param_hash = hashlib.md5(param_string.encode()).hexdigest()
    
    return f'{DASHBOARD_CACHE_KEY}:{param_hash}'


def get_cached_dashboard(request_params):
    """
    Obtiene los datos del dashboard desde la caché si están disponibles.
    
    Args:
        request_params (dict): Parámetros de filtro del dashboard
        
    Returns:
        dict: Datos del dashboard o None si no está en caché
    """
    cache_key = get_dashboard_cache_key(request_params)
    cached_data = cache.get(cache_key)
    
    if cached_data:
        logger.debug(f"Recuperados datos de dashboard desde caché: {cache_key}")
        return cached_data
    
    logger.debug(f"Sin datos en caché para dashboard: {cache_key}")
    return None


def cache_dashboard_data(request_params, dashboard_data):
    """
    Guarda los datos del dashboard en la caché.
    
    Args:
        request_params (dict): Parámetros de filtro del dashboard
        dashboard_data (dict): Datos a cachear
        
    Returns:
        bool: True si se cacheó correctamente
    """
    try:
        cache_key = get_dashboard_cache_key(request_params)
        cache.set(cache_key, dashboard_data, timeout=DASHBOARD_CACHE_TTL)
        logger.debug(f"Datos de dashboard guardados en caché: {cache_key}")
        return True
    except Exception as e:
        logger.error(f"Error al cachear datos del dashboard: {str(e)}")
        return False


def invalidate_dashboard_cache():
    """
    Invalida todas las claves de caché relacionadas con el dashboard.
    Se debe llamar cuando hay cambios que afectan las estadísticas.
    
    Returns:
        bool: True si la operación fue exitosa
    """
    try:
        # Patrón para borrar todas las claves que empiezan con el prefijo dashboard
        pattern = f"{DASHBOARD_CACHE_KEY}:*"
        
        # Usando el backend de redis directamente para borrar por patrón
        # Solo funciona si se usa django-redis como backend
        if hasattr(cache, 'delete_pattern'):
            cache.delete_pattern(pattern)
            logger.info(f"Caché de dashboard invalidado por patrón: {pattern}")
        else:
            # Fallback - solo borrar la clave principal
            cache.delete(DASHBOARD_CACHE_KEY)
            logger.info(f"Caché de dashboard invalidado (clave principal): {DASHBOARD_CACHE_KEY}")
        
        return True
    except Exception as e:
        logger.error(f"Error al invalidar caché de dashboard: {str(e)}")
        return False


# Función adicional para manejar estadísticas específicas
def get_cached_stats(stat_name, params=None):
    """
    Obtiene estadísticas específicas desde caché.
    
    Args:
        stat_name (str): Nombre de la estadística
        params (dict): Parámetros de filtro
        
    Returns:
        dict: Datos de estadísticas o None si no está en caché
    """
    param_string = json.dumps(dict(sorted(params.items()))) if params else '{}'
    param_hash = hashlib.md5(param_string.encode()).hexdigest()
    
    cache_key = f'{CACHE_PREFIX}stats:{stat_name}:{param_hash}'
    return cache.get(cache_key)


def cache_stats_data(stat_name, params, data, ttl=DEFAULT_CACHE_TTL):
    """
    Guarda estadísticas específicas en caché.
    
    Args:
        stat_name (str): Nombre de la estadística
        params (dict): Parámetros de filtro
        data (dict): Datos a cachear
        ttl (int): Tiempo de vida en segundos (opcional)
        
    Returns:
        bool: True si se cacheó correctamente
    """
    try:
        param_string = json.dumps(dict(sorted(params.items()))) if params else '{}'
        param_hash = hashlib.md5(param_string.encode()).hexdigest()
        
        cache_key = f'{CACHE_PREFIX}stats:{stat_name}:{param_hash}'
        cache.set(cache_key, data, timeout=ttl)
        return True
    except Exception as e:
        logger.error(f"Error al cachear estadísticas {stat_name}: {str(e)}")
        return False