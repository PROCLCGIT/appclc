"""
URLs para el módulo de proformas.

Este módulo define todas las rutas para el módulo de proformas,
combinando funcionalidades optimizadas y estándar.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
import os

from . import views
from .views import (
    OptimizedProformaViewSet, 
    OptimizedProformaItemViewSet,
    OptimizedProformaHistorialViewSet
)

app_name = 'proformas'

# Determinar si usar las vistas optimizadas según variable de entorno
USE_OPTIMIZED = os.environ.get('USE_OPTIMIZED_PROFORMAS', 'True').lower() in ('true', 't', '1', 'yes')

# Crear router para la API
router = DefaultRouter()

# Registrar viewsets según configuración
if USE_OPTIMIZED:
    # Registrar viewsets optimizados
    router.register(r'proformas', OptimizedProformaViewSet, basename='proformas')
    router.register(r'items', OptimizedProformaItemViewSet, basename='items')
    router.register(r'historial', OptimizedProformaHistorialViewSet, basename='historial')
else:
    # Registrar viewsets estándar
    router.register(r'proformas', views.ProformaViewSet, basename='proformas')
    router.register(r'items', views.ProformaItemViewSet, basename='items')
    router.register(r'historial', views.ProformaHistorialViewSet, basename='historial')

# Registrar configuración (siempre usa el mismo viewset)
router.register(r'configuracion', views.ConfiguracionProformaViewSet, basename='configuracion')

urlpatterns = [
    # Rutas del router principal
    path('', include(router.urls)),
    
    # Rutas adicionales - usar la implementación según configuración
    path('buscar-productos/', views.ProformaViewSet.as_view({'get': 'buscar_productos'}), name='buscar-productos'),
    
    # Dashboard: usar optimizada o estándar según configuración
    path('dashboard/', 
         OptimizedProformaViewSet.as_view({'get': 'dashboard'}) if USE_OPTIMIZED else views.ProformaViewSet.as_view({'get': 'dashboard'}), 
         name='dashboard'),
    
    path('configuracion-actual/', views.ProformaViewSet.as_view({'get': 'obtener_configuracion'}), name='configuracion-actual'),
    
    # Rutas de exportación
    path('proformas/<int:pk>/exportar_pdf/', views.ProformaViewSet.as_view({'get': 'exportar_pdf'}), name='exportar-pdf'),
    
    # Ruta para el dashboard estadístico
    path('stats-dashboard/', views.stats_dashboard, name='stats-dashboard'),
]

# Función auxiliar para acceder a las URLs desde el exterior
def get_proformas_urlpatterns():
    """
    Devuelve las URLs de proformas para incluirlas en otros módulos.
    
    Returns:
        Un objeto urlpatterns que incluye las URLs de proformas.
    """
    return urlpatterns

# Función auxiliar para incluir las URLs con namespace
def include_proformas_urls():
    """
    Incluye las URLs de proformas con el namespace adecuado.
    
    Returns:
        Un tuple (urlpatterns, app_namespace) para incluir en urlpatterns principales.
    """
    return (urlpatterns, app_name)