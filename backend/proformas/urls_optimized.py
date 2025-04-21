"""
URLs optimizados para el módulo de proformas.

Este módulo define las rutas utilizando los viewsets optimizados para mejor rendimiento.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views
from .views_optimized import (
    OptimizedProformaViewSet, 
    OptimizedProformaItemViewSet,
    OptimizedProformaHistorialViewSet
)

app_name = 'proformas'

# Crear router para la API optimizada
router = DefaultRouter()

# Registrar viewsets optimizados
router.register(r'proformas', OptimizedProformaViewSet, basename='proformas')
router.register(r'items', OptimizedProformaItemViewSet, basename='items')
router.register(r'historial', OptimizedProformaHistorialViewSet, basename='historial')
router.register(r'configuracion', views.ConfiguracionProformaViewSet, basename='configuracion')

urlpatterns = [
    # Rutas del router optimizado
    path('', include(router.urls)),
    
    # Rutas adicionales
    path('buscar-productos/', views.ProformaViewSet.as_view({'get': 'buscar_productos'}), name='buscar-productos'),
    path('dashboard/', OptimizedProformaViewSet.as_view({'get': 'dashboard'}), name='dashboard'),
    path('configuracion-actual/', views.ProformaViewSet.as_view({'get': 'obtener_configuracion'}), name='configuracion-actual'),
    
    # Rutas de exportación
    path('proformas/<int:pk>/exportar_pdf/', views.ProformaViewSet.as_view({'get': 'exportar_pdf'}), name='exportar-pdf'),
]