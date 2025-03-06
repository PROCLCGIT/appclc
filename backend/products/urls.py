# products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'products'

# Crear router para la API
router = DefaultRouter()

# Registrar viewsets principales
router.register(r'productosofertados', views.ProductoOfertadoViewSet, basename='productoofertado')
router.register(r'productosdisponibles', views.ProductoDisponibleViewSet, basename='productodisponible')
router.register(r'historial-ventas', views.HistorialDeVentasViewSet, basename='historial-ventas')
router.register(r'historial-compras', views.HistorialDeComprasViewSet, basename='historial-compras')

# Endpoints de prueba para diagnóstico

# URLs adicionales para endpoints específicos
urlpatterns = [
    # Rutas del router
    path('', include(router.urls)),
    
    # Endpoints de prueba
    path('test-ventas/', views.test_ventas_create, name='test-ventas'),
    path('test-compras/', views.test_compras_create, name='test-compras'),

    # Endpoints para productos ofertados
    path('productos-ofertados/dashboard/',
         views.ProductoOfertadoViewSet.as_view({'get': 'dashboard'}),
         name='productos-ofertados-dashboard'),
         
    path('productos-ofertados/<int:pk>/stats/',
         views.ProductoOfertadoViewSet.as_view({'get': 'stats'}),
         name='productos-ofertados-stats'),
         
    path('productos-ofertados/<int:pk>/upload-images/',
         views.ProductoOfertadoViewSet.as_view({'post': 'upload_images'}),
         name='productos-ofertados-upload-images'),
         
    path('productos-ofertados/<int:pk>/delete-image/',
         views.ProductoOfertadoViewSet.as_view({'delete': 'delete_image'}),
         name='productos-ofertados-delete-image'),
         
    path('productos-ofertados/<int:pk>/upload-documents/',
         views.ProductoOfertadoViewSet.as_view({'post': 'upload_documents'}),
         name='productos-ofertados-upload-documents'),
         
    path('productos-ofertados/<int:pk>/delete-document/',
         views.ProductoOfertadoViewSet.as_view({'delete': 'delete_document'}),
         name='productos-ofertados-delete-document'),

    # Endpoints para productos disponibles
    path('productos-disponibles/dashboard/',
         views.ProductoDisponibleViewSet.as_view({'get': 'dashboard'}),
         name='productos-disponibles-dashboard'),
         
    path('productos-disponibles/<int:pk>/ratings/',
         views.ProductoDisponibleViewSet.as_view({'get': 'ratings', 'post': 'update_ratings'}),
         name='productos-disponibles-ratings'),
]