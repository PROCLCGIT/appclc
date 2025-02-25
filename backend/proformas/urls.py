# proformas/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'proformas'

# Crear router para la API
router = DefaultRouter()

# Registrar viewsets principales
router.register(r'proformas', views.ProformaViewSet, basename='proforma')
router.register(r'items', views.ProformaItemViewSet, basename='proforma-item')
router.register(r'history', views.ProformaHistoryViewSet, basename='proforma-history')

# URLs para endpoints específicos
urlpatterns = [
    # Incluir rutas del router
    path('', include(router.urls)),

    # Endpoints de gestión de proformas
    path('proformas/<int:pk>/approve/',
         views.ProformaViewSet.as_view({'post': 'approve'}),
         name='proforma-approve'),
    path('proformas/<int:pk>/reject/',
         views.ProformaViewSet.as_view({'post': 'reject'}),
         name='proforma-reject'),
    path('proformas/<int:pk>/send/',
         views.ProformaViewSet.as_view({'post': 'send'}),
         name='proforma-send'),
    path('proformas/<int:pk>/expire/',
         views.ProformaViewSet.as_view({'post': 'expire'}),
         name='proforma-expire'),

    # Endpoints de consulta
    path('proformas/<int:pk>/items/',
         views.ProformaViewSet.as_view({'get': 'items'}),
         name='proforma-items'),
    path('proformas/<int:pk>/history/',
         views.ProformaViewSet.as_view({'get': 'history'}),
         name='proforma-history'),

    # Endpoints de reportes y estadísticas
    path('dashboard/',
         views.ProformaViewSet.as_view({'get': 'dashboard'}),
         name='proforma-dashboard'),
    path('reports/monthly/',
         views.ProformaViewSet.as_view({'get': 'monthly_report'}),
         name='proforma-monthly-report'),
    path('reports/by-client/',
         views.ProformaViewSet.as_view({'get': 'client_report'}),
         name='proforma-client-report'),

    # Endpoints de exportación
    path('proformas/<int:pk>/export/pdf/',
         views.ProformaViewSet.as_view({'get': 'export_pdf'}),
         name='proforma-export-pdf'),
    path('proformas/<int:pk>/export/excel/',
         views.ProformaViewSet.as_view({'get': 'export_excel'}),
         name='proforma-export-excel'),

    # Endpoints de búsqueda y filtrado
    path('search/',
         views.ProformaViewSet.as_view({'get': 'search'}),
         name='proforma-search'),
    path('filter/by-date/',
         views.ProformaViewSet.as_view({'get': 'filter_by_date'}),
         name='proforma-filter-date'),
    path('filter/by-status/',
         views.ProformaViewSet.as_view({'get': 'filter_by_status'}),
         name='proforma-filter-status'),

    # Endpoints para gestión de items
    path('items/bulk-create/',
         views.ProformaItemViewSet.as_view({'post': 'bulk_create'}),
         name='proforma-items-bulk-create'),
    path('items/bulk-update/',
         views.ProformaItemViewSet.as_view({'put': 'bulk_update'}),
         name='proforma-items-bulk-update'),

    # Endpoints para historial
    path('history/summary/',
         views.ProformaHistoryViewSet.as_view({'get': 'summary'}),
         name='proforma-history-summary'),
    path('history/by-user/',
         views.ProformaHistoryViewSet.as_view({'get': 'by_user'}),
         name='proforma-history-by-user'),
]
