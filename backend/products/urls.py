# products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'products'

# Crear router para la API
router = DefaultRouter()

# Registrar viewsets principales
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'productosofertados', views.ProductoOfertadoViewSet, basename='productoofertado')
router.register(r'productosdisponibles', views.ProductoDisponibleViewSet, basename='productodisponible')

# Registrar viewsets de precios y listas
router.register(r'price-lists', views.PriceListViewSet, basename='price-list')
router.register(r'product-prices', views.ProductPriceViewSet, basename='product-price')

# Registrar viewsets de movimientos y cambios
router.register(r'stock-movements', views.StockMovementViewSet, basename='stock-movement')
router.register(r'price-history', views.PriceHistoryViewSet, basename='price-history')
router.register(r'product-changes', views.ProductChangeViewSet, basename='product-change')

# Registrar viewsets adicionales
router.register(r'related-products', views.RelatedProductViewSet, basename='related-product')
router.register(r'product-documents', views.ProductDocumentViewSet, basename='product-document')

# URLs adicionales para endpoints específicos
urlpatterns = [
    # Rutas del router
    path('', include(router.urls)),

    # Endpoints para productos
    path('products/<int:pk>/stock-update/',
         views.ProductViewSet.as_view({'post': 'update_stock'}),
         name='product-stock-update'),
         
    path('products/<int:pk>/price-update/',
         views.ProductViewSet.as_view({'post': 'update_price'}),
         name='product-price-update'),

    # Endpoints para productos ofertados
    path('productos-ofertados/dashboard/',
         views.ProductoOfertadoViewSet.as_view({'get': 'dashboard'}),
         name='productos-ofertados-dashboard'),
         
    path('productos-ofertados/<int:pk>/stats/',
         views.ProductoOfertadoViewSet.as_view({'get': 'stats'}),
         name='productos-ofertados-stats'),

    # Endpoints para productos disponibles
    path('productos-disponibles/dashboard/',
         views.ProductoDisponibleViewSet.as_view({'get': 'dashboard'}),
         name='productos-disponibles-dashboard'),
         
    path('productos-disponibles/<int:pk>/ratings/',
         views.ProductoDisponibleViewSet.as_view({'get': 'ratings', 'post': 'update_ratings'}),
         name='productos-disponibles-ratings'),

    # Endpoints para precios
    path('price-lists/<int:pk>/apply-changes/',
         views.PriceListViewSet.as_view({'post': 'apply_changes'}),
         name='price-list-apply-changes'),
         
    path('price-history/summary/',
         views.PriceHistoryViewSet.as_view({'get': 'summary'}),
         name='price-history-summary'),

    # Endpoints para inventario
    path('stock-movements/report/',
         views.StockMovementViewSet.as_view({'get': 'report'}),
         name='stock-movement-report'),
         
    path('stock-movements/summary/',
         views.StockMovementViewSet.as_view({'get': 'summary'}),
         name='stock-movement-summary'),

    # Endpoints para documentos
    path('product-documents/bulk-upload/',
         views.ProductDocumentViewSet.as_view({'post': 'bulk_upload'}),
         name='product-document-bulk-upload'),
         
    path('product-documents/download/<int:pk>/',
         views.ProductDocumentViewSet.as_view({'get': 'download'}),
         name='product-document-download'),
]