from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'proformas'

# Crear router para la API
router = DefaultRouter()

# Registrar viewsets
router.register(r'proformas', views.ProformaViewSet, basename='proformas')
router.register(r'items', views.ProformaItemViewSet, basename='items')
router.register(r'historial', views.ProformaHistorialViewSet, basename='historial')
router.register(r'configuracion', views.ConfiguracionProformaViewSet, basename='configuracion')

urlpatterns = [
    # Rutas del router principal
    path('', include(router.urls)),
    
    # Rutas adicionales
    path('buscar-productos/', views.ProformaViewSet.as_view({'get': 'buscar_productos'}), name='buscar-productos'),
    path('dashboard/', views.ProformaViewSet.as_view({'get': 'dashboard'}), name='dashboard'),
    path('configuracion-actual/', views.ProformaViewSet.as_view({'get': 'obtener_configuracion'}), name='configuracion-actual'),
    
    # Rutas de exportación
    path('proformas/<int:pk>/exportar_pdf/', views.ProformaViewSet.as_view({'get': 'exportar_pdf'}), name='exportar-pdf'),
]